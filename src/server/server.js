import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import ip from 'ip';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'db.json');
const inspectiondb = join(__dirname, 'inspection.json');
const practiceMatchesPath = join(__dirname, 'practice_matches.json'); 

// Define scoring calculation function
function calculateDetailedScore(detailedScore, autoDuplicate) {
  let total = 0;
  
  // Auto parking points
  if (detailedScore.autoParkA) total += 3;
  if (detailedScore.autoParkB) total += 3;
  if (detailedScore.autoParkC) total += 3;
  
  // Determine auto multiplier
  const autoMultiplier = 2;
  
  // Auto debris and specimens
  total += detailedScore.autoDebris * 4 * autoMultiplier;
  total += detailedScore.teleDebris * 4;
  total += detailedScore.autoSpecimenNearLow * 6 * autoMultiplier;
  total += detailedScore.autoSpecimenNearHigh * 10 * autoMultiplier;
  total += detailedScore.autoSpecimenFarLow * 12 * autoMultiplier;
  total += detailedScore.autoSpecimenFarHigh * 20 * autoMultiplier;
  
  // Teleop specimens
  total += detailedScore.teleSpecimenNearLow * 6;
  total += detailedScore.teleSpecimenNearHigh * 10;
  total += detailedScore.teleSpecimenFarLow * 12;
  total += detailedScore.teleSpecimenFarHigh * 20;
  
  // Endgame banners
  total += (detailedScore.endgameBannerA + detailedScore.endgameBannerB + detailedScore.endgameBannerC) * 8;
  
  // Teleop parking
  [detailedScore.teleopParkA, detailedScore.teleopParkB, detailedScore.teleopParkC].forEach(level => {
    if (level === 1) total += 3;
    else if (level === 2) total += 15;
    else if (level === 3) total += 30;
  });
  
  // Foul points
  total += detailedScore.minorFoul * 5;
  total += detailedScore.majorFoul * 15;
  
  return total;
}

// Define RP calculation function
function calculateRP(teamDetailedScore, teamScore, opponentScore) {
  let rp = 0;
  
  // Condition 1: autoRP
  if (teamDetailedScore.autoRP) {
    rp += 1;
  }
  
  // Condition 2: All specimen chambers have at least one
  if (
    (teamDetailedScore.autoSpecimenNearLow + teamDetailedScore.teleSpecimenNearLow) > 0 &&
    (teamDetailedScore.autoSpecimenNearHigh + teamDetailedScore.teleSpecimenNearHigh) > 0 &&
    (teamDetailedScore.autoSpecimenFarLow + teamDetailedScore.teleSpecimenFarLow) > 0 &&
    (teamDetailedScore.autoSpecimenFarHigh + teamDetailedScore.teleSpecimenFarHigh) > 0
  ) {
    rp += 1;
  }
  
  // Condition 3: All endgame banners have at least one
  if (
    teamDetailedScore.endgameBannerA > 0 &&
    teamDetailedScore.endgameBannerB > 0 &&
    teamDetailedScore.endgameBannerC > 0
  ) {
    rp += 1;
  }
  
  // Condition 4 & 5: Score comparison
  if (teamScore > opponentScore) {
    rp += 3;
  } else if (teamScore === opponentScore) {
    rp += 1.5;
  }
  
  return rp;
}

// Add helper function to update RPs for both alliances
function updateRPs(redTeam, blueTeam) {
  redTeam.rp = calculateRP(redTeam.detailedScore, redTeam.score, blueTeam.score);
  blueTeam.rp = calculateRP(blueTeam.detailedScore, blueTeam.score, redTeam.score);
}

// Recalculate team rankings based on historical matches
function recalculateRanking() {
  const matches = db.data?.matches || [];
  const teamStats = new Map();

  const getAutoPoints = (ds) => {
    if (!ds) return 0;
    let total = 0;
    const autoMultiplier = 2;
    total += (ds.autoParkA ? 3 : 0) + (ds.autoParkB ? 3 : 0) + (ds.autoParkC ? 3 : 0);
    total += (ds.autoDebris || 0) * 4 * autoMultiplier;
    total += (ds.autoSpecimenNearLow || 0) * 6 * autoMultiplier;
    total += (ds.autoSpecimenNearHigh || 0) * 10 * autoMultiplier;
    total += (ds.autoSpecimenFarLow || 0) * 12 * autoMultiplier;
    total += (ds.autoSpecimenFarHigh || 0) * 20 * autoMultiplier;
    return total;
  };

  const getParkingSum = (ds) => {
    if (!ds) return 0;
    return (ds.teleopParkA || 0) + (ds.teleopParkB || 0) + (ds.teleopParkC || 0);
  };

  for (const m of matches) {
    const sides = [
      { team: m.redTeam, color: 'red' },
      { team: m.blueTeam, color: 'blue' },
    ];

    for (const side of sides) {
      const t = side.team;
      if (!t || !Array.isArray(t.teams)) continue; // Skip if no team list

      // Get RP from record or compute if possible
      const rp = typeof t.rp === 'number' ? t.rp : (() => {
        if (t.detailedScore && typeof t.score === 'number') {
          const other = side.color === 'red' ? m.blueTeam : m.redTeam;
          const teamScore = t.score;
          const opponentScore = other && typeof other.score === 'number' ? other.score : 0;
          try {
            return calculateRP(t.detailedScore, teamScore, opponentScore);
          } catch {
            return 0;
          }
        }
        return 0;
      })();

      const autoPts = getAutoPoints(t.detailedScore);
      const parkSum = getParkingSum(t.detailedScore);

      for (const teamId of t.teams) {
        if (teamId == null || teamId <= 0) continue;
        const key = String(teamId);
        if (!teamStats.has(key)) {
          teamStats.set(key, { teamId, sumRP: 0, sumAuto: 0, sumParking: 0, count: 0 });
        }
        const s = teamStats.get(key);
        s.sumRP += rp;
        s.sumAuto += autoPts;
        s.sumParking += parkSum;
        s.count += 1;
      }
    }
  }

  const ranking = Array.from(teamStats.values()).map(s => ({
    teamId: s.teamId,
    avgRP: s.count ? s.sumRP / s.count : 0,
    avgAuto: s.count ? s.sumAuto / s.count : 0,
    avgParking: s.count ? s.sumParking / s.count : 0,
    matches: s.count,
  })).sort((a, b) => {
    if (b.avgRP !== a.avgRP) return b.avgRP - a.avgRP;
    if (b.avgAuto !== a.avgAuto) return b.avgAuto - a.avgAuto;
    if (b.avgParking !== a.avgParking) return b.avgParking - a.avgParking;
    return (a.teamId || 0) - (b.teamId || 0);
  });

  db.data.ranking = ranking;
}

const app = express(); 

const swaggerDocument = YAML.load(join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Database setup
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { 
  users: [],
  matches: [],
  currentMatch: {
    type: "T", //T: practice (Test) match, Q: Qualification match, P: Playoff match
    number: 1,
    inProgress: false,
    timeRemaining: 158,
    autoDuplicate: false,
    redTeam: { name: "Red Alliance", score: 0,  teams: [0, 0, 0], rp: 0,
      detailedScore: {
        autoParkA: false, autoParkB: false, autoParkC: false, 
        autoDebris: 0, 
        autoSpecimenNearLow: 0, autoSpecimenNearHigh: 0, autoSpecimenFarLow: 0, autoSpecimenFarHigh: 0, 
        teleDebris: 0, 
        teleSpecimenNearLow: 0, teleSpecimenNearHigh: 0, teleSpecimenFarLow: 0, teleSpecimenFarHigh: 0, 
        endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0, 
        teleopParkA: 0, teleopParkB: 0, teleopParkC: 0,
        minorFoul: 0, majorFoul: 0,
        autoRP: false
      }
     },
    blueTeam: { name: "Blue Alliance", score: 0,  teams: [0, 0, 0], rp: 0,
      detailedScore: {
        autoParkA: false, autoParkB: false, autoParkC: false, 
        autoDebris: 0, 
        autoSpecimenNearLow: 0, autoSpecimenNearHigh: 0, autoSpecimenFarLow: 0, autoSpecimenFarHigh: 0, 
        teleDebris: 0, 
        teleSpecimenNearLow: 0, teleSpecimenNearHigh: 0, teleSpecimenFarLow: 0, teleSpecimenFarHigh: 0, 
        endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0, 
        teleopParkA: 0, teleopParkB: 0, teleopParkC: 0,
        minorFoul: 0, majorFoul: 0,
        autoRP: false
      }
     },
    showScores: true,
    showWinner: false
  }
});

let practiceMatches = [];
let currentPracticeMatchIndex = 0;

// Initialize database
await db.read();
if (!db.data) {
  db.data = { 
    users: [],
    matches: [],
    ranking: [],
    currentMatch: {
      type: "T",
      number: 1,
      inProgress: false,
      timeRemaining: 158,
      autoDuplicate: false,
      redTeam: { 
        name: "Red Alliance", 
        score: 0,  
        teams: [0, 0, 0],
        rp: 0,
        detailedScore: {
          autoParkA: false, autoParkB: false, autoParkC: false,
          autoDebris: 0,
          autoSpecimenNearLow: 0, autoSpecimenNearHigh: 0,
          autoSpecimenFarLow: 0, autoSpecimenFarHigh: 0,
          teleDebris: 0,
          teleSpecimenNearLow: 0, teleSpecimenNearHigh: 0,
          teleSpecimenFarLow: 0, teleSpecimenFarHigh: 0,
          endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0,
          teleopParkA: 0, teleopParkB: 0, teleopParkC: 0,
          minorFoul: 0, majorFoul: 0,
          autoRP: false
        }
      },
      blueTeam: { 
        name: "Blue Alliance", 
        score: 0,  
        teams: [0, 0, 0],
        rp: 0,
        detailedScore: {
          autoParkA: false, autoParkB: false, autoParkC: false,
          autoDebris: 0,
          autoSpecimenNearLow: 0, autoSpecimenNearHigh: 0,
          autoSpecimenFarLow: 0, autoSpecimenFarHigh: 0,
          teleDebris: 0,
          teleSpecimenNearLow: 0, teleSpecimenNearHigh: 0,
          teleSpecimenFarLow: 0, teleSpecimenFarHigh: 0,
          endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0,
          teleopParkA: 0, teleopParkB: 0, teleopParkC: 0,
          minorFoul: 0, majorFoul: 0,
          autoRP: false
        }
      },
      showScores: true,
      showWinner: false
    }
  };
}

// Recalculate scores and RPs on server start
db.data.currentMatch.redTeam.score = calculateDetailedScore(
  db.data.currentMatch.redTeam.detailedScore,
  db.data.currentMatch.autoDuplicate
);
db.data.currentMatch.blueTeam.score = calculateDetailedScore(
  db.data.currentMatch.blueTeam.detailedScore,
  db.data.currentMatch.autoDuplicate
);
updateRPs(db.data.currentMatch.redTeam, db.data.currentMatch.blueTeam);
recalculateRanking();
await db.write();

// Express app setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

app.use(express.json());

const inspectionAdapter = new JSONFile(inspectiondb);
const inspectionDB = new Low(inspectionAdapter, { inspections: [] });

// Inicializar inspection DB
await inspectionDB.read();
if (!inspectionDB.data) {
  inspectionDB.data = { inspections: [] };
  await inspectionDB.write();
}

// Endpoint para guardar inspecciones en inspection.json
app.post('/api/inspections', async (req, res) => {
  try {
    // Intentar parsear manualmente si el body está vacío
    let report = req.body;
    
    if (!report || Object.keys(report).length === 0) {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          report = JSON.parse(body);
          processInspection(report, res);
        } catch (err) {
          res.status(400).json({ ok: false, error: 'Invalid JSON' });
        }
      });
      return;
    }
    
    if (!report || typeof report !== 'object') {
      return res.status(400).json({ ok: false, error: 'Invalid payload' });
    }
    
    processInspection(report, res);
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Función para procesar la inspección
async function processInspection(report, res) {
  try {
    const teamName = report.teamName;
    const inspector = report.inspector;
    const sections = report.sections || [];
    const overallStatus = report.overallStatus || 'pending';

    // Validar que se haya proporcionado un equipo válido
    if (!teamName || teamName === '' || teamName === 'No especificado') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Se requiere un equipo válido para la inspección' 
      });
    }

    // Validar que se haya proporcionado un inspector válido
    if (!inspector || inspector === '' || inspector === 'No especificado') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Se requiere un inspector válido para la inspección' 
      });
    }

    await inspectionDB.read();
    if (!inspectionDB.data) inspectionDB.data = { inspections: [] };

    // Buscar si ya existe una inspección para este equipo
    
    const existingIndex = inspectionDB.data.inspections.findIndex(
      inspection => inspection.teamName === teamName
    );

    const inspectionData = {
      teamName,
      inspector,
      sections,
      overallStatus,
      // Agregar metadatos de actualización
      updatedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      
      inspectionDB.data.inspections[existingIndex] = {
        ...inspectionData,
        // Mantener el ID y fecha de creación original
        id: inspectionDB.data.inspections[existingIndex].id,
        createdAt: inspectionDB.data.inspections[existingIndex].createdAt
      };
      
      
      await inspectionDB.write();
      return res.json({ 
        ok: true, 
        inspection: inspectionDB.data.inspections[existingIndex],
        message: 'Inspección actualizada exitosamente'
      });
    } else {
      // Crear nueva inspección
      
      const newInspection = {
        ...inspectionData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      inspectionDB.data.inspections.push(newInspection);
      await inspectionDB.write();
      
      return res.json({ 
        ok: true, 
        inspection: newInspection,
        message: 'Nueva inspección creada exitosamente'
      });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

// Obtener lista de inspecciones
app.get("/api/inspections", async (req, res) => {
  await inspectionDB.read();
  res.json(inspectionDB.data);
});

// Obtener lista de usuarios
app.get("/api/users", async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

app.get('/api/', async (req, res) => {
  await db.read();
  res.json(db.data);
});

// Match state API
app.get('/api/match', async (req, res) => {
  await db.read();
  res.json(db.data.currentMatch);
});

app.get('/api/matches', async (req, res) => {
  await db.read();
  res.json(db.data.matches);
});

// Update a match in history
app.put('/api/matches/:id', async (req, res) => {
  try {
    await db.read();
    const matchId = parseInt(req.params.id);
    const matchIndex = db.data.matches.findIndex(m => m.id === matchId);
    
    if (matchIndex === -1) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Update the match with new data
    db.data.matches[matchIndex] = {
      ...db.data.matches[matchIndex],
      ...req.body,
      id: matchId, // Preserve the original ID
      date: db.data.matches[matchIndex].date // Preserve the original date
    };
    
    await db.write();
    res.json(db.data.matches[matchIndex]);
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// Load a match from history as the current match
app.post('/api/matches/:id/load', async (req, res) => {
  try {
    await db.read();
    const matchId = parseInt(req.params.id);
    const match = db.data.matches.find(m => m.id === matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Load the match as the current match
    db.data.currentMatch = {
      ...db.data.currentMatch,
      redTeam: { ...match.redTeam },
      blueTeam: { ...match.blueTeam },
      timeRemaining: match.timeRemaining || 157,
      inProgress: false,
      showScores: true,
      showWinner: false
    };
    
    await db.write();
    
    // Emit update to all connected clients
    io.emit('matchUpdate', db.data.currentMatch);
    
    res.json({ success: true, match: db.data.currentMatch });
  } catch (error) {
    console.error('Error loading match:', error);
    res.status(500).json({ error: 'Failed to load match' });
  }
});

// WebSocket handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current match state on connection
  socket.emit('matchUpdate', db.data.currentMatch);
  
  socket.on('updateScore', async (data) => {
    const { team, points, action } = data;
    
    await db.read();
    
    if (action === 'add') {
      db.data.currentMatch[team].score += points;
    } else if (action === 'subtract') {
      db.data.currentMatch[team].score = Math.max(0, db.data.currentMatch[team].score - points);
    } else if (action === 'set') {
      db.data.currentMatch[team].score = points;
    }
    
    // Update RPs after score change
    updateRPs(db.data.currentMatch.redTeam, db.data.currentMatch.blueTeam);
    
    await db.write();
    
    io.emit('matchUpdate', db.data.currentMatch);
  });
  
  socket.on('updateTeam', async (data) => {
    const { team, name, detailedScore } = data;
    
    await db.read();
    if (name !== undefined) {
      db.data.currentMatch[team].name = name;
    }
    if (detailedScore !== undefined) {
      db.data.currentMatch[team].detailedScore = detailedScore;
      // Calculate new score
      db.data.currentMatch[team].score = calculateDetailedScore(
        detailedScore, 
        db.data.currentMatch.autoDuplicate
      );
    }
    
    // Update RPs after detailed score change
    updateRPs(db.data.currentMatch.redTeam, db.data.currentMatch.blueTeam);
    
    await db.write();
    
    io.emit('matchUpdate', db.data.currentMatch);
  });

  // Update team/alliance cards
  socket.on('updateCards', async (data) => {
    // data: { scope: 'team'|'alliance', side: 'redTeam'|'blueTeam', teamId?: number, color?: 'yellow'|'red'|null }
    const { scope, side, teamId, color } = data || {};
    await db.read();

    // Ensure cards container exists
    if (!db.data.currentMatch[side].cards) {
      db.data.currentMatch[side].cards = { team: {}, alliance: { yellow: false, red: false } };
    }

    if (scope === 'team' && typeof teamId === 'number') {
      if (color === 'yellow' || color === 'red') {
        db.data.currentMatch[side].cards.team[teamId] = color;
      } else {
        delete db.data.currentMatch[side].cards.team[teamId];
      }
    } else if (scope === 'alliance') {
      db.data.currentMatch[side].cards.alliance.yellow = color === 'yellow' ? !db.data.currentMatch[side].cards.alliance.yellow : db.data.currentMatch[side].cards.alliance.yellow;
      db.data.currentMatch[side].cards.alliance.red = color === 'red' ? !db.data.currentMatch[side].cards.alliance.red : db.data.currentMatch[side].cards.alliance.red;
    }

    await db.write();
    io.emit('matchUpdate', db.data.currentMatch);
  });
  
  socket.on('updateTimer', async (data) => {
    const { timeRemaining, inProgress } = data;
    
    await db.read();
    db.data.currentMatch.timeRemaining = timeRemaining;
    db.data.currentMatch.inProgress = inProgress;
    const wasAutoDuplicate = db.data.currentMatch.autoDuplicate;
    db.data.currentMatch.autoDuplicate = timeRemaining <= 120;
    
    // Recalculate scores and RPs if autoDuplicate changed
    if (wasAutoDuplicate !== db.data.currentMatch.autoDuplicate) {
      db.data.currentMatch.redTeam.score = calculateDetailedScore(
        db.data.currentMatch.redTeam.detailedScore,
        db.data.currentMatch.autoDuplicate
      );
      db.data.currentMatch.blueTeam.score = calculateDetailedScore(
        db.data.currentMatch.blueTeam.detailedScore,
        db.data.currentMatch.autoDuplicate
      );
      updateRPs(db.data.currentMatch.redTeam, db.data.currentMatch.blueTeam);
    }

    if (timeRemaining <= 0) {
      db.data.currentMatch.showScores = false;
    }

    await db.write();
    
    io.emit('matchUpdate', db.data.currentMatch);
  });

  socket.on('updateVisibility', async (data) => {
    await db.read();
    if (data.hasOwnProperty('showScores')) {
      db.data.currentMatch.showScores = data.showScores;
    }
    if (data.hasOwnProperty('showWinner')) {
      db.data.currentMatch.showWinner = data.showWinner;
    }
    await db.write();
    
    io.emit('matchUpdate', db.data.currentMatch);
  });

  // Relay presentation screen show event to all clients
  socket.on('presentationShow', async (data) => {
    // data can include the match snapshot or any metadata needed by clients
    io.emit('presentationShow', data);
  });

  socket.on('toggleAutoDuplicate', async () => {
    await db.read();
    db.data.currentMatch.autoDuplicate = !db.data.currentMatch.autoDuplicate;
    
    // Recalculate scores
    db.data.currentMatch.redTeam.score = calculateDetailedScore(
      db.data.currentMatch.redTeam.detailedScore,
      db.data.currentMatch.autoDuplicate
    );
    db.data.currentMatch.blueTeam.score = calculateDetailedScore(
      db.data.currentMatch.blueTeam.detailedScore,
      db.data.currentMatch.autoDuplicate
    );
    
    // Update RPs after autoDuplicate change
    updateRPs(db.data.currentMatch.redTeam, db.data.currentMatch.blueTeam);
    
    await db.write();
    io.emit('matchUpdate', db.data.currentMatch);
  });
  
  const getInitialDetailedScore = () => ({
    autoParkA: false, autoParkB: false, autoParkC: false,
    autoDebris: 0,
    autoSpecimenNearLow: 0, autoSpecimenNearHigh: 0,
    autoSpecimenFarLow: 0, autoSpecimenFarHigh: 0,
    teleDebris: 0,
    teleSpecimenNearLow: 0, teleSpecimenNearHigh: 0,
    teleSpecimenFarLow: 0, teleSpecimenFarHigh: 0,
    endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0,
    teleopParkA: 0, teleopParkB: 0, teleopParkC: 0,
    minorFoul: 0, majorFoul: 0,
    autoRP: false
  });

  socket.on('resetMatch', async () => {
    await db.read();
    
    // Reset both teams with fresh detailed scores
    db.data.currentMatch = {
      ...db.data.currentMatch,
      inProgress: false,
      timeRemaining: 158,
      showScores: true,
      showWinner: false,
      autoDuplicate: false,
      redTeam: {
        ...db.data.currentMatch.redTeam,
        detailedScore: getInitialDetailedScore()
      },
      blueTeam: {
        ...db.data.currentMatch.blueTeam,
        detailedScore: getInitialDetailedScore()
      }
    };
    // Reset cards
    db.data.currentMatch.redTeam.cards = { team: {}, alliance: { yellow: false, red: false } };
    db.data.currentMatch.blueTeam.cards = { team: {}, alliance: { yellow: false, red: false } };
    
    // Calculate initial scores
    db.data.currentMatch.redTeam.score = calculateDetailedScore(
      db.data.currentMatch.redTeam.detailedScore,
      db.data.currentMatch.autoDuplicate
    );
    db.data.currentMatch.blueTeam.score = calculateDetailedScore(
      db.data.currentMatch.blueTeam.detailedScore,
      db.data.currentMatch.autoDuplicate
    );
    
    // Update RPs after reset
    updateRPs(db.data.currentMatch.redTeam, db.data.currentMatch.blueTeam);
    
    await db.write();
    
    io.emit('matchUpdate', db.data.currentMatch);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('loadNextMatch', async () => {
    await db.read();

    // Save current match to history if it has scores
    const matchRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      redTeam: { ...db.data.currentMatch.redTeam },
      blueTeam: { ...db.data.currentMatch.blueTeam },
      timeRemaining: db.data.currentMatch.timeRemaining,
    };
    db.data.matches.push(matchRecord);

    // Load next match, cycling through t.json, q.json, p.json as needed
    const fs = await import('fs/promises');
    const path = await import('path');

    // Helper to load matches from a file
    async function loadMatches(file, type) {
      let matchesList = [];
      try {
        const fileData = await fs.readFile(file, 'utf-8');
        matchesList = JSON.parse(fileData);
      } catch (err) {
        // If file doesn't exist, return empty
        return { matchesList: [], type };
      }
      return { matchesList, type };
    }

    // Determine current type and next type
    let matchType = db.data.currentMatch.type || "T";
    let matchNumber = db.data.currentMatch.number + 1;
    let matchFiles = [
      { file: path.join(__dirname, '..', '..', 'public', 'matches', 't.json'), type: "T" },
      { file: path.join(__dirname, '..', '..', 'public', 'matches', 'q.json'), type: "Q" },
      { file: path.join(__dirname, '..', '..', 'public', 'matches', 'p.json'), type: "P" }
    ];

    // Find the index of the current type
    let typeIndex = matchFiles.findIndex(m => m.type === matchType);
    let found = false;
    let nextMatch = null;
    let nextType = matchType;
    let nextFile = matchFiles[typeIndex].file;
    let matchesList = [];

    // Try to find next match, cycling through types as needed
    for (let i = 0; i < matchFiles.length + 1; i++) {
      let { matchesList: list, type } = await loadMatches(nextFile, nextType);
      matchesList = list;
      nextMatch = matchesList.find(m => m.matchNumber === matchNumber);
      if (nextMatch) {
        found = true;
        break;
      } else {
        // If not found, reset to match 1 and move to next type
        matchNumber = 1;
        typeIndex = (typeIndex + 1) % matchFiles.length;
        nextType = matchFiles[typeIndex].type;
        nextFile = matchFiles[typeIndex].file;
      }
    }

    if (found && nextMatch) {
      db.data.currentMatch = {
        type: nextType,
        number: nextMatch.matchNumber,
        inProgress: false,
        timeRemaining: 158,
        autoDuplicate: false,
        redTeam: { 
          name: "Red Alliance", 
          score: 0, 
          teams: nextMatch.redAlliance, 
          rp: 0,
          detailedScore: {
            autoParkA: false, autoParkB: false, autoParkC: false,
            autoDebris: 0,
            autoSpecimenNearLow: 0, autoSpecimenNearHigh: 0,
            autoSpecimenFarLow: 0, autoSpecimenFarHigh: 0,
            teleDebris: 0,
            teleSpecimenNearLow: 0, teleSpecimenNearHigh: 0,
            teleSpecimenFarLow: 0, teleSpecimenFarHigh: 0,
            endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0,
            teleopParkA: 0, teleopParkB: 0, teleopParkC: 0,
            minorFoul: 0, majorFoul: 0,
            autoRP: false
        }},
        blueTeam: { 
          name: "Blue Alliance", 
          score: 0, 
          teams: nextMatch.blueAlliance, 
          rp: 0,
          detailedScore: {
            autoRP: false, autoParkA: false, autoParkB: false, autoParkC: false,
            autoDebris: 0,
            autoSpecimenNearLow: 0, autoSpecimenNearHigh: 0, autoSpecimenFarLow: 0, autoSpecimenFarHigh: 0,
            teleDebris: 0,
            teleSpecimenNearLow: 0, teleSpecimenNearHigh: 0, teleSpecimenFarLow: 0, teleSpecimenFarHigh: 0,
            teleopParkA: 0, teleopParkB: 0, teleopParkC: 0,
            minorFoul: 0, majorFoul: 0,
            endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0
          }
        },
        showScores: true,
        showWinner: false
      };
    } else {
      // If no matches found in any file, reset to default
      db.data.currentMatch = {
        type: "T",
        number: 0,
        inProgress: false,
        timeRemaining: 158,
        autoDuplicate: false,
        redTeam: { 
          name: "Red Alliance", 
          score: 0, 
          teams: [0,0,0], 
          rp: 0,
          detailedScore: {
            autoRP: false, autoParkA: 0, autoParkB: 0, autoParkC: 0, autoDebris: 0, autoNearLowChamber: 0, autoNearHighChamber: 0, autoFarLowChamber: 0, autoFarHighChamber: 0, 
            teleopParkA: 0, teleopParkB: 0, teleopParkC: 0, teleopDebris: 0, teleopNearLowChamber: 0, teleopNearHighChamber: 0, teleopFarLowChamber: 0, teleopFarHighChamber: 0,
            endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0
          }
        },
        blueTeam: { 
          name: "Blue Alliance", 
          score: 0, 
          teams: [0,0,0], 
          rp: 0,
          detailedScore: {
            autoRP: false, autoParkA: 0, autoParkB: 0, autoParkC: 0, autoDebris: 0, autoNearLowChamber: 0, autoNearHighChamber: 0, autoFarLowChamber: 0, autoFarHighChamber: 0, 
            teleopParkA: 0, teleopParkB: 0, teleopParkC: 0, teleopDebris: 0, teleopNearLowChamber: 0, teleopNearHighChamber: 0, teleopFarLowChamber: 0, teleopFarHighChamber: 0,
            endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0
          }
        },
        showScores: true,
        showWinner: false
      };
    }
    
    // Calculate scores after loading
    db.data.currentMatch.redTeam.score = calculateDetailedScore(
      db.data.currentMatch.redTeam.detailedScore,
      db.data.currentMatch.autoDuplicate
    );
    db.data.currentMatch.blueTeam.score = calculateDetailedScore(
      db.data.currentMatch.blueTeam.detailedScore,
      db.data.currentMatch.autoDuplicate
    );
    
    // Update RPs after loading new match
    updateRPs(db.data.currentMatch.redTeam, db.data.currentMatch.blueTeam);

    // Update team ranking after saving the previous match
    recalculateRanking();

    await db.write();
    io.emit('matchUpdate', db.data.currentMatch);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Check if port 3000 is in use
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// Start server with port fallback
const startServer = async () => {
  let PORT = 3000;
  
  // Try ports 3000-3010 if default is in use
  while (PORT <= 3010) {
    if (await checkPort(PORT)) {
      break;
    }
    PORT++;
  }
  
  if (PORT > 3010) {
    console.error('No available ports found between 3000-3010');
    process.exit(1);
  }
  
  httpServer.listen(PORT, '0.0.0.0', () => {
    const localIP = ip.address();
    console.log(`Server running on:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${localIP}:${PORT}`);
    console.log(`\nAccess the scoring system from any device on your network using the Network URL.`);
  });
};

startServer();
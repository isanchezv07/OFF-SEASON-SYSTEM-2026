import { useEffect, useState } from 'react';
import { socket } from '../../../../lib/socket';
import { 
  Play, Pause, RotateCcw, Edit, Save, 
  History, Trophy, Eye, EyeOff, ArrowRight
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { useBroadcastChannel } from '../../../../hooks/useBroadcastChannel';
import { AnimationMessage } from '../../../../types';

interface FullScore {
  autoParkA: boolean; autoParkB: boolean; autoParkC: boolean;
  autoDebris: number;
  autoSpecimenNearLow: number; autoSpecimenNearHigh: number; autoSpecimenFarLow: number; autoSpecimenFarHigh: number;
  teleDebris: number;
  teleSpecimenNearLow: number; teleSpecimenNearHigh: number; teleSpecimenFarLow: number; teleSpecimenFarHigh: number;
  endgameBannerA: number; endgameBannerB: number; endgameBannerC: number;
  teleopParkA: number; teleopParkB: number; teleopParkC: number;
  minorFoul: number; majorFoul: number;
  autoRP: boolean;
}

interface Team {
  name: string;
  score: number;
  detailedScore: FullScore;
  teams: number[];
}

interface MatchState {
  type: string;
  number: number;
  inProgress: boolean;
  timeRemaining: number;
  redTeam: Team;
  blueTeam: Team;
  showScores: boolean;
  showWinner: boolean;
  autoDuplicate: boolean;
}

export default function ScoreController() {    
  const [match, setMatch] = useState<MatchState>({
    type: "T",
    number: 1,
    inProgress: false,
    timeRemaining: 157,
    autoDuplicate: false,
    redTeam: {
      name: "Red Alliance", 
      score: 0,  
      teams: [0, 0, 0],
      detailedScore: {
        autoParkA: false, autoParkB: false, autoParkC: false, 
        autoDebris: 0, 
        autoSpecimenNearLow: 0, 
        autoSpecimenNearHigh: 0, 
        autoSpecimenFarLow: 0, 
        autoSpecimenFarHigh: 0, 
        teleDebris: 0, 
        teleSpecimenNearLow: 0, 
        teleSpecimenNearHigh: 0, 
        teleSpecimenFarLow: 0, 
        teleSpecimenFarHigh: 0, 
        endgameBannerA: 0, 
        endgameBannerB: 0, 
        endgameBannerC: 0, 
        teleopParkA: 0, 
        teleopParkB: 0, 
        teleopParkC: 0,
        minorFoul: 0,
        majorFoul: 0,
        autoRP: false
      }
    },
    blueTeam: { 
      name: "Blue Alliance", 
      score: 0,  
      teams: [0, 0, 0],
      detailedScore: {
        autoParkA: false, autoParkB: false, autoParkC: false, 
        autoDebris: 0, 
        autoSpecimenNearLow: 0, 
        autoSpecimenNearHigh: 0, 
        autoSpecimenFarLow: 0, 
        autoSpecimenFarHigh: 0, 
        teleDebris: 0, 
        teleSpecimenNearLow: 0, 
        teleSpecimenNearHigh: 0, 
        teleSpecimenFarLow: 0, 
        teleSpecimenFarHigh: 0, 
        endgameBannerA: 0, 
        endgameBannerB: 0, 
        endgameBannerC: 0, 
        teleopParkA: 0, 
        teleopParkB: 0, 
        teleopParkC: 0,
        minorFoul: 0,
        majorFoul: 0,
        autoRP: false
      }
    },
    showScores: true,
    showWinner: false
  });
  
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [isConnected, setIsConnected] = useState(true);

  const { sendMessage } = useBroadcastChannel('team-presentation');
  
  const fetchMatchHistory = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatchHistory(data);
    } catch (error) {
      console.error('Failed to fetch match history:', error);
    }
  };
  
  useEffect(() => {
    socket.on('matchUpdate', (updatedMatch: MatchState) => {
      setMatch(updatedMatch);
    });
    
    fetchMatchHistory();
    
    return () => {
      socket.off('matchUpdate');
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startTimer = () => {
    if (timerInterval) return;
    
    socket.emit('updateTimer', { inProgress: true, timeRemaining: match.timeRemaining });
    
    const interval = window.setInterval(() => {
      setMatch(prev => {
        if (prev.timeRemaining <= 0) {
          clearInterval(interval);
          setTimerInterval(null);
          socket.emit('updateTimer', { inProgress: false, timeRemaining: 0 });
          return { ...prev, inProgress: false, timeRemaining: 0 };
        }
        
        const newTimeRemaining = prev.timeRemaining - 1;
        socket.emit('updateTimer', { inProgress: true, timeRemaining: newTimeRemaining });
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      socket.emit('updateTimer', { inProgress: false, timeRemaining: match.timeRemaining });
    }
  };
  
  const getInitialDetailedScore = (): FullScore => ({
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

  const resetMatch = () => {
    if (window.confirm('Are you sure you want to reset the match? This will save the current match to history and reset all scores.')) {
      pauseTimer();
      
      // Reset both teams with fresh detailed scores
      setMatch(prev => ({
        ...prev,
        redTeam: {
          ...prev.redTeam,
          score: 0,
          detailedScore: getInitialDetailedScore()
        },
        blueTeam: {
          ...prev.blueTeam,
          score: 0,
          detailedScore: getInitialDetailedScore()
        }
      }));
      
      socket.emit('resetMatch');
      toast.success('Match reset successfully');
      fetchMatchHistory();
    }
  };

  const nextMatch = () => {
    if (window.confirm('Are you sure you want to move to the next match? This will save the current match to history and reset all scores.')) {
      pauseTimer();
      socket.emit('loadNextMatch');
      toast.success('Match updated successfully');
      fetchMatchHistory();
    }
  };
  
  const updateScore = (team: 'redTeam' | 'blueTeam', action: 'add' | 'subtract', points: number) => {
    socket.emit('updateScore', { team, action, points });
  };

  const calculateScore = (detailedScore: FullScore, autoDuplicate: boolean = false): number => {
    if (!detailedScore) return 0;
    let total = 0;
    
    const autoMultiplier = autoDuplicate ? 2 : 1;

    // Auto Park points (3 points each)
    if (detailedScore.autoParkA) total += 3;
    if (detailedScore.autoParkB) total += 3;
    if (detailedScore.autoParkC) total += 3;
    
    // Debris points (4 points each)
    const autoDebris = Number(detailedScore.autoDebris) || 0;
    const teleDebris = Number(detailedScore.teleDebris) || 0;
    total += autoDebris * 4 * autoMultiplier; // Auto debris with multiplier
    total += teleDebris * 4; // Teleop debris without multiplier
    
    // Chamber points - Prepare values
    const autoNearLow = Number(detailedScore.autoSpecimenNearLow) || 0;
    const autoNearHigh = Number(detailedScore.autoSpecimenNearHigh) || 0;
    const autoFarLow = Number(detailedScore.autoSpecimenFarLow) || 0;
    const autoFarHigh = Number(detailedScore.autoSpecimenFarHigh) || 0;
    const teleNearLow = Number(detailedScore.teleSpecimenNearLow) || 0;
    const teleNearHigh = Number(detailedScore.teleSpecimenNearHigh) || 0;
    const teleFarLow = Number(detailedScore.teleSpecimenFarLow) || 0;
    const teleFarHigh = Number(detailedScore.teleSpecimenFarHigh) || 0;

    // Add chamber points - Auto period with multiplier
    total += autoNearLow * 6 * autoMultiplier;
    total += autoNearHigh * 10 * autoMultiplier;
    total += autoFarLow * 12 * autoMultiplier;
    total += autoFarHigh * 20 * autoMultiplier;

    // Add chamber points - Teleop period without multiplier
    total += teleNearLow * 6;
    total += teleNearHigh * 10;
    total += teleFarLow * 12;
    total += teleFarHigh * 20;
    
    // Endgame Banner points (8 points each)
    const bannerA = detailedScore.endgameBannerA || 0;
    const bannerB = detailedScore.endgameBannerB || 0;
    const bannerC = detailedScore.endgameBannerC || 0;
    total += (bannerA + bannerB + bannerC) * 8;
    
    // Teleop Park points (3/15/30 based on level)
    [
      detailedScore.teleopParkA || 0,
      detailedScore.teleopParkB || 0,
      detailedScore.teleopParkC || 0
    ].forEach(level => {
      if (level === 1) total += 3;
      else if (level === 2) total += 15;
      else if (level === 3) total += 30;
    });
    
    // Foul points (5 for minor, 15 for major)
    const minorFouls = Number(detailedScore.minorFoul) || 0;
    const majorFouls = Number(detailedScore.majorFoul) || 0;
    total += minorFouls * 5;
    total += majorFouls * 15;
    
    return Math.max(0, total);
  };

  const updateDetailedScore = (team: 'redTeam' | 'blueTeam', field: keyof FullScore, delta: number) => {
    // Create a deep copy of the detailed score
    const newScore = JSON.parse(JSON.stringify(match[team].detailedScore));
    
    if (field.startsWith('autoPark')) {
      // Handle boolean autoPark fields
      (newScore[field] as boolean) = !newScore[field];
    } else if (typeof newScore[field] === 'number') {
      // Handle numeric fields
      const currentValue = Number(newScore[field]) || 0;
      const newValue = currentValue + delta;
      (newScore[field] as number) = Math.max(0, newValue);
      
      // For teleopPark fields, limit to 0-3
      if (field.startsWith('teleopPark')) {
        (newScore[field] as number) = Math.min((newScore[field] as number), 3);
      }
    }
    
    // Update local state with new detailed score
    setMatch(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        detailedScore: newScore
      }
    }));
    
    // Emit to socket
    socket.emit('updateTeam', { 
      team,
      detailedScore: newScore
    });
  };

  // Function to toggle autoRP for an alliance
  const toggleAutoRP = (team: 'redTeam' | 'blueTeam') => {
    const newScore = { ...match[team].detailedScore };
    newScore.autoRP = !newScore.autoRP;
    
    // Update local state
    setMatch(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        detailedScore: newScore
      }
    }));
    
    // Emit to socket
    socket.emit('updateTeam', { 
      team,
      detailedScore: newScore
    });
  };
  
  const startEditingTeam = (team: 'redTeam' | 'blueTeam') => {
    setEditingTeam(team);
    setNewTeamName(match[team].name);
  };
  
  const saveTeamName = () => {
    if (!editingTeam) return;
    
    socket.emit('updateTeam', { 
      team: editingTeam, 
      name: newTeamName
    });
    
    setEditingTeam(null);
    toast.success('Team name updated');
  };

  const toggleScoreVisibility = () => {
    socket.emit('updateVisibility', { showScores: !match.showScores });
  };

  const toggleWinnerDisplay = () => {
    if (!match.showWinner && match.timeRemaining > 0) {
      toast.error('Cannot show winner while match is in progress');
      return;
    }
    socket.emit('updateVisibility', { showWinner: !match.showWinner });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.clear();
    window.location.href = '/login';
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      window.location.href = '/login';
    }
  }, []);

  const startAnimation = () => {
    console.log('Control Panel: Starting animation...');
    const message: AnimationMessage = {
      type: 'START_ANIMATION',
      timestamp: Date.now(),
      match: match
    };
    sendMessage(message);
    setIsAnimating(true);
    setLastAction(`Animation Started at ${new Date().toLocaleTimeString()}`);
    
    // Reset after 15 seconds to allow for re-triggering
    setTimeout(() => {
      setIsAnimating(false);
    }, 15000);
  };

  const resetAnimation = () => {
    console.log('Control Panel: Resetting animation...');
    const message: AnimationMessage = {
      type: 'RESET_ANIMATION',
      timestamp: Date.now()
    };
    sendMessage(message);
    setIsAnimating(false);
    setLastAction(`Animation Reset at ${new Date().toLocaleTimeString()}`);
  };

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {!isConnected && (
        <div className="absolute top-0 left-0 w-full bg-gray-800 text-center py-6 z-50 font-bold text-6xl text-red-600">
            Desconectado! 
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Score Controller</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      
      <div className="container mx-auto p-4">
        {/* Timer Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Match Timer</h2>
              <div className={`flex items-center gap-2 text-5xl font-mono font-bold ${match.timeRemaining <= 30 ? 'text-yellow-600' : ''} ${match.timeRemaining <= 10 ? 'text-red-600' : ''}`}>
                {formatTime(match.timeRemaining)}
                {match.timeRemaining > 127 && (
                  <img src="/img/robot.svg" className="h-[40px]" />
                )}
                {match.timeRemaining <= 127 && match.timeRemaining > 120 && (
                  <img src="/img/hand.svg" className="h-[40px]" />
                )}
                {match.timeRemaining <= 120 && (
                  <img src="/img/gamepad.svg" className="h-[40px]" />
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {match.inProgress ? (
                  <span className="text-green-600 font-medium">Match in progress</span>
                ) : (
                  <span className="text-gray-600">Match paused</span>
                )}
              </div>
            </div>
            </div>
          </div>
  
          <div className="flex items-center gap-2 text-4xl font-semibold mb-2">
            {match.type === 'T' && <span>Practice Match</span>}
            {match.type === 'Q' && <span>Qualification Match</span>}
            {match.type === 'P' && <span>Playoff Match</span>}
            {match.number && (
              <span className="text-gray-600">#{match.number}</span>
            )}
          </div>
          
          {/* Match History (conditionally shown) */}
          {showHistory && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4">Match History</h2>
              
              {matchHistory.length === 0 ? (
                <p className="text-gray-600">No match history available yet.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Red Team</th>
                      <th className="p-2 border">Red Score</th>
                      <th className="p-2 border">Blue Team</th>
                      <th className="p-2 border">Blue Score</th>
                      <th className="p-2 border">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchHistory.map((match, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 border">{new Date(match.date).toLocaleString()}</td>
                        <td className="p-2 border">{match.redTeam.name}</td>
                        <td className="p-2 border font-bold text-red-600">{match.redTeam.score}</td>
                        <td className="p-2 border">{match.blueTeam.name}</td>
                        <td className="p-2 border font-bold text-blue-600">{match.blueTeam.score}</td>
                        <td className="p-2 border">
                          {match.redTeam.score > match.blueTeam.score ? 
                            <span className="text-red-600 font-bold">Red Wins</span> : 
                            match.blueTeam.score > match.redTeam.score ? 
                            <span className="text-blue-600 font-bold">Blue Wins</span> : 
                            <span className="text-gray-600">Tie</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            {/* Red Alliance */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-700 text-white p-4 flex justify-between items-center">
                {editingTeam === 'redTeam' ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="flex-1 px-2 py-1 rounded text-black"
                      autoFocus
                    />
                    <button 
                      onClick={saveTeamName}
                      className="bg-green-600 hover:bg-green-700 text-white p-1 rounded"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{match.redTeam.name}</h2>
                    <button 
                      onClick={() => startEditingTeam('redTeam')} 
                      className="text-white hover:text-gray-200"
                    >
                      <Edit size={16} />
                    </button>
                  </>
                )}
              </div>
              
              <div className="p-6">
                {/*Score*/}
                <div className="text-5xl font-bold text-center mb-6">
                  {match.redTeam.detailedScore ? calculateScore(match.redTeam.detailedScore, match.autoDuplicate) : 0}
                </div>
  
                {/* Detailed Score Controls */}
                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  {/* Fouls Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 text-red-800">Fouls</h3>
                    
                    {/* Minor Fouls */}
                    <div className="mb-4">
                      <h4 className="text-md font-semibold mb-2 text-red-700">Minor Fouls (5 pts each)</h4>
                      <div className="flex items-center justify-between bg-white rounded-lg p-3">
                        <button
                          onClick={() => updateDetailedScore('blueTeam', 'minorFoul', -1)}
                          className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-lg text-2xl font-bold"
                        >-</button>
                        <span className="text-2xl font-bold w-16 text-center">
                          {match.blueTeam.detailedScore.minorFoul}
                        </span>
                        <button
                          onClick={() => updateDetailedScore('blueTeam', 'minorFoul', 1)}
                          className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-lg text-2xl font-bold"
                        >+</button>
                      </div>
                    </div>
                    
                    {/* Major Fouls */}
                    <div className="mb-4">
                      <h4 className="text-md font-semibold mb-2 text-red-700">Major Fouls (15 pts each)</h4>
                      <div className="flex items-center justify-between bg-white rounded-lg p-3">
                        <button
                          onClick={() => updateDetailedScore('blueTeam', 'majorFoul', -1)}
                          className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-lg text-2xl font-bold"
                        >-</button>
                        <span className="text-2xl font-bold w-16 text-center">
                          {match.blueTeam.detailedScore.majorFoul}
                        </span>
                        <button
                          onClick={() => updateDetailedScore('blueTeam', 'majorFoul', 1)}
                          className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-lg text-2xl font-bold"
                        >+</button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Autonomous Period */}
                  {(match.timeRemaining > 120 || match.timeRemaining === 0) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-3 text-red-800">Autonomous Period</h3>
                      
                      {/* Auto Park */}
                      <div className="mb-4">
                        <h4 className="text-md font-semibold mb-2 text-red-700">Auto Park</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {['A', 'B', 'C'].map((robot, index) => (
                            <button 
                              key={`autoPark${robot}`}
                              onClick={() => updateDetailedScore('redTeam', `autoPark${robot}` as keyof FullScore, 0)}
                              className={`p-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 ${
                                match.redTeam.detailedScore[`autoPark${robot}` as keyof FullScore] 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              <img 
                                src={`/img/avatar/${match.redTeam.teams[index]}.svg`}
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                  const target = e.currentTarget;
                                  if (target.src.endsWith('.svg')) {
                                    target.src = `/img/avatar/${match.redTeam.teams[index]}.png`;
                                  } else {
                                    target.onerror = null;
                                    target.src = "/img/avatar/default.svg";
                                  }
                                }}
                                className="w-6 h-6 object-contain p-0.5 bg-white rounded-sm"
                              />
                              {match.redTeam.teams[index]}
                            </button>
                          ))}
                        </div>
                      </div>
  
                      {/* Auto Debris */}
                      <div className="mb-4">
                        <h4 className="text-md font-semibold mb-2 text-red-700">Auto Debris</h4>
                        <div className="flex items-center justify-between bg-white rounded-lg p-3">
                          <button
                            onClick={() => updateDetailedScore('redTeam', 'autoDebris', -1)}
                            className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-lg text-2xl font-bold"
                          >-</button>
                          <span className="text-2xl font-bold w-16 text-center">
                            {match.redTeam.detailedScore.autoDebris}
                          </span>
                          <button
                            onClick={() => updateDetailedScore('redTeam', 'autoDebris', 1)}
                            className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-lg text-2xl font-bold"
                          >+</button>
                        </div>
                      </div>
  
                      {/* Auto Specimen */}
                      <div>
                        <h4 className="text-md font-semibold mb-2 text-red-700">Auto Specimen</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { key: 'autoSpecimenNearLow', label: 'Near Low' },
                            { key: 'autoSpecimenNearHigh', label: 'Near High' },
                            { key: 'autoSpecimenFarLow', label: 'Far Low' },
                            { key: 'autoSpecimenFarHigh', label: 'Far High' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between bg-white rounded-lg p-3">
                              <span className="text-lg font-medium">{label}</span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateDetailedScore('redTeam', key as keyof FullScore, -1)}
                                  className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold"
                                >-</button>
                                <span className="text-2xl font-bold w-12 text-center">
                                  {match.redTeam.detailedScore[key as keyof FullScore]}
                                </span>
                                <button
                                  onClick={() => updateDetailedScore('redTeam', key as keyof FullScore, 1)}
                                  className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold"
                                >+</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Auto RP Toggle */}
                      <div className="mt-4">
                        <h4 className="text-md font-semibold mb-2 text-red-700">Autonomous RP</h4>
                        <button
                          onClick={() => toggleAutoRP('redTeam')}
                          className={`w-full p-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 ${
                            match.redTeam.detailedScore.autoRP 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {match.redTeam.detailedScore.autoRP ? 'Earned' : 'Not Earned'}
                        </button>
                      </div>
                    </div>
                  )}
  
                  {/* Teleoperated Period */}
                  {(match.timeRemaining <= 120 || match.timeRemaining === 0) && (
                    <>
                      <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3 text-red-800">Teleoperated Period</h3>
                        
                        {/* Tele Debris */}
                        <div className="mb-4">
                          <h4 className="text-md font-semibold mb-2 text-red-700">Debris</h4>
                          <div className="flex items-center justify-between bg-white rounded-lg p-3">
                            <button
                              onClick={() => updateDetailedScore('redTeam', 'teleDebris', -1)}
                              className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-lg text-2xl font-bold"
                            >-</button>
                            <span className="text-2xl font-bold w-16 text-center">
                              {match.redTeam.detailedScore.teleDebris}
                            </span>
                            <button
                              onClick={() => updateDetailedScore('redTeam', 'teleDebris', 1)}
                              className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-lg text-2xl font-bold"
                            >+</button>
                          </div>
                        </div>
  
                        {/* Tele Specimen */}
                        <div>
                          <h4 className="text-md font-semibold mb-2 text-red-700">Specimen</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { key: 'teleSpecimenNearLow', label: 'Near Low' },
                              { key: 'teleSpecimenNearHigh', label: 'Near High' },
                              { key: 'teleSpecimenFarLow', label: 'Far Low' },
                              { key: 'teleSpecimenFarHigh', label: 'Far High' }
                            ].map(({ key, label }) => (
                              <div key={key} className="flex items-center justify-between bg-white rounded-lg p-3">
                                <span className="text-lg font-medium">{label}</span>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => updateDetailedScore('redTeam', key as keyof FullScore, -1)}
                                    className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold"
                                  >-</button>
                                  <span className="text-2xl font-bold w-12 text-center">
                                    {match.redTeam.detailedScore[key as keyof FullScore]}
                                  </span>
                                  <button
                                    onClick={() => updateDetailedScore('redTeam', key as keyof FullScore, 1)}
                                    className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold"
                                  >+</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
  
                      {/* Endgame */}
                      <div>
                        <h3 className="text-lg font-bold mb-3 text-red-800">Endgame</h3>
                        
                        {/* Endgame Park */}
                        <div className="mb-4">
                          <h4 className="text-md font-semibold mb-2 text-red-700">Robot Park Level</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {['A', 'B', 'C'].map((robot, index) => (
                              <div key={`teleopPark${robot}`} className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={`/img/avatar/${match.redTeam.teams[index]}.svg`}
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                      const target = e.currentTarget;
                                      if (target.src.endsWith('.svg')) {
                                        target.src = `/img/avatar/${match.redTeam.teams[index]}.png`;
                                      } else {
                                        target.onerror = null;
                                        target.src = "/img/avatar/default.svg";
                                      }
                                    }}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                  <span className="text-lg font-medium">{match.redTeam.teams[index]}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => updateDetailedScore('redTeam', `teleopPark${robot}` as keyof FullScore, -1)}
                                    className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold"
                                  >-</button>
                                  <span className="text-2xl font-bold w-12 text-center">
                                    {match.redTeam.detailedScore[`teleopPark${robot}` as keyof FullScore]}
                                  </span>
                                  <button
                                    onClick={() => updateDetailedScore('redTeam', `teleopPark${robot}` as keyof FullScore, 1)}
                                    className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold"
                                  >+</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
  
                        {/* Banner Points */}
                        <div>
                          <h4 className="text-md font-semibold mb-2 text-red-700">Banner Points</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {['A', 'B', 'C'].map((banner, index) => (
                              <div key={`endgameBanner${banner}`} className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={`/img/avatar/${match.redTeam.teams[index]}.svg`}
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                      const target = e.currentTarget;
                                      if (target.src.endsWith('.svg')) {
                                        target.src = `/img/avatar/${match.redTeam.teams[index]}.png`;
                                      } else {
                                        target.onerror = null;
                                        target.src = "/img/avatar/default.svg";
                                      }
                                    }}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                  <span className="text-lg font-medium">{match.redTeam.teams[index]} Banner</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => updateDetailedScore('redTeam', `endgameBanner${banner}` as keyof FullScore, -1)}
                                    className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold"
                                  >-</button>
                                  <span className="text-2xl font-bold w-12 text-center">
                                    {match.redTeam.detailedScore[`endgameBanner${banner}` as keyof FullScore]}
                                  </span>
                                  <button
                                    onClick={() => updateDetailedScore('redTeam', `endgameBanner${banner}` as keyof FullScore, 1)}
                                    className="w-14 h-14 bg-red-100 hover:bg-red-200 rounded-lg text-xl font-bold"
                                  >+</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
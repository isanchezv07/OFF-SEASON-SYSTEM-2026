import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../lib/socket';
import { Trophy } from 'lucide-react';
import SplatoonBattle from './animations/SplatoonBattle';
import PresentationScreen from './animations/PresentacionScreen';
import { useBroadcastChannel } from '../hooks/useBroadcastChannel';

interface AllianceScoreData {
  autoRP: boolean;
  autoParkA: boolean; autoParkB: boolean; autoParkC: boolean;
  autoDebris: number;
  autoSpecimenNearLow: number; autoSpecimenNearHigh: number; autoSpecimenFarLow: number; autoSpecimenFarHigh: number;
  teleDebris: number;
  teleSpecimenNearLow: number; teleSpecimenNearHigh: number; teleSpecimenFarLow: number; teleSpecimenFarHigh: number;
  teleopParkA: number; teleopParkB: number; teleopParkC: number;
  endgameBannerA: number; endgameBannerB: number; endgameBannerC: number;
  minorFoul: number; majorFoul: number;
}

const INITIAL_TIME = 158;
const AUTO_END_THRESHOLD = INITIAL_TIME - 30;
const TELEOP_START_THRESHOLD = INITIAL_TIME - 38;

function calculateScore(detailedScore: AllianceScoreData, timeRemaining: number): number {
  const autoMultiplier = timeRemaining <= 120 ? 2 : 1;

  const minorFoul = Number(detailedScore.minorFoul || 0);
  const majorFoul = Number(detailedScore.majorFoul || 0);

  let total = 0;
  if (detailedScore.autoParkA) total += 3;
  if (detailedScore.autoParkB) total += 3;
  if (detailedScore.autoParkC) total += 3;
  total += detailedScore.autoDebris * 4 * autoMultiplier;
  total += detailedScore.teleDebris * 4;
  total += detailedScore.autoSpecimenNearLow * 6 * autoMultiplier;
  total += detailedScore.autoSpecimenNearHigh * 10 * autoMultiplier;
  total += detailedScore.autoSpecimenFarLow * 12 * autoMultiplier;
  total += detailedScore.autoSpecimenFarHigh * 20 * autoMultiplier;
  total += detailedScore.teleSpecimenNearLow * 6;
  total += detailedScore.teleSpecimenNearHigh * 10;
  total += detailedScore.teleSpecimenFarLow * 12;
  total += detailedScore.teleSpecimenFarHigh * 20;
  total += (detailedScore.endgameBannerA + detailedScore.endgameBannerB + detailedScore.endgameBannerC) * 8;
  [detailedScore.teleopParkA, detailedScore.teleopParkB, detailedScore.teleopParkC].forEach(level => {
    if (level === 1) total += 3;
    else if (level === 2) total += 15;
    else if (level === 3) total += 30;
  });

  total += minorFoul * 5;
  total += majorFoul * 15;
  return total;
}

interface Team { name: string; score: number; detailedScore: AllianceScoreData; teams: number[]; }
interface MatchState { type: string; number: number; inProgress: boolean; timeRemaining: number; redTeam: Team; blueTeam: Team; showScores: boolean; showWinner: boolean; autoDuplicate: boolean; }
const defaultDetailedScore: AllianceScoreData = {
  autoRP: false,
  autoParkA: false, autoParkB: false, autoParkC: false,
  autoDebris: 0,
  autoSpecimenNearLow: 0, autoSpecimenNearHigh: 0, autoSpecimenFarLow: 0, autoSpecimenFarHigh: 0,
  teleDebris: 0,
  teleSpecimenNearLow: 0, teleSpecimenNearHigh: 0, teleSpecimenFarLow: 0, teleSpecimenFarHigh: 0,
  teleopParkA: 0, teleopParkB: 0, teleopParkC: 0,
  endgameBannerA: 0, endgameBannerB: 0, endgameBannerC: 0,
  minorFoul: 0, majorFoul: 0
};

export default function GameDisplay() {
  const [match, setMatch] = useState<MatchState>({
    type: "T",
    number: 1,
    inProgress: false,
    timeRemaining: INITIAL_TIME,
    autoDuplicate: false,
    redTeam: { name: "Red Alliance", score: 0, teams: [0, 0, 0], detailedScore: { ...defaultDetailedScore } },
    blueTeam: { name: "Blue Alliance", score: 0, teams: [0, 0, 0], detailedScore: { ...defaultDetailedScore } },
    showScores: true,
    showWinner: false
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // <-- NEW STATE to hide the test button once clicked -->
  const [testActivated, setTestActivated] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Refs for previous states
  const prevMatchStateRef = useRef<MatchState | null>(null);
  const prevTimeRef = useRef<number>(INITIAL_TIME);
  const prevInProgressRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio element refs
  const testAudioRef = useRef<HTMLAudioElement>(null);
  const matchStartAudioRef = useRef<HTMLAudioElement>(null);
  const matchResetAudioRef = useRef<HTMLAudioElement>(null);
  const autoEndAudioRef = useRef<HTMLAudioElement>(null);
  const teleopStartAudioRef = useRef<HTMLAudioElement>(null);
  const matchEndAudioRef = useRef<HTMLAudioElement>(null);
  const endgameStartAudioRef = useRef<HTMLAudioElement>(null);

  // Preload audio
  useEffect(() => {
    testAudioRef.current?.load();
    matchStartAudioRef.current?.load();
    matchResetAudioRef.current?.load();
    autoEndAudioRef.current?.load();
    teleopStartAudioRef.current?.load();
    matchEndAudioRef.current?.load();
    endgameStartAudioRef.current?.load();
  }, []);

  // Monitor fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Fullscreen on Enter
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !document.fullscreenElement && containerRef.current) {
        containerRef.current.requestFullscreen().catch(console.error);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('team-presentation');
  
    channel.onmessage = (event) => {
      const message = event.data;
      if (message.type === 'START_ANIMATION') {
        setMatch(message.match); // o guarda el match recibido
        setShowPreview(true);
      }
    };
  
    return () => {
      channel.close();
    };
  }, []);
  
  // Socket updates
  useEffect(() => {
    const handleMatchUpdate = (updatedMatch: MatchState) => {
      setMatch(updatedMatch);

      if (updatedMatch.showWinner === true && !updatedMatch.inProgress && updatedMatch.timeRemaining === 0) {
        setShowAnimation(true);
      } else {
        setShowAnimation(false);
      }

      prevMatchStateRef.current = updatedMatch;
    };
    console.log ('Socket connected');

    socket.on('matchUpdate', handleMatchUpdate);
    // Listen for presentation show events from server (cross-device)
    const handlePresentationShow = (data: any) => {
      if (data?.match) {
        setMatch(data.match);
      }
      if (data?.reset) {
        setShowPreview(false);
      } else {
        setShowPreview(true);
      }
    };
    socket.on('presentationShow', handlePresentationShow);
    return () => {
      socket.off('matchUpdate', handleMatchUpdate);
      socket.off('presentationShow', handlePresentationShow);
    };
  }, []);

  // Watch timeRemaining for auto end and reset
  useEffect(() => {
    const prevTime = prevTimeRef.current;
    const currTime = match.timeRemaining;
    if (prevTime > AUTO_END_THRESHOLD && currTime <= AUTO_END_THRESHOLD) {
      autoEndAudioRef.current?.play();
    }
    if (prevTime > TELEOP_START_THRESHOLD && currTime <= TELEOP_START_THRESHOLD) {
      teleopStartAudioRef.current?.play();
    }
    if (prevTime > 30 && currTime <= 30) {
      endgameStartAudioRef.current?.play();
    }
    if (prevTime > 0 && currTime <= 0) {
      matchEndAudioRef.current?.play();
    }
    if (currTime === INITIAL_TIME && prevTime !== INITIAL_TIME && prevTime!=0) {
      matchResetAudioRef.current?.play();
    }
    prevTimeRef.current = currTime;
  }, [match.timeRemaining]);

  // Watch inProgress for start
  useEffect(() => {
    const prev = prevInProgressRef.current;
    const curr = match.inProgress;
    if (curr && !prev) {
      matchStartAudioRef.current?.play();
    }
    prevInProgressRef.current = curr;
  }, [match.inProgress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWinner = () => {
    const redScore = calculateScore(match.redTeam.detailedScore, match.timeRemaining);
    const blueScore = calculateScore(match.blueTeam.detailedScore, match.timeRemaining);
  
    if (redScore > blueScore) return 'red';
    if (blueScore > redScore) return 'blue';
    return 'tie';
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

  const getTimerColorClass = () =>
    match.timeRemaining <= 10
      ? 'text-[#ed1c24]'
      : match.timeRemaining <= 30
      ? 'text-yellow-500'
      : match.inProgress
      ? 'text-black'
      : 'text-black';

  if (showAnimation) {
    return (
      <div ref={containerRef} className="flex flex-col h-screen bg-black text-white">
        <SplatoonBattle
          redScore={calculateScore(match.redTeam.detailedScore, match.timeRemaining)}
          blueScore={calculateScore(match.blueTeam.detailedScore, match.timeRemaining)}
          redName={match.redTeam.name}
          blueName={match.blueTeam.name}
          onComplete={() => setShowAnimation(false)} // Regresa a pantalla normal cuando termine
        />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div ref={containerRef} className="flex flex-col h-screen bg-black text-white">
        <PresentationScreen
          match={match}
          start={showPreview}
          onComplete={() => setShowPreview(false)}
        />
      </div>
    );
  }


  return (
    <div ref={containerRef} className="flex flex-col h-screen  bg-gradient-to-t from-green-400 to-blue-500 overflow-hidden" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>

      {!isConnected && (
        <div className="absolute top-0 left-0 w-full bg-gray-800 text-center py-6 z-50 font-bold text-6xl text-red-600">
            Desconectado! 
        </div>
      )}
      
      <div className="flex flex-col justify-start items-center h-screen">
        <div className="bg-white w-[860px] h-[580px] flex flex-col items-center justify-center mt-[100px]">
          <div
            className={`text-[13vw] md:text-[21vw] font-bold mt-[-150px] ${getTimerColorClass()}`}
            style={{ lineHeight: '1', whiteSpace: 'nowrap' }}
          >
            {formatTime(
              match.timeRemaining > 128 
              ? match.timeRemaining - 8 
              : match.timeRemaining > 120 && match.timeRemaining <= 128 
                ? match.timeRemaining - 120 
                : match.timeRemaining
            )}  
          </div>
          <div className="mb-[-100px] mt-[30px]">
            {match.timeRemaining > 127 && (
              <img src="/img/robot.svg" className="h-[110px]" />
            )}
            {match.timeRemaining <= 127 && match.timeRemaining > 120 && (
              <img src="/img/hand.svg" className="h-[110px]" />
            )}
            {match.timeRemaining <= 120 && (
              <img src="/img/gamepad.svg" className="h-[110px]" />
            )}
          </div>
        </div>
      </div>
      <audio ref={testAudioRef} src="/sounds/unmute.wav" />
      <audio ref={matchStartAudioRef} src="/sounds/start_match(1).wav" />
      <audio ref={autoEndAudioRef} src="/sounds/end_auto_full(2).wav" />
      <audio ref={teleopStartAudioRef} src="/sounds/start_bell(5).wav" />
      <audio ref={endgameStartAudioRef} src="/sounds/endgame_start(6).wav" />
      <audio ref={matchEndAudioRef} src="/sounds/end_match(7).wav" />
      <audio ref={matchResetAudioRef} src="/sounds/abort_match.wav" />

      {!isFullscreen && !testActivated && (
        <button
          className="absolute top-2 left-2 z-50 bg-black text-white px-3 py-1 rounded shadow"
          onClick={() => {
            testAudioRef.current?.play();
            setTestActivated(true);
          }}
        >
          Enable Audio
        </button>
      )}
      <div className="flex-1 flex flex-col">
        <div className="flex-1"></div>

        <div className="flex flex-row h-[75px] bg-black w-full">
          <div className="max-w-[170px] flex-1 bg-white flex items-center justify-center">
            <img src="\img\logos\hh_primary.svg" className="w-[124px]" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white text-4xl font-bold text-center">Hyper-Hurdle 2025</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-white text-4xl font-bold text-center">
              {(match.type === 'Q' ? 'Qualification'
                : match.type === 'P' ? 'Playoff'
                : 'Practice'
              )} {match.number}
            </span>
          </div>
          <div className="max-w-[170px] flex-1 bg-white flex items-center justify-center">
            <img src="\img\logos\itd_season_primary_wide.svg" className="w-[124px]" />
          </div>
        </div>

        <div className="flex flex-row h-[180px]">
          <div className="flex-1 flex flex-col">
            <div className="h-[50px] bg-white flex items-center justify-center">
              {match.blueTeam.teams.map((number, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-3 px-4">
                    <img 
                      src={`/img/avatar/${number}.svg`} 
                      className="w-[40px] object-cover rounded" 
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.endsWith('.svg')) target.src = `/img/avatar/${number}.png`;
                        else { target.onerror = null; target.src = "/img/avatar/default.svg"; }
                      }}
                    />
                    <span className="text-2xl font-bold text-black">{number}</span>
                  </div>
                  {index < match.blueTeam.teams.length - 1 && <div className="w-8"></div>}
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex-1 bg-[#004172] flex items-center justify-center gap-[28px]">
              <div className={`w-[160px] h-[50px] bg-[#0066b3] flex items-center justify-center gap-4 ${!match.showScores ? 'blur-xl' : ''}`}>
                <img
                  src="/img/robot.svg" width="40px" height="40px"
                  className={`invert ${match.blueTeam.detailedScore.autoRP ? 'opacity-100' : 'opacity-50'}`}
                />
                <img
                  src="/img/flask.svg" width="40px" height="40px"
                  className={`invert ${match.blueTeam.detailedScore.autoSpecimenNearHigh+match.blueTeam.detailedScore.teleSpecimenNearHigh > 0 && match.blueTeam.detailedScore.autoSpecimenNearLow+match.blueTeam.detailedScore.teleSpecimenNearLow > 0 && match.blueTeam.detailedScore.autoSpecimenFarHigh+match.blueTeam.detailedScore.teleSpecimenFarHigh > 0 && match.blueTeam.detailedScore.autoSpecimenFarLow+match.blueTeam.detailedScore.teleSpecimenFarLow > 0 ? 'opacity-100' : 'opacity-50'}`}
                />
                <img
                  src="/img/flag.svg" width="35px" height="35px"
                  className={`invert ${match.blueTeam.detailedScore.endgameBannerA > 0 && match.blueTeam.detailedScore.endgameBannerB > 0 && match.blueTeam.detailedScore.endgameBannerC > 0? 'opacity-100' : 'opacity-50'}`}
                />
              </div>
              
              <div className={`w-[130px] h-[50px] bg-white flex items-center ${!match.showScores ? 'blur-xl' : ''}`}>
                <div className="w-[50px] h-[50px] bg-[#0066b3] flex items-center justify-center">
                  <img src="\img\pickleball.png" className="w-[40px]" />
                </div>
                <div className="flex-1 text-center text-black font-bold text-4xl">
                  {match.blueTeam.detailedScore.teleDebris + match.blueTeam.detailedScore.autoDebris}
                </div>
              </div>
              
              <div className={`w-[180px] h-[100px] bg-white flex items-center ${!match.showScores ? 'blur-xl' : ''}`}>
                <div className="w-[50px] h-[100px] bg-[#0066b3] flex items-center justify-center">
                  <img src="\img\specimen.svg" className="w-[40px] filter brightness-0 invert" />
                </div>
                <div className="flex-1 text-center text-black font-bold text-4xl">
                  <div>{match.blueTeam.detailedScore.autoSpecimenNearHigh + match.blueTeam.detailedScore.teleSpecimenNearHigh}</div>
                  <div>{match.blueTeam.detailedScore.autoSpecimenNearLow + match.blueTeam.detailedScore.teleSpecimenNearLow}</div>
                </div>
                <div className="flex-1 text-center text-black font-bold text-4xl">
                  <div>{match.blueTeam.detailedScore.autoSpecimenFarHigh + match.blueTeam.detailedScore.teleSpecimenFarHigh}</div>
                  <div>{match.blueTeam.detailedScore.autoSpecimenFarLow + match.blueTeam.detailedScore.teleSpecimenFarLow}</div>
                </div>
              </div>
            </div>
          </div>

          {match.showScores ? (
            <>
              <div className="w-[221px] bg-[#0066b3] shadow-2xl p-4 flex flex-col">
                <h2 className="text-center text-xl md:text-2xl font-semibold mb-2">{match.blueTeam.name}</h2>
                <div className="text-5xl md:text-8xl font-bold text-center my-auto">
                  {calculateScore(match.blueTeam.detailedScore, match.timeRemaining)}
                </div>
                {match.showWinner && getWinner() === 'blue' && !match.inProgress && match.timeRemaining === 0 && (
                  <div className="flex justify-center items-center translate-y-[-10px]">
                    <Trophy size={48} className="text-yellow-300 animate-bounce" />
                    <div className="text-4xl font-bold text-yellow-300 ml-2">WINNER!</div>
                  </div>
                )}
              </div>

              <div className="w-[221px] bg-[#ed1c24] shadow-2xl p-4 flex flex-col">
                <h2 className="text-center text-xl md:text-2xl font-semibold mb-2">{match.redTeam.name}</h2>
                <div className="text-5xl md:text-8xl font-bold text-center my-auto">
                  {calculateScore(match.redTeam.detailedScore, match.timeRemaining)}
                </div>
                {match.showWinner && getWinner() === 'red' && !match.inProgress && match.timeRemaining === 0 && (
                  <div className="flex justify-center items-center translate-y-[-10px]">
                    <Trophy size={40} className="text-yellow-300 animate-bounce" />
                    <div className="text-3xl font-bold text-yellow-300 ml-2">WINNER!</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="md:w-[646px]">
              <div className="bg-[#ffff00] h-full p-4 flex flex-col">
                <div className="flex flex-col items-center justify-center text-black my-auto">
                  <div className="md:text-4xl font-bold text-center">MATCH UNDER REVIEW</div>
                  <img src="/img/whistle.png" className="h-[80px] mt-2" />
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col">
            <div className="h-[50px] bg-white flex items-center justify-center">
              {match.redTeam.teams.map((number, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-3 px-4">
                    <img 
                      src={`/img/avatar/${number}.svg`} 
                      className="w-[40px] object-cover rounded" 
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.endsWith('.svg')) target.src = `/img/avatar/${number}.png`;
                        else { target.onerror = null; target.src = "/img/avatar/default.svg"; }
                      }}
                    />
                    <span className="text-2xl font-bold text-black">{number}</span>
                  </div>
                  {index < match.redTeam.teams.length - 1 && <div className="w-8"></div>}
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex-1 bg-[#830e12] flex items-center justify-center gap-[28px]">
              <div className={`w-[180px] h-[100px] bg-white flex items-center ${!match.showScores ? 'blur-xl' : ''}`}>
                <div className="w-[50px] h-[100px] bg-[#ed1c24] flex items-center justify-center">
                  <img src="\img\specimen.svg" className="w-[40px] filter brightness-0 invert" />
                </div>
                <div className="flex-1 text-center text-black font-bold text-4xl">
                  <div>{match.redTeam.detailedScore.autoSpecimenNearHigh + match.redTeam.detailedScore.teleSpecimenNearHigh}</div>
                  <div>{match.redTeam.detailedScore.autoSpecimenNearLow + match.redTeam.detailedScore.teleSpecimenNearLow}</div>
                </div>
                <div className="flex-1 text-center text-black font-bold text-4xl">
                  <div>{match.redTeam.detailedScore.autoSpecimenFarHigh + match.redTeam.detailedScore.teleSpecimenFarHigh}</div>
                  <div>{match.redTeam.detailedScore.autoSpecimenFarLow + match.redTeam.detailedScore.teleSpecimenFarLow}</div>
                </div>
              </div>
              
              <div className={`w-[130px] h-[50px] bg-white flex items-center ${!match.showScores ? 'blur-xl' : ''}`}>
                <div className="w-[50px] h-[50px] bg-[#ed1c24] flex items-center justify-center">
                  <img src="\img\pickleball.png" className="w-[40px]" />
                </div>
                <div className="flex-1 text-center text-black font-bold text-4xl">
                  {match.redTeam.detailedScore.teleDebris + match.redTeam.detailedScore.autoDebris}
                </div>
              </div>
              
              <div className={`w-[160px] h-[50px] bg-[#ed1c24] flex items-center justify-center gap-4 ${!match.showScores ? 'blur-xl' : ''}`}>
                <img
                  src="/img/robot.svg" width="40px" height="40px"
                  className={`invert ${match.redTeam.detailedScore.autoRP ? 'opacity-100' : 'opacity-50'}`}
                />
                <img
                  src="/img/flask.svg" width="40px" height="40px"
                  className={`invert ${match.redTeam.detailedScore.autoSpecimenNearHigh+match.redTeam.detailedScore.teleSpecimenNearHigh > 0 && match.redTeam.detailedScore.autoSpecimenNearLow+match.redTeam.detailedScore.teleSpecimenNearLow > 0 && match.redTeam.detailedScore.autoSpecimenFarHigh+match.redTeam.detailedScore.teleSpecimenFarHigh > 0 && match.redTeam.detailedScore.autoSpecimenFarLow+match.redTeam.detailedScore.teleSpecimenFarLow > 0 ? 'opacity-100' : 'opacity-50'}`}
                />
                <img
                  src="/img/flag.svg" width="35px" height="35px"
                  className={`invert ${match.redTeam.detailedScore.endgameBannerA > 0 && match.redTeam.detailedScore.endgameBannerB > 0 && match.redTeam.detailedScore.endgameBannerC > 0? 'opacity-100' : 'opacity-50'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
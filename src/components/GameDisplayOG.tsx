import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../lib/socket';
import { Trophy } from 'lucide-react';
import { useAudio } from './useAudio';
import SplatoonBattle from './animations/SplatoonBattle';

interface Team {
  name: string;
  score: number;
}

interface MatchState {
  inProgress: boolean;
  timeRemaining: number;
  redTeam: Team;
  blueTeam: Team;
  showScores: boolean;
  showWinner: boolean;
  redAlliance?: number[];
  blueAlliance?: number[];
}

export default function GameDisplay() {
  const [match, setMatch] = useState<MatchState>({
    inProgress: false,
    timeRemaining: 150,
    redTeam: { name: "Red Alliance", score: 0 },
    blueTeam: { name: "Blue Alliance", score: 0 },
    showScores: true,
    showWinner: false,
  });

  const [showAnimation, setShowAnimation] = useState(false);
  const prevMatchRef = useRef<MatchState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio hooks
  const matchStartAudio = useAudio('/sounds/match_start.mp3', 0);
  const matchResetAudio = useAudio('/sounds/abort_match.mp3', 0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.key === 'Enter' &&
        !document.fullscreenElement &&
        containerRef.current
      ) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error('Error al entrar en pantalla completa:', err);
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    socket.on('matchUpdate', (updatedMatch: MatchState) => {
      setMatch(updatedMatch);

      // Solo activar animación si:
      // 1. showWinner es true
      // 2. partido terminó (no inProgress y tiempo 0)
      // 3. puntuaciones válidas
      // 4. el estado previo era inProgress o no había animación para evitar reinicios por cambios menores
      const prev = prevMatchRef.current;

      const shouldShowAnimation =
        updatedMatch.showWinner === true &&
        !updatedMatch.inProgress &&
        updatedMatch.timeRemaining === 0 &&
        (updatedMatch.redTeam.score > 0 || updatedMatch.blueTeam.score > 0) &&
        (prev?.inProgress === true || showAnimation === false);

      if (shouldShowAnimation) {
        setShowAnimation(true);
      } else {
        setShowAnimation(false);
      }

      prevMatchRef.current = updatedMatch;
    });

    return () => {
      socket.off('matchUpdate');
    };
  }, [showAnimation]);

  useEffect(() => {
    if (match.inProgress) {
      matchStartAudio.play();
    }

    if (
      match.timeRemaining === 150 &&
      match.redTeam.score === 0 &&
      match.blueTeam.score === 0
    ) {
      matchResetAudio.play();
    }
  }, [match, matchStartAudio, matchResetAudio]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWinner = () => {
    if (match.redTeam.score > match.blueTeam.score) return 'red';
    if (match.blueTeam.score > match.redTeam.score) return 'blue';
    return 'tie';
  };

  // Mostrar animación en toda la pantalla si corresponde
  if (showAnimation) {
    return (
      <div ref={containerRef} className="flex flex-col h-screen bg-black text-white">
        <SplatoonBattle
          redScore={match.redTeam.score}
          blueScore={match.blueTeam.score}
          redName={match.redTeam.name}
          blueName={match.blueTeam.name}
          onComplete={() => setShowAnimation(false)} // Regresa a pantalla normal cuando termine
        />
      </div>
    );
  }

  // Pantalla normal con fondo verde y scores
  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-[#00ff00] text-white">
      <header className="bg-gray-800 p-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">FTC LIVE SCORING</h1>
        <div className="text-xl md:text-2xl mt-1">
          {match.inProgress ? (
            <span className="text-green-400">MATCH IN PROGRESS</span>
          ) : (
            <span className="text-yellow-400">MATCH STANDBY</span>
          )}
        </div>
        <p className="text-xs text-gray-600">
          Developed by{' '}
          <a
            href="https://github.com/isanchezv07"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:underline"
          >
            @isanchezv07
          </a>
        </p>
      </header>

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
            <p className="text-white text-4xl font-bold text-center">Qualification 1</p>
          </div>

          <div className="max-w-[170px] flex-1 bg-white flex items-center justify-center">
            <img src="\img\logos\itd_season_primary_wide.svg" className="w-[124px]" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[180px]">
          <div className="flex-1 bg-[#004172] shadow-2xl p-4 flex flex-col ml-auto"></div>

          <div className="max-w-[152px] bg-white shadow-lg flex flex-col items-center justify-center space-y-4 p-3">
            {[16818, 13085, 25668].map((number, index) => (
              <div key={index} className="flex items-center gap-3">
                <img src={`/img/avatar/${number}.png`} className="w-[40px]" />
                <span className="text-2xl font-bold text-black">{number}</span>
              </div>
            ))}
          </div>

          <div className="max-w-[221px] flex-1 bg-[#0066b3] shadow-2xl p-4 flex flex-col ml-auto">
            <h2 className="text-center text-xl md:text-2xl font-semibold mb-2">
              {match.blueTeam.name}
            </h2>
            <div
              className={`text-5xl md:text-8xl font-bold text-center my-auto ${
                !match.showScores ? 'blur-xl' : ''
              }`}
            >
              {match.blueTeam.score}
            </div>
            {match.showWinner &&
              getWinner() === 'blue' &&
              !match.inProgress &&
              match.timeRemaining === 0 && (
                <div className="flex justify-center items-center translate-y-[-10px]">
                  <Trophy size={48} className="text-yellow-300 animate-bounce" />
                  <div className="text-4xl font-bold text-yellow-300 ml-2">WINNER!</div>
                </div>
              )}
          </div>

          <div className="md:w-[204px]">
            <div className="bg-white h-full p-4 flex flex-col">
              <h2 className="text-center text-2xl mb-2 text-black font-bold">MATCH TIME</h2>
              <div
                className={`text-4xl md:text-7xl font-bold text-center my-auto ${
                  match.timeRemaining <= 10
                    ? 'text-red-500'
                    : match.timeRemaining <= 30
                    ? 'text-yellow-400'
                    : match.inProgress
                    ? 'text-green-500'
                    : 'text-black'
                }`}
              >
                {formatTime(match.timeRemaining)}
              </div>
            </div>
          </div>

          <div className="max-w-[221px] flex-1 bg-[#ed1c24] shadow-2xl p-4 flex flex-col">
            <h2 className="text-center text-xl md:text-2xl font-semibold mb-2">
              {match.redTeam.name}
            </h2>
            <div
              className={`text-5xl md:text-8xl font-bold text-center mt-auto ${
                !match.showScores ? 'blur-xl' : ''
              }`}
            >
              {match.redTeam.score}
            </div>
          </div>

          <div className="max-w-[152px] bg-white shadow-lg flex flex-col items-center justify-center space-y-4 p-3">
            {[16818, 13085, 25668].map((number, index) => (
              <div key={index} className="flex items-center gap-3">
                <img
                  src={`/img/avatar/${number}.png`}
                  className="w-[40px] object-cover rounded"
                />
                <span className="text-2xl font-bold text-black">{number}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 bg-[#830e12] shadow-2xl p-4 flex flex-col ml-auto"></div>
        </div>
      </div>
    </div>
  );
}
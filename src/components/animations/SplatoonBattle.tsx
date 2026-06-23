import React, { useState, useEffect } from 'react';
import TeamLogo from './Teamlogo';
import ScoreComparison from './ScoreComparison';
import WinnerReveal from './WinnerReveal';
import useAnimationSequence from '../../hooks/useAnimationSequence';
import InkSplatter from './InkSplatter';
import './styles.css';

interface SplatoonBattleProps {
  onComplete: () => void;
  redScore: number;
  blueScore: number;
  redName: string;
  blueName: string;
}

const SplatoonBattle: React.FC<SplatoonBattleProps> = ({ 
  onComplete, 
  redScore, 
  blueScore,
  redName,
  blueName
}) => {
  const [currentZone, setCurrentZone] = useState<number>(-1);
  const [showWinner, setShowWinner] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [strobe, setStrobe] = useState<boolean>(false);
  const [zoom, setZoom] = useState<boolean>(false);
  
  const winner = blueScore > redScore ? 'blue' : redScore > blueScore ? 'red' : 'tie';

  const sequence = [
    
    // Show scores
    { action: () => setCurrentZone(0), duration: 5000 },
    
    // Build tension
    { 
      action: () => {
        setZoom(true);
        setTimeout(() => setShake(true), 500);
        setTimeout(() => setStrobe(true), 1000);
      }, 
      duration: 2500 
    },
    
    // Reveal winner
    { 
      action: () => {
        setZoom(false);
        setShake(false);
        setStrobe(false);
        setShowWinner(true);
      }, 
      duration: 5000 
    },
    
    // Sequence complete
    { action: onComplete, duration: 0 }
  ];

  useAnimationSequence(sequence);

  return (
<div className={`fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center
    ${shake ? 'animate-shake' : ''} ${zoom ? 'scale-110' : ''} transition-transform duration-500`}>
      
      {/* Background ink splatters */}
      <div className="absolute inset-0 z-0 opacity-20">
        <InkSplatter color="blue" count={10} />
        <InkSplatter color="red" count={10} />
      </div>
      
      {/* Strobe effect */}
      {strobe && (
        <div className="absolute inset-0 bg-white opacity-0 z-50 animate-strobe"></div>
      )}

      {/* Team logos intro */}
      {currentZone === -1 && (
        <div className="absolute inset-0 flex items-center justify-between p-8 z-10">
          <div className="w-2/5 animate-slide-right">
            <TeamLogo team="blue" name={blueName} />
          </div>
          <div className="w-2/5 animate-slide-left">
            <TeamLogo team="red" name={redName} />
          </div>
        </div>
      )}

      {/* Score comparison */}
      {currentZone >= 0 && !showWinner && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-10 animate-pop">
            MATCH RESULTS
          </h2>
          <ScoreComparison
            blueScore={blueScore}
            redScore={redScore}
          />
        </div>
      )}

      {/* Winner reveal */}
      {showWinner && (
        <WinnerReveal 
          winner={winner} 
          blueTotal={blueScore}
          redTotal={redScore}
        />
      )}
    </div>
  );
};

export default SplatoonBattle;
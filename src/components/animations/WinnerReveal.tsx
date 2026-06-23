import React, { useState, useEffect } from 'react';
import Confetti from './Confetti';
import './styles.css';

interface WinnerRevealProps {
  winner: 'blue' | 'red' | 'tie';
  blueTotal: number;
  redTotal: number;
}

const WinnerReveal: React.FC<WinnerRevealProps> = ({ winner, blueTotal, redTotal }) => {
  const [showScores, setShowScores] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  
  useEffect(() => {
    const scoreTimer = setTimeout(() => {
      setShowScores(true);
    }, 500);
    
    const winnerTimer = setTimeout(() => {
      setShowWinner(true);
    }, 2000);
    
    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(winnerTimer);
    };
  }, []);

  const winnerColor = winner === 'tie'
    ? 'text-white'
    : winner === 'blue'
    ? 'text-white'
    : 'text-white';

  const winnerBg = winner === 'tie'
    ? 'bg-yellow-500'
    : winner === 'blue'
    ? 'bg-blue-600'
    : 'bg-red-600';

  const winnerText = winner === 'blue'
    ? 'BLUE ALLIANCE'
    : winner === 'red'
    ? 'RED ALLIANCE'
    : "IT'S A TIE!";

  const confettiColor = winner === 'tie' 
    ? 'yellow'
    : winner === 'blue' 
    ? 'blue'
    :'red';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 text-white">
      {/* Final scores */}
      {showScores && (
        <div className="animate-pop mb-12 text-center">
          <h2 className="text-6xl md:text-7xl font-extrabold mb-10">FINAL SCORE</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div className="text-center">
              <div className="text-7xl md:text-8xl font-black text-blue-400">{blueTotal}</div>
              <div className="text-4xl md:text-5xl font-semibold text-blue-200 mt-2">BLUE</div>
            </div>

            <div className="text-5xl md:text-6xl font-extrabold">VS</div>

            <div className="text-center">
              <div className="text-7xl md:text-8xl font-black text-red-500">{redTotal}</div>
              <div className="text-4xl md:text-5xl font-semibold text-red-200 mt-2">RED</div>
            </div>
          </div>
        </div>
      )}

      {/* Winner declaration */}
      {showWinner && (
        <>
          <div
            className={`${winnerBg} px-8 py-6 rounded-xl shadow-xl animate-winner-pop relative z-10`}
          >
            {/* <InkSplatter color={winner} count={30} /> */}
            <h2 className={`text-4xl md:text-5xl font-extrabold tracking-wide relative z-10 whitespace-nowrap ${winnerColor}`}>
              {winnerText} {winner !== 'tie' && 'WINS!'}
            </h2>
          </div>

          {/* Confetti afuera para que cubra toda la pantalla */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            <Confetti color={confettiColor} />
          </div>
        </>
      )}
    </div>
  );
};

export default WinnerReveal;
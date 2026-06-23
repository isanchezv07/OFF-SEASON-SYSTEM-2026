import React, { useState, useEffect } from 'react';
import './styles.css';

interface ScoreComparisonProps {
  blueScore: number;
  redScore: number;
}

const ScoreComparison: React.FC<ScoreComparisonProps> = ({ blueScore, redScore }) => {
  // El valor real sirve para inicializar el random para que la barra no comience en 0
  const [randomBlue, setRandomBlue] = useState(blueScore);
  const [randomRed, setRandomRed] = useState(redScore);

  // Controlamos que la barra se anime desde el valor real a random
  const [blueWidth, setBlueWidth] = useState(blueScore);
  const [redWidth, setRedWidth] = useState(redScore);

  useEffect(() => {
    // Cuando cambian los scores reales, también actualizamos la base inicial para random
    setRandomBlue(blueScore);
    setRandomRed(redScore);
    setBlueWidth(blueScore);
    setRedWidth(redScore);
  }, [blueScore, redScore]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generamos valores random 10-100 para que siempre se vea barra visible
      const newBlue = 10 + Math.floor(Math.random() * 91);
      const newRed = 10 + Math.floor(Math.random() * 91);
      setRandomBlue(newBlue);
      setRandomRed(newRed);
      setBlueWidth(newBlue);
      setRedWidth(newRed);
    }, 900); // Cambia cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl px-8">
      {/* Labels con valores random */}
      <div className="flex justify-between mb-2">
        <div className="text-blue-400 font-bold text-xl">
          Blue: {randomBlue}%
        </div>
        <div className="text-red-500 font-bold text-xl">
          Red: {randomRed}%
        </div>
      </div>

      {/* Barras */}
      <div className="flex h-16 bg-gray-700 rounded-lg overflow-hidden relative">
        {/* Barra azul */}
        <div
          className="h-full bg-blue-500 relative"
          style={{
            width: `${blueWidth}%`,
            transition: 'width 1.5s ease-in-out',
          }}
        >
          <div className="absolute top-0 right-0 h-full w-4 overflow-visible">
            {[...Array(8)].map((_, i) => (
              <div
                key={`blue-${i}`}
                className="absolute w-3 h-3 bg-blue-300 rounded-full animate-ink-particle"
                style={{
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`
                }}
              ></div>
            ))}
          </div>

          {[...Array(10)].map((_, i) => (
            <div
              key={`blue-bubble-${i}`}
              className="absolute rounded-full bg-blue-200 opacity-40"
              style={{
                width: `${4 + Math.random() * 10}px`,
                height: `${4 + Math.random() * 10}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
            ></div>
          ))}
        </div>

        {/* Barra roja */}
        <div
          className="h-full bg-red-500 relative ml-auto"
          style={{
            width: `${redWidth}%`,
            transition: 'width 1.5s ease-in-out',
          }}
        >
          <div className="absolute top-0 left-0 h-full w-4 overflow-visible">
            {[...Array(8)].map((_, i) => (
              <div
                key={`red-${i}`}
                className="absolute w-3 h-3 bg-red-300 rounded-full animate-ink-particle-red"
                style={{
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`
                }}
              ></div>
            ))}
          </div>

          {[...Array(10)].map((_, i) => (
            <div
              key={`red-bubble-${i}`}
              className="absolute rounded-full bg-red-200 opacity-40"
              style={{
                width: `${4 + Math.random() * 10}px`,
                height: `${4 + Math.random() * 10}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
            ></div>
          ))}
        </div>

        {/* Línea divisoria */}
        <div className="absolute left-1/2 h-full w-1 bg-white/30 transform -translate-x-1/2 z-10"></div>
      </div>
    </div>
  );
};

export default ScoreComparison;
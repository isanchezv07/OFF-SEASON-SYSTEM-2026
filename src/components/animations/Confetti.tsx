import React, { useEffect, useState } from 'react';
import './styles.css';

interface ConfettiProps {
  color: string;
}

const Confetti: React.FC<ConfettiProps> = ({ color }) => {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    let colors;
    if (color === 'blue') {
      colors = ['bg-blue-400', 'bg-blue-300', 'bg-blue-500', 'bg-white'];
    } else if (color === 'yellow') {
      colors = ['bg-yellow-400', 'bg-yellow-300', 'bg-yellow-500', 'bg-white'];
    } else {
      colors = ['bg-red-400', 'bg-red-300', 'bg-red-500', 'bg-white'];
    }
    
    const shapes = ['rounded-full', 'rounded', 'rounded-sm'];
    
    const newParticles = Array.from({ length: 100 }, (_, i) => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 5 + Math.random() * 10;
      const left = Math.random() * 100;
      const animationDuration = 2 + Math.random() * 3;
      const delay = Math.random() * 0.5;
      
      return (
        <div
          key={i}
          className={`absolute top-0 ${randomColor} ${randomShape} z-20`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            opacity: 0.8,
            animation: `confetti ${animationDuration}s ease-in forwards`,
            animationDelay: `${delay}s`,
          }}
        ></div>
      );
    });
    
    setParticles(newParticles);
  }, [color]);

  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{particles}</div>;
};

export default Confetti;
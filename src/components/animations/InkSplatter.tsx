import React from 'react';
import './styles.css';

interface InkSplatterProps {
  color: string;
  count?: number;
}

const InkSplatter: React.FC<InkSplatterProps> = ({ color, count = 15 }) => {
  const isBlue = color === 'blue';
  const isYellow = color === 'yellow';
  
  let baseColor, lightColor;
  if (isBlue) {
    baseColor = 'bg-blue-500';
    lightColor = 'bg-blue-300';
  } else if (isYellow) {
    baseColor = 'bg-yellow-500';
    lightColor = 'bg-yellow-300';
  } else {
    baseColor = 'bg-red-500';
    lightColor = 'bg-red-300';
  }
  
  // Generate random ink splats
  const inkSplats = Array.from({ length: count }, (_, i) => {
    const size = 30 + Math.random() * 100;
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const rotation = Math.random() * 360;
    const delay = Math.random() * 0.5;
    const useLight = Math.random() > 0.7;
    
    return (
      <div
        key={i}
        className={`absolute ${useLight ? lightColor : baseColor} rounded-full opacity-70 origin-center`}
        style={{
          width: `${size}px`,
          height: `${size * 0.8}px`,
          top: `${top}%`,
          left: `${left}%`,
          transform: `rotate(${rotation}deg) scale(${0.8 + Math.random() * 0.4})`,
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          animationDelay: `${delay}s`,
        }}
      ></div>
    );
  });

  return <>{inkSplats}</>;
};

export default InkSplatter;
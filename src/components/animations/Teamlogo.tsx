import React from 'react';
import { Droplets, Flame } from 'lucide-react';
import './styles.css';

interface TeamLogoProps {
  team: 'blue' | 'red';
}

const TeamLogo: React.FC<TeamLogoProps> = ({ team }) => {
  const isBlue = team === 'blue';
  const bgColor = isBlue ? 'bg-blue-500' : 'bg-red-500';
  const textColor = isBlue ? 'text-blue-200' : 'text-red-200';
  const glowColor = isBlue ? 'blue' : 'red';
  const name = isBlue ? 'BLUE ALLIANCE' : 'RED ALLIANCE';
  
  return (
    <div className={`${bgColor} rounded-xl p-6 flex flex-col items-center
                   shadow-lg animate-pulse-slow relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      
      {/* Ink drips at top */}
      <div className="absolute top-0 left-0 right-0 flex justify-between">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className={`w-4 h-10 ${isBlue ? 'bg-blue-600' : 'bg-red-600'} rounded-b-full 
                       transform -translate-y-${Math.random() * 3}`}
            style={{ 
              left: `${(i * 20) + Math.random() * 5}%`, 
              height: `${Math.random() * 15 + 15}px`,
              animationDelay: `${i * 0.2}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className={`text-5xl ${textColor} mb-2`}>
        {isBlue ? (
          <Droplets className="w-20 h-20 animate-bounce" />
        ) : (
          <Flame className="w-20 h-20 animate-bounce" />
        )}
      </div>
      
      <h2 className={`text-xl font-bold text-white tracking-wider z-10
                     filter drop-shadow-[0_0_10px_${glowColor}]`}>
        {name}
      </h2>
    </div>
  );
};

export default TeamLogo;
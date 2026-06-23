import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamCard from '../animations/TeamCard';
//import WaterBackground from './seasons/WaterBackground';
import SandBackground from './seasons/SandBackground';
import '../../index.css';
import { MatchState } from '../../types';

interface PresentationScreenProps {
  match: MatchState;
  start: boolean;
  onComplete?: () => void;
}

const PresentationScreen: React.FC<PresentationScreenProps> = ({ match, start, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const [matchinfo, setMatchinfo] = useState<MatchState>(match);

  const startAnimation = () => {
    setIsAnimating(true);
    setShowTitle(true);
    
    // Los equipos aparecen después del título con efecto flotante
    setTimeout(() => {
      setShowTeams(true);
    }, 1000);

    setTimeout(() => {
      resetAnimation();
    }, 8000);
  };

  const resetAnimation = () => {
    console.log('Resetting animation...');
    setIsAnimating(false);
    setShowTitle(false);
    setShowTeams(false);
    onComplete?.();
  };

  // Inicia la animación cuando el padre indique start=true y sincroniza el match
  useEffect(() => {
    if (start) {
      setMatchinfo(match);
      startAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SandBackground />

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <AnimatePresence>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
              }}
              exit={{ opacity: 0, y: -100, scale: 0.8 }}
              transition={{ 
                duration: 2, 
                type: "spring",
                stiffness: 80,
                damping: 20
              }}
              className="text-center mb-20"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotateX: [0, 5, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.h2 
                  className="text-5xl font-semibold text-blue-200 mb-4"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    y: [0, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {(matchinfo.type === 'Q' ? 'Qualification' : matchinfo.type === 'P' ? 'Playoff' : 'Practice')} Match #{matchinfo.number}
                </motion.h2>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
        {showTeams && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-7xl w-full"
          >
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              {/* Equipo Azul */}
              <TeamCard
                key={`blue-${matchinfo.blueTeam.teams[i]}`}
                team={{
                  id: matchinfo.blueTeam.teams[i],
                  name: `Team ${matchinfo.blueTeam.teams[i]}`, 
                  color: '#3B82F6'
                }}
                index={i}
                isVisible={showTeams}
              />

              {/* Equipo Rojo */}
              <TeamCard
                key={`red-${matchinfo.redTeam.teams[i]}`}
                team={{
                  id: matchinfo.redTeam.teams[i],
                  name: `Team ${matchinfo.redTeam.teams[i]}`, 
                  color: '#EF4444'
                }}
                index={i}
                isVisible={showTeams}
              />
            </React.Fragment>
          ))}
          </motion.div>
        )}
        </AnimatePresence>

        {/* Estado de espera */}
        {!isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          ></motion.div>
        )}
      </div>
    </div>
  );
};

export default PresentationScreen;
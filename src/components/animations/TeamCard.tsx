import React from 'react';
import { motion } from 'framer-motion';

interface Team {
  id: string | number;
  name: string;
  color: string;
}

interface TeamCardProps {
  team: Team;
  index: number;
  isVisible: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, index, isVisible }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 200, 
        scale: 0.8,
        rotateX: 10
      }}
      animate={isVisible ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0
      } : {
        opacity: 0, 
        y: 200, 
        scale: 0.8,
        rotateX: 10
      }}
      transition={{
        duration: 2,
        delay: index * 0.8,
        type: "spring",
        stiffness: 60,
        damping: 20,
        mass: 1.2
      }}
      className="relative"
    >
      <motion.div
        className={`relative backdrop-blur-md rounded-3xl p-8 border shadow-2xl ${
          team.color === '#EF4444' 
            ? 'bg-gradient-to-br from-red-800/80 to-red-900/80 border-red-400/30' 
            : 'bg-gradient-to-br from-blue-800/80 to-blue-900/80 border-blue-400/30'
        }`}
        whileHover={{ 
          scale: 1.05,
          y: -10
        }}
        animate={{
          y: [0, -15, 0],
          rotateX: [0, 3, 0],
          rotateY: [0, 2, 0]
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5
          },
          rotateX: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.3
          },
          rotateY: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.7
          }
        }}
      >
        {/* Brillo acuático */}
        <div className={`absolute inset-0 rounded-3xl blur-xl ${
          team.color === '#EF4444' 
            ? 'bg-gradient-to-r from-red-400/20 to-orange-400/20' 
            : 'bg-gradient-to-r from-cyan-400/20 to-blue-400/20'
        }`} />

        {/* Contenido */}
        <div className="relative z-10">
          <motion.h3 
            className={`text-5xl font-bold mb-4 bg-clip-text text-transparent ${
              team.color === '#EF4444' 
                ? 'bg-gradient-to-r from-red-300 to-orange-300' 
                : 'bg-gradient-to-r from-cyan-300 to-blue-300'
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: index * 0.8 + 0.5, duration: 1 }}
          >
            {team.name}
          </motion.h3>
        </div>

        {/* Borde animado (opcional, puedes quitar o ajustar) */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-transparent pointer-events-none"
          style={{
            background: `linear-gradient(45deg, ${team.color}40, transparent, ${team.color}40) border-box`,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Burbujas flotantes */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-60 pointer-events-none ${
              team.color === '#EF4444' ? 'bg-red-300' : 'bg-blue-300'
            }`}
            style={{
              left: `${20 + i * 30}%`,
              top: `${80 + i * 5}%`,
            }}
            animate={{
              y: [-10, -40, -10],
              x: [0, Math.random() * 10 - 5, 0],
              scale: [0.5, 1, 0.5],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default TeamCard;
import React from 'react';
import { motion } from 'framer-motion';

const WaterBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Fondo degradado azul profundo */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950" />
      
      {/* Ondas animadas en tonos azules */}
      <div className="absolute inset-0">
        <svg 
          className="absolute w-full h-full" 
          viewBox="0 0 1400 800" 
          preserveAspectRatio="xMidYMid slice"
          style={{ minWidth: '100vw', minHeight: '100vh' }}
        >
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="wave4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#1E40AF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="wave5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0C4A6E" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0369A1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Onda de fondo más profunda - azul oscuro */}
          <motion.path
            d="M-200,650 Q200,600 600,650 T1400,650 T2000,650 V800 H-200 Z"
            fill="url(#wave4)"
            animate={{
              d: [
                "M-200,650 Q200,600 600,650 T1400,650 T2000,650 V800 H-200 Z",
                "M-200,670 Q200,620 600,670 T1400,670 T2000,670 V800 H-200 Z",
                "M-200,650 Q200,600 600,650 T1400,650 T2000,650 V800 H-200 Z"
              ]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Onda principal azul */}
          <motion.path
            d="M-200,500 Q200,450 600,500 T1400,500 T2000,500 V800 H-200 Z"
            fill="url(#wave1)"
            animate={{
              d: [
                "M-200,500 Q200,450 600,500 T1400,500 T2000,500 V800 H-200 Z",
                "M-200,520 Q200,470 600,520 T1400,520 T2000,520 V800 H-200 Z",
                "M-200,500 Q200,450 600,500 T1400,500 T2000,500 V800 H-200 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Onda secundaria turquesa */}
          <motion.path
            d="M-200,550 Q200,500 600,550 T1400,550 T2000,550 V800 H-200 Z"
            fill="url(#wave2)"
            animate={{
              d: [
                "M-200,550 Q200,500 600,550 T1400,550 T2000,550 V800 H-200 Z",
                "M-200,530 Q200,480 600,530 T1400,530 T2000,530 V800 H-200 Z",
                "M-200,550 Q200,500 600,550 T1400,550 T2000,550 V800 H-200 Z"
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Onda azul media */}
          <motion.path
            d="M-200,600 Q200,580 600,600 T1400,600 T2000,600 V800 H-200 Z"
            fill="url(#wave3)"
            animate={{
              d: [
                "M-200,600 Q200,580 600,600 T1400,600 T2000,600 V800 H-200 Z",
                "M-200,590 Q200,570 600,590 T1400,590 T2000,590 V800 H-200 Z",
                "M-200,600 Q200,580 600,600 T1400,600 T2000,600 V800 H-200 Z"
              ]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Ondas superiores más sutiles - azul claro */}
          <motion.path
            d="M-200,400 Q200,380 600,400 T1400,400 T2000,400 V800 H-200 Z"
            fill="url(#wave5)"
            animate={{
              d: [
                "M-200,400 Q200,380 600,400 T1400,400 T2000,400 V800 H-200 Z",
                "M-200,420 Q200,400 600,420 T1400,420 T2000,420 V800 H-200 Z",
                "M-200,400 Q200,380 600,400 T1400,400 T2000,400 V800 H-200 Z"
              ]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Onda superior muy sutil */}
          <motion.path
            d="M-200,350 Q200,330 600,350 T1400,350 T2000,350 V800 H-200 Z"
            fill="url(#wave2)"
            fillOpacity="0.2"
            animate={{
              d: [
                "M-200,350 Q200,330 600,350 T1400,350 T2000,350 V800 H-200 Z",
                "M-200,370 Q200,350 600,370 T1400,370 T2000,370 V800 H-200 Z",
                "M-200,350 Q200,330 600,350 T1400,350 T2000,350 V800 H-200 Z"
              ]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </div>

      {/* Burbujas flotantes en tonos azules */}
      {Array.from({ length: 30 }).map((_, i) => {
        const isRed = i % 8 === 0; // Menos burbujas rojas, más azules
        const size = Math.random() * 6 + 2;
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              isRed ? 'bg-red-300/40' : 'bg-blue-300/70'
            }`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`,
              filter: 'blur(0.5px)',
              boxShadow: `0 0 ${size * 2}px ${isRed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.4)'}`
            }}
            animate={{
              y: [-50, -window.innerHeight - 100],
              x: [0, Math.random() * 40 - 20, Math.random() * 30 - 15],
              scale: [0.3, 1, 0.8, 0.2],
              opacity: [0, 0.8, 0.6, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeOut"
            }}
          />
        );
      })}

      {/* Partículas flotantes azules */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-cyan-200/90 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${100 + Math.random() * 10}%`,
            filter: 'blur(0.3px)',
            boxShadow: '0 0 4px rgba(103, 232, 249, 0.6)'
          }}
          animate={{
            y: [0, -window.innerHeight - 50],
            x: [0, Math.random() * 60 - 30],
            opacity: [0, 0.9, 0.5, 0],
            scale: [0.5, 1.2, 0.8, 0.3]
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
        />
      ))}

      {/* Corrientes de agua azules */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`current-${i}`}
          className="absolute w-32 h-1 bg-gradient-to-r from-transparent via-blue-300/30 to-transparent rounded-full"
          style={{
            left: `${Math.random() * 80}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 30 - 15}deg)`
          }}
          animate={{
            x: [-100, window.innerWidth + 100],
            opacity: [0, 0.7, 0.4, 0]
          }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 15,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default WaterBackground;
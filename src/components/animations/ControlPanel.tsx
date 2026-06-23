import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBroadcastChannel } from '../../hooks/useBroadcastChannel';
import { AnimationMessage } from '../../types';
import { Play, RotateCcw, Waves, Tv } from 'lucide-react';

const ControlPanel: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const { sendMessage } = useBroadcastChannel('team-presentation');

  const startAnimation = () => {
    console.log('Control Panel: Starting animation...');
    const message: AnimationMessage = {
      type: 'START_ANIMATION',
      timestamp: Date.now()
    };
    sendMessage(message);
    setIsAnimating(true);
    setLastAction(`Animation Started at ${new Date().toLocaleTimeString()}`);
    
    // Reset after 15 seconds to allow for re-triggering
    setTimeout(() => {
      setIsAnimating(false);
    }, 15000);
  };

  const resetAnimation = () => {
    console.log('Control Panel: Resetting animation...');
    const message: AnimationMessage = {
      type: 'RESET_ANIMATION',
      timestamp: Date.now()
    };
    sendMessage(message);
    setIsAnimating(false);
    setLastAction(`Animation Reset at ${new Date().toLocaleTimeString()}`);
  };

  const openPresentationWindow = () => {
    const width = 1920;
    const height = 1080;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const presentationWindow = window.open(
      `${window.location.origin}${window.location.pathname}#/presentation`,
      'presentation',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
    );
    
    if (presentationWindow) {
      setLastAction(`Presentation Window Opened at ${new Date().toLocaleTimeString()}`);
    } else {
      setLastAction('Failed to open presentation window - check popup blocker');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-2xl w-full"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <Waves className="w-12 h-12 text-cyan-400" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Aquatic Control
              </h1>
              <Waves className="w-12 h-12 text-cyan-400" />
            </div>
            <p className="text-blue-200 text-xl">
              FIRST Tech Challenge - Team Presentation Control Panel
            </p>
          </motion.div>

          {/* Control Panel */}
          <motion.div
            className="bg-gradient-to-br from-blue-800/40 to-blue-900/40 backdrop-blur-lg rounded-3xl p-8 border border-blue-400/30 shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Status */}
            <div className="text-center mb-8">
              <motion.div
                animate={{
                  scale: isAnimating ? [1, 1.1, 1] : 1,
                  color: isAnimating ? "#10B981" : "#06B6D4"
                }}
                transition={{
                  duration: 1,
                  repeat: isAnimating ? Infinity : 0
                }}
                className="text-2xl font-semibold mb-2"
              >
                Status: {isAnimating ? '🟢 Animating' : '🔵 Ready'}
              </motion.div>
              {lastAction && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-blue-300 text-sm"
                >
                  {lastAction}
                </motion.p>
              )}
            </div>

            {/* Main Controls */}
            <div className="space-y-6">
              <motion.button
                onClick={startAnimation}
                disabled={isAnimating}
                className={`w-full py-6 px-8 rounded-2xl font-bold text-2xl transition-all duration-300 ${
                  isAnimating 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-lg hover:shadow-xl'
                }`}
                whileHover={!isAnimating ? { scale: 1.05, y: -2 } : {}}
                whileTap={!isAnimating ? { scale: 0.98 } : {}}
                animate={!isAnimating ? {
                  boxShadow: [
                    '0 10px 30px rgba(16, 185, 129, 0.3)',
                    '0 15px 40px rgba(16, 185, 129, 0.5)',
                    '0 10px 30px rgba(16, 185, 129, 0.3)'
                  ]
                } : {}}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Play className="w-8 h-8" />
                  START TEAM PRESENTATION
                </div>
              </motion.button>

              <motion.button
                onClick={resetAnimation}
                className="w-full py-4 px-8 rounded-2xl font-semibold text-xl bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <RotateCcw className="w-6 h-6" />
                  RESET ANIMATION
                </div>
              </motion.button>

              <motion.button
                onClick={openPresentationWindow}
                className="w-full py-4 px-8 rounded-2xl font-semibold text-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Tv className="w-6 h-6" />
                  OPEN PRESENTATION WINDOW
                </div>
              </motion.button>
            </div>

            {/* Instructions */}
            <motion.div
              className="mt-8 p-6 bg-blue-900/30 rounded-xl border border-blue-400/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <h3 className="text-lg font-semibold text-cyan-300 mb-3">📋 Instructions</h3>
              <ul className="text-blue-200 space-y-2 text-sm">
                <li>• Click "Open Presentation Window" to create a new window for presentations</li>
                <li>• Use "Start Team Presentation" to trigger the animated team introduction</li>
                <li>• The presentation will automatically enter fullscreen mode</li>
                <li>• Use "Reset Animation" to clear the screen and prepare for another run</li>
                <li>• Both windows are synchronized via BroadcastChannel API</li>
                <li>• You can also test the animation directly in the presentation window</li>
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ControlPanel;
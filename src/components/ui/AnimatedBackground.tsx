import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800" />
      
      {/* Subtle geometric shapes */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 opacity-[0.02] dark:opacity-[0.05]"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full border border-gray-400 dark:border-gray-600 rounded-full" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-80 h-80 opacity-[0.02] dark:opacity-[0.05]"
        animate={{
          rotate: [360, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full border border-gray-400 dark:border-gray-600" style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
        }} />
      </motion.div>

      {/* Minimal grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
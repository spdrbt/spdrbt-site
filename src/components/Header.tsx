'use client';

import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative text-center py-8 px-5 spdr-panel border-[#DB231E] overflow-hidden sonar-ring"
    >
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-red-900/20 to-transparent opacity-50" />
      
      {/* Content */}
      <div className="relative z-10">
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="block text-4xl md:text-5xl font-black tracking-wider mb-3 font-mono glow-text text-[#DB231E]"
        >
          SPDR-BT
        </motion.span>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-sm md:text-base text-white uppercase tracking-[3px] font-bold font-mono opacity-95"
        >
          Specialized Public Data Relay
          <br />
          Broadcast Terminal
        </motion.h1>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#DB231E] opacity-50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#DB231E] opacity-50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#DB231E] opacity-50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#DB231E] opacity-50" />
    </motion.header>
  );
}

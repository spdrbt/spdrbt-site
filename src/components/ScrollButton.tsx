'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function ScrollButton() {
  const [isUpMode, setIsUpMode] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      setIsUpMode(scrollPercent >= 20);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleClick() {
    if (isUpMode) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-12 h-12 bg-[rgba(219,35,30,0.9)] border-2 border-[#DB231E] rounded-full cursor-pointer flex items-center justify-center shadow-[0_4px_15px_rgba(219,35,30,0.5)] hover:bg-[#DB231E] transition-colors z-50"
      aria-label={isUpMode ? 'Scroll to top' : 'Scroll to bottom'}
    >
      {isUpMode ? (
        <ChevronUp className="w-6 h-6 text-white" />
      ) : (
        <ChevronDown className="w-6 h-6 text-white" />
      )}
    </motion.button>
  );
}

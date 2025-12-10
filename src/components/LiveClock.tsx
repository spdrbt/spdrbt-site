'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="text-center">
        <div className="skeleton h-12 w-32 mx-auto mb-2 rounded" />
        <div className="skeleton h-6 w-24 mx-auto mb-1 rounded" />
        <div className="skeleton h-5 w-40 mx-auto rounded" />
      </div>
    );
  }

  const time12hr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });

  const time24hr = time.toLocaleTimeString('en-US', {
    hour12: false,
    timeZone: 'America/New_York',
  });

  const date = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-white tracking-wider leading-none">
        {time12hr}
      </div>
      <div className="text-sm text-[#ff8a8a] mt-1 font-mono">
        {time24hr}
      </div>
      <div className="text-sm text-[#ff8a8a] mt-1">
        {date}
      </div>
    </motion.div>
  );
}

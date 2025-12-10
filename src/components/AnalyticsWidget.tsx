'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Map, Globe, Shield, Flame } from 'lucide-react';

interface AnalyticItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export function AnalyticsWidget() {
  const [visitorCount, setVisitorCount] = useState<string>('Connecting...');

  useEffect(() => {
    async function fetchCounter() {
      try {
        const res = await fetch('https://api.counterapi.dev/v1/spdrbt-dashboard-v1/site/up');
        const data = await res.json();
        setVisitorCount(data.count.toLocaleString());
      } catch {
        setVisitorCount('Offline');
      }
    }

    fetchCounter();
  }, []);

  const analytics: AnalyticItem[] = [
    { label: 'Population (Est.)', value: '8.4 Million', icon: <Users className="w-4 h-4" /> },
    { label: 'System Access Count', value: visitorCount, icon: <Eye className="w-4 h-4" /> },
    { label: 'Largest Borough', value: 'Queens', icon: <Map className="w-4 h-4" /> },
    { label: 'Most Populous', value: 'Brooklyn', icon: <Users className="w-4 h-4" /> },
    { label: 'Languages', value: '> 700', icon: <Globe className="w-4 h-4" /> },
    { label: 'Annual Tourists', value: '~62 Million', icon: <Globe className="w-4 h-4" /> },
    { label: 'NYPD Officers', value: '~35,000', icon: <Shield className="w-4 h-4" /> },
    { label: 'FDNY Firefighters', value: '~11,000', icon: <Flame className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spdr-panel p-5 flex flex-col"
    >
      <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg">
        City Analytics
      </h2>

      <ul className="flex-grow flex flex-col justify-around">
        {analytics.map((item, index) => (
          <motion.li
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex justify-between items-center py-2 border-b border-[#4d0000] last:border-b-0"
          >
            <span className="flex items-center gap-2 text-[#ff8a8a]">
              {item.icon}
              {item.label}
            </span>
            <strong className="text-white">{item.value}</strong>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

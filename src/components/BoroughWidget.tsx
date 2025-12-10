'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface BoroughData {
  name: string;
  population: string;
  area: string;
  landmark: string;
  subwayLines: Array<{
    label: string;
    className: string;
  }>;
}

interface BoroughNews {
  title: string;
  link: string;
}

interface BoroughWidgetProps {
  data: BoroughData;
  newsKey: string;
}

const BOROUGH_DATA: Record<string, BoroughData> = {
  manhattan: {
    name: 'Manhattan',
    population: '1.6M',
    area: '23 sq mi',
    landmark: 'Empire State Bldg',
    subwayLines: [
      { label: '1 2 3', className: 'line-123' },
      { label: '4 5 6', className: 'line-456' },
      { label: 'A C E', className: 'line-ACE' },
      { label: 'N Q R W', className: 'line-NQRW' },
    ],
  },
  queens: {
    name: 'Queens',
    population: '2.4M',
    area: '109 sq mi',
    landmark: 'Unisphere',
    subwayLines: [
      { label: '7', className: 'line-7' },
      { label: 'E', className: 'line-ACE' },
      { label: 'F M', className: 'line-BDFM' },
      { label: 'N W', className: 'line-NQRW' },
    ],
  },
  brooklyn: {
    name: 'Brooklyn',
    population: '2.7M',
    area: '71 sq mi',
    landmark: 'Brooklyn Bridge',
    subwayLines: [
      { label: '4 5', className: 'line-456' },
      { label: 'A C', className: 'line-ACE' },
      { label: 'L', className: 'line-L' },
      { label: 'G', className: 'line-G' },
    ],
  },
  bronx: {
    name: 'The Bronx',
    population: '1.4M',
    area: '42 sq mi',
    landmark: 'Yankee Stadium',
    subwayLines: [
      { label: '1 2', className: 'line-123' },
      { label: '4 5 6', className: 'line-456' },
      { label: 'B D', className: 'line-BDFM' },
    ],
  },
  'staten-island': {
    name: 'Staten Island',
    population: '0.5M',
    area: '58 sq mi',
    landmark: 'SI Ferry',
    subwayLines: [
      { label: 'SIR', className: 'line-SIR' },
    ],
  },
};

function BoroughWidgetInner({ data, news }: { data: BoroughData; news: BoroughNews | null }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isMobile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spdr-panel p-5"
    >
      <h2
        onClick={() => isMobile && setIsExpanded(!isExpanded)}
        className={`text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg flex justify-between items-center ${
          isMobile ? 'cursor-pointer' : ''
        }`}
      >
        {data.name}
        {isMobile && (
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        )}
      </h2>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Borough Stats */}
            <ul className="text-sm border-b border-[#555] pb-3 mb-3">
              <li className="flex justify-between mb-1">
                <span className="text-[#ff8a8a]">Population:</span>
                <strong className="text-white">{data.population}</strong>
              </li>
              <li className="flex justify-between mb-1">
                <span className="text-[#ff8a8a]">Area:</span>
                <strong className="text-white">{data.area}</strong>
              </li>
              <li className="flex justify-between">
                <span className="text-[#ff8a8a]">Landmark:</span>
                <strong className="text-white">{data.landmark}</strong>
              </li>
            </ul>

            {/* Subway Lines */}
            <h3 className="text-white text-sm uppercase tracking-wider border-b border-[#555] pb-1 mb-3">
              Major Lines
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {data.subwayLines.map((line) => (
                <span
                  key={line.label}
                  className={`${line.className} text-white font-bold px-3 py-1 rounded-full text-sm`}
                >
                  {line.label}
                </span>
              ))}
            </div>

            {/* Local News */}
            <h3 className="text-white text-sm uppercase tracking-wider border-b border-[#555] pb-1 mb-2">
              Local Headline
            </h3>
            <div className="text-sm text-left">
              {news ? (
                <a
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff8a8a] hover:text-white transition-colors block text-left"
                >
                  {news.title}
                </a>
              ) : (
                <p className="text-[#ff8a8a] text-left">No major local alerts.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function BoroughWidget({ data, newsKey }: BoroughWidgetProps) {
  const [news, setNews] = useState<BoroughNews | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) return;
        const data = await res.json();
        if (data.boroughNews && data.boroughNews[newsKey]) {
          setNews(data.boroughNews[newsKey]);
        }
      } catch (err) {
        console.error('Failed to fetch borough news:', err);
      }
    }

    fetchNews();
  }, [newsKey]);

  return <BoroughWidgetInner data={data} news={news} />;
}

// Pre-configured borough widgets
export function ManhattanWidget() {
  return <BoroughWidget data={BOROUGH_DATA.manhattan} newsKey="manhattan" />;
}

export function QueensWidget() {
  return <BoroughWidget data={BOROUGH_DATA.queens} newsKey="queens" />;
}

export function BrooklynWidget() {
  return <BoroughWidget data={BOROUGH_DATA.brooklyn} newsKey="brooklyn" />;
}

export function BronxWidget() {
  return <BoroughWidget data={BOROUGH_DATA.bronx} newsKey="bronx" />;
}

export function StatenIslandWidget() {
  return <BoroughWidget data={BOROUGH_DATA['staten-island']} newsKey="staten-island" />;
}

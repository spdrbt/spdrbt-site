'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowLeft, Star, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

// Subway line colors
const SUBWAY_LINES: Record<string, { color: string; textColor: string }> = {
  '1': { color: '#EE352E', textColor: '#fff' },
  '2': { color: '#EE352E', textColor: '#fff' },
  '3': { color: '#EE352E', textColor: '#fff' },
  '4': { color: '#00933C', textColor: '#fff' },
  '5': { color: '#00933C', textColor: '#fff' },
  '6': { color: '#00933C', textColor: '#fff' },
  '7': { color: '#B933AD', textColor: '#fff' },
  'A': { color: '#0039A6', textColor: '#fff' },
  'C': { color: '#0039A6', textColor: '#fff' },
  'E': { color: '#0039A6', textColor: '#fff' },
  'B': { color: '#FF6319', textColor: '#fff' },
  'D': { color: '#FF6319', textColor: '#fff' },
  'F': { color: '#FF6319', textColor: '#fff' },
  'M': { color: '#FF6319', textColor: '#fff' },
  'G': { color: '#6CBE45', textColor: '#fff' },
  'L': { color: '#A7A9AC', textColor: '#fff' },
  'J': { color: '#996633', textColor: '#fff' },
  'Z': { color: '#996633', textColor: '#fff' },
  'N': { color: '#FCCC0A', textColor: '#000' },
  'Q': { color: '#FCCC0A', textColor: '#000' },
  'R': { color: '#FCCC0A', textColor: '#000' },
  'W': { color: '#FCCC0A', textColor: '#000' },
};

// Line layout (no S or SIR)
const LINE_ORDER = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', 'G', 'L'],
  ['A', 'C', 'E'],
  ['B', 'D', 'F', 'M'],
  ['N', 'Q', 'R', 'W'],
  ['J', 'Z'],
];

interface Station {
  id: string;
  name: string;
  hasTrainAtStation?: boolean;
  hasTrainArriving?: boolean;
  trainDirection?: string | null;
}

interface LineData {
  line: string;
  color: string;
  textColor: string;
  stations: Station[];
  status: string;
}

interface Arrival {
  line: string;
  direction: string;
  destination: string;
  minutes: number;
  color: string;
  textColor: string;
}

interface StationArrivals {
  stationId: string;
  stationName: string;
  arrivals: Arrival[];
  lastUpdate: string;
}

type ViewType = 'home' | 'line' | 'station';

// Line Badge Component
function LineBadge({ 
  line, 
  size = 'md',
  onClick 
}: { 
  line: string; 
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}) {
  const lineInfo = SUBWAY_LINES[line];
  if (!lineInfo) return null;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center
        font-bold shadow-md transition-all
        ${onClick ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
      `}
      style={{ 
        backgroundColor: lineInfo.color,
        color: lineInfo.textColor,
      }}
    >
      {line}
    </motion.button>
  );
}

// Home View - All Lines
function HomeView({ onSelectLine }: { onSelectLine: (line: string) => void }) {
  return (
    <div className="bg-gray-100 rounded-lg p-6">
      <div className="flex flex-col items-center gap-4">
        {LINE_ORDER.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-3">
            {row.map((lineId) => (
              <LineBadge
                key={lineId}
                line={lineId}
                size="lg"
                onClick={() => onSelectLine(lineId)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Line View - Shows all stations
function LineView({ 
  lineData, 
  onBack, 
  onSelectStation 
}: { 
  lineData: LineData;
  onBack: () => void;
  onSelectStation: (stationId: string) => void;
}) {
  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <LineBadge line={lineData.line} size="md" />
        <div>
          <div 
            className="text-lg font-bold"
            style={{ color: lineData.color }}
          >
            {lineData.status}
          </div>
          <div className="text-sm text-gray-500">
            {lineData.stations.length} stations
          </div>
        </div>
      </div>

      {/* Stations List - fills remaining height */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {lineData.stations.map((station, idx) => {
          const isTerminal = idx === 0 || idx === lineData.stations.length - 1;
          const hasTrainHere = station.hasTrainAtStation;
          const trainArriving = station.hasTrainArriving;
          
          return (
            <motion.button
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                hasTrainHere ? 'bg-green-50' : ''
              }`}
              whileHover={{ x: 4 }}
            >
              {/* Line indicator */}
              <div className="relative flex flex-col items-center">
                {/* Vertical line */}
                <div 
                  className="absolute top-0 bottom-0 w-1"
                  style={{ 
                    backgroundColor: lineData.color,
                    top: idx === 0 ? '50%' : 0,
                    bottom: idx === lineData.stations.length - 1 ? '50%' : 0,
                  }}
                />
                {/* Station dot - GREEN when train is at station */}
                <div 
                  className={`relative z-10 w-4 h-4 rounded-full border-2 transition-all ${
                    hasTrainHere ? 'scale-125' : ''
                  } ${trainArriving ? 'animate-pulse' : ''}`}
                  style={{ 
                    borderColor: hasTrainHere ? '#22c55e' : lineData.color,
                    backgroundColor: hasTrainHere 
                      ? '#22c55e' 
                      : (isTerminal ? lineData.color : '#fff'),
                  }}
                />
                {/* Pulsing ring for train at station */}
                {hasTrainHere && (
                  <div 
                    className="absolute z-0 w-6 h-6 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: '#22c55e' }}
                  />
                )}
              </div>
              
              <span className={`flex-1 text-left font-medium ${
                hasTrainHere ? 'text-green-700' : 'text-gray-800'
              }`}>
                {station.name}
                {hasTrainHere && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
                    🚇 TRAIN HERE
                  </span>
                )}
                {trainArriving && !hasTrainHere && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-orange-500 font-semibold">
                    🚇 arriving
                  </span>
                )}
              </span>
              {/* Direction arrow - right aligned */}
              {hasTrainHere && station.trainDirection === 'North' && (
                <ArrowUp className="w-4 h-4 text-green-600 animate-bounce flex-shrink-0" />
              )}
              {hasTrainHere && station.trainDirection === 'South' && (
                <ArrowDown className="w-4 h-4 text-green-600 animate-bounce flex-shrink-0" />
              )}
              {trainArriving && !hasTrainHere && station.trainDirection === 'North' && (
                <ArrowUp className="w-3 h-3 text-orange-500 flex-shrink-0" />
              )}
              {trainArriving && !hasTrainHere && station.trainDirection === 'South' && (
                <ArrowDown className="w-3 h-3 text-orange-500 flex-shrink-0" />
              )}
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Station View - Shows arrivals
function StationView({ 
  stationData, 
  onBack,
  selectedLine
}: { 
  stationData: StationArrivals;
  onBack: () => void;
  selectedLine: string;
}) {
  const lineInfo = SUBWAY_LINES[selectedLine];
  
  // Group arrivals by direction
  const arrivalsByDirection: Record<string, Arrival[]> = {};
  stationData.arrivals.forEach(arrival => {
    if (!arrivalsByDirection[arrival.direction]) {
      arrivalsByDirection[arrival.direction] = [];
    }
    arrivalsByDirection[arrival.direction].push(arrival);
  });

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 text-center border-b border-gray-200">
        <button
          onClick={onBack}
          className="absolute left-4 top-4 p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h3 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
          {stationData.stationName}
          <Star className="w-5 h-5 text-gray-400 cursor-pointer hover:text-yellow-500" />
        </h3>
        
        <div className="mt-3 flex justify-center">
          <LineBadge line={selectedLine} size="md" />
        </div>
        
        <div 
          className="mt-2 text-lg font-semibold"
          style={{ color: lineInfo?.color }}
        >
          Good Service
        </div>
      </div>

      {/* Arrivals by Direction */}
      <div className="max-h-[350px] overflow-y-auto">
        {Object.entries(arrivalsByDirection).map(([direction, arrivals]) => (
          <div key={direction} className="border-b border-gray-200 last:border-0">
            <div 
              className="px-4 py-2 text-center font-semibold text-lg"
              style={{ color: lineInfo?.color }}
            >
              {direction}
            </div>
            
            {arrivals.slice(0, 4).map((arrival, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 ${
                  idx % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'
                }`}
                style={{
                  backgroundColor: idx % 2 === 0 
                    ? `${lineInfo?.color}15` 
                    : 'transparent'
                }}
              >
                <span className="text-lg font-bold text-gray-700 w-12">
                  {arrival.minutes}m
                </span>
                <LineBadge line={arrival.line} size="sm" />
                <span className="flex-1 text-gray-700">
                  {arrival.destination}
                </span>
              </div>
            ))}
            
            {arrivals.length > 4 && (
              <button className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                show more trains
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Widget
export function SubwayTrackerWidget() {
  const [view, setView] = useState<ViewType>('home');
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [lineData, setLineData] = useState<LineData | null>(null);
  const [stationData, setStationData] = useState<StationArrivals | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch line data
  const fetchLineData = async (line: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subway?line=${line}`);
      if (res.ok) {
        const data = await res.json();
        setLineData(data);
      }
    } catch (err) {
      console.error('[SUBWAY] Error fetching line:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch station arrivals
  const fetchStationData = async (stationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subway?station=${stationId}`);
      if (res.ok) {
        const data = await res.json();
        setStationData(data);
      }
    } catch (err) {
      console.error('[SUBWAY] Error fetching station:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle line selection
  const handleSelectLine = (line: string) => {
    setSelectedLine(line);
    setView('line');
    fetchLineData(line);
  };

  // Handle station selection
  const handleSelectStation = (stationId: string) => {
    setSelectedStation(stationId);
    setView('station');
    fetchStationData(stationId);
  };

  // Handle back navigation
  const handleBack = () => {
    if (view === 'station') {
      setView('line');
      setSelectedStation(null);
      setStationData(null);
    } else if (view === 'line') {
      setView('home');
      setSelectedLine(null);
      setLineData(null);
    }
  };

  // Refresh current data
  const handleRefresh = () => {
    if (view === 'station' && selectedStation) {
      fetchStationData(selectedStation);
    } else if (view === 'line' && selectedLine) {
      fetchLineData(selectedLine);
    }
  };

  // Auto-refresh for line view (train positions)
  useEffect(() => {
    if (view === 'line' && selectedLine) {
      const interval = setInterval(() => {
        fetchLineData(selectedLine);
      }, 15000); // Refresh every 15 seconds for live train positions
      return () => clearInterval(interval);
    }
  }, [view, selectedLine]);

  // Auto-refresh for station view
  useEffect(() => {
    if (view === 'station' && selectedStation) {
      const interval = setInterval(() => {
        fetchStationData(selectedStation);
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [view, selectedStation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spdr-panel p-5 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#7a0000] pb-2 mb-4 flex-shrink-0">
        <h2 className="text-white uppercase tracking-wider text-lg">
          Subway Tracker
        </h2>
        <button
          onClick={handleRefresh}
          className="text-[#ff8a8a] hover:text-white transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content - fills remaining space */}
      <div className="relative flex-1 min-h-0">
        {loading && view !== 'home' && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HomeView onSelectLine={handleSelectLine} />
            </motion.div>
          )}
          
          {view === 'line' && lineData && (
            <motion.div
              key="line"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <LineView
                lineData={lineData}
                onBack={handleBack}
                onSelectStation={handleSelectStation}
              />
            </motion.div>
          )}
          
          {view === 'station' && stationData && selectedLine && (
            <motion.div
              key="station"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <StationView
                stationData={stationData}
                onBack={handleBack}
                selectedLine={selectedLine}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

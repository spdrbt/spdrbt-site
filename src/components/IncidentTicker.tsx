'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Flame, Radio, Volume2, MapPin, Clock, RefreshCw } from 'lucide-react';

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  borough: string;
  status: string;
  created: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const PRIORITY_COLORS = {
  HIGH: 'bg-red-600 text-white',
  MEDIUM: 'bg-orange-500 text-white',
  LOW: 'bg-gray-600 text-gray-200',
};

const PRIORITY_ICONS = {
  HIGH: Flame,
  MEDIUM: AlertTriangle,
  LOW: Radio,
};

const BOROUGH_ABBREV: Record<string, string> = {
  'MANHATTAN': 'MH',
  'BROOKLYN': 'BK',
  'QUEENS': 'QN',
  'BRONX': 'BX',
  'STATEN ISLAND': 'SI',
};

export function IncidentTicker() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
        setLastUpdate(new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }));
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // Refresh every 60 seconds for live updates
    const interval = setInterval(fetchIncidents, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="spdr-panel px-4 py-2 mb-6">
        <div className="flex items-center gap-2 text-[#DB231E]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm font-mono">Loading live incidents...</span>
        </div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return null;
  }

  // Duplicate incidents for seamless loop
  const tickerItems = [...incidents, ...incidents];

  return (
    <div className="spdr-panel px-4 py-2 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#7a0000]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[#DB231E] font-bold text-sm uppercase tracking-wider">LIVE</span>
          </div>
          <span className="text-white font-semibold text-sm">NYC 311 INCIDENTS</span>
          <span className="text-gray-500 text-xs">|</span>
          <span className="text-gray-500 text-xs font-mono">{incidents.length} active</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-gray-500 hover:text-white text-xs"
          >
            [{isPaused ? 'RESUME' : 'PAUSE'}]
          </button>
          <span className="text-gray-600 text-xs font-mono">
            Updated: {lastUpdate}
          </span>
        </div>
      </div>

      {/* Scrolling Ticker */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className={`flex gap-6 whitespace-nowrap ${isPaused ? '' : 'animate-ticker'}`}
          style={{
            animation: isPaused ? 'none' : 'ticker 60s linear infinite',
          }}
        >
          {tickerItems.map((incident, idx) => {
            const Icon = PRIORITY_ICONS[incident.priority];
            const boroughAbbrev = BOROUGH_ABBREV[incident.borough?.toUpperCase()] || incident.borough?.slice(0, 2) || 'NYC';
            
            return (
              <div 
                key={`${incident.id}-${idx}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded border border-gray-800 flex-shrink-0"
              >
                {/* Priority indicator */}
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold ${PRIORITY_COLORS[incident.priority]}`}>
                  <Icon className="w-3 h-3" />
                </div>
                
                {/* Borough badge */}
                <span className="bg-[#7a0000] text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                  {boroughAbbrev}
                </span>
                
                {/* Incident type */}
                <span className="text-white text-sm font-medium">
                  {incident.type}
                </span>
                
                {/* Description if available */}
                {incident.description && (
                  <span className="text-gray-400 text-xs">
                    - {incident.description.slice(0, 30)}{incident.description.length > 30 ? '...' : ''}
                  </span>
                )}
                
                {/* Location */}
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{incident.location?.slice(0, 20) || 'NYC'}</span>
                </div>
                
                {/* Time */}
                <div className="flex items-center gap-1 text-gray-600 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{incident.created}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS for ticker animation */}
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
      `}</style>
    </div>
  );
}

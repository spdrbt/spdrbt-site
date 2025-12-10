'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MapPin, RefreshCw } from 'lucide-react';

interface EmergencyData {
  fdnyIncidents: Array<{
    time: string;
    type: string;
    borough: string;
    severity: 'critical' | 'high' | 'medium';
  }>;
  complaints: Array<{
    time: string;
    type: string;
    address: string;
    borough: string;
    status: string;
  }>;
  stats: {
    total911: number;
    total311: number;
    critical: number;
    openComplaints: number;
  };
}

export function EmergencyWidget() {
  const [data, setData] = useState<EmergencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'911' | '311'>('911');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/emergency');
      const json = await res.json();
      setData(json);
    } catch {
      console.error('Failed to fetch emergency data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-yellow-400 bg-yellow-400/20';
    }
  };

  if (loading) {
    return (
      <div className="spdr-panel p-5">
        <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#DB231E]" />
          Emergency Data
        </h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-10 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spdr-panel p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#7a0000] pb-2 mb-4">
        <h2 className="text-white uppercase tracking-wider text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#DB231E]" />
          Live Emergency Feed
        </h2>
        <button onClick={fetchData} className="text-[#ff8a8a] hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-black/30 p-2 rounded text-center">
          <div className="text-xl font-bold text-red-500">{data?.stats.critical || 0}</div>
          <div className="text-xs text-[#ff8a8a]">Critical</div>
        </div>
        <div className="bg-black/30 p-2 rounded text-center">
          <div className="text-xl font-bold text-orange-400">{data?.stats.total911 || 0}</div>
          <div className="text-xs text-[#ff8a8a]">911 Calls</div>
        </div>
        <div className="bg-black/30 p-2 rounded text-center">
          <div className="text-xl font-bold text-yellow-400">{data?.stats.total311 || 0}</div>
          <div className="text-xs text-[#ff8a8a]">311</div>
        </div>
        <div className="bg-black/30 p-2 rounded text-center">
          <div className="text-xl font-bold text-green-400">{data?.stats.openComplaints || 0}</div>
          <div className="text-xs text-[#ff8a8a]">Open</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveTab('911')}
          className={`flex-1 py-2 rounded font-mono text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
            activeTab === '911' 
              ? 'bg-red-600 text-white' 
              : 'bg-black/30 text-[#ff8a8a] hover:bg-red-900/30'
          }`}
        >
          <Phone className="w-4 h-4" /> 911 Feed
        </button>
        <button
          onClick={() => setActiveTab('311')}
          className={`flex-1 py-2 rounded font-mono text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
            activeTab === '311' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-black/30 text-[#ff8a8a] hover:bg-yellow-900/30'
          }`}
        >
          <MapPin className="w-4 h-4" /> 311 Reports
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[300px] overflow-y-auto space-y-2">
        <AnimatePresence mode="wait">
          {activeTab === '911' ? (
            <motion.div
              key="911"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2"
            >
              {data?.fdnyIncidents.length ? (
                data.fdnyIncidents.map((incident, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-black/30 p-2 rounded flex items-start gap-2"
                  >
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{incident.type}</div>
                      <div className="text-xs text-[#ff8a8a] flex gap-2">
                        <span>{incident.time}</span>
                        <span>• {incident.borough}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-[#ff8a8a] py-4">No recent 911 incidents</div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="311"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2"
            >
              {data?.complaints.length ? (
                data.complaints.map((complaint, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-black/30 p-2 rounded"
                  >
                    <div className="text-white text-sm">{complaint.type}</div>
                    <div className="text-xs text-[#ff8a8a] truncate">{complaint.address}</div>
                    <div className="text-xs text-gray-500 flex gap-2">
                      <span>{complaint.time}</span>
                      <span>• {complaint.borough}</span>
                      <span className={complaint.status === 'Open' ? 'text-yellow-400' : 'text-green-400'}>
                        {complaint.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-[#ff8a8a] py-4">No recent 311 complaints</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

interface Camera {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  area: string;
  isOnline: boolean;
  imageUrl: string;
  source: string;
}

// Featured cameras - Times Square, Roosevelt 74th, and one from each borough
const DEFAULT_CAMERA_IDS = [
  '9565e94d-66f2-4965-9c13-82d5500d6cfd', // Times Square
  '9d7c4525-fba3-4ffe-ae79-f814f7dccf4e', // Roosevelt Ave 74th
  'fa287d30-44a9-48ef-90d6-5ab0a54eab15', // Flatbush Ave
  'a95f7916-24ee-4d7e-bc71-6f9f1e009f23', // Grand Concourse
  '80976618-bbf8-4e7a-8a9d-095f3594244c', // Hylan Blvd
];

// Dynamic import for Leaflet map (client-side only)
const LeafletMap = dynamic(() => import('./LeafletMiniMap'), { 
  ssr: false,
  loading: () => (
    <div className="relative w-full h-40 bg-black/30 border border-gray-800 rounded overflow-hidden mb-3 flex items-center justify-center">
      <span className="text-gray-600 text-xs font-mono">[loading map...]</span>
    </div>
  )
});

export function TrafficCameraWidget() {
  const [allCameras, setAllCameras] = useState<Camera[]>([]);
  const [selectedCameraIds, setSelectedCameraIds] = useState<Set<string>>(new Set(DEFAULT_CAMERA_IDS));
  const [imageKey, setImageKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cameraSize, setCameraSize] = useState(150);

  // Fetch all cameras
  useEffect(() => {
    async function fetchCameras() {
      try {
        const response = await fetch('/api/cameras');
        if (response.ok) {
          const data = await response.json();
          setAllCameras(data.cameras || []);
        }
      } catch (error) {
        console.error('Failed to fetch cameras:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCameras();
  }, []);

  // Auto-refresh images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImageKey(k => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleCamera = useCallback((cameraId: string) => {
    setSelectedCameraIds(prev => {
      const next = new Set(prev);
      if (next.has(cameraId)) {
        next.delete(cameraId);
      } else {
        next.add(cameraId);
      }
      return next;
    });
  }, []);

  const removeCamera = useCallback((cameraId: string) => {
    setSelectedCameraIds(prev => {
      const next = new Set(prev);
      next.delete(cameraId);
      return next;
    });
  }, []);

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Get selected cameras in order
  const selectedCameras = allCameras.filter(c => selectedCameraIds.has(c.id));

  if (loading) {
    return (
      <div className="spdr-panel p-4 lg:col-span-2 font-mono">
        <div className="text-[#DB231E] text-sm">
          <span className="animate-pulse">[SYS] Fetching camera feeds...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="spdr-panel p-4 font-mono text-sm h-full flex flex-col overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#7a0000] pb-2">
        <div className="text-[#DB231E] uppercase tracking-wider">
          NYC Traffic Cameras
        </div>
        {/* Size slider */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-xs">size</span>
          <input
            type="range"
            min="120"
            max="300"
            step="20"
            value={cameraSize}
            onChange={(e) => setCameraSize(parseInt(e.target.value, 10))}
            className="w-16 accent-[#DB231E]"
            style={{ accentColor: '#DB231E' }}
          />
        </div>
      </div>

      {/* Camera Grid */}
      <div className="text-[#DB231E] text-xs mb-3">
        LIVE FEEDS
      </div>
      
      {selectedCameras.length === 0 ? (
        <div className="text-gray-600 text-center py-8 mb-3 flex-1">
          [No cameras selected. Click markers on the map below to add feeds.]
        </div>
      ) : (
        <div 
          className="grid gap-2 mb-3 flex-1 overflow-y-auto min-h-0"
          style={{ 
            gridTemplateColumns: `repeat(auto-fill, minmax(${cameraSize}px, 1fr))`,
            alignContent: 'start',
          }}
        >
          {selectedCameras.map((camera, index) => (
            <div key={camera.id} className="bg-black/50 border border-gray-800 rounded overflow-hidden group">
              <div className="aspect-square md:aspect-video bg-black relative">
                <img
                  key={`${camera.id}-${imageKey}`}
                  src={`${camera.imageUrl}?t=${Date.now()}`}
                  alt={camera.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23111" width="400" height="300"/><text fill="%23333" font-family="monospace" font-size="12" x="50%" y="50%" text-anchor="middle">[FEED_OFFLINE]</text></svg>';
                  }}
                />
                {/* Remove button - shows on hover */}
                <button
                  onClick={() => removeCamera(camera.id)}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-red-900/80 text-gray-500 hover:text-red-400 text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  [x]
                </button>
              </div>
              {/* Info bar - just name */}
              <div className="p-1.5 border-t border-gray-800">
                <div className="text-gray-400 text-[10px] truncate">
                  {camera.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaflet Map - BELOW the feeds */}
      <div className="flex-shrink-0">
        <LeafletMap 
          cameras={allCameras} 
          selectedIds={selectedCameraIds}
          onToggle={toggleCamera}
        />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 mt-auto pt-2 border-t border-gray-800 text-center text-gray-700 text-[10px]">
        Auto-refresh: 5s
      </div>
    </div>
  );
}

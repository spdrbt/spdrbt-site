'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface LeafletMiniMapProps {
  cameras: Camera[];
  selectedIds: Set<string>;
  onToggle: (cameraId: string) => void;
}

// NYC center coordinates
const NYC_CENTER: [number, number] = [40.7128, -73.95];

// Custom pin icon SVG - white default, red when selected
const createPinIcon = (isSelected: boolean) => {
  const fillColor = isSelected ? '#DB231E' : '#ffffff';
  const strokeColor = isSelected ? '#000' : '#DB231E';
  const centerColor = isSelected ? '#fff' : '#DB231E';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4" fill="${centerColor}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-pin-icon',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
};

// Custom cluster icon
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = 30;
  let fontSize = 12;
  
  if (count > 100) {
    size = 50;
    fontSize = 14;
  } else if (count > 50) {
    size = 45;
    fontSize = 13;
  } else if (count > 20) {
    size = 40;
    fontSize = 12;
  } else if (count > 10) {
    size = 35;
    fontSize = 11;
  }
  
  return L.divIcon({
    html: `<div class="cluster-marker" style="width:${size}px;height:${size}px;font-size:${fontSize}px;">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size, true),
  });
};

function MapController() {
  const map = useMap();
  
  useEffect(() => {
    // Enable zoom and pan for the full map
    map.scrollWheelZoom.enable();
    map.dragging.enable();
    map.doubleClickZoom.enable();
  }, [map]);
  
  return null;
}

export default function LeafletMiniMap({ cameras, selectedIds, onToggle }: LeafletMiniMapProps) {
  const selectedCount = selectedIds.size;
  
  return (
    <div className="relative w-full h-64 bg-black/30 border border-gray-800 rounded overflow-hidden mb-3">
      {/* Title overlay */}
      <div className="absolute top-2 left-2 z-[1000] text-xs font-mono text-gray-700 bg-white/80 px-2 py-1 rounded shadow">
        NYC DOT CAMS
      </div>
      
      {/* Camera count */}
      <div className="absolute bottom-2 right-2 z-[1000] text-xs font-mono text-gray-700 bg-white/80 px-2 py-1 rounded shadow">
        {cameras.length} total • {selectedCount} pinned
      </div>
      
      {/* Instructions */}
      <div className="absolute top-2 right-2 z-[1000] text-xs font-mono text-gray-700 bg-white/80 px-2 py-1 rounded shadow">
        click markers to view
      </div>
      
      <MapContainer
        center={NYC_CENTER}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Light OpenStreetMap style */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {/* Render all cameras */}
          {cameras.map((camera) => {
            const isSelected = selectedIds.has(camera.id);
            
            return (
              <Marker
                key={camera.id}
                position={[camera.latitude, camera.longitude]}
                icon={createPinIcon(isSelected)}
                eventHandlers={{
                  click: () => onToggle(camera.id)
                }}
              >
              <Popup>
                <div className="font-mono text-xs p-1 min-w-40">
                  <div className="font-bold text-white mb-1">{camera.name}</div>
                  <div className="text-gray-300 mb-2">{camera.area} | {camera.source}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(camera.id);
                      }}
                      className={`w-full px-2 py-1 rounded text-xs border transition-colors ${
                        isSelected 
                          ? 'border-red-600 text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'border-red-600 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {isSelected ? '[CLOSE]' : '[VIEW]'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

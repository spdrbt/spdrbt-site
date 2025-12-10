'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowLeft, ChevronRight, ArrowUp, ArrowDown, Train, Bus, Clock } from 'lucide-react';

// ================== SHARED TYPES & CONSTANTS ==================

type TabType = 'subway' | 'bus';
type SubwayViewType = 'home' | 'line' | 'station';
type BusViewType = 'home' | 'route' | 'stop';

// Borough order for buses: Manhattan, Queens, Brooklyn, Bronx, SI
const BOROUGH_ORDER = ['Manhattan', 'Queens', 'Brooklyn', 'Bronx', 'StatenIsland'];

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

// Borough colors for bus
const BOROUGH_COLORS: Record<string, { color: string; textColor: string }> = {
  'Manhattan': { color: '#0039A6', textColor: '#fff' },
  'Brooklyn': { color: '#FF6319', textColor: '#fff' },
  'Queens': { color: '#B933AD', textColor: '#fff' },
  'Bronx': { color: '#00933C', textColor: '#fff' },
  'StatenIsland': { color: '#EE352E', textColor: '#fff' },
};

// ================== INTERFACES ==================

interface SubwayStation {
  id: string;
  name: string;
  hasTrainAtStation?: boolean;
  hasTrainArriving?: boolean;
  trainDirection?: string | null;
}

interface SubwayLineData {
  line: string;
  color: string;
  textColor: string;
  stations: SubwayStation[];
  status: string;
}

interface BusRoute {
  id: string;
  name: string;
  color: string;
  textColor: string;
  borough: string;
}

interface BusVehicle {
  vehicleId: string;
  latitude: number;
  longitude: number;
  bearing: number;
  destination: string;
  nextStop: string;
  distanceFromStop: string;
  progress: string;
  direction: string;
}

interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  direction: string;
}

interface BusRouteData {
  route: string;
  fullRouteId: string;
  color: string;
  textColor: string;
  vehicles: BusVehicle[];
  stops: BusStop[];
}

interface StationArrival {
  line: string;
  direction: string;
  destination: string;
  minutes: number;
  color: string;
  textColor: string;
}

interface StationArrivalsData {
  stationId: string;
  stationName: string;
  arrivals: StationArrival[];
  lastUpdate: string;
}

// ================== SUBWAY COMPONENTS ==================

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
    lg: 'w-14 h-14 text-2xl',
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

function SubwayHomeView({ onSelectLine }: { onSelectLine: (line: string) => void }) {
  return (
    <div className="bg-gray-100 rounded-lg p-6 h-full flex flex-col justify-center">
      <div className="flex flex-col items-center justify-center gap-4 flex-1">
        {LINE_ORDER.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-3">
            {row.map((lineId) => {
              const lineInfo = SUBWAY_LINES[lineId];
              return (
                <motion.button
                  key={lineId}
                  onClick={() => onSelectLine(lineId)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 text-3xl rounded-full flex items-center justify-center font-bold shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  style={{ 
                    backgroundColor: lineInfo?.color,
                    color: lineInfo?.textColor,
                  }}
                >
                  {lineId}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubwayLineView({ 
  lineData, 
  onBack, 
  onSelectStation 
}: { 
  lineData: SubwayLineData;
  onBack: () => void;
  onSelectStation: (stationId: string) => void;
}) {
  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-3 flex items-center gap-3 border-b border-gray-200 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-200 rounded-full">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <LineBadge line={lineData.line} size="sm" />
        <div>
          <div className="text-sm font-bold" style={{ color: lineData.color }}>
            {lineData.status}
          </div>
          <div className="text-xs text-gray-500">{lineData.stations.length} stations</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {lineData.stations.map((station, idx) => {
          const isTerminal = idx === 0 || idx === lineData.stations.length - 1;
          const hasTrainHere = station.hasTrainAtStation;
          const trainArriving = station.hasTrainArriving;
          
          return (
            <motion.button
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className={`w-full flex items-center gap-2 p-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                hasTrainHere ? 'bg-green-50' : ''
              }`}
              whileHover={{ x: 2 }}
            >
              <div className="relative flex flex-col items-center">
                <div 
                  className="absolute top-0 bottom-0 w-1"
                  style={{ 
                    backgroundColor: lineData.color,
                    top: idx === 0 ? '50%' : 0,
                    bottom: idx === lineData.stations.length - 1 ? '50%' : 0,
                  }}
                />
                <div 
                  className={`relative z-10 w-3 h-3 rounded-full border-2 ${
                    hasTrainHere ? 'scale-125' : ''
                  } ${trainArriving ? 'animate-pulse' : ''}`}
                  style={{ 
                    borderColor: hasTrainHere ? '#22c55e' : lineData.color,
                    backgroundColor: hasTrainHere ? '#22c55e' : (isTerminal ? lineData.color : '#fff'),
                  }}
                />
              </div>
              
              <span className={`flex-1 text-left text-sm font-medium ${
                hasTrainHere ? 'text-green-700' : 'text-gray-800'
              }`}>
                {station.name}
              </span>
              
              {/* Train at station indicator with direction */}
              {hasTrainHere && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500 text-white text-xs font-bold rounded animate-pulse">
                  <Train className="w-3 h-3" />
                  <span>TRAIN HERE</span>
                  {station.trainDirection === 'North' && <ArrowUp className="w-3 h-3" />}
                  {station.trainDirection === 'South' && <ArrowDown className="w-3 h-3" />}
                </span>
              )}
              
              {/* Train arriving indicator with direction */}
              {trainArriving && !hasTrainHere && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-400 text-white text-xs font-medium rounded">
                  <span>ARRIVING</span>
                  {station.trainDirection === 'North' && <ArrowUp className="w-3 h-3" />}
                  {station.trainDirection === 'South' && <ArrowDown className="w-3 h-3" />}
                </span>
              )}
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Station arrivals view
function SubwayStationView({ 
  stationData, 
  onBack 
}: { 
  stationData: StationArrivalsData;
  onBack: () => void;
}) {
  // Group arrivals by direction
  const groupedArrivals = stationData.arrivals.reduce((acc, arrival) => {
    if (!acc[arrival.direction]) acc[arrival.direction] = [];
    acc[arrival.direction].push(arrival);
    return acc;
  }, {} as Record<string, StationArrival[]>);

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-3 flex items-center gap-3 border-b border-gray-200 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-200 rounded-full">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="text-sm font-bold text-gray-800">{stationData.stationName}</div>
          <div className="text-xs text-gray-500">Upcoming arrivals</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {stationData.arrivals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Clock className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-sm">No trains scheduled</p>
          </div>
        ) : (
          Object.entries(groupedArrivals).map(([direction, arrivals]) => (
            <div key={direction} className="mb-4 last:mb-0">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                {direction.includes('Uptown') || direction.includes('Manhattan') || direction.includes('North') ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {direction}
              </div>
              <div className="space-y-1">
                {arrivals.slice(0, 5).map((arrival, idx) => (
                  <div 
                    key={`${arrival.line}-${idx}`}
                    className="flex items-center gap-2 p-2 bg-white rounded shadow-sm"
                  >
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: arrival.color, color: arrival.textColor }}
                    >
                      {arrival.line}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        → {arrival.destination}
                      </div>
                    </div>
                    <div className={`text-right flex-shrink-0 ${
                      arrival.minutes <= 1 
                        ? 'text-green-600 font-bold animate-pulse' 
                        : arrival.minutes <= 3 
                          ? 'text-orange-500 font-semibold' 
                          : 'text-gray-600'
                    }`}>
                      {arrival.minutes <= 0 ? (
                        <span className="text-sm">NOW</span>
                      ) : arrival.minutes === 1 ? (
                        <span className="text-sm">1 min</span>
                      ) : (
                        <span className="text-sm">{arrival.minutes} min</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ================== BUS COMPONENTS ==================

function BusRouteBadge({ 
  route, 
  color,
  textColor,
  size = 'md',
  onClick 
}: { 
  route: string; 
  color: string;
  textColor: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeClasses[size]} rounded-md flex items-center justify-center
        font-bold shadow-md transition-all
        ${onClick ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
      `}
      style={{ backgroundColor: color, color: textColor }}
    >
      {route}
    </motion.button>
  );
}

function BusHomeView({ 
  routes, 
  onSelectRoute,
  onSelectBorough,
  selectedBorough 
}: { 
  routes: BusRoute[];
  onSelectRoute: (routeId: string) => void;
  onSelectBorough: (borough: string | null) => void;
  selectedBorough: string | null;
}) {
  // Group routes by borough in order
  const routesByBorough = BOROUGH_ORDER.reduce((acc, borough) => {
    acc[borough] = routes
      .filter(r => r.borough === borough)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    return acc;
  }, {} as Record<string, BusRoute[]>);

  return (
    <div className="bg-gray-100 rounded-lg p-3 flex flex-col h-full">
      {/* Borough tabs */}
      <div className="flex flex-wrap gap-1 mb-3 flex-shrink-0">
        <button
          onClick={() => onSelectBorough(null)}
          className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
            !selectedBorough ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {BOROUGH_ORDER.map(borough => (
          <button
            key={borough}
            onClick={() => onSelectBorough(borough)}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              selectedBorough === borough 
                ? 'text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            style={selectedBorough === borough ? { backgroundColor: BOROUGH_COLORS[borough].color } : {}}
          >
            {borough === 'StatenIsland' ? 'SI' : borough.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Routes organized by borough */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {BOROUGH_ORDER.map(borough => {
          // Skip if filtering by different borough
          if (selectedBorough && selectedBorough !== borough) return null;
          
          const boroughRoutes = routesByBorough[borough] || [];
          if (boroughRoutes.length === 0) return null;
          
          return (
            <div key={borough} className="mb-3 last:mb-0">
              {/* Borough section header */}
              <div 
                className="text-xs font-semibold uppercase mb-1.5 px-1 flex items-center gap-1"
                style={{ color: BOROUGH_COLORS[borough].color }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: BOROUGH_COLORS[borough].color }}
                />
                {borough === 'StatenIsland' ? 'Staten Island' : borough}
                <span className="text-gray-400 font-normal">({boroughRoutes.length})</span>
              </div>
              {/* Borough routes */}
              <div className="flex flex-wrap gap-1.5">
                {boroughRoutes.map(route => (
                  <BusRouteBadge
                    key={route.id}
                    route={route.name}
                    color={route.color}
                    textColor={route.textColor}
                    size="sm"
                    onClick={() => onSelectRoute(route.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BusRouteView({ 
  routeData, 
  onBack 
}: { 
  routeData: BusRouteData;
  onBack: () => void;
}) {
  // Group buses by direction
  const vehiclesByDirection = routeData.vehicles.reduce((acc, v) => {
    const dir = v.direction || 'Unknown';
    if (!acc[dir]) acc[dir] = [];
    acc[dir].push(v);
    return acc;
  }, {} as Record<string, BusVehicle[]>);

  // Find which stops have buses nearby
  const getStopStatus = (stopName: string) => {
    for (const vehicle of routeData.vehicles) {
      if (vehicle.nextStop?.toLowerCase().includes(stopName.toLowerCase().slice(0, 10))) {
        const dist = vehicle.distanceFromStop;
        if (dist) {
          const meters = parseFloat(dist);
          if (!isNaN(meters)) {
            if (meters < 100) return { status: 'arriving', vehicle };
            if (meters < 500) return { status: 'approaching', vehicle };
          }
        }
        return { status: 'enroute', vehicle };
      }
    }
    return null;
  };

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-3 flex items-center gap-3 border-b border-gray-200 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-200 rounded-full">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <BusRouteBadge 
          route={routeData.route} 
          color={routeData.color} 
          textColor={routeData.textColor}
          size="md" 
        />
        <div>
          <div className="text-sm font-bold" style={{ color: routeData.color }}>
            {routeData.vehicles.length} buses active
          </div>
          <div className="text-xs text-gray-500">{routeData.stops.length} stops</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Active buses by direction */}
        {Object.entries(vehiclesByDirection).map(([direction, vehicles]) => (
          <div key={direction} className="p-2 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
              {direction.includes('0') || direction.includes('inbound') ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {direction} ({vehicles.length} {vehicles.length === 1 ? 'bus' : 'buses'})
            </div>
            {vehicles.map((vehicle, idx) => (
              <div 
                key={vehicle.vehicleId}
                className="flex items-center gap-2 p-2 rounded bg-white/50 mb-1 last:mb-0"
              >
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded animate-pulse" style={{ backgroundColor: routeData.color }}>
                  <Bus className="w-3 h-3 text-white" />
                  {vehicle.direction?.includes('0') || vehicle.direction?.includes('inbound') ? (
                    <ArrowUp className="w-3 h-3 text-white" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    → {vehicle.destination}
                  </div>
                  {vehicle.nextStop && (
                    <div className="text-xs text-gray-500">
                      Next: {vehicle.nextStop}
                      {vehicle.distanceFromStop && (
                        <span className="ml-1 text-gray-400">
                          ({Math.round(parseFloat(vehicle.distanceFromStop))}m away)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-green-600 animate-pulse">LIVE</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Stops with bus indicators */}
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 mb-2">STOPS ({routeData.stops.length})</div>
          {routeData.stops.map((stop, idx) => {
            const stopStatus = getStopStatus(stop.name);
            const isTerminal = idx === 0 || idx === routeData.stops.length - 1;
            
            return (
              <div 
                key={stop.id}
                className={`flex items-center gap-2 p-1.5 rounded ${
                  stopStatus?.status === 'arriving' ? 'bg-green-50' : 
                  stopStatus?.status === 'approaching' ? 'bg-orange-50' : 
                  'hover:bg-gray-50'
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div 
                    className="absolute top-0 bottom-0 w-0.5"
                    style={{ 
                      backgroundColor: routeData.color,
                      top: idx === 0 ? '50%' : 0,
                      bottom: idx === routeData.stops.length - 1 ? '50%' : 0,
                    }}
                  />
                  <div 
                    className={`relative z-10 w-2.5 h-2.5 rounded-full border-2 ${
                      stopStatus?.status === 'arriving' ? 'scale-125' : ''
                    }`}
                    style={{ 
                      borderColor: stopStatus?.status === 'arriving' ? '#22c55e' : routeData.color,
                      backgroundColor: stopStatus?.status === 'arriving' ? '#22c55e' : (isTerminal ? routeData.color : '#fff'),
                    }}
                  />
                </div>
                
                <span className={`flex-1 text-xs font-medium ${
                  stopStatus?.status === 'arriving' ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {stop.name}
                </span>
                
                {/* Bus arriving indicator */}
                {stopStatus?.status === 'arriving' && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded animate-pulse">
                    <Bus className="w-3 h-3" />
                    <span>ARRIVING</span>
                    {stopStatus.vehicle.direction?.includes('0') ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </span>
                )}
                
                {/* Bus approaching indicator */}
                {stopStatus?.status === 'approaching' && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-400 text-white text-[10px] font-medium rounded">
                    <span>~{Math.round(parseFloat(stopStatus.vehicle.distanceFromStop || '0'))}m</span>
                    {stopStatus.vehicle.direction?.includes('0') ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ================== MAIN WIDGET ==================

export function MTATrackerWidget() {
  const [activeTab, setActiveTab] = useState<TabType>('subway');
  const [loading, setLoading] = useState(false);
  
  // Subway state
  const [subwayView, setSubwayView] = useState<SubwayViewType>('home');
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [lineData, setLineData] = useState<SubwayLineData | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [stationData, setStationData] = useState<StationArrivalsData | null>(null);
  
  // Bus state
  const [busView, setBusView] = useState<BusViewType>('home');
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [selectedBusRoute, setSelectedBusRoute] = useState<string | null>(null);
  const [busRouteData, setBusRouteData] = useState<BusRouteData | null>(null);

  // Fetch subway line data
  const fetchSubwayLine = async (line: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subway?line=${line}`);
      if (res.ok) {
        const data = await res.json();
        setLineData(data);
      }
    } catch (err) {
      console.error('[MTA] Error fetching subway line:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bus routes
  const fetchBusRoutes = async () => {
    try {
      const res = await fetch('/api/bus');
      if (res.ok) {
        const data = await res.json();
        setBusRoutes(data.routes || []);
      }
    } catch (err) {
      console.error('[MTA] Error fetching bus routes:', err);
    }
  };

  // Fetch station arrivals
  const fetchStationArrivals = async (stationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subway?station=${stationId}`);
      if (res.ok) {
        const data = await res.json();
        setStationData(data);
      }
    } catch (err) {
      console.error('[MTA] Error fetching station arrivals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bus route data
  const fetchBusRoute = async (route: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bus?route=${route}`);
      if (res.ok) {
        const data = await res.json();
        setBusRouteData(data);
      }
    } catch (err) {
      console.error('[MTA] Error fetching bus route:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load bus routes on mount
  useEffect(() => {
    fetchBusRoutes();
  }, []);

  // Auto-refresh subway data
  useEffect(() => {
    if (activeTab === 'subway' && subwayView === 'line' && selectedLine) {
      const interval = setInterval(() => {
        fetchSubwayLine(selectedLine);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab, subwayView, selectedLine]);

  // Handle subway line selection
  const handleSelectLine = (line: string) => {
    setSelectedLine(line);
    setSubwayView('line');
    fetchSubwayLine(line);
  };

  // Handle subway back
  const handleSubwayBack = () => {
    if (subwayView === 'station') {
      setSubwayView('line');
      setSelectedStation(null);
      setStationData(null);
    } else {
      setSubwayView('home');
      setSelectedLine(null);
      setLineData(null);
    }
  };

  // Handle station selection
  const handleSelectStation = (stationId: string) => {
    setSelectedStation(stationId);
    setSubwayView('station');
    fetchStationArrivals(stationId);
  };

  // Handle bus route selection
  const handleSelectBusRoute = (routeId: string) => {
    setSelectedBusRoute(routeId);
    setBusView('route');
    fetchBusRoute(routeId);
  };

  // Handle bus back
  const handleBusBack = () => {
    setBusView('home');
    setSelectedBusRoute(null);
    setBusRouteData(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === 'subway' && selectedLine) {
      fetchSubwayLine(selectedLine);
    } else if (activeTab === 'bus' && selectedBusRoute) {
      fetchBusRoute(selectedBusRoute);
    } else if (activeTab === 'bus') {
      fetchBusRoutes();
    }
  };

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Reset views when switching tabs
    if (tab === 'subway') {
      setBusView('home');
      setSelectedBusRoute(null);
      setBusRouteData(null);
    } else {
      setSubwayView('home');
      setSelectedLine(null);
      setLineData(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spdr-panel p-4 h-full flex flex-col"
    >
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b-2 border-[#7a0000] pb-2 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-white uppercase tracking-wider text-sm font-semibold">
            MTA Tracker
          </h2>
          {/* Tabs */}
          <div className="flex ml-3 bg-black/30 rounded-md p-0.5">
            <button
              onClick={() => handleTabChange('subway')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'subway' 
                  ? 'bg-[#7a0000] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Train className="w-3 h-3" />
              Subway
            </button>
            <button
              onClick={() => handleTabChange('bus')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'bus' 
                  ? 'bg-[#7a0000] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bus className="w-3 h-3" />
              Bus
            </button>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="text-[#ff8a8a] hover:text-white transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-1 min-h-0">
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {/* SUBWAY TAB */}
          {activeTab === 'subway' && (
            <motion.div
              key="subway"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {subwayView === 'home' && (
                <SubwayHomeView onSelectLine={handleSelectLine} />
              )}
              {subwayView === 'line' && lineData && (
                <SubwayLineView
                  lineData={lineData}
                  onBack={handleSubwayBack}
                  onSelectStation={handleSelectStation}
                />
              )}
              {subwayView === 'station' && stationData && (
                <SubwayStationView
                  stationData={stationData}
                  onBack={handleSubwayBack}
                />
              )}
            </motion.div>
          )}

          {/* BUS TAB */}
          {activeTab === 'bus' && (
            <motion.div
              key="bus"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {busView === 'home' && (
                <BusHomeView 
                  routes={busRoutes}
                  onSelectRoute={handleSelectBusRoute}
                  onSelectBorough={setSelectedBorough}
                  selectedBorough={selectedBorough}
                />
              )}
              {busView === 'route' && busRouteData && (
                <BusRouteView
                  routeData={busRouteData}
                  onBack={handleBusBack}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

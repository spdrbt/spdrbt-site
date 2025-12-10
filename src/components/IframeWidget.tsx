'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface IframeWidgetProps {
  title: string;
  src: string;
  height?: string;
  className?: string;
  scale?: number;
}

export function IframeWidget({ 
  title, 
  src, 
  height = '600px', 
  className = '',
  scale
}: IframeWidgetProps) {
  const [loading, setLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`spdr-panel p-5 flex flex-col ${className}`}
    >
      <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg">
        {title}
      </h2>

      <div 
        className="relative bg-white rounded-lg overflow-hidden flex-grow"
        style={{ minHeight: height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#190000]">
            <Loader2 className="w-8 h-8 text-[#ff5c5c] animate-spin" />
          </div>
        )}
        <div 
          className="w-full h-full"
          style={{ 
            position: 'relative',
            overflow: 'hidden',
            minHeight: height 
          }}
        >
          <iframe
            src={src}
            title={title}
            loading="lazy"
            onLoad={() => setLoading(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: scale ? `${100 / scale}%` : '100%',
              height: scale ? `${100 / scale}%` : '100%',
              border: 'none',
              transform: scale ? `scale(${scale})` : undefined,
              transformOrigin: '0 0',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Re-export MTA Tracker Widget (combines Subway + Bus)
export { MTATrackerWidget as MTATracker } from './MTATrackerWidget';

// Legacy export for backwards compatibility
export { SubwayTrackerWidget as SubwayTracker } from './SubwayTrackerWidget';

export function TrafficOverview() {
  return (
    <IframeWidget
      title="NYC Traffic Overview"
      src="https://embed.waze.com/iframe?zoom=10&lat=40.7589&lon=-73.9851&ct=livemap"
      height="550px"
      className="h-full"
    />
  );
}

export function TrafficCameras() {
  return (
    <IframeWidget
      title="Live Traffic Cameras"
      src="https://pig.observer/nyc/#1105,1002,1166,318"
      height="450px"
      scale={0.59}
    />
  );
}

export function AirTraffic() {
  return (
    <IframeWidget
      title="Air Traffic Overview"
      src="https://www.airnavradar.com/?widget=1&z=11&lat=40.71199&lng=-73.92515"
      height="600px"
    />
  );
}

export function MaritimeTraffic() {
  return (
    <IframeWidget
      title="Maritime Transponder"
      src="https://www.marinetraffic.com/en/ais/embed/zoom:11/centery:40.65/centerx:-74.02/maptype:1/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:/vessel:/"
      height="600px"
    />
  );
}

export function CommunityBoard() {
  return (
    <IframeWidget
      title="Community Web"
      src="https://padlet.com/embed/poc4p95l4ky5byx9"
      height="608px"
    />
  );
}

export function TransitPlanner() {
  return (
    <IframeWidget
      title="Transit Planner"
      src="https://citymapper.com/nyc?set_region=us-nyc"
      height="500px"
    />
  );
}

export function SPDRBTMap() {
  return (
    <IframeWidget
      title="sPDRBTs FOUND"
      src="https://lookerstudio.google.com/embed/reporting/298aa81b-2e6d-448e-be0b-a4261b8392b7/page/7oYTF"
      height="1200px"
      scale={0.9}
    />
  );
}

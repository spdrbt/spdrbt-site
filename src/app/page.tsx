import { Header } from '@/components/Header';
import { NewsWidget } from '@/components/NewsWidget';
import { WeatherWidget } from '@/components/WeatherWidget';
import { AnalyticsWidget } from '@/components/AnalyticsWidget';
import { TrafficCameraWidget } from '@/components/TrafficCameraWidget';
import { 
  MTATracker, 
  TrafficOverview, 
  AirTraffic,
  MaritimeTraffic,
  CommunityBoard,
  TransitPlanner,
  SPDRBTMap
} from '@/components/IframeWidget';
import { 
  ManhattanWidget, 
  QueensWidget, 
  BrooklynWidget, 
  BronxWidget, 
  StatenIslandWidget 
} from '@/components/BoroughWidget';
import { Manifesto } from '@/components/Manifesto';
import { ScrollButton } from '@/components/ScrollButton';

export default function Home() {
  return (
    <main className="min-h-screen grid-bg p-6 max-w-[1400px] mx-auto">
      {/* CRT Overlay for terminal effect */}
      <div className="crt-overlay" />

      {/* Header */}
      <Header />

      {/* Section Title */}
      <h2 className="text-white uppercase tracking-wider text-xl mb-6 border-b-2 border-[#7a0000] pb-2">
        NYC Overview
      </h2>

      {/* Main Grid - News, Weather, Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NewsWidget />
        <WeatherWidget />
        <AnalyticsWidget />
      </div>

      {/* Traffic Cameras - Custom NYC DOT Widget */}
      <h2 className="text-white uppercase tracking-wider text-xl mt-10 mb-6 border-b-2 border-[#7a0000] pb-2">
        Live Traffic Cameras
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: '650px' }}>
        <div className="lg:col-span-2 h-full overflow-hidden">
          <TrafficCameraWidget />
        </div>
        <div className="h-full overflow-hidden">
          <MTATracker />
        </div>
      </div>

      {/* Traffic + Air Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <TrafficOverview />
        <div className="lg:col-span-2">
          <AirTraffic />
        </div>
      </div>

      {/* Maritime */}
      <div className="mt-6">
        <MaritimeTraffic />
      </div>

      {/* Community Board - Full Width */}
      <div className="mt-6">
        <CommunityBoard />
      </div>

      {/* Transit Planner */}
      <div className="mt-6">
        <TransitPlanner />
      </div>

      {/* Boroughs Section */}
      <h2 className="text-white uppercase tracking-wider text-xl mt-10 mb-6 border-b-2 border-[#7a0000] pb-2">
        Boroughs
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <ManhattanWidget />
        <QueensWidget />
        <BrooklynWidget />
        <BronxWidget />
        <StatenIslandWidget />
      </div>

      {/* SPDRBT Map */}
      <h2 className="text-white uppercase tracking-wider text-xl mt-10 mb-6 border-b-2 border-[#7a0000] pb-2">
        sPDRBTs FOUND
      </h2>
      <SPDRBTMap />

      {/* Manifesto */}
      <Manifesto />

      {/* Scroll Button */}
      <ScrollButton />
    </main>
  );
}

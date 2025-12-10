import { NextResponse } from 'next/server';

// MTA Bus Time API 
const MTA_BUS_API_KEY = process.env.MTA_BUS_API_KEY || '';
const OBA_API_BASE = 'https://bustime.mta.info/api/where';
const SIRI_API_BASE = 'https://bustime.mta.info/api/siri';

// Bus route colors by borough/type
const BUS_COLORS: Record<string, { color: string; textColor: string }> = {
  'M': { color: '#0039A6', textColor: '#fff' },
  'Bx': { color: '#00933C', textColor: '#fff' },
  'B': { color: '#FF6319', textColor: '#fff' },
  'Q': { color: '#B933AD', textColor: '#fff' },
  'S': { color: '#6CBE45', textColor: '#fff' },
  'X': { color: '#EE352E', textColor: '#fff' },
  'SIM': { color: '#EE352E', textColor: '#fff' },
};

function getBusColor(routeId: string): { color: string; textColor: string } {
  if (routeId.startsWith('SIM')) return BUS_COLORS['SIM'];
  if (routeId.startsWith('X')) return BUS_COLORS['X'];
  if (routeId.startsWith('Bx')) return BUS_COLORS['Bx'];
  for (const prefix of ['M', 'B', 'Q', 'S']) {
    if (routeId.startsWith(prefix)) return BUS_COLORS[prefix];
  }
  return { color: '#666', textColor: '#fff' };
}

function getBoroughFromRoute(routeId: string): string {
  if (routeId.startsWith('SIM') || routeId.startsWith('X')) return 'Express';
  if (routeId.startsWith('Bx')) return 'Bronx';
  if (routeId.startsWith('M')) return 'Manhattan';
  if (routeId.startsWith('B')) return 'Brooklyn';
  if (routeId.startsWith('Q')) return 'Queens';
  if (routeId.startsWith('S')) return 'StatenIsland';
  return 'Other';
}

interface BusRoute {
  id: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  borough: string;
}

interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  direction: string;
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

// Cache for routes
let routesCache: { data: BusRoute[]; timestamp: number } | null = null;
const ROUTES_CACHE_TTL = 3600000; // 1 hour

// Get all routes from OneBusAway API
async function getAllRoutes(): Promise<BusRoute[]> {
  // Check cache
  if (routesCache && Date.now() - routesCache.timestamp < ROUTES_CACHE_TTL) {
    return routesCache.data;
  }

  if (!MTA_BUS_API_KEY) {
    console.error('[BUS] No MTA_BUS_API_KEY configured');
    return [];
  }

  try {
    // Get routes for MTA NYCT (NYC Transit buses)
    const nycUrl = `${OBA_API_BASE}/routes-for-agency/MTA%20NYCT.json?key=${MTA_BUS_API_KEY}`;
    const mtabcUrl = `${OBA_API_BASE}/routes-for-agency/MTABC.json?key=${MTA_BUS_API_KEY}`;

    const [nycRes, mtabcRes] = await Promise.all([
      fetch(nycUrl, { next: { revalidate: 3600 } }),
      fetch(mtabcUrl, { next: { revalidate: 3600 } }),
    ]);

    const routes: BusRoute[] = [];

    if (nycRes.ok) {
      const nycData = await nycRes.json();
      const nycRoutes = nycData?.data?.list || nycData?.data?.routes || [];
      for (const route of nycRoutes) {
        const shortName = route.shortName || route.id?.split('_')[1] || '';
        if (!shortName) continue;
        
        const colorInfo = getBusColor(shortName);
        routes.push({
          id: route.id || `MTA NYCT_${shortName}`,
          shortName,
          longName: route.longName || route.description || shortName,
          color: colorInfo.color,
          textColor: colorInfo.textColor,
          borough: getBoroughFromRoute(shortName),
        });
      }
    }

    if (mtabcRes.ok) {
      const mtabcData = await mtabcRes.json();
      const mtabcRoutes = mtabcData?.data?.list || mtabcData?.data?.routes || [];
      for (const route of mtabcRoutes) {
        const shortName = route.shortName || route.id?.split('_')[1] || '';
        if (!shortName) continue;
        
        const colorInfo = getBusColor(shortName);
        routes.push({
          id: route.id || `MTABC_${shortName}`,
          shortName,
          longName: route.longName || route.description || shortName,
          color: colorInfo.color,
          textColor: colorInfo.textColor,
          borough: getBoroughFromRoute(shortName),
        });
      }
    }

    // Sort routes by short name
    routes.sort((a, b) => {
      const aNum = parseInt(a.shortName.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.shortName.replace(/\D/g, '')) || 0;
      if (a.shortName[0] !== b.shortName[0]) {
        return a.shortName.localeCompare(b.shortName);
      }
      return aNum - bNum;
    });

    // Update cache
    routesCache = { data: routes, timestamp: Date.now() };
    console.log(`[BUS] Loaded ${routes.length} routes from MTA API`);

    return routes;
  } catch (error) {
    console.error('[BUS] Error fetching routes:', error);
    return [];
  }
}

// Get stops for a specific route
async function getStopsForRoute(routeId: string): Promise<BusStop[]> {
  if (!MTA_BUS_API_KEY) {
    console.error('[BUS] No MTA_BUS_API_KEY configured');
    return [];
  }

  try {
    // URL encode the route ID properly
    const encodedRouteId = encodeURIComponent(routeId);
    const url = `${OBA_API_BASE}/stops-for-route/${encodedRouteId}.json?key=${MTA_BUS_API_KEY}&includePolylines=false&version=2`;
    
    console.log(`[BUS] Fetching stops for route: ${routeId}`);
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      console.error(`[BUS] Failed to fetch stops: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const stopsData = data?.data?.entry?.stopIds || [];
    const stopsRef = data?.data?.references?.stops || [];
    
    // Create a map of stop IDs to stop data
    const stopMap = new Map<string, BusStop>();
    for (const stop of stopsRef) {
      stopMap.set(stop.id, {
        id: stop.id,
        name: stop.name || 'Unknown Stop',
        latitude: stop.lat || 0,
        longitude: stop.lon || 0,
        direction: stop.direction || '',
      });
    }

    // Get stops in order
    const stops: BusStop[] = [];
    for (const stopId of stopsData) {
      const stop = stopMap.get(stopId);
      if (stop) {
        stops.push(stop);
      }
    }

    // If no stops from stopIds, use all from references
    if (stops.length === 0) {
      for (const stop of stopsRef) {
        stops.push({
          id: stop.id,
          name: stop.name || 'Unknown Stop',
          latitude: stop.lat || 0,
          longitude: stop.lon || 0,
          direction: stop.direction || '',
        });
      }
    }

    console.log(`[BUS] Found ${stops.length} stops for route ${routeId}`);
    return stops;
  } catch (error) {
    console.error('[BUS] Error fetching stops:', error);
    return [];
  }
}

// Get vehicles (real-time positions) for a route using SIRI API
async function getVehiclesForRoute(routeId: string): Promise<BusVehicle[]> {
  if (!MTA_BUS_API_KEY) {
    console.error('[BUS] No MTA_BUS_API_KEY configured');
    return [];
  }

  try {
    // LineRef format: MTA NYCT_<route> (e.g., MTA NYCT_M15)
    const lineRef = encodeURIComponent(routeId);
    const url = `${SIRI_API_BASE}/vehicle-monitoring.json?key=${MTA_BUS_API_KEY}&LineRef=${lineRef}&version=2`;
    
    console.log(`[BUS] Fetching vehicles for route: ${routeId}`);
    const response = await fetch(url, { next: { revalidate: 15 } });
    
    if (!response.ok) {
      console.error(`[BUS] Failed to fetch vehicles: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const deliveries = data?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery || [];
    const vehicles: BusVehicle[] = [];

    for (const delivery of deliveries) {
      const activities = delivery?.VehicleActivity || [];
      for (const activity of activities) {
        const journey = activity?.MonitoredVehicleJourney;
        if (!journey) continue;

        const location = journey.VehicleLocation;
        const call = journey.MonitoredCall;
        const distances = call?.Extensions?.Distances;

        vehicles.push({
          vehicleId: journey.VehicleRef || 'unknown',
          latitude: location?.Latitude || 0,
          longitude: location?.Longitude || 0,
          bearing: journey.Bearing || 0,
          destination: journey.DestinationName || 'Unknown',
          nextStop: call?.StopPointName || 'Unknown',
          distanceFromStop: distances?.PresentableDistance || '',
          progress: journey.ProgressStatus || 'normalProgress',
          direction: journey.DirectionRef === '0' ? 'Outbound' : 'Inbound',
        });
      }
    }

    console.log(`[BUS] Found ${vehicles.length} vehicles for route ${routeId}`);
    return vehicles;
  } catch (error) {
    console.error('[BUS] Error fetching vehicles:', error);
    return [];
  }
}

// Get arrivals at a specific stop using SIRI StopMonitoring
async function getArrivalsAtStop(stopId: string): Promise<Array<{
  routeId: string;
  routeName: string;
  destination: string;
  arrivalText: string;
  minutes: number | null;
  vehicleId: string;
  color: string;
  textColor: string;
}>> {
  if (!MTA_BUS_API_KEY) {
    console.error('[BUS] No MTA_BUS_API_KEY configured');
    return [];
  }

  try {
    const encodedStopId = encodeURIComponent(stopId);
    const url = `${SIRI_API_BASE}/stop-monitoring.json?key=${MTA_BUS_API_KEY}&MonitoringRef=${encodedStopId}&version=2`;
    
    console.log(`[BUS] Fetching arrivals for stop: ${stopId}`);
    const response = await fetch(url, { next: { revalidate: 30 } });
    
    if (!response.ok) {
      console.error(`[BUS] Failed to fetch arrivals: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const deliveries = data?.Siri?.ServiceDelivery?.StopMonitoringDelivery || [];
    const arrivals: Array<{
      routeId: string;
      routeName: string;
      destination: string;
      arrivalText: string;
      minutes: number | null;
      vehicleId: string;
      color: string;
      textColor: string;
    }> = [];

    for (const delivery of deliveries) {
      const visits = delivery?.MonitoredStopVisit || [];
      for (const visit of visits) {
        const journey = visit?.MonitoredVehicleJourney;
        if (!journey) continue;

        const call = journey.MonitoredCall;
        const distances = call?.Extensions?.Distances;
        
        // Calculate minutes until arrival
        let minutes: number | null = null;
        if (call?.ExpectedArrivalTime) {
          const arrivalTime = new Date(call.ExpectedArrivalTime);
          const now = new Date();
          minutes = Math.max(0, Math.round((arrivalTime.getTime() - now.getTime()) / 60000));
        }

        const routeName = journey.PublishedLineName || journey.LineRef?.split('_').pop() || 'Unknown';
        const colorInfo = getBusColor(routeName);

        arrivals.push({
          routeId: journey.LineRef || '',
          routeName,
          destination: journey.DestinationName || 'Unknown',
          arrivalText: distances?.PresentableDistance || (minutes !== null ? `${minutes} min` : 'approaching'),
          minutes,
          vehicleId: journey.VehicleRef || 'unknown',
          color: colorInfo.color,
          textColor: colorInfo.textColor,
        });
      }
    }

    // Sort by minutes
    arrivals.sort((a, b) => (a.minutes ?? 999) - (b.minutes ?? 999));

    console.log(`[BUS] Found ${arrivals.length} arrivals for stop ${stopId}`);
    return arrivals;
  } catch (error) {
    console.error('[BUS] Error fetching arrivals:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const route = searchParams.get('route');
  const stop = searchParams.get('stop');
  const borough = searchParams.get('borough');

  // Check API key
  if (!MTA_BUS_API_KEY) {
    return NextResponse.json({ 
      error: 'MTA Bus API key not configured',
      routes: [],
      boroughs: [],
    });
  }

  // Get arrivals at a specific stop
  if (stop) {
    const arrivals = await getArrivalsAtStop(stop);
    return NextResponse.json({
      stopId: stop,
      arrivals,
      lastUpdate: new Date().toISOString(),
    });
  }

  // Get vehicles and stops for a specific route
  if (route) {
    // The route param might be just the short name (e.g., "M15") or full ID (e.g., "MTA NYCT_M15")
    let fullRouteId = route;
    if (!route.includes('_')) {
      // Try to find the route in cache to get full ID
      const allRoutes = await getAllRoutes();
      const foundRoute = allRoutes.find(r => r.shortName === route);
      fullRouteId = foundRoute?.id || `MTA NYCT_${route}`;
    }

    const [vehicles, stops] = await Promise.all([
      getVehiclesForRoute(fullRouteId),
      getStopsForRoute(fullRouteId),
    ]);
    
    const colorInfo = getBusColor(route);
    
    return NextResponse.json({
      route,
      fullRouteId,
      color: colorInfo.color,
      textColor: colorInfo.textColor,
      vehicles,
      stops,
      lastUpdate: new Date().toISOString(),
    });
  }

  // Get all routes, optionally filtered by borough
  const allRoutes = await getAllRoutes();
  const boroughs = [...new Set(allRoutes.map(r => r.borough))].sort();

  let filteredRoutes = allRoutes;
  if (borough) {
    filteredRoutes = allRoutes.filter(r => r.borough === borough);
  }

  return NextResponse.json({
    boroughs,
    routes: filteredRoutes.map(r => ({
      id: r.shortName,
      name: r.shortName,
      longName: r.longName,
      color: r.color,
      textColor: r.textColor,
      borough: r.borough,
    })),
    lastUpdate: new Date().toISOString(),
  });
}

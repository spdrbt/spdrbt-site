import { NextResponse } from 'next/server';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

// MTA GTFS-RT Feed URLs
const FEED_URLS: Record<string, string> = {
  'ACE': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
  'BDFM': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
  'G': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
  'JZ': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
  'NQRW': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
  'L': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
  '1234567': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
};

// Map line to feed
const LINE_TO_FEED: Record<string, string> = {
  '1': '1234567', '2': '1234567', '3': '1234567',
  '4': '1234567', '5': '1234567', '6': '1234567', '7': '1234567',
  'A': 'ACE', 'C': 'ACE', 'E': 'ACE',
  'B': 'BDFM', 'D': 'BDFM', 'F': 'BDFM', 'M': 'BDFM',
  'G': 'G', 'J': 'JZ', 'Z': 'JZ',
  'N': 'NQRW', 'Q': 'NQRW', 'R': 'NQRW', 'W': 'NQRW',
  'L': 'L',
};

// Subway line colors
export const SUBWAY_LINES: Record<string, { color: string; textColor: string }> = {
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

// Complete station data for all lines
const STATIONS: Record<string, { name: string; lines: string[] }> = {
  // 7 Line - Complete
  '701': { name: 'Flushing-Main St', lines: ['7'] },
  '702': { name: 'Mets-Willets Point', lines: ['7'] },
  '705': { name: '111 St', lines: ['7'] },
  '706': { name: '103 St-Corona Plaza', lines: ['7'] },
  '707': { name: 'Junction Blvd', lines: ['7'] },
  '708': { name: '90 St-Elmhurst Av', lines: ['7'] },
  '709': { name: '82 St-Jackson Hts', lines: ['7'] },
  '710': { name: '74 St-Broadway', lines: ['7'] },
  '711': { name: '69 St', lines: ['7'] },
  '712': { name: '61 St-Woodside', lines: ['7'] },
  '713': { name: '52 St', lines: ['7'] },
  '714': { name: '46 St-Bliss St', lines: ['7'] },
  '715': { name: '40 St-Lowery St', lines: ['7'] },
  '716': { name: '33 St-Rawson St', lines: ['7'] },
  '718': { name: 'Queensboro Plaza', lines: ['7', 'N', 'W'] },
  '719': { name: 'Court Sq', lines: ['7', 'G', 'E', 'M'] },
  '720': { name: 'Hunters Point Av', lines: ['7'] },
  '721': { name: 'Vernon Blvd-Jackson Av', lines: ['7'] },
  '723': { name: 'Grand Central-42 St', lines: ['7', '4', '5', '6'] },
  '724': { name: '5 Av', lines: ['7'] },
  '725': { name: 'Times Sq-42 St', lines: ['7', '1', '2', '3', 'N', 'Q', 'R', 'W'] },
  '726': { name: '34 St-Hudson Yards', lines: ['7'] },
  
  // 1 Line - Complete
  '101': { name: 'Van Cortlandt Park-242 St', lines: ['1'] },
  '103': { name: '238 St', lines: ['1'] },
  '104': { name: '231 St', lines: ['1'] },
  '106': { name: '225 St', lines: ['1'] },
  '107': { name: '215 St', lines: ['1'] },
  '108': { name: '207 St', lines: ['1'] },
  '109': { name: 'Dyckman St', lines: ['1'] },
  '110': { name: '191 St', lines: ['1'] },
  '111': { name: '181 St', lines: ['1'] },
  '112': { name: '168 St', lines: ['1', 'A', 'C'] },
  '113': { name: '157 St', lines: ['1'] },
  '114': { name: '145 St', lines: ['1'] },
  '115': { name: '137 St-City College', lines: ['1'] },
  '116': { name: '125 St', lines: ['1'] },
  '117': { name: '116 St-Columbia University', lines: ['1'] },
  '118': { name: 'Cathedral Pkwy-110 St', lines: ['1'] },
  '119': { name: '103 St', lines: ['1'] },
  '120': { name: '96 St', lines: ['1', '2', '3'] },
  '121': { name: '86 St', lines: ['1'] },
  '122': { name: '79 St', lines: ['1'] },
  '123': { name: '72 St', lines: ['1', '2', '3'] },
  '124': { name: '66 St-Lincoln Center', lines: ['1'] },
  '125': { name: '59 St-Columbus Circle', lines: ['1', 'A', 'B', 'C', 'D'] },
  '126': { name: '50 St', lines: ['1'] },
  '127': { name: 'Times Sq-42 St', lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W'] },
  '128': { name: '34 St-Penn Station', lines: ['1', '2', '3'] },
  '129': { name: '28 St', lines: ['1'] },
  '130': { name: '23 St', lines: ['1'] },
  '131': { name: '18 St', lines: ['1'] },
  '132': { name: '14 St', lines: ['1', '2', '3'] },
  '133': { name: 'Christopher St-Sheridan Sq', lines: ['1'] },
  '134': { name: 'Houston St', lines: ['1'] },
  '135': { name: 'Canal St', lines: ['1'] },
  '136': { name: 'Franklin St', lines: ['1'] },
  '137': { name: 'Chambers St', lines: ['1', '2', '3'] },
  '138': { name: 'Cortlandt St', lines: ['1'] },
  '139': { name: 'Rector St', lines: ['1'] },
  '140': { name: 'South Ferry', lines: ['1'] },
  
  // 4/5/6 Lines
  '401': { name: 'Woodlawn', lines: ['4'] },
  '402': { name: 'Mosholu Pkwy', lines: ['4'] },
  '405': { name: 'Bedford Park Blvd-Lehman College', lines: ['4'] },
  '406': { name: 'Kingsbridge Rd', lines: ['4'] },
  '407': { name: 'Fordham Rd', lines: ['4'] },
  '408': { name: '183 St', lines: ['4'] },
  '409': { name: 'Burnside Av', lines: ['4'] },
  '410': { name: '176 St', lines: ['4'] },
  '411': { name: 'Mt Eden Av', lines: ['4'] },
  '412': { name: '170 St', lines: ['4'] },
  '413': { name: '167 St', lines: ['4'] },
  '414': { name: '161 St-Yankee Stadium', lines: ['4', 'B', 'D'] },
  '416': { name: '149 St-Grand Concourse', lines: ['4', '5', '2'] },
  '418': { name: '138 St-Grand Concourse', lines: ['4', '5'] },
  '419': { name: '125 St', lines: ['4', '5', '6'] },
  '621': { name: '59 St', lines: ['4', '5', '6', 'N', 'R', 'W'] },
  '629': { name: 'Grand Central-42 St', lines: ['4', '5', '6', '7'] },
  '634': { name: '14 St-Union Sq', lines: ['4', '5', '6', 'N', 'Q', 'R', 'W', 'L'] },
  '635': { name: 'Astor Pl', lines: ['6'] },
  '636': { name: 'Bleecker St', lines: ['6'] },
  '639': { name: 'Brooklyn Bridge-City Hall', lines: ['4', '5', '6'] },
  '640': { name: 'Fulton St', lines: ['4', '5', '2', '3', 'A', 'C', 'J', 'Z'] },
  '641': { name: 'Wall St', lines: ['4', '5'] },
  '642': { name: 'Bowling Green', lines: ['4', '5'] },
  
  // A/C/E Lines
  'A02': { name: 'Inwood-207 St', lines: ['A'] },
  'A03': { name: 'Dyckman St', lines: ['A'] },
  'A05': { name: '175 St', lines: ['A'] },
  'A06': { name: '168 St', lines: ['A', 'C', '1'] },
  'A09': { name: '145 St', lines: ['A', 'B', 'C', 'D'] },
  'A10': { name: '135 St', lines: ['A', 'B', 'C'] },
  'A11': { name: '125 St', lines: ['A', 'B', 'C', 'D'] },
  'A15': { name: '59 St-Columbus Circle', lines: ['A', 'B', 'C', 'D', '1'] },
  'A24': { name: '42 St-Port Authority', lines: ['A', 'C', 'E'] },
  'A25': { name: '34 St-Penn Station', lines: ['A', 'C', 'E'] },
  'A28': { name: '14 St', lines: ['A', 'C', 'E'] },
  'A31': { name: 'Canal St', lines: ['A', 'C', 'E'] },
  'A32': { name: 'Chambers St', lines: ['A', 'C'] },
  'A33': { name: 'Fulton St', lines: ['A', 'C'] },
  'A38': { name: 'Jay St-MetroTech', lines: ['A', 'C', 'F', 'R'] },
  'A40': { name: 'Hoyt-Schermerhorn Sts', lines: ['A', 'C', 'G'] },
  'E01': { name: 'World Trade Center', lines: ['E'] },
  
  // L Line
  'L01': { name: '8 Av', lines: ['L'] },
  'L02': { name: '6 Av', lines: ['L'] },
  'L03': { name: 'Union Sq-14 St', lines: ['L', '4', '5', '6', 'N', 'Q', 'R', 'W'] },
  'L05': { name: '3 Av', lines: ['L'] },
  'L06': { name: '1 Av', lines: ['L'] },
  'L08': { name: 'Bedford Av', lines: ['L'] },
  'L10': { name: 'Lorimer St', lines: ['L'] },
  'L11': { name: 'Graham Av', lines: ['L'] },
  'L12': { name: 'Grand St', lines: ['L'] },
  'L13': { name: 'Montrose Av', lines: ['L'] },
  'L14': { name: 'Morgan Av', lines: ['L'] },
  'L15': { name: 'Jefferson St', lines: ['L'] },
  'L16': { name: 'DeKalb Av', lines: ['L'] },
  'L17': { name: 'Myrtle-Wyckoff Avs', lines: ['L', 'M'] },
  'L19': { name: 'Halsey St', lines: ['L'] },
  'L20': { name: 'Wilson Av', lines: ['L'] },
  'L21': { name: 'Bushwick Av-Aberdeen St', lines: ['L'] },
  'L22': { name: 'Broadway Junction', lines: ['L', 'A', 'C', 'J', 'Z'] },
  'L24': { name: 'Atlantic Av', lines: ['L'] },
  'L25': { name: 'Sutter Av', lines: ['L'] },
  'L26': { name: 'Livonia Av', lines: ['L'] },
  'L27': { name: 'New Lots Av', lines: ['L'] },
  'L28': { name: 'East 105 St', lines: ['L'] },
  'L29': { name: 'Canarsie-Rockaway Pkwy', lines: ['L'] },
  
  // G Line  
  'G08': { name: 'Court Sq', lines: ['G', '7', 'E', 'M'] },
  'G09': { name: '21 St', lines: ['G'] },
  'G10': { name: 'Greenpoint Av', lines: ['G'] },
  'G11': { name: 'Nassau Av', lines: ['G'] },
  'G12': { name: 'Metropolitan Av', lines: ['G'] },
  'G13': { name: 'Broadway', lines: ['G'] },
  'G14': { name: 'Flushing Av', lines: ['G'] },
  'G15': { name: 'Myrtle-Willoughby Avs', lines: ['G'] },
  'G16': { name: 'Bedford-Nostrand Avs', lines: ['G'] },
  'G18': { name: 'Classon Av', lines: ['G'] },
  'G19': { name: 'Clinton-Washington Avs', lines: ['G'] },
  'G20': { name: 'Fulton St', lines: ['G'] },
  'G21': { name: 'Hoyt-Schermerhorn Sts', lines: ['G', 'A', 'C'] },
  'G22': { name: 'Bergen St', lines: ['G'] },
  'G24': { name: 'Carroll St', lines: ['G'] },
  'G26': { name: 'Smith-9 Sts', lines: ['G', 'F'] },
  'G28': { name: '4 Av-9 St', lines: ['G', 'F', 'R'] },
  'G29': { name: '7 Av', lines: ['G', 'F'] },
  'G30': { name: '15 St-Prospect Park', lines: ['G', 'F'] },
  'G31': { name: 'Fort Hamilton Pkwy', lines: ['G', 'F'] },
  'G32': { name: 'Church Av', lines: ['G', 'F'] },
};

// Station order for each line
const LINE_STATIONS: Record<string, string[]> = {
  '7': ['726', '725', '724', '723', '721', '720', '719', '718', '716', '715', '714', '713', '712', '711', '710', '709', '708', '707', '706', '705', '702', '701'],
  '1': ['140', '139', '138', '137', '136', '135', '134', '133', '132', '131', '130', '129', '128', '127', '126', '125', '124', '123', '122', '121', '120', '119', '118', '117', '116', '115', '114', '113', '112', '111', '110', '109', '108', '107', '106', '104', '103', '101'],
  '4': ['642', '641', '640', '639', '634', '629', '621', '419', '418', '416', '414', '413', '412', '411', '410', '409', '408', '407', '406', '405', '402', '401'],
  '6': ['642', '641', '640', '639', '636', '635', '634', '629', '621', '419'],
  'L': ['L01', 'L02', 'L03', 'L05', 'L06', 'L08', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L19', 'L20', 'L21', 'L22', 'L24', 'L25', 'L26', 'L27', 'L28', 'L29'],
  'G': ['G08', 'G09', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G18', 'G19', 'G20', 'G21', 'G22', 'G24', 'G26', 'G28', 'G29', 'G30', 'G31', 'G32'],
  'A': ['A02', 'A03', 'A05', 'A06', 'A09', 'A10', 'A11', 'A15', 'A24', 'A25', 'A28', 'A31', 'A32', 'A33', 'A38', 'A40'],
};

// Cache for GTFS data
const cache: { data: Record<string, unknown>; timestamp: number } = { data: {}, timestamp: 0 };
const CACHE_TTL = 15000; // 15 seconds

// Fetch GTFS-RT data from MTA
async function fetchGTFSFeed(feedKey: string): Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage | null> {
  try {
    const url = FEED_URLS[feedKey];
    if (!url) return null;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/x-protobuf' }
    });

    if (!response.ok) {
      console.error(`[MTA] Failed to fetch ${feedKey}: ${response.status}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    return feed;
  } catch (error) {
    console.error(`[MTA] Error fetching ${feedKey}:`, error);
    return null;
  }
}

// Get real-time train positions and arrivals for a line
async function getLineRealTimeData(line: string) {
  const feedKey = LINE_TO_FEED[line];
  if (!feedKey) return { trainPositions: {}, arrivals: {} };

  // Check cache
  const now = Date.now();
  const cacheKey = `feed_${feedKey}`;
  if (cache.data[cacheKey] && now - cache.timestamp < CACHE_TTL) {
    return extractLineData(line, cache.data[cacheKey] as GtfsRealtimeBindings.transit_realtime.FeedMessage);
  }

  const feed = await fetchGTFSFeed(feedKey);
  if (!feed) return { trainPositions: {}, arrivals: {} };

  cache.data[cacheKey] = feed;
  cache.timestamp = now;

  return extractLineData(line, feed);
}

// Extract train positions and arrivals from GTFS feed
function extractLineData(line: string, feed: GtfsRealtimeBindings.transit_realtime.FeedMessage) {
  const trainPositions: Record<string, { trainId: string; status: string; direction: string }> = {};
  const arrivals: Record<string, Array<{ minutes: number; destination: string; direction: string }>> = {};

  feed.entity.forEach((entity) => {
    // Get trip updates (arrivals)
    if (entity.tripUpdate) {
      const tripUpdate = entity.tripUpdate;
      const routeId = tripUpdate.trip?.routeId || '';
      
      // Filter for the specific line
      if (!routeId.startsWith(line) && routeId !== line) return;

      const stopTimeUpdates = tripUpdate.stopTimeUpdate || [];
      
      stopTimeUpdates.forEach((stu) => {
        const stopId = stu.stopId || '';
        // Remove direction suffix (N/S) from stop ID
        const baseStopId = stopId.replace(/[NS]$/, '');
        const direction = stopId.endsWith('N') ? 'North' : 'South';
        
        const arrivalTime = stu.arrival?.time;
        if (arrivalTime) {
          const arrivalSeconds = typeof arrivalTime === 'number' ? arrivalTime : Number(arrivalTime);
          const nowSeconds = Math.floor(Date.now() / 1000);
          const minutesAway = Math.floor((arrivalSeconds - nowSeconds) / 60);
          
          if (minutesAway >= 0 && minutesAway <= 60) {
            if (!arrivals[baseStopId]) arrivals[baseStopId] = [];
            arrivals[baseStopId].push({
              minutes: minutesAway,
              destination: getDestination(line, direction),
              direction: getDirectionLabel(line, direction),
            });
          }
        }
      });
    }

    // Get vehicle positions (trains at stations)
    if (entity.vehicle) {
      const vehicle = entity.vehicle;
      const routeId = vehicle.trip?.routeId || '';
      
      if (!routeId.startsWith(line) && routeId !== line) return;
      
      const stopId = vehicle.stopId || '';
      const baseStopId = stopId.replace(/[NS]$/, '');
      const direction = stopId.endsWith('N') ? 'North' : 'South';
      const status = vehicle.currentStatus;
      
      // 0 = INCOMING_AT, 1 = STOPPED_AT, 2 = IN_TRANSIT_TO
      if (status === 1) { // STOPPED_AT - train is at the station
        trainPositions[baseStopId] = {
          trainId: vehicle.vehicle?.id || 'unknown',
          status: 'at_station',
          direction,
        };
      } else if (status === 0) { // INCOMING_AT
        trainPositions[baseStopId] = {
          trainId: vehicle.vehicle?.id || 'unknown', 
          status: 'arriving',
          direction,
        };
      }
    }
  });

  return { trainPositions, arrivals };
}

function getDestination(line: string, direction: string): string {
  const destinations: Record<string, { north: string; south: string }> = {
    '7': { north: '34 St-Hudson Yards', south: 'Flushing-Main St' },
    '1': { north: 'Van Cortlandt Park-242 St', south: 'South Ferry' },
    '4': { north: 'Woodlawn', south: 'Crown Hts-Utica Av' },
    '6': { north: 'Pelham Bay Park', south: 'Brooklyn Bridge-City Hall' },
    'L': { north: '8 Av', south: 'Canarsie-Rockaway Pkwy' },
    'G': { north: 'Court Sq', south: 'Church Av' },
    'A': { north: 'Inwood-207 St', south: 'Far Rockaway' },
  };
  return destinations[line]?.[direction === 'North' ? 'north' : 'south'] || 'Unknown';
}

function getDirectionLabel(line: string, direction: string): string {
  const labels: Record<string, { north: string; south: string }> = {
    '7': { north: 'Manhattan', south: 'Flushing' },
    '1': { north: 'Uptown', south: 'Downtown' },
    '4': { north: 'Uptown', south: 'Downtown' },
    '6': { north: 'Uptown', south: 'Downtown' },
    'L': { north: 'Manhattan', south: 'Brooklyn' },
    'G': { north: 'North', south: 'South' },
    'A': { north: 'Uptown', south: 'Downtown' },
  };
  return labels[line]?.[direction === 'North' ? 'north' : 'south'] || direction;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const line = searchParams.get('line');
  const stationId = searchParams.get('station');

  // If station is specified, get arrivals for that station
  if (stationId) {
    const station = STATIONS[stationId];
    if (!station) {
      return NextResponse.json({ error: 'Station not found', arrivals: [] });
    }

    // Get real-time data for lines serving this station
    const allArrivals: Array<{
      line: string;
      direction: string;
      destination: string;
      minutes: number;
      color: string;
      textColor: string;
    }> = [];

    for (const lineName of station.lines) {
      const { arrivals } = await getLineRealTimeData(lineName);
      const stationArrivals = arrivals[stationId] || [];
      
      stationArrivals.forEach((arr) => {
        const lineInfo = SUBWAY_LINES[lineName];
        allArrivals.push({
          line: lineName,
          direction: arr.direction,
          destination: arr.destination,
          minutes: arr.minutes,
          color: lineInfo?.color || '#666',
          textColor: lineInfo?.textColor || '#fff',
        });
      });
    }

    // Sort by minutes
    allArrivals.sort((a, b) => a.minutes - b.minutes);

    return NextResponse.json({
      stationId,
      stationName: station.name,
      arrivals: allArrivals,
      lastUpdate: new Date().toISOString(),
    });
  }

  // If line is specified, return stations with train positions
  if (line) {
    const lineInfo = SUBWAY_LINES[line];
    const stationIds = LINE_STATIONS[line] || [];
    
    // Get real-time train positions
    const { trainPositions } = await getLineRealTimeData(line);
    
    const stations = stationIds
      .filter(id => STATIONS[id])
      .map(id => ({
        id,
        name: STATIONS[id].name,
        hasTrainAtStation: !!trainPositions[id] && trainPositions[id].status === 'at_station',
        hasTrainArriving: !!trainPositions[id] && trainPositions[id].status === 'arriving',
        trainDirection: trainPositions[id]?.direction || null,
      }));

    return NextResponse.json({
      line,
      color: lineInfo?.color || '#666',
      textColor: lineInfo?.textColor || '#fff',
      stations,
      status: 'Good Service',
      lastUpdate: new Date().toISOString(),
    });
  }

  // Default: return all lines
  return NextResponse.json({
    lines: Object.keys(SUBWAY_LINES).map(l => ({
      id: l,
      color: SUBWAY_LINES[l].color,
      textColor: SUBWAY_LINES[l].textColor,
    })),
    lastUpdate: new Date().toISOString(),
  });
}

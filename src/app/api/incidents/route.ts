import { NextResponse } from 'next/server';

// NYC 311 Service Requests - Real incidents from past 24 hours
const NYC_311_API = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

// Categories to highlight (emergencies, safety issues)
const PRIORITY_CATEGORIES = [
  'Blocked Driveway',
  'Illegal Parking',
  'Noise - Residential',
  'Noise - Commercial',
  'Noise - Street/Sidewalk',
  'Noise - Vehicle',
  'Street Condition',
  'Water System',
  'Sewer',
  'Traffic Signal Condition',
  'Street Light Condition',
  'Rodent',
  'Homeless Encampment',
  'Illegal Fireworks',
  'Drinking',
  'Drug Activity',
  'Homeless Person Assistance',
  'Graffiti',
  'General Construction/Plumbing',
  'Fire Safety Director',
  'Building/Use',
  'Damaged Tree',
  'Overgrown Tree/Branches',
  'Dead/Dying Tree',
];

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

export async function GET() {
  try {
    // Get incidents from past 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dateFilter = yesterday.toISOString().split('T')[0];
    
    // Fetch from NYC 311 API - most recent 100 incidents
    const response = await fetch(
      `${NYC_311_API}?$where=created_date>='${dateFilter}'&$order=created_date DESC&$limit=100`,
      { 
        next: { revalidate: 60 }, // Cache for 1 minute
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`311 API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform and prioritize incidents
    const incidents: Incident[] = data
      .filter((item: any) => item.complaint_type && item.created_date)
      .map((item: any) => {
        const type = item.complaint_type || 'Unknown';
        const isPriority = PRIORITY_CATEGORIES.some(cat => 
          type.toLowerCase().includes(cat.toLowerCase())
        );
        
        // Determine priority level
        let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (type.toLowerCase().includes('fire') || 
            type.toLowerCase().includes('gas') ||
            type.toLowerCase().includes('emergency') ||
            type.toLowerCase().includes('hazard')) {
          priority = 'HIGH';
        } else if (isPriority || type.toLowerCase().includes('noise') || 
                   type.toLowerCase().includes('illegal')) {
          priority = 'MEDIUM';
        }

        // Format time ago
        const created = new Date(item.created_date);
        const minutesAgo = Math.floor((now.getTime() - created.getTime()) / 60000);
        let timeStr = '';
        if (minutesAgo < 60) {
          timeStr = `${minutesAgo}m ago`;
        } else if (minutesAgo < 1440) {
          timeStr = `${Math.floor(minutesAgo / 60)}h ago`;
        } else {
          timeStr = `${Math.floor(minutesAgo / 1440)}d ago`;
        }

        return {
          id: item.unique_key || `${Date.now()}-${Math.random()}`,
          type: type,
          description: item.descriptor || '',
          location: item.incident_address || item.street_name || 'NYC',
          borough: item.borough || 'NYC',
          status: item.status || 'Open',
          created: timeStr,
          priority,
        };
      })
      // Sort by priority (HIGH first) then by recency
      .sort((a: Incident, b: Incident) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return 0; // Keep original order (by date)
      });

    return NextResponse.json({
      incidents: incidents.slice(0, 50), // Return top 50
      lastUpdate: now.toISOString(),
      total: data.length,
    });

  } catch (error) {
    console.error('Incidents API error:', error);
    
    // Return mock data on error
    return NextResponse.json({
      incidents: [
        {
          id: '1',
          type: 'Service Request',
          description: 'Loading live incidents...',
          location: 'NYC',
          borough: 'Manhattan',
          status: 'Pending',
          created: 'now',
          priority: 'LOW' as const,
        }
      ],
      lastUpdate: new Date().toISOString(),
      total: 0,
      error: 'Failed to fetch live data',
    });
  }
}

import { NextResponse } from 'next/server';

// NYC Open Data - FDNY/EMS Incidents (Live)
// Dataset: FDNY Citywide Call Types
const FDNY_INCIDENTS_URL = 'https://data.cityofnewyork.us/resource/8m42-w767.json?$limit=15&$order=incident_datetime DESC';

// NYC 311 Service Requests (Live)
// Dataset: 311 Service Requests
const NYC_311_URL = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json?$limit=20&$order=created_date DESC&$where=created_date > \'2024-01-01\'';

interface FDNYIncident {
  incident_datetime: string;
  incident_type_desc: string;
  borough_desc: string;
  zipcode?: string;
  policeprecinct?: string;
}

interface NYC311Request {
  created_date: string;
  complaint_type: string;
  descriptor?: string;
  incident_address?: string;
  borough?: string;
  status?: string;
  latitude?: string;
  longitude?: string;
}

export async function GET() {
  try {
    // Fetch both data sources in parallel
    const [fdnyRes, nyc311Res] = await Promise.all([
      fetch(FDNY_INCIDENTS_URL, { 
        next: { revalidate: 60 }, // Cache for 1 minute
        headers: { 'Accept': 'application/json' }
      }).catch(() => null),
      fetch(NYC_311_URL, { 
        next: { revalidate: 60 },
        headers: { 'Accept': 'application/json' }
      }).catch(() => null),
    ]);

    // Process FDNY incidents
    let fdnyIncidents: Array<{
      time: string;
      type: string;
      borough: string;
      severity: 'critical' | 'high' | 'medium';
    }> = [];

    if (fdnyRes?.ok) {
      const fdnyData: FDNYIncident[] = await fdnyRes.json();
      fdnyIncidents = fdnyData.slice(0, 10).map(incident => {
        const type = incident.incident_type_desc || 'Unknown';
        let severity: 'critical' | 'high' | 'medium' = 'medium';
        
        if (type.toLowerCase().includes('fire') || type.toLowerCase().includes('cardiac')) {
          severity = 'critical';
        } else if (type.toLowerCase().includes('medical') || type.toLowerCase().includes('accident')) {
          severity = 'high';
        }

        return {
          time: incident.incident_datetime 
            ? new Date(incident.incident_datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : 'Recent',
          type: type.length > 40 ? type.substring(0, 40) + '...' : type,
          borough: incident.borough_desc || 'NYC',
          severity,
        };
      });
    }

    // Process 311 requests
    let complaints: Array<{
      time: string;
      type: string;
      address: string;
      borough: string;
      status: string;
      lat?: number;
      lng?: number;
    }> = [];

    if (nyc311Res?.ok) {
      const nyc311Data: NYC311Request[] = await nyc311Res.json();
      complaints = nyc311Data.slice(0, 15).map(req => ({
        time: req.created_date 
          ? new Date(req.created_date).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric', 
              minute: '2-digit' 
            })
          : 'Recent',
        type: req.complaint_type || 'General',
        address: req.incident_address || 'NYC',
        borough: req.borough || 'NYC',
        status: req.status || 'Open',
        lat: req.latitude ? parseFloat(req.latitude) : undefined,
        lng: req.longitude ? parseFloat(req.longitude) : undefined,
      }));
    }

    // Stats summary
    const stats = {
      total911: fdnyIncidents.length,
      total311: complaints.length,
      critical: fdnyIncidents.filter(i => i.severity === 'critical').length,
      openComplaints: complaints.filter(c => c.status === 'Open').length,
    };

    return NextResponse.json({
      fdnyIncidents,
      complaints,
      stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Emergency API error:', error);
    return NextResponse.json(
      { 
        fdnyIncidents: [], 
        complaints: [],
        stats: { total911: 0, total311: 0, critical: 0, openComplaints: 0 },
        error: 'Failed to fetch emergency data' 
      },
      { status: 200 }
    );
  }
}

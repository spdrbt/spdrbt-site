import { NextResponse } from 'next/server';

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

// Helper function to determine borough based on coordinates
function getBorough(lat: number, lng: number): string {
  if (lat >= 40.80 && lng >= -74.00 && lng <= -73.91) return 'BX';
  if (lat >= 40.57 && lat <= 40.74 && lng >= -74.05 && lng <= -73.83) return 'BK';
  if (lat >= 40.68 && lat <= 40.82 && lng >= -74.05 && lng <= -73.90) return 'MH';
  if (lat >= 40.54 && lat <= 40.80 && lng >= -73.96 && lng <= -73.70) return 'QN';
  if (lat >= 40.50 && lat <= 40.65 && lng >= -74.26 && lng <= -74.05) return 'SI';
  return 'NYC';
}

// Default cameras - one main camera for each borough
export const DEFAULT_BOROUGH_CAMERAS: Camera[] = [
  {
    id: '420',
    name: 'Times Square @ 42 St & 7 Ave',
    latitude: 40.758,
    longitude: -73.9855,
    area: 'MH',
    isOnline: true,
    imageUrl: 'https://webcams.nyctmc.org/api/cameras/420/image',
    source: 'DOT'
  },
  {
    id: '686',
    name: 'BQE @ Atlantic Ave',
    latitude: 40.6892,
    longitude: -73.9857,
    area: 'BK',
    isOnline: true,
    imageUrl: 'https://webcams.nyctmc.org/api/cameras/686/image',
    source: 'DOT'
  },
  {
    id: '1003',
    name: 'Queens Midtown Tunnel',
    latitude: 40.7447,
    longitude: -73.9543,
    area: 'QN',
    isOnline: true,
    imageUrl: 'https://webcams.nyctmc.org/api/cameras/1003/image',
    source: 'DOT'
  },
  {
    id: '700',
    name: 'Cross Bronx @ Major Deegan',
    latitude: 40.8506,
    longitude: -73.9076,
    area: 'BX',
    isOnline: true,
    imageUrl: 'https://webcams.nyctmc.org/api/cameras/700/image',
    source: 'DOT'
  },
  {
    id: '800',
    name: 'Verrazano Bridge SI Side',
    latitude: 40.6066,
    longitude: -74.0447,
    area: 'SI',
    isOnline: true,
    imageUrl: 'https://webcams.nyctmc.org/api/cameras/800/image',
    source: 'DOT'
  }
];

export async function GET() {
  try {
    // Fetch from NYC DOT traffic cameras API
    const response = await fetch('https://webcams.nyctmc.org/api/cameras', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cameras from NYC DOT');
    }
    
    const data = await response.json();
    
    // Map the NYC DOT camera data to our format
    const cameras: Camera[] = data
      .filter((cam: any) => {
        const lat = cam.latitude || cam.lat || 0;
        const lng = cam.longitude || cam.lng || 0;
        const isDisabled = cam.disabled === true || cam.isDisabled === true;
        return lat !== 0 && lng !== 0 && !isDisabled;
      })
      .map((cam: any) => ({
        id: cam.id || cam.cameraId || String(Math.random()),
        name: cam.name || cam.cameraName || 'CAM_UNKNOWN',
        latitude: cam.latitude || cam.lat || 0,
        longitude: cam.longitude || cam.lng || 0,
        area: getBorough(cam.latitude || cam.lat, cam.longitude || cam.lng),
        isOnline: true,
        imageUrl: cam.imageUrl || cam.url || `https://webcams.nyctmc.org/api/cameras/${cam.id}/image`,
        source: 'DOT'
      }));

    return NextResponse.json({
      cameras,
      defaultCameras: DEFAULT_BOROUGH_CAMERAS,
      total: cameras.length
    });
  } catch (error) {
    console.error('[CAM_API] Error:', error);
    return NextResponse.json({
      cameras: DEFAULT_BOROUGH_CAMERAS,
      defaultCameras: DEFAULT_BOROUGH_CAMERAS,
      total: DEFAULT_BOROUGH_CAMERAS.length
    });
  }
}

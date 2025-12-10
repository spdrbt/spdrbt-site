import { NextRequest, NextResponse } from 'next/server';

// Proxy NYC DOT camera images to avoid CORS issues
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cameraId = searchParams.get('id');
  
  if (!cameraId) {
    return new NextResponse('Camera ID required', { status: 400 });
  }

  try {
    // NYC 511 NY Traffic Camera API - direct image URLs
    // Using the official NYC 511 camera system
    const cameraUrl = `https://webcams.nyctmc.org/api/cameras/${cameraId}/image`;
    
    const response = await fetch(cameraUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
        'Referer': 'https://webcams.nyctmc.org/',
      },
      next: { revalidate: 10 }, // Cache for 10 seconds
    });

    if (!response.ok) {
      // Try alternate URL format
      const altUrl = `https://webcams.nyctmc.org/google/image?id=${cameraId}`;
      const altResponse = await fetch(altUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*',
        },
      });
      
      if (!altResponse.ok) {
        throw new Error('Camera unavailable');
      }
      
      const imageData = await altResponse.arrayBuffer();
      return new NextResponse(imageData, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=10',
        },
      });
    }

    const imageData = await response.arrayBuffer();
    
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=10',
      },
    });
  } catch (error) {
    console.error('Camera image proxy error:', error);
    // Return a placeholder/error image
    return new NextResponse('Camera unavailable', { 
      status: 503,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

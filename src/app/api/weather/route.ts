import { NextResponse } from 'next/server';

// Use server-side env var or fall back to NEXT_PUBLIC_ version
const API_KEY = process.env.WEATHER_API_KEY || process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const LAT = process.env.NYC_LAT || process.env.NEXT_PUBLIC_NYC_LAT || '40.7128';
const LON = process.env.NYC_LON || process.env.NEXT_PUBLIC_NYC_LON || '-74.0060';

export async function GET() {
  try {
    const [currentRes, aqiRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=imperial`,
        { next: { revalidate: 600 } } // Cache for 10 minutes
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`,
        { next: { revalidate: 600 } }
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=imperial&cnt=40`,
        { next: { revalidate: 600 } }
      ),
    ]);

    if (!currentRes.ok || !aqiRes.ok || !forecastRes.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const [current, aqi, forecast] = await Promise.all([
      currentRes.json(),
      aqiRes.json(),
      forecastRes.json(),
    ]);

    // Process the data
    const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    });
    const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    });

    // Get AQI text and class
    const aqiValue = aqi.list?.[0]?.main?.aqi || 1;
    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiClasses = ['aqi-good', 'aqi-fair', 'aqi-moderate', 'aqi-poor', 'aqi-very-poor'];

    // Process hourly forecast (next 3 and 6 hours)
    const nowSec = Date.now() / 1000;
    const futureList = forecast.list.filter((item: { dt: number }) => item.dt > nowSec);
    
    // Process daily forecast
    const days: Record<string, Array<{ main: { temp: number }; weather: Array<{ icon: string }> }>> = {};
    forecast.list.forEach((item: { dt: number; main: { temp: number }; weather: Array<{ icon: string }> }) => {
      const day = new Date(item.dt * 1000).toLocaleDateString('en-US', { 
        weekday: 'short',
        timeZone: 'America/New_York'
      });
      if (!days[day]) days[day] = [];
      days[day].push(item);
    });

    const allDays = Object.keys(days);
    const nextDays = allDays.length > 1 ? allDays.slice(1, 4) : allDays.slice(0, 3);

    const dailyForecast = nextDays.map((day) => {
      const dayData = days[day];
      const temps = dayData.map((x) => x.main.temp);
      const high = Math.round(Math.max(...temps));
      const low = Math.round(Math.min(...temps));
      const avg = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
      const midIndex = Math.floor(dayData.length / 2);
      const icon = dayData[midIndex].weather[0].icon;

      return { day, high, low, avg, icon };
    });

    // Wind direction helper
    const degToCompass = (num: number) => {
      const val = Math.floor((num / 22.5) + 0.5);
      const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      return arr[val % 16];
    };

    return NextResponse.json({
      current: {
        temp: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed),
        windDirection: degToCompass(current.wind.deg),
        icon: current.weather[0].icon,
        description: current.weather[0].description,
      },
      sun: {
        sunrise,
        sunset,
      },
      aqi: {
        value: aqiValue,
        label: aqiLabels[aqiValue - 1],
        className: aqiClasses[aqiValue - 1],
      },
      hourly: [
        {
          label: 'NOW',
          temp: Math.round(current.main.temp),
          icon: current.weather[0].icon,
        },
        futureList[0] && {
          label: '+3 HRS',
          temp: Math.round(futureList[0].main.temp),
          icon: futureList[0].weather[0].icon,
        },
        futureList[1] && {
          label: '+6 HRS',
          temp: Math.round(futureList[1].main.temp),
          icon: futureList[1].weather[0].icon,
        },
      ].filter(Boolean),
      daily: dailyForecast,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

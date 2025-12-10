'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Sunset, Wind, Droplets, Thermometer } from 'lucide-react';
import { LiveClock } from './LiveClock';

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    icon: string;
    description: string;
  };
  sun: {
    sunrise: string;
    sunset: string;
  };
  aqi: {
    value: number;
    label: string;
    className: string;
  };
  hourly: Array<{
    label: string;
    temp: number;
    icon: string;
  }>;
  daily: Array<{
    day: string;
    high: number;
    low: number;
    avg: number;
    icon: string;
  }>;
}

// Map OpenWeatherMap icons to emoji/text representation
function getWeatherIcon(iconCode: string): string {
  if (iconCode.includes('01')) return iconCode.includes('d') ? '☀️' : '🌙';
  if (iconCode.includes('02')) return iconCode.includes('d') ? '⛅' : '☁️';
  if (iconCode.includes('03') || iconCode.includes('04')) return '☁️';
  if (iconCode.includes('09')) return '🌧️';
  if (iconCode.includes('10')) return '🌧️';
  if (iconCode.includes('11')) return '⛈️';
  if (iconCode.includes('13')) return '❄️';
  if (iconCode.includes('50')) return '🌫️';
  return '🌡️';
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error('Failed to fetch weather');
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        setError('Weather data unavailable');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="spdr-panel p-5 min-h-[400px]">
        <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg">
          Current Conditions
        </h2>
        <div className="space-y-4">
          <div className="skeleton h-16 w-full rounded" />
          <div className="skeleton h-20 w-full rounded" />
          <div className="skeleton h-24 w-full rounded" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="spdr-panel p-5 min-h-[400px]">
        <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg">
          Current Conditions
        </h2>
        <div className="text-[#cc0000] text-center py-8">{error || 'Unable to load weather'}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spdr-panel p-5 flex flex-col"
    >
      <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg">
        Current Conditions
      </h2>

      {/* Clock */}
      <LiveClock />

      {/* Hourly Forecast */}
      <div className="flex justify-around my-4">
        {weather.hourly.map((hour, index) => (
          <motion.div
            key={hour.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="text-xs font-bold text-[#ff8a8a] uppercase">{hour.label}</div>
            <div className="text-2xl my-1">{getWeatherIcon(hour.icon)}</div>
            <div className="text-lg font-bold text-white">{hour.temp}°F</div>
          </motion.div>
        ))}
      </div>

      {/* Sun Cycle */}
      <div className="flex justify-center gap-8 text-sm text-[#ff8a8a] py-3 border-b border-[#4d0000] font-mono">
        <span className="flex items-center gap-2">
          <Sunrise className="w-4 h-4 text-[#ff5c5c]" />
          {weather.sun.sunrise}
        </span>
        <span className="flex items-center gap-2">
          <Sunset className="w-4 h-4 text-[#ff5c5c]" />
          {weather.sun.sunset}
        </span>
      </div>

      {/* Daily Forecast */}
      <div className="flex justify-around gap-2 my-4">
        {weather.daily.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex-1 text-center bg-red-900/20 p-2 rounded-lg border border-[#4d0000]"
          >
            <div className="text-xs font-bold text-[#ff8a8a] uppercase">{day.day}</div>
            <div className="text-xl my-1">{getWeatherIcon(day.icon)}</div>
            <div className="text-white font-bold">{day.avg}°</div>
            <div className="flex justify-center gap-2 text-xs border-t border-[#555] mt-1 pt-1">
              <span className="text-[#ff8a8a]">H:{day.high}°</span>
              <span className="text-gray-400">L:{day.low}°</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Conditions Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#4d0000]">
        <div className="bg-black/30 p-2 rounded">
          <span className="text-xs text-[#ff8a8a] block">AQI</span>
          <span className={`text-lg font-bold ${weather.aqi.className}`}>
            {weather.aqi.label}
          </span>
        </div>
        <div className="bg-black/30 p-2 rounded">
          <span className="text-xs text-[#ff8a8a] block">Wind</span>
          <span className="text-lg font-bold text-white flex items-center gap-1">
            <Wind className="w-4 h-4" />
            {weather.current.windSpeed}mph {weather.current.windDirection}
          </span>
        </div>
        <div className="bg-black/30 p-2 rounded">
          <span className="text-xs text-[#ff8a8a] block">Humidity</span>
          <span className="text-lg font-bold text-white flex items-center gap-1">
            <Droplets className="w-4 h-4" />
            {weather.current.humidity}%
          </span>
        </div>
        <div className="bg-black/30 p-2 rounded">
          <span className="text-xs text-[#ff8a8a] block">Feels Like</span>
          <span className="text-lg font-bold text-white flex items-center gap-1">
            <Thermometer className="w-4 h-4" />
            {weather.current.feelsLike}°F
          </span>
        </div>
      </div>
    </motion.div>
  );
}

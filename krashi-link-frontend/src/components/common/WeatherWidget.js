import React, { useState, useEffect } from 'react';
import { CloudIcon, SunIcon, BoltIcon, MapPinIcon } from '@heroicons/react/24/outline';
// Wind Icon ke liye hum ek SVG bana lenge agar Heroicons me nahi mila, 
// par Heroicons me nahi hota to hum custom SVG use kar rahe hain neeche code me.

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState('Locating...');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
          setLocationLabel('📍 Current Farm Location');
        },
        () => {
          // Default: Madhya Pradesh (Center of India)
          fetchWeather(23.2599, 77.4126); 
          setLocationLabel('📍 Madhya Pradesh (Default)');
        }
      );
    } else {
      fetchWeather(23.2599, 77.4126);
      setLocationLabel('📍 Madhya Pradesh (Default)');
    }
  }, []);

  const fetchWeather = async (lat, lng) => {
    try {
      // Added 'windspeed_10m' to API request
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=precipitation_probability_max&timezone=auto`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Weather fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Custom Wind Icon Component
  const WindIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 10.5 5.765 10.5 10.725 0 1.179-.227 2.296-.63 3.321M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  );

  if (loading) return (
    <div className="w-full h-40 bg-gray-100 animate-pulse rounded-2xl mb-6 shadow-sm border border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
    </div>
  );
  
  if (!weather) return null;

  // Logic: 0-3 = Clear, 45-48 = Fog, 51+ = Rain/Drizzle
  const code = weather.current_weather.weathercode;
  const isRaining = code >= 51;
  const isCloudy = code >= 45 && code < 51;
  const isClear = code < 45;

  const rainChance = weather.daily?.precipitation_probability_max?.[0] || 0;
  const windSpeed = weather.current_weather.windspeed; // km/h

  // Dynamic Backgrounds based on conditions
  const getBackground = () => {
    if (isRaining) return 'bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 shadow-slate-300';
    if (isCloudy) return 'bg-gradient-to-br from-gray-400 to-slate-500 shadow-gray-300';
    return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-blue-200'; // Clear Sky Blue
  };

  return (
    <div className={`relative mb-6 rounded-2xl p-6 text-white shadow-xl transition-all duration-500 overflow-hidden ${getBackground()}`}>
      
      {/* Decorative Circles for Glass Effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex justify-between items-start">
        {/* Left Side: Main Info */}
        <div>
          <div className="flex items-center space-x-1 text-blue-50 mb-1">
             <MapPinIcon className="w-3 h-3" />
             <span className="text-xs font-medium tracking-wide">{locationLabel}</span>
          </div>
          
          <div className="flex items-center space-x-3 mt-2">
            {isRaining && <BoltIcon className="w-10 h-10 text-yellow-300 animate-bounce" />}
            {isCloudy && <CloudIcon className="w-10 h-10 text-gray-200 animate-pulse" />}
            {isClear && <SunIcon className="w-10 h-10 text-yellow-300 animate-[spin_10s_linear_infinite]" />}
            
            <div>
              <h3 className="text-4xl font-bold tracking-tight">
                {Math.round(weather.current_weather.temperature)}°
              </h3>
              <p className="text-sm font-medium text-blue-50">
                {isRaining ? 'Heavy Rain' : isCloudy ? 'Cloudy' : 'Sunny Day'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Stats Grid */}
        <div className="flex flex-col gap-2">
          {/* Rain Chance Box */}
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md border border-white/10 min-w-[90px] text-center">
            <p className="text-[10px] uppercase font-bold text-blue-50 mb-0.5">Rain %</p>
            <div className="flex items-center justify-center gap-1">
                <CloudIcon className="w-4 h-4 text-white" />
                <span className="text-lg font-bold">{rainChance}%</span>
            </div>
          </div>

          {/* Wind Speed Box (New Feature) */}
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md border border-white/10 min-w-[90px] text-center">
            <p className="text-[10px] uppercase font-bold text-blue-50 mb-0.5">Wind</p>
            <div className="flex items-center justify-center gap-1">
                {/* Wind Icon (Simple SVG) */}
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-bold">{Math.round(windSpeed)}</span>
                <span className="text-[10px]">km/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Strip (Only if risky) */}
      {(rainChance > 60 || windSpeed > 20) && (
        <div className="mt-4 bg-red-500/80 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse">
            <BoltIcon className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">
                {windSpeed > 20 ? 'Tez Hawa Warning - Spray na karein' : 'Baarish Alert - Fasal bachayein'}
            </span>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
import React, { useState, useEffect } from 'react';
import { CloudIcon, SunIcon, BoltIcon } from '@heroicons/react/24/outline';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Default to Central India if permission denied
          fetchWeather(22.9734, 78.6569);
        }
      );
    } else {
      fetchWeather(22.9734, 78.6569);
    }
  }, []);

  const fetchWeather = async (lat, lng) => {
    try {
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

  if (loading) return <div className="h-24 bg-gray-100 animate-pulse rounded-xl mb-6"></div>;
  if (!weather) return null;

  const isRaining = weather.current_weather.weathercode >= 51;
  const rainChance = weather.daily?.precipitation_probability_max?.[0] || 0;

  return (
    <div className={`mb-6 rounded-xl p-6 text-white shadow-md transition-all ${
      isRaining ? 'bg-gradient-to-r from-gray-700 to-blue-800' : 'bg-gradient-to-r from-orange-400 to-amber-500'
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            {isRaining ? <BoltIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            <h3 className="font-semibold text-lg">Agro Weather</h3>
          </div>
          <p className="text-3xl font-bold mt-2">{weather.current_weather.temperature}°C</p>
          <p className="text-sm opacity-90 mt-1">
            {isRaining ? '🌧️ Rain Expected' : '☀️ Clear Sky'}
          </p>
        </div>
        <div className="text-right bg-white/20 p-3 rounded-lg backdrop-blur-sm">
          <p className="text-xs uppercase font-bold tracking-wide">Rain Chance</p>
          <p className="text-2xl font-bold">{rainChance}%</p>
          {rainChance > 40 && (
            <span className="text-xs bg-red-500 px-2 py-1 rounded mt-1 inline-block">Alert</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
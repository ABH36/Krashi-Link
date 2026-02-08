import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const MandiRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  // NEW: Alag se loading state refresh button ke liye
  const [isRefreshing, setIsRefreshing] = useState(false);

  const MOCK_DATA = [
    { crop: 'Gehu (Wheat)', price: '2,275', trend: 'up', change: '15' },
    { crop: 'Soyabean', price: '4,850', trend: 'down', change: '20' },
    { crop: 'Chana (Gram)', price: '5,100', trend: 'stable', change: '0' },
    { crop: 'Makka (Maize)', price: '2,100', trend: 'up', change: '10' },
    { crop: 'Pyaz (Onion)', price: '1,800', trend: 'up', change: '50' },
    { crop: 'Lahsun (Garlic)', price: '12,500', trend: 'up', change: '200' }, // Added for scroll test
  ];

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    // Agar pehli baar hai to main loader dikhao, nahi to sirf refresh icon ghmao
    if (rates.length === 0) setLoading(true);
    setIsRefreshing(true);
    
    const API_URL = process.env.REACT_APP_MANDI_API_URL;
    const API_KEY = process.env.REACT_APP_MANDI_API_KEY;

    if (API_URL && API_KEY) {
      try {
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`);
        const data = await response.json();
        
        if(data.success) {
            setRates(data.rates); 
            setIsLive(true);
        } else {
            throw new Error("API Error");
        }

      } catch (error) {
        console.warn("⚠️ Switching to Mock Data");
        setRates(MOCK_DATA);
        setIsLive(false);
      }
    } else {
      setTimeout(() => {
        setRates(MOCK_DATA);
        setIsLive(false);
        setLoading(false);
        setIsRefreshing(false);
      }, 800);
    }
    
    setLoading(false);
    // Note: In real API call, move setIsRefreshing(false) inside try/catch finally block
  };

  if (loading) return (
    <div className="h-64 bg-gray-50 animate-pulse rounded-xl mb-6 border border-gray-200 flex items-center justify-center">
        <span className="text-gray-400 text-sm font-medium">Loading Rates...</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 flex flex-col h-full">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <h3 className="text-white font-bold flex items-center text-base md:text-lg">
          <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-100" />
          Aaj Ka Mandi Bhav
        </h3>
        <div className="flex items-center space-x-2">
            {isLive && (
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
            )}
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              {isLive ? 'LIVE UPDATE' : 'INDORE MANDI'}
            </span>
        </div>
      </div>
      
      {/* Column Headers (Important for Clarity) */}
      <div className="bg-gray-50 px-4 py-2 flex justify-between text-xs font-semibold text-gray-500 border-b border-gray-100">
          <span>Fasal (Crop)</span>
          <span>Rate (₹/Quintal)</span>
      </div>

      {/* Scrollable Rates List */}
      {/* max-h-[250px] ensures component doesn't get too long on mobile */}
      <div className="divide-y divide-gray-50 overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-gray-200">
        {rates.map((item, index) => (
          <div key={index} className="flex justify-between items-center px-4 py-3 hover:bg-green-50/50 transition-colors cursor-default">
            
            {/* Crop Name */}
            <div className="flex flex-col">
                <span className="font-semibold text-gray-700 text-sm">{item.crop}</span>
                <span className={`text-[10px] font-medium flex items-center mt-0.5 ${
                    item.trend === 'up' ? 'text-green-600' : 
                    item.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                }`}>
                    {item.trend === 'up' && <ArrowUpIcon className="w-3 h-3 mr-1" />}
                    {item.trend === 'down' && <ArrowDownIcon className="w-3 h-3 mr-1" />}
                    {item.trend === 'stable' && <MinusIcon className="w-3 h-3 mr-1" />}
                    {item.change !== '0' ? `₹${item.change}` : 'Stable'}
                </span>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="font-bold text-gray-900 text-base tabular-nums">₹{item.price}</p>
              <p className="text-[10px] text-gray-400">per quintal</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center">
        <p className="text-[10px] text-gray-400">
            Last Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
        <button 
            onClick={fetchRates} 
            disabled={isRefreshing}
            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-all active:scale-90" 
            title="Refresh Rates"
        >
            <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default MandiRates;
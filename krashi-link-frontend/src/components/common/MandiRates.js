import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, // ✅ CORRECTED NAME
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const MandiRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // --- 📝 MOCK DATA (Backup jab tak API na mile) ---
  const MOCK_DATA = [
    { crop: 'Gehu (Wheat)', price: '2,275', trend: 'up', change: '15' },
    { crop: 'Soyabean', price: '4,850', trend: 'down', change: '20' },
    { crop: 'Chana (Gram)', price: '5,100', trend: 'stable', change: '0' },
    { crop: 'Makka (Maize)', price: '2,100', trend: 'up', change: '10' },
    { crop: 'Pyaz (Onion)', price: '1,800', trend: 'up', change: '50' },
  ];

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    
    // Check if API Key exists in .env
    const API_URL = process.env.REACT_APP_MANDI_API_URL;
    const API_KEY = process.env.REACT_APP_MANDI_API_KEY;

    if (API_URL && API_KEY) {
      // --- 🟢 REAL LIVE MODE ---
      try {
        console.log("📡 Fetching Live Mandi Rates...");
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`);
        const data = await response.json();
        
        if(data.success) {
            setRates(data.rates); 
            setIsLive(true);
        } else {
            throw new Error("API Error");
        }

      } catch (error) {
        console.warn("⚠️ Live API Failed, switching to Mock Data", error);
        // Fallback to Mock
        setRates(MOCK_DATA);
        setIsLive(false);
      }
    } else {
      // --- 🟡 MOCK MODE ---
      setTimeout(() => {
        setRates(MOCK_DATA);
        setIsLive(false);
        setLoading(false);
      }, 800);
    }
    
    setLoading(false);
  };

  if (loading) return (
    <div className="h-48 bg-gray-100 animate-pulse rounded-xl mb-6 border border-gray-200"></div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center text-lg">
          {/* ✅ UPDATED ICON HERE */}
          <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
          Aaj Ka Mandi Bhav
        </h3>
        <div className="flex items-center space-x-2">
            {isLive && <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>}
            <span className="text-green-100 text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
              {isLive ? 'LIVE' : 'Indore Mandi'}
            </span>
        </div>
      </div>
      
      {/* Rates List */}
      <div className="divide-y divide-gray-100">
        {rates.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
            <span className="font-medium text-gray-800">{item.crop}</span>
            <div className="text-right">
              <p className="font-bold text-gray-900 text-lg">₹{item.price}</p>
              <p className={`text-xs flex items-center justify-end font-medium ${
                item.trend === 'up' ? 'text-green-600' : 
                item.trend === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {item.trend === 'up' && <ArrowUpIcon className="w-3 h-3 mr-1" />}
                {item.trend === 'down' && <ArrowDownIcon className="w-3 h-3 mr-1" />}
                {item.trend === 'stable' && <MinusIcon className="w-3 h-3 mr-1" />}
                {item.change !== '0' ? `${item.change}` : 'No Change'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-500">
            Updated: {new Date().toLocaleDateString()}
        </p>
        <button onClick={fetchRates} className="text-green-600 hover:text-green-700" title="Refresh Rates">
            <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MandiRates;
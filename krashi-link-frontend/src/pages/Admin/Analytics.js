import React, { useState } from 'react';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import Button from '../../components/common/Button'; // Assuming you have this
import { 
  ArrowDownTrayIcon, 
  CalendarDaysIcon, 
  ArrowPathIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock Export Function
  const handleExport = () => {
    setIsExporting(true);
    // Simulate API call for PDF generation
    setTimeout(() => {
      setIsExporting(false);
      alert("Report downloaded successfully!");
    }, 2000);
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In a real app, this would trigger a refetch in the child component
    // via a key prop or context
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🟢 Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PresentationChartLineIcon className="w-7 h-7 text-green-600" />
            Platform Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Data • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
            
            {/* Time Range Pills */}
            <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                {['week', 'month', 'year'].map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                            timeRange === range 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>

            <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

            {/* Actions */}
            <button 
                onClick={handleRefresh}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Refresh Data"
            >
                <ArrowPathIcon className="w-5 h-5" />
            </button>

            <Button 
                onClick={handleExport} 
                loading={isExporting}
                variant="primary"
                className="shadow-green-200"
            >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export Report
            </Button>
        </div>
      </div>

      {/* 📊 Main Dashboard Content */}
      {/* Passing 'timeRange' and 'key' to force refresh when range changes */}
      <div className="relative">
         <AnalyticsDashboard range={timeRange} key={lastUpdated.getTime()} />
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-xs text-gray-400 mt-8">
        Data is aggregated from bookings, payments, and user activity logs.
      </div>
    </div>
  );
};

export default Analytics;
import React, { useState, useEffect } from 'react';
import { ClockIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const LiveTimer = ({ startedAt, stoppedAt, status, billing }) => {
  const [timeElapsed, setTimeElapsed] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [liveCost, setLiveCost] = useState(0);

  useEffect(() => {
    let interval;

    const updateTimer = () => {
      const start = new Date(startedAt).getTime();
      const end = stoppedAt ? new Date(stoppedAt).getTime() : Date.now();
      const diff = Math.max(0, end - start);

      // Time Display
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeElapsed({ hours, minutes, seconds });

      // 💰 COST CALCULATION (Exactly matches Backend)
      if (billing.scheme === 'time' || billing.scheme === 'hourly') {
        // Step 1: Calculate Total Minutes (Round UP)
        // e.g. 61000ms -> 1.016 min -> Math.ceil -> 2 minutes
        const totalMinutes = Math.ceil(diff / 60000);
        
        // Step 2: Rate Per Minute
        const ratePerMinute = billing.rate / 60;
        
        // Step 3: Calculate Cost
        let cost = totalMinutes * ratePerMinute;
        
        // Step 4: Min ₹10 & Round Up
        setLiveCost(Math.max(10, Math.ceil(cost)));

      } else if (billing.scheme === 'area') {
        setLiveCost(billing.rate * (billing.areaBigha || 1));
      } else if (billing.scheme === 'daily') {
        // Daily Logic
        const totalMinutes = Math.ceil(diff / 60000);
        const days = Math.ceil(totalMinutes / (60 * 24));
        setLiveCost(Math.max(billing.rate, billing.rate * days));
      }
    };

    updateTimer();
    if (status === 'arrived_otp_verified' || status === 'in_progress') {
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [startedAt, stoppedAt, status, billing]);

  const formatTime = (val) => val.toString().padStart(2, '0');

  const getStatusColor = () => {
    if (['completed_pending_payment', 'paid'].includes(status)) return 'bg-blue-50 border-blue-200 text-blue-800';
    return 'bg-green-50 border-green-200 text-green-800 animate-pulse';
  };

  return (
    <div className={`p-5 rounded-xl border ${getStatusColor()} shadow-sm transition-all`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
                <ClockIcon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Duration</p>
                <p className="text-3xl font-mono font-bold">
                    {formatTime(timeElapsed.hours)}:{formatTime(timeElapsed.minutes)}:<span className="text-primary-600">{formatTime(timeElapsed.seconds)}</span>
                </p>
            </div>
        </div>

        <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            <div className="p-3 bg-white rounded-full shadow-sm">
                <CurrencyRupeeIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {stoppedAt ? 'Final Amount' : 'Estimated Cost'}
                </p>
                <p className="text-3xl font-bold text-green-700">
                    ₹{stoppedAt && billing.calculatedAmount ? billing.calculatedAmount : liveCost}
                </p>
                <p className="text-xs text-gray-500">@ ₹{billing.rate}/{billing.unit}</p>
            </div>
        </div>
      </div>
      
      {/* Note added for clarity */}
      <div className="mt-3 text-center">
          <p className="text-[10px] text-gray-400">
            Billing is calculated per minute (rounded up). Min ₹10.
          </p>
      </div>
    </div>
  );
};

export default LiveTimer;
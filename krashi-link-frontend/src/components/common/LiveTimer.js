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

      // 💰 COST CALCULATION (UNCHANGED)
      if (billing.scheme === 'time' || billing.scheme === 'hourly') {
        const totalMinutes = Math.ceil(diff / 60000);
        const ratePerMinute = billing.rate / 60;
        let cost = totalMinutes * ratePerMinute;
        setLiveCost(Math.max(10, Math.ceil(cost)));
      } else if (billing.scheme === 'area') {
        setLiveCost(billing.rate * (billing.areaBigha || 1));
      } else if (billing.scheme === 'daily') {
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

  // CHANGE 1: Function simplified. Removed 'animate-pulse' from here.
  const isLive = ['arrived_otp_verified', 'in_progress'].includes(status);
  
  return (
    // CHANGE 2: Better Shadow and Border styling
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* Header Bar with Live Indicator */}
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {stoppedAt ? 'Job Summary' : 'Live Status'}
        </span>
        
        {isLive && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold text-red-600">ON AIR</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col md:flex-row gap-6 items-center justify-between">
        
        {/* TIME SECTION */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className={`p-3 rounded-xl ${isLive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            <ClockIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Duration</p>
            {/* CHANGE 3: 'tabular-nums' keeps numbers steady without using ugly mono font */}
            <p className="text-4xl font-bold text-gray-800 tabular-nums tracking-tight">
              {formatTime(timeElapsed.hours)}
              <span className="text-gray-300 mx-1">:</span>
              {formatTime(timeElapsed.minutes)}
              <span className="text-gray-300 mx-1">:</span>
              <span className="text-blue-600">{formatTime(timeElapsed.seconds)}</span>
            </p>
          </div>
        </div>

        {/* Divider for Mobile (Horizontal Line) and Desktop (Vertical Line) */}
        <div className="w-full h-px bg-gray-100 md:w-px md:h-16"></div>

        {/* COST SECTION */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CurrencyRupeeIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">
              {stoppedAt ? 'Final Amount' : 'Estimated Cost'}
            </p>
            <p className="text-4xl font-bold text-green-700 tabular-nums">
              ₹{stoppedAt && billing.calculatedAmount ? billing.calculatedAmount : liveCost}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Rate: ₹{billing.rate}/{billing.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100">
         <p className="text-[10px] text-gray-400 font-medium">
           Billing: Rounded up per minute • Min ₹10
         </p>
      </div>
    </div>
  );
};

export default LiveTimer;
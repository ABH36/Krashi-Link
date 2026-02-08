import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'info', onClose }) => {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose, isPaused]);

  // Premium Styles Configuration
  const config = {
    success: {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      bg: 'bg-white border-green-500',
      title: 'Success',
      progress: 'bg-green-500'
    },
    error: {
      icon: <XCircleIcon className="w-6 h-6 text-red-500" />,
      bg: 'bg-white border-red-500',
      title: 'Error',
      progress: 'bg-red-500'
    },
    warning: {
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />,
      bg: 'bg-white border-amber-500',
      title: 'Warning',
      progress: 'bg-amber-500'
    },
    info: {
      icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
      bg: 'bg-white border-blue-500',
      title: 'Information',
      progress: 'bg-blue-500'
    }
  };

  const style = config[type] || config.info;

  return (
    // CHANGE 1: z-[100] ensures it's above Navbar. top-4 is better than top-20.
    // 'animate-[slideIn_0.3s_ease-out]' gives smooth entry.
    <div 
      className={`fixed top-4 right-4 z-[100] flex flex-col max-w-sm w-full bg-white rounded-lg shadow-2xl border-l-4 ${style.bg} overflow-hidden transform transition-all hover:scale-105 animate-[slideInRight_0.3s_ease-out]`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          {/* CHANGE 2: Dynamic Title based on type */}
          <p className="text-sm font-bold text-gray-900">
            {style.title}
          </p>
          <p className="mt-1 text-sm text-gray-600 leading-snug">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CHANGE 3: Progress Bar Animation */}
      {/* Ye line 5 second me shrink hogi. Agar paused hai to ruk jayegi. */}
      <div className="w-full bg-gray-100 h-1">
        <div 
          className={`h-full ${style.progress}`} 
          style={{ 
            width: '100%',
            animation: isPaused ? 'none' : 'shrink 5s linear forwards'
          }}
        ></div>
      </div>

      {/* Inline Style for Animation Keyframes (Tailwind config me bhi daal sakte ho) */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
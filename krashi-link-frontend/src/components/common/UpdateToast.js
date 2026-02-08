import React from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

const UpdateToast = ({ onRefresh, onClose }) => {
  return (
    // CHANGE 1: Positioning
    // Mobile: fixed bottom-4 (thumb friendly)
    // Desktop: md:top-4 md:right-4 (traditional toast spot)
    <div className="fixed bottom-4 left-4 right-4 md:top-4 md:right-4 md:left-auto md:bottom-auto md:w-96 z-[100]">
      
      {/* Container with Premium Shadow & Border */}
      <div className="bg-white rounded-xl shadow-2xl border border-indigo-100 overflow-hidden animate-[slideIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="p-5">
          <div className="flex items-start">
            
            {/* Icon Area */}
            <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-2">
              <span className="text-2xl animate-bounce block">🚀</span>
            </div>

            {/* Content Area */}
            <div className="ml-4 w-0 flex-1">
              <p className="text-base font-bold text-gray-900">
                New Update Available!
              </p>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                App ki performance behtar banane ke liye naya version ready hai.
              </p>
              
              {/* Buttons Row */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={onRefresh}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md shadow-indigo-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-4 h-4" />
                    Update Now
                  </div>
                </button>
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Top Right Close (Optional shortcut) */}
            <button 
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-500"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>

          </div>
        </div>
        
        {/* Progress Strip (Visual flair) */}
        <div className="h-1 w-full bg-indigo-100">
            <div className="h-full bg-indigo-500 w-full animate-pulse"></div>
        </div>
      </div>

      {/* Animation Style */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UpdateToast;
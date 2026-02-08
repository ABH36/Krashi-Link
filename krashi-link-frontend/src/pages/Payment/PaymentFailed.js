import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircleIcon, ArrowPathIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [failureDetails, setFailureDetails] = useState(null);

  useEffect(() => {
    if (location.state) setFailureDetails(location.state);
  }, [location]);

  const handleRetry = () => {
    if (failureDetails?.bookingId) {
      navigate(`/farmer/payment/${failureDetails.bookingId}`);
    } else {
      navigate('/farmer/bookings');
    }
  };

  const handleWhatsAppSupport = () => {
    const message = `Hi Support, my payment failed for Booking ID: ${failureDetails?.bookingId || 'Unknown'}. Please help.`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-[shake_0.5s_ease-in-out]">
        
        {/* Header */}
        <div className="bg-red-50 p-8 text-center border-b border-red-100">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircleIcon className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
          <p className="text-gray-500 mt-2">
            Don't worry, no money was deducted.
          </p>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-6">
          
          {failureDetails?.error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
               <div className="text-red-500 mt-0.5">⚠️</div>
               <div>
                   <p className="text-xs font-bold text-red-800 uppercase tracking-wide">Error Reason</p>
                   <p className="text-sm text-red-700 mt-1">{failureDetails.error}</p>
               </div>
            </div>
          )}

          {/* Quick Tips (Simplified) */}
          <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl">
             <p className="font-semibold text-gray-800">Possible reasons:</p>
             <ul className="list-disc pl-5 space-y-1">
                <li>Bank server timed out</li>
                <li>Incorrect card details or UPI PIN</li>
                <li>Spending limit reached</li>
             </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleRetry}
              className="w-full bg-red-600 text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>
            
            <button
              onClick={handleWhatsAppSupport}
              className="w-full bg-green-50 text-green-700 py-3.5 px-4 rounded-xl font-bold border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              Chat with Support
            </button>
          </div>

          <button 
            onClick={() => navigate('/farmer/bookings')}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel & Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
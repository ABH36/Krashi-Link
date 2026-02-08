import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, StarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (location.state) setPaymentDetails(location.state);
    else navigate('/farmer/bookings');
  }, [location, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!paymentDetails) return null;

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative animate-[scaleIn_0.3s_ease-out]">
        
        {/* Success Header */}
        <div className="bg-green-600 p-8 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-white/10 pattern-dots"></div>
           <div className="relative z-10">
               <div className="mx-auto bg-white text-green-600 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-lg animate-bounce">
                   <CheckCircleIcon className="w-12 h-12" />
               </div>
               <h1 className="text-2xl font-bold">Payment Successful!</h1>
               <p className="text-green-100 mt-1">Transaction Completed</p>
           </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 relative">
           {/* Perforated Edge Effect (CSS Visual Trick) */}
           <div className="absolute top-0 left-0 w-full h-4 -mt-2 bg-white skew-y-1"></div>

           <div className="text-center mb-6">
               <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Amount Paid</p>
               <p className="text-4xl font-extrabold text-gray-900 mt-1">₹{paymentDetails.amount}</p>
           </div>

           <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm mb-6 border border-gray-100">
               <div className="flex justify-between">
                   <span className="text-gray-500">Payment ID</span>
                   <span className="font-mono font-medium text-gray-800">#{paymentDetails.paymentId?.slice(-8).toUpperCase()}</span>
               </div>
               <div className="flex justify-between">
                   <span className="text-gray-500">Booking ID</span>
                   <span className="font-mono font-medium text-gray-800">#{paymentDetails.bookingId?.slice(-8).toUpperCase()}</span>
               </div>
               <div className="flex justify-between">
                   <span className="text-gray-500">Date</span>
                   <span className="font-medium text-gray-800">{new Date().toLocaleString()}</span>
               </div>
               <div className="flex justify-between pt-3 border-t border-gray-200">
                   <span className="text-gray-500">Method</span>
                   <span className="font-medium text-gray-800">Online Wallet</span>
               </div>
           </div>

           {/* Actions */}
           <div className="space-y-3">
               <button 
                 onClick={() => navigate(`/farmer/review/${paymentDetails.bookingId}`)}
                 className="w-full bg-green-600 text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
               >
                   <StarIcon className="w-5 h-5" /> Rate Service
               </button>

               <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={handlePrint}
                     className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
                   >
                       <ArrowDownTrayIcon className="w-4 h-4" /> Receipt
                   </button>
                   <button 
                     onClick={() => navigate('/farmer/bookings')}
                     className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200"
                   >
                       Home
                   </button>
               </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
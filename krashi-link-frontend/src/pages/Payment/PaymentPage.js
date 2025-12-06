import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import { CheckBadgeIcon, LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getBookingById(bookingId);
        if (response.success) {
          const data = response.data.booking;
          if (data.status === 'paid') {
             // Already paid, go to review directly
             navigate(`/farmer/review/${bookingId}`);
          } else if (data.status !== 'completed_pending_payment') {
             setError('Booking not ready for payment.');
          }
          setBooking(data);
        }
      } catch (err) { setError('Failed to load details.'); } 
      finally { setLoading(false); }
    };
    fetchBookingDetails();
  }, [bookingId, navigate]);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // 1. Initiate Payment
      const initRes = await paymentService.createPaymentOrder(bookingId, booking.billing.calculatedAmount);
      const { isMock } = initRes.data;

      if (isMock) {
          console.log("ℹ️ Simulating Payment...");
          
          // Fake Loading Delay
          await new Promise(r => setTimeout(r, 1500));
          
          // Verify (Mock)
          const verifyRes = await paymentService.verifyPayment({
              isMock: true,
              bookingId: bookingId
          });

          if (verifyRes.success) {
             // 🎉 SUCCESS FLOW
             alert("Payment Successful! ✅");
             // Redirect to Review Page
             navigate(`/farmer/review/${bookingId}`);
          } else {
             alert("Mock Payment Failed");
          }
      } else {
          // If logic ever reaches here (Real Razorpay)
          alert("Razorpay keys not setup. Please check backend logs.");
      }

    } catch (err) { 
      console.error(err); 
      alert("Payment Processing Failed"); 
    } finally { 
      setProcessing(false); 
    }
  };

  if (loading) return <Loader text="Loading Payment..." />;
  if (error) return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <LockClosedIcon className="w-12 h-12 mx-auto mb-2 opacity-90" />
          <h1 className="text-2xl font-bold">Secure Checkout</h1>
          <p className="text-blue-100 text-sm">Krashi Link Payment Gateway</p>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-gray-500">Total Amount to Pay</p>
            <p className="text-4xl font-bold text-gray-900">₹{booking?.billing?.calculatedAmount}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-8 border-t border-b py-4">
             <div className="flex justify-between">
                 <span>Machine:</span>
                 <span className="font-medium text-gray-800">{booking?.machineId?.name}</span>
             </div>
             <div className="flex justify-between">
                 <span>Owner:</span>
                 <span className="font-medium text-gray-800">{booking?.ownerId?.name}</span>
             </div>
             <div className="flex justify-between">
                 <span>Duration:</span>
                 <span className="font-medium text-gray-800">{booking?.timer?.durationMinutes} minutes</span>
             </div>
          </div>
          
          {/* Visual Dummy Card */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 flex items-center">
             <CreditCardIcon className="w-6 h-6 text-gray-500 mr-3" />
             <div>
                <p className="text-sm font-semibold text-gray-700">Test Wallet / Card</p>
                <p className="text-xs text-gray-500">No real money will be deducted</p>
             </div>
             <CheckBadgeIcon className="w-5 h-5 text-green-500 ml-auto" />
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-md transition-all ${
              processing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {processing ? 'Processing...' : `Pay ₹${booking?.billing?.calculatedAmount}`}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            <LockClosedIcon className="w-3 h-3 inline mr-1" />
            Encrypted & Secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
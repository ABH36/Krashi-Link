import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import { 
  CheckBadgeIcon, 
  LockClosedIcon, 
  CreditCardIcon, 
  QrCodeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('wallet');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getBookingById(bookingId);
        if (response.success) {
          const data = response.data.booking;
          if (data.status === 'paid') navigate(`/farmer/review/${bookingId}`);
          else if (data.status !== 'completed_pending_payment') setError('Booking not ready for payment.');
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
      // Simulate Processing Delay
      await new Promise(r => setTimeout(r, 2000));

      const initRes = await paymentService.createPaymentOrder(bookingId, booking.billing.calculatedAmount);
      
      // Mock Verify for Demo
      const verifyRes = await paymentService.verifyPayment({ isMock: true, bookingId: bookingId });

      if (verifyRes.success) {
         navigate(`/farmer/review/${bookingId}`, { state: { paymentSuccess: true } });
      } else {
         alert("Payment Failed. Try again.");
      }

    } catch (err) { 
      console.error(err); 
      alert("Payment Error"); 
    } finally { 
      setProcessing(false); 
    }
  };

  if (loading) return <Loader text="Securely Loading..." />;
  if (error) return <div className="p-10 text-center text-red-600 font-bold bg-gray-50 h-screen flex items-center justify-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-center justify-center animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 pattern-dots"></div>
          <LockClosedIcon className="w-10 h-10 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold tracking-wide">Secure Checkout</h1>
          <p className="text-blue-100 text-sm mt-1">Order ID: #{bookingId.slice(-6).toUpperCase()}</p>
        </div>

        <div className="p-8">
          
          {/* Amount Display */}
          <div className="text-center mb-8">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Total Payable</p>
            <p className="text-5xl font-extrabold text-gray-900 tracking-tight">
                ₹{booking?.billing?.calculatedAmount}
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-8">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedMethod === 'wallet' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="method" value="wallet" checked={selectedMethod === 'wallet'} onChange={() => setSelectedMethod('wallet')} className="hidden" />
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 mr-3">
                      <CreditCardIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <p className="font-bold text-gray-800">KrishiLink Wallet</p>
                      <p className="text-xs text-gray-500">Balance: ₹50,000 (Demo)</p>
                  </div>
                  {selectedMethod === 'wallet' && <CheckBadgeIcon className="w-6 h-6 text-blue-600" />}
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedMethod === 'upi' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="method" value="upi" checked={selectedMethod === 'upi'} onChange={() => setSelectedMethod('upi')} className="hidden" />
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 mr-3">
                      <QrCodeIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <p className="font-bold text-gray-800">UPI / QR Code</p>
                      <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                  </div>
                  {selectedMethod === 'upi' && <CheckBadgeIcon className="w-6 h-6 text-green-600" />}
              </label>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
              processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'
            }`}
          >
            {processing ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : (
                <>Pay Securely</>
            )}
          </button>
          
          <div className="mt-6 flex justify-center items-center gap-2 text-xs text-gray-400">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>256-bit SSL Encrypted Payment</span>
          </div>

          <button onClick={() => navigate(-1)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
              Cancel Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
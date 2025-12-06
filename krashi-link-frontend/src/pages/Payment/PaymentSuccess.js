import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckBadgeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (location.state) {
      setPaymentDetails(location.state);
    } else {
      // If no state, redirect to bookings
      navigate('/farmer/bookings');
    }
  }, [location, navigate]);

  const handleReview = () => {
    if (paymentDetails?.bookingId) {
      navigate(`/farmer/review/${paymentDetails.bookingId}`);
    }
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <CheckBadgeIcon className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">
                  ₹{paymentDetails.amount}
                </span>
              </div>
              
              {paymentDetails.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {paymentDetails.paymentId.slice(0, 8)}...
                  </span>
                </div>
              )}
              
              {paymentDetails.bookingId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono text-sm text-gray-900">
                    {paymentDetails.bookingId.slice(0, 8)}...
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="text-gray-900">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleReview}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              ✨ Leave a Review
            </button>
            
            <Link
              to={`/farmer/bookings/${paymentDetails.bookingId}`}
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium text-center"
            >
              View Booking Details
            </Link>
            
            <Link
              to="/farmer/bookings"
              className="inline-flex items-center justify-center w-full text-blue-600 hover:text-blue-500 font-medium py-2"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to My Bookings
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>✅ Owner has been notified of your payment</li>
              <li>✅ Payment receipt has been generated</li>
              <li>✅ You can now leave a review for the service</li>
              <li>✅ Owner will receive payout within 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
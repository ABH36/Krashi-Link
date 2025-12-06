import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [failureDetails, setFailureDetails] = useState(null);

  useEffect(() => {
    if (location.state) {
      setFailureDetails(location.state);
    }
  }, [location]);

  const handleRetry = () => {
    if (failureDetails?.bookingId) {
      navigate(`/farmer/payment/${failureDetails.bookingId}`);
    } else {
      navigate('/farmer/bookings');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Failure Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <XMarkIcon className="h-12 w-12 text-red-600" />
          </div>

          {/* Failure Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-4">
            We couldn't process your payment. Please try again.
          </p>

          {failureDetails?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                {failureDetails.error}
              </p>
            </div>
          )}

          {/* Common Reasons */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Common reasons for failure:
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card details entered</li>
              <li>• Network connectivity issues</li>
              <li>• Bank server downtime</li>
              <li>• Transaction timeout</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Try Payment Again
            </button>
            
            <Link
              to="/farmer/bookings"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium text-center"
            >
              Back to My Bookings
            </Link>
            
            <div className="pt-4">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <a 
                  href="mailto:support@krashilink.com" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Ensure your card has sufficient funds and try using a different payment method if the issue persists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
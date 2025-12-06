import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import Added
import { useTranslation } from 'react-i18next';
import bookingService from '../../services/bookingService';
import OTPModal from '../common/OTPModal';
import Button from '../common/Button';
import { 
  CheckBadgeIcon, 
  ExclamationTriangleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const FarmerBookingActions = ({ booking, onUpdate, onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // ✅ Hook initialized
  const [showCompletionOTPModal, setShowCompletionOTPModal] = useState(false);
  const [verifyCompletionLoading, setVerifyCompletionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleVerifyCompletion = async (otp) => {
    setVerifyCompletionLoading(true);
    setActionError(null);
    
    try {
      const response = await bookingService.verifyCompletion(booking._id, otp);
      
      if (response.success) {
        if (onUpdate) onUpdate(response.data);
        if (onRefresh) await onRefresh();
        setShowCompletionOTPModal(false);
        alert('✅ Work completed! Bill generated.');
      }
    } catch (error) {
      console.error('Verify completion error:', error);
      setActionError('Failed to verify completion. Please try again.');
    } finally {
      setVerifyCompletionLoading(false);
    }
  };

  const handleResendCompletionOTP = async () => {
    try {
      await bookingService.resendOTP(booking._id, 'completion');
      alert('OTP resent successfully!');
    } catch (error) {
      setActionError('Failed to resend OTP.');
    }
  };

  const renderActionButtons = () => {
    switch (booking.status) {
      case 'requested':
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Waiting for Confirmation</span>
            </div>
            <p className="text-sm text-yellow-700">Request sent to owner.</p>
          </div>
        );

      case 'owner_confirmed':
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Confirmed</span>
            </div>
            <p className="text-sm text-blue-700">Owner will arrive shortly.</p>
          </div>
        );

      case 'arrived_otp_verified':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-800">Work In Progress</span>
              </div>
              <p className="text-sm text-purple-700">Timer is running.</p>
            </div>
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowCompletionOTPModal(true)}
                className="w-full"
              >
                <CheckBadgeIcon className="w-5 h-5 mr-2" />
                Verify Job Completion
              </Button>
            </div>
            {actionError && <p className="text-sm text-red-600 text-center">{actionError}</p>}
          </div>
        );

      case 'completed_pending_payment':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-800">Work Completed!</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ₹{booking.billing.calculatedAmount}
                  </p>
                </div>
                <CheckBadgeIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-3">
                Please complete the payment.
              </p>
              {/* 👇 FIXED BUTTON LOGIC HERE 👇 */}
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(`/farmer/payment/${booking._id}`)}
              >
                💳 Pay Now
              </Button>
            </div>
          </div>
        );

      case 'paid':
        return (
          <div className="p-4 bg-green-100 border border-green-200 rounded-lg text-center">
            <p className="text-green-800 font-bold">Paid & Closed</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Booking Actions</h3>
      {renderActionButtons()}
      
      <OTPModal
        isOpen={showCompletionOTPModal}
        onClose={() => setShowCompletionOTPModal(false)}
        onVerify={handleVerifyCompletion}
        onResend={handleResendCompletionOTP}
        type="completion"
        loading={verifyCompletionLoading}
        resendCooldown={30}
        title="Verify Job Completion"
      />
    </div>
  );
};

export default FarmerBookingActions;
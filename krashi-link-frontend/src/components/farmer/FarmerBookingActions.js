import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import bookingService from '../../services/bookingService';
import OTPModal from '../common/OTPModal';
import Button from '../common/Button';
import Toast from '../common/Toast'; // ✅ Using our custom Toast
import { 
  CheckBadgeIcon, 
  ClockIcon, 
  BanknotesIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const FarmerBookingActions = ({ booking, onUpdate, onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showCompletionOTPModal, setShowCompletionOTPModal] = useState(false);
  const [verifyCompletionLoading, setVerifyCompletionLoading] = useState(false);
  const [toast, setToast] = useState(null); // Toast State

  const handleVerifyCompletion = async (otp) => {
    setVerifyCompletionLoading(true);
    try {
      const response = await bookingService.verifyCompletion(booking._id, otp);
      if (response.success) {
        if (onUpdate) onUpdate(response.data);
        if (onRefresh) await onRefresh();
        setShowCompletionOTPModal(false);
        // ✅ Premium Toast instead of Alert
        setToast({ type: 'success', message: 'Work marked as completed! Bill Generated.' });
      }
    } catch (error) {
      console.error('Verify completion error:', error);
      setToast({ type: 'error', message: 'Verification failed. Invalid OTP.' });
    } finally {
      setVerifyCompletionLoading(false);
    }
  };

  const handleResendCompletionOTP = async () => {
    try {
      await bookingService.resendOTP(booking._id, 'completion');
      setToast({ type: 'info', message: 'OTP resent successfully to your mobile.' });
    } catch (error) {
      setToast({ type: 'error', message: 'Could not resend OTP. Try again.' });
    }
  };

  // --- 🎨 UI: Status Timeline Card ---
  const StatusCard = ({ icon: Icon, colorClass, title, subtitle, children, active = true }) => (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
      active 
        ? `${colorClass} shadow-lg scale-[1.02]` 
        : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full bg-white shadow-sm ${active ? 'animate-pulse-slow' : ''}`}>
           <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1 mb-3 leading-relaxed">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (booking.status) {
      case 'requested':
        return (
          <StatusCard 
            icon={ClockIcon} 
            colorClass="bg-amber-50 border-amber-200 text-amber-700"
            title="Request Sent"
            subtitle="Machine owner ki confirmation ka intezaar hai. Wo 15 min me respond karenge."
          >
             <div className="mt-2 text-xs font-semibold bg-white/50 px-3 py-1 rounded inline-block text-amber-800 border border-amber-100">
                ⏳ Waiting for approval...
             </div>
          </StatusCard>
        );

      case 'owner_confirmed':
        return (
          <StatusCard 
            icon={TruckIcon} 
            colorClass="bg-blue-50 border-blue-200 text-blue-700"
            title="Booking Confirmed!"
            subtitle="Owner ne request accept kar li hai. Machine jald hi farm par pahunchegi."
          >
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-800 bg-white/60 p-2 rounded-lg">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                Machine is on the way
            </div>
          </StatusCard>
        );

      case 'arrived_otp_verified':
        return (
          <StatusCard 
            icon={WrenchScrewdriverIcon} 
            colorClass="bg-purple-50 border-purple-200 text-purple-700"
            title="Work In Progress"
            subtitle="Kaam chal raha hai. Jab kaam khatam ho jaye, tab niche diya gaya button dabayein."
          >
            <div className="mt-4">
               <Button
                variant="primary"
                size="lg"
                onClick={() => setShowCompletionOTPModal(true)}
                className="w-full shadow-purple-500/20 shadow-lg"
              >
                <CheckBadgeIcon className="w-5 h-5 mr-2" />
                Finish Work & Verify
              </Button>
              <p className="text-xs text-center mt-2 text-purple-600">
                Owner aapko OTP batayenge
              </p>
            </div>
          </StatusCard>
        );

      case 'completed_pending_payment':
        return (
          <StatusCard 
            icon={BanknotesIcon} 
            colorClass="bg-green-50 border-green-200 text-green-700"
            title="Payment Pending"
            subtitle="Kaam pura ho gaya hai. Bill generate ho chuka hai."
          >
            <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm mt-2 mb-4">
                <div className="flex justify-between items-end">
                    <span className="text-sm text-gray-500">Total Bill Amount</span>
                    <span className="text-2xl font-bold text-gray-900">₹{booking.billing.calculatedAmount}</span>
                </div>
            </div>
            
            <Button
              variant="primary"
              className="w-full py-3 text-lg shadow-green-600/30 animate-pulse"
              onClick={() => navigate(`/farmer/payment/${booking._id}`)}
            >
              💳 Pay Now
            </Button>
          </StatusCard>
        );

      case 'paid':
        return (
          <StatusCard 
            icon={CheckBadgeIcon} 
            colorClass="bg-gray-50 border-gray-200 text-gray-500"
            title="Completed & Paid"
            subtitle="Payment successful. Thank you for using KrishiLink!"
            active={false}
          >
             <button 
                onClick={() => navigate(`/farmer/bookings`)}
                className="text-sm text-green-600 font-semibold hover:underline flex items-center mt-2"
             >
                View Receipt <ChevronRightIcon className="w-4 h-4 ml-1" />
             </button>
          </StatusCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
        <h3 className="text-lg font-bold text-gray-900">Action Required</h3>
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wide">
            {booking.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Main Dynamic Card */}
      {renderContent()}
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
        />
      )}

      {/* OTP Modal */}
      <OTPModal
        isOpen={showCompletionOTPModal}
        onClose={() => setShowCompletionOTPModal(false)}
        onVerify={handleVerifyCompletion}
        onResend={handleResendCompletionOTP}
        type="completion"
        loading={verifyCompletionLoading}
        resendCooldown={30}
        title="Verify Job Completion"
        // Phone number prop can be passed if available in booking.ownerId.phone
      />
    </div>
  );
};

export default FarmerBookingActions;
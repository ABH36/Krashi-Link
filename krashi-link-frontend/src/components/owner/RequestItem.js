import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import useBookingSocket from '../../hooks/useBookingSocket';
import OTPModal from '../common/OTPModal';
import LiveTimer from '../common/LiveTimer';
import Button from '../common/Button';
import Toast from '../common/Toast'; // ✅ Custom Toast
import { 
  CheckBadgeIcon, 
  XMarkIcon, 
  ClockIcon, 
  UserIcon, 
  CurrencyRupeeIcon, 
  ShieldCheckIcon, 
  MapPinIcon, 
  PhoneIcon,
  EyeIcon,
  ArrowPathIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const RequestItem = ({ request, onUpdate, onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showArrivalOTPModal, setShowArrivalOTPModal] = useState(false);
  const [verifyArrivalLoading, setVerifyArrivalLoading] = useState(false);
  const [toast, setToast] = useState(null); // ✅ Toast State

  // Socket Listener
  useBookingSocket(request._id, (updatedData) => {
    if (onUpdate) onUpdate(request._id, updatedData);
  });

  // --- 📞 CALL FARMER ---
  const handleCallFarmer = () => {
    if (request.farmerId?.phone) {
      window.location.href = `tel:${request.farmerId.phone}`;
    } else {
      setToast({ type: 'error', message: 'Phone number not available' });
    }
  };

  const handleConfirm = async (accept = true) => {
    try {
      setActionLoading(true);
      
      let reason = '';
      if (!accept) {
        reason = prompt('Reason for rejection:'); // Keep prompt for simplicity or use a modal
        if (!reason) { setActionLoading(false); return; }
      }

      const response = await bookingService.confirmBooking(request._id, accept, 60, reason);

      if (response.success) {
        const updatedFields = { 
          status: accept ? 'owner_confirmed' : 'cancelled',
          ...(accept && response.data.arrivalOTP && { otp: { arrivalOTP: response.data.arrivalOTP } }),
          ...(!accept && { cancellationReason: reason })
        };
        
        onUpdate(request._id, updatedFields);
        if (onRefresh) onRefresh();
        setToast({ type: accept ? 'success' : 'info', message: accept ? 'Booking Confirmed!' : 'Booking Rejected.' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update booking.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyArrival = async (otp) => {
    setVerifyArrivalLoading(true);
    try {
      const response = await bookingService.verifyArrival(request._id, otp);
      if (response.success) {
        onUpdate(request._id, { 
          status: 'arrived_otp_verified',
          timer: { startedAt: response.data.timer.startedAt }
        });
        if (onRefresh) onRefresh();
        setShowArrivalOTPModal(false);
        setToast({ type: 'success', message: 'Arrival Verified! Timer Started.' });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Invalid OTP. Please ask Farmer again.' });
    } finally {
      setVerifyArrivalLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await bookingService.resendOTP(request._id, 'arrival');
      if (response.success) {
        onUpdate(request._id, { otp: { arrivalOTP: response.data.otp } });
        setToast({ type: 'success', message: 'OTP Resent successfully.' });
        setShowOTP(true);
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Could not resend OTP.' });
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      requested: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'New Request', icon: ClockIcon },
      owner_confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Confirmed', icon: TruckIcon },
      arrived_otp_verified: { color: 'bg-purple-100 text-purple-800 border-purple-200', text: 'Work In Progress', icon: CheckBadgeIcon },
      completed_pending_payment: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', text: 'Payment Pending', icon: CurrencyRupeeIcon },
      paid: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Paid & Closed', icon: ShieldCheckIcon },
      cancelled: { color: 'bg-red-50 text-red-600 border-red-100', text: 'Cancelled', icon: XMarkIcon }
    };
    
    const style = config[status] || { color: 'bg-gray-100', text: status };
    const Icon = style.icon || ClockIcon;

    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${style.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {style.text}
      </span>
    );
  };

  const renderActionButtons = () => {
    switch (request.status) {
      case 'requested':
        return (
          <div className="flex gap-2 w-full">
            <Button variant="primary" size="sm" loading={actionLoading} onClick={() => handleConfirm(true)} className="flex-1">
              Accept
            </Button>
            <Button variant="danger" size="sm" loading={actionLoading} onClick={() => handleConfirm(false)} className="flex-1">
              Reject
            </Button>
          </div>
        );

      case 'owner_confirmed':
        return (
          <div className="space-y-3 w-full">
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p className="font-semibold">🚜 On the way!</p>
                <p className="text-xs mt-1">Farm par pahunch kar "Verify Arrival" dabayein aur Farmer se OTP mangein.</p>
             </div>
             
             <Button variant="primary" size="sm" onClick={() => setShowArrivalOTPModal(true)} className="w-full shadow-lg shadow-blue-500/20">
               <ShieldCheckIcon className="w-4 h-4 mr-2" />
               Verify Arrival (Ask OTP)
             </Button>

             {/* If OTP needs to be SHARED by Owner (Rare case, but handled) */}
             {request.otp?.arrivalOTP && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                    <span className="text-xs text-gray-500">Your Verification Code:</span>
                    <span className="font-mono font-bold">{request.otp.arrivalOTP}</span>
                </div>
             )}
          </div>
        );

      case 'arrived_otp_verified':
      case 'in_progress':
        return (
           <div className="w-full">
              <Button variant="secondary" size="sm" onClick={() => navigate(`/owner/booking/${request._id}`)} className="w-full">
                View Live Timer
              </Button>
           </div>
        );

      default:
        return (
           <Button variant="outline" size="sm" onClick={() => navigate(`/owner/booking/${request._id}`)} className="w-full">
             View Details
           </Button>
        );
    }
  };

  return (
    <>
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-5 overflow-hidden group">
      
      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
         <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-xl shadow-sm">
                🚜
            </div>
            <div>
                <h3 className="font-bold text-gray-900 leading-tight">{request.machineId?.name || 'Machine'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">ID: #{request._id.slice(-6).toUpperCase()}</p>
            </div>
         </div>
         {getStatusBadge(request.status)}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-sm">
         {/* Farmer Info */}
         <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 relative">
            <div className="bg-white p-1.5 rounded-full shadow-sm">
                <UserIcon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{request.farmerId?.name}</p>
                <div className="flex items-center text-gray-500 text-xs mt-0.5 gap-1">
                    <MapPinIcon className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{request.farmerId?.address?.village || 'Location N/A'}</span>
                </div>
            </div>
            {/* Call Button */}
            <button 
                onClick={handleCallFarmer}
                className="absolute right-2 top-2 p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors"
                title="Call Farmer"
            >
                <PhoneIcon className="w-4 h-4" />
            </button>
         </div>

         {/* Booking Details */}
         <div className="space-y-2 px-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-xs">Start Time</span>
                </div>
                <span className="font-medium text-gray-900 text-xs">
                    {new Date(request.schedule.requestedStartAt).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                    <CurrencyRupeeIcon className="w-4 h-4" />
                    <span className="text-xs">Rate</span>
                </div>
                <span className="font-bold text-gray-900 text-xs bg-green-50 px-2 py-0.5 rounded text-green-700">
                    ₹{request.billing.rate}/{request.billing.unit}
                </span>
            </div>
         </div>
      </div>

      {/* Live Timer Section (if active) */}
      {(['arrived_otp_verified', 'in_progress', 'completed_pending_payment', 'paid'].includes(request.status)) && (
         <div className="mb-4">
           <LiveTimer 
             startedAt={request.timer?.startedAt}
             stoppedAt={request.timer?.stoppedAt}
             status={request.status}
             billing={request.billing}
           />
         </div>
      )}

      {/* Footer Actions */}
      <div className="pt-4 border-t border-gray-100">
         {renderActionButtons()}
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showArrivalOTPModal}
        onClose={() => setShowArrivalOTPModal(false)}
        onVerify={handleVerifyArrival}
        onResend={handleResendOTP}
        type="arrival"
        loading={verifyArrivalLoading}
        autoRead={true}
        phoneNumber={request.farmerId?.phone}
      />
    </div>
    
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default RequestItem;
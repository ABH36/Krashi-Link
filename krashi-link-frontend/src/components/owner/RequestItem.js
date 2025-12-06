import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import useBookingSocket from '../../hooks/useBookingSocket';
import OTPModal from '../common/OTPModal';
import LiveTimer from '../common/LiveTimer';
import Button from '../common/Button';
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
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const RequestItem = ({ request, onUpdate, onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showArrivalOTPModal, setShowArrivalOTPModal] = useState(false);
  const [verifyArrivalLoading, setVerifyArrivalLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Use socket for real-time updates
  useBookingSocket(request._id, (updatedData) => {
    console.log('🔔 Real-time update received in RequestItem:', updatedData);
    if (onUpdate) {
      onUpdate(request._id, updatedData);
    }
  });

  const handleConfirm = async (accept = true) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      let reason = '';
      if (!accept) {
        reason = prompt('Please provide a reason for rejection:');
        if (!reason) {
          setActionLoading(false);
          return;
        }
      }

      const response = await bookingService.confirmBooking(
        request._id, 
        accept, 
        60, 
        reason
      );

      if (response.success) {
        const updatedFields = { 
          status: accept ? 'owner_confirmed' : 'cancelled',
          ...(accept && response.data.arrivalOTP && { 
            otp: { arrivalOTP: response.data.arrivalOTP } 
          }),
          ...(!accept && { cancellationReason: reason })
        };
        
        onUpdate(request._id, updatedFields);
        if (onRefresh) onRefresh();
        alert(accept ? 'Booking confirmed successfully!' : 'Booking rejected!');
      }
    } catch (error) {
      console.error('❌ Error updating booking:', error);
      setActionError('Failed to update booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyArrival = async (otp) => {
    setVerifyArrivalLoading(true);
    setActionError(null);
    
    try {
      const response = await bookingService.verifyArrival(request._id, otp);
      
      if (response.success) {
        onUpdate(request._id, { 
          status: 'arrived_otp_verified',
          timer: { startedAt: response.data.timer.startedAt }
        });
        if (onRefresh) onRefresh();
        setShowArrivalOTPModal(false);
      }
    } catch (error) {
      console.error('❌ Error verifying arrival:', error);
      setActionError('Failed to verify arrival. Please try again.');
    } finally {
      setVerifyArrivalLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setActionError(null);
      const response = await bookingService.resendOTP(request._id, 'arrival');
      if (response.success) {
        onUpdate(request._id, { 
          otp: { arrivalOTP: response.data.otp } 
        });
        alert('OTP resent successfully!');
        setShowOTP(true);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setActionError('Failed to resend OTP.');
    }
  };

  const handleViewDetails = () => {
    navigate(`/owner/booking/${request._id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'owner_confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived_otp_verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed_pending_payment': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'requested': 'Pending Confirmation',
      'owner_confirmed': 'Confirmed - Awaiting Arrival',
      'arrived_otp_verified': 'Work In Progress',
      'in_progress': 'In Progress',
      'completed_pending_payment': 'Completed - Payment Pending',
      'paid': 'Paid & Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const renderActionButtons = () => {
    switch (request.status) {
      case 'requested':
        return (
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={actionLoading}
              onClick={() => handleConfirm(true)}
              disabled={actionLoading}
              className="w-full justify-center"
            >
              <CheckBadgeIcon className="w-4 h-4 mr-1" />
              Confirm Booking
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading}
              onClick={() => handleConfirm(false)}
              disabled={actionLoading}
              className="w-full justify-center"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        );

      case 'owner_confirmed':
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowArrivalOTPModal(true)}
                className="w-full justify-center"
              >
                <ShieldCheckIcon className="w-4 h-4 mr-1" />
                Verify Arrival & Start
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleViewDetails}
                className="w-full justify-center"
              >
                View Details
              </Button>
            </div>

            {/* 👇 FIXED: Responsive OTP Box Layout */}
            {request.otp?.arrivalOTP && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Arrival OTP</p>
                        <p className="text-3xl font-mono font-bold text-green-900 tracking-widest mt-1">
                            {showOTP ? request.otp.arrivalOTP : '••••••'}
                        </p>
                    </div>
                    <div className="bg-white p-1.5 rounded-full cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setShowOTP(!showOTP)}>
                        {showOTP ? <XMarkIcon className="w-5 h-5 text-green-600"/> : <EyeIcon className="w-5 h-5 text-green-600"/>}
                    </div>
                </div>
                
                <p className="text-xs text-green-700 mb-3">
                  Share with farmer when you arrive
                </p>

                <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendOTP}
                      className="w-full flex items-center justify-center text-xs bg-white hover:bg-green-50 border-green-300 text-green-700"
                    >
                      <ArrowPathIcon className="w-3 h-3 mr-1" />
                      Resend OTP
                    </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'arrived_otp_verified':
      case 'in_progress':
        return (
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="flex justify-center items-center space-x-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-green-800 uppercase">Live</span>
              </div>
              <p className="text-xs text-green-700">Work In Progress</p>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewDetails}
              className="w-full justify-center"
            >
              View Live Details
            </Button>
          </div>
        );

      case 'completed_pending_payment':
        return (
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-indigo-800">Bill Amount</span>
                  <span className="text-lg font-bold text-indigo-900">₹{request.billing.calculatedAmount}</span>
               </div>
               <p className="text-[10px] text-indigo-600 mt-1 text-right">Waiting for payment</p>
            </div>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleViewDetails}
              className="w-full justify-center"
            >
              View Details
            </Button>
          </div>
        );

      default:
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewDetails}
            className="w-full justify-center"
          >
            View Details
          </Button>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Request Details */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                 <span className="text-2xl">🚜</span>
              </div>
              <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-none">
                    {request.machineId?.name || 'Machine'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {request._id.slice(-6).toUpperCase()}
                  </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
              {getStatusText(request.status)}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{request.farmerId?.name}</p>
                  <p className="text-xs text-gray-500">{request.farmerId?.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                    <p className="text-sm text-gray-700 line-clamp-1">
                    {request.farmerId?.address?.village || 'Location not shared'}
                    </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Requested Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(request.schedule.requestedStartAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CurrencyRupeeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                    <p className="text-xs text-gray-500">Rate</p>
                    <p className="text-sm font-medium text-gray-900">
                    ₹{request.billing.rate}/{request.billing.unit}
                    </p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Timer */}
          {(['arrived_otp_verified', 'in_progress', 'completed_pending_payment', 'paid'].includes(request.status)) && (
            <div className="mt-2">
              <LiveTimer 
                startedAt={request.timer?.startedAt}
                stoppedAt={request.timer?.stoppedAt}
                status={request.status}
                billing={request.billing}
              />
            </div>
          )}

          {/* Error Display */}
          {actionError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <XMarkIcon className="w-4 h-4 shrink-0" />
              {actionError}
            </div>
          )}
        </div>

        {/* Actions Column (Fixed width on desktop) */}
        <div className="w-full lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
          {renderActionButtons()}
        </div>
      </div>

      <OTPModal
        isOpen={showArrivalOTPModal}
        onClose={() => {
          setShowArrivalOTPModal(false);
          setActionError(null);
        }}
        onVerify={handleVerifyArrival}
        onResend={handleResendOTP}
        type="arrival"
        loading={verifyArrivalLoading}
        autoRead={true}
        resendCooldown={30}
        phoneNumber={request.farmerId?.phone}
        title="Verify Machine Arrival"
        description="Ask the farmer for the OTP to start the work."
        error={actionError}
      />
    </div>
  );
};

export default RequestItem;
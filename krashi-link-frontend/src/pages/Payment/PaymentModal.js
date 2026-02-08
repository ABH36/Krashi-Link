import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentService } from '../../services/paymentService';
import Button from '../../components/common/Button';
import { 
  CurrencyRupeeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

const PaymentModal = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.initiatePayment(
        booking._id, 
        booking.billing.calculatedAmount
      );

      if (response.success) {
        setStep(2);
        if (onPaymentSuccess) {
          onPaymentSuccess(response.data);
        }
      } else {
          setError(response.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-md animate-[scaleIn_0.2s_ease-out]">
          
          {/* Header */}
          <div className="bg-gray-50 px-4 py-4 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <LockClosedIcon className="w-5 h-5 text-green-600" />
                Secure Payment
             </h3>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
             </button>
          </div>

          <div className="p-6">
            {step === 1 ? (
              <div className="space-y-6">
                
                {/* Hero Amount */}
                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Payable Amount</p>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        ₹{booking.billing.calculatedAmount.toLocaleString()}
                    </h1>
                </div>

                {/* Booking Summary Card */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Service</span>
                        <span className="font-medium text-gray-900">{booking.machineId?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Provider</span>
                        <span className="font-medium text-gray-900">{booking.ownerId?.name}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-500">Duration</span>
                        <span className="font-medium text-gray-900">{booking.timer.durationMinutes} mins</span>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Payment Method</label>
                    <div className="border-2 border-blue-500 bg-blue-50 rounded-xl p-4 flex items-center gap-3 relative cursor-pointer">
                        <div className="absolute top-3 right-3 text-blue-600">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <WalletIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-900">KrishiLink Wallet</p>
                            <p className="text-xs text-blue-700">Safe & Secure Transfer</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                {/* Action */}
                <Button
                  variant="primary"
                  onClick={handleInitiatePayment}
                  loading={loading}
                  className="w-full py-3.5 text-lg shadow-lg shadow-green-200 rounded-xl"
                >
                  Pay ₹{booking.billing.calculatedAmount}
                </Button>
                
                <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Payments are SSL Encrypted & Secure
                </div>

              </div>
            ) : (
              // SUCCESS STEP
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                    Your transaction is pending admin verification. You will be notified once approved.
                </p>
                <Button variant="primary" onClick={onClose} className="w-full">
                    Done
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
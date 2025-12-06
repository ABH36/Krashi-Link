import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentService } from '../../services/paymentService';
import Button from '../../components/common/Button';
import { 
  CurrencyRupeeIcon,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const PaymentModal = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.initiatePayment(
        booking._id, 
        booking.billing.calculatedAmount
      );

      if (response.success) {
        setStep(2);
        if (onPaymentSuccess) {
          onPaymentSuccess(response.data);
        }
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              {step === 1 ? 'Complete Payment' : 'Payment Initiated'}
            </h3>
          </div>

          {step === 1 ? (
            <div className="mt-6 space-y-4">
              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Machine:</span>
                    <span className="font-medium">{booking.machineId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner:</span>
                    <span className="font-medium">{booking.ownerId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{booking.timer.durationMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">
                      ₹{booking.billing.rate}/{booking.billing.unit} ({booking.billing.scheme})
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">₹{booking.billing.calculatedAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method (Wallet-style) */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <CurrencyRupeeIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Krashi-Link Wallet</div>
                      <div className="text-sm text-gray-600">Internal payment system</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Selected</div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <ClockIcon className="w-4 h-4 text-blue-600 mt-0.5 mr-2" />
                  <div className="text-sm text-blue-700">
                    <strong>Note:</strong> Payment requires admin verification. Funds will be held until verified.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  onClick={handleInitiatePayment}
                  loading={loading}
                  className="flex-1"
                >
                  Pay ₹{booking.billing.calculatedAmount}
                </Button>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4 text-center">
              {/* Success State */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <CheckBadgeIcon className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-800 mb-2">Payment Initiated Successfully!</h4>
                <p className="text-sm text-green-700">
                  Your payment of <strong>₹{booking.billing.calculatedAmount}</strong> has been initiated and is pending admin verification.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start text-sm text-yellow-700">
                  <ClockIcon className="w-4 h-4 mt-0.5 mr-2" />
                  <div>
                    <strong>Next Steps:</strong> Admin will verify your payment within 24 hours. You'll receive a notification once verified.
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={onClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

const OTPModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  onResend,
  type = 'arrival', 
  loading = false,
  autoRead = false,
  resendCooldown = 30,
  phoneNumber = ''
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Auto-read OTP from clipboard
  useEffect(() => {
    if (isOpen && autoRead) {
      attemptAutoRead();
    }
  }, [isOpen, autoRead]);

  // Resend cooldown timer
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const attemptAutoRead = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const numbers = clipboardText.replace(/\D/g, '').split('').slice(0, 6);
      
      if (numbers.length === 6) {
        const newOtp = [...otp];
        numbers.forEach((num, index) => {
          if (index < 6) newOtp[index] = num;
        });
        setOtp(newOtp);
        setError('✅ OTP auto-filled from clipboard!');
        
        setTimeout(() => {
          handleVerify(numbers.join(''));
        }, 1000);
      }
    } catch (error) {
      console.log('Auto-read failed, manual entry required');
    }
  };

  const handleChange = useCallback((index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }

      if (newOtp.every(digit => digit !== '') && index === 5) {
        handleVerify(newOtp.join(''));
      }
    }
  }, [otp]);

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    if (pastedNumbers.length !== 6) {
      setError('Please paste exactly 6 digits');
      return;
    }

    const newOtp = [...otp];
    pastedNumbers.forEach((num, index) => {
      if (index < 6) {
        newOtp[index] = num;
      }
    });
    
    setOtp(newOtp);
    setError('✅ OTP pasted successfully!');
    
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = (otpString = null) => {
    const finalOtp = otpString || otp.join('');
    
    if (finalOtp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!/^\d{6}$/.test(finalOtp)) {
      setError('OTP must contain only numbers');
      return;
    }

    setError('');
    onVerify(finalOtp);
  };

  const handleResend = () => {
    if (canResend && onResend) {
      setTimeLeft(resendCooldown);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setError('');
      onResend();
      
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  const clearAll = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'arrival':
        return '🚜 Verify Machine Arrival';
      case 'completion':
        return '✅ Verify Job Completion';
      case 'payment':
        return '💰 Verify Payment';
      default:
        return '🔐 OTP Verification';
    }
  };

  const getDescription = () => {
    const baseDescriptions = {
      arrival: 'Enter the 6-digit OTP to verify machine arrival and start the timer',
      completion: 'Enter the 6-digit OTP to verify job completion and stop the timer',
      payment: 'Enter the 6-digit OTP to confirm payment transaction'
    };
    return baseDescriptions[type] || 'Enter the 6-digit OTP';
  };

  const getInstructions = () => {
    if (phoneNumber) {
      return `OTP sent to ${phoneNumber}`;
    }
    
    switch (type) {
      case 'arrival':
        return 'Enter the arrival OTP you received';
      case 'completion':
        return 'Enter the completion OTP you received';
      default:
        return 'Enter the 6-digit verification code';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <span className="text-blue-600 text-lg font-semibold">
                {type === 'arrival' ? '🚜' : type === 'completion' ? '✅' : '🔐'}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              {getTitle()}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {getDescription()}
            </p>
            <p className="mt-1 text-xs text-blue-600 font-medium">
              {getInstructions()}
            </p>
          </div>

          <div className="mt-6">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
            
            {error && (
              <div className={`mt-3 text-center text-sm ${
                error.includes('✅') ? 'text-green-600' : 'text-red-600'
              }`}>
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="primary"
              onClick={() => handleVerify()}
              loading={loading}
              disabled={otp.join('').length !== 6 || loading}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              🗑️ Clear All
            </button>
            
            {onResend && (
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || loading}
                className={`text-sm font-medium ${
                  canResend 
                    ? 'text-blue-600 hover:text-blue-700' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {canResend ? '🔄 Resend OTP' : `Resend in ${timeLeft}s`}
              </button>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>💡 Quick Tips:</strong><br/>
              • Paste OTP with Ctrl+V<br/>
              • Use arrow keys to navigate<br/>
              • Auto-submits when complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
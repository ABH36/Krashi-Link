import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from './Button'; // Assuming you have this
import { ClipboardDocumentListIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Auto-read (Browser support vary karta hai, isliye manual paste button bhi add kiya hai)
  useEffect(() => {
    if (isOpen && autoRead) {
      attemptAutoRead();
    }
  }, [isOpen, autoRead]);

  // Timer Logic
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
      processInput(clipboardText);
    } catch (error) {
      // Silent fail - user can paste manually
    }
  };

  // Common function to process any string input (Paste or Auto-read)
  const processInput = (text) => {
    const numbers = text.replace(/\D/g, '').split('').slice(0, 6);
    if (numbers.length === 6) {
      const newOtp = [...otp];
      numbers.forEach((num, index) => { if (index < 6) newOtp[index] = num; });
      setOtp(newOtp);
      setError('');
      // Auto submit logic
      setTimeout(() => handleVerify(numbers.join('')), 500);
    }
  };

  const handleChange = useCallback((index, value) => {
    // Sirf numbers allow karo
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
      
      // Auto verify on last digit fill
      if (newOtp.every(digit => digit !== '') && index === 5) {
        handleVerify(newOtp.join(''));
      }
    }
  }, [otp]);

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1].focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1].focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    processInput(pastedData);
  };

  const handleVerify = (otpString = null) => {
    const finalOtp = otpString || otp.join('');
    if (finalOtp.length !== 6) {
      setError('Please enter all 6 digits');
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
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  };

  // Icons based on type
  const getIcon = () => {
    switch (type) {
      case 'arrival': return '🚜';
      case 'completion': return '✅';
      case 'payment': return '💰';
      default: return '🔐';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop with Blur */}
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-md animate-[fadeIn_0.3s_ease-out]">
          
          <div className="px-6 py-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl mb-4">
                {getIcon()}
              </div>
              <h3 className="text-xl font-bold text-gray-900">Verification Code</h3>
              <p className="mt-2 text-sm text-gray-500">
                {type === 'arrival' ? 'Confirming Machine Arrival' : 'Confirming Transaction'}
              </p>
              <p className="mt-1 text-sm font-medium text-green-700">
                {phoneNumber ? `Sent to ${phoneNumber}` : 'Check your SMS for OTP'}
              </p>
            </div>

            <div className="mt-8">
              {/* CHANGE 1: Responsive Grid & AutoComplete */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    // CRITICAL for Mobile Auto-fill
                    autoComplete="one-time-code"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className={`
                      w-10 h-12 sm:w-12 sm:h-14 
                      text-center text-xl font-bold rounded-xl border-2 outline-none transition-all shadow-sm
                      ${error ? 'border-red-300 bg-red-50 text-red-600 animate-shake' : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'}
                    `}
                  />
                ))}
              </div>

              {/* Paste Button for easier Mobile use */}
              <div className="flex justify-center mt-3">
                 <button 
                   onClick={() => attemptAutoRead()}
                   className="flex items-center text-xs text-gray-500 hover:text-green-600 transition-colors py-1 px-2 rounded hover:bg-green-50"
                 >
                    <ClipboardDocumentListIcon className="w-3 h-3 mr-1" />
                    Paste from Clipboard
                 </button>
              </div>
              
              {error && (
                <p className="mt-2 text-center text-sm font-medium text-red-600 animate-pulse">
                  {error}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleVerify()}
                  loading={loading}
                  disabled={otp.join('').length !== 6 || loading}
                  className="w-full py-3 text-lg shadow-lg shadow-green-600/20"
                >
                  {loading ? 'Verifying...' : 'Verify & Proceed'}
                </Button>
                
                <div className="flex justify-between items-center mt-2 px-2">
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">
                        Cancel
                    </button>
                    
                    {onResend && (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!canResend || loading}
                            className={`flex items-center text-sm font-medium transition-colors ${
                                canResend ? 'text-green-600 hover:text-green-700' : 'text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {canResend ? (
                                <>
                                    <ArrowPathIcon className="w-3 h-3 mr-1" /> Resend Code
                                </>
                            ) : (
                                `Resend in ${timeLeft}s`
                            )}
                        </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { 
  PhoneIcon, 
  LockClosedIcon, 
  KeyIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP & New Pass
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await authService.forgotPassword(phone);
      if (response.success) {
        setStep(2);
        setMessage('OTP sent to your phone.');
        
        // 🚜 HYBRID OTP ALERT
        if (response.test_otp) {
            alert(`🚜 PASSWORD RESET OTP: ${response.test_otp}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword(phone, otp, newPassword);
      if (response.success) {
        alert('Password Reset Successful! Please login with new password.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Processing..." />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-[fadeIn_0.5s_ease-out]">
        
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <KeyIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? "Enter your registered phone number" : "Enter OTP and new password"}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-sm rounded">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-3 text-sm rounded">
              {message}
            </div>
          )}

          {step === 1 ? (
            /* --- STEP 1 FORM --- */
            <form className="space-y-6" onSubmit={handleSendOTP}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    className="input-field pl-10 py-3 rounded-xl w-full border-gray-300"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength="10"
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl">
                Send OTP
              </Button>
            </form>
          ) : (
            /* --- STEP 2 FORM --- */
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">OTP Code</label>
                <input
                  type="text"
                  required
                  className="input-field py-3 rounded-xl w-full border-gray-300 text-center tracking-[0.5em] font-bold text-lg"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-10 py-3 rounded-xl w-full border-gray-300"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength="6"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl shadow-lg shadow-green-200">
                Change Password
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
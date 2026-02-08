import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { 
  PhoneIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  InformationCircleIcon, // ✅ About Link Icon
  ShieldCheckIcon        // ✅ Privacy Link Icon
} from '@heroicons/react/24/outline';

const Login = () => {
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const { isHindi } = useLocale();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => { clearError(); }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.phone, formData.password);
    if (result.success) navigate('/');
  };

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-[fadeIn_0.5s_ease-out]">
        
        {/* ✅ LOGO SECTION */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100 border-4 border-green-50 p-4">
            <img 
              src="/logo.png" 
              alt="KrishiLink Logo" 
              className="w-full h-full object-contain drop-shadow-sm hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            {t('app.tagline')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm font-medium animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Phone Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">{t('auth.phone')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="phone" type="tel" required
                    className="input-field pl-10 py-3 rounded-xl w-full border-gray-300 focus:ring-green-500 focus:border-green-500 block sm:text-sm shadow-sm"
                    placeholder={isHindi ? "९८७६५४३२१०" : "9876543210"}
                    value={formData.phone} onChange={handleChange} pattern="[6-9]\d{9}" maxLength="10"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">{t('auth.password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password" type={showPassword ? "text" : "password"} required
                    className="input-field pl-10 pr-10 py-3 rounded-xl w-full border-gray-300 focus:ring-green-500 focus:border-green-500 block sm:text-sm shadow-sm"
                    placeholder="••••••••"
                    value={formData.password} onChange={handleChange} minLength="6"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* ✅ Forgot Password Link Kept Safe */}
                <div className="flex justify-end mt-1">
                    <Link to="/forgot-password" className="text-xs font-semibold text-green-600 hover:text-green-700">
                        {t('auth.forgotPassword')}
                    </Link>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full py-3.5 rounded-xl shadow-lg shadow-green-500/30">
                {t('auth.login')}
              </Button>
            </div>

            <div className="text-center pt-2">
              <span className="text-sm text-gray-500">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="font-bold text-green-600 hover:text-green-700 underline">
                  {t('auth.register')}
                </Link>
              </span>
            </div>

            {/* ✅ About & Privacy Links Kept Safe */}
            <div className="mt-6 border-t border-gray-100 pt-4 flex justify-center items-center gap-6">
                <Link to="/about" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-green-600 transition-colors group">
                    <InformationCircleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {t('profile.aboutUs')}
                </Link>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <Link to="/privacy" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-green-600 transition-colors group">
                    <ShieldCheckIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {t('profile.privacyPolicy')}
                </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
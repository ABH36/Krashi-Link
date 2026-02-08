import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { 
  UserIcon, 
  PhoneIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  WrenchScrewdriverIcon, 
  SunIcon 
} from '@heroicons/react/24/outline';

const Register = () => {
  const { register, login, logout, loading, error, clearError } = useAuth();
  const { isHindi } = useLocale();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', confirmPassword: '', role: 'farmer'
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { logout(); localStorage.removeItem('token'); }, []); 
  useEffect(() => { clearError(); }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = t('auth.validation.nameRequired');
    if (!formData.phone) errors.phone = t('auth.validation.phoneRequired');
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) errors.phone = t('auth.validation.phoneInvalid');
    if (!formData.password) errors.password = t('auth.validation.passwordRequired');
    else if (formData.password.length < 6) errors.password = t('auth.validation.passwordMin');
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = t('auth.validation.matchPassword');
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const { confirmPassword, ...registerData } = formData;
    const regResult = await register(registerData);
    
    // ✅ Logic Preserved: OTP Alert & Auto Login
    if (regResult && regResult.success) {
        const testOtp = regResult.data?.test_otp || regResult.test_otp;
        if (testOtp) alert(`🚜 VERIFICATION OTP: ${testOtp}`); // Shows OTP in Alert
        
        const loginResult = await login(formData.phone, formData.password);
        if (loginResult.success) {
             const targetPath = formData.role === 'owner' ? '/owner/dashboard' : '/farmer/dashboard';
             window.location.href = targetPath;
        }
    }
  };

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full animate-[fadeIn_0.5s_ease-out]">
        
        {/* ✅ LOGO SECTION */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-green-50 p-3">
            <img 
              src="/logo.png" 
              alt="KrishiLink Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('auth.register')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('app.tagline')}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Role Selection (Logic Preserved) */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center uppercase tracking-wide">
                    {t('auth.role')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setFormData(prev => ({ ...prev, role: 'farmer' }))}
                        className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${formData.role === 'farmer' ? 'border-green-500 bg-green-50 text-green-700 shadow-md transform scale-105' : 'border-gray-200 hover:border-green-200 text-gray-500'}`}>
                        <SunIcon className="w-8 h-8 mb-2" />
                        <span className="font-bold">{t('auth.farmer')}</span>
                    </div>
                    <div onClick={() => setFormData(prev => ({ ...prev, role: 'owner' }))}
                        className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${formData.role === 'owner' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-105' : 'border-gray-200 hover:border-blue-200 text-gray-500'}`}>
                        <WrenchScrewdriverIcon className="w-8 h-8 mb-2" />
                        <span className="font-bold">{t('auth.owner')}</span>
                    </div>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-gray-400" /></div>
                <input name="name" type="text" required className="input-field pl-10 py-3 rounded-xl w-full border-gray-300 focus:ring-green-500 focus:border-green-500" placeholder={isHindi ? "आपका पूरा नाम" : "Your full name"} value={formData.name} onChange={handleChange} />
                {validationErrors.name && <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><PhoneIcon className="h-5 w-5 text-gray-400" /></div>
                <input name="phone" type="tel" required className="input-field pl-10 py-3 rounded-xl w-full border-gray-300 focus:ring-green-500 focus:border-green-500" placeholder="9876543210" value={formData.phone} onChange={handleChange} maxLength="10" />
                {validationErrors.phone && <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockClosedIcon className="h-5 w-5 text-gray-400" /></div>
                <input name="password" type={showPassword ? "text" : "password"} required className="input-field pl-10 pr-10 py-3 rounded-xl w-full border-gray-300 focus:ring-green-500 focus:border-green-500" placeholder="Min 6 chars" value={formData.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">{showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
                {validationErrors.password && <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockClosedIcon className="h-5 w-5 text-gray-400" /></div>
                <input name="confirmPassword" type={showPassword ? "text" : "password"} required className="input-field pl-10 py-3 rounded-xl w-full border-gray-300 focus:ring-green-500 focus:border-green-500" placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} />
                {validationErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>}
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} disabled={loading} className="w-full py-3.5 rounded-xl shadow-lg shadow-green-500/30">
              {t('auth.register')}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-500">
                {t('auth.haveAccount')}{' '}
                <Link to="/login" className="font-bold text-green-600 hover:text-green-700 underline">
                  {t('auth.login')}
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
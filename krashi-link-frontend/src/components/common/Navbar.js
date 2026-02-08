import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useSocket } from '../../context/SocketContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import Toast from './Toast';
import { 
  UserIcon, 
  LanguageIcon, 
  ChevronDownIcon, 
  Bars3Icon, 
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

// 🎨 HELPER: Smart Link Component (Handles Active State)
const NavLink = ({ to, children, mobile = false, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const baseClasses = mobile
    ? "block px-4 py-3 rounded-lg text-base font-medium transition-colors"
    : "px-3 py-2 rounded-lg text-sm font-medium transition-all";

  const activeClasses = isActive
    ? "bg-green-50 text-green-700 font-bold"
    : "text-gray-600 hover:bg-gray-50 hover:text-green-600";

  return (
    <Link to={to} className={`${baseClasses} ${activeClasses}`} onClick={onClick}>
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleLanguage, isHindi } = useLocale();
  const { t } = useTranslation();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const profileRef = useRef(null); // To detect outside clicks

  // --- 🔔 NOTIFICATION LOGIC (UNCHANGED) ---
  useEffect(() => {
    if (socket && user) {
      const handleNotification = (data) => {
        console.log("🔔 Personal Notification:", data);
        try { const audio = new Audio(NOTIFICATION_SOUND); audio.play().catch(e => {}); } catch(e) {}
        setToast({ message: data.message, type: data.type || 'info' });
      };
      socket.on('notification', handleNotification);
      return () => socket.off('notification', handleNotification);
    }
  }, [socket, user]);

  // --- 🖱️ CLOSE DROPDOWNS ON OUTSIDE CLICK ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); setIsProfileOpen(false); };
  
  const getDashboardPath = () => {
    if(!user) return '/login'; 
    return user.role === 'admin' ? '/admin/dashboard' : user.role === 'owner' ? '/owner/dashboard' : '/farmer/dashboard'; 
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Glassmorphism Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-lg border-b border-green-100/50 shadow-sm transition-all">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* ✅ LOGO AREA (Updated to use public/logo.png) */}
            <Link to={getDashboardPath()} className="flex items-center gap-3 group">
              {/* Logo Image */}
              <img 
                src="/logo.png" 
                alt="KrishiLink Logo" 
                className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
              />
              {/* App Name with Gradient */}
              <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 tracking-tight">
                {t('app.name')}
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <button 
                onClick={toggleLanguage} 
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors border border-transparent hover:border-green-100"
              >
                <LanguageIcon className="w-4 h-4" />
                <span>{isHindi ? 'English' : 'हिंदी'}</span>
              </button>

              {/* Dynamic Links Based on Role */}
              {user?.role === 'farmer' && (
                <>
                  <NavLink to="/farmer/machines">Machines</NavLink>
                  <NavLink to="/farmer/bookings">My Bookings</NavLink>
                </>
              )}
              {user?.role === 'owner' && (
                <>
                  <NavLink to="/owner/my-machines">My Machines</NavLink>
                  <NavLink to="/owner/requests">Requests</NavLink>
                </>
              )}

              {/* Auth Buttons / Profile */}
              {user ? (
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <NotificationBell />
                  
                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)} 
                      className="flex items-center space-x-2 p-1 pr-3 rounded-full border border-gray-200 hover:shadow-md hover:border-green-200 transition-all bg-white"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu with Animation */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-[fadeIn_0.2s_ease-out] ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700" onClick={() => setIsProfileOpen(false)}>
                            <UserIcon className="w-4 h-4 inline mr-2"/>
                            {t('profile.title')}
                          </Link>
                        </div>
                        <div className="py-1 border-t border-gray-50">
                          <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                            {t('common.logout')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 ml-4">
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-green-600 px-3 py-2">
                    {t('common.login')}
                  </Link>
                  <Link to="/register" className="text-sm font-medium bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all active:scale-95">
                    {t('common.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              {user && <NotificationBell />}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu with Smooth Transition */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pt-2 pb-6 space-y-2 bg-white border-t border-gray-100 shadow-inner">
            <button onClick={toggleLanguage} className="flex w-full items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <LanguageIcon className="w-5 h-5 text-green-600" />
              <span>{isHindi ? 'Switch to English' : 'हिंदी में बदलें'}</span>
            </button>
            
            {user ? (
              <>
                <div className="px-4 py-3 bg-green-50/50 border border-green-100 rounded-lg flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200">
                     {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                {user.role === 'farmer' && (
                  <>
                    <NavLink to="/farmer/machines" mobile onClick={()=>setIsMenuOpen(false)}>Machines</NavLink>
                    <NavLink to="/farmer/bookings" mobile onClick={()=>setIsMenuOpen(false)}>Bookings</NavLink>
                  </>
                )}
                {user.role === 'owner' && (
                  <>
                    <NavLink to="/owner/my-machines" mobile onClick={()=>setIsMenuOpen(false)}>My Machines</NavLink>
                    <NavLink to="/owner/requests" mobile onClick={()=>setIsMenuOpen(false)}>Requests</NavLink>
                  </>
                )}
                
                <div className="border-t border-gray-100 my-2 pt-2">
                    <button onClick={handleLogout} className="flex w-full items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium">
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                        {t('common.logout')}
                    </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Link to="/login" className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50" onClick={()=>setIsMenuOpen(false)}>
                    {t('common.login')}
                </Link>
                <Link to="/register" className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg font-medium shadow-lg shadow-green-600/20 active:scale-95" onClick={()=>setIsMenuOpen(false)}>
                    {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
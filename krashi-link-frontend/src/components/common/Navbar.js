import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useSocket } from '../../context/SocketContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import Toast from './Toast';
import { HomeIcon, UserIcon, LanguageIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleLanguage, isHindi } = useLocale();
  const { t } = useTranslation();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // --- 🔊 FIX: LISTEN ONLY TO PERSONAL NOTIFICATIONS ---
  useEffect(() => {
    if (socket && user) {
      // Sirf 'notification' event suno jo Backend Controller bhejta hai
      const handleNotification = (data) => {
        console.log("🔔 Personal Notification:", data);
        
        // Sound
        try { const audio = new Audio(NOTIFICATION_SOUND); audio.play().catch(e => {}); } catch(e) {}

        // Toast
        setToast({ message: data.message, type: data.type || 'info' });
      };

      socket.on('notification', handleNotification);
      return () => socket.off('notification', handleNotification);
    }
  }, [socket, user]);
  // ----------------------------------------------------

  const handleLogout = () => { logout(); navigate('/login'); setIsProfileOpen(false); };
  const getDashboardPath = () => { /* Same logic */ if(!user) return '/login'; return user.role === 'admin' ? '/admin/dashboard' : user.role === 'owner' ? '/owner/dashboard' : '/farmer/dashboard'; };
  const getRoleDisplayName = (role) => role;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={getDashboardPath()} className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"><HomeIcon className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold">{t('app.name')}</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={toggleLanguage} className="flex items-center space-x-1 text-gray-600 hover:text-primary-600">
                <LanguageIcon className="w-5 h-5" /><span>{isHindi ? 'English' : 'हिंदी'}</span>
              </button>
              {user?.role === 'farmer' && (<><Link to="/farmer/machines" className="text-gray-700 hover:text-primary-600">Machines</Link><Link to="/farmer/bookings" className="text-gray-700 hover:text-primary-600">My Bookings</Link></>)}
              {user?.role === 'owner' && (<><Link to="/owner/my-machines" className="text-gray-700 hover:text-primary-600">My Machines</Link><Link to="/owner/requests" className="text-gray-700 hover:text-primary-600">Requests</Link></>)}

              {user ? (
                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <div className="relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-primary-600" /></div>
                      <span className="font-medium">{user.name}</span><ChevronDownIcon className="w-4 h-4" />
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100"><p className="text-sm font-medium text-gray-900">{user.name}</p><p className="text-xs text-gray-500 capitalize">{getRoleDisplayName(user.role)}</p></div>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{t('auth.logout')}</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4"><Link to="/login" className="text-gray-600">{t('auth.login')}</Link><Link to="/register" className="btn-primary text-sm">{t('auth.register')}</Link></div>
              )}
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              {user && <NotificationBell />}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-primary-600">
                {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
          {/* Mobile Dropdown (Copy existing mobile menu JSX here) */}
           {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
               <div className="flex flex-col space-y-4">
                  <button onClick={toggleLanguage} className="flex items-center space-x-2 text-gray-600"><LanguageIcon className="w-5 h-5" /><span>{isHindi ? 'Switch to English' : 'हिंदी'}</span></button>
                  {user ? (
                     <>
                        <div className="flex items-center space-x-2 py-2">
                           <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-primary-600" /></div>
                           <div><p className="font-medium text-gray-900">{user.name}</p><p className="text-sm text-gray-500 capitalize">{user.role}</p></div>
                        </div>
                        {user.role === 'farmer' && (<><Link to="/farmer/machines" className="block py-2 text-gray-600" onClick={()=>setIsMenuOpen(false)}>Machines</Link><Link to="/farmer/bookings" className="block py-2 text-gray-600" onClick={()=>setIsMenuOpen(false)}>Bookings</Link></>)}
                        {user.role === 'owner' && (<><Link to="/owner/my-machines" className="block py-2 text-gray-600" onClick={()=>setIsMenuOpen(false)}>My Machines</Link><Link to="/owner/requests" className="block py-2 text-gray-600" onClick={()=>setIsMenuOpen(false)}>Requests</Link></>)}
                        <button onClick={handleLogout} className="text-left text-gray-600 py-2">Logout</button>
                     </>
                  ) : (
                     <div className="flex flex-col space-y-2"><Link to="/login" className="text-gray-600 py-2" onClick={()=>setIsMenuOpen(false)}>Login</Link><Link to="/register" className="btn-primary text-center py-2" onClick={()=>setIsMenuOpen(false)}>Register</Link></div>
                  )}
               </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
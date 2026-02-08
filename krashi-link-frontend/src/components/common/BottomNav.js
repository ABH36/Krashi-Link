import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  CalendarDaysIcon, 
  UserIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid, 
  MagnifyingGlassIcon as SearchSolid,
  CalendarDaysIcon as CalendarSolid,
  UserIcon as UserSolid,
  CogIcon as CogSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  CurrencyRupeeIcon as RupeeSolid
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Agar user login nahi hai, to bottom nav mat dikhao (Optional)
  if (!user) return null;

  // --- 🚜 FARMER MENU ---
  const farmerLinks = [
    { label: 'Home', path: '/farmer/dashboard', icon: HomeIcon, activeIcon: HomeSolid },
    { label: 'Find', path: '/farmer/machines', icon: MagnifyingGlassIcon, activeIcon: SearchSolid },
    { label: 'Bookings', path: '/farmer/bookings', icon: CalendarDaysIcon, activeIcon: CalendarSolid },
    { label: 'Profile', path: '/profile', icon: UserIcon, activeIcon: UserSolid },
  ];

  // --- 🚜 OWNER MENU ---
  const ownerLinks = [
    { label: 'Home', path: '/owner/dashboard', icon: HomeIcon, activeIcon: HomeSolid },
    { label: 'Machines', path: '/owner/my-machines', icon: CogIcon, activeIcon: CogSolid },
    { label: 'Requests', path: '/owner/requests', icon: ClipboardDocumentListIcon, activeIcon: ClipboardSolid },
    { label: 'Earnings', path: '/owner/earnings', icon: CurrencyRupeeIcon, activeIcon: RupeeSolid },
  ];

  // Decide kon se links dikhane hain
  const links = user.role === 'owner' ? ownerLinks : farmerLinks;

  return (
    // 'md:hidden' means desktop par ye gayab ho jayega (Desktop par upar wala Navbar hota hai)
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = isActive ? link.activeIcon : link.icon;

          return (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import notificationService from '../../services/notificationService';
import { useSocket } from '../../context/SocketContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();
  const dropdownRef = useRef(null);

  // --- 📅 HELPER: Smart Time Formatter ---
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // --- 🎨 HELPER: Get Icon based on Type (Assumption) ---
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      if (res.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (socket) {
      socket.on('notification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    return () => { if(socket) socket.off('notification'); }
  }, [socket]);

  // Click outside to close (Cleaner UX than a fixed overlay)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState && unreadCount > 0) {
      // Small delay to let user see the "new" badges disappear visually
      setTimeout(async () => {
        await notificationService.markAllRead();
        setUnreadCount(0);
        // Optimistically update UI to read
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }, 1000);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={handleOpen} 
        className={`relative p-2 rounded-full transition-all duration-200 ${isOpen ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'}`}
      >
        <BellIcon className={`w-6 h-6 ${isOpen ? 'animate-wiggle' : ''}`} /> {/* Custom wiggle animation class can be added */}
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold items-center justify-center">
               {unreadCount > 9 ? '9+' : unreadCount}
             </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-[fadeIn_0.2s_ease-out]">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center backdrop-blur-sm">
             <span className="font-bold text-gray-800 text-sm">Notifications</span>
             <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                Recent
             </span>
          </div>

          {/* List Area */}
          <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <BellIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No updates yet</p>
                <p className="text-gray-400 text-xs mt-1">We'll notify you when something happens.</p>
              </div>
            ) : (
              // Notification Items
              notifications.map((notif, index) => (
                <div 
                  key={index} 
                  className={`group relative flex items-start p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-default ${!notif.read ? 'bg-blue-50/40' : ''}`}
                >
                  {/* Unread Indicator Dot */}
                  {!notif.read && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></span>
                  )}

                  {/* Icon */}
                  <div className={`flex-shrink-0 mt-0.5 p-2 rounded-full ${!notif.read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                        <p className={`text-sm leading-tight ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {formatTime(notif.createdAt)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer (Optional) */}
          {notifications.length > 0 && (
             <div className="bg-gray-50 border-t border-gray-100 p-2 text-center">
                <button className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                    View All Activity
                </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
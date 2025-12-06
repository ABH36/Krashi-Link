import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import notificationService from '../../services/notificationService';
import { useSocket } from '../../context/SocketContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();

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
        // Play sound logic can be added here
      });
    }
    
    return () => {
        if(socket) socket.off('notification');
    }
  }, [socket]);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      await notificationService.markAllRead();
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b bg-gray-50 font-semibold text-gray-700 flex justify-between items-center">
             <span>Notifications</span>
             <span className="text-xs text-gray-500">Recent 20</span>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
          ) : (
            notifications.map((notif, index) => (
              <div key={index} className={`p-3 border-b hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}>
                <h4 className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{notif.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                <span className="text-[10px] text-gray-400 mt-2 block text-right">{new Date(notif.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
};

export default NotificationBell;
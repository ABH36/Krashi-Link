import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../context/SocketContext';
import bookingService from '../../services/bookingService';
import RequestItem from '../../components/owner/RequestItem';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { 
  InboxIcon, 
  ArchiveBoxIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const Requests = () => {
  const { t } = useTranslation();
  const { socket, isConnected } = useSocket();
  
  const [allRequests, setAllRequests] = useState([]); // Store ALL here
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });

  useEffect(() => {
    fetchRequests();
    setupSocketListeners();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getOwnerBookings({ page: 1, limit: 100 });
      if (response.success) {
        setAllRequests(response.data.bookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;
    socket.on('booking_request', () => fetchRequests()); // Re-fetch on new request
    socket.on('booking_confirmed_owner', () => fetchRequests());
    return () => {
      socket.off('booking_request');
      socket.off('booking_confirmed_owner');
    };
  };

  // --- ⚡ CLIENT SIDE FILTERING (Fast UX) ---
  const getFilteredRequests = () => {
    switch(activeTab) {
        case 'pending': return allRequests.filter(r => r.status === 'requested');
        case 'active': return allRequests.filter(r => ['owner_confirmed', 'arrived_otp_verified', 'in_progress'].includes(r.status));
        case 'history': return allRequests.filter(r => ['completed_pending_payment', 'paid', 'cancelled'].includes(r.status));
        default: return allRequests;
    }
  };

  const displayedRequests = getFilteredRequests();

  const handleRequestUpdate = (bookingId, updateData) => {
    setAllRequests(prev => prev.map(req => req._id === bookingId ? { ...req, ...updateData } : req));
  };

  // Stats for Tabs
  const counts = {
      pending: allRequests.filter(r => r.status === 'requested').length,
      active: allRequests.filter(r => ['owner_confirmed', 'arrived_otp_verified', 'in_progress'].includes(r.status)).length,
      history: allRequests.filter(r => ['completed_pending_payment', 'paid', 'cancelled'].includes(r.status)).length
  };

  if (loading && allRequests.length === 0) return <Loader text="Loading requests..." />;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🟢 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Rental Requests</h1>
           <p className="text-gray-500 text-sm">Manage bookings and driver assignments.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs text-gray-500">{isConnected ? 'Live Updates On' : 'Offline'}</span>
        </div>
      </div>

      {/* 🎛️ Tabs (Pill Style) */}
      <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {[
              { id: 'pending', label: 'New Requests', icon: ClockIcon, count: counts.pending },
              { id: 'active', label: 'Active Jobs', icon: CheckCircleIcon, count: counts.active },
              { id: 'history', label: 'History', icon: ArchiveBoxIcon, count: counts.history },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-gray-100' : 'bg-white'}`}>
                          {tab.count}
                      </span>
                  )}
              </button>
          ))}
      </div>

      {/* 📋 Requests List */}
      <div className="space-y-4">
        {displayedRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                <InboxIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No {activeTab} requests</h3>
                <p className="text-gray-500 text-sm">When farmers book your machine, they will appear here.</p>
            </div>
        ) : (
            displayedRequests.map(request => (
                <RequestItem
                    key={request._id}
                    request={request}
                    onUpdate={handleRequestUpdate}
                    onRefresh={fetchRequests}
                />
            ))
        )}
      </div>

    </div>
  );
};

export default Requests;
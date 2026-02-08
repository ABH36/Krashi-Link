import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import bookingService from '../../services/bookingService';
import Loader from '../../components/common/Loader';
import { 
  CalendarDaysIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  ChevronRightIcon,
  ClockIcon,
  InboxStackIcon
} from '@heroicons/react/24/outline';

const FarmerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getUserBookings();
      if (response.success) {
        // Sort by date desc (newest first)
        setBookings(response.data.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Socket Listeners for Real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      const updateBookingState = (data, newStatus, extraFields = {}) => {
        setBookings(prev => prev.map(b => 
          b._id === data.bookingId ? { ...b, status: newStatus, ...extraFields } : b
        ));
      };

      socket.on('booking_confirmed', (data) => updateBookingState(data, 'owner_confirmed', { schedule: { ...data.schedule } }));
      socket.on('booking_rejected', (data) => updateBookingState(data, 'cancelled'));
      socket.on('timer_started', (data) => updateBookingState(data, 'arrived_otp_verified', { timer: { startedAt: data.startedAt } }));
      socket.on('timer_stopped', (data) => updateBookingState(data, 'completed_pending_payment', { billing: { calculatedAmount: data.calculatedAmount } }));

      return () => {
        socket.off('booking_confirmed');
        socket.off('booking_rejected');
        socket.off('timer_started');
        socket.off('timer_stopped');
      };
    }
  }, [socket, isConnected]);

  // --- FILTER LOGIC ---
  const activeStatuses = ['requested', 'owner_confirmed', 'arrived_otp_verified', 'in_progress', 'completed_pending_payment'];
  
  const activeBookings = bookings.filter(b => activeStatuses.includes(b.status));
  const historyBookings = bookings.filter(b => !activeStatuses.includes(b.status));

  const displayedBookings = activeTab === 'active' ? activeBookings : historyBookings;

  const getStatusConfig = (status) => {
    const configs = {
      requested: { color: 'bg-yellow-100 text-yellow-800', label: 'Requested' },
      owner_confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      arrived_otp_verified: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
      in_progress: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
      completed_pending_payment: { color: 'bg-orange-100 text-orange-800', label: 'Payment Pending' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };
    return configs[status] || { color: 'bg-gray-100', label: status };
  };

  if (loading) return <Loader text="Loading your bookings..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        {/* Refresh Icon Button could go here */}
      </div>

      {/* TABS */}
      <div className="flex p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'active' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active ({activeBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'history' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          History
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {displayedBookings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <InboxStackIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No {activeTab} bookings</h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'active' 
                ? "You don't have any ongoing jobs." 
                : "You haven't completed any jobs yet."}
            </p>
            {activeTab === 'active' && (
                <button 
                    onClick={() => navigate('/farmer/machines')}
                    className="mt-4 text-blue-600 font-semibold text-sm hover:underline"
                >
                    Find a Machine
                </button>
            )}
          </div>
        ) : (
          displayedBookings.map(booking => {
            const statusConfig = getStatusConfig(booking.status);
            return (
              <div 
                key={booking._id} 
                onClick={() => navigate(`/farmer/bookings/${booking._id}`)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{booking.machineId?.name}</h3>
                    <p className="text-xs text-gray-500">ID: {booking._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-3">
                   <div className="flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                      <span>{new Date(booking.schedule.requestedStartAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span>{new Date(booking.schedule.requestedStartAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   {booking.ownerId && (
                       <div className="flex items-center gap-1.5 col-span-2">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                              {booking.ownerId.name[0]}
                          </div>
                          <span>{booking.ownerId.name}</span>
                       </div>
                   )}
                </div>

                {/* Amount or Action Hint */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                    <div className="flex items-center text-gray-900 font-bold">
                        <CurrencyRupeeIcon className="w-4 h-4 mr-1 text-gray-400" />
                        {booking.billing.calculatedAmount ? booking.billing.calculatedAmount : booking.billing.rate}
                        {!booking.billing.calculatedAmount && <span className="text-xs text-gray-400 font-normal ml-1">/ {booking.billing.unit}</span>}
                    </div>
                    
                    <div className="flex items-center text-xs font-semibold text-blue-600">
                        View Details <ChevronRightIcon className="w-3 h-3 ml-1" />
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FarmerBookings;
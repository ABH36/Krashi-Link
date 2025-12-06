import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import bookingService from '../../services/bookingService';
import Loader from '../../components/common/Loader';

const FarmerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getUserBookings();
      if (response.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Socket Listeners for Real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('booking_confirmed', (data) => {
        console.log('Booking confirmed socket event:', data);
        // Update state directly to avoid reload
        setBookings(prev => prev.map(b => 
          b._id === data.bookingId 
            ? { ...b, status: 'owner_confirmed', schedule: { ...b.schedule, arrivalDeadlineAt: data.arrivalDeadlineAt } } 
            : b
        ));
      });

      socket.on('booking_rejected', (data) => {
        setBookings(prev => prev.map(b => 
          b._id === data.bookingId ? { ...b, status: 'cancelled' } : b
        ));
      });

      socket.on('timer_started', (data) => {
        setBookings(prev => prev.map(b => 
          b._id === data.bookingId ? { ...b, status: 'arrived_otp_verified', timer: { startedAt: data.startedAt } } : b
        ));
      });
      
      socket.on('timer_stopped', (data) => {
         setBookings(prev => prev.map(b => 
          b._id === data.bookingId ? { 
              ...b, 
              status: 'completed_pending_payment', 
              billing: { ...b.billing, calculatedAmount: data.calculatedAmount }
          } : b
        ));
      });

      return () => {
        socket.off('booking_confirmed');
        socket.off('booking_rejected');
        socket.off('timer_started');
        socket.off('timer_stopped');
      };
    }
  }, [socket, isConnected]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // FIX: Corrected Route
  const handleViewDetails = (bookingId) => {
    navigate(`/farmer/bookings/${bookingId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'owner_confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived_otp_verified': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed_pending_payment': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader text="Loading bookings..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 flex items-center gap-2"
        >
           {refreshing ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white">
          <div className="text-5xl mb-4">🚜</div>
          <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
          <p className="text-gray-500 mb-6">You haven't booked any machines yet.</p>
          <button
            onClick={() => navigate('/farmer/machines')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Find a Machine
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{booking.machineId?.name || 'Unknown Machine'}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Owner: <span className="font-medium">{booking.ownerId?.name}</span></p>
                    <p>Date: {new Date(booking.schedule.requestedStartAt).toLocaleString()}</p>
                    {booking.billing?.calculatedAmount && (
                      <p className="font-bold text-green-600">Amount: ₹{booking.billing.calculatedAmount}</p>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <button
                    onClick={() => handleViewDetails(booking._id)}
                    className="w-full md:w-auto bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 font-medium text-sm transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerBookings;
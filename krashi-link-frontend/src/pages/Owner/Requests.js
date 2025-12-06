import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../context/SocketContext';
import bookingService from '../../services/bookingService';
import RequestItem from '../../components/owner/RequestItem';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const Requests = () => {
  const { t } = useTranslation();
  const { socket, isConnected } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchRequests();
    setupSocketListeners();
  }, [activeTab, pagination.page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // FIX: Use getOwnerBookings instead of getUserBookings
      const response = await bookingService.getOwnerBookings({
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        // Filter by status on the frontend since getOwnerBookings doesn't take status filter
        let filteredBookings = response.data.bookings;
        
        if (activeTab === 'pending') {
          filteredBookings = filteredBookings.filter(booking => booking.status === 'requested');
        } else if (activeTab === 'confirmed') {
          filteredBookings = filteredBookings.filter(booking => booking.status === 'owner_confirmed');
        }
        // For 'all' tab, we show all bookings

        setRequests(filteredBookings);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination,
          total: filteredBookings.length // Update total for filtered results
        }));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    // Listen for new booking requests
    socket.on('booking_request', (data) => {
      console.log('New booking request received:', data);
      if (activeTab === 'pending') {
        fetchRequests();
      }
    });

    // Listen for booking updates
    socket.on('booking_confirmed_owner', (data) => {
      console.log('Booking confirmed update:', data);
      fetchRequests();
    });

    return () => {
      socket.off('booking_request');
      socket.off('booking_confirmed_owner');
    };
  };

  const handleRequestUpdate = (bookingId, updateData) => {
    setRequests(prev => 
      prev.map(request => 
        request._id === bookingId 
          ? { ...request, ...updateData }
          : request
      )
    );
  };

  const getStats = () => {
    const allBookings = requests; // This is already filtered
    const pending = allBookings.filter(r => r.status === 'requested').length;
    const confirmed = allBookings.filter(r => r.status === 'owner_confirmed').length;
    const total = allBookings.length;

    return { pending, confirmed, total };
  };

  const stats = getStats();

  if (loading && requests.length === 0) {
    return <Loader text="Loading requests..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rental Requests</h1>
          <p className="text-gray-600">Manage incoming booking requests for your machines</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className={`flex items-center text-sm ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Live' : 'Disconnected'}
          </div>
          
          <Button
            variant="secondary"
            onClick={fetchRequests}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending Requests</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', name: 'Pending', count: stats.pending },
            { key: 'confirmed', name: 'Confirmed', count: stats.confirmed },
            { key: 'all', name: 'All Requests', count: stats.total }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when changing tabs
              }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">
            {activeTab === 'pending' ? '📭' : '📋'}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'pending' ? 'No Pending Requests' : 'No Requests Found'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'pending' 
              ? 'You don\'t have any pending rental requests at the moment.'
              : 'No requests match your current filter.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <RequestItem
              key={request._id}
              request={request}
              onUpdate={handleRequestUpdate}
              onRefresh={fetchRequests} // Pass refresh function
            />
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="secondary"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <Button
                variant="secondary"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Requests;
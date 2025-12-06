import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate added
import bookingService from '../../services/bookingService';
import FarmerBookingActions from '../../components/farmer/FarmerBookingActions';
import Loader from '../../components/common/Loader';
import useBookingSocket from '../../hooks/useBookingSocket';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { useAuth } from '../../context/AuthContext'; // Import Auth Context
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  DevicePhoneMobileIcon, 
  CurrencyRupeeIcon, 
  MapPinIcon, 
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';

const FarmerBookingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth(); // Get current user
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Helper: Check if current user is the Owner
  const isOwner = user?.role === 'owner';

  // Fetch booking details
  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.getBookingById(id);
      
      if (response.success) {
        setBooking(response.data.booking);
        setLastUpdate(new Date());
      } else {
        throw new Error(response.message || 'Failed to fetch booking');
      }
    } catch (error) {
      console.error('❌ Error fetching booking:', error);
      if (error.response?.status === 403) {
        setError('Access Denied: You do not have permission to view this booking.');
      } else if (error.response?.status === 404) {
        setError('Booking not found.');
      } else {
        setError('Failed to load booking details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleBookingUpdate = (updatedData) => {
    console.log('🔄 Socket update received:', updatedData);
    setBooking(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updatedData,
        timer: { ...prev.timer, ...updatedData.timer },
        billing: { ...prev.billing, ...updatedData.billing }
      };
    });
    setLastUpdate(new Date());
  };

  useBookingSocket(id, handleBookingUpdate);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" text="Loading details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-600 mb-4"><span className="text-4xl">⚠️</span></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Issue</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
             onClick={() => navigate(isOwner ? '/owner/requests' : '/farmer/bookings')}
             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
           >
             Go Back
           </button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  // --- 👇 DYNAMIC DATA LOGIC ---
  // Agar main Owner hu, to mujhe Farmer ki details dikhni chahiye.
  // Agar main Farmer hu, to mujhe Owner ki details dikhni chahiye.
  const displayContact = isOwner ? booking.farmerId : booking.ownerId;
  const contactTitle = isOwner ? "Farmer Information" : "Owner Information";
  const chatLabel = isOwner ? "Chat with Farmer" : "Chat with Owner";
  
  // WhatsApp Message customization
  const waMessage = isOwner 
    ? `Namaste ${displayContact?.name}, Regarding your booking for ${booking.machineId?.name} (ID: ${booking._id})...`
    : `Namaste ${displayContact?.name}, Maine aapka machine (${booking.machineId?.name}) book kiya hai. Booking ID: ${booking._id}`;
  
  const backLink = isOwner ? '/owner/requests' : '/farmer/bookings';
  const backText = isOwner ? 'Back to Requests' : 'Back to My Bookings';
  // --- 👆 DYNAMIC DATA LOGIC END ---

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to={backLink} 
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            {backText}
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-sm text-gray-600 mt-1">
                Booking ID: <span className="font-mono">{booking._id}</span>
              </p>
            </div>
            {lastUpdate && (
              <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                <ClockIcon className="w-4 h-4 mr-1" />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${
            booking.status === 'completed_pending_payment' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
                <p className="text-sm font-medium text-blue-600 mt-1 capitalize">
                  {booking.status.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Machine Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DevicePhoneMobileIcon className="w-5 h-5 mr-2 text-blue-600" />
                Machine Information
              </h2>
              <div className="space-y-3">
                <p><span className="font-medium">Name:</span> {booking.machineId?.name}</p>
                <p><span className="font-medium">Type:</span> {booking.machineId?.type}</p>
              </div>
            </div>

            {/* Contact Info (Dynamic: Shows Farmer if Owner logged in, Owner if Farmer logged in) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-green-600" />
                {contactTitle}
              </h2>
              <div className="space-y-3">
                <p><span className="font-medium">Name:</span> {displayContact?.name}</p>
                <p><span className="font-medium">Contact:</span> {displayContact?.phone}</p>
                
                {/* Address if available */}
                {displayContact?.address?.village && (
                     <p className="flex items-center text-gray-600 text-sm">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {displayContact.address.village}
                     </p>
                )}
                
                {/* Dynamic WhatsApp Button */}
                <div className="pt-3">
                    <WhatsAppButton 
                      phoneNumber={displayContact?.phone}
                      message={waMessage}
                      label={chatLabel}
                    />
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="bg-white rounded-lg shadow p-6">
               <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
                Schedule
              </h2>
              <div className="space-y-3">
                <p><span className="font-medium">Requested:</span> {new Date(booking.schedule.requestedStartAt).toLocaleString()}</p>
                {booking.timer?.startedAt && (
                   <p><span className="font-medium">Actual Start:</span> {new Date(booking.timer.startedAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-white rounded-lg shadow p-6">
               <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyRupeeIcon className="w-5 h-5 mr-2 text-yellow-600" />
                Billing
              </h2>
              <div className="space-y-3">
                <p><span className="font-medium">Rate:</span> ₹{booking.billing.rate}/{booking.billing.unit}</p>
                {booking.billing.calculatedAmount && (
                    <div className="mt-2 p-3 bg-green-50 rounded border border-green-100">
                        <p className="text-lg font-bold text-green-700">Total: ₹{booking.billing.calculatedAmount}</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Section (Visible to Both, logic handled inside component) */}
          <div className="bg-white rounded-lg shadow p-6">
            <FarmerBookingActions 
              booking={booking} 
              onUpdate={handleBookingUpdate} 
              onRefresh={fetchBooking} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerBookingDetails;
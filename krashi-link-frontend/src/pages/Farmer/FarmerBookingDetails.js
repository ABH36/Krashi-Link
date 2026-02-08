import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import FarmerBookingActions from '../../components/farmer/FarmerBookingActions';
import Loader from '../../components/common/Loader';
import useBookingSocket from '../../hooks/useBookingSocket';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  UserIcon, 
  DevicePhoneMobileIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const FarmerBookingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwner = user?.role === 'owner';

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(id);
      if (response.success) {
        setBooking(response.data.booking);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  useBookingSocket(id, (updatedData) => {
    setBooking(prev => ({ ...prev, ...updatedData }));
  });

  if (loading) return <Loader text="Loading Details..." />;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!booking) return null;

  const displayContact = isOwner ? booking.farmerId : booking.ownerId;
  const backLink = isOwner ? '/owner/requests' : '/farmer/bookings';

  // --- 🚦 PROGRESS BAR LOGIC ---
  const steps = ['requested', 'owner_confirmed', 'arrived_otp_verified', 'completed_pending_payment', 'paid'];
  const currentStepIndex = steps.indexOf(booking.status) > -1 ? steps.indexOf(booking.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Back Button */}
        <Link to={backLink} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 mb-4 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
        </Link>

        {/* 🚨 Priority Alert Banner */}
        {booking.status === 'completed_pending_payment' && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg mb-6 shadow-sm flex items-start justify-between">
                <div>
                    <h3 className="font-bold text-orange-800">Payment Pending</h3>
                    <p className="text-sm text-orange-700 mt-1">
                        Work is complete. Please clear the bill of ₹{booking.billing.calculatedAmount} to close this booking.
                    </p>
                </div>
                {!isOwner && (
                    <button 
                        onClick={() => navigate(`/farmer/payment/${booking._id}`)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-orange-700"
                    >
                        Pay Now
                    </button>
                )}
            </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                        {booking.machineId?.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Booking ID: #{booking._id.slice(-6).toUpperCase()}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {booking.status.replace(/_/g, ' ')}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded"></div>
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>
                
                <div className="flex justify-between">
                    {steps.map((step, idx) => (
                        <div key={step} className={`flex flex-col items-center ${idx <= currentStepIndex ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-4 h-4 rounded-full border-2 ${idx <= currentStepIndex ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 🧩 Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800">{isOwner ? 'Farmer' : 'Owner'} Details</h3>
                </div>
                
                <div className="space-y-3">
                    <p className="text-lg font-medium">{displayContact?.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <DevicePhoneMobileIcon className="w-4 h-4" /> {displayContact?.phone}
                    </p>
                    {displayContact?.address?.village && (
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" /> {displayContact.address.village}
                        </p>
                    )}
                    
                    <div className="pt-2">
                        <WhatsAppButton 
                            phoneNumber={displayContact?.phone} 
                            label={isOwner ? "Chat with Farmer" : "Chat with Owner"}
                        />
                    </div>
                </div>
            </div>

            {/* Schedule & Billing */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800">Job Details</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Requested Time</span>
                        <span className="font-medium">{new Date(booking.schedule.requestedStartAt).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rate</span>
                        <span className="font-medium">₹{booking.billing.rate}/{booking.billing.unit}</span>
                    </div>

                    {booking.billing.calculatedAmount && (
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Total Bill</span>
                            <span className="text-xl font-bold text-green-600">₹{booking.billing.calculatedAmount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* 👇 Action Center (The Main Engine) */}
        <div className="mt-6">
            <FarmerBookingActions 
                booking={booking} 
                onUpdate={(data) => setBooking(prev => ({ ...prev, ...data }))} 
                onRefresh={fetchBooking} 
            />
        </div>

      </div>
    </div>
  );
};

export default FarmerBookingDetails;
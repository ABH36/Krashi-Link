import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Assuming you have this
import { 
  StarIcon, 
  PencilSquareIcon, 
  ShieldCheckIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

const ReviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Default to farmer if no user found (for safety), or check actual role
  const isOwner = user?.role === 'owner';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 text-yellow-600 rounded-full mb-4 shadow-sm">
            <StarIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isOwner ? 'Reputation Manager' : 'Reviews & Ratings'}
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            {isOwner 
              ? "Track your machine performance and build trust with farmers." 
              : "Share your experience to help the community make better choices."}
          </p>
        </div>

        {/* 🚀 Action Grid (Role Based) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* FARMER VIEW */}
          {!isOwner && (
            <>
              {/* Write Review Card */}
              <div 
                onClick={() => navigate('/farmer/bookings')}
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <PencilSquareIcon className="w-24 h-24 text-blue-600" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <PencilSquareIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Rate a Booking</h3>
                    <p className="text-gray-500 mt-2 text-sm">
                        Pending reviews for completed jobs. Rate owners and machines.
                    </p>
                    <span className="inline-flex items-center text-blue-600 font-semibold mt-4 text-sm group-hover:translate-x-1 transition-transform">
                        Go to Bookings <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </span>
                </div>
              </div>

              {/* My Reviews Card */}
              <div 
                onClick={() => navigate('/farmer/my-reviews')}
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <StarIcon className="w-24 h-24 text-yellow-500" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
                        <StarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">My Reviews</h3>
                    <p className="text-gray-500 mt-2 text-sm">
                        View and manage the feedback you've given to owners.
                    </p>
                    <span className="inline-flex items-center text-yellow-600 font-semibold mt-4 text-sm group-hover:translate-x-1 transition-transform">
                        View History <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </span>
                </div>
              </div>
            </>
          )}

          {/* OWNER VIEW */}
          {isOwner && (
            <>
              {/* Received Reviews */}
              <div 
                onClick={() => navigate('/owner/reviews')}
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ChartBarIcon className="w-24 h-24 text-green-600" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <ChartBarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Customer Feedback</h3>
                    <p className="text-gray-500 mt-2 text-sm">
                        See what farmers are saying about your service and machines.
                    </p>
                    <span className="inline-flex items-center text-green-600 font-semibold mt-4 text-sm group-hover:translate-x-1 transition-transform">
                        View Ratings <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </span>
                </div>
              </div>

              {/* My Machines (For Context) */}
              <div 
                onClick={() => navigate('/owner/my-machines')}
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheckIcon className="w-24 h-24 text-purple-600" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <ShieldCheckIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Machine Quality</h3>
                    <p className="text-gray-500 mt-2 text-sm">
                        Manage your inventory to ensure high standards and better ratings.
                    </p>
                    <span className="inline-flex items-center text-purple-600 font-semibold mt-4 text-sm group-hover:translate-x-1 transition-transform">
                        Manage Inventory <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 💡 Why it matters Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h3 className="text-center text-lg font-bold text-blue-900 mb-8">Why Reviews Matter?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm mb-3">
                        <ShieldCheckIcon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900">Build Trust</h4>
                    <p className="text-sm text-gray-600 mt-1">Verified reviews help create a safe and reliable community.</p>
                </div>
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm mb-3">
                        <StarIcon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900">Improve Quality</h4>
                    <p className="text-sm text-gray-600 mt-1">Feedback helps owners improve their service and machines.</p>
                </div>
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm mb-3">
                        <UserGroupIcon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900">Help Others</h4>
                    <p className="text-sm text-gray-600 mt-1">Your experience guides other farmers to make the right choice.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ReviewPage;
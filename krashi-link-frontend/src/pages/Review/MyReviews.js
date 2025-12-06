import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import Loader from '../../components/common/Loader';
import { StarIcon, UserIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, given, received

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      // This would depend on your user role
      const user = JSON.parse(localStorage.getItem('user'));
      let response;

      if (user.role === 'farmer') {
        response = await reviewService.getFarmerReviews();
      } else if (user.role === 'owner') {
        response = await reviewService.getOwnerReviews();
      } else {
        response = await reviewService.getUserReviews();
      }

      if (response.success) {
        setReviews(response.data.reviews || []);
      } else {
        setError('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" text="Loading your reviews..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-2">
            {reviews.length > 0 
              ? `You have ${reviews.length} review${reviews.length === 1 ? '' : 's'}`
              : 'No reviews yet'
            }
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">
              {JSON.parse(localStorage.getItem('user')).role === 'farmer'
                ? "You haven't submitted any reviews yet. Review your completed bookings to help other farmers."
                : "You haven't received any reviews yet. Complete more bookings to get reviews."
              }
            </p>
            <Link
              to={JSON.parse(localStorage.getItem('user')).role === 'farmer' 
                ? "/farmer/bookings" 
                : "/owner/requests"
              }
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              {JSON.parse(localStorage.getItem('user')).role === 'farmer'
                ? "View your bookings →"
                : "View your requests →"
              }
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {renderStars(review.rating)}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  {review.wouldRecommend && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-3">{review.comment}</p>
                </div>

                {/* Machine/Owner Info */}
                <div className="border-t border-gray-200 pt-4">
                  {review.machineId && (
                    <div className="flex items-center space-x-2 mb-2">
                      <DevicePhoneMobileIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {review.machineId.name}
                      </span>
                    </div>
                  )}
                  
                  {JSON.parse(localStorage.getItem('user')).role === 'owner' && review.farmerId && (
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        By {review.farmerId.name}
                      </span>
                    </div>
                  )}

                  {JSON.parse(localStorage.getItem('user')).role === 'farmer' && review.ownerId && (
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {review.ownerId.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Booking Link */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/${JSON.parse(localStorage.getItem('user')).role}/bookings/${review.bookingId}`}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    View Booking Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {reviews.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {reviews.length}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-600">Positive Reviews</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => r.wouldRecommend).length}
              </div>
              <div className="text-sm text-gray-600">Recommendations</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
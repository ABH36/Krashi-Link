import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import { machineService } from "../../services/machineService";

import Loader from '../../components/common/Loader';
import { StarIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

const MachineReviews = () => {
  const { machineId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchMachineReviews();
  }, [machineId]);

  const fetchMachineReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch machine details
      const machineResponse = await machineService.getMachineById(machineId);
      if (machineResponse.success) {
        setMachine(machineResponse.data.machine);
      }

      // Fetch reviews
      const reviewsResponse = await reviewService.getMachineReviews(machineId);
      if (reviewsResponse.success) {
        const reviewsData = reviewsResponse.data.reviews || [];
        setReviews(reviewsData);
        
        // Calculate stats
        const total = reviewsData.length;
        const average = reviewsData.reduce((sum, r) => sum + r.rating, 0) / total;
        
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(review => {
          distribution[review.rating]++;
        });

        setStats({
          averageRating: average || 0,
          totalReviews: total,
          ratingDistribution: distribution
        });
      } else {
        setError('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching machine reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="w-8">{stars} ★</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="w-8 text-right text-gray-600">{count}</span>
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
        <Loader size="large" text="Loading reviews..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reviews for {machine?.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {machine?.ownerId?.name} • {machine?.type}
              </p>
            </div>
            <Link
              to={`/machine/${machineId}`}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Back to Machine
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              {/* Average Rating */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating), 'w-6 h-6')}
                <div className="text-sm text-gray-600 mt-2">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Rating Breakdown</h3>
                {[5, 4, 3, 2, 1].map((rating) =>
                  renderRatingBar(
                    rating,
                    stats.ratingDistribution[rating],
                    stats.totalReviews
                  )
                )}
              </div>

              {/* Recommendation Rate */}
              {reviews.filter(r => r.wouldRecommend).length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 text-center">
                    {Math.round((reviews.filter(r => r.wouldRecommend).length / stats.totalReviews) * 100)}%
                  </div>
                  <div className="text-sm text-green-700 text-center mt-1">
                    Recommendation Rate
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Reviews List */}
          <div className="lg:col-span-3">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-gray-600">
                  This machine hasn't received any reviews yet. Be the first to leave a review after booking!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg shadow-lg p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.farmerId?.name || 'Anonymous'}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {review.wouldRecommend && (
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                          ✓ Recommended
                        </span>
                      )}
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Booked on {formatDate(review.bookingId?.createdAt)}</span>
                      </div>
                      
                      {review.farmerId?.trustScore && (
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            review.farmerId.trustScore >= 70 
                              ? 'bg-green-100 text-green-800' 
                              : review.farmerId.trustScore >= 40 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Trust Score: {review.farmerId.trustScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More (if paginated) */}
            {reviews.length > 0 && (
              <div className="mt-8 text-center">
                <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium">
                  Load More Reviews
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineReviews;
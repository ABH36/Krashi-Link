import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext'; // Assuming you have this
import { 
  StarIcon, 
  UserCircleIcon, 
  HandThumbUpIcon, 
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ avg: 0, total: 0, positive: 0, recommended: 0 });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        let response;
        if (user.role === 'farmer') response = await reviewService.getFarmerReviews();
        else if (user.role === 'owner') response = await reviewService.getOwnerReviews();
        else response = await reviewService.getUserReviews();

        if (response.success) {
          const data = response.data.reviews || [];
          setReviews(data);
          
          // Calculate Stats
          const total = data.length;
          const avg = total ? data.reduce((acc, r) => acc + r.rating, 0) / total : 0;
          const positive = data.filter(r => r.rating >= 4).length;
          const recommended = data.filter(r => r.wouldRecommend).length;
          
          setStats({ avg, total, positive, recommended });
        } else {
          setError('Failed to load reviews');
        }
      } catch (err) {
        setError('Could not fetch reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchReviews();
  }, [user]);

  const renderStars = (rating) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        i < Math.round(rating) ? <StarIcon key={i} className="w-4 h-4" /> : <StarOutline key={i} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );

  if (loading) return <Loader text="Loading Feedback..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-500">
            {user.role === 'farmer' ? 'Reviews you have written' : 'Reviews from your customers'}
          </p>
        </div>

        {/* 📊 Reputation Dashboard (Top Stats) */}
        {reviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Reviews</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                        <span className="text-3xl font-bold text-gray-900">{stats.avg.toFixed(1)}</span>
                        <StarIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Average Rating</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">{stats.positive}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Positive (4★+)</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">{stats.recommended}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Recommendations</span>
                </div>
            </div>
        )}

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Reviews Yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {user.role === 'farmer' 
                ? "You haven't written any reviews yet. Share your experience after your next booking!" 
                : "You haven't received any reviews yet. Provide great service to get rated!"}
            </p>
            <Link 
                to={user.role === 'farmer' ? "/farmer/bookings" : "/owner/requests"}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
                {user.role === 'farmer' ? "Go to Bookings" : "View Requests"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                
                {/* Header: User & Rating */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <UserCircleIcon className="w-10 h-10" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">
                                {user.role === 'owner' ? review.farmerId?.name : review.ownerId?.name || 'User'}
                            </h4>
                            <div className="flex items-center gap-2">
                                {renderStars(review.rating)}
                                <span className="text-xs text-gray-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    {review.wouldRecommend && (
                        <div className="bg-green-50 text-green-700 p-1.5 rounded-lg" title="Recommended">
                            <HandThumbUpIcon className="w-5 h-5" />
                        </div>
                    )}
                </div>

                {/* Comment */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 min-h-[3rem]">
                    "{review.comment}"
                </p>

                {/* Footer: Context */}
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                        For: <span className="text-gray-900">{review.machineId?.name || 'Machine'}</span>
                    </span>
                    <Link to={`/${user.role}/bookings/${review.bookingId}`} className="text-blue-600 hover:underline">
                        View Booking
                    </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
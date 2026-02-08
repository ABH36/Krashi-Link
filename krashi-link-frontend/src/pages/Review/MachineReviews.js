import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import { machineService } from "../../services/machineService";
import Loader from '../../components/common/Loader';
import { 
  StarIcon, 
  UserCircleIcon, 
  CalendarDaysIcon, 
  HandThumbUpIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

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
    fetchData();
  }, [machineId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [machineRes, reviewsRes] = await Promise.all([
          machineService.getMachineById(machineId),
          reviewService.getMachineReviews(machineId)
      ]);

      if (machineRes.success) setMachine(machineRes.data.machine);
      
      if (reviewsRes.success) {
        const data = reviewsRes.data.reviews || [];
        setReviews(data);
        
        // Calculate Stats
        const total = data.length;
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach(r => dist[r.rating] = (dist[r.rating] || 0) + 1);

        setStats({
            averageRating: total ? sum / total : 0,
            totalReviews: total,
            ratingDistribution: dist
        });
      }
    } catch (err) {
      setError('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          i < Math.round(rating) ? <StarIcon key={i} className="w-4 h-4" /> : <StarOutline key={i} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  if (loading) return <Loader text="Loading Feedback..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
            <Link to={`/farmer/book-machine/${machineId}`} className="flex items-center text-sm text-gray-500 hover:text-green-600 mb-2 transition-colors">
                <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Machine
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Reviews for {machine?.name}</h1>
            <p className="text-gray-500">See what other farmers are saying</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 📊 Sidebar Stats */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
                    <div className="text-center mb-6">
                        <div className="text-5xl font-extrabold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                        <div className="flex justify-center my-2 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`w-6 h-6 ${i < Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-200'}`} />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">{stats.totalReviews} total ratings</p>
                    </div>

                    {/* Bars */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = stats.ratingDistribution[star] || 0;
                            const percent = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center text-sm">
                                    <span className="w-3 font-bold text-gray-600">{star}</span>
                                    <StarIcon className="w-4 h-4 text-gray-400 mx-1" />
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-2">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <span className="w-8 text-right text-gray-400 text-xs">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 📝 Reviews List */}
            <div className="lg:col-span-2 space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                        <StarOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">No Reviews Yet</h3>
                        <p className="text-gray-500">Be the first to review this machine after booking!</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600">
                                        <UserCircleIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{review.farmerId?.name || 'Farmer'}</h4>
                                        <div className="flex items-center gap-2">
                                            {renderStars(review.rating)}
                                            <span className="text-xs text-gray-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {review.wouldRecommend && (
                                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <HandThumbUpIcon className="w-3 h-3" /> Recommended
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {review.comment}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-3">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span>Booked on {new Date(review.bookingId?.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default MachineReviews;
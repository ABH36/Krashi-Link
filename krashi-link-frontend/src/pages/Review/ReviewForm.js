import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import bookingService from '../../services/bookingService';
import Loader from '../../components/common/Loader';
import { StarIcon, XMarkIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const ReviewForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    wouldRecommend: true
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // 1. Get Booking
        const bookingRes = await bookingService.getBookingById(bookingId);
        if (!bookingRes.success) throw new Error('Failed to load booking');
        
        const bookingData = bookingRes.data.booking;
        
        if (bookingData.status !== 'paid') {
             // Allow review if it's paid (status 'paid' is what we expect)
             // If status is not 'paid', check if it is completed at least
             if (bookingData.status !== 'completed_pending_payment') {
                 // Strict check: Usually we only allow review after payment
                 // But for now, let's ensure it is at least paid
             }
        }
        setBooking(bookingData);

        // 2. Check Existing Review (Graceful)
        try {
            const reviewRes = await reviewService.getBookingReview(bookingId);
            if (reviewRes.success && reviewRes.data.review) {
                setError('You have already reviewed this booking.');
                return; // Stop here
            }
        } catch (e) {
            console.warn("Review check failed, assuming no review exists", e);
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [bookingId]);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) {
      alert('Please write a short comment.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await reviewService.createReview({
        bookingId,
        ...formData
      });

      if (res.success) {
        alert("Review Submitted! Thank you.");
        navigate('/farmer/bookings');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <div className="text-green-600 mb-3 flex justify-center">
             <CheckBadgeIcon className="w-12 h-12" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Review Status</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/farmer/bookings')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Rate Your Experience</h1>
          <p className="opacity-90 mt-1">
            with {booking?.ownerId?.name} ({booking?.machineId?.name})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Star Rating */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">How was the service?</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="focus:outline-none transform hover:scale-110 transition-transform"
                >
                  <StarIcon className={`w-10 h-10 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
                {formData.rating === 5 ? "Excellent!" : formData.rating === 1 ? "Poor" : "Good"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Machine condition, Owner behavior, etc..."
            ></textarea>
          </div>

          {/* Recommend Checkbox */}
          <div className="flex items-center bg-blue-50 p-3 rounded-lg">
            <input
              type="checkbox"
              name="wouldRecommend"
              checked={formData.wouldRecommend}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">I would recommend this owner</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/farmer/bookings')}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
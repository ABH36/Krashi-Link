import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import bookingService from '../../services/bookingService';
import Loader from '../../components/common/Loader';
import { StarIcon, CheckCircleIcon, HandThumbUpIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const ReviewForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    wouldRecommend: true
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const bookingRes = await bookingService.getBookingById(bookingId);
        if (!bookingRes.success) throw new Error('Failed to load booking');
        
        const bookingData = bookingRes.data.booking;
        
        // Strict check: Only paid/completed bookings can be reviewed
        if (!['paid', 'completed_pending_payment'].includes(bookingData.status)) {
             setError('Booking is not completed yet.');
             setLoading(false);
             return;
        }
        setBooking(bookingData);

        // Check if already reviewed
        try {
            const reviewRes = await reviewService.getBookingReview(bookingId);
            if (reviewRes.success && reviewRes.data.review) {
                setIsSubmitted(true); // Already done
            }
        } catch (e) {}

      } catch (err) {
        setError('Failed to load details.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [bookingId]);

  const getRatingLabel = (r) => {
      switch(r) {
          case 1: return "Terrible 😞";
          case 2: return "Bad 🙁";
          case 3: return "Okay 😐";
          case 4: return "Good 🙂";
          case 5: return "Excellent! 🤩";
          default: return "Select Rating";
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
        alert("Please select a star rating");
        return;
    }
    
    try {
      setSubmitting(true);
      const res = await reviewService.createReview({ bookingId, ...formData });
      if (res.success) setIsSubmitted(true);
    } catch (err) {
      alert('Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading..." />;

  if (isSubmitted) {
      return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full animate-[scaleIn_0.3s_ease-out]">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                <p className="text-gray-600 mb-6">Your feedback helps us improve the KrishiLink community.</p>
                <button onClick={() => navigate('/farmer/bookings')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all">
                    Back to Bookings
                </button>
            </div>
        </div>
      );
  }

  if (error) return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
          <div className="bg-red-50 p-6 rounded-xl text-red-600 border border-red-200">
              <p className="font-bold">{error}</p>
              <button onClick={() => navigate(-1)} className="mt-4 text-sm underline">Go Back</button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white relative">
            <h1 className="text-2xl font-bold">Rate Experience</h1>
            <p className="opacity-90 text-sm mt-1">
                How was your rental with <strong>{booking?.ownerId?.name}</strong>?
            </p>
            <div className="absolute top-4 left-4">
                <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white"><ArrowLeftIcon className="w-6 h-6"/></button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Star Rating Interaction */}
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700 mb-4">{getRatingLabel(formData.rating)}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, rating: star}))}
                  className="focus:outline-none transition-transform active:scale-90 hover:scale-110"
                >
                  {star <= formData.rating ? (
                      <StarIcon className="w-10 h-10 text-yellow-400 drop-shadow-sm" />
                  ) : (
                      <StarOutline className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Area */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Detailed Feedback</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({...prev, comment: e.target.value}))}
              rows="4"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none text-sm"
              placeholder="Tell us about the machine quality, owner behavior..."
            ></textarea>
          </div>

          {/* Recommendation Toggle */}
          <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.wouldRecommend ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
                type="checkbox"
                className="hidden"
                checked={formData.wouldRecommend}
                onChange={(e) => setFormData(prev => ({...prev, wouldRecommend: e.target.checked}))}
            />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${formData.wouldRecommend ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                <HandThumbUpIcon className="w-6 h-6" />
            </div>
            <span className={`font-bold text-sm ${formData.wouldRecommend ? 'text-green-800' : 'text-gray-500'}`}>
                I would recommend this provider
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
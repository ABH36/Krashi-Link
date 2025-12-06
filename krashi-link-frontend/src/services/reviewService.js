import api from './api';

const reviewService = {
  createReview: (reviewData) => 
    api.post('/reviews', reviewData),
  
  getMachineReviews: (machineId, page = 1, limit = 10) => 
    api.get(`/reviews/machine/${machineId}?page=${page}&limit=${limit}`),
  
  getFarmerReviews: () => 
    api.get('/reviews/farmer/my-reviews'),
  
  getOwnerReviews: () => 
    api.get('/reviews/owner/my-reviews'),
  
  getUserReviews: () => 
    api.get('/reviews/user'),
  
  getBookingReview: (bookingId) => 
    api.get(`/reviews/booking/${bookingId}`)
};

export default reviewService;
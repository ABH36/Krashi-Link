import api from './api';

const bookingService = {
  // Create a new booking (Farmer)
  // Backend: POST /api/bookings
  createBooking: async (bookingData) => {
    return api.post('/bookings', bookingData);
  },

  // Get bookings for the logged-in user (Farmer/Owner generic)
  // Backend: GET /api/bookings/user
  getUserBookings: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/bookings/user?${searchParams.toString()}`);
  },

  // Get bookings specifically for Owner (Incoming requests)
  // Backend: GET /api/bookings/owner/my-bookings
  getOwnerBookings: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/bookings/owner/my-bookings?${searchParams.toString()}`);
  },

  // Confirm or Reject booking (Owner)
  // Backend: PUT /api/bookings/:id/confirm
  confirmBooking: async (bookingId, accept, arrivalDeadlineMinutes = 60, reason = '') => {
    return api.put(`/bookings/${bookingId}/confirm`, {
      accept,
      arrivalDeadlineMinutes,
      reason
    });
  },

  // Cancel booking
  // Backend: PUT /api/bookings/:id/cancel
  cancelBooking: async (bookingId, reason) => {
    return api.put(`/bookings/${bookingId}/cancel`, { reason });
  },

  // Get single booking details
  // Backend: GET /api/bookings/:id
  getBookingById: async (bookingId) => {
    return api.get(`/bookings/${bookingId}`);
  },

  // Verify Arrival OTP (Owner verifies Farmer)
  // Backend: PUT /api/bookings/:id/verify-arrival
  verifyArrival: async (bookingId, otp) => {
    return api.put(`/bookings/${bookingId}/verify-arrival`, { otp });
  },

  // Verify Completion OTP (Farmer verifies Owner or vice versa based on backend logic)
  // Backend: PUT /api/bookings/:id/verify-completion
  verifyCompletion: async (bookingId, otp) => {
    return api.put(`/bookings/${bookingId}/verify-completion`, { otp });
  },

  // Resend OTP
  // Backend: POST /api/bookings/:id/resend-otp
  resendOTP: async (bookingId, type) => {
    return api.post(`/bookings/${bookingId}/resend-otp`, { type });
  },

  // Create Dispute
  // Backend: POST /api/bookings/:id/dispute
  createDispute: async (bookingId, disputeData) => {
    return api.post(`/bookings/${bookingId}/dispute`, disputeData);
  }
};

export default bookingService;
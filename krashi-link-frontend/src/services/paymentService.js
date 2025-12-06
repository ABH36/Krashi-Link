//import api from './api';

//const paymentService = {
  // Initiate Payment (Razorpay Order Creation)
  // Backend: POST /api/payments/initiate
  //createPaymentOrder: (bookingId, amount) => 
   // api.post('/payments/initiate', { bookingId, amount }),

  // Verify Payment (Razorpay Webhook/Callback)
  // Backend: POST /api/payments/verify
 // verifyPayment: (paymentData) => 
   // api.post('/payments/verify', paymentData),
  
  // Get User Transactions
  // Backend: GET /api/payments/user
  //getUserTransactions: (params = {}) => {
   // const searchParams = new URLSearchParams(params);
    //return api.get(`/payments/user?${searchParams.toString()}`);
  //},
  
  // Release Payout (Admin Only)
  // Backend: POST /api/payments/payout/:bookingId
  //releasePayout: (bookingId) =>
    //api.post(`/admin/payout/${bookingId}`) 
//};

//export default paymentService;


// brlow down code for dummy payment 
import api from './api';

const paymentService = {
  createPaymentOrder: (bookingId, amount) => 
    api.post('/payments/initiate', { bookingId, amount }),

  // Is function ki ab zaroorat nahi hai kyunki initiate khud handle kar raha hai,
  // par compatibility ke liye rakh sakte hain.
  simulatePaymentSuccess: (bookingId, amount) =>
    api.post('/payments/simulate', { bookingId, amount }),

  verifyPayment: (paymentData) => 
    api.post('/payments/verify', paymentData),
  
  getUserTransactions: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/payments/user?${searchParams.toString()}`);
  },
  
  releasePayout: (bookingId) => api.post(`/admin/payout/${bookingId}`) 
};

export default paymentService;
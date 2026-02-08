import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  getMe: () => api.get('/auth/me'),
  
  // ✅ NEW: Forgot & Reset Password
  forgotPassword: (phone) => api.post('/auth/forgot-password', { phone }),
  resetPassword: (phone, otp, newPassword) => api.post('/auth/reset-password', { phone, otp, newPassword }),

  send2FA: (channel) => api.post('/auth/2fa/send', { channel }),
  verify2FA: (code) => api.post('/auth/2fa/verify', { code })
};
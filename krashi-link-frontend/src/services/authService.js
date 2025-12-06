import api from './api';

export const authService = {
  // Register new user
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // Login user
  login: (phone, password) => {
    return api.post('/auth/login', { phone, password });
  },

  // Get current user profile
  getMe: () => {
    return api.get('/auth/me');
  },

  // Send 2FA code
  send2FA: (channel) => {
    return api.post('/auth/2fa/send', { channel });
  },

  // Verify 2FA code
  verify2FA: (code) => {
    return api.post('/auth/2fa/verify', { code });
  }
};
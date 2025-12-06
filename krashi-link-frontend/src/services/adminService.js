import api from './api';

export const adminService = {
  // Users
  getUsers: (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    return api.get(`/admin/users?${params.toString()}`);
  },

  verifyUser: (userId, verified) => {
    return api.put(`/admin/verify/${userId}`, { verified });
  },

  // Analytics
  getAnalytics: () => {
    return api.get('/admin/analytics');
  },

  // Bookings
  getBookings: (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    return api.get(`/admin/bookings?${params.toString()}`);
  },

  // Transactions
  getPendingTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    return api.get(`/admin/transactions/pending?${params.toString()}`);
  },

  // Disputes
  resolveDispute: (bookingId, resolution, refundAmount = 0) => {
    return api.post(`/admin/disputes/${bookingId}/resolve`, { resolution, refundAmount });
  },

getSystemLogs: (page = 1) => {
    return api.get(`/admin/logs?page=${page}&limit=20`);
  },

  sendBroadcast: (data) => {
    return api.post('/admin/broadcast', data);
  }
};

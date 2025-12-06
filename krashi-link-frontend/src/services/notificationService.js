import api from './api';

const notificationService = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all')
};

export default notificationService;
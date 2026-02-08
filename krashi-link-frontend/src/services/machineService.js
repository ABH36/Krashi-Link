import api from './api';

export const machineService = {
  // Create new machine (Supports Image Upload)
  createMachine: (machineData) => {
    // Check if we are sending a file (FormData)
    if (machineData instanceof FormData) {
      return api.post('/machines', machineData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/machines', machineData);
  },

  // Get all machines with filters (Public/Farmer)
  getMachines: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/machines?${params.toString()}`);
  },

  // Get machine by ID
  getMachineById: (id) => {
    return api.get(`/machines/${id}`);
  },

  // Update machine (Supports Image Upload)
  updateMachine: (id, updates) => {
    if (updates instanceof FormData) {
        return api.put(`/machines/${id}`, updates, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    return api.put(`/machines/${id}`, updates);
  },

  // Delete machine
  deleteMachine: (id) => {
    return api.delete(`/machines/${id}`);
  },

  // Toggle machine availability
  toggleAvailability: (id, availability) => {
    return api.patch(`/machines/${id}/availability`, { availability });
  },

  // Get owner's machines (Protected)
  getMyMachines: (page = 1, limit = 10) => {
    return api.get(`/machines/owner/my-machines?page=${page}&limit=${limit}`);
  }
};
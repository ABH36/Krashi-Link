import axios from 'axios';

// Ensure this matches your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for slower networks
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Adds Token to EVERY request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handles Responses and Auth Errors
api.interceptors.response.use(
  (response) => {
    // Return the full data object so services can access .success, .data, etc.
    return response.data; 
  },
  (error) => {
    console.error("API Error:", error.response || error.message);
    
    if (error.response?.status === 401) {
      // Auto-logout on 401 (Unauthorized)
      // Only redirect if not already on login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        console.warn('Session expired, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
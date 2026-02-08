import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      
      // Verify token is still valid
      authService.getMe()
        .then(response => {
          // Robust checking for data structure
          const data = response.data || response;
          if (data && data.user) {
             setUser(data.user);
             localStorage.setItem('user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.login(phone, password);
      
      // ✅ FIX: Robust data handling (Handles if response is wrapped or direct)
      const data = response.data || response;
      const token = data.token || response.token;
      const user = data.user || response.user;
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        return { success: true };
      } else {
         throw new Error('Invalid server response');
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.register(userData);
      
      // ✅ FIX: Robust data handling
      const data = response.data || response;
      const token = data.token || response.token;
      const user = data.user || response.user;
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        return { success: true };
      } else {
         // Agar success hai par token nahi aaya (rare case), to success return karo
         // Register.js isse handle kar lega
         return { success: true, message: 'Registration successful' };
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const connectSocket = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (token && user) {
        console.log('🔌 Connecting socket for user:', user.id, 'Role:', user.role);
        
        const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        
        const newSocket = io(SOCKET_URL, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          timeout: 10000
        });

        newSocket.on('connect', () => {
          console.log('✅ Connected to server with socket:', newSocket.id);
          setIsConnected(true);
          setConnectionError(null);
        });

        // Farmer-specific events
        if (user.role === 'farmer') {
          newSocket.on('booking_confirmed', (data) => {
            console.log('🎯 Farmer: Booking confirmed by owner', data);
          });

          newSocket.on('booking_rejected', (data) => {
            console.log('🎯 Farmer: Booking rejected by owner', data);
          });

          newSocket.on('timer_started', (data) => {
            console.log('🎯 Farmer: Timer started', data);
          });

          newSocket.on('timer_stopped', (data) => {
            console.log('🎯 Farmer: Timer stopped', data);
          });
        }

        // Owner-specific events
        if (user.role === 'owner') {
          newSocket.on('booking_request', (data) => {
            console.log('🎯 Owner: New booking request', data);
          });

          newSocket.on('timer_started', (data) => {
            console.log('🎯 Owner: Timer started', data);
          });

          newSocket.on('timer_stopped', (data) => {
            console.log('🎯 Owner: Timer stopped', data);
          });
        }

        // Common events for all roles
        newSocket.on('booking_updated', (data) => {
          console.log('🔄 Booking updated:', data);
        });

        // Debug events
        newSocket.on('test_response', (data) => {
          console.log('✅ Test response:', data);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('❌ Disconnected from server:', reason);
          setIsConnected(false);
          setConnectionError('Disconnected from server');
        });

        newSocket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message);
          setIsConnected(false);
          setConnectionError(error.message);
          
          // Auto-reconnect after 5 seconds
          setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connectSocket();
          }, 5000);
        });

        newSocket.on('error', (error) => {
          console.error('❌ Socket error:', error);
          setConnectionError(error.message);
        });

        setSocket(newSocket);

        return () => {
          console.log('🧹 Cleaning up socket connection');
          newSocket.disconnect();
        };
      } else {
        console.log('⏭️ No user token found, skipping socket connection');
      }
    };

    connectSocket();
  }, []);

  const joinBookingRoom = (bookingId) => {
    if (socket && isConnected) {
      socket.emit('join_booking_room', bookingId);
      console.log('Joined booking room:', bookingId);
    } else {
      console.warn('⚠️ Cannot join room: Socket not connected');
    }
  };

  const leaveBookingRoom = (bookingId) => {
    if (socket && isConnected) {
      socket.emit('leave_booking_room', bookingId);
      console.log('Left booking room:', bookingId);
    }
  };

  const testConnection = () => {
    if (socket && isConnected) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'owner') {
        socket.emit('test_owner_connection', { timestamp: Date.now() });
      } else {
        socket.emit('test_farmer_connection', { timestamp: Date.now() });
      }
      console.log('Sent test connection event');
    } else {
      console.warn('⚠️ Cannot test: Socket not connected');
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    joinBookingRoom,
    leaveBookingRoom,
    testConnection
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
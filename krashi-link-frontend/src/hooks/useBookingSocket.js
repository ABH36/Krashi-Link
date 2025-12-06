import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const useBookingSocket = (bookingId, onBookingUpdate) => {
  const { socket, isConnected, joinBookingRoom, leaveBookingRoom } = useSocket();

  useEffect(() => {
    if (!bookingId || !socket || !isConnected) {
      console.log('⏭️ Booking socket: Missing requirements', { 
        bookingId, 
        hasSocket: !!socket, 
        isConnected 
      });
      return;
    }

    console.log('🔌 Setting up booking socket listeners for:', bookingId);
    
    // Join booking room
    joinBookingRoom(bookingId);

    // Listen for booking-specific events
    const handleTimerStarted = (data) => {
      console.log('⏰ Booking socket: Timer started', data);
      if (onBookingUpdate && data.bookingId === bookingId) {
        onBookingUpdate({
          status: 'arrived_otp_verified',
          timer: { startedAt: data.startedAt }
        });
      }
    };

    const handleTimerStopped = (data) => {
      console.log('⏹️ Booking socket: Timer stopped', data);
      if (onBookingUpdate && data.bookingId === bookingId) {
        onBookingUpdate({
          status: 'completed_pending_payment',
          timer: { 
            stoppedAt: data.stoppedAt,
            durationMinutes: data.durationMinutes
          },
          billing: {
            calculatedAmount: data.calculatedAmount,
            durationMinutes: data.durationMinutes
          }
        });
      }
    };

    const handleBookingUpdated = (data) => {
      console.log('🔄 Booking socket: Booking updated', data);
      if (onBookingUpdate && data.bookingId === bookingId) {
        onBookingUpdate(data);
      }
    };

    const handleBookingConfirmed = (data) => {
      console.log('✅ Booking socket: Booking confirmed', data);
      if (onBookingUpdate && data.bookingId === bookingId) {
        onBookingUpdate({
          status: 'owner_confirmed',
          schedule: { arrivalDeadlineAt: data.arrivalDeadlineAt }
        });
      }
    };

    // Add event listeners
    socket.on('timer_started', handleTimerStarted);
    socket.on('timer_stopped', handleTimerStopped);
    socket.on('booking_updated', handleBookingUpdated);
    socket.on('booking_confirmed', handleBookingConfirmed);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up booking socket listeners');
      socket.off('timer_started', handleTimerStarted);
      socket.off('timer_stopped', handleTimerStopped);
      socket.off('booking_updated', handleBookingUpdated);
      socket.off('booking_confirmed', handleBookingConfirmed);
      
      leaveBookingRoom(bookingId);
    };
  }, [bookingId, socket, isConnected, onBookingUpdate, joinBookingRoom, leaveBookingRoom]);

  return socket;
};

export default useBookingSocket;
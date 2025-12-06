const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketService = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      
      // Join Personal Room
      socket.join(socket.userId);
      
      // 👇 NEW: If Admin, Join Admin Room
      if (user.role === 'admin') {
          socket.join('admin_room');
          console.log(`🛡️ Admin ${user.name} joined admin_room`);
      }
      
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected`);

    socket.on('join_booking_room', (bookingId) => socket.join(`booking_${bookingId}`));
    socket.on('leave_booking_room', (bookingId) => socket.leave(`booking_${bookingId}`));

    // Forwarding events (Same as before)
    socket.on('booking_confirmed', (data) => {
      io.to(data.farmerId).emit('booking_confirmed', data);
      io.to(`booking_${data.bookingId}`).emit('booking_confirmed', data);
    });

    socket.on('timer_started', (data) => {
      io.to(data.farmerId).emit('timer_started', data);
      io.to(data.ownerId).emit('timer_started', data);
      io.to(`booking_${data.bookingId}`).emit('timer_started', data);
    });

    socket.on('timer_stopped', (data) => {
      io.to(data.ownerId).emit('timer_stopped', data);
      io.to(data.farmerId).emit('timer_stopped', data);
      io.to(`booking_${data.bookingId}`).emit('timer_stopped', data);
    });

    socket.on('disconnect', () => console.log(`❌ User disconnected`));
  });

  return io;
};

module.exports = socketService;
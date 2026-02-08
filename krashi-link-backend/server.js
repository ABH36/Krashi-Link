const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./src/config/database');
const socketService = require('./src/services/socketService');

// Import routes
const authRoutes = require('./src/routes/auth');
const machineRoutes = require('./src/routes/machines');
const bookingRoutes = require('./src/routes/bookings');
const paymentRoutes = require('./src/routes/payments');
const reviewRoutes = require('./src/routes/reviews');
const adminRoutes = require('./src/routes/admin');
const notificationRoutes = require('./src/routes/notifications');

// Import middleware
const errorHandler = require('./src/middlewares/errorHandler');
const sanitize = require('./src/middlewares/sanitize'); 
const { generalLimiter, authLimiter, otpLimiter } = require('./src/middlewares/rateLimit');

const app = express();

// 🛑 FIX FOR RATE LIMIT ERROR (Very Important for Render)
// Render ek proxy ke peeche chalta hai, isliye ye line jaruri hai
app.set('trust proxy', 1); 

const server = http.createServer(app);

// ✅ Connect to Database
connectDB();

// ✅ CORS Configuration (Hardcoded for Safety)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://krashi-link.vercel.app',  // No slash
  'https://krashi-link.vercel.app/'  // With slash
];

// Add Environment Variable Origins if they exist
if (process.env.CORS_ALLOWED_ORIGINS) {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',');
  allowedOrigins.push(...envOrigins);
}

console.log("🔒 Allowed Origins:", allowedOrigins);

// ✅ Socket.io Setup
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

// Initialize Socket Service
socketService(io);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Uploads Folder (Images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } 
}));
app.use(compression());

// ✅ Express CORS Setup
app.use(cors({
  origin: (origin, callback) => {
    // !origin allows mobile apps/postman/server-to-server calls
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Apply rate limiting
// Ab 'trust proxy' set hone ke baad ye error nahi dega
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/bookings/*/verify-*', otpLimiter);

// Logging
app.use(morgan('combined'));

// Socket.IO shared instance
app.set('io', io);

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Krishi-Link Backend is Live! 🚜',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error Handling Middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
});

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 for Render
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Krishi-Link Server running on port ${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
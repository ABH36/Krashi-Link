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
const sanitize = require('./src/middlewares/sanitize'); // Ensure this file exists
const { generalLimiter, authLimiter, otpLimiter } = require('./src/middlewares/rateLimit');

const app = express();
const server = http.createServer(app);

// ✅ Connect to Database
connectDB();

// ✅ CORS Configuration (Flexible for Vercel & Localhost)
// जब आप Vercel पर डिप्लॉय कर लें, तो उस URL को .env में डाल सकते हैं
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5000']; 

// ✅ Socket.io Setup
const io = socketIo(server, {
  cors: {
    // फ़िलहाल true रखें ताकि Vercel से connection रिजेक्ट न हो
    origin: true, 
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
  crossOriginResourcePolicy: { policy: "cross-origin" } // Images ko Vercel par load hone deta hai
}));
app.use(compression());

// ✅ Express CORS Setup
app.use(cors({
  origin: true, // Allow requests from any origin (Temporarily for smooth deployment)
  credentials: true // Cookies/Headers allow karne ke liye
}));

// Apply rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/bookings/*/verify-*', otpLimiter);
// app.use('/api/', generalLimiter); // Commented out temporarily to prevent blocking during testing

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

// ✅ Health Check Endpoint (Render Ping ke liye)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Krishi-Link Backend is Live! 🚜',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ❌ REMOVED: Frontend Static Serving Logic
// (Kyunki Frontend Vercel par hoga, Render par nahi)

// Error Handling Middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  // Production me server crash hone se bachayein (Optional)
  // server.close(() => process.exit(1));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Krishi-Link Server running on port ${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
const User = require('../models/User');
const Machine = require('../models/Machine');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { ERROR_CODES } = require('../config/constants');


// Get all users with filters
exports.getUsers = async (req, res) => {
  try {
    const { role, verified, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (verified !== undefined) filter.verified = verified === 'true';

    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while fetching users'
      }
    });
  }
};

// Verify user (admin only)
exports.verifyUser = async (req, res) => {
  try {
    const { verified } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_404',
          message: 'User not found'
        }
      });
    }

    user.verified = verified;
    await user.save();

    // Log verification
    await AuditLog.create({
      actorId: req.user.id,
      role: req.user.role,
      action: `USER_${verified ? 'VERIFY' : 'UNVERIFY'}`,
      entity: { type: 'user', id: user._id },
      metadata: { userId: user._id, verified }
    });

    res.json({
      success: true,
      data: { user },
      message: `User ${verified ? 'verified' : 'unverified'} successfully`
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while verifying user'
      }
    });
  }
};

// Get platform analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalMachines = await Machine.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Revenue calculations
    const revenueResult = await Transaction.aggregate([
      { $match: { status: 'released', type: 'release' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenueINR = revenueResult[0]?.total || 0;

    // Active bookings
    const activeBookings = await Booking.countDocuments({
      status: { $in: ['owner_confirmed', 'arrived_otp_verified', 'in_progress'] }
    });

    // Top machines by booking count
    const topMachines = await Booking.aggregate([
      { $match: { status: { $in: ['paid', 'completed_pending_payment'] } } },
      { $group: { _id: '$machineId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'machines',
          localField: '_id',
          foreignField: '_id',
          as: 'machine'
        }
      },
      { $unwind: '$machine' },
      {
        $project: {
          machineId: '$_id',
          count: 1,
          name: '$machine.name',
          type: '$machine.type'
        }
      }
    ]);

    // Dispute rate
    const disputedBookings = await Booking.countDocuments({ status: 'disputed' });
    const disputeRatePercent = totalBookings > 0 ? (disputedBookings / totalBookings) * 100 : 0;

    // Average booking duration
    const avgDuration = await Booking.aggregate([
      { $match: { 'timer.durationMinutes': { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$timer.durationMinutes' } } }
    ]);
    const averageBookingDurationMinutes = avgDuration[0]?.avg || 0;

    // Recent growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentBookings = await Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentRevenue = await Transaction.aggregate([
      { 
        $match: { 
          status: 'released', 
          type: 'release',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const recentRevenueINR = recentRevenue[0]?.total || 0;

    // Geo data for heatmap
    const machineLocations = await Machine.aggregate([
      { $match: { 'location.coordinates': { $exists: true } } },
      {
        $project: {
          coordinates: '$location.coordinates',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          farmers: totalFarmers,
          owners: totalOwners,
          admins: totalAdmins,
          machines: totalMachines,
          bookings: totalBookings
        },
        revenue: {
          total: revenueINR,
          recent: recentRevenueINR
        },
        activeBookings,
        topMachines,
        disputeRate: Math.round(disputeRatePercent * 100) / 100,
        averageBookingDuration: Math.round(averageBookingDurationMinutes),
        growth: {
          recentUsers,
          recentBookings,
          recentRevenue: recentRevenueINR
        },
        geoHeatmapReady: machineLocations.length > 0,
        machineLocations: machineLocations.slice(0, 100) // Limit for performance
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while fetching analytics'
      }
    });
  }
};

// Resolve dispute
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, refundAmount = 0 } = req.body;
    const booking = await Booking.findById(req.params.bookingId)
      .populate('farmerId')
      .populate('ownerId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: ERROR_CODES.BK_404,
          message: 'Booking not found'
        }
      });
    }

    if (booking.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.BK_STATE_409,
          message: 'Booking is not in disputed state'
        }
      });
    }

    // Update booking dispute resolution
    booking.dispute.resolution = resolution;
    booking.dispute.resolvedAt = new Date();
    
    if (refundAmount > 0) {
      // Create refund transaction if applicable
      await Transaction.create({
        bookingId: booking._id,
        farmerId: booking.farmerId._id,
        ownerId: booking.ownerId._id,
        type: 'refund',
        amount: refundAmount,
        status: 'refunded',
        gateway: 'none',
        audit: {
          createdBy: req.user.id,
          notes: `Dispute resolution: ${resolution}`
        }
      });
    }

    // Set booking status based on resolution
    booking.status = refundAmount > 0 ? 'cancelled' : 'paid';
    await booking.save();

    // Log dispute resolution
    await AuditLog.create({
      actorId: req.user.id,
      role: req.user.role,
      action: 'DISPUTE_RESOLVE',
      entity: { type: 'booking', id: booking._id },
      metadata: { resolution, refundAmount }
    });

    // Emit socket events
    const io = req.app.get('io');
    io.to(booking.farmerId._id.toString()).emit('dispute_resolved', {
      bookingId: booking._id,
      resolution,
      refundAmount
    });

    io.to(booking.ownerId._id.toString()).emit('dispute_resolved', {
      bookingId: booking._id,
      resolution,
      refundAmount
    });

    res.json({
      success: true,
      data: { resolved: true },
      message: 'Dispute resolved successfully'
    });

  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while resolving dispute'
      }
    });
  }
};

// Get all bookings for admin
exports.getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('farmerId', 'name phone')
      .populate('ownerId', 'name phone')
      .populate('machineId', 'name type')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while fetching bookings'
      }
    });
  }
};

// Get pending transactions for admin
exports.getPendingTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ status: 'pending' })
      .populate('farmerId', 'name phone')
      .populate('ownerId', 'name phone')
      .populate('bookingId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Transaction.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while fetching pending transactions'
      }
    });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (type) filter.action = type; // Filter by action like 'USER_LOGIN', 'BOOKING_CREATE'

    const logs = await AuditLog.find(filter)
      .populate('actorId', 'name role') // Show who did the action
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.sendBroadcast = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    
    // 1. Find Target Users
    const query = {};
    if (targetRole && targetRole !== 'all') {
        query.role = targetRole;
    }
    
    const users = await User.find(query).select('_id');
    
    if (users.length === 0) {
        return res.status(400).json({ success: false, message: 'No users found for this role' });
    }

    // 2. Prepare Notifications for DB (Bulk Insert for performance)
    const notifications = users.map(user => ({
        userId: user._id,
        title,
        message,
        type: 'info',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    await Notification.insertMany(notifications);

    // 3. Send Real-time Socket Event
    const io = req.app.get('io');
    
    if (targetRole === 'all') {
        // Broadcast to everyone connected
        io.emit('notification', { title, message, type: 'info' });
    } else {
        // Loop is okay here because socket rooms join by userId
        users.forEach(user => {
            io.to(user._id.toString()).emit('notification', { title, message, type: 'info' });
        });
    }

    // Log this action
    await AuditLog.create({
        actorId: req.user.id,
        role: 'admin',
        action: 'BROADCAST_SENT',
        entity: { type: 'user', id: req.user.id },
        metadata: { title, targetRole, count: users.length }
    });

    res.json({ 
        success: true, 
        message: `Sent to ${users.length} users successfully` 
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
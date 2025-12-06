const Notification = require('../models/Notification');
const User = require('../models/User'); // Import User model to find admins

const sendNotification = async (io, userId, title, message, type = 'info') => {
  try {
    // 👇 CASE 1: Notify All Admins
    if (userId === 'ADMIN') {
        // 1. Real-time Alert to all online admins
        io.to('admin_room').emit('notification', { title, message, type });

        // 2. Save to DB for all admin users (History)
        const admins = await User.find({ role: 'admin' }).select('_id');
        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                userId: admin._id,
                title,
                message,
                type,
                read: false
            }));
            await Notification.insertMany(notifications);
        }
        console.log(`🛡️ Notification sent to ALL ADMINS: ${title}`);
        return;
    }

    // 👇 CASE 2: Notify Specific User (Farmer/Owner) - Existing Logic
    if (!userId) return;

    await Notification.create({
      userId,
      title,
      message,
      type,
      read: false
    });

    io.to(userId.toString()).emit('notification', {
      title,
      message,
      type
    });

    console.log(`🔔 Notification sent to ${userId}: ${title}`);

  } catch (error) {
    console.error('Notification Error:', error.message);
  }
};

module.exports = sendNotification;
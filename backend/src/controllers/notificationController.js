const Notification = require('../models/Notification');

// @desc Get Notifications for logged in user
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(20);
    return res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, markAsRead };

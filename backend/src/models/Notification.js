const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['ORDER', 'AI_ALERT', 'QUALITY', 'MATCH', 'SYSTEM'],
      default: 'SYSTEM',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

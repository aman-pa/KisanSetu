/**
 * Otp.js
 * Mongoose Schema for OTP storage with automated MongoDB TTL (Time-To-Live) expiration.
 */

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required for OTP verification'],
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['REGISTRATION', 'PASSWORD_RESET'],
    default: 'REGISTRATION',
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // MongoDB TTL index: automatically deletes document after 15 minutes (900 seconds)
  },
});

module.exports = mongoose.model('Otp', otpSchema);

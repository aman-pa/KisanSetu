const express = require('express');
const router = express.Router();
const {
  sendRegistrationOTP,
  verifyRegistrationOTPAndCreateUser,
  registerUser,
  googleAuth,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  directEmailResetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-registration-otp', sendRegistrationOTP);
router.post('/verify-registration-otp', verifyRegistrationOTPAndCreateUser);
router.post('/register', registerUser);
router.post('/google', googleAuth);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.get('/direct-email-reset', directEmailResetPassword);

module.exports = router;

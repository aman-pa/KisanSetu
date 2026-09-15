const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Otp = require('../models/Otp');
const FarmerProfile = require('../models/FarmerProfile');
const FPOProfile = require('../models/FPOProfile');
const BuyerProfile = require('../models/BuyerProfile');
const LogisticsProfile = require('../models/LogisticsProfile');
const TrustScore = require('../models/TrustScore');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'kisansetu_sih_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc Step 1: Send Real-Time Registration Verification OTP
// @route POST /api/auth/send-registration-otp
const sendRegistrationOTP = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate any previous pending registration OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase().trim(), purpose: 'REGISTRATION' });

    // Store new OTP document with MongoDB TTL
    await Otp.create({
      email: email.toLowerCase().trim(),
      otpHash,
      purpose: 'REGISTRATION',
      expiresAt,
    });

    const htmlText = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #0A2412; padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">🌾 KisanSetu AI</h1>
          <p style="margin: 6px 0 0; color: #4ade80; font-size: 11px; font-weight: 800; tracking: 2px; text-transform: uppercase;">Real-Time Account Verification</p>
        </div>

        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0;">Welcome to KisanSetu AI Platform!</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <b>${name || 'Valued User'}</b>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for registering. Please enter the 6-digit verification code below on the website to verify your email address and activate your account:</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 700;">Your 6-Digit Email Verification OTP Code:</p>
            <h2 style="margin: 6px 0 0; color: #166534; font-size: 36px; font-weight: 900; letter-spacing: 8px;">${otp}</h2>
          </div>

          <p style="color: #94a3b8; font-size: 12px;">This verification code will expire in 15 minutes.</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
          © 2026 KisanSetu AI Platform. Built for Smart India Hackathon.
        </div>
      </div>
    `;

    const emailResult = await sendEmail({
      to: email.toLowerCase().trim(),
      subject: `[KisanSetu AI] Account Registration OTP Verification Code: ${otp}`,
      htmlText,
      plainText: `Your KisanSetu AI registration verification OTP code is ${otp}. It will expire in 15 minutes.`,
    });

    const isEthereal = emailResult.provider === 'ETHEREAL';

    return res.json({
      success: true,
      message: isEthereal
        ? `Verification OTP dispatched via test inbox. Please check your email to complete registration.`
        : `Verification OTP dispatched to ${email}! Please check your email inbox to complete registration.`,
      email: email.toLowerCase().trim(),
      provider: emailResult.provider,
    });
  } catch (error) {
    console.error('Send registration OTP error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Step 2: Verify OTP & Complete User Registration
// @route POST /api/auth/verify-registration-otp
const verifyRegistrationOTPAndCreateUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, address, profileDetails, profileImage, aadhaarNumber, aadhaarFrontImage, aadhaarBackImage, otp } = req.body;

    if (!name || !email || !password || !role || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide all required registration details and OTP' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    const computedHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');

    // Retrieve active OTP record from MongoDB
    const otpRecord = await Otp.findOne({ email: cleanEmail, purpose: 'REGISTRATION' });

    if (!otpRecord || otpRecord.otpHash !== computedHash) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP code. Please check your verification email.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email: cleanEmail, purpose: 'REGISTRATION' });
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new verification code.' });
    }

    // OTP successfully verified! Clean up OTP record immediately
    await Otp.deleteMany({ email: cleanEmail, purpose: 'REGISTRATION' });

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '9876543210',
      password,
      role,
      address: address || { street: '', city: 'Delhi', state: 'Delhi', pincode: '110001' },
      profileImage: profileImage || undefined,
      aadhaarNumber: aadhaarNumber || '',
      aadhaarFrontImage: aadhaarFrontImage || '',
      aadhaarBackImage: aadhaarBackImage || '',
      isIdentityVerified: true,
      isVerified: true,
    });

    // Create Role-Specific Sub-Profile
    let createdProfile = null;
    if (role === 'FARMER') {
      createdProfile = await FarmerProfile.create({
        user: user._id,
        farmSizeAcres: profileDetails?.farmSizeAcres || 4,
        location: {
          village: profileDetails?.village || 'Kheri',
          district: profileDetails?.district || 'Karnal',
          state: profileDetails?.state || 'Haryana',
          coordinates: { lat: 29.6857, lng: 76.9905 },
        },
        cropsGrown: profileDetails?.cropsGrown || ['Tomato', 'Wheat'],
        bankDetails: profileDetails?.bankDetails || {
          accountNumber: '998877665544',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          accountHolderName: name,
        },
      });

      await TrustScore.create({ user: user._id, overallScore: 92 });
    } else if (role === 'FPO') {
      createdProfile = await FPOProfile.create({
        user: user._id,
        orgName: profileDetails?.orgName || `${name} Farmers Co-op`,
        registrationNumber: profileDetails?.registrationNumber || 'FPO-REG-2024-88',
        representativeName: name,
        numberOfMemberFarmers: profileDetails?.numberOfMemberFarmers || 120,
        cropsHandled: profileDetails?.cropsHandled || ['Tomato', 'Potato', 'Wheat'],
        operatingRegions: profileDetails?.operatingRegions || ['Punjab', 'Haryana'],
      });
    } else if (role === 'BULK_BUYER') {
      createdProfile = await BuyerProfile.create({
        user: user._id,
        businessName: profileDetails?.businessName || `${name} AgriProcure Ltd`,
        businessType: profileDetails?.businessType || 'SUPERMARKET',
        gstNumber: profileDetails?.gstNumber || '07AAAAA0000A1Z5',
        procurementCategory: profileDetails?.procurementCategory || ['VEGETABLES', 'FRUITS'],
      });
    } else if (role === 'LOGISTICS') {
      createdProfile = await LogisticsProfile.create({
        user: user._id,
        companyName: profileDetails?.companyName || `${name} Express Logistics`,
        vehicleType: profileDetails?.vehicleType || 'REFRIGERATED_TRUCK',
        vehicleNumber: profileDetails?.vehicleNumber || 'HR-05-AB-1234',
        vehicleCapacityKg: profileDetails?.vehicleCapacityKg || 5000,
        serviceAreas: profileDetails?.serviceAreas || ['Delhi NCR', 'Punjab', 'Haryana', 'UP'],
      });
    }

    const token = generateToken(user._id);

    // Send confirmation email
    sendRegistrationConfirmationEmail(user).catch(err => console.error("[Reg Email Error]", err.message));

    return res.status(201).json({
      success: true,
      message: 'Account verified & created successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage,
        profileDetails: createdProfile,
      },
    });
  } catch (error) {
    console.error('Verify registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Direct Register / Standard Register Fallback
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, address, profileDetails } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password and role' });
    }

    if (role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be registered publicly.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '9876543210',
      password,
      role,
      address: address || { street: '', city: 'Delhi', state: 'Delhi', pincode: '110001' },
      isVerified: true,
    });

    let createdProfile = null;
    if (role === 'FARMER') {
      createdProfile = await FarmerProfile.create({
        user: user._id,
        farmSizeAcres: profileDetails?.farmSizeAcres || 4,
        location: {
          village: profileDetails?.village || 'Kheri',
          district: profileDetails?.district || 'Karnal',
          state: profileDetails?.state || 'Haryana',
          coordinates: { lat: 29.6857, lng: 76.9905 },
        },
        cropsGrown: profileDetails?.cropsGrown || ['Tomato', 'Wheat'],
        bankDetails: profileDetails?.bankDetails || {
          accountNumber: '998877665544',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          accountHolderName: name,
        },
      });

      await TrustScore.create({ user: user._id, overallScore: 90 });
    } else if (role === 'FPO') {
      createdProfile = await FPOProfile.create({
        user: user._id,
        orgName: profileDetails?.orgName || `${name} Farmers Co-op`,
        registrationNumber: profileDetails?.registrationNumber || 'FPO-REG-2024-88',
        representativeName: name,
        numberOfMemberFarmers: profileDetails?.numberOfMemberFarmers || 120,
        cropsHandled: profileDetails?.cropsHandled || ['Tomato', 'Potato', 'Wheat'],
        operatingRegions: profileDetails?.operatingRegions || ['Punjab', 'Haryana'],
      });
    } else if (role === 'BULK_BUYER') {
      createdProfile = await BuyerProfile.create({
        user: user._id,
        businessName: profileDetails?.businessName || `${name} AgriProcure Ltd`,
        businessType: profileDetails?.businessType || 'SUPERMARKET',
        gstNumber: profileDetails?.gstNumber || '07AAAAA0000A1Z5',
        procurementCategory: profileDetails?.procurementCategory || ['VEGETABLES', 'FRUITS'],
      });
    } else if (role === 'LOGISTICS') {
      createdProfile = await LogisticsProfile.create({
        user: user._id,
        companyName: profileDetails?.companyName || `${name} Express Logistics`,
        vehicleType: profileDetails?.vehicleType || 'REFRIGERATED_TRUCK',
        vehicleNumber: profileDetails?.vehicleNumber || 'HR-05-AB-1234',
        vehicleCapacityKg: profileDetails?.vehicleCapacityKg || 5000,
        serviceAreas: profileDetails?.serviceAreas || ['Delhi NCR', 'Punjab', 'Haryana', 'UP'],
      });
    }

    const token = generateToken(user._id);

    // Send confirmation email
    sendRegistrationConfirmationEmail(user).catch(err => console.error("[Reg Email Error]", err.message));

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage,
        profileDetails: createdProfile,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc 1-Click Google OAuth Authentication
// @route POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { name, email, profileImage, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email is required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // First time Google register -> create user
      user = await User.create({
        name: name || 'Google Agri User',
        email: email.toLowerCase(),
        phone: '9876543210',
        password: crypto.randomBytes(16).toString('hex'), // Random password for Google users
        role: role || 'CONSUMER',
        profileImage: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
      });

      if (user.role === 'FARMER') {
        await FarmerProfile.create({
          user: user._id,
          farmSizeAcres: 5.0,
          location: { village: 'Kheri', district: 'Karnal', state: 'Haryana' },
          cropsGrown: ['Tomato'],
        });
      }
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Login User
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let profileData = null;
    if (user.role === 'FARMER') {
      profileData = await FarmerProfile.findOne({ user: user._id });
    } else if (user.role === 'FPO') {
      profileData = await FPOProfile.findOne({ user: user._id });
    } else if (user.role === 'BULK_BUYER') {
      profileData = await BuyerProfile.findOne({ user: user._id });
    } else if (user.role === 'LOGISTICS') {
      profileData = await LogisticsProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage,
        profileDetails: profileData,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Current Logged-in User
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profileData = null;

    if (user.role === 'FARMER') {
      profileData = await FarmerProfile.findOne({ user: user._id });
    } else if (user.role === 'FPO') {
      profileData = await FPOProfile.findOne({ user: user._id });
    } else if (user.role === 'BULK_BUYER') {
      profileData = await BuyerProfile.findOne({ user: user._id });
    } else if (user.role === 'LOGISTICS') {
      profileData = await LogisticsProfile.findOne({ user: user._id });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage,
        profileDetails: profileData,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Profile (Name & Phone LOCKED for Anti-Fraud Security)
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { email, address, profileDetails } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email) user.email = email.toLowerCase();
    if (address) user.address = address;

    await user.save();

    // Update Role Sub-profile
    let updatedProfile = null;
    if (user.role === 'FARMER') {
      updatedProfile = await FarmerProfile.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            farmSizeAcres: profileDetails?.farmSizeAcres,
            'location.village': profileDetails?.village,
            'location.district': profileDetails?.district,
            'location.state': profileDetails?.state,
            cropsGrown: profileDetails?.cropsGrown,
            bankDetails: profileDetails?.bankDetails,
          },
        },
        { new: true, upsert: true }
      );
    } else if (user.role === 'FPO') {
      updatedProfile = await FPOProfile.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            orgName: profileDetails?.orgName,
            registrationNumber: profileDetails?.registrationNumber,
            numberOfMemberFarmers: profileDetails?.numberOfMemberFarmers,
            cropsHandled: profileDetails?.cropsHandled,
            operatingRegions: profileDetails?.operatingRegions,
          },
        },
        { new: true, upsert: true }
      );
    } else if (user.role === 'BULK_BUYER') {
      updatedProfile = await BuyerProfile.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            businessName: profileDetails?.businessName,
            businessType: profileDetails?.businessType,
            gstNumber: profileDetails?.gstNumber,
            procurementCategory: profileDetails?.procurementCategory,
          },
        },
        { new: true, upsert: true }
      );
    } else if (user.role === 'LOGISTICS') {
      updatedProfile = await LogisticsProfile.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            companyName: profileDetails?.companyName,
            vehicleType: profileDetails?.vehicleType,
            vehicleNumber: profileDetails?.vehicleNumber,
            vehicleCapacityKg: profileDetails?.vehicleCapacityKg,
            serviceAreas: profileDetails?.serviceAreas,
          },
        },
        { new: true, upsert: true }
      );
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage,
        profileDetails: updatedProfile,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Change Password (When logged in)
// @route PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    user.password = newPassword;
    await user.save();

    // Send password changed notification email
    sendPasswordChangedNotificationEmail(user).catch(err => console.error("[Pass Email Error]", err.message));

    return res.json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Dispatch Password Reset Email (Direct Link + 6-Digit OTP)
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address' });
    }

    // 1. Generate 1-click token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    // 2. Generate 6-digit Reset OTP and store in Otp collection
    const resetOtp = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const resetOtpHash = crypto.createHash('sha256').update(resetOtp).digest('hex');
    await Otp.deleteMany({ email: cleanEmail, purpose: 'PASSWORD_RESET' });
    await Otp.create({
      email: cleanEmail,
      otpHash: resetOtpHash,
      purpose: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const directResetUrl = `http://localhost:5000/api/auth/direct-email-reset?token=${resetToken}`;
    const frontendResetUrl = `http://localhost:5173/reset-password?email=${encodeURIComponent(cleanEmail)}&otp=${resetOtp}`;

    const htmlText = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #0A2412; padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">🌾 KisanSetu AI</h1>
          <p style="margin: 6px 0 0; color: #4ade80; font-size: 11px; font-weight: 800; tracking: 2px; text-transform: uppercase;">Account Password Reset</p>
        </div>

        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <b>${user.name}</b> (${user.role}),</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">We received a password reset request for your registered KisanSetu AI account (<b>${user.email}</b>).</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 700;">Your 6-Digit Password Reset OTP Code:</p>
            <h2 style="margin: 6px 0 0; color: #166534; font-size: 32px; font-weight: 900; letter-spacing: 8px;">${resetOtp}</h2>
            <p style="margin: 6px 0 0; color: #94a3b8; font-size: 11px;">Valid for 15 minutes</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${directResetUrl}" style="background-color: #166534; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block;">
              🔑 Click Here To Instantly Reset Password & Log In →
            </a>
          </div>
        </div>
      </div>
    `;

    const emailResult = await sendEmail({
      to: user.email,
      subject: `[KisanSetu AI] Password Reset Verification Code: ${resetOtp}`,
      htmlText,
      plainText: `Your KisanSetu AI password reset OTP code is ${resetOtp}. Or use this link: ${directResetUrl}`,
    });

    const isEthereal = emailResult.provider === 'ETHEREAL';

    return res.json({
      success: true,
      message: isEthereal
        ? `Password reset verification code dispatched to ${cleanEmail}. (Test Mode OTP: ${resetOtp})`
        : `Password reset verification code sent to ${cleanEmail}! Please check your email inbox.`,
      email: cleanEmail,
      provider: emailResult.provider,
      ...(isEthereal || process.env.NODE_ENV !== 'production' ? { testOtp: resetOtp, previewUrl: emailResult.previewUrl } : {}),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Step 2 & 3 for Reset Password: Verify Reset OTP & Update Password
// @route POST /api/auth/verify-otp-reset-password
const verifyOtpResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide registered email and 6-digit OTP code' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    const computedHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');

    // Retrieve active OTP record from MongoDB
    const otpRecord = await Otp.findOne({ email: cleanEmail, purpose: 'PASSWORD_RESET' });

    if (!otpRecord || otpRecord.otpHash !== computedHash) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP code. Please check your reset email.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email: cleanEmail, purpose: 'PASSWORD_RESET' });
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new reset code.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Step 2 verification only (no newPassword passed yet)
    if (!newPassword) {
      return res.json({
        success: true,
        message: 'OTP verified successfully! Please enter your new password.',
      });
    }

    // Step 3: Validate and update password
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Clean up OTP record
    await Otp.deleteMany({ email: cleanEmail, purpose: 'PASSWORD_RESET' });

    // Send password changed notification email
    sendPasswordChangedNotificationEmail(user).catch(err => console.error("[Pass Email Error]", err.message));

    return res.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Verify OTP reset password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Direct One-Click Password Reset Link Endpoint
// @route GET /api/auth/direct-email-reset
const directEmailResetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send(`<h2>Invalid token.</h2>`);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send(`<h2>Password Reset Link Expired or Invalid</h2>`);
    }

    const defaultNewPassword = `${user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}@123`;
    user.password = defaultNewPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send password changed notification email
    sendPasswordChangedNotificationEmail(user).catch(err => console.error("[Pass Email Error]", err.message));

    const jwtToken = generateToken(user._id);

    return res.redirect(`http://localhost:5173/login?directResetSuccess=true&token=${jwtToken}&role=${user.role}`);
  } catch (error) {
    return res.status(500).send(`<h2>Error processing password reset: ${error.message}</h2>`);
  }
};


// Helper: Send Registration Confirmation Email
async function sendRegistrationConfirmationEmail(user) {
  try {
    const htmlText = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #0A2412; padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">🌾 KisanSetu AI</h1>
          <p style="margin: 6px 0 0; color: #4ade80; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Registration Confirmed</p>
        </div>

        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0;">Welcome to KisanSetu AI, ${user.name}! 🎉</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Your KisanSetu AI account has been successfully registered and verified!</p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 18px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><b>Name:</b> ${user.name}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><b>Registered Email:</b> ${user.email}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><b>Role Portal:</b> ${user.role}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;"><b>Account Status:</b> Active & Verified</p>
          </div>

          <p style="color: #475569; font-size: 13px; line-height: 1.6;">You can now log in to your KisanSetu AI workspace to explore direct farm produce trading, APMC market intelligence, and verified procurement.</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="http://localhost:5173/login" style="background-color: #166534; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block;">
              Sign In to Your Workspace →
            </a>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: '[KisanSetu AI] Welcome! Your Account Registration Was Successful',
      htmlText,
      plainText: `Welcome to KisanSetu AI, ${user.name}! Your account as ${user.role} (${user.email}) has been successfully created.`,
    });
  } catch (err) {
    console.error('[Registration Email Error]', err.message);
  }
};

// Helper: Send Password Changed Notification Email
async function sendPasswordChangedNotificationEmail(user) {
  try {
    const htmlText = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #0A2412; padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">🌾 KisanSetu AI</h1>
          <p style="margin: 6px 0 0; color: #4ade80; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Security Alert</p>
        </div>

        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0;">Password Successfully Changed 🔒</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <b>${user.name}</b>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">This email confirms that the password for your KisanSetu AI account (<b>${user.email}</b>) was successfully updated.</p>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 800;">✓ Your password change is now complete and active.</p>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If you did not make this change, please contact support immediately or reset your password.</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="http://localhost:5173/login" style="background-color: #166534; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block;">
              Sign In with New Password →
            </a>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: '[KisanSetu AI] Security Notice: Your Account Password Was Successfully Changed',
      htmlText,
      plainText: `Hello ${user.name}, your KisanSetu AI account password for ${user.email} was successfully updated.`,
    });
  } catch (err) {
    console.error('[Password Changed Email Error]', err.message);
  }
};

module.exports = {
  sendRegistrationOTP,
  verifyRegistrationOTPAndCreateUser,
  registerUser,
  googleAuth,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtpResetPassword,
  directEmailResetPassword,
};

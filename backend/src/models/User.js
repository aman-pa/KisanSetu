const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['CONSUMER', 'FARMER', 'FPO', 'BULK_BUYER', 'LOGISTICS', 'ADMIN'],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    aadhaarNumber: {
      type: String,
    },
    aadhaarFrontImage: {
      type: String,
    },
    aadhaarBackImage: {
      type: String,
    },
    isIdentityVerified: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

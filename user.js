const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
   
const userSchema = new mongoose.Schema({
  name: {
    type: String,     
    required: [true, 'Name is required'],
    trim: true,    
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin', 'expert'],
    default: 'farmer',
    required: true
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number'],
    unique: true
  },
  
  location: {
    state: {
      type: String,
      required: [true, 'State is required'],
      enum: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli',
        'Daman and Diu', 'Lakshadweep', 'Puducherry', 'Andaman and Nicobar Islands'
      ]
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    village: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    }
  },
  
  profile: {
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    farmingExperience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      max: [100, 'Experience cannot exceed 100 years']
    },
    crops: [{
      type: String,
      trim: true
    }],
    languages: [{
      type: String,
      enum: ['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese', 'Sanskrit', 'Urdu'],
      default: ['English', 'Hindi']
    }]
  },
  
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationExpires: Date
  },
  
  preferences: {
    language: {
      type: String,
      enum: ['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese', 'Sanskrit', 'Urdu'],
      default: 'English'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'contacts'],
        default: 'public'
      },
      locationSharing: {
        type: Boolean,
        default: true
      }
    }
  },
  
  stats: {
    totalCropReports: {
      type: Number,
      default: 0
    },
    totalProduceListed: {
      type: Number,
      default: 0
    },
    totalTransactions: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  blockedReason: String,
  
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    deviceInfo: {
      userAgent: String,
      ip: String,
      lastUsed: Date
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'location.state': 1, 'location.district': 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  const { state, district, village, pincode } = this.location;
  return [village, district, state, pincode].filter(Boolean).join(', ');
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  const requiredFields = ['name', 'email', 'phone', 'location.state', 'location.district'];
  const completedFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    return value && value.toString().trim().length > 0;
  });
  return Math.round((completedFields.length / requiredFields.length) * 100);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update profile completion
userSchema.pre('save', function(next) {
  this.verification.isProfileComplete = this.profileCompletion >= 80;
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function(deviceInfo = {}) {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  this.refreshTokens.push({
    token: refreshToken,
    expiresAt,
    deviceInfo: {
      userAgent: deviceInfo.userAgent || 'Unknown',
      ip: deviceInfo.ip || 'Unknown',
      lastUsed: new Date()
    }
  });
  
  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  return refreshToken;
};

// Instance method to revoke refresh token
userSchema.methods.revokeRefreshToken = function(token){
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Instance method to revoke all refresh tokens
userSchema.methods.revokeAllRefreshTokens = function() {
  this.refreshTokens = [];
  return this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email){
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find users by location
userSchema.statics.findByLocation = function(state, district){
  const query = {};
  if (state) query['location.state'] = state;
  if (district) query['location.district'] = district;
  return this.find(query);
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get user statistics
userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: ['$verification.isEmailVerified',1,0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);

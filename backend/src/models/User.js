const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['applicant', 'employer'],
    default: 'applicant'
  },
  companyName: {
    type: String,
    trim: true
  },
  
  // Profile info
  avatar: {
    type: String,
    default: null
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String,
    trim: true
  }],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: {
    idCard: {
      url: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date
    },
    selfie: {
      url: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date
    },
    businessInfo: {
      name: String,
      registrationNumber: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date
    }
  },
  
  // Wallet
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Payment methods
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'bank'],
      required: true
    },
    name: String,
    last4: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    stripePaymentMethodId: String
  }],
  
  // Stats
  stats: {
    totalJobs: {
      type: Number,
      default: 0
    },
    completedJobs: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    jobAlerts: {
      enabled: { type: Boolean, default: true },
      categories: [String],
      maxDistance: { type: Number, default: 50 }, // km
      minPay: { type: Number, default: 10 }
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  
  // Timestamps
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ location: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ 'stats.averageRating': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for isEmployer
userSchema.virtual('isEmployer').get(function() {
  return this.verificationDocuments.businessInfo.verified;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    phone: this.phone,
    role: this.role,
    companyName: this.companyName,
    avatar: this.avatar,
    location: this.location,
    bio: this.bio,
    skills: this.skills,
    isVerified: this.isVerified,
    wallet: this.wallet,
    stats: this.stats,
    joinDate: this.createdAt
  };
};

// Method to update stats
userSchema.methods.updateStats = function() {
  // This will be called after job completion or rating
  // Implementation will be in the service layer
};

module.exports = mongoose.model('User', userSchema); 
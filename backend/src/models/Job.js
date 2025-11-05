const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Delivery', 'Events', 'Digital', 'Retail', 'Food Service', 'Other']
  },
  
  // Employer info
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Job details
  pay: {
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['hourly', 'fixed', 'commission'],
      default: 'fixed'
    }
  },
  
  // Location and timing
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  
  date: {
    type: Date,
    required: true
  },
  time: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  duration: {
    type: Number, // in hours
    required: true,
    min: 0.5
  },
  
  // Requirements
  requirements: {
    skills: [String],
    experience: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'expert'],
      default: 'none'
    },
    age: {
      min: { type: Number, min: 16 },
      max: { type: Number, max: 100 }
    },
    certifications: [String]
  },
  
  // Status and applications
  status: {
    type: String,
    enum: ['active', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  
  applications: [{
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    message: String,
    proposedPay: Number
  }],
  
  // Selected worker
  selectedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Job completion
  completion: {
    startedAt: Date,
    completedAt: Date,
    workerRating: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date
    },
    employerRating: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date
    }
  },
  
  // Payment
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'disputed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date,
    amount: Number,
    transactionId: String
  },
  
  // Additional info
  images: [{
    url: String,
    caption: String
  }],
  
  tags: [String],
  
  // Visibility and search
  isUrgent: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Views and engagement
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ location: '2dsphere' });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ selectedWorker: 1, status: 1 });
jobSchema.index({ date: 1 });
jobSchema.index({ 'pay.amount': 1 });
jobSchema.index({ isUrgent: 1, status: 1 });
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for isExpired
jobSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for isActive
jobSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Virtual for formatted pay
jobSchema.virtual('formattedPay').get(function() {
  return `${this.pay.currency}${this.pay.amount}`;
});

// Pre-save middleware to set expiration
jobSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to 30 days from creation
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to check if user can apply
jobSchema.methods.canApply = function(userId) {
  if (this.status !== 'active') return false;
  if (this.isExpired) return false;
  if (this.employer.toString() === userId.toString()) return false;
  
  // Check if already applied
  const existingApplication = this.applications.find(
    app => app.worker.toString() === userId.toString()
  );
  
  return !existingApplication;
};

// Method to apply for job
jobSchema.methods.apply = function(userId, message, proposedPay) {
  if (!this.canApply(userId)) {
    throw new Error('Cannot apply for this job');
  }
  
  this.applications.push({
    worker: userId,
    message,
    proposedPay
  });
  
  this.applicationsCount = this.applications.length;
  
  return this.save();
};

// Method to accept application
jobSchema.methods.acceptApplication = function(applicationId) {
  const application = this.applications.id(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = 'accepted';
  this.selectedWorker = application.worker;
  this.status = 'in_progress';
  
  return this.save();
};

// Method to complete job
jobSchema.methods.complete = function() {
  this.status = 'completed';
  this.completion.completedAt = new Date();
  
  return this.save();
};

// Static method to find nearby jobs
jobSchema.statics.findNearby = function(coordinates, maxDistance = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    status: 'active'
  });
};

module.exports = mongoose.model('Job', jobSchema); 
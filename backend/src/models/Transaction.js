const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // User info
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Transaction details
  type: {
    type: String,
    enum: ['earned', 'withdrawal', 'refund', 'bonus', 'fee'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true
  },
  
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Description and reference
  description: {
    type: String,
    required: true
  },
  
  reference: {
    type: String,
    unique: true
  },
  
  // Related entities
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment processing
  stripePaymentIntentId: String,
  stripeTransferId: String,
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  },
  
  // Timestamps
  processedAt: Date,
  failedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ job: 1 });
transactionSchema.index({ stripePaymentIntentId: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  const sign = this.type === 'withdrawal' || this.type === 'fee' ? '-' : '+';
  return `${sign}${this.currency}${Math.abs(this.amount).toFixed(2)}`;
});

// Virtual for isPositive
transactionSchema.virtual('isPositive').get(function() {
  return this.type === 'earned' || this.type === 'bonus' || this.type === 'refund';
});

// Pre-save middleware to generate reference
transactionSchema.pre('save', function(next) {
  if (this.isNew && !this.reference) {
    this.reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Static method to get user balance
transactionSchema.statics.getUserBalance = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: null,
        balance: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].balance : 0;
};

// Static method to create transaction
transactionSchema.statics.createTransaction = async function(data) {
  const transaction = new this(data);
  await transaction.save();
  
  // Update user balance
  const User = require('./User');
  const user = await User.findById(data.user);
  if (user) {
    const balance = await this.getUserBalance(data.user);
    user.wallet.balance = balance;
    await user.save();
  }
  
  return transaction;
};

// Method to process transaction
transactionSchema.methods.process = async function() {
  this.status = 'completed';
  this.processedAt = new Date();
  
  // Update user balance
  const User = require('./User');
  const user = await User.findById(this.user);
  if (user) {
    const Transaction = require('./Transaction');
    const balance = await Transaction.getUserBalance(this.user);
    user.wallet.balance = balance;
    await user.save();
  }
  
  return this.save();
};

// Method to fail transaction
transactionSchema.methods.fail = async function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  
  return this.save();
};

module.exports = mongoose.model('Transaction', transactionSchema); 
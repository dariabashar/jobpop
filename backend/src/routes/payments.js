const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Job = require('../models/Job');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payments/wallet
// @desc    Get user's wallet information
// @access  Private
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('wallet paymentMethods');

    res.json({
      success: true,
      data: {
        wallet: user.wallet,
        paymentMethods: user.paymentMethods
      }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('job', 'title companyName')
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/withdraw
// @desc    Withdraw money from wallet
// @access  Private
router.post('/withdraw', auth, [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, paymentMethodId } = req.body;

    const user = await User.findById(req.user._id);
    
    // Check if user has sufficient balance
    if (user.wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Check if payment method exists
    const paymentMethod = user.paymentMethods.id(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Create withdrawal transaction
    const transaction = await Transaction.createTransaction({
      user: req.user._id,
      type: 'withdrawal',
      amount: -amount, // Negative for withdrawal
      currency: user.wallet.currency,
      description: `Withdrawal to ${paymentMethod.name}`,
      paymentMethod: paymentMethodId,
      status: 'pending'
    });

    // TODO: Integrate with Stripe or other payment processor
    // For now, we'll simulate the withdrawal process
    setTimeout(async () => {
      try {
        await transaction.process();
      } catch (error) {
        console.error('Withdrawal processing error:', error);
        await transaction.fail('Processing failed');
      }
    }, 2000);

    res.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/add-payment-method
// @desc    Add a new payment method
// @access  Private
router.post('/add-payment-method', auth, [
  body('type')
    .isIn(['card', 'bank'])
    .withMessage('Type must be card or bank'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('last4')
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage('Last 4 digits must be 4 numbers'),
  body('stripePaymentMethodId')
    .optional()
    .isString()
    .withMessage('Stripe payment method ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type, name, last4, stripePaymentMethodId, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    // If this is the first payment method, make it default
    if (user.paymentMethods.length === 0) {
      isDefault = true;
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      user.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }

    // Add new payment method
    user.paymentMethods.push({
      type,
      name,
      last4,
      stripePaymentMethodId,
      isDefault: isDefault || false
    });

    await user.save();

    res.json({
      success: true,
      message: 'Payment method added successfully',
      data: {
        paymentMethods: user.paymentMethods
      }
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/payments/payment-method/:id
// @desc    Update payment method
// @access  Private
router.put('/payment-method/:id', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    const paymentMethod = user.paymentMethods.id(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    const { name, isDefault } = req.body;

    if (name !== undefined) {
      paymentMethod.name = name;
    }

    if (isDefault !== undefined) {
      if (isDefault) {
        // Unset other defaults
        user.paymentMethods.forEach(method => {
          method.isDefault = false;
        });
      }
      paymentMethod.isDefault = isDefault;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: {
        paymentMethods: user.paymentMethods
      }
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/payments/payment-method/:id
// @desc    Remove payment method
// @access  Private
router.delete('/payment-method/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const paymentMethod = user.paymentMethods.id(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Check if it's the default payment method
    if (paymentMethod.isDefault && user.paymentMethods.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default payment method. Set another as default first.'
      });
    }

    // Remove payment method
    user.paymentMethods = user.paymentMethods.filter(
      method => method._id.toString() !== req.params.id
    );

    // If no payment methods left, or if we deleted the default, set first as default
    if (user.paymentMethods.length > 0 && !user.paymentMethods.some(m => m.isDefault)) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Payment method removed successfully',
      data: {
        paymentMethods: user.paymentMethods
      }
    });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/complete-job/:jobId
// @desc    Complete job and process payment
// @access  Private
router.post('/complete-job/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only job owner can complete the job'
      });
    }

    // Check if job is in progress
    if (job.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Job must be in progress to complete'
      });
    }

    // Complete the job
    job.status = 'completed';
    job.completion.completedAt = new Date();
    await job.save();

    // Create payment transaction for worker
    const paymentAmount = job.pay.amount;
    const transaction = await Transaction.createTransaction({
      user: job.selectedWorker,
      type: 'earned',
      amount: paymentAmount,
      currency: job.pay.currency,
      description: `${job.title} - ${job.companyName}`,
      job: job._id,
      status: 'completed'
    });

    // Update job payment status
    job.payment.status = 'paid';
    job.payment.paidAt = new Date();
    job.payment.amount = paymentAmount;
    job.payment.transactionId = transaction._id;
    await job.save();

    // Update user stats
    const worker = await User.findById(job.selectedWorker);
    if (worker) {
      worker.stats.completedJobs += 1;
      worker.stats.totalEarnings += paymentAmount;
      await worker.save();
    }

    res.json({
      success: true,
      message: 'Job completed and payment processed successfully',
      data: {
        job,
        transaction
      }
    });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 
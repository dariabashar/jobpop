const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Job = require('../models/Job');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -passwordResetToken');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters long'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'location', 'bio', 'skills',
      'preferences'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get public profile of a user
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName avatar location bio skills isVerified stats createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/jobs
// @desc    Get user's jobs (as employer or worker)
// @access  Private
router.get('/jobs', auth, async (req, res) => {
  try {
    const { role = 'all', status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let jobs = [];
    let total = 0;

    if (role === 'employer' || role === 'all') {
      // Jobs posted by user
      const employerFilter = { employer: req.user._id };
      if (status) employerFilter.status = status;

      const [employerJobs, employerTotal] = await Promise.all([
        Job.find(employerFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('selectedWorker', 'firstName lastName avatar')
          .lean(),
        Job.countDocuments(employerFilter)
      ]);

      jobs = employerJobs;
      total = employerTotal;
    }

    if (role === 'worker' || role === 'all') {
      // Jobs where user is selected worker
      const workerFilter = { selectedWorker: req.user._id };
      if (status) workerFilter.status = status;

      const [workerJobs, workerTotal] = await Promise.all([
        Job.find(workerFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('employer', 'firstName lastName avatar companyName')
          .lean(),
        Job.countDocuments(workerFilter)
      ]);

      if (role === 'worker') {
        jobs = workerJobs;
        total = workerTotal;
      } else {
        // Combine and sort by date
        jobs = [...jobs, ...workerJobs].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        total = total + workerTotal;
      }
    }

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, async (req, res) => {
  try {
    // This would typically use multer for file upload
    // For now, we'll assume the file URL is provided in the request body
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/verify
// @desc    Submit verification documents
// @access  Private
router.post('/verify', auth, [
  body('idCardUrl')
    .isURL()
    .withMessage('Valid ID card URL is required'),
  body('selfieUrl')
    .isURL()
    .withMessage('Valid selfie URL is required'),
  body('businessInfo.name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Business name must be at least 2 characters long'),
  body('businessInfo.registrationNumber')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Registration number must be at least 5 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { idCardUrl, selfieUrl, businessInfo } = req.body;

    const updateData = {
      'verificationDocuments.idCard.url': idCardUrl,
      'verificationDocuments.selfie.url': selfieUrl
    };

    if (businessInfo) {
      updateData['verificationDocuments.businessInfo.name'] = businessInfo.name;
      updateData['verificationDocuments.businessInfo.registrationNumber'] = businessInfo.registrationNumber;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Verification documents submitted successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications must be a boolean'),
  body('jobAlerts.enabled')
    .optional()
    .isBoolean()
    .withMessage('Job alerts enabled must be a boolean'),
  body('jobAlerts.categories')
    .optional()
    .isArray()
    .withMessage('Job alert categories must be an array'),
  body('jobAlerts.maxDistance')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Max distance must be between 1 and 100 km'),
  body('jobAlerts.minPay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum pay must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body.preferences },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    // Check if user has active jobs
    const activeJobs = await Job.find({
      $or: [
        { employer: req.user._id, status: { $in: ['active', 'in_progress'] } },
        { selectedWorker: req.user._id, status: { $in: ['active', 'in_progress'] } }
      ]
    });

    if (activeJobs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active jobs'
      });
    }

    // Soft delete - mark as inactive
    await User.findByIdAndUpdate(req.user._id, {
      isActive: false,
      email: `deleted_${Date.now()}_${req.user.email}`,
      phone: null
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 
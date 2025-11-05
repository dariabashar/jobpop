const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', optionalAuth, [
  query('category').optional().isIn(['Delivery', 'Events', 'Digital', 'Retail', 'Food Service', 'Other']),
  query('city').optional().isString(),
  query('minPay').optional().isNumeric(),
  query('maxPay').optional().isNumeric(),
  query('sort').optional().isIn(['recent', 'pay_high', 'pay_low', 'distance']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat({ min: 0.1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      category,
      city,
      minPay,
      maxPay,
      sort = 'recent',
      page = 1,
      limit = 20,
      lat,
      lng,
      radius = 50,
      search
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (city && city !== 'All Cities') {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (minPay || maxPay) {
      filter['pay.amount'] = {};
      if (minPay) filter['pay.amount'].$gte = parseFloat(minPay);
      if (maxPay) filter['pay.amount'].$lte = parseFloat(maxPay);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'pay_high':
        sortObj = { 'pay.amount': -1 };
        break;
      case 'pay_low':
        sortObj = { 'pay.amount': 1 };
        break;
      case 'distance':
        if (lat && lng) {
          // Will be handled by geoNear aggregation
        } else {
          sortObj = { createdAt: -1 };
        }
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    let jobs;
    let total;

    // If coordinates provided, use geoNear
    if (lat && lng) {
      const coordinates = [parseFloat(lng), parseFloat(lat)];
      
      const pipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: coordinates
            },
            distanceField: 'distance',
            maxDistance: radius * 1000, // Convert km to meters
            spherical: true
          }
        },
        { $match: filter },
        { $sort: sort === 'distance' ? { distance: 1 } : sortObj },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'employer',
            foreignField: '_id',
            as: 'employerInfo'
          }
        },
        {
          $addFields: {
            employerInfo: { $arrayElemAt: ['$employerInfo', 0] }
          }
        },
        {
          $project: {
            'employerInfo.password': 0,
            'employerInfo.email': 0
          }
        }
      ];

      const countPipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: coordinates
            },
            distanceField: 'distance',
            maxDistance: radius * 1000,
            spherical: true
          }
        },
        { $match: filter },
        { $count: 'total' }
      ];

      const [jobsResult, countResult] = await Promise.all([
        Job.aggregate(pipeline),
        Job.aggregate(countPipeline)
      ]);

      jobs = jobsResult;
      total = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      // Regular query without geo
      const [jobsResult, totalResult] = await Promise.all([
        Job.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('employer', 'firstName lastName avatar isVerified')
          .lean(),
        Job.countDocuments(filter)
      ]);

      jobs = jobsResult;
      total = totalResult;
    }

    // Add distance calculation for non-geo queries if coordinates provided
    if (lat && lng && !jobs.some(job => job.distance !== undefined)) {
      const coordinates = [parseFloat(lng), parseFloat(lat)];
      jobs.forEach(job => {
        if (job.location.coordinates) {
          const jobCoords = job.location.coordinates;
          const distance = calculateDistance(
            coordinates[1], coordinates[0],
            jobCoords[1], jobCoords[0]
          );
          job.distance = distance;
        }
      });
    }

    // Check if user has applied to each job
    if (req.user) {
      jobs.forEach(job => {
        job.hasApplied = job.applications.some(
          app => app.worker.toString() === req.user._id.toString()
        );
      });
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
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'firstName lastName avatar isVerified companyName')
      .populate('selectedWorker', 'firstName lastName avatar')
      .populate('applications.worker', 'firstName lastName avatar');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment views
    job.views += 1;
    await job.save();

    // Check if user has applied
    if (req.user) {
      job.hasApplied = job.applications.some(
        app => app.worker._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('category')
    .isIn(['Delivery', 'Events', 'Digital', 'Retail', 'Food Service', 'Other'])
    .withMessage('Invalid category'),
  body('pay.amount')
    .isFloat({ min: 1 })
    .withMessage('Pay amount must be at least 1'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format'),
  body('time.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format'),
  body('duration')
    .isFloat({ min: 0.5 })
    .withMessage('Duration must be at least 0.5 hours')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if user is verified (for employers)
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account verification required to post jobs'
      });
    }

    const jobData = {
      ...req.body,
      employer: req.user._id,
      companyName: req.user.companyName || `${req.user.firstName} ${req.user.lastName}`
    };

    const job = new Job(jobData);
    await job.save();

    // Populate employer info
    await job.populate('employer', 'firstName lastName avatar isVerified');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (job owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
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
        message: 'Not authorized to update this job'
      });
    }

    // Check if job can be updated
    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update job that is not active'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employer', 'firstName lastName avatar isVerified');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (job owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
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
        message: 'Not authorized to delete this job'
      });
    }

    // Check if job can be deleted
    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete job that is not active'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

module.exports = router; 
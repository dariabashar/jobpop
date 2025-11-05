const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/ratings/:jobId
// @desc    Rate a completed job
// @access  Private
router.post('/:jobId', auth, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { rating, review } = req.body;
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is completed
    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed jobs'
      });
    }

    // Check if user is involved in the job
    const isEmployer = job.employer.toString() === req.user._id.toString();
    const isWorker = job.selectedWorker.toString() === req.user._id.toString();

    if (!isEmployer && !isWorker) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this job'
      });
    }

    // Check if user has already rated
    const existingRating = isEmployer 
      ? job.completion.employerRating.rating 
      : job.completion.workerRating.rating;

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this job'
      });
    }

    // Add rating
    if (isEmployer) {
      job.completion.employerRating = {
        rating,
        review,
        ratedAt: new Date()
      };
    } else {
      job.completion.workerRating = {
        rating,
        review,
        ratedAt: new Date()
      };
    }

    await job.save();

    // Update user stats if rating is for worker
    if (isEmployer) {
      const worker = await User.findById(job.selectedWorker);
      if (worker) {
        // Calculate new average rating
        const totalRatings = worker.stats.totalReviews + 1;
        const totalRatingSum = (worker.stats.averageRating * worker.stats.totalReviews) + rating;
        const newAverageRating = totalRatingSum / totalRatings;

        worker.stats.averageRating = Math.round(newAverageRating * 10) / 10; // Round to 1 decimal
        worker.stats.totalReviews = totalRatings;
        await worker.save();
      }
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/ratings/job/:jobId
// @desc    Get ratings for a specific job
// @access  Public
router.get('/job/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .select('completion employer selectedWorker')
      .populate('employer', 'firstName lastName avatar')
      .populate('selectedWorker', 'firstName lastName avatar');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const ratings = {
      employerRating: job.completion.employerRating,
      workerRating: job.completion.workerRating,
      employer: job.employer,
      worker: job.selectedWorker
    };

    res.json({
      success: true,
      data: { ratings }
    });
  } catch (error) {
    console.error('Get job ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/ratings/user/:userId
// @desc    Get ratings for a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Find jobs where user was rated (as worker)
    const jobs = await Job.find({
      selectedWorker: req.params.userId,
      'completion.workerRating.rating': { $exists: true, $ne: null }
    })
      .sort({ 'completion.workerRating.ratedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('employer', 'firstName lastName avatar')
      .select('title companyName completion.workerRating date')
      .lean();

    const total = await Job.countDocuments({
      selectedWorker: req.params.userId,
      'completion.workerRating.rating': { $exists: true, $ne: null }
    });

    const ratings = jobs.map(job => ({
      id: job._id,
      jobTitle: job.title,
      companyName: job.companyName,
      rating: job.completion.workerRating.rating,
      review: job.completion.workerRating.review,
      ratedAt: job.completion.workerRating.ratedAt,
      jobDate: job.date,
      employer: job.employer
    }));

    res.json({
      success: true,
      data: {
        ratings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/ratings/:jobId
// @desc    Update existing rating
// @access  Private
router.put('/:jobId', auth, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { rating, review } = req.body;
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is involved in the job
    const isEmployer = job.employer.toString() === req.user._id.toString();
    const isWorker = job.selectedWorker.toString() === req.user._id.toString();

    if (!isEmployer && !isWorker) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update rating for this job'
      });
    }

    // Check if user has already rated
    const existingRating = isEmployer 
      ? job.completion.employerRating.rating 
      : job.completion.workerRating.rating;

    if (!existingRating) {
      return res.status(400).json({
        success: false,
        message: 'No existing rating to update'
      });
    }

    // Update rating
    if (isEmployer) {
      job.completion.employerRating.rating = rating;
      if (review !== undefined) {
        job.completion.employerRating.review = review;
      }
      job.completion.employerRating.ratedAt = new Date();
    } else {
      job.completion.workerRating.rating = rating;
      if (review !== undefined) {
        job.completion.workerRating.review = review;
      }
      job.completion.workerRating.ratedAt = new Date();
    }

    await job.save();

    // Update user stats if rating is for worker
    if (isEmployer) {
      const worker = await User.findById(job.selectedWorker);
      if (worker) {
        // Recalculate average rating
        const jobs = await Job.find({
          selectedWorker: job.selectedWorker,
          'completion.workerRating.rating': { $exists: true, $ne: null }
        });

        const totalRatings = jobs.length;
        const totalRatingSum = jobs.reduce((sum, j) => sum + j.completion.workerRating.rating, 0);
        const newAverageRating = totalRatingSum / totalRatings;

        worker.stats.averageRating = Math.round(newAverageRating * 10) / 10;
        worker.stats.totalReviews = totalRatings;
        await worker.save();
      }
    }

    res.json({
      success: true,
      message: 'Rating updated successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/ratings/:jobId
// @desc    Delete rating
// @access  Private
router.delete('/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is involved in the job
    const isEmployer = job.employer.toString() === req.user._id.toString();
    const isWorker = job.selectedWorker.toString() === req.user._id.toString();

    if (!isEmployer && !isWorker) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete rating for this job'
      });
    }

    // Check if user has rated
    const existingRating = isEmployer 
      ? job.completion.employerRating.rating 
      : job.completion.workerRating.rating;

    if (!existingRating) {
      return res.status(400).json({
        success: false,
        message: 'No rating to delete'
      });
    }

    // Delete rating
    if (isEmployer) {
      job.completion.employerRating = {};
    } else {
      job.completion.workerRating = {};
    }

    await job.save();

    // Update user stats if rating was for worker
    if (isEmployer) {
      const worker = await User.findById(job.selectedWorker);
      if (worker) {
        // Recalculate average rating
        const jobs = await Job.find({
          selectedWorker: job.selectedWorker,
          'completion.workerRating.rating': { $exists: true, $ne: null }
        });

        const totalRatings = jobs.length;
        if (totalRatings > 0) {
          const totalRatingSum = jobs.reduce((sum, j) => sum + j.completion.workerRating.rating, 0);
          const newAverageRating = totalRatingSum / totalRatings;
          worker.stats.averageRating = Math.round(newAverageRating * 10) / 10;
        } else {
          worker.stats.averageRating = 0;
        }
        worker.stats.totalReviews = totalRatings;
        await worker.save();
      }
    }

    res.json({
      success: true,
      message: 'Rating deleted successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 
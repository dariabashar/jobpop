const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/applications/:jobId
// @desc    Apply for a job
// @access  Private
router.post('/:jobId', auth, [
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  body('proposedPay')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Proposed pay must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user can apply
    if (!job.canApply(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply for this job'
      });
    }

    const { message, proposedPay } = req.body;

    // Apply for the job
    await job.apply(req.user._id, message, proposedPay);

    // Populate job with updated data
    await job.populate('employer', 'firstName lastName avatar');
    await job.populate('applications.worker', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a job (employer only)
// @access  Private
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('applications.worker', 'firstName lastName avatar location skills stats');

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
        message: 'Not authorized to view applications for this job'
      });
    }

    res.json({
      success: true,
      data: {
        applications: job.applications,
        totalApplications: job.applications.length
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/applications/my
// @desc    Get user's applications
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Find jobs where user has applied
    const filter = {
      'applications.worker': req.user._id
    };

    if (status) {
      filter['applications.status'] = status;
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('employer', 'firstName lastName avatar companyName')
      .lean();

    // Extract user's application from each job
    const applications = jobs.map(job => {
      const userApplication = job.applications.find(
        app => app.worker.toString() === req.user._id.toString()
      );
      
      return {
        job: {
          id: job._id,
          title: job.title,
          companyName: job.companyName,
          pay: job.pay,
          location: job.location,
          date: job.date,
          time: job.time,
          status: job.status,
          employer: job.employer
        },
        application: userApplication
      };
    });

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/applications/:jobId/:applicationId
// @desc    Update application status (accept/reject/withdraw)
// @access  Private
router.put('/:jobId/:applicationId', auth, [
  body('action')
    .isIn(['accept', 'reject', 'withdraw'])
    .withMessage('Action must be accept, reject, or withdraw')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { action } = req.body;
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const application = job.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (action === 'accept') {
      // Only job owner can accept applications
      if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only job owner can accept applications'
        });
      }

      // Check if job is still active
      if (job.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot accept application for inactive job'
        });
      }

      // Accept the application
      await job.acceptApplication(req.params.applicationId);

      // Update job status to in_progress
      job.status = 'in_progress';
      job.completion.startedAt = new Date();
      await job.save();

      res.json({
        success: true,
        message: 'Application accepted successfully',
        data: { job }
      });
    } else if (action === 'reject') {
      // Only job owner can reject applications
      if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only job owner can reject applications'
        });
      }

      application.status = 'rejected';
      await job.save();

      res.json({
        success: true,
        message: 'Application rejected successfully',
        data: { job }
      });
    } else if (action === 'withdraw') {
      // Only applicant can withdraw their application
      if (application.worker.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only applicant can withdraw their application'
        });
      }

      application.status = 'withdrawn';
      await job.save();

      res.json({
        success: true,
        message: 'Application withdrawn successfully',
        data: { job }
      });
    }
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/applications/:jobId
// @desc    Withdraw application
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

    // Find user's application
    const userApplication = job.applications.find(
      app => app.worker.toString() === req.user._id.toString()
    );

    if (!userApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application can be withdrawn
    if (userApplication.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application that is not pending'
      });
    }

    // Remove application
    job.applications = job.applications.filter(
      app => app.worker.toString() !== req.user._id.toString()
    );
    job.applicationsCount = job.applications.length;
    await job.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 
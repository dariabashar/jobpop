const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mock notifications data - in a real app, this would be a database model
let notifications = [];

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    // Filter notifications for current user
    let userNotifications = notifications.filter(n => n.userId === req.user._id.toString());

    if (unreadOnly === 'true') {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    // Sort by date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const total = userNotifications.length;
    const paginatedNotifications = userNotifications.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = notifications.find(n => 
      n.id === req.params.id && n.userId === req.user._id.toString()
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    notification.readAt = new Date();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === req.user._id.toString());
    
    userNotifications.forEach(notification => {
      notification.read = true;
      notification.readAt = new Date();
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { count: userNotifications.length }
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationIndex = notifications.findIndex(n => 
      n.id === req.params.id && n.userId === req.user._id.toString()
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notifications.splice(notificationIndex, 1);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications
// @access  Private
router.delete('/clear-all', auth, async (req, res) => {
  try {
    const initialCount = notifications.length;
    notifications = notifications.filter(n => n.userId !== req.user._id.toString());
    const deletedCount = initialCount - notifications.length;

    res.json({
      success: true,
      message: 'All notifications cleared',
      data: { deletedCount }
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = notifications.filter(n => 
      n.userId === req.user._id.toString() && !n.read
    ).length;

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to create notification (used by other parts of the app)
const createNotification = (userId, type, title, message, data = {}) => {
  const notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date()
  };

  notifications.push(notification);
  return notification;
};

// Export the helper function
module.exports = { router, createNotification }; 
const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mock chat data - in a real app, this would be a database model
let conversations = [];
let messages = [];

// @route   GET /api/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const userConversations = conversations.filter(c => 
      c.participants.includes(req.user._id.toString())
    );

    // Sort by last message date
    userConversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json({
      success: true,
      data: { conversations: userConversations }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/conversation/:conversationId
// @desc    Get conversation by ID
// @access  Private
router.get('/conversation/:conversationId', auth, async (req, res) => {
  try {
    const conversation = conversations.find(c => 
      c.id === req.params.conversationId && 
      c.participants.includes(req.user._id.toString())
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/messages/:conversationId
// @desc    Get messages for a conversation
// @access  Private
router.get('/messages/:conversationId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is part of the conversation
    const conversation = conversations.find(c => 
      c.id === req.params.conversationId && 
      c.participants.includes(req.user._id.toString())
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get messages for this conversation
    const conversationMessages = messages
      .filter(m => m.conversationId === req.params.conversationId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Paginate
    const total = conversationMessages.length;
    const paginatedMessages = conversationMessages.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        messages: paginatedMessages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chat/conversation
// @desc    Create a new conversation
// @access  Private
router.post('/conversation', auth, [
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*')
    .isMongoId()
    .withMessage('Invalid participant ID'),
  body('jobId')
    .optional()
    .isMongoId()
    .withMessage('Invalid job ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { participants, jobId, title } = req.body;

    // Add current user to participants if not already included
    if (!participants.includes(req.user._id.toString())) {
      participants.push(req.user._id.toString());
    }

    // Check if conversation already exists
    const existingConversation = conversations.find(c => 
      c.participants.length === participants.length &&
      c.participants.every(p => participants.includes(p))
    );

    if (existingConversation) {
      return res.json({
        success: true,
        message: 'Conversation already exists',
        data: { conversation: existingConversation }
      });
    }

    // Create new conversation
    const conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants,
      jobId,
      title: title || 'New Conversation',
      createdAt: new Date(),
      lastMessageAt: new Date()
    };

    conversations.push(conversation);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: { conversation }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chat/message
// @desc    Send a message
// @access  Private
router.post('/message', auth, [
  body('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId, content } = req.body;

    // Check if user is part of the conversation
    const conversation = conversations.find(c => 
      c.id === conversationId && 
      c.participants.includes(req.user._id.toString())
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: req.user._id.toString(),
      content,
      createdAt: new Date(),
      read: false
    };

    messages.push(message);

    // Update conversation last message
    conversation.lastMessageAt = new Date();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chat/messages/:conversationId/read
// @desc    Mark messages as read
// @access  Private
router.put('/messages/:conversationId/read', auth, async (req, res) => {
  try {
    // Check if user is part of the conversation
    const conversation = conversations.find(c => 
      c.id === req.params.conversationId && 
      c.participants.includes(req.user._id.toString())
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Mark unread messages as read
    const unreadMessages = messages.filter(m => 
      m.conversationId === req.params.conversationId &&
      m.senderId !== req.user._id.toString() &&
      !m.read
    );

    unreadMessages.forEach(message => {
      message.read = true;
      message.readAt = new Date();
    });

    res.json({
      success: true,
      message: 'Messages marked as read',
      data: { readCount: unreadMessages.length }
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/chat/message/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/message/:messageId', auth, async (req, res) => {
  try {
    const messageIndex = messages.findIndex(m => 
      m.id === req.params.messageId && 
      m.senderId === req.user._id.toString()
    );

    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    messages.splice(messageIndex, 1);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/unread-count
// @desc    Get unread messages count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = messages.filter(m => 
      m.senderId !== req.user._id.toString() && 
      !m.read &&
      conversations.some(c => 
        c.id === m.conversationId && 
        c.participants.includes(req.user._id.toString())
      )
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

module.exports = router; 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('../config');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    message: 'Server is running without database'
  });
});

// Mock API endpoints for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    data: {
      timestamp: new Date().toISOString(),
      endpoints: [
        '/api/health',
        '/api/test',
        '/api/auth/register',
        '/api/auth/login',
        '/api/jobs',
        '/api/users/profile'
      ]
    }
  });
});

// Mock auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully (mock)',
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'mock-user-id',
        email,
        firstName,
        lastName,
        isVerified: false
      }
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  res.json({
    success: true,
    message: 'Login successful (mock)',
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'mock-user-id',
        email,
        firstName: 'Mock',
        lastName: 'User',
        isVerified: true
      }
    }
  });
});

// Mock jobs endpoint
app.get('/api/jobs', (req, res) => {
  const mockJobs = [
    {
      id: '1',
      title: 'Food Delivery Driver',
      company: 'QuickEats',
      pay: { amount: 25, currency: 'USD' },
      location: { address: '123 Main St', city: 'New York' },
      date: '2025-01-25',
      time: { start: '14:00', end: '18:00' },
      category: 'Delivery',
      status: 'active'
    },
    {
      id: '2',
      title: 'Event Setup Assistant',
      company: 'EventPro',
      pay: { amount: 40, currency: 'USD' },
      location: { address: '456 Oak Ave', city: 'Los Angeles' },
      date: '2025-01-26',
      time: { start: '09:00', end: '17:00' },
      category: 'Events',
      status: 'active'
    }
  ];

  res.json({
    success: true,
    data: {
      jobs: mockJobs,
      pagination: {
        page: 1,
        limit: 20,
        total: mockJobs.length,
        pages: 1
      }
    }
  });
});

app.post('/api/jobs', (req, res) => {
  const { title, description, category, pay } = req.body;
  
  if (!title || !description || !category || !pay) {
    return res.status(400).json({
      success: false,
      message: 'Required fields missing'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Job created successfully (mock)',
    data: {
      job: {
        id: 'mock-job-' + Date.now(),
        title,
        description,
        category,
        pay,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    }
  });
});

// Mock user profile endpoint
app.get('/api/users/profile', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: 'mock-user-id',
        firstName: 'Mock',
        lastName: 'User',
        email: 'mock@example.com',
        location: 'New York',
        bio: 'Mock user for testing',
        skills: ['Delivery', 'Customer Service'],
        isVerified: true,
        wallet: { balance: 100, currency: 'USD' },
        stats: {
          totalJobs: 5,
          completedJobs: 4,
          totalEarnings: 200,
          averageRating: 4.5,
          totalReviews: 4
        }
      }
    }
  });
});

// Mock wallet endpoint
app.get('/api/payments/wallet', (req, res) => {
  res.json({
    success: true,
    data: {
      wallet: {
        balance: 150,
        currency: 'USD'
      },
      paymentMethods: [
        {
          id: '1',
          type: 'card',
          name: 'Visa Card',
          last4: '1234',
          isDefault: true
        }
      ]
    }
  });
});

// Mock notifications endpoint
app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [
        {
          id: '1',
          type: 'job_application',
          title: 'New Application',
          message: 'Someone applied to your job',
          read: false,
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Development server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`⚠️  This is a mock server without database`);
}); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('../config');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const paymentRoutes = require('./routes/payments');
const ratingRoutes = require('./routes/ratings');
const { router: notificationRoutes } = require('./routes/notifications');
const chatRoutes = require('./routes/chat');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { auth } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutes
  max: config.rateLimitMaxRequests, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', auth, applicationRoutes);
app.use('/api/payments', auth, paymentRoutes);
app.use('/api/ratings', auth, ratingRoutes);
app.use('/api/notifications', auth, notificationRoutes);
app.use('/api/chat', auth, chatRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = config.nodeEnv === 'production' 
      ? config.mongoUriProd 
      : config.mongoUri;
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = config.port;

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  });

  // Socket.io setup for real-time features
  const io = require('socket.io')(server, {
    cors: {
      origin: config.corsOrigin,
      credentials: true
    }
  });

  // Socket.io connection handling
  require('./socket')(io);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
};

startServer(); 
require('dotenv').config();

module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jobpop',
  mongoUriProd: process.env.MONGODB_URI_PROD,
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // CORS Configuration
  corsOrigin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  
  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  },
  
  // Email Configuration
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  
  // File Upload Configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
  uploadPath: process.env.UPLOAD_PATH || './uploads'
}; 
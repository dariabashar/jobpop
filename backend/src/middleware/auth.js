const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../../config');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated.' 
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Account is banned.',
        reason: user.banReason 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Internal server error.' 
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive && !user.isBanned) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Admin auth
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.isAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.' 
        });
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

// Verified user auth
const verifiedAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.isVerified) {
        return res.status(403).json({ 
          message: 'Account verification required.' 
        });
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  auth,
  optionalAuth,
  adminAuth,
  verifiedAuth
}; 
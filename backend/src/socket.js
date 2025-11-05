const jwt = require('jsonwebtoken');
const User = require('./models/User');
const config = require('../config');

module.exports = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive || user.isBanned) {
        return next(new Error('Authentication error'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.firstName} ${socket.user.lastName} (${socket.user._id})`);
    
    // Store connected user
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user
    });

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Handle user joining job-specific rooms
    socket.on('join-job', (jobId) => {
      socket.join(`job_${jobId}`);
      console.log(`User ${socket.user._id} joined job room: ${jobId}`);
    });

    // Handle user leaving job-specific rooms
    socket.on('leave-job', (jobId) => {
      socket.leave(`job_${jobId}`);
      console.log(`User ${socket.user._id} left job room: ${jobId}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { conversationId, jobId } = data;
      
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('user-typing', {
          userId: socket.user._id,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
          conversationId
        });
      }
      
      if (jobId) {
        socket.to(`job_${jobId}`).emit('user-typing', {
          userId: socket.user._id,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
          jobId
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { conversationId, jobId } = data;
      
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('user-stop-typing', {
          userId: socket.user._id,
          conversationId
        });
      }
      
      if (jobId) {
        socket.to(`job_${jobId}`).emit('user-stop-typing', {
          userId: socket.user._id,
          jobId
        });
      }
    });

    // Handle online status
    socket.on('set-online', () => {
      socket.broadcast.emit('user-online', {
        userId: socket.user._id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.firstName} ${socket.user.lastName} (${socket.user._id})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.user._id.toString());
      
      // Broadcast offline status
      socket.broadcast.emit('user-offline', {
        userId: socket.user._id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`
      });
    });
  });

  // Helper functions to emit events from other parts of the app
  const emitToUser = (userId, event, data) => {
    const userData = connectedUsers.get(userId.toString());
    if (userData) {
      io.to(userData.socketId).emit(event, data);
    }
  };

  const emitToJob = (jobId, event, data) => {
    io.to(`job_${jobId}`).emit(event, data);
  };

  const emitToConversation = (conversationId, event, data) => {
    io.to(`conversation_${conversationId}`).emit(event, data);
  };

  const emitToAll = (event, data) => {
    io.emit(event, data);
  };

  // Export helper functions
  return {
    emitToUser,
    emitToJob,
    emitToConversation,
    emitToAll,
    connectedUsers
  };
}; 
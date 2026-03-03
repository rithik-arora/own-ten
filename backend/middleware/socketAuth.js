import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};


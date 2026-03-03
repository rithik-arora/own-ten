import express from 'express';
// import dotenv from 'dotenv';
// dotenv.config();
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import connectDB from './config/database.js';
import { configureCloudinary } from './config/cloudinary.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { initializeSocket } from './config/socket.js';
import authRoutes from './routes/auth.routes.js';
import passwordRoutes from './routes/auth.password.routes.js';
import healthRoutes from './routes/health.routes.js';
import propertyRoutes from './routes/property.routes.js';
import disputeRoutes from './routes/dispute.routes.js';
import messageRoutes from './routes/message.routes.js';
import evidenceRoutes from './routes/evidence.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import invitationRoutes from './routes/invitation.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import joinRequestRoutes from './routes/joinRequest.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import './config/redis.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

// Import cron jobs
import './cron/rentReminder.js';

// Load environment variables
// dotenv.config();

// Connect to MongoDB
connectDB();

// Configure Cloudinary
configureCloudinary();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))


// Rate limiting (Redis-backed when available)
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordRoutes);


app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.use('/api/properties', propertyRoutes)

// app.use('/api/properties', propertyRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize Socket.io
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});


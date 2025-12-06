import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import referralRoutes from './routes/referralRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/referral-system';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  })
  .catch((err: Error) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Trying to continue without database connection...');
  });

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Referral System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      referrals: '/api/referrals',
      purchases: '/api/purchases',
      health: '/api/health'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/purchases', purchaseRoutes);

// Health check endpoint with database status
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  let dbMessage = 'Unknown';
  
  switch(dbStatus) {
    case 0: dbMessage = 'Disconnected'; break;
    case 1: dbMessage = 'Connected'; break;
    case 2: dbMessage = 'Connecting'; break;
    case 3: dbMessage = 'Disconnecting'; break;
  }
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Referral System API',
    database: {
      status: dbMessage,
      name: mongoose.connection.name || 'Not connected'
    },
    uptime: process.uptime()
  });
});

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        status: mongoose.connection.readyState 
      });
    }
    
    // Try to create a test user
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: String,
      name: String
    }));
    
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    res.json({
      success: true,
      message: 'Database is working',
      testUser: testUser || 'No test user found',
      collections: Object.keys(mongoose.connection.collections)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler for undefined routes
// 404 handler for undefined routes - PUT THIS AFTER ALL YOUR ROUTES
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/test-db',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/forgot-password',
      'POST /api/auth/reset-password',
      'GET /api/auth/me',
      'GET /api/referrals/stats',
      'GET /api/referrals/history',
      'POST /api/purchases',
      'GET /api/purchases/history'
    ]
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown - FIXED VERSION
const gracefulShutdown = async () => {
  console.log('Shutdown signal received: closing HTTP server');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      // Close MongoDB connection with a timeout
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    } finally {
      process.exit(0);
    }
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle various shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);  // Ctrl+C

export default app;
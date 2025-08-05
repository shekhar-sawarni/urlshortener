require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { connectRedis } = require('./config/redis');
const { connectMongoDB } = require('./config/mongodb');
const urlRoutes = require('./routes/urlRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware with custom CSP for web interface
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30, // limit each IP to 30 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// API routes
app.use('/api', urlRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
  });
});

// Root endpoint - serve the HTML page
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist',
  });
});

// Global error handler
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    console.log('🚀 Starting URL Shortener server...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Port: ${PORT}`);
    
    // Connect to Redis
    await connectRedis();
    console.log('✅ Redis connected successfully');

    // Connect to MongoDB
    await connectMongoDB();
    console.log('✅ MongoDB clusters connected successfully');

    // Start the server with error handling
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Web interface: http://localhost:${PORT}/`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try a different port or kill the existing process.`);
        console.log('💡 Try: taskkill /f /im node.exe');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          const { disconnectRedis } = require('./config/redis');
          const { disconnectMongoDB } = require('./config/mongodb');
          
          await disconnectRedis();
          await disconnectMongoDB();
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer(); 
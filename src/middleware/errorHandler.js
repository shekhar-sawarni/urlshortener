/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.message) {
    // Use custom error message if available
    message = err.message;
    
    // Set appropriate status codes based on error message
    if (err.message.includes('not found')) {
      statusCode = 404;
    } else if (err.message.includes('Invalid') || err.message.includes('Validation')) {
      statusCode = 400;
    } else if (err.message.includes('Unauthorized')) {
      statusCode = 401;
    } else if (err.message.includes('Forbidden')) {
      statusCode = 403;
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler; 
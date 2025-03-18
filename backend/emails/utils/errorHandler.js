/**
 * Async handler to avoid try-catch blocks in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default {
  asyncHandler,
  ApiError,
  errorMiddleware
};


// /**
//  * Custom error classes for email system
//  */

// export class EmailSystemError extends Error {
//   constructor(message, details = {}) {
//     super(message);
//     this.name = 'EmailSystemError';
//     this.details = details;
//     this.timestamp = new Date().toISOString();
//   }

//   toJSON() {
//     return {
//       name: this.name,
//       message: this.message,
//       details: this.details,
//       timestamp: this.timestamp
//     };
//   }
// }

// export class ConnectionError extends EmailSystemError {
//   constructor(message, details = {}) {
//     super(message, details);
//     this.name = 'ConnectionError';
//   }
// }

// export class AuthenticationError extends EmailSystemError {
//   constructor(message, details = {}) {
//     super(message, details);
//     this.name = 'AuthenticationError';
//   }
// }

// export class ValidationError extends EmailSystemError {
//   constructor(message, details = {}) {
//     super(message, details);
//     this.name = 'ValidationError';
//   }
// }

// export class SyncError extends EmailSystemError {
//   constructor(message, details = {}) {
//     super(message, details);
//     this.name = 'SyncError';
//   }
// }

// export class AutomationError extends EmailSystemError {
//   constructor(message, details = {}) {
//     super(message, details);
//     this.name = 'AutomationError';
//   }
// }

// export class RateLimitError extends EmailSystemError {
//   constructor(message, details = {}) {
//     super(message, details);
//     this.name = 'RateLimitError';
//   }
// }

// /**
//  * Error handler middleware
//  */
// export const errorHandler = (err, req, res, next) => {
//   console.error('Email System Error:', err);

//   if (err instanceof EmailSystemError) {
//     return res.status(getErrorStatusCode(err)).json({
//       error: err.toJSON()
//     });
//   }

//   // Handle mongoose validation errors
//   if (err.name === 'ValidationError') {
//     return res.status(400).json({
//       error: {
//         name: 'ValidationError',
//         message: 'Invalid input data',
//         details: Object.values(err.errors).map(e => e.message),
//         timestamp: new Date().toISOString()
//       }
//     });
//   }

//   // Handle JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     return res.status(401).json({
//       error: {
//         name: 'AuthenticationError',
//         message: 'Invalid authentication token',
//         timestamp: new Date().toISOString()
//       }
//     });
//   }

//   // Default error response
//   res.status(500).json({
//     error: {
//       name: 'InternalServerError',
//       message: 'An unexpected error occurred',
//       timestamp: new Date().toISOString()
//     }
//   });
// };

// /**
//  * Get HTTP status code based on error type
//  */
// function getErrorStatusCode(error) {
//   switch (error.name) {
//     case 'ValidationError':
//       return 400;
//     case 'AuthenticationError':
//       return 401;
//     case 'RateLimitError':
//       return 429;
//     case 'ConnectionError':
//     case 'SyncError':
//     case 'AutomationError':
//       return 503;
//     default:
//       return 500;
//   }
// }

// /**
//  * Async handler wrapper to eliminate try-catch blocks
//  */
// export const asyncHandler = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// /**
//  * Error logging middleware
//  */
// export const errorLogger = (err, req, res, next) => {
//   const errorLog = {
//     timestamp: new Date().toISOString(),
//     error: err.name,
//     message: err.message,
//     stack: err.stack,
//     path: req.path,
//     method: req.method,
//     ip: req.ip,
//     userId: req.user?._id
//   };

//   // Log error details
//   console.error('Error Log:', errorLog);

//   next(err);
// };

// /**
//  * Not found error handler
//  */
// export const notFoundHandler = (req, res, next) => {
//   const error = new EmailSystemError('Resource not found', {
//     path: req.path,
//     method: req.method
//   });
//   error.name = 'NotFoundError';
//   next(error);
// };

// /**
//  * Rate limit error handler
//  */
// export const rateLimitHandler = (req, res) => {
//   res.status(429).json({
//     error: {
//       name: 'RateLimitError',
//       message: 'Too many requests, please try again later',
//       timestamp: new Date().toISOString()
//     }
//   });
// };

// /**
//  * Validation middleware
//  */
// export const validateRequest = (schema) => {
//   return (req, res, next) => {
//     const { error } = schema.validate(req.body);
//     if (error) {
//       throw new ValidationError('Invalid request data', {
//         details: error.details.map(detail => detail.message)
//       });
//     }
//     next();
//   };
// };

// export default {
//   errorHandler,
//   errorLogger,
//   notFoundHandler,
//   rateLimitHandler,
//   validateRequest,
//   asyncHandler,
//   EmailSystemError,
//   ConnectionError,
//   AuthenticationError,
//   ValidationError,
//   SyncError,
//   AutomationError,
//   RateLimitError
// };

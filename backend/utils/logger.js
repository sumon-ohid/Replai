import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Calculate dirname for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (will be used only if ENABLE_CONSOLE_LOGS is true)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? 
      `\n${JSON.stringify(meta, null, 2)}` : '';
      
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

// Create file transport with daily rotation
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, '%DATE%-app.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// Determine if console logs should be enabled
const enableConsoleLogs = process.env.ENABLE_CONSOLE_LOGS === 'true';

// Create transports array
const transports = [fileRotateTransport];

// Only add console transport if explicitly enabled
if (enableConsoleLogs) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: config.nodeEnv === 'production' ? 'info' : 'debug'
    })
  );
}

// Create base logger instance
const baseLogger = winston.createLogger({
  level: config.logging.level,
  levels: winston.config.npm.levels,
  format: logFormat,
  defaultMeta: { service: 'replai-api' },
  transports,
  // Don't exit on uncaught exceptions
  exitOnError: false
});

// Helper methods for standardized logging
const logWithMeta = (logger, level, message, meta = {}) => {
  logger[level](message, meta);
};

// Silent console logging for Morgan HTTP logger
const morganStream = {
  write: (message) => {
    // Always log HTTP requests to file but skip console
    baseLogger.http(message.trim(), { skipConsole: true });
  }
};

// Simplified API for the main logger
const enhancedLogger = {
  error: (message, meta) => logWithMeta(baseLogger, 'error', message, meta),
  warn: (message, meta) => logWithMeta(baseLogger, 'warn', message, meta),
  info: (message, meta) => logWithMeta(baseLogger, 'info', message, meta),
  http: (message, meta) => logWithMeta(baseLogger, 'http', message, meta),
  verbose: (message, meta) => logWithMeta(baseLogger, 'verbose', message, meta),
  debug: (message, meta) => logWithMeta(baseLogger, 'debug', message, meta),
  silly: (message, meta) => logWithMeta(baseLogger, 'silly', message, meta),
  
  // Stream for Morgan HTTP logger (silent version)
  stream: morganStream
};

/**
 * Create a named logger for a specific module
 * @param {string} moduleName - The name of the module for this logger
 * @returns {Object} - The logger instance with enhanced methods
 */
export const createLogger = (moduleName) => {
  // Create a child logger with module name added to metadata
  const childLogger = baseLogger.child({ module: moduleName });
  
  // Return a simplified API for this logger
  return {
    error: (message, meta = {}) => childLogger.error(message, meta),
    warn: (message, meta = {}) => childLogger.warn(message, meta),
    info: (message, meta = {}) => childLogger.info(message, meta),
    http: (message, meta = {}) => childLogger.http(message, meta),
    verbose: (message, meta = {}) => childLogger.verbose(message, meta),
    debug: (message, meta = {}) => childLogger.debug(message, meta),
    silly: (message, meta = {}) => childLogger.silly(message, meta)
  };
};

// Add unhandled error listeners - these still need to be logged to console
// for critical errors, but can be disabled if really needed
process.on('uncaughtException', (error) => {
  // For critical errors, we may still want console output
  if (enableConsoleLogs) {
    console.error('UNCAUGHT EXCEPTION:', error);
  }
  
  baseLogger.error('Uncaught exception', { error });
  
  // Only exit in production to allow for debugging in development
  if (config.nodeEnv === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  // For critical errors, we may still want console output
  if (enableConsoleLogs) {
    console.error('UNHANDLED REJECTION:', reason);
  }
  
  baseLogger.error('Unhandled promise rejection', { reason });
});

// Export both the default logger and the createLogger function
export default enhancedLogger;
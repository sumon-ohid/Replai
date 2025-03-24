import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Calculate root directory for ESM modules (since __dirname is not available in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration settings by environment
const config = {
  // Server settings
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API settings
  apiBaseUrl: process.env.VITE_API_BASE_URL || `http://localhost:${process.env.PORT_FRONT || 3001}`,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Database settings
  mongo: {
    uri: process.env.MONGO_URL || 'mongodb://localhost:27017/replai',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // Google settings
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl: process.env.GOOGLE_REDIRECT_URI || 
      `${process.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/calendar/auth/google/callback`
  },
  
  // Email settings
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    defaultFrom: process.env.EMAIL_FROM || 'noreply@replai.tech'
  },
  
  // File storage
  storage: {
    uploadDir: path.join(rootDir, 'uploads'),
    maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(rootDir, 'logs/app.log')
  },
  
  // Feature flags
  features: {
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION !== 'false',
    multiTenancy: process.env.FEATURE_MULTI_TENANCY === 'true',
    analytics: process.env.FEATURE_ANALYTICS !== 'false'
  }
};

// Environment-specific overrides
if (config.nodeEnv === 'test') {
  config.mongo.uri = process.env.MONGO_URL || 'mongodb://localhost:27017/replai-test';
  config.logging.level = 'error';
} else if (config.nodeEnv === 'production') {
  config.logging.level = process.env.LOG_LEVEL || 'warn';
}

export default config;

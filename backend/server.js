import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { google } from "googleapis";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
import emailRoutes from "./emails/routes/emailRoutes.js";
import emailAuthRoutes from "./emails/routes/authRoutes.js";
import emailStatsRoutes from "./emails/routes/statsRoutes.js";
import connectionManager from "./emails/managers/connectionManager.js";
import SentEmail from "./models/SentEmail.js";
import emailsRouter from "./routes/emails.js";
import user from "./user/user.js";
import stats from "./emails/stats.js";
import blocklist from "./routes/blocklist.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import data from "./routes/data.js";
import googleAuth from "./routes/googleAuth.js";
import feedback from "./routes/feedback.js";
import userController from "./routes/userController.js";
import deleteUser from "./routes/deleteUser.js";
import googleCalendar from "./calendar/googleCalendar.js";
import { SitemapStream } from 'sitemap';
import { createGzip } from 'zlib';
import { streamToPromise } from 'sitemap';
import fs from 'fs';
import compression from 'compression';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import authConfig from './emails/config/authConfig.js';
import { requireAuth } from './emails/middleware/emailAuthMiddleware.js';
import connectedEmailsRoutes from './emails/routes/connectedEmailsRoutes.js';


// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(compression());

// Connect to MongoDB with improved error handling
mongoose
  .connect(process.env.MONGO_URL, {
    // useNewUrlParser: true, // These options are now default in newer versions
    // useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Give up initial connection after 5 seconds
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    
    // Initialize email connections after successful DB connection
    connectionManager.initializeAllConnections()
      .then(success => {
        if (success) {
          console.log("✅ All email connections initialized successfully");
        } else {
          console.warn("⚠️ Some email connections could not be initialized");
        }
      })
      .catch(err => console.error("❌ Failed to initialize email connections:", err));
  })
  .catch((err) => {
    console.error("❌ Could not connect to MongoDB:", err);
    // In production, you might want to exit the process if DB connection fails
    // process.exit(1);
  });

// Set trust proxy for secure cookies behind reverse proxies
app.set('trust proxy', true);

// Configure CORS with improved error handling
const allowedOrigins = [
  "http://localhost:3001", // For local development
  "http://localhost:3000", // For test
  process.env.FRONTEND_URL,
  process.env.VITE_API_BASE_URL,
  "https://replai.tech",
  "https://www.replai.tech",
].filter(Boolean); // Filter out undefined/null values


app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Add PATCH here
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Configure session with better security options
app.use(session({
  secret: authConfig.session.secret,
  resave: authConfig.session.resave,
  saveUninitialized: authConfig.session.saveUninitialized,
  cookie: {
    secure: authConfig.session.cookie.secure,
    httpOnly: true, // Prevents client-side JS from reading the cookie
    sameSite: 'lax', // Provides CSRF protection
    maxAge: authConfig.session.cookie.maxAge
  },
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URL,
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'native', // Use MongoDB TTL index for expired sessions cleanup
    crypto: {
      secret: process.env.SESSION_CRYPTO_SECRET || authConfig.session.secret
    }
  })
}));

// Debug middleware for session tracking
app.use((req, res, next) => {
  if (req.path.includes('/auth/google')) {
    console.log('SESSION DEBUG:', {
      path: req.path,
      hasSession: !!req.session,
      sessionID: req.sessionID,
      userId: req.session?.userId || 'not set',
      user: req.user?._id || 'not logged in'
    });
  }
  next();
});

// Increase payload size limit for handling larger requests
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from the uploads directory with cache-control
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true
}));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate robots.txt file
const generateRobotsTxt = () => {
  try {
    const robotsTxt = `# Robots.txt file for Replai.tech
# Generated on: ${new Date().toISOString().split('T')[0]}

# Allow all search engines to index the site
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/api/
Disallow: /login/
Disallow: /signup/
Disallow: /reset-password/

# Disallow sensitive user-specific pages
Disallow: /dashboard/settings/
Disallow: /dashboard/account/
Disallow: /user/*/settings

# Allow access to assets
Allow: /assets/
Allow: /images/
Allow: /css/
Allow: /js/

# Sitemap location
Sitemap: https://replai.tech/sitemap.xml

# Crawl delay for specific bots
User-agent: AdsBot-Google
Crawl-delay: 1

User-agent: Googlebot-Image
Allow: /images/
Allow: /assets/

# Block AI training bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

# Rate limiting for other bots
User-agent: *
Crawl-delay: 2
`;

    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
    console.log('✅ robots.txt generated successfully');
  } catch (error) {
    console.error('❌ Error generating robots.txt:', error);
  }
};

// Generate robots.txt on startup
generateRobotsTxt();

// Serve SEO and compliance files
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/sitemap.xml.gz', (req, res) => {
  res.set('Content-Type', 'application/gzip');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml.gz'));
});

// API Routes
// Legacy routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailsRouter);
app.use("/api/user", user);
app.use("/api/blocklist", blocklist);
app.use("/api/data", data);
app.use("/api/auth", googleAuth);
app.use("/api/feedback", feedback);
app.use("/api/calendar", googleCalendar);

// New organized email routes with better namespace
app.use("/api/emails/v2", emailRoutes);
app.use("/api/emails/auth", emailAuthRoutes);
app.use("/api/emails/stats", emailStatsRoutes);
app.use("/api/emails/auth/connected", connectedEmailsRoutes);

// Connection status endpoint with proper auth middleware
app.get("/api/emails/connection/status", requireAuth, async (req, res) => {
  try {
    const status = await connectionManager.getConnectionStatus(req.user._id);
    res.json({ status });
  } catch (error) {
    console.error("Error fetching connection status:", error);
    res.status(500).json({ error: "Failed to get connection status" });
  }
});

// Manual connection control endpoint
app.post("/api/emails/connection/reconnect", requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address required" });
    }
    
    const result = await connectionManager.reconnectIfNeeded(req.user._id, email);
    res.json({ success: result });
  } catch (error) {
    console.error("Error reconnecting email:", error);
    res.status(500).json({ error: "Failed to reconnect email" });
  }
});

// Add a health check endpoint for monitoring services
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    connections: {
      active: activeConnections ? activeConnections.size : 'unavailable'
    }
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "dist"), {
  maxAge: '1h',  // Cache static assets for 1 hour
  etag: true
}));

// Fallback route for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Server error', 
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

// Start server with proper host binding
const server = app.listen(port, process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost', () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

// Implement proper timeout handling
server.timeout = 120000; // 2 minute timeout

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to monitoring service in production
});

// Generate sitemap for SEO
async function generateSitemap() {
  try {
    const smStream = new SitemapStream({ hostname: 'https://replai.tech' });
    
    // Add URLs with improved SEO parameters
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/features', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/pricing', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.7 });
    smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.7 });
    smStream.write({ url: '/blog', changefreq: 'daily', priority: 0.9 });
    
    // Add any dynamic pages here
    
    smStream.end();
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Get the XML output and write to file
    const sitemapOutput = await streamToPromise(smStream);
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapOutput);
    console.log('✅ Sitemap generated successfully');
    
    // Also generate a gzipped version for better performance
    const pipeline = smStream.pipe(createGzip());
    const sitemapGzip = await streamToPromise(pipeline);
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml.gz'), sitemapGzip);
    console.log('✅ Gzipped sitemap generated successfully');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

// Generate sitemap on startup
try {
  generateSitemap();
} catch (error) {
  console.error('❌ Failed to generate sitemap:', error);
}

// Graceful shutdown handler for SIGTERM (for container environments)
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  
  // Close server first to stop accepting new connections
  server.close(() => {
    console.log('✅ Express server closed');
  });
  
  // Close all active email connections
  try {
    for (const [key, connection] of Object.entries(connectionManager.activeConnections || {})) {
      try {
        await connectionManager.stopConnection(key);
        console.log(`✅ Email connection ${key} closed`);
      } catch (error) {
        console.error(`❌ Error stopping connection ${key}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error closing email connections:', error);
  }
  
  // Close MongoDB connection
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (dbError) {
    console.error('❌ Error closing MongoDB connection:', dbError);
  }
  
  // Exit with success code
  process.exit(0);
});

// Graceful shutdown handler for SIGINT (for development environments)
process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  
  // Close server first to stop accepting new connections
  server.close(() => {
    console.log('✅ Express server closed');
  });
  
  // Close all active email connections
  try {
    for (const [key, connection] of Object.entries(connectionManager.activeConnections || {})) {
      try {
        await connectionManager.stopConnection(key);
        console.log(`✅ Email connection ${key} closed`);
      } catch (error) {
        console.error(`❌ Error stopping connection ${key}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error closing email connections:', error);
  }
  
  // Close MongoDB connection
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (dbError) {
    console.error('❌ Error closing MongoDB connection:', dbError);
  }
  
  // Exit with success code
  process.exit(0);
});

// Export for testing purposes
export default app;
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { google } from "googleapis";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
import handleEmails from "./emails/handleEmails.js";
import connectedEmails from "./emails/connectedEmails.js";
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

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(compression());

mongoose
  .connect(process.env.MONGO_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.set('trust proxy', true);

const allowedOrigins = [
  "http://localhost:5173", // For local development
  "http://localhost:3000", // For test
  `${process.env.FRONTEND_URL}`,
  `${process.env.VITE_API_BASE_URL}`,
  "https://replai.tech",
  "https://www.replai.tech",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // for cookies or sessions
  })
);

// Increase payload size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate and serve robots.txt
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

# Block AI training bots (Optional, depending on your preference)
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
    console.log('robots.txt generated successfully');
  } catch (error) {
    console.error('Error generating robots.txt:', error);
  }
};

// Generate robots.txt
generateRobotsTxt();

// Serve the robots.txt file
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Serve the sitemap.xml file
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Serve the gzipped sitemap if requested
app.get('/sitemap.xml.gz', (req, res) => {
  res.set('Content-Type', 'application/gzip');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml.gz'));
});

app.use("/api/auth", authRoutes);
app.use("/api/emails", handleEmails);
app.use("/api/emails", emailsRouter);
app.use("/api/emails", connectedEmails);
app.use("/api/user", user);
app.use("/api/emails", stats);
app.use("/api/blocklist", blocklist);
app.use("/api/data", data);
app.use("/api/auth", googleAuth);
app.use("/api/feedback", feedback);
app.use("/api/user", userController);
app.use("/api/user", deleteUser);
app.use("/api/calendar", googleCalendar);

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Sitemap generation function remains the same
async function generateSitemap() {
  try {
    const smStream = new SitemapStream({ hostname: 'https://replai.tech' });
    
    // Add URLs with improved SEO parameters
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/login', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/signup', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/dashboard', changefreq: 'daily', priority: 0.9 });
    smStream.write({ url: '/pricing', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/features', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.7 });
    smStream.write({ url: '/privacy', changefreq: 'monthly', priority: 0.5 });
    smStream.write({ url: '/terms', changefreq: 'monthly', priority: 0.5 });
    smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.6 });
    smStream.write({ url: '/blog', changefreq: 'weekly', priority: 0.7 });
    
    // Add key feature pages for better SEO
    smStream.write({ url: '/features/ai-email-analysis', changefreq: 'monthly', priority: 0.8 });
    smStream.write({ url: '/features/smart-scheduling', changefreq: 'monthly', priority: 0.8 });
    smStream.write({ url: '/features/email-automation', changefreq: 'monthly', priority: 0.8 });
    
    // Close the stream
    smStream.end();
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Get the XML output and write to file
    const sitemapOutput = await streamToPromise(smStream);
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapOutput);
    console.log('Sitemap generated successfully');
    
    // Also generate a gzipped version for better performance
    const pipeline = smStream.pipe(createGzip());
    const sitemapGzip = await streamToPromise(pipeline);
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml.gz'), sitemapGzip);
    console.log('Gzipped sitemap generated successfully');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Wrap in try-catch to avoid unhandled rejections
try {
  generateSitemap();
} catch (error) {
  console.error('Failed to generate sitemap:', error);
}
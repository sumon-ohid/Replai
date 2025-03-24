import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { program } from 'commander';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup proper dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn(`Warning: .env file not found at ${envPath}`);
  dotenv.config(); // Try default location as fallback
}

// Check if MongoDB URI is set
if (!process.env.MONGO_URL) {
  console.error('Error: MONGO_URL environment variable is not set');
  console.log('Please make sure your .env file contains MONGO_URL=your_mongodb_connection_string');
  process.exit(1);
}

// Dynamically import models after env variables are loaded
let User, NotificationManager;

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log(`Using connection string: ${process.env.MONGO_URL.substring(0, 20)}...`);
    
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Successfully connected to MongoDB');
    
    // Import models after successful connection
    const userModulePath = path.resolve(__dirname, '../models/User.js');
    const notifManagerPath = path.resolve(__dirname, '../emails/managers/notificationManager.js');
    
    if (!fs.existsSync(userModulePath)) {
      console.error(`Error: User model not found at ${userModulePath}`);
      process.exit(1);
    }
    
    if (!fs.existsSync(notifManagerPath)) {
      console.error(`Error: NotificationManager not found at ${notifManagerPath}`);
      process.exit(1);
    }
    
    // Dynamic imports
    const UserModule = await import(userModulePath);
    User = UserModule.default;
    
    const NotificationManagerModule = await import(notifManagerPath);
    NotificationManager = NotificationManagerModule.default;
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Set up command line options
program
  .version('1.0.0')
  .option('-t, --title <title>', 'Notification title')
  .option('-m, --message <message>', 'Notification message')
  .option('--type <type>', 'Notification type (info, success, warning, error)', 'info')
  .option('--dry-run', 'Perform a dry run without sending actual notifications')
  .option('--filter <filter>', 'Filter users by email domain (e.g., @gmail.com)')
  .option('--limit <number>', 'Limit the number of users to process', parseInt)
  .option('--batch-size <number>', 'Number of notifications to process in each batch', parseInt, 50)
  .parse(process.argv);

const options = program.opts();

// CLI interface for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to validate notification type
function validateNotificationType(type) {
  const validTypes = ['info', 'success', 'warning', 'error'];
  if (!validTypes.includes(type)) {
    console.error(`Invalid notification type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
  }
  return type;
}

// Function to send notifications
async function sendNotificationToAllUsers() {
  // Validate required parameters
  if (!options.title || !options.message) {
    console.error('Error: Title and message are required');
    program.help();
    process.exit(1);
  }

  // Validate notification type
  const notificationType = validateNotificationType(options.type);

  // Connect to database
  await connectToDatabase();

  try {
    // Build query for user filtering
    const query = {};
    if (options.filter) {
      query.email = { $regex: options.filter, $options: 'i' };
    }

    // Count total users
    const totalUsers = await User.countDocuments(query);
    
    if (totalUsers === 0) {
      console.log('No users found matching the criteria');
      process.exit(0);
    }

    // Confirm with user
    const limit = options.limit ? Math.min(options.limit, totalUsers) : totalUsers;
    const dryRunText = options.dryRun ? '[DRY RUN] ' : '';
    
    console.log(`${dryRunText}Ready to send notification:`);
    console.log(`- Title: ${options.title}`);
    console.log(`- Message: ${options.message}`);
    console.log(`- Type: ${notificationType}`);
    console.log(`- Recipients: ${limit}/${totalUsers} users${options.filter ? ` (filtered by: ${options.filter})` : ''}`);
    console.log(`- Batch size: ${options.batchSize || 50}`);
    
    await new Promise((resolve) => {
      rl.question('Proceed? (y/n): ', (answer) => {
        if (answer.toLowerCase() !== 'y') {
          console.log('Operation cancelled');
          process.exit(0);
        }
        resolve();
      });
    });

    // Process users in batches
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    const batchSize = options.batchSize || 50;
    const startTime = Date.now();
    
    console.log(`\nStarting notification process...`);

    // Process in batches to prevent memory issues with large user bases
    let skip = 0;
    while (processedCount < limit) {
      const batchLimit = Math.min(batchSize, limit - processedCount);
      const users = await User.find(query).skip(skip).limit(batchLimit).select('_id name email').lean();
      
      if (users.length === 0) break;
      
      console.log(`Processing batch: ${processedCount + 1}-${processedCount + users.length} of ${limit}`);
      
      // Process each user in the batch
      const promises = users.map(async (user) => {
        try {
          const metadata = {
            systemNotification: true,
            sentAt: new Date().toISOString(),
            sentBy: 'system',
            broadcastId: `broadcast-${Date.now()}`
          };
          
          if (!options.dryRun) {
            await NotificationManager.createNotification({
              userId: user._id,
              type: notificationType,
              title: options.title,
              message: options.message,
              metadata
            });
          }
          
          return { success: true, userId: user._id, email: user.email };
        } catch (error) {
          console.error(`Failed to send notification to user ${user._id} (${user.email}):`, error.message);
          return { success: false, userId: user._id, email: user.email, error: error.message };
        }
      });
      
      const results = await Promise.all(promises);
      
      const batchSuccesses = results.filter(r => r.success).length;
      const batchFailures = results.length - batchSuccesses;
      
      successCount += batchSuccesses;
      failedCount += batchFailures;
      processedCount += users.length;
      skip += users.length;
      
      // Progress update
      const percent = Math.round((processedCount / limit) * 100);
      console.log(`Progress: ${percent}% (${processedCount}/${limit}) | Success: ${successCount} | Failed: ${failedCount}`);
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const duration = (Date.now() - startTime) / 1000;
    
    console.log('\n======= NOTIFICATION SUMMARY =======');
    console.log(`Total processed: ${processedCount}/${limit}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Time taken: ${duration.toFixed(2)} seconds`);
    console.log(`${options.dryRun ? '[DRY RUN - No notifications were actually sent]' : ''}`);
    console.log('====================================');

  } catch (error) {
    console.error('Error sending notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    rl.close();
  }
}

// Execute the script
sendNotificationToAllUsers().catch(err => {
  console.error('Critical error:', err);
  process.exit(1);
});
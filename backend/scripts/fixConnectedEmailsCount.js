import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixConnectedEmailsCount() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('Error: MONGODB_URI is not defined in environment variables');
      console.log('Make sure your .env file exists and contains MONGODB_URI');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const userId = process.argv[2];
    
    if (userId) {
      // Fix a specific user
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found');
        process.exit(1);
      }
      
      const oldCount = user.connectedEmailsCount;
      user.connectedEmailsCount = Array.isArray(user.connectedEmails) ? user.connectedEmails.length : 0;
      await user.save();
      
      console.log(`Updated user ${user.name} (${user.email})`);
      console.log(`Old count: ${oldCount}, New count: ${user.connectedEmailsCount}`);
    } else {
      // Fix all users
      const users = await User.find({});
      let updatedCount = 0;
      
      for (const user of users) {
        const oldCount = user.connectedEmailsCount;
        const newCount = Array.isArray(user.connectedEmails) ? user.connectedEmails.length : 0;
        
        if (oldCount !== newCount) {
          user.connectedEmailsCount = newCount;
          await user.save();
          updatedCount++;
          
          console.log(`Updated user ${user.name} (${user.email})`);
          console.log(`Old count: ${oldCount}, New count: ${newCount}`);
        }
      }
      
      console.log(`${updatedCount} users updated out of ${users.length} total users`);
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixConnectedEmailsCount();
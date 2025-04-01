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

async function updateSubscription() {
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
    const plan = process.argv[3];
    
    if (!userId || !plan) {
      console.error('Usage: node updateSubscription.js <userId> <plan>');
      process.exit(1);
    }
    
    if (!['free', 'pro_monthly', 'pro_yearly', 'business'].includes(plan)) {
      console.error('Invalid plan. Must be one of: free, pro_monthly, pro_yearly, business');
      process.exit(1);
    }
    
    const startDate = new Date();
    let endDate;
    
    if (plan === 'pro_monthly') {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan === 'pro_yearly' || plan === 'business') {
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    console.log(`Updating user ${userId} to ${plan} plan...`);
    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionPlan: plan,
        subscriptionStartDate: plan !== 'free' ? startDate : null,
        subscriptionEndDate: plan !== 'free' ? endDate : null
      },
      { new: true }
    );
    
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    
    console.log(`Subscription updated for ${user.name} (${user.email})`);
    console.log(`New plan: ${user.subscriptionPlan}`);
    console.log(`Start date: ${user.subscriptionStartDate}`);
    console.log(`End date: ${user.subscriptionEndDate}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateSubscription();
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// Try to load the .env file
const envFile = path.join(rootDir, '.env');
if (fs.existsSync(envFile)) {
  console.log(`Loading environment from ${envFile}`);
  dotenv.config({ path: envFile });
} else {
  console.warn('No .env file found, using environment variables');
  dotenv.config();
}

// Import models after dotenv is configured
import ConnectedEmail from '../models/ConnectedEmail.js';
import getConnectedEmailModels from '../models/ConnectedEmailModels.js';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('MongoDB URI not found in environment variables.');
  console.error('Please set MONGODB_URI in your .env file or environment.');
  process.exit(1);
}

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    fixEmailBodies()
      .then(() => {
        console.log('Email fix process completed');
        process.exit(0);
      })
      .catch(error => {
        console.error('Error fixing emails:', error);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixEmailBodies() {
  try {
    // Get all connected email accounts
    const connectedEmails = await ConnectedEmail.find({});
    console.log(`Found ${connectedEmails.length} connected email accounts`);
    
    let totalFixed = 0;
    let totalProcessed = 0;
    
    for (const account of connectedEmails) {
      console.log(`Processing account: ${account.email} (${account._id})`);
      const emailModels = getConnectedEmailModels(account._id.toString());
      
      // Find all emails without body field for this account
      const emails = await emailModels.Email.find({
        $or: [
          { body: { $exists: false } },
          { body: null }
        ]
      });
      
      console.log(`Found ${emails.length} emails missing body for account ${account.email}`);
      
      let accountFixed = 0;
      
      // Loop through all emails and fix missing body field
      for (const email of emails) {
        console.log(`Fixing email ${email._id} (${email.subject || 'No subject'})`);
        
        try {
          // Update with empty body object and snippet
          await emailModels.Email.updateOne(
            { _id: email._id },
            { 
              $set: { 
                body: {
                  text: email.snippet || '', 
                  html: ''
                },
                html_preview: ''
              } 
            }
          );
          
          accountFixed++;
          totalFixed++;
        } catch (updateError) {
          console.error(`Error updating email ${email._id}:`, updateError);
        }
        
        totalProcessed++;
      }
      
      console.log(`Fixed ${accountFixed} emails for account ${account.email}`);
    }
    
    console.log(`Summary:
      Total accounts processed: ${connectedEmails.length}
      Total emails checked: ${totalProcessed}
      Total emails fixed: ${totalFixed}
    `);
    
    return {
      accountsProcessed: connectedEmails.length,
      emailsFixed: totalFixed
    };
  } catch (error) {
    console.error('Error in fixEmailBodies:', error);
    throw error;
  }
}
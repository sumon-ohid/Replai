import express from 'express';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import getSentEmailModel from '../models/SentEmail.js';
import getEmailModel from '../models/Email.js'; // Import this to save received emails
import User from '../models/User.js';
import BlockList from '../models/BlockList.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import auth from '../middleware/auth.js';
import TextData from '../models/TextData.js';

dotenv.config();

const apiBaseUrl = process.env.VITE_API_BASE_URL;
const dashboardUrl = process.env.DASHBOARD_URL;

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${apiBaseUrl}/api/emails/auth/google/callback`
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const TOKENS_FILE = path.resolve('tokens.json');
const repliedEmails = new Set();
const userIntervals = new Map();

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
let localUserId;

// Helper function to get user profile from Google
const getUser = async (auth) => {
  const oauth2 = google.oauth2({ version: 'v2', auth });
  const res = await oauth2.userinfo.get();
  return res.data;
};

// Helper function to check if an email is connected for a user
const isEmailConnected = async (userId, email) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;
    
    return user.connectedEmails.some(
      connectedEmail => connectedEmail.email === email && connectedEmail.provider === 'google'
    );
  } catch (error) {
    console.error('Error checking if email is connected:', error);
    return false; // Default to not connected if there's an error
  }
};

// Helper function to extract email body
const getEmailBody = (payload) => {
  if (payload.parts) {
    const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart && textPart.body.data) {
      return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  }
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  return '(No content found)';
};

// Helper function to extract HTML body if available
const getEmailHtmlBody = (payload) => {
  if (payload.parts) {
    const htmlPart = payload.parts.find(part => part.mimeType === 'text/html');
    if (htmlPart && htmlPart.body.data) {
      return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
    }
  }
  return null;
};

// Helper function to parse email addresses
const parseEmailAddress = (fullAddress) => {
  if (!fullAddress) return { name: '', email: '' };
  
  const matches = fullAddress.match(/<([^<>]+)>/) || [];
  if (matches.length > 1) {
    const email = matches[1];
    const name = fullAddress.replace(`<${email}>`, '').trim();
    return { name, email };
  } else {
    // If no angle brackets, assume the entire string is an email
    return { name: '', email: fullAddress.trim() };
  }
};

// Helper function to analyze email sentiment (simplified)
const analyzeEmailSentiment = (text) => {
  const positiveWords = ['thanks', 'happy', 'great', 'good', 'appreciate', 'excellent', 'pleased'];
  const negativeWords = ['issue', 'problem', 'error', 'mistake', 'wrong', 'bad', 'unhappy', 'disappointed'];
  
  text = text.toLowerCase();
  
  let positiveScore = positiveWords.reduce((count, word) => {
    return count + (text.includes(word) ? 1 : 0);
  }, 0);
  
  let negativeScore = negativeWords.reduce((count, word) => {
    return count + (text.includes(word) ? 1 : 0);
  }, 0);
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
};

// Helper function to categorize email content
const categorizeEmail = (subject, body, from) => {
  subject = subject.toLowerCase();
  body = body.toLowerCase();
  from = from.toLowerCase();
  
  // Simple categorization logic
  if (from.includes('newsletter') || subject.includes('newsletter')) {
    return 'updates';
  } else if (from.includes('noreply') || from.includes('no-reply')) {
    return 'updates';
  } else if (subject.includes('invoice') || subject.includes('receipt') || subject.includes('payment')) {
    return 'updates';
  } else if (from.includes('linkedin') || from.includes('twitter') || from.includes('facebook')) {
    return 'social';
  } else if (subject.includes('offer') || subject.includes('discount') || subject.includes('sale')) {
    return 'promotions';
  }
  
  // Default
  return 'primary';
};

// Start Google OAuth flow
router.get('/auth/google', auth, (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    // prompt: 'consent',
    // include_granted_scopes: true
  });

  localUserId = req.user._id;
  res.json({ authUrl });
});

// Google OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(dashboardUrl);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const googleUser = await getUser(oauth2Client);
    const googleUserId = googleUser.id;
    const googleUserEmail = googleUser.email;

    await User.findByIdAndUpdate(localUserId, {
      $addToSet: { connectedEmails: { email: googleUserEmail, provider: 'google' } }
    });

    await createEmailBot(tokens, googleUserId, localUserId, googleUserEmail);

    res.redirect(dashboardUrl);
  } catch (error) {
    console.error('Error authenticating:', error);
    res.status(500).send('Authentication failed.');
  }
});

// Disconnect email endpoint
router.post('/disconnect', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Update the user to remove this email from connectedEmails
    const result = await User.findByIdAndUpdate(
      userId,
      { $pull: { connectedEmails: { email } } },
      { new: true }
    );

    // Clear any intervals for this email
    for (const [googleUserId, interval] of userIntervals.entries()) {
      if (interval._emailAddress === email) {
        clearInterval(interval);
        userIntervals.delete(googleUserId);
        console.log(`Removed interval for disconnected email: ${email}`);
      }
    }
    
    res.json({ message: 'Email disconnected successfully', user: result });
  } catch (error) {
    console.error('Error disconnecting email:', error);
    res.status(500).json({ message: 'Failed to disconnect email' });
  }
});

// Main function to create an email bot for a connected account
const createEmailBot = async (tokens, googleUserId, localUserId, userEmail) => {
  try {
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Function to save received email to database for stats tracking
    const saveReceivedEmail = async (emailData, userId) => {
      try {
        const { payload, id, threadId } = emailData;
        const headers = payload.headers;
        const fromHeader = headers.find(h => h.name === 'From');
        const subjectHeader = headers.find(h => h.name === 'Subject');
        const toHeader = headers.find(h => h.name === 'To');
        const dateHeader = headers.find(h => h.name === 'Date');
        
        const from = fromHeader?.value || '';
        const subject = subjectHeader?.value || '(No Subject)';
        const to = toHeader?.value || '';
        const dateStr = dateHeader?.value || new Date().toISOString();
        const date = new Date(dateStr);
        
        const plainBody = getEmailBody(payload);
        const htmlBody = getEmailHtmlBody(payload);
        
        // Parse email addresses
        const fromParsed = parseEmailAddress(from);
        const toParsed = parseEmailAddress(to);
        
        // Create and save to Email model
        const Email = getEmailModel(userId);
        const email = new Email({
          userId,
          messageId: id,
          threadId,
          subject,
          snippet: plainBody.substring(0, 150) + (plainBody.length > 150 ? '...' : ''),
          body: {
            text: plainBody,
            html: htmlBody
          },
          from: {
            name: fromParsed.name,
            email: fromParsed.email
          },
          to: [{
            name: toParsed.name,
            email: toParsed.email
          }],
          date,
          receivedDate: new Date(),
          folder: 'inbox',
          category: categorizeEmail(subject, plainBody, from),
          sentiment: analyzeEmailSentiment(plainBody),
          source: 'gmail'
        });
        
        await email.save();
        return email;
      } catch (error) {
        console.error('Error saving received email to database:', error);
        return null;
      }
    };

    // Function to respond to an individual email
    const respondToEmail = async (emailId, userId, userPrompt = '') => {
      try {
        const startTime = Date.now(); // Record start time for response time tracking
        const emailRes = await gmail.users.messages.get({ userId: 'me', id: emailId, format: 'full' });
        
        // First, save the received email to the database for stats tracking
        const savedEmail = await saveReceivedEmail(emailRes.data, userId);
        
        const { payload } = emailRes.data;
        const headers = payload.headers;
        const fromHeader = headers.find(h => h.name === 'From');
        const subjectHeader = headers.find(h => h.name === 'Subject');
        const toHeader = headers.find(h => h.name === 'To');
        const dateHeader = headers.find(h => h.name === 'Date');
        
        const from = fromHeader?.value || '';
        const subject = subjectHeader?.value || 'Your email';
        const to = toHeader?.value || '';
        const originalBody = getEmailBody(payload);
        
        // Extract the email address that received this message
        const toEmailMatch = to.match(/<([^<>]+)>/) || [null, to];
        const toEmail = toEmailMatch[1];
        
        // Check if the email is still connected for this user
        const isStillConnected = await isEmailConnected(userId, toEmail);
        if (!isStillConnected) {
          console.log(`Email ${toEmail} is no longer connected for user ${userId}. Skipping reply.`);
          return;
        }
      
        // Check if the email or domain is in the block list
        const blockList = await BlockList.findOne({ userId });
      
        if (blockList) {
          const blockedEmails = blockList.entries.map(entry => entry.toLowerCase()); // Normalize
          const emailMatch = from.match(/<([^<>]+)>/);
          const fromEmail = emailMatch ? emailMatch[1] : from;
          const fromDomain = fromEmail.includes('@') ? fromEmail.split('@')[1].toLowerCase() : null;
      
          // Check if full email, domain, or subdomain match
          if (
            blockedEmails.includes(fromEmail.toLowerCase()) ||
            (fromDomain && blockedEmails.some(blocked => fromDomain === blocked || fromDomain.endsWith(`.${blocked}`)))
          ) {
            console.log(`Email from ${fromEmail} is in the block list. Skipping reply.`);
            return;
          }
        }
      
        // Get user info for personalization
        const user = await User.findById(userId);
        const userName = user ? user.name : '';
      
        const defaultPrompt = `Respond to this email briefly and naturally as a real person:
From: ${from}
Subject: ${subject}
Body: ${originalBody}

Guidelines:
- Keep response short and simple
- Use casual language
- Sign with "Best regards, ${userName}"
- Avoid markdown formatting`;
      
        const prompt = userPrompt ? userPrompt : defaultPrompt;
      
        const aiRes = await model.generateContent(prompt);
        const responseText = aiRes.response.text();
        const rawMessage = [
          `From: ${toHeader?.value}`,
          `To: ${from}`,
          `Subject: Re: ${subject}`,
          'Content-Type: text/plain; charset=utf-8',
          '',
          responseText
        ].join('\n');
      
        const encodedMessage = Buffer.from(rawMessage)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      
        const sentMessageRes = await gmail.users.messages.send({ 
          userId: 'me', 
          requestBody: { raw: encodedMessage, threadId: emailRes.data.threadId }
        });
        console.log(`Replied to email from ${from}`);
        
        // Calculate response time
        const responseTime = Date.now() - startTime;
      
        try {
          // Save sent email to database with appropriate flags for analytics
          const SentEmail = getSentEmailModel(userId);
          
          // Parse email addresses
          const fromParsed = parseEmailAddress(toHeader?.value);
          const toParsed = parseEmailAddress(from);
          
          // Get thread and message IDs
          const threadId = emailRes.data.threadId || `thread_${Date.now()}`;
          const messageId = sentMessageRes.data.id || `message_${Date.now()}`;
          
          const sentEmail = new SentEmail({
            userId,
            from: {
              name: fromParsed.name,
              email: fromParsed.email 
            },
            to: [{
              name: toParsed.name,
              email: toParsed.email
            }],
            subject: `Re: ${subject}`,
            body: responseText,
            type: 'sent',
            received: false,
            autoResponded: true,
            responseTime: responseTime, // Use actual response time
            category: categorizeEmail(subject, originalBody, from),
            sentiment: analyzeEmailSentiment(responseText),
            threadId: threadId,
            messageId: messageId,
            replyToEmailId: emailRes.data.id,
            isReply: true,
            generationType: 'auto-reply',
            autoGenerated: true,
            dateSent: new Date(),
            // Add metrics fields for stats
            metadata: {
              processingTime: responseTime,
              originalEmailReceived: new Date(dateHeader?.value || Date.now()),
              isAutoResponse: true
            }
          });
          
          await sentEmail.save();
          console.log(`Saved response to database for ${from}`);
          
          // Update the original email to mark it as processed and auto-replied
          if (savedEmail) {
            savedEmail.processed = true;
            savedEmail.autoReplied = true;
            savedEmail.processingStatus = 'processed';
            savedEmail.processingDate = new Date();
            savedEmail.processingTime = responseTime;
            savedEmail.processingLog.push({
              timestamp: new Date(),
              status: 'processed',
              message: 'Auto-replied by AI'
            });
            await savedEmail.save();
            console.log(`Updated original email status as processed`);
          }
          
        } catch (saveError) {
          console.error('Error saving sent email to database:', saveError);
          // Continue execution even if saving fails
        }
      
      } catch (error) {
        console.error('Error responding to email:', error);
        repliedEmails.delete(emailId);
      }
    };

    // Function to check for new emails
    const checkForNewEmails = async () => {
      try {
        // Check if the email is still connected
        const user = await User.findById(localUserId);
        
        const isStillConnected = user && userEmail && 
                              user.connectedEmails.some(e => e.email === userEmail && e.provider === 'google');
        
        if (!isStillConnected) {
          console.log(`Email ${userEmail} is no longer connected. Stopping email checking for this account.`);
          if (userIntervals.has(googleUserId)) {
            clearInterval(userIntervals.get(googleUserId));
            userIntervals.delete(googleUserId);
          }
          return;
        }
        
        // Continue with the rest of the function
        const res = await gmail.users.messages.list({
          userId: 'me',
          q: 'is:unread -in:chats -from:me',
          maxResults: 5
        });
        
        const messages = res.data.messages || [];
        if (messages.length > 0) {
          console.log(`Found ${messages.length} new emails for ${userEmail}`);
        }

        // Get user's custom prompt if available
        let userPrompt = await TextData.findOne({ userId: localUserId });
        const promptText = userPrompt ? (userPrompt.text + (userPrompt.fileData || '')) : '';

        for (const message of messages) {
          if (!repliedEmails.has(message.id)) {
            await respondToEmail(message.id, localUserId, promptText);
            repliedEmails.add(message.id);
            await gmail.users.messages.modify({
              userId: 'me',
              id: message.id,
              requestBody: { removeLabelIds: ['UNREAD'] }
            });
          }
        }
      } catch (error) {
        console.error('Error checking emails:', error);
      }
    };

    // Run immediately once
    await checkForNewEmails();
    
    // Then set up interval
    const interval = setInterval(checkForNewEmails, 60000); // Check every minute
    
    // Store the email address with the interval for later cleanup
    interval._emailAddress = userEmail;
    userIntervals.set(googleUserId, interval);
    
    console.log(`Email bot created successfully for ${userEmail}!`);
  } catch (error) {
    console.error('Error creating email bot:', error);
    throw new Error('Error creating email bot.');
  }
};

export default router;
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels from '../../models/ConnectedEmailModels.js';
import { processEmailContent } from './emailProcessingService.js';
import { parseEmailAddress, extractPlainTextBody, extractHtmlBody } from '../utils/emailParser.js';
import connectionManager from '../managers/connectionManager.js';

/**
 * Process a single Google message
 */
export async function processGoogleMessage(gmail, userId, userEmail, messageId, config = {}) {
  try {
    // Get the connected email account
    const connectedEmail = await ConnectedEmail.findOne({
      userId,
      email: userEmail,
      provider: 'google'
    });

    if (!connectedEmail) {
      throw new Error('Connected email account not found');
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());

    // Check if message already exists
    const existingEmail = await emailModels.Email.findOne({ messageId });
    if (existingEmail) {
      return existingEmail;
    }

    // Fetch the full message
    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });
    
    const message = messageResponse.data;
    const headers = message.payload.headers;
    
    // Extract headers
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
    const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
    const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
    
    // Get message bodies
    const bodyText = extractPlainTextBody(message);
    const bodyHtml = extractHtmlBody(message);
    
    // Parse email addresses
    const parsedFrom = parseEmailAddress(from);
    const parsedTo = parseEmailAddress(to);
    
    const toRecipients = Array.isArray(parsedTo) ? parsedTo : [parsedTo];
    
    // Create email data
    const emailData = {
      userId,
      messageId: message.id,
      threadId: message.threadId,
      provider: 'google',
      providerId: message.id,
      
      from: {
        email: parsedFrom?.email || from.split('@')[0] + '@example.com', // Fallback to prevent validation error
        name: parsedFrom?.name || ''
      },
      
      to: toRecipients.map(recipient => ({
        email: recipient.email || '',
        name: recipient.name || ''
      })),
      
      subject,
      date: new Date(date),
      receivedAt: new Date(),
      
      body: {
        text: bodyText,
        html: bodyHtml
      },
      
      read: !message.labelIds?.includes('UNREAD'),
      category: determineEmailCategory(message),
      
      attachments: processAttachments(message)
    };

    // Process email content if enabled
    if (config.processContent !== false) {
      const processedData = await processEmailContent({
        ...emailData,
        userEmail
      });
      Object.assign(emailData, processedData);
    }

    // Save to the correct collection
    const emailDoc = new emailModels.Email(emailData);
    const savedEmail = await emailDoc.save();

    // Update sync stats
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      $inc: { 'stats.totalEmails': 1 },
      $set: { 'stats.lastSync': new Date() }
    });

    return savedEmail;
  } catch (error) {
    console.error('Error processing Google message:', error);
    throw error;
  }
}

/**
 * Helper to determine category from Gmail labels
 * Maps Gmail categories to our schema's valid categories:
 * ['inbox', 'sent', 'draft', 'trash', 'spam', 'important', 'uncategorized']
 */
function determineEmailCategory(message) {
  if (!message.labelIds) return 'uncategorized';
  
  if (message.labelIds.includes('SENT')) return 'sent';
  if (message.labelIds.includes('DRAFT')) return 'draft';
  if (message.labelIds.includes('TRASH')) return 'trash';
  if (message.labelIds.includes('SPAM')) return 'spam';
  if (message.labelIds.includes('IMPORTANT')) return 'important';
  
  // Map Gmail categories to inbox
  if (message.labelIds.includes('INBOX') ||
      message.labelIds.includes('CATEGORY_PRIMARY') ||
      message.labelIds.includes('CATEGORY_SOCIAL') ||
      message.labelIds.includes('CATEGORY_PROMOTIONS') ||
      message.labelIds.includes('CATEGORY_UPDATES') ||
      message.labelIds.includes('CATEGORY_FORUMS')) {
    return 'inbox';
  }
  
  return 'uncategorized';
}

/**
 * Helper to process attachments
 */
function processAttachments(message) {
  if (!message.payload.parts) return [];
  
  return message.payload.parts
    .filter(part => part.filename && part.filename.length > 0)
    .map(part => ({
      name: part.filename,
      type: part.mimeType,
      size: part.body.size || 0,
      attachmentId: part.body.attachmentId
    }));
}

/**
 * Initialize a Google email connection
 */
export async function initializeGoogleConnection(userId, email, refreshToken, accessToken = null, config = {}) {
  try {
    console.log('Initializing Google connection:', { email });
    
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Test connection
    await gmail.users.getProfile({ userId: 'me' });

    // Get or create ConnectedEmail record
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      throw new Error('Connected email record not found. Please reconnect the account.');
    }

    // Initialize models
    getConnectedEmailModels(connectedEmail._id.toString());
    
    // Start sync process
    if (config.syncEnabled) {
      const interval = setInterval(
        () => checkForNewGoogleEmails(gmail, userId, email, config),
        60000
      );
      
      // Do initial sync
      await checkForNewGoogleEmails(gmail, userId, email, config);
      
      // Register connection
      connectionManager.addConnection(userId, email, 'google', {
        gmail,
        oauth2Client,
        interval,
        config
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing Google connection:', error);
    throw error;
  }
}

/**
 * Check for new Google emails
 */
export async function checkForNewGoogleEmails(gmail, userId, email, config = {}) {
  try {
    // Get ConnectedEmail record for collections
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      throw new Error('Connected email not found');
    }

    // List recent messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      q: 'newer_than:1d is:unread'
    });

    if (!response.data.messages?.length) {
      console.log('No new emails to sync');
      return [];
    }

    console.log(`Found ${response.data.messages.length} messages to sync`);

    // Process messages
    const processedMessages = [];
    for (const message of response.data.messages) {
      try {
        const processed = await processGoogleMessage(
          gmail,
          userId,
          email,
          message.id,
          config
        );
        if (processed) processedMessages.push(processed);
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
      }
    }

    // Update sync stats
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      'stats.lastSync': new Date(),
      $inc: { 'stats.totalEmails': processedMessages.length }
    });

    return processedMessages;
  } catch (error) {
    console.error('Error checking Google emails:', error);
    throw error;
  }
}

export default {
  initializeGoogleConnection,
  processGoogleMessage,
  checkForNewGoogleEmails
};

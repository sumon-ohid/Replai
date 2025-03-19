import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { addConnection } from '../managers/connectionManager.js';
import { processEmailContent } from './emailProcessingService.js';
import getEmailModel from '../../models/Email.js';
import { 
  parseEmailAddress,
  extractPlainTextBody as getEmailBody, // Use the correct function name
  extractHtmlBody as getEmailHtmlBody   // Use the correct function name
} from '../utils/emailParser.js';
import authConfig from '../config/authConfig.js';

/**
 * Initialize a Google email connection
 * @param {String} userId - MongoDB user ID
 * @param {String} email - Email address
 * @param {String} refreshToken - OAuth refresh token
 * @param {String} accessToken - OAuth access token (optional)
 * @param {Object} config - Connection configuration
 * @returns {String} Connection key
 */

// export const initializeGoogleConnection = async (userId, email, refreshToken, accessToken = null, config = {}) => {
//   try {
//     // Set default config values
//     const connectionConfig = {
//       syncEnabled: true,
//       mode: 'auto-reply',
//       markAsRead: true,
//       folders: ['INBOX'],
//       ...config
//     };
    
//     // Configure OAuth client
//     const oauth2Client = new OAuth2Client(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URI
//     );
    
//     // Set credentials
//     oauth2Client.setCredentials({
//       refresh_token: refreshToken,
//       access_token: accessToken,
//     });
    
//     // Create Gmail API client
//     const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
//     // Test connection
//     try {
//       await gmail.users.getProfile({ userId: 'me' });
//       console.log(`Google connection for ${email} verified`);
//     } catch (apiError) {
//       console.error(`Failed to verify Google connection for ${email}:`, apiError);
//       throw new Error(`Gmail API connection failed: ${apiError.message}`);
//     }
    
//     // Set up email checking interval
//     const interval = connectionConfig.syncEnabled
//       ? setInterval(() => checkForNewGoogleEmails(gmail, userId, email, connectionConfig), 60000)
//       : null;
    
//     // Check immediately
//     if (connectionConfig.syncEnabled) {
//       try {
//         await checkForNewGoogleEmails(gmail, userId, email, connectionConfig);
//       } catch (initialCheckError) {
//         console.error(`Initial email check failed for ${email}:`, initialCheckError);
//         // Continue anyway, as this isn't fatal
//       }
//     }
    
//     const connection = {
//       gmail,
//       oauth2Client,
//       interval,
//       config: connectionConfig,
//       updateConfig: async (newConfig) => {
//         // Handle config changes
//         if (newConfig.syncEnabled !== connectionConfig.syncEnabled) {
//           if (newConfig.syncEnabled && !interval) {
//             connection.interval = setInterval(
//               () => checkForNewGoogleEmails(gmail, userId, email, newConfig), 
//               60000
//             );
//           } else if (!newConfig.syncEnabled && interval) {
//             clearInterval(interval);
//             connection.interval = null;
//           }
//         }
        
//         // Update local config
//         Object.assign(connectionConfig, newConfig);
//       }
//     };
    
//     return addConnection(userId, email, 'google', connection);
//   } catch (error) {
//     console.error(`Failed to initialize Google connection for ${email}:`, error);
//     throw error;
//   }
// };

// Check for valid categories
function getValidCategories(userId) {
  try {
    const Email = getEmailModel(userId);
    const categoryEnum = Email.schema.path('category').enumValues;
    return categoryEnum || ['primary', 'social', 'promotions', 'updates', 'forums'];
  } catch (error) {
    console.warn('Error getting valid categories, using defaults:', error);
    // Fallback to common Gmail categories
    return ['primary', 'social', 'promotions', 'updates', 'forums'];
  }
}

// Fix the email processing function
async function processGoogleMessage(gmail, userId, userEmail, messageId, config = {}) {
  
  try {
    // Fetch the full message
    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });
    
    const message = messageResponse.data;
    const headers = message.payload.headers;
    
    // Extract headers
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
    const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
    const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
    
    // Get the message body - both plain text and HTML if available
    const bodyText = getEmailBody(message);
    const bodyHtml = getEmailHtmlBody(message);
    
    // Parse email addresses
    const parsedFrom = parseEmailAddress(from);
    
    let parsedTo = [];
    const toResult = parseEmailAddress(to);
    if (Array.isArray(toResult)) {
      parsedTo = toResult.map(recipient => ({
        email: recipient.email,
        name: recipient.name || ''
      }));
    } else if (toResult && typeof toResult === 'object') {
      // Handle single recipient case
      parsedTo = [{
        email: toResult.email,
        name: toResult.name || ''
      }];
    }
    
    // Get the Email model with the current connection
    const Email = getEmailModel(userId);
    
    const validCategories = getValidCategories(userId);
    const category = validCategories[0]; // Default to first category

    const fromEmail = parsedFrom?.email || userEmail || 'unknown@example.com';
    const fromName = parsedFrom?.name || '';
    
    
    // Create the email document
    const emailData = {
      userId,
      messageId: message.id,
      threadId: message.threadId,
      externalId: message.id,
      provider: 'google',
      folder: 'inbox',
      category: category,
      subject,
      snippet: message.snippet || '',
      body: { // Use object format for body
        text: bodyText || '',
        html: bodyHtml || ''
      },
      from: {
        email: fromEmail, // Ensure this is never empty
        name: fromName
      },
      to: parsedTo.length > 0 ? parsedTo : [{ email: userEmail, name: '' }],
      cc: [],
      bcc: [],
      date: new Date(date),
      read: !message.labelIds?.includes('UNREAD'),
      starred: message.labelIds?.includes('STARRED'),
      labels: message.labelIds || [],
      attachments: []
    };

    // If there are attachments, extract information about them
    if (message.payload.parts && message.payload.parts.some(p => p.filename && p.filename.length > 0)) {
      emailData.attachments = message.payload.parts
        .filter(p => p.filename && p.filename.length > 0)
        .map(p => ({
          id: p.body.attachmentId || '',
          filename: p.filename,
          contentType: p.mimeType,
          size: p.body.size || 0
        }));
    }

    // Check if the email already exists
    const existingEmail = await Email.findOne({
      externalId: message.id,
      userId
    }).exec();

    if (existingEmail) {
      console.log(`Email ${message.id} already exists, skipping`);
      return existingEmail;
    }

    // Create and save the email document
    const email = new Email(emailData);
    const savedEmail = await email.save();
    
    console.log(`Saved email ${message.id} from ${parsedFrom.email}`);
    
    // Process the email content for AI analysis if enabled
    if (config.processContent !== false) {
      try {
        await processEmailContent(savedEmail);
      } catch (processingError) {
        console.error('Error processing email content:', processingError);
      }
    }
    
    return savedEmail;
  } catch (error) {
    console.warn('Error processing Google message:', error);
    throw error;
  }
}

// Fix the checkForNewGoogleEmails function with corrected parameter order
async function checkForNewGoogleEmails(gmail, userId, userEmail, config) {
  try {
    // Fetch recent messages - just a small number initially
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 3,  // Just get a few messages initially
      q: 'is:unread'  // Focus on unread messages
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      console.log('No new Google emails to process');
      return [];
    }

    console.log(`Found ${response.data.messages.length} new Google emails for ${userEmail}`);

    // Process each message
    const processedMessages = [];
    for (const message of response.data.messages) {
      try {
        // FIX: Correct parameter order for processGoogleMessage
        const processed = await processGoogleMessage(
          gmail, 
          userId,
          userEmail,
          message.id,
          config
        );
        
        if (processed) {
          processedMessages.push(processed);
        }
      } catch (error) {
        console.error('Error processing Google message:', error);
      }
    }

    return processedMessages;
  } catch (error) {
    console.error('Error checking Google emails:', error);
    throw error;
  }
}

// const checkForNewGoogleEmails = async (gmail, userId, userEmail, config) => {
//   try {
//     // If sync is disabled, don't check for emails
//     if (!config.syncEnabled) return;
    
//     // Calculate time 15 minutes ago for newer emails
//     const fifteenMinutesAgo = new Date();
//     fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
//     const timeFilter = Math.floor(fifteenMinutesAgo.getTime() / 1000);
    
//     // Build query for unread emails in configured folders
//     const query = `is:unread after:${timeFilter}`;
    
//     // List messages matching query
//     const response = await gmail.users.messages.list({
//       userId: 'me',
//       q: query,
//       maxResults: 10
//     });
    
//     const messages = response.data.messages || [];
//     if (messages.length > 0) {
//       console.log(`Found ${messages.length} new Google emails for ${userEmail}`);
//     }
    
//     // Process each message
//     for (const message of messages) {
//       await processGoogleMessage(gmail, message.id, userId, userEmail, config);
//     }
//   } catch (error) {
//     console.error('Error checking Google emails:', error);
//   }
// };

export const initializeGoogleConnection = async (userId, email, refreshToken, accessToken = null, config = {}) => {
  try {
    console.log('Initializing Google connection with:', {
      userId,
      email,
      hasRefreshToken: !!refreshToken,
      hasAccessToken: !!accessToken,
      config
    });

    // Use imported authConfig instead of undefined variable
    const oauth2Client = new google.auth.OAuth2(
      authConfig.google.clientId,
      authConfig.google.clientSecret,
      authConfig.google.redirectUri
    );

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken
    });

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    try {
      // Verify the connection works
      const profile = await gmail.users.getProfile({
        userId: 'me'
      });
      
      console.log(`Verified Google connection for ${email}`);
      
      // Start sync process in the background without waiting
      setTimeout(() => {
        checkForNewGoogleEmails(gmail, userId, email, config)
          .catch(error => {
            console.error('Error checking Google emails:', error);
          });
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error verifying Google connection:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error initializing Google connection:', error);
    throw error;
  }
};

/**
 * Create a new Google email service
 * @param {String} userId - MongoDB user ID
 * @param {String} email - Email address
 * @param {String} refreshToken - OAuth refresh token
 * @param {String} accessToken - OAuth access token (optional)
 * @returns {Object} Google email service object
 */
export const createService = (userId, email, refreshToken, accessToken = null) => {
  // Configure OAuth client
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  // Set credentials
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
    access_token: accessToken,
  });
  
  // Create Gmail API client
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  return {
    // Get emails from inbox
    getEmails: async (options = {}) => {
      const { limit = 10, pageToken = null, query = '' } = options;
      
      try {
        const response = await gmail.users.messages.list({
          userId: 'me',
          maxResults: limit,
          pageToken,
          q: query
        });
        
        const { messages = [], nextPageToken } = response.data;
        
        // Fetch full details for each message
        const fullMessages = await Promise.all(
          messages.map(async ({ id }) => {
            const { data } = await gmail.users.messages.get({
              userId: 'me',
              id,
              format: 'full'
            });
            
            return data;
          })
        );
        
        // Format messages
        const formattedMessages = fullMessages.map(message => {
          const { payload, id, threadId, labelIds } = message;
          const headers = payload.headers || [];
          
          const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
          const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
          
          return {
            id,
            threadId,
            from: fromHeader ? fromHeader.value : '',
            subject: subjectHeader ? subjectHeader.value : '',
            snippet: message.snippet || '',
            date: new Date(parseInt(message.internalDate)),
            labels: labelIds || [],
            isUnread: labelIds?.includes('UNREAD') || false
          };
        });
        
        return {
          messages: formattedMessages,
          nextPageToken
        };
      } catch (error) {
        console.error('Error fetching Google emails:', error);
        throw error;
      }
    },
    
    // Send an email
    sendEmail: async (options) => {
      const { to, subject, body, cc, bcc, threadId } = options;
      
      try {
        // Create the email message
        const mailContent = [
          'From: ' + email,
          'To: ' + to,
          subject ? 'Subject: ' + subject : '',
          cc ? 'Cc: ' + cc : '',
          bcc ? 'Bcc: ' + bcc : '',
          'Content-Type: text/html; charset=utf-8',
          '',
          body
        ].filter(Boolean).join('\r\n');
        
        // Encode the message
        const encodedMessage = Buffer.from(mailContent).toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        
        // Send the message
        const response = await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            threadId: threadId,
            raw: encodedMessage
          }
        });
        
        return { 
          success: true, 
          messageId: response.data.id, 
          threadId: response.data.threadId 
        };
      } catch (error) {
        console.error('Error sending Google email:', error);
        throw error;
      }
    },
    
    // Create a draft
    createDraft: async (options) => {
      const { to, subject, body, cc, bcc, threadId } = options;
      
      try {
        // Create the email message
        const mailContent = [
          'From: ' + email,
          'To: ' + to,
          subject ? 'Subject: ' + subject : '',
          cc ? 'Cc: ' + cc : '',
          bcc ? 'Bcc: ' + bcc : '',
          'Content-Type: text/html; charset=utf-8',
          '',
          body
        ].filter(Boolean).join('\r\n');
        
        // Encode the message
        const encodedMessage = Buffer.from(mailContent).toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        
        // Create the draft
        const response = await gmail.users.drafts.create({
          userId: 'me',
          requestBody: {
            message: {
              threadId: threadId,
              raw: encodedMessage
            }
          }
        });
        
        return { 
          success: true, 
          draftId: response.data.id, 
          messageId: response.data.message.id,
          threadId: response.data.message.threadId 
        };
      } catch (error) {
        console.error('Error creating Google draft:', error);
        throw error;
      }
    },
    
    // Get email by ID
    getEmailById: async (messageId) => {
      try {
        const { data } = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: 'full'
        });
        
        const { payload, threadId, labelIds } = data;
        const headers = payload.headers || [];
        
        const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
        const toHeader = headers.find(h => h.name.toLowerCase() === 'to');
        const ccHeader = headers.find(h => h.name.toLowerCase() === 'cc');
        const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
        const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
        
        const plainBody = getEmailBody(payload);
        const htmlBody = getEmailHtmlBody(payload);
        
        return {
          id: messageId,
          threadId,
          from: fromHeader ? fromHeader.value : '',
          to: toHeader ? toHeader.value : '',
          cc: ccHeader ? ccHeader.value : '',
          subject: subjectHeader ? subjectHeader.value : '',
          date: dateHeader ? new Date(dateHeader.value) : new Date(parseInt(data.internalDate)),
          snippet: data.snippet || '',
          body: plainBody,
          htmlBody,
          labels: labelIds || [],
          isUnread: labelIds?.includes('UNREAD') || false
        };
      } catch (error) {
        console.error('Error fetching Google email by ID:', error);
        throw error;
      }
    }
  };
};

export default {
  initializeGoogleConnection,
  createService
};
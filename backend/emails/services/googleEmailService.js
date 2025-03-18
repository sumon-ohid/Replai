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

// Add additional logging and error handling:

export const initializeGoogleConnection = async (userId, email, refreshToken, accessToken = null, config = {}) => {
  try {
    console.log('Initializing Google connection with:', {
      userId,
      email,
      hasRefreshToken: !!refreshToken,
      hasAccessToken: !!accessToken,
      config
    });
    
    if (!refreshToken) {
      throw new Error('Refresh token is required for Google connection');
    }
    
    // Set default config values
    const connectionConfig = {
      syncEnabled: true,
      mode: 'auto-reply',
      markAsRead: true,
      folders: ['INBOX'],
      ...config
    };
    
    // Create OAuth client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken
    });
    
    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Test connection
    try {
      const profile = await gmail.users.getProfile({ userId: 'me' });
      console.log(`Verified Google connection for ${email}`);
    } catch (verifyError) {
      console.error(`Failed to verify Google connection for ${email}:`, verifyError);
      throw new Error(`Gmail API connection failed: ${verifyError.message}`);
    }
    
    // Set up email checking interval
    const interval = connectionConfig.syncEnabled
      ? setInterval(() => checkForNewGoogleEmails(gmail, userId, email, connectionConfig), 60000)
      : null;
    
    // Check immediately
    if (connectionConfig.syncEnabled) {
      try {
        await checkForNewGoogleEmails(gmail, userId, email, connectionConfig);
      } catch (initialCheckError) {
        console.error(`Initial email check failed for ${email}:`, initialCheckError);
        // Continue anyway, as this isn't fatal
      }
    }
    
    const connection = {
      gmail,
      oauth2Client,
      interval,
      config: connectionConfig,
      lastSync: null,
      error: null,

      // this method for manual email checking
      checkForNewEmails: async () => {
        try {
          connection.error = null;
          await checkForNewGoogleEmails(gmail, userId, email, connectionConfig);
          connection.lastSync = new Date();
          return true;
        } catch (error) {
          console.error(`Error checking for new Google emails: ${error}`);
          connection.error = error.message;
          throw error;
        }
      },
      
      updateConfig: async (newConfig) => {
        // Handle config changes
        if (newConfig.syncEnabled !== undefined && 
            newConfig.syncEnabled !== connectionConfig.syncEnabled) {
          if (newConfig.syncEnabled && !connection.interval) {
            connection.interval = setInterval(
              () => checkForNewGoogleEmails(gmail, userId, email, {
                ...connectionConfig,
                ...newConfig
              }), 
              60000
            );
          } else if (!newConfig.syncEnabled && connection.interval) {
            clearInterval(connection.interval);
            connection.interval = null;
          }
        }
        
        // Update local config
        Object.assign(connectionConfig, newConfig);
      }
    };
    
    return addConnection(userId, email, 'google', connection);
  } catch (error) {
    console.error(`Failed to initialize Google connection for ${email}:`, error);
    throw error;
  }
};

const checkForNewGoogleEmails = async (gmail, userId, userEmail, config) => {
  try {
    // If sync is disabled, don't check for emails
    if (!config.syncEnabled) return;
    
    // Calculate time 15 minutes ago for newer emails
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
    const timeFilter = Math.floor(fifteenMinutesAgo.getTime() / 1000);
    
    // Build query for unread emails in configured folders
    const query = `is:unread after:${timeFilter}`;
    
    // List messages matching query
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 10
    });
    
    const messages = response.data.messages || [];
    if (messages.length > 0) {
      console.log(`Found ${messages.length} new Google emails for ${userEmail}`);
    }
    
    // Process each message
    for (const message of messages) {
      await processGoogleMessage(gmail, message.id, userId, userEmail, config);
    }
  } catch (error) {
    console.error('Error checking Google emails:', error);
  }
};

// Updateed the processGoogleMessage function

const processGoogleMessage = async (gmail, messageId, userId, userEmail, config) => {
  try {
    // Get the Email model for this user
    const Email = await getEmailModel(userId);
    
    // Check if we've already processed this message
    const existingEmail = await Email.findOne({ 
      providerId: messageId,
      provider: 'google'
    });
    
    if (existingEmail) {
      // Already processed
      return;
    }
    
    // Get full message details
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });
    
    const message = response.data;
    const { payload, threadId } = message;
    const headers = payload.headers || [];
    
    // Extract key information
    const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
    const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
    
    // Extract email body - fix here to ensure we have a string
    let body = '';
    let htmlBody = '';
    
    // Extract the body properly based on content type
    if (payload.parts && Array.isArray(payload.parts)) {
      // Multipart message
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          // Decode the base64 encoded body
          const buff = Buffer.from(part.body.data, 'base64');
          body = buff.toString('utf-8');
        } 
        else if (part.mimeType === 'text/html' && part.body.data) {
          const buff = Buffer.from(part.body.data, 'base64');
          htmlBody = buff.toString('utf-8');
        } 
        else if (part.parts && Array.isArray(part.parts)) {
          // Handle nested parts
          for (const nestedPart of part.parts) {
            if (nestedPart.mimeType === 'text/plain' && nestedPart.body.data) {
              const buff = Buffer.from(nestedPart.body.data, 'base64');
              body = buff.toString('utf-8');
            } 
            else if (nestedPart.mimeType === 'text/html' && nestedPart.body.data) {
              const buff = Buffer.from(nestedPart.body.data, 'base64');
              htmlBody = buff.toString('utf-8');
            }
          }
        }
      }
    } else if (payload.body && payload.body.data) {
      // Simple message
      const buff = Buffer.from(payload.body.data, 'base64');
      body = buff.toString('utf-8');
    }
    
    // Ensure body is a string at this point
    if (typeof body !== 'string') {
      body = htmlBody || '';
      if (typeof body !== 'string') {
        body = '';
      }
    }
    
    // Process the email
    const emailData = {
      provider: 'google',
      providerId: messageId,
      threadId,
      userId,
      userEmail,
      from: fromHeader ? fromHeader.value : '',
      to: userEmail,
      subject: subjectHeader ? subjectHeader.value : '',
      body, // Now we're sure this is a string
      htmlBody,
      receivedAt: new Date(parseInt(message.internalDate)),
      read: !(message.labelIds || []).includes('UNREAD'),
      processed: false
    };
    
    // Process and save the email
    const processedData = await processEmailContent(emailData);
    const newEmail = new Email(processedData);
    await newEmail.save();
    
    // Mark as read if configured
    if (config.markAsRead) {
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
    }
    
    return newEmail;
  } catch (error) {
    console.error('Error processing Google message:', error);
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
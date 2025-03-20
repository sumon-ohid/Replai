import * as msal from '@azure/msal-node';  // Use named import with * instead
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { addConnection } from '../managers/connectionManager.js';
import { processEmailContent } from './emailProcessingService.js';
import getEmailModel from '../../models/ConnectedEmailModels.js';

export const initializeOutlookConnection = async (userId, email, refreshToken, accessToken, config) => {
  try {
    // Configure MSAL
    const msalConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        authority: 'https://login.microsoftonline.com/common'
      }
    };
    
    const cca = new msal.ConfidentialClientApplication(msalConfig);
    
    // Set up access token refresh logic
    const getAccessToken = async () => {
      try {
        // Try to use cached token
        if (accessToken && new Date() < accessToken.expires_on) {
          return accessToken.token;
        }
        
        // Silent token acquisition
        const result = await cca.acquireTokenByRefreshToken({
          refreshToken,
          scopes: ['Mail.Read', 'Mail.ReadWrite', 'Mail.Send']
        });
        
        return result.accessToken;
      } catch (error) {
        console.error('Error acquiring Outlook access token:', error);
        throw error;
      }
    };
    
    // Create Microsoft Graph client
    const graphClient = Client.init({
      authProvider: async (done) => {
        try {
          const token = await getAccessToken();
          done(null, token);
        } catch (error) {
          done(error, null);
        }
      }
    });
    
    // Set up email checking interval
    const interval = config.syncEnabled
      ? setInterval(() => checkForNewOutlookEmails(graphClient, userId, email, config), 60000)
      : null;
    
    // Check immediately
    if (config.syncEnabled) {
      await checkForNewOutlookEmails(graphClient, userId, email, config);
    }
    
    const connection = {
      graphClient,
      interval,
      config,
      updateConfig: async (newConfig) => {
        // Handle config changes
        if (newConfig.syncEnabled !== config.syncEnabled) {
          if (newConfig.syncEnabled && !interval) {
            connection.interval = setInterval(
              () => checkForNewOutlookEmails(graphClient, userId, email, newConfig), 
              60000
            );
          } else if (!newConfig.syncEnabled && interval) {
            clearInterval(interval);
            connection.interval = null;
          }
        }
        
        // Update local config
        Object.assign(config, newConfig);
      }
    };
    
    return addConnection(userId, email, 'outlook', connection);
  } catch (error) {
    console.error(`Failed to initialize Outlook connection for ${email}:`, error);
    throw error;
  }
};

const checkForNewOutlookEmails = async (graphClient, userId, userEmail, config) => {
  try {
    // If sync is disabled, don't check for emails
    if (!config.syncEnabled) return;
    
    // Get unread emails from the last hour
    const response = await graphClient
      .api('/me/messages')
      .filter("isRead eq false")
      .top(10)
      .get();
    
    const messages = response.value || [];
    if (messages.length > 0) {
      console.log(`Found ${messages.length} new Outlook emails for ${userEmail}`);
    }
    
    for (const message of messages) {
      await processOutlookMessage(graphClient, message, userId, userEmail, config);
    }
  } catch (error) {
    console.error('Error checking Outlook emails:', error);
  }
};

const processOutlookMessage = async (graphClient, message, userId, userEmail, config) => {
  try {
    // Get the Email model for this user
    const Email = await getEmailModel(userId);
    
    // Check if we've already processed this message
    const existingEmail = await Email.findOne({ 
      providerId: message.id,
      provider: 'outlook'
    });
    
    if (existingEmail) {
      // Email already exists, don't process again
      return;
    }
    
    // Extract message details
    const from = message.from ? message.from.emailAddress.address : '';
    const subject = message.subject || '';
    const body = message.body ? message.body.content : '';
    const receivedDateTime = message.receivedDateTime ? new Date(message.receivedDateTime) : new Date();
    
    // Process according to mode
    if (config.mode === 'auto-reply') {
      // Process for auto-reply
      await processEmailContent(userId, {
        providerId: message.id,
        threadId: message.conversationId,
        from,
        subject,
        body,
        receivedDateTime,
        provider: 'outlook',
        email: userEmail
      });
    } else if (config.mode === 'draft') {
      // Just save the email for draft creation
      await Email.create({
        providerId: message.id,
        threadId: message.conversationId,
        from,
        to: message.toRecipients?.map(r => r.emailAddress.address).join(', ') || '',
        subject,
        body: body || '',
        snippet: body.substring(0, 100) || '',
        receivedAt: receivedDateTime,
        isRead: false,
        isReplied: false,
        isDraft: true,
        provider: 'outlook',
        folder: 'inbox',
        labels: []
      });
    }
    
    // Mark as read if configured to do so
    if (config.markAsRead) {
      await graphClient
        .api(`/me/messages/${message.id}`)
        .update({
          isRead: true
        });
    }
  } catch (error) {
    console.error('Error processing Outlook message:', error);
  }
};

/**
 * Create a new Outlook email service
 * @param {String} userId - MongoDB user ID
 * @param {String} email - Email address
 * @param {String} refreshToken - OAuth refresh token
 * @param {String} accessToken - OAuth access token
 * @returns {Object} Outlook service object
 */
export const createService = async (userId, email, refreshToken, accessToken) => {
  // Configure MSAL
  const msalConfig = {
    auth: {
      clientId: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      authority: 'https://login.microsoftonline.com/common'
    }
  };
  
  const cca = new msal.ConfidentialClientApplication(msalConfig);
  
  // Token management
  const getAccessToken = async () => {
    try {
      // Try to use cached token
      if (accessToken && new Date() < accessToken.expires_on) {
        return accessToken.token;
      }
      
      // Silent token acquisition
      const result = await cca.acquireTokenByRefreshToken({
        refreshToken,
        scopes: ['Mail.Read', 'Mail.ReadWrite', 'Mail.Send']
      });
      
      return result.accessToken;
    } catch (error) {
      console.error('Error acquiring Outlook access token:', error);
      throw error;
    }
  };
  
  // Create Microsoft Graph client
  const graphClient = Client.init({
    authProvider: async (done) => {
      try {
        const token = await getAccessToken();
        done(null, token);
      } catch (error) {
        done(error, null);
      }
    }
  });
  
  return {
    // Get emails from inbox
    getEmails: async (options = {}) => {
      const { limit = 10, skipToken = null } = options;
      
      try {
        let request = graphClient.api('/me/messages')
          .top(limit);
        
        if (skipToken) {
          request = request.skipToken(skipToken);
        }
        
        const response = await request.get();
        
        return {
          messages: response.value,
          nextPageToken: response['@odata.nextLink'] ? 
            response['@odata.nextLink'].split('skiptoken=')[1] : null
        };
      } catch (error) {
        console.error('Error fetching Outlook emails:', error);
        throw error;
      }
    },
    
    // Send an email
    sendEmail: async (options) => {
      const { to, subject, body, cc, bcc, replyToMessageId } = options;
      
      try {
        const emailMessage = {
          message: {
            subject,
            body: {
              contentType: "HTML",
              content: body
            },
            toRecipients: to.split(',').map(email => ({
              emailAddress: { address: email.trim() }
            })),
          }
        };
        
        if (cc) {
          emailMessage.message.ccRecipients = cc.split(',').map(email => ({
            emailAddress: { address: email.trim() }
          }));
        }
        
        if (bcc) {
          emailMessage.message.bccRecipients = bcc.split(',').map(email => ({
            emailAddress: { address: email.trim() }
          }));
        }
        
        if (replyToMessageId) {
          // For replies, use createReply and then send
          await graphClient.api(`/me/messages/${replyToMessageId}/reply`)
            .post(emailMessage);
          return { success: true };
        } else {
          // For new messages, use sendMail
          await graphClient.api('/me/sendMail')
            .post(emailMessage);
          return { success: true };
        }
      } catch (error) {
        console.error('Error sending Outlook email:', error);
        throw error;
      }
    },
    
    // Create a draft
    createDraft: async (options) => {
      const { to, subject, body, cc, bcc } = options;
      
      try {
        const draftMessage = {
          subject,
          body: {
            contentType: "HTML",
            content: body
          },
          toRecipients: to.split(',').map(email => ({
            emailAddress: { address: email.trim() }
          }))
        };
        
        if (cc) {
          draftMessage.ccRecipients = cc.split(',').map(email => ({
            emailAddress: { address: email.trim() }
          }));
        }
        
        if (bcc) {
          draftMessage.bccRecipients = bcc.split(',').map(email => ({
            emailAddress: { address: email.trim() }
          }));
        }
        
        const result = await graphClient.api('/me/messages')
          .post(draftMessage);
          
        return { draftId: result.id, success: true };
      } catch (error) {
        console.error('Error creating Outlook draft:', error);
        throw error;
      }
    },
    
    // Get email details by ID
    getEmailById: async (messageId) => {
      try {
        const message = await graphClient
          .api(`/me/messages/${messageId}`)
          .get();
          
        return message;
      } catch (error) {
        console.error('Error fetching Outlook email by ID:', error);
        throw error;
      }
    }
  };
};

export default {
  initializeOutlookConnection,
  createService
};
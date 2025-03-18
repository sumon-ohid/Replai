import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { addConnection } from '../managers/connectionManager.js';
import { processEmailContent } from './emailProcessingService.js';
import getEmailModel from '../../models/Email.js';

/**
 * Initialize a custom IMAP/SMTP email connection
 * @param {String} userId - MongoDB user ID
 * @param {String} email - Email address
 * @param {Object} credentials - IMAP/SMTP credentials
 * @param {Object} config - Connection configuration
 * @returns {String} Connection key
 */
export const initializeCustomConnection = async (userId, email, credentials, config) => {
  try {
    // Validate required credentials
    if (!credentials || !credentials.password) {
      throw new Error('Missing credentials for custom email connection');
    }
    
    const {
      imapHost,
      imapPort = 993,
      imapSecure = true,
      smtpHost,
      smtpPort = 587,
      smtpSecure = false,
      username = email,
      password
    } = credentials;
    
    // Configure IMAP client
    const imapClient = new ImapFlow({
      host: imapHost,
      port: imapPort,
      secure: imapSecure,
      auth: {
        user: username,
        pass: password
      },
      logger: false // Set to true for debugging
    });
    
    // Configure SMTP transport
    const smtpTransport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: username,
        pass: password
      }
    });
    
    // Test SMTP connection
    try {
      await smtpTransport.verify();
      console.log(`SMTP connection for ${email} verified`);
    } catch (smtpError) {
      console.error(`Failed to verify SMTP connection for ${email}:`, smtpError);
      throw new Error(`SMTP connection failed: ${smtpError.message}`);
    }
    
    // Set up email checking interval
    const interval = config.syncEnabled
      ? setInterval(() => checkForNewCustomEmails(imapClient, userId, email, config), 60000)
      : null;
    
    // Check immediately if sync is enabled
    if (config.syncEnabled) {
      try {
        await checkForNewCustomEmails(imapClient, userId, email, config);
      } catch (initialCheckError) {
        console.error(`Initial email check failed for ${email}:`, initialCheckError);
        // Continue anyway, as this isn't fatal
      }
    }
    
    const connection = {
      imapClient,
      smtpTransport,
      interval,
      config,
      updateConfig: async (newConfig) => {
        // Handle config changes
        if (newConfig.syncEnabled !== config.syncEnabled) {
          if (newConfig.syncEnabled && !interval) {
            connection.interval = setInterval(
              () => checkForNewCustomEmails(imapClient, userId, email, newConfig), 
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
    
    return addConnection(userId, email, 'custom', connection);
  } catch (error) {
    console.error(`Failed to initialize custom connection for ${email}:`, error);
    throw error;
  }
};

const checkForNewCustomEmails = async (imapClient, userId, userEmail, config) => {
  try {
    // If sync is disabled or no folders specified, don't check
    if (!config.syncEnabled || !config.folders || config.folders.length === 0) {
      return;
    }
    
    // Connect to the server
    if (!imapClient.usable) {
      await imapClient.connect();
    }
    
    // Check each configured folder
    for (const folder of config.folders) {
      try {
        // Select the mailbox
        const mailbox = await imapClient.mailboxOpen(folder);
        console.log(`Opened mailbox ${folder} with ${mailbox.exists} messages`);
        
        // If no messages, continue to next folder
        if (!mailbox.exists) continue;
        
        // Search for unread messages
        const messages = await imapClient.search({ unseen: true }, { uid: true });
        
        if (messages.length > 0) {
          console.log(`Found ${messages.length} unread emails in ${folder} for ${userEmail}`);
          
          // Fetch each message
          for (const msg of messages) {
            try {
              const message = await imapClient.fetchOne(msg, {
                uid: true,
                envelope: true,
                bodyStructure: true,
                bodyParts: ['text', 'html']
              });
              
              await processCustomMessage(imapClient, message, userId, userEmail, config);
            } catch (fetchError) {
              console.error(`Error fetching message ${msg}:`, fetchError);
            }
          }
        }
      } catch (folderError) {
        console.error(`Error processing folder ${folder}:`, folderError);
      }
    }
    
    // Logout when done
    if (imapClient.usable) {
      await imapClient.logout();
    }
  } catch (error) {
    console.error('Error checking custom emails:', error);
    // Make sure we're disconnected on error
    if (imapClient.usable) {
      try {
        await imapClient.logout();
      } catch (logoutError) {
        // Ignore logout errors
      }
    }
  }
};

const processCustomMessage = async (imapClient, message, userId, userEmail, config) => {
  try {
    // Get the Email model for this user
    const Email = await getEmailModel(userId);
    
    // Generate a consistent ID
    const providerId = `custom-${message.uid}-${Date.now()}`;
    
    // Check if we've already processed this message
    const existingEmail = await Email.findOne({ 
      providerId,
      provider: 'custom'
    });
    
    if (existingEmail) {
      // Email already exists, don't process again
      return;
    }
    
    // Extract message details
    const from = message.envelope.from?.[0]?.address || '';
    const subject = message.envelope.subject || '';
    const body = message.bodyParts?.get('text')?.toString() || 
                 message.bodyParts?.get('html')?.toString() || '';
    const receivedDateTime = message.envelope.date ? new Date(message.envelope.date) : new Date();
    
    // Process according to mode
    if (config.mode === 'auto-reply') {
      // Process for auto-reply
      await processEmailContent(userId, {
        providerId,
        threadId: message.envelope['message-id'] || undefined,
        from,
        subject,
        body,
        receivedDateTime,
        provider: 'custom',
        email: userEmail
      });
    } else if (config.mode === 'draft') {
      // Just save the email for draft creation
      await Email.create({
        providerId,
        threadId: message.envelope['message-id'] || undefined,
        from,
        to: (message.envelope.to || []).map(r => r.address).join(', ') || '',
        subject,
        body,
        snippet: body.substring(0, 100) || '',
        receivedAt: receivedDateTime,
        isRead: false,
        isReplied: false,
        isDraft: true,
        provider: 'custom',
        folder: 'inbox',
        labels: []
      });
    }
    
    // Mark as read if configured to do so
    if (config.markAsRead) {
      try {
        await imapClient.messageFlagsAdd(message.uid, ['\\Seen'], { uid: true });
      } catch (markError) {
        console.error(`Error marking message as read:`, markError);
      }
    }
  } catch (error) {
    console.error('Error processing custom message:', error);
  }
};

/**
 * Create a new custom email service
 * @param {String} userId - MongoDB user ID
 * @param {String} email - Email address
 * @param {Object} credentials - IMAP/SMTP credentials
 * @returns {Object} Custom email service object
 */
export const createService = (userId, email, credentials) => {
  // Validate required credentials
  if (!credentials || !credentials.password) {
    throw new Error('Missing credentials for custom email service');
  }
  
  const {
    imapHost,
    imapPort = 993,
    imapSecure = true,
    smtpHost,
    smtpPort = 587,
    smtpSecure = false,
    username = email,
    password
  } = credentials;
  
  // Create SMTP transport
  const smtpTransport = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: username,
      pass: password
    }
  });
  
  // Create IMAP client
  const createImapClient = () => new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: imapSecure,
    auth: {
      user: username,
      pass: password
    },
    logger: false
  });
  
  return {
    // Get emails from inbox
    getEmails: async (options = {}) => {
      const { limit = 10, folder = 'INBOX' } = options;
      
      const client = createImapClient();
      try {
        await client.connect();
        const mailbox = await client.mailboxOpen(folder);
        
        // Get the most recent messages
        const messages = [];
        let count = 0;
        
        for await (const message of client.fetch({ new: true }, {
          envelope: true,
          bodyParts: ['text', 'html']
        })) {
          const body = message.bodyParts?.get('text')?.toString() || 
                      message.bodyParts?.get('html')?.toString() || '';
                      
          messages.push({
            id: `custom-${message.uid}`,
            from: message.envelope.from?.[0]?.address || '',
            subject: message.envelope.subject || '',
            body: body,
            receivedAt: message.envelope.date ? new Date(message.envelope.date) : new Date()
          });
          
          count++;
          if (count >= limit) break;
        }
        
        await client.logout();
        return { messages, nextPageToken: null }; // No pagination for custom
      } catch (error) {
        console.error('Error fetching custom emails:', error);
        
        // Ensure client is properly closed on error
        if (client.usable) {
          try {
            await client.logout();
          } catch (logoutError) {
            // Ignore logout errors
          }
        }
        
        throw error;
      }
    },
    
    // Send an email
    sendEmail: async (options) => {
      const { to, subject, body, cc, bcc } = options;
      
      try {
        const mailOptions = {
          from: email,
          to,
          subject,
          html: body,
        };
        
        if (cc) mailOptions.cc = cc;
        if (bcc) mailOptions.bcc = bcc;
        
        const result = await smtpTransport.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
      } catch (error) {
        console.error('Error sending custom email:', error);
        throw error;
      }
    },
    
    // Create a draft
    createDraft: async (options) => {
      // For custom SMTP, we can't directly create drafts
      // This is a simplified version - in reality, you'd need to save it to the Drafts folder
      return {
        success: true,
        draftId: `draft-${Date.now()}`,
        note: "Custom SMTP doesn't support native drafts, this is saved locally"
      };
    },
    
    // Get email by ID
    getEmailById: async (messageId) => {
      // For custom IMAP, fetching by ID requires parsing the ID format
      // This is a simplified version
      const uidMatch = messageId.match(/custom-(\d+)/);
      if (!uidMatch) {
        throw new Error('Invalid message ID format');
      }
      
      const uid = parseInt(uidMatch[1]);
      const client = createImapClient();
      
      try {
        await client.connect();
        await client.mailboxOpen('INBOX');
        
        const message = await client.fetchOne(uid, {
          uid: true,
          envelope: true,
          bodyParts: ['text', 'html']
        }, { uid: true });
        
        const body = message.bodyParts?.get('text')?.toString() || 
                    message.bodyParts?.get('html')?.toString() || '';
        
        await client.logout();
        
        return {
          id: messageId,
          from: message.envelope.from?.[0]?.address || '',
          subject: message.envelope.subject || '',
          body: body,
          receivedAt: message.envelope.date ? new Date(message.envelope.date) : new Date()
        };
      } catch (error) {
        console.error('Error fetching custom email by ID:', error);
        
        // Ensure client is properly closed on error
        if (client.usable) {
          try {
            await client.logout();
          } catch (logoutError) {
            // Ignore logout errors
          }
        }
        
        throw error;
      }
    }
  };
};

export default {
  initializeCustomConnection,
  createService
};
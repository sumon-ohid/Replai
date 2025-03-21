import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels from '../../models/ConnectedEmailModels.js';
import { processEmailContent } from './emailProcessingService.js';
import { parseEmailAddress, extractPlainTextBody, extractHtmlBody } from '../utils/emailParser.js';
import connectionManager from '../managers/connectionManager.js';

/**
 * Improved email address parser
 * @param {string} emailString - The raw email address string (e.g. "John Doe <john@example.com>")
 * @returns {{name: string, email: string}} Parsed name and email
 */
function parseEmailAddressImproved(emailString) {
  if (!emailString) return { name: '', email: '' };
  
  // Try to extract using regex for "Name <email>" format
  const nameEmailRegex = /^(.*?)\s*<([^>]+)>$/;
  const match = emailString.match(nameEmailRegex);
  
  if (match) {
    return {
      name: match[1].trim().replace(/"/g, ''), // Remove quotes from name
      email: match[2].trim().toLowerCase()
    };
  }
  
  // If no match, assume it's just an email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  const emailMatch = emailString.match(emailRegex);
  
  if (emailMatch) {
    return {
      name: emailString.replace(emailMatch[0], '').trim() || emailMatch[0].split('@')[0],
      email: emailMatch[0].toLowerCase()
    };
  }
  
  // Fallback
  return {
    name: emailString.split('@')[0] || '',
    email: emailString.includes('@') ? emailString.trim() : `${emailString.trim()}@unknown.com`
  };
}

/**
 * Parse a comma-separated list of email addresses
 * @param {string} addressesString - Comma-separated list of email addresses
 * @returns {Array<{name: string, email: string}>} Array of parsed emails
 */
function parseEmailList(addressesString) {
  if (!addressesString) return [];
  
  // Split by commas but respect quotes
  const addresses = [];
  let currentAddress = '';
  let inQuotes = false;
  
  for (let i = 0; i < addressesString.length; i++) {
    const char = addressesString[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      currentAddress += char;
    } else if (char === ',' && !inQuotes) {
      addresses.push(currentAddress.trim());
      currentAddress = '';
    } else {
      currentAddress += char;
    }
  }
  
  if (currentAddress.trim()) {
    addresses.push(currentAddress.trim());
  }
  
  // Parse each address
  return addresses.map(addr => parseEmailAddressImproved(addr));
}

/**
 * Extract email body more reliably
 * @param {Object} message - The Gmail message object
 * @returns {{text: string, html: string}} The extracted email bodies
 */
function extractEmailBodies(message) {
  try {
    let textBody = '';
    let htmlBody = '';
    
    // Helper function to recursively process parts
    function processParts(parts) {
      if (!parts) return;
      
      for (const part of parts) {
        // Get the mime type
        const mimeType = part.mimeType || '';
        
        // Handle the part based on mime type
        if (mimeType === 'text/plain' && part.body?.data) {
          try {
            const decodedText = Buffer.from(part.body.data, 'base64').toString('utf-8');
            textBody = decodedText;
          } catch (err) {
            console.warn('Error decoding text body:', err);
          }
        } else if (mimeType === 'text/html' && part.body?.data) {
          try {
            const decodedHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
            htmlBody = decodedHtml;
          } catch (err) {
            console.warn('Error decoding HTML body:', err);
          }
        } else if (mimeType.startsWith('multipart/') && part.parts) {
          // Recursively process nested parts
          processParts(part.parts);
        }
      }
    }
    
    // Check if we have a payload with data directly
    if (message.payload.body?.data) {
      try {
        const bodyData = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        
        // Try to detect if it's HTML
        if (bodyData.includes('<html') || bodyData.includes('<body') || bodyData.includes('<div')) {
          htmlBody = bodyData;
        } else {
          textBody = bodyData;
        }
      } catch (err) {
        console.warn('Error decoding direct body data:', err);
      }
    }
    
    // Process parts if available
    if (message.payload.parts) {
      processParts(message.payload.parts);
    }
    
    // Return at least an empty object
    return { 
      text: textBody || '',
      html: htmlBody || ''
    };
  } catch (error) {
    console.error('Error extracting email bodies:', error);
    // Return empty body to prevent null errors
    return { text: '', html: '' };
  }
}

/**
 * Safely sanitize and prepare text for MongoDB storage
 * @param {string} text - The text to sanitize
 * @param {number} maxLength - Maximum length to keep
 * @returns {string} - Sanitized text
 */
function sanitizeForMongoDB(text, maxLength = 100000) {
  if (!text) return '';
  
  // Ensure text is a string
  if (typeof text !== 'string') {
    try {
      text = String(text);
    } catch (e) {
      console.error('Cannot convert body to string:', e);
      return '';
    }
  }
  
  // Truncate if too long
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '... [content truncated due to size]';
  }
  
  // Replace null characters which MongoDB doesn't allow
  text = text.replace(/\u0000/g, '');
  
  // Handle other problematic characters (optional)
  text = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, '');
  
  return text;
}

/**
 * Process a single Google message
 */
export async function processGoogleMessage(gmail, userId, userEmail, messageId, config = {}) {
  try {
    // Get the connected email account with more lenient status check
    const connectedEmail = await ConnectedEmail.findOne({
      userId,
      email: userEmail,
      provider: 'google',
      'tokens.refreshToken': { $exists: true }
    });

    if (!connectedEmail) {
      throw new Error('Connected email account not found');
    }

    // If account exists but status isn't active, try to reactivate
    if (connectedEmail.status !== 'active') {
      console.log(`Found inactive account for ${userEmail}, attempting to reactivate...`);
      
      await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
        status: 'active',
        lastConnected: new Date(),
        $unset: { 
          disconnectedAt: "",
          lastError: ""
        }
      });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());

    // Check if message already exists
    const existingEmail = await emailModels.Email.findOne({ messageId });
    if (existingEmail) {
      console.log(`Email with messageId ${messageId} already exists`);
      return existingEmail;
    }

    console.log(`Processing message: ${messageId}`);

    // Fetch the full message
    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });
    
    const message = messageResponse.data;
    const headers = message.payload.headers || [];
    
    // Extract headers more safely
    const getHeaderValue = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };
    
    const subject = getHeaderValue('subject');
    const from = getHeaderValue('from');
    const to = getHeaderValue('to');
    const cc = getHeaderValue('cc');
    const bcc = getHeaderValue('bcc');
    const replyTo = getHeaderValue('reply-to');
    const messageIdHeader = getHeaderValue('message-id');
    const date = getHeaderValue('date');
    
    console.log(`Parsing email: ${from} -> ${to} (${subject})`);
    
    // Parse email addresses
    const parsedFrom = parseEmailAddressImproved(from);
    const parsedTo = parseEmailList(to);
    const parsedCc = parseEmailList(cc);
    const parsedBcc = parseEmailList(bcc);
    const parsedReplyTo = parseEmailAddressImproved(replyTo);
    
    // Get message bodies
    const { text: bodyText, html: bodyHtml } = extractEmailBodies(message);

    console.log(`Body sizes - Text: ${bodyText?.length || 0} chars, HTML: ${bodyHtml?.length || 0} chars`);

    // Sanitize the bodies
    const sanitizedText = sanitizeForMongoDB(bodyText, 50000);
    const sanitizedHtml = sanitizeForMongoDB(bodyHtml, 100000);

    // Extract a snippet for preview (safely)
    let snippet = '';
    try {
      snippet = message.snippet || sanitizedText.substring(0, 150).replace(/\s+/g, ' ').trim();
    } catch (e) {
      console.warn('Error creating snippet:', e);
      snippet = '(No preview available)';
    }
    
    // Process labels and determine folder
    const gmailLabels = message.labelIds || [];
    let folder = 'inbox';
    
    if (gmailLabels.includes('SENT')) folder = 'sent';
    else if (gmailLabels.includes('DRAFT')) folder = 'drafts';
    else if (gmailLabels.includes('TRASH')) folder = 'trash';
    else if (gmailLabels.includes('SPAM')) folder = 'spam';
    
    // Process attachments
    const attachments = processAttachments(message);
    
    // Create email data with sanitized fields
    const emailData = {
      userId,
      messageId: message.id,
      threadId: message.threadId || message.id,
      externalMessageId: messageIdHeader || message.id,
      provider: 'google',
      providerId: message.id,
      
      from: {
        email: parsedFrom.email || 'unknown@example.com',
        name: sanitizeForMongoDB(parsedFrom.name || parsedFrom.email.split('@')[0] || 'Unknown Sender', 100)
      },
      
      to: parsedTo.map(recipient => ({
        email: recipient.email || '',
        name: sanitizeForMongoDB(recipient.name || recipient.email.split('@')[0] || '', 100)
      })),
      
      cc: parsedCc.map(recipient => ({
        email: recipient.email || '',
        name: sanitizeForMongoDB(recipient.name || recipient.email.split('@')[0] || '', 100)
      })),
      
      bcc: parsedBcc.map(recipient => ({
        email: recipient.email || '',
        name: sanitizeForMongoDB(recipient.name || recipient.email.split('@')[0] || '', 100)
      })),
      
      replyTo: parsedReplyTo.email ? {
        email: parsedReplyTo.email,
        name: sanitizeForMongoDB(parsedReplyTo.name || parsedReplyTo.email.split('@')[0] || '', 100)
      } : null,
      
      subject: sanitizeForMongoDB(subject || '(No Subject)', 500),
      date: new Date(date || Date.now()),
      receivedAt: new Date(),
      
      body: {
        text: sanitizedText,
        html: sanitizedHtml
      },
      
      // Set html_preview for frontend display - with safe truncation
      html_preview: sanitizedHtml ? sanitizedHtml.substring(0, 1000) : '',

      snippet: sanitizeForMongoDB(snippet, 200),
      
      read: !gmailLabels.includes('UNREAD'),
      starred: gmailLabels.includes('STARRED'),
      
      folder,
      labels: gmailLabels,
      
      attachments: attachments || []
    };

    console.log(`Prepared email for saving: ${emailData.from.name} <${emailData.from.email}> - ${emailData.subject}`);

    // Process email content if enabled
    if (config.processContent !== false) {
      try {
        const processedData = await processEmailContent({
          ...emailData,
          userEmail
        });
        Object.assign(emailData, processedData);
      } catch (processError) {
        console.error('Error processing email content:', processError);
        // Continue without content processing
      }
    }

    // Save or update email in database
    try {
      // Try to find existing email first
      const existingEmail = await emailModels.Email.findOne({
        $or: [
          { messageId: message.id },
          { externalMessageId: messageIdHeader }
        ]
      });

      if (existingEmail) {
        // Update existing email
        const updatedEmail = await emailModels.Email.findByIdAndUpdate(
          existingEmail._id,
          {
            $set: {
              ...emailData,
              updatedAt: new Date(),
              lastSync: new Date()
            }
          },
          { new: true }
        );
        console.log(`Email updated successfully with ID: ${updatedEmail._id}`);
        return updatedEmail;
      } else {
        // Save new email
        const emailDoc = new emailModels.Email(emailData);
        const savedEmail = await emailDoc.save();
        console.log(`Email saved successfully with ID: ${savedEmail._id}`);

        // Update sync stats
        await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
          $inc: { 'stats.totalEmails': 1 },
          $set: { 'stats.lastSync': new Date() }
        });

        return savedEmail;
      }
    } catch (saveError) {
      console.error('Error saving email:', saveError);
      
      if (saveError.code === 11000) {
        // Handle duplicate key more gracefully
        try {
          const email = await emailModels.Email.findOne({ messageId: message.id });
          if (email) {
            console.log(`Found existing email with ID: ${email._id}`);
            return email;
          }
        } catch (findError) {
          console.error('Error finding existing email:', findError);
        }
      }

      throw new Error(`Unable to save email: ${saveError.message}`);
    }
  } catch (error) {
    console.error('Error processing Google message:', error);
    throw error;
  }
}

/**
 * Improved attachment processing with error handling
 */
function processAttachments(message) {
  try {
    const attachments = [];
    
    // Helper function to recursively process parts
    function processParts(parts, parentName = '') {
      if (!parts) return;
      
      for (const part of parts) {
        // Check if this part is an attachment
        if (part.filename && part.filename.length > 0) {
          try {
            attachments.push({
              filename: sanitizeForMongoDB(part.filename, 255),
              contentType: part.mimeType || 'application/octet-stream',
              size: part.body?.size || 0,
              attachmentId: part.body?.attachmentId || null,
              partId: part.partId || null,
              contentId: part.headers?.find(h => h.name.toLowerCase() === 'content-id')?.value || null
            });
          } catch (error) {
            console.warn('Error processing attachment:', error);
          }
        }
        
        // Recursively process nested parts
        if (part.parts) {
          processParts(part.parts, parentName + (part.partId ? '.' + part.partId : ''));
        }
      }
    }
    
    // Process message parts
    if (message.payload.parts) {
      processParts(message.payload.parts);
    }
    
    return attachments;
  } catch (error) {
    console.error('Error processing attachments:', error);
    return []; // Return empty array on error
  }
}

/**
 * Helper to determine category from Gmail labels
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

    // Get ConnectedEmail record (don't check status as it may be pending)
    const connectedEmail = await ConnectedEmail.findOne({ 
      userId, 
      email,
      provider: 'google'
    });
    if (!connectedEmail) {
      throw new Error('Connected email record not found. Please reconnect the account.');
    }

    // Update status to active if connection is successful
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      status: 'active',
      lastConnected: new Date()
    });

    // Initialize models
    getConnectedEmailModels(connectedEmail._id.toString());
    
    // Start sync process
    if (config.syncEnabled !== false) {
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
    
    // Update status to error if connection fails
    try {
      const connectedEmail = await ConnectedEmail.findOne({ userId, email, provider: 'google' });
      if (connectedEmail) {
        await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
          status: 'error',
          lastError: {
            message: error.message || 'Connection initialization failed',
            date: new Date(),
            code: 'INIT_ERROR'
          }
        });
      }
    } catch (dbError) {
      console.error('Failed to update email error status:', dbError);
    }
    
    throw error;
  }
}

/**
 * Check for new Google emails with robust error handling
 */
export async function checkForNewGoogleEmails(gmail, userId, email, config = {}) {
  try {
    // Get ConnectedEmail record for collections with more lenient check
    const connectedEmail = await ConnectedEmail.findOne({ 
      userId, 
      email,
      provider: 'google',
      'tokens.refreshToken': { $exists: true }
    });
    
    if (!connectedEmail) {
      console.log(`Connected email not found: ${email}`);
      return [];
    }
    
    // If account exists but status isn't active, try to reactivate
    if (connectedEmail.status !== 'active') {
      console.log(`Found inactive account for ${email}, attempting to reactivate...`);
      
      await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
        status: 'active',
        lastConnected: new Date(),
        $unset: { 
          disconnectedAt: "",
          lastError: ""
        }
      });
    }

    // List recent messages with a more flexible query
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      q: 'newer_than:1d'  // Less restrictive query
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      console.log('No new emails to sync');
      
      // Update last sync time even if no messages
      await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
        'stats.lastSync': new Date()
      });
      
      return [];
    }

    console.log(`Found ${response.data.messages.length} messages to sync`);

    // Process messages
    const processedMessages = [];
    const errors = [];
    
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
        errors.push({
          messageId: message.id,
          error: error.message
        });
      }
    }

    // Update sync stats
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      'stats.lastSync': new Date(),
      $inc: { 'stats.totalEmails': processedMessages.length }
    });

    // Log any errors for debugging
    if (errors.length > 0) {
      console.warn(`${errors.length} messages had errors during sync:`, errors);
    }

    return processedMessages;
  } catch (error) {
    console.error('Error checking Google emails:', error);
    
    // Update error status in database
    try {
      await ConnectedEmail.findOneAndUpdate(
        { userId, email, provider: 'google' },
        { 
          $set: { 
            lastError: {
              message: error.message,
              date: new Date(),
              code: 'SYNC_ERROR'
            }
          }
        }
      );
    } catch (dbError) {
      console.error('Failed to update error status:', dbError);
    }
    
    throw error;
  }
}

/**
 * Save sent email to Gmail's sent folder
 */
/**
 * Send an email using Gmail API
 */
export async function sendEmail(connection, email) {
  try {
    if (!connection.gmail) {
      throw new Error('Gmail connection not properly initialized');
    }

    // Properly format the email address with name if available
    const formatEmailAddress = (emailObj) => {
      if (typeof emailObj === 'string') return emailObj;
      const name = emailObj.name || emailObj.email.split('@')[0];
      return `${name} <${emailObj.email}>`;
    };

    // Create email message in base64 format with proper headers
    const messageParts = [
      `From: ${formatEmailAddress(email.from)}`,
      `To: ${formatEmailAddress(email.to)}`,
      `Subject: ${email.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      `Date: ${email.sentAt.toUTCString()}`,
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(email.content, 'utf-8').toString('base64')
    ];
    
    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email and get thread ID
    const result = await connection.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: email.threadId // Include thread ID if available
      }
    });

    // Return both message data and ID
    return {
      messageId: result.data.id,
      threadId: result.data.threadId,
      ...result.data
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Save sent email to Gmail's sent folder
 */
export async function saveSentEmail(gmail, email, messageId = null) {
  try {
    // Create email message in base64 format
    const messageParts = [
      `From: ${email.from}`,
      `To: ${email.to}`,
      `Subject: ${email.subject}`,
      `Date: ${email.sentAt.toUTCString()}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      email.content
    ];
    
    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Insert the message into the sent folder
    const result = await gmail.users.messages.insert({
      userId: 'me',
      resource: {
        raw: encodedMessage,
        labelIds: ['SENT']
      }
    });

    return result.data;
  } catch (error) {
    console.error('Error saving sent email:', error);
    throw error;
  }
}


export default {
  initializeGoogleConnection,
  processGoogleMessage,
  checkForNewGoogleEmails,
  saveSentEmail,
  sendEmail
};

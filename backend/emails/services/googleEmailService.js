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

// Enhanced email body extraction function
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
            console.log(`Found text part, size: ${decodedText.length} bytes`);
          } catch (err) {
            console.warn('Error decoding text body:', err);
          }
        } else if (mimeType === 'text/html' && part.body?.data) {
          try {
            const decodedHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
            htmlBody = decodedHtml;
            console.log(`Found HTML part, size: ${decodedHtml.length} bytes`);
          } catch (err) {
            console.warn('Error decoding HTML body:', err);
          }
        } else if (mimeType.startsWith('multipart/') && part.parts) {
          // Recursively process nested parts
          console.log(`Processing multipart section with ${part.parts.length} parts`);
          processParts(part.parts);
        }
      }
    }
    
    // Check if we have a payload with data directly
    if (message.payload.body?.data) {
      try {
        const bodyData = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        console.log(`Found direct body data, size: ${bodyData.length} bytes`);
        
        // Try to detect if it's HTML
        if (bodyData.includes('<html') || bodyData.includes('<body') || bodyData.includes('<div')) {
          htmlBody = bodyData;
          console.log('Detected as HTML content');
        } else {
          textBody = bodyData;
          console.log('Detected as plain text content');
        }
      } catch (err) {
        console.warn('Error decoding direct body data:', err);
      }
    }
    
    // Process parts if available
    if (message.payload.parts) {
      console.log(`Processing message with ${message.payload.parts.length} parts`);
      processParts(message.payload.parts);
    }
    
    if (!textBody && !htmlBody) {
      console.warn('No body content found in message');
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
 * Sanitize text for MongoDB storage
 * @param {string} text - The text to sanitize
 * @param {number} maxLength - Maximum length to keep
 * @returns {string} - Sanitized text
 */
function sanitizeForMongoDB(text, maxLength = 100000) {
  if (!text) return '';
  
  // Truncate if too long
  if (text.length > maxLength) {
    console.warn(`Truncating body content from ${text.length} to ${maxLength} characters`);
    text = text.substring(0, maxLength) + '... [content truncated due to size]';
  }
  
  // Replace null characters which MongoDB doesn't allow
  text = text.replace(/\u0000/g, '');
  
  return text;
}


/**
 * Process a single Google message
 */
export async function processGoogleMessage(gmail, userId, userEmail, messageId, config = {}) {
  try {
    // Get the connected email account
    const connectedEmail = await ConnectedEmail.findOne({
      userId,
      email: userEmail,
      provider: 'google',
      status: 'active'
    });

    if (!connectedEmail) {
      throw new Error('Connected email account not found');
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
    const headers = message.payload.headers;
    
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

    // Extract a snippet for preview
    const snippet = message.snippet || bodyText.substring(0, 150).replace(/\s+/g, ' ').trim();
    
    console.log(`Extracted snippet: ${snippet}`);

    // Process labels and determine folder
    const gmailLabels = message.labelIds || [];
    let folder = 'inbox';
    
    if (gmailLabels.includes('SENT')) folder = 'sent';
    else if (gmailLabels.includes('DRAFT')) folder = 'drafts';
    else if (gmailLabels.includes('TRASH')) folder = 'trash';
    else if (gmailLabels.includes('SPAM')) folder = 'spam';
    
    // Process attachments
    const attachments = processAttachments(message);
    
    // Create email data
    const emailData = {
      userId,
      messageId: message.id,
      threadId: message.threadId,
      externalMessageId: messageIdHeader,
      provider: 'google',
      providerId: message.id,
      
      from: {
        email: parsedFrom.email || 'unknown@example.com',
        name: parsedFrom.name || parsedFrom.email.split('@')[0] || 'Unknown Sender'
      },
      
      to: parsedTo.map(recipient => ({
        email: recipient.email || '',
        name: recipient.name || recipient.email.split('@')[0] || ''
      })),
      
      cc: parsedCc.map(recipient => ({
        email: recipient.email || '',
        name: recipient.name || recipient.email.split('@')[0] || ''
      })),
      
      bcc: parsedBcc.map(recipient => ({
        email: recipient.email || '',
        name: recipient.name || recipient.email.split('@')[0] || ''
      })),
      
      replyTo: parsedReplyTo.email ? {
        email: parsedReplyTo.email,
        name: parsedReplyTo.name || parsedReplyTo.email.split('@')[0] || ''
      } : null,
      
      subject: subject || '(No Subject)',
      date: new Date(date),
      receivedAt: new Date(),
      
      body: {
        text: bodyText || '',
        html: bodyHtml || ''
      },
      
      // Set html_preview for frontend display
      html_preview: bodyHtml ? bodyHtml.substring(0, 1000) : '',

      snippet: snippet,
      
      read: !gmailLabels.includes('UNREAD'),
      starred: gmailLabels.includes('STARRED'),
      
      folder,
      labels: gmailLabels,
      
      attachments
    };

    console.log(`Parsed email data: ${emailData.from.name} <${emailData.from.email}> - ${emailData.subject}`);

    // Process email content if enabled
    if (config.processContent !== false) {
      const processedData = await processEmailContent({
        ...emailData,
        userEmail
      });
      Object.assign(emailData, processedData);
    }

    // Save to the correct collection
    try {
      // First try to save the complete document
      const emailDoc = new emailModels.Email(emailData);
      const savedEmail = await emailDoc.save();
      console.log(`Email saved successfully with ID: ${savedEmail._id}`);
      
      // Update sync stats
      await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
        $inc: { 'stats.totalEmails': 1 },
        $set: { 'stats.lastSync': new Date() }
      });
      
      return savedEmail;
    } catch (saveError) {
      // If saving fails, try again with truncated content
      console.error('Error saving email, attempting with truncated content:', saveError);
      
      // Try saving with moderate truncation first
      emailData.body.text = sanitizeForMongoDB(emailData.body.text, 50000);
      emailData.body.html = sanitizeForMongoDB(emailData.body.html, 100000);
      
      const fallbackDoc = new emailModels.Email(emailData);
      const fallbackSave = await fallbackDoc.save();
      
      console.log(`Email saved with truncated content, ID: ${fallbackSave._id}`);
      return fallbackSave;
    }
  } catch (error) {
    console.error('Error processing Google message:', error);
    throw error;
  }
}

/**
 * Improved attachment processing
 */
function processAttachments(message) {
  const attachments = [];
  
  // Helper function to recursively process parts
  function processParts(parts, parentName = '') {
    if (!parts) return;
    
    for (const part of parts) {
      // Check if this part is an attachment
      if (part.filename && part.filename.length > 0) {
        attachments.push({
          filename: part.filename,
          contentType: part.mimeType || 'application/octet-stream',
          size: part.body?.size || 0,
          attachmentId: part.body?.attachmentId || null,
          partId: part.partId || null,
          contentId: part.headers?.find(h => h.name.toLowerCase() === 'content-id')?.value || null
        });
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

    // Get ConnectedEmail record
    const connectedEmail = await ConnectedEmail.findOne({ 
      userId, 
      email,
      provider: 'google',
      status: 'active'
    });
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
    const connectedEmail = await ConnectedEmail.findOne({ 
      userId, 
      email,
      provider: 'google',
      status: 'active'
    });
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
  checkForNewGoogleEmails,
  initializeGoogleConnection,
};

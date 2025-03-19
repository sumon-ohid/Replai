/**
 * Utility functions for parsing and extracting email content
 */

/**
 * Parse email address from string format
 * @param {string} fullAddress - Email address in "Name <email@example.com>" or "email@example.com" format
 * @returns {Object} - Object with name and email properties
 */

/**
 * Parse email address from string format
 * Handles formats like "Name <email@example.com>" or just "email@example.com"
 */

export function parseEmailAddress(addressStr) {
  if (!addressStr) {
    return [];
  }
  
  try {
    // Simple regex to extract email and name
    // Format could be "Name <email>" or just "email"
    const addresses = addressStr.split(',').map(addr => addr.trim());
    
    return addresses.map(address => {
      const match = address.match(/<(.+?)>|(.+)/);
      const email = match ? (match[1] || match[2]).trim() : '';
      
      // Extract name if present
      let name = '';
      if (address.includes('<')) {
        name = address.split('<')[0].trim();
        // Remove quotes if present
        if (name.startsWith('"') && name.endsWith('"')) {
          name = name.substring(1, name.length - 1);
        }
      }
      
      return { email, name };
    });
  } catch (error) {
    console.error('Error parsing email address:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Extract email addresses from To/Cc/Bcc fields
 */
export const extractEmailAddresses = (addressesStr) => {
  if (!addressesStr || typeof addressesStr !== 'string') {
    return [];
  }
  
  // Split by commas, handle both "Name <email>" and "email" formats
  const addresses = addressesStr.split(',');
  return addresses.map(addr => parseEmailAddress(addr.trim()));
};

/**
 * Format email address object to string
 */
export const formatEmailAddress = (addressObj) => {
  if (!addressObj || !addressObj.email) {
    return '';
  }
  
  if (addressObj.name) {
    return `${addressObj.name} <${addressObj.email}>`;
  }
  
  return addressObj.email;
};

// Make sure these functions handle plain text email bodies correctly

export const extractPlainTextBody = (message) => {
  if (!message.payload) return '';
  
  // If the message payload has a body with data
  if (message.payload.body && message.payload.body.data) {
    return Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }
  
  // If the message has parts
  if (message.payload.parts) {
    for (const part of message.payload.parts) {
      // Find the plain text part
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      
      // Check for multipart with nested parts
      if (part.parts) {
        for (const nestedPart of part.parts) {
          if (nestedPart.mimeType === 'text/plain' && nestedPart.body && nestedPart.body.data) {
            return Buffer.from(nestedPart.body.data, 'base64').toString('utf-8');
          }
        }
      }
    }
  }
  
  return '';
};

export const extractHtmlBody = (message) => {
  if (!message.payload) return '';
  
  // If the message has parts
  if (message.payload.parts) {
    for (const part of message.payload.parts) {
      // Find the HTML part
      if (part.mimeType === 'text/html' && part.body && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      
      // Check for multipart with nested parts
      if (part.parts) {
        for (const nestedPart of part.parts) {
          if (nestedPart.mimeType === 'text/html' && nestedPart.body && nestedPart.body.data) {
            return Buffer.from(nestedPart.body.data, 'base64').toString('utf-8');
          }
        }
      }
    }
  }
  
  return '';
};

/**
 * Extract header value from Gmail message headers
 * @param {Array} headers - Array of header objects
 * @param {string} name - Name of the header to find
 * @returns {string} - Header value or empty string if not found
 */
export const extractHeader = (headers, name) => {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : '';
};

/**
 * Find and extract header values from Gmail message headers
 * @param {Object} emailData - Gmail message data
 * @returns {Object} - Object containing common headers
 */
export const extractHeaders = (emailData) => {
  const headers = emailData.payload.headers;
  return {
    from: extractHeader(headers, 'From'),
    to: extractHeader(headers, 'To'),
    cc: extractHeader(headers, 'Cc'),
    subject: extractHeader(headers, 'Subject'),
    date: extractHeader(headers, 'Date'),
    messageId: extractHeader(headers, 'Message-ID'),
    inReplyTo: extractHeader(headers, 'In-Reply-To'),
    references: extractHeader(headers, 'References')
  };
};

/**
 * Extract email message content from Gmail API response
 * @param {Object} emailData - Gmail message data
 * @returns {Object} - Email content and metadata
 */
export const extractEmailContent = (emailData) => {
  const { payload } = emailData;
  const headers = extractHeaders(emailData);
  
  return {
    id: emailData.id,
    threadId: emailData.threadId,
    subject: headers.subject || '(No Subject)',
    from: headers.from,
    to: headers.to,
    cc: headers.cc,
    date: headers.date ? new Date(headers.date) : new Date(),
    messageId: headers.messageId,
    inReplyTo: headers.inReplyTo,
    references: headers.references,
    plainBody: extractPlainTextBody(payload),
    htmlBody: extractHtmlBody(payload),
    snippet: emailData.snippet || ''
  };
};

/**
 * Extract attachments from Gmail message
 * @param {Object} payload - Gmail message payload
 * @returns {Array} - Array of attachment objects
 */
export const extractAttachments = (payload) => {
  const attachments = [];
  
  const processBodyPart = (part) => {
    if (part.filename && part.body && part.body.attachmentId) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType,
        attachmentId: part.body.attachmentId,
        size: part.body.size || 0
      });
    }
    
    if (part.parts) {
      part.parts.forEach(subPart => processBodyPart(subPart));
    }
  };
  
  if (payload.parts) {
    payload.parts.forEach(part => processBodyPart(part));
  }
  
  return attachments;
};

/**
 * Format email address objects for sending via API
 * @param {Array|Object} addressObjects - Array of {name, email} objects or single object
 * @returns {string} - Formatted email address string
 */
export const formatEmailAddresses = (addressObjects) => {
  if (!addressObjects) return '';
  
  const formatSingle = (obj) => {
    if (!obj.email) return '';
    return obj.name ? `"${obj.name}" <${obj.email}>` : obj.email;
  };
  
  if (Array.isArray(addressObjects)) {
    return addressObjects
      .map(formatSingle)
      .filter(addr => addr)
      .join(', ');
  }
  
  return formatSingle(addressObjects);
};

export default {
  parseEmailAddress,
  extractPlainTextBody,
  extractHtmlBody,
  extractHeader,
  extractHeaders,
  extractEmailContent,
  extractAttachments,
  formatEmailAddresses,
  parseEmailAddress,
  extractEmailAddresses,
  formatEmailAddress
};
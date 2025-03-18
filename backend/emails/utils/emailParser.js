/**
 * Utility functions for parsing and extracting email content
 */

/**
 * Parse email address from string format
 * @param {string} fullAddress - Email address in "Name <email@example.com>" or "email@example.com" format
 * @returns {Object} - Object with name and email properties
 */
export const parseEmailAddress = (fullAddress) => {
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

/**
 * Extract plain text body from Gmail message payload
 * @param {Object} payload - Gmail message payload
 * @returns {string} - Plain text email content
 */
export const extractPlainTextBody = (payload) => {
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

/**
 * Extract HTML body from Gmail message payload
 * @param {Object} payload - Gmail message payload
 * @returns {string|null} - HTML email content or null if not found
 */
export const extractHtmlBody = (payload) => {
  if (payload.parts) {
    const htmlPart = payload.parts.find(part => part.mimeType === 'text/html');
    if (htmlPart && htmlPart.body.data) {
      return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
    }
  }
  // Check for HTML in main body if parts don't have it
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  return null;
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
  formatEmailAddresses
};
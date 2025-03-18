import mongoose from 'mongoose';
import getSentEmailModel from '../../models/SentEmail.js';
import getEmailModel from '../../models/Email.js';
import User from '../../models/User.js';
import BlockList from '../../models/BlockList.js';
import TextData from '../../models/TextData.js';
import { 
  getEmailGoogleService, 
  getEmailOutlookService, 
  getEmailCustomService
} from '../services/emailServiceFactory.js';
import { analyzeEmailSentiment } from '../utils/sentimentAnalyzer.js';
import { categorizeEmail } from '../utils/emailCategorizer.js';
import connectionManager from '../managers/connectionManager.js';
import { 
    parseEmailAddress, 
    extractPlainTextBody as getEmailBody, 
    extractHtmlBody as getEmailHtmlBody 
  } from '../utils/emailParser.js';

/**
 * Save a received email to the database
 * @param {Object} emailData - Email data from email provider
 * @param {String} userId - User ID to associate with email
 * @param {String} provider - Email provider (google, outlook, custom)
 * @returns {Object} Saved email object
 */
export const saveReceivedEmail = async (emailData, userId, provider = 'google') => {
  try {
    // Extract email data based on provider format
    let id, threadId, payload, headers, from, subject, to, dateStr, plainBody, htmlBody;
    
    if (provider === 'google') {
      ({ payload, id, threadId } = emailData);
      headers = payload.headers;
      const fromHeader = headers.find(h => h.name === 'From');
      const subjectHeader = headers.find(h => h.name === 'Subject');
      const toHeader = headers.find(h => h.name === 'To');
      const dateHeader = headers.find(h => h.name === 'Date');
      
      from = fromHeader?.value || '';
      subject = subjectHeader?.value || '(No Subject)';
      to = toHeader?.value || '';
      dateStr = dateHeader?.value || new Date().toISOString();
      plainBody = getEmailBody(payload);
      htmlBody = getEmailHtmlBody(payload);
    } else if (provider === 'outlook') {
      // Outlook format handling
      id = emailData.id;
      threadId = emailData.conversationId;
      from = emailData.from?.emailAddress?.address || '';
      subject = emailData.subject || '(No Subject)';
      to = emailData.toRecipients?.[0]?.emailAddress?.address || '';
      dateStr = emailData.receivedDateTime || new Date().toISOString();
      plainBody = emailData.body?.content || '';
      htmlBody = emailData.body?.contentType === 'html' ? plainBody : null;
    } else {
      // Custom email format handling
      id = emailData.messageId;
      threadId = emailData.threadId;
      from = emailData.from || '';
      subject = emailData.subject || '(No Subject)';
      to = emailData.to || '';
      dateStr = emailData.date || new Date().toISOString();
      plainBody = emailData.body?.text || '';
      htmlBody = emailData.body?.html || null;
    }
    
    const date = new Date(dateStr);
    
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
      source: provider,
      processed: false,
      processingStatus: 'pending'
    });
    
    await email.save();
    return email;
  } catch (error) {
    console.error('Error saving received email to database:', error);
    return null;
  }
};

/**
 * Handle incoming emails based on user preferences
 * @param {Object} emailData - Email data from provider
 * @param {String} userId - User ID associated with email
 * @param {String} provider - Email provider (google, outlook, custom)
 * @param {Object} userPreferences - User email handling preferences
 * @returns {Object} Result of email handling
 */
export const handleIncomingEmail = async (emailData, userId, provider, userPreferences = {}) => {
  try {
    // Save email to database first
    const savedEmail = await saveReceivedEmail(emailData, userId, provider);
    if (!savedEmail) {
      return { success: false, message: 'Failed to save email' };
    }
    
    // Get user email handling preferences if not provided
    if (!userPreferences.autoReply && !userPreferences.draftMode && !userPreferences.syncPaused) {
      const user = await User.findById(userId);
      if (user && user.emailPreferences) {
        userPreferences = user.emailPreferences;
      } else {
        // Default preferences
        userPreferences = {
          autoReply: true,
          draftMode: false, 
          syncPaused: false
        };
      }
    }
    
    // Check if sync is paused, which stops all actions
    if (userPreferences.syncPaused) {
      console.log('Email sync is paused. Taking no action on new email.');
      return { success: true, action: 'none', message: 'Sync paused' };
    }

    // Check blocklist to see if email should be ignored
    const fromEmail = savedEmail.from.email;
    const fromDomain = fromEmail.includes('@') ? fromEmail.split('@')[1].toLowerCase() : '';
    const blockList = await BlockList.findOne({ userId });
    
    if (blockList && blockList.entries.some(entry => {
      entry = entry.toLowerCase();
      return fromEmail.toLowerCase() === entry || 
             fromDomain === entry || 
             fromDomain.endsWith(`.${entry}`);
    })) {
      console.log(`Email from ${fromEmail} is blocked. Not processing.`);
      
      // Mark as processed but skipped
      savedEmail.processed = true;
      savedEmail.processingStatus = 'skipped';
      savedEmail.processingLog.push({
        timestamp: new Date(),
        status: 'skipped',
        message: 'Sender is on block list'
      });
      await savedEmail.save();
      
      return { success: true, action: 'blocked', message: 'Email blocked' };
    }
    
    // Get user's AI prompt if available
    const userPrompt = await TextData.findOne({ userId });
    const promptText = userPrompt ? (userPrompt.text + (userPrompt.fileData || '')) : '';
    
    // Get the email service based on provider
    let emailService;
    switch(provider) {
      case 'google':
        emailService = await getEmailGoogleService(userId);
        break;
      case 'outlook': 
        emailService = await getEmailOutlookService(userId);
        break;
      default:
        emailService = await getEmailCustomService(userId);
    }
    
    // Draft mode - create draft but don't send
    if (userPreferences.draftMode) {
      const draftResult = await emailService.createResponseDraft(savedEmail, promptText);
      
      // Update email processing status
      savedEmail.processed = true;
      savedEmail.processingStatus = 'processed';
      savedEmail.processingDate = new Date();
      savedEmail.processingTime = draftResult.processingTime || 0;
      savedEmail.processingLog.push({
        timestamp: new Date(),
        status: 'processed',
        message: 'Draft created'
      });
      await savedEmail.save();
      
      return { success: true, action: 'draft', draftId: draftResult.draftId };
    }
    
    // Auto-reply mode - respond immediately
    if (userPreferences.autoReply) {
      const responseResult = await emailService.sendAutoResponse(savedEmail, promptText);
      
      // Update email processing status
      savedEmail.processed = true;
      savedEmail.autoReplied = true;
      savedEmail.processingStatus = 'processed';
      savedEmail.processingDate = new Date();
      savedEmail.processingTime = responseResult.processingTime || 0;
      savedEmail.processingLog.push({
        timestamp: new Date(),
        status: 'processed',
        message: 'Auto-replied by AI'
      });
      await savedEmail.save();
      
      return { 
        success: true, 
        action: 'replied',
        responseId: responseResult.messageId,
        responseTime: responseResult.responseTime
      };
    }
    
    // If neither draft mode nor auto-reply is enabled, just mark as received
    savedEmail.processed = true;
    savedEmail.processingStatus = 'processed';
    savedEmail.processingDate = new Date();
    savedEmail.processingLog.push({
      timestamp: new Date(),
      status: 'processed',
      message: 'Email received, no action taken per user preferences'
    });
    await savedEmail.save();
    
    return { success: true, action: 'received' };
    
  } catch (error) {
    console.error('Error handling incoming email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Manually process an email (mark as read, reply, move, etc)
 * @param {String} emailId - Email ID to process
 * @param {String} userId - User ID
 * @param {Object} options - Processing options 
 */
export const processEmail = async (emailId, userId, options = {}) => {
  try {
    const Email = getEmailModel(userId);
    const email = await Email.findOne({ messageId: emailId, userId });
    
    if (!email) {
      return { success: false, message: 'Email not found' };
    }
    
    // Handle different actions based on options
    if (options.markAsRead) {
      email.isRead = true;
      await email.save();
      
      // Also update on provider if connected
      if (email.source && connectionManager.hasActiveConnection(userId, email.source)) {
        const service = await connectionManager.getEmailService(userId, email.source);
        await service.markAsRead(emailId);
      }
    }
    
    if (options.moveToFolder) {
      const oldFolder = email.folder;
      email.folder = options.moveToFolder;
      await email.save();
      
      // Also update on provider if connected
      if (email.source && connectionManager.hasActiveConnection(userId, email.source)) {
        const service = await connectionManager.getEmailService(userId, email.source);
        await service.moveToFolder(emailId, options.moveToFolder);
      }
      
      return { 
        success: true, 
        message: `Email moved from ${oldFolder} to ${options.moveToFolder}` 
      };
    }
    
    return { success: true, message: 'Email processed successfully' };
    
  } catch (error) {
    console.error('Error processing email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Search for emails with filtering
 * @param {String} userId - User ID
 * @param {Object} filters - Search filters
 * @param {Object} options - Pagination options
 */
export const searchEmails = async (userId, filters = {}, options = { page: 1, limit: 20 }) => {
  try {
    const Email = getEmailModel(userId);
    
    // Build query
    const query = { userId };
    
    if (filters.folder) {
      query.folder = filters.folder;
    }
    
    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.searchText) {
      query.$text = { $search: filters.searchText };
    }
    
    if (filters.from) {
      query['from.email'] = { $regex: filters.from, $options: 'i' };
    }
    
    if (filters.dateFrom || filters.dateTo) {
      query.date = {};
      if (filters.dateFrom) {
        query.date.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.date.$lte = new Date(filters.dateTo);
      }
    }
    
    // Pagination
    const skip = (options.page - 1) * options.limit;
    
    // Execute query with pagination
    const emails = await Email.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(options.limit);
    
    // Get total count for pagination
    const totalCount = await Email.countDocuments(query);
    
    return {
      success: true,
      data: {
        emails,
        pagination: {
          page: options.page,
          limit: options.limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / options.limit)
        }
      }
    };
    
  } catch (error) {
    console.error('Error searching emails:', error);
    return { success: false, error: error.message };
  }
};

export default {
  saveReceivedEmail,
  handleIncomingEmail,
  processEmail,
  searchEmails
};
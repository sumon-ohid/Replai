import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels from '../../models/ConnectedEmailModels.js';
import { asyncHandler } from '../utils/errorHandler.js';

class EmailController {
   /**
   * Get emails for a specific connected email account with optimized body handling
   */
  static getEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { folder = 'inbox', page = 1, limit = 50 } = req.query;
    
    console.log('🚀🚀 Getting emails for', { email, folder, page, limit });
    
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Create query object
    const query = {};
    
    // Add folder filter if provided and valid
    if (folder && folder !== 'all') {
      // Convert to lowercase for consistency
      query.folder = folder.toLowerCase();
    }
    
    // Fetch emails with pagination, but be selective about fields to improve performance
    const skip = (page - 1) * limit;
    const [emails, total] = await Promise.all([
      emailModels.Email.find(query)
        .select({
          // Always include these fields
          _id: 1,
          messageId: 1,
          threadId: 1,
          from: 1,
          to: 1,
          cc: 1,
          bcc: 1,
          subject: 1,
          date: 1,
          receivedAt: 1,
          read: 1,
          readAt: 1,
          starred: 1,
          folder: 1,
          labels: 1,
          snippet: 1,
          attachments: 1,
          
          // For list view, include a truncated body or summary
          'body.text': { $substr: ['$body.text', 0, 150] },
          html_preview: 1
        })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      emailModels.Email.countDocuments(query)
    ]);
    
    console.log(`📧 Found ${emails.length} emails (total: ${total})`);
    
    // Process emails to ensure consistent format
    const processedEmails = emails.map(email => {
      // Ensure body exists
      if (!email.body) {
        email.body = {
          text: email.snippet || '',
          html: email.html_preview || ''
        };
      }
      
      return email;
    });
    
    res.json({
      emails: processedEmails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

    /**
   * Get a single email by ID with proper body handling
   */
  static getEmail = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;
    
    console.log('🚀🚀 Getting email details', { email, messageId });
  
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Find the email - try multiple possible ID fields
    const emailDoc = await emailModels.Email.findOne({
      $or: [
        { messageId: messageId },
        { _id: messageId },
        { id: messageId }
      ]
    }).lean();
  
    if (!emailDoc) {
      console.log('⚠️ Email not found', { email, messageId });
      return res.status(404).json({ error: 'Email not found' });
    }
    
    // Log email body status to debug
    console.log('📧 Email body check:', {
      hasBody: !!emailDoc.body,
      bodyType: typeof emailDoc.body,
      textLength: emailDoc.body?.text?.length || 0,
      htmlLength: emailDoc.body?.html?.length || 0
    });
    
    // If body is missing, try to create it from available data
    if (!emailDoc.body) {
      console.log('⚠️ Email body missing, creating from available data');
      emailDoc.body = {
        text: emailDoc.snippet || '',
        html: emailDoc.html_preview || ''
      };
    }
    
    // If body exists but is a string, convert to object format
    if (typeof emailDoc.body === 'string') {
      console.log('⚠️ Email body is a string, converting to object format');
      const bodyText = emailDoc.body;
      emailDoc.body = {
        text: bodyText,
        html: bodyText.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\r/g, '<br>')
      };
    }
  
    // Ensure HTML content exists if text content is available
    if (emailDoc.body?.text && !emailDoc.body?.html) {
      console.log('⚠️ Email has text but no HTML, converting text to HTML');
      emailDoc.body.html = emailDoc.body.text
        .replace(/\r\n/g, '<br>')
        .replace(/\n/g, '<br>')
        .replace(/\r/g, '<br>');
    }
    
    // Mark as read if not already read
    if (!emailDoc.read) {
      console.log('📧 Marking email as read');
      await emailModels.Email.findByIdAndUpdate(
        emailDoc._id,
        { 
          $set: { read: true },
          $currentDate: { readAt: true }
        }
      );
      emailDoc.read = true;
      emailDoc.readAt = new Date();
    }
    
    console.log('📧 Email retrieved successfully');
    res.json(emailDoc);
  });

  /**
   * Get drafts for a specific email account
   */
  static getDrafts = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Fetch drafts with pagination
    const skip = (page - 1) * limit;
    const [drafts, total] = await Promise.all([
      emailModels.Draft.find({ status: 'draft' })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      emailModels.Draft.countDocuments({ status: 'draft' })
    ]);
    
    res.json({
      drafts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  /**
   * Get sent emails for a specific email account
   */
  static getSentEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Fetch sent emails with pagination
    const skip = (page - 1) * limit;
    const [sentEmails, total] = await Promise.all([
      emailModels.Sent.find()
        .sort({ dateSent: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      emailModels.Sent.countDocuments()
    ]);
    
    res.json({
      sentEmails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  /**
   * Mark email as read
   */
  // In backend/emails/controllers/emailController.js
  static markAsRead = asyncHandler(async (req, res) => {
      const userId = req.user._id;
      const { email, messageId } = req.params;
  
      console.log('🚀🚀 Marking email as read', email, messageId);
      
      // Get the connected email account
      const account = await ConnectedEmail.findOne({ userId, email });
      if (!account) {
        return res.status(404).json({ error: 'Connected email not found' });
      }
      
      // Get models for this email account
      const emailModels = getConnectedEmailModels(account._id.toString());
      
      // Try to find the email by all possible ID fields
      const email_doc = await emailModels.Email.findOne({
        $or: [
          { messageId: messageId },
          { _id: messageId },
          { id: messageId }
        ]
      });
      
      if (!email_doc) {
        console.log('🚀🚀 Email not found when trying to mark as read', { 
          email, messageId, 
          availableIds: 'Trying messageId, _id, and id fields'
        });
        
        // For debugging: Let's log a sample email to see what fields exist
        const sampleEmail = await emailModels.Email.findOne({}).lean();
        console.log('Sample email document structure:', {
          idFields: {
            _id: sampleEmail?._id,
            messageId: sampleEmail?.messageId,
            id: sampleEmail?.id
          }
        });
        
        return res.status(404).json({ error: 'Email not found' });
      }
      
      // Update the found email
      const result = await emailModels.Email.findByIdAndUpdate(
        email_doc._id,
        { 
          $set: { read: true },
          $currentDate: { readAt: true }
        },
        { new: true }
      ).lean();
      
      if (!result) {
        console.log('🚀🚀 Failed to update email', email, messageId);
        return res.status(500).json({ error: 'Failed to update email' });
      }
      
      console.log('🚀🚀 Email marked as read successfully', email, messageId);
      res.json(result);
  });

  /**
   * Search emails
   */
  static searchEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { query, page = 1, limit = 50 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Perform search with pagination
    const skip = (page - 1) * limit;
    const searchQuery = { $text: { $search: query } };
    
    const [results, total] = await Promise.all([
      emailModels.Email.find(searchQuery)
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean(),
      emailModels.Email.countDocuments(searchQuery)
    ]);
    
    res.json({
      results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });
  
  
  /**
   * Debug helper to analyze email structure
   */
  static debugEmailStructure = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;
    
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Get a raw email document to analyze its structure
    const emailDoc = await emailModels.Email.findOne(
      messageId ? { messageId } : {}
    );
    
    if (!emailDoc) {
      return res.status(404).json({ error: 'No emails found to analyze' });
    }
    
    // Extract document structure
    const rawDoc = emailDoc.toObject();
    
    // Analyze body structure
    const bodyAnalysis = {
      exists: !!rawDoc.body,
      type: typeof rawDoc.body,
      keys: rawDoc.body ? Object.keys(rawDoc.body) : [],
      hasText: rawDoc.body?.text !== undefined,
      hasHtml: rawDoc.body?.html !== undefined,
      textType: typeof rawDoc.body?.text,
      htmlType: typeof rawDoc.body?.html,
      textLength: rawDoc.body?.text?.length || 0,
      htmlLength: rawDoc.body?.html?.length || 0,
      textSample: rawDoc.body?.text?.substring(0, 100) || '',
      htmlSample: rawDoc.body?.html?.substring(0, 100) || '',
      hasSnippet: !!rawDoc.snippet,
      hasHtmlPreview: !!rawDoc.html_preview
    };
    
    // Get schema information
    const schemaInfo = {
      paths: Object.keys(emailDoc.schema.paths),
      bodyPath: emailDoc.schema.paths.body ? {
        type: emailDoc.schema.paths.body.instance,
        schema: emailDoc.schema.paths.body.schema ? 
          Object.keys(emailDoc.schema.paths.body.schema.paths) : 'No subschema'
      } : 'Not defined'
    };
    
    res.json({
      messageId: rawDoc.messageId,
      bodyAnalysis,
      schemaInfo,
      otherFields: Object.keys(rawDoc)
    });
  });
}


export default EmailController;

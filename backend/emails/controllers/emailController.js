import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels from '../../models/ConnectedEmailModels.js';
import { asyncHandler } from '../utils/errorHandler.js';

class EmailController {
  /**
   * Get emails for a specific connected email account
   */
  static getEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { folder = 'INBOX', page = 1, limit = 50 } = req.query;
    
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Fetch emails with pagination
    const skip = (page - 1) * limit;
    const [emails, total] = await Promise.all([
      emailModels.Email.find({ folder })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      emailModels.Email.countDocuments({ folder })
    ]);
    
    res.json({
      emails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  /**
   * Get a single email by ID
   */
  static getEmail = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;
    
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Find the email
    const emailDoc = await emailModels.Email.findOne({ messageId }).lean();
    if (!emailDoc) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
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
  static markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;
    
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Connected email not found' });
    }
    
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Update the email
    const result = await emailModels.Email.findOneAndUpdate(
      { messageId },
      { 
        $set: { read: true },
        $currentDate: { readAt: true }
      },
      { new: true }
    ).lean();
    
    if (!result) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
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
}

export default EmailController;

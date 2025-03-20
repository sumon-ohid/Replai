import EmailAccount from '../../models/ConnectedEmailModels.js';
import EmailProcessingService from '../services/emailProcessingService.js';
import ConnectionManager from '../managers/connectionManager.js';
import { asyncHandler } from '../utils/errorHandler.js';

class AutomationController {
  /**
   * Get automation settings
   */
  static getSettings = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const userId = req.user._id;

    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    res.json(account.aiSettings);
  });

  /**
   * Update automation settings
   */
  static updateSettings = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const userId = req.user._id;
    const settings = req.body;

    const account = await EmailAccount.findOneAndUpdate(
      { userId, email },
      { $set: { aiSettings: settings } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    // Update connection config if exists
    await ConnectionManager.updateConnectionConfig(userId, email, {
      aiSettings: settings
    });

    res.json({ success: true, settings: account.aiSettings });
  });

  /**
   * Get response templates
   */
  static getTemplates = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const userId = req.user._id;

    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    res.json(account.aiSettings?.responseTemplates || []);
  });

  /**
   * Create response template
   */
  static createTemplate = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const userId = req.user._id;
    const template = req.body;

    const account = await EmailAccount.findOneAndUpdate(
      { userId, email },
      { $push: { 'aiSettings.responseTemplates': template } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    res.json({ success: true, template });
  });

  /**
   * Update response template
   */
  static updateTemplate = asyncHandler(async (req, res) => {
    const { email, templateId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const account = await EmailAccount.findOneAndUpdate(
      { 
        userId, 
        email,
        'aiSettings.responseTemplates._id': templateId 
      },
      { 
        $set: { 
          'aiSettings.responseTemplates.$': {
            ...updates,
            _id: templateId
          }
        } 
      },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ success: true, template: updates });
  });

  /**
   * Delete response template
   */
  static deleteTemplate = asyncHandler(async (req, res) => {
    const { email, templateId } = req.params;
    const userId = req.user._id;

    const account = await EmailAccount.findOneAndUpdate(
      { userId, email },
      { $pull: { 'aiSettings.responseTemplates': { _id: templateId } } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    res.json({ success: true });
  });

  /**
   * Analyze email and get suggested response
   */
  static analyzeEmail = asyncHandler(async (req, res) => {
    const { email: content } = req.body;
    const userId = req.user._id;

    const analysis = await EmailProcessingService.analyzeEmail(content);
    const response = await EmailProcessingService.generateResponse(analysis, {
      mode: 'suggest'
    });

    res.json({ analysis, suggestedResponse: response });
  });

  /**
   * Send automated response
   */
  static sendAutomatedResponse = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const { messageId, content } = req.body;
    const userId = req.user._id;

    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    const connection = ConnectionManager.getConnection(userId, email);
    if (!connection) {
      return res.status(400).json({ error: 'No active connection' });
    }

    const emailService = await ConnectionManager.getEmailService(account.provider);
    await emailService.sendEmail(connection.connection, {
      messageId,
      content
    });

    res.json({ success: true });
  });

  /**
   * Create response draft
   */
  static createResponseDraft = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const { messageId, content } = req.body;
    const userId = req.user._id;

    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    const connection = ConnectionManager.getConnection(userId, email);
    if (!connection) {
      return res.status(400).json({ error: 'No active connection' });
    }

    const emailService = await ConnectionManager.getEmailService(account.provider);
    await emailService.createDraft(connection.connection, {
      messageId,
      content
    });

    res.json({ success: true });
  });

  /**
   * Get email categories
   */
  static getCategories = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const userId = req.user._id;

    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    res.json(account.aiSettings?.categories || []);
  });

  /**
   * Update email categories
   */
  static updateCategories = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const { categories } = req.body;
    const userId = req.user._id;

    const account = await EmailAccount.findOneAndUpdate(
      { userId, email },
      { $set: { 'aiSettings.categories': categories } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    res.json({ success: true, categories: account.aiSettings.categories });
  });

  /**
   * Get automation performance metrics
   */
  static getPerformanceMetrics = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const userId = req.user._id;

    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    // Calculate performance metrics
    const metrics = {
      totalProcessed: account.stats.processedEmails,
      autoResponded: account.stats.autoRespondedEmails || 0,
      draftCreated: account.stats.draftCreatedEmails || 0,
      errorRate: account.stats.failedAttempts / account.stats.processedEmails || 0,
      averageResponseTime: account.stats.averageResponseTime || 0,
      categoriesDistribution: account.stats.categoriesDistribution || {}
    };

    res.json(metrics);
  });

  /**
   * Toggle automation mode
   */
  static toggleMode = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const { mode } = req.body;
    const userId = req.user._id;

    const account = await EmailAccount.findOneAndUpdate(
      { userId, email },
      { $set: { 'aiSettings.mode': mode } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    // Update connection config
    await ConnectionManager.updateConnectionConfig(userId, email, {
      aiSettings: account.aiSettings
    });

    res.json({ success: true, mode: account.aiSettings.mode });
  });

  /**
   * Test automation settings
   */
  static testAutomation = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const { testEmail } = req.body;
    const userId = req.user._id;

    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }

    // Process test email
    const result = await EmailProcessingService.processEmail(testEmail, account.aiSettings);

    res.json(result);
  });
}

export default AutomationController;

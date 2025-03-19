import EmailAccount from '../../models/emailSchema.js';
import User from '../../models/User.js';
import ConnectionManager from '../managers/connectionManager.js';
import { asyncHandler } from '../utils/errorHandler.js';

class ConnectionController {
  /**
   * List all connected emails for a user
   */
  static listConnections = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const accounts = await EmailAccount.find({ userId }).select('-credentials -tokens.accessToken -tokens.refreshToken');
    const activeConnections = ConnectionManager.getUserConnections(userId);
    
    // Merge account data with connection status
    const connections = accounts.map(account => {
      const active = activeConnections.find(conn => conn.email === account.email) || null;
      
      return {
        email: account.email,
        provider: account.provider,
        name: account.name || account.email.split('@')[0],
        connected: !!active,
        status: active ? active.status : 'disconnected',
        lastSync: account.stats?.lastSync || null,
        syncEnabled: account.syncConfig?.enabled ?? true,
        folders: account.syncConfig?.folders || ['INBOX'],
        aiEnabled: account.aiSettings?.enabled ?? false,
        aiMode: account.aiSettings?.mode || 'suggest'
      };
    });
    
    res.json(connections);
  });

  /**
   * Add a new connection
   */
  static addConnection = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { provider, email, credentials, tokens, syncConfig, name } = req.body;
    
    // Check if connection already exists
    const existingAccount = await EmailAccount.findOne({ userId, email });
    if (existingAccount) {
      return res.status(400).json({ error: 'Email already connected' });
    }
    
    // Create new email account
    const account = new EmailAccount({
      userId,
      provider,
      email,
      name: name || email.split('@')[0],
      credentials: provider === 'custom' ? credentials : undefined,
      tokens: provider !== 'custom' ? tokens : undefined,
      syncConfig: syncConfig || {
        enabled: true,
        folders: ['INBOX'],
        interval: 60 // 60 seconds
      },
      aiSettings: {
        enabled: false,
        mode: 'suggest',
        responseTemplates: []
      }
    });
    
    await account.save();

    console.log('New email account added:', account.email);
    
    // Initialize the connection
    try {
      const connectionKey = await ConnectionManager.initializeConnection(
        userId, 
        email, 
        provider, 
        provider === 'custom' ? credentials : tokens,
        account.syncConfig
      );
      
      if (!connectionKey) {
        return res.status(500).json({ 
          error: 'Failed to initialize connection',
          account: {
            email,
            provider,
            name: account.name,
            connected: false
          }
        });
      }
      
      // Also add to user's connectedEmails array
      await User.findByIdAndUpdate(userId, {
        $push: { connectedEmails: {
          email,
          provider,
          name: account.name
        }}
      });
      
      res.status(201).json({
        success: true,
        account: {
          email,
          provider,
          name: account.name,
          connected: true,
          syncEnabled: account.syncConfig.enabled
        }
      });
    } catch (error) {
      console.error('Connection initialization error:', error);
      res.status(500).json({ 
        error: `Failed to initialize connection: ${error.message}`,
        account: {
          email,
          provider,
          name: account.name,
          connected: false
        }
      });
    }
  });

  /**
   * Get connection details
   */
  static getConnection = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    
    const account = await EmailAccount.findOne({ userId, email })
      .select('-credentials.password -tokens.accessToken -tokens.refreshToken');
    
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    const connection = ConnectionManager.getConnection(userId, email);
    
    const result = {
      email: account.email,
      provider: account.provider,
      name: account.name || account.email.split('@')[0],
      connected: !!connection,
      status: connection ? connection.status : 'disconnected',
      lastSync: account.stats?.lastSync || null,
      syncConfig: account.syncConfig || {},
      aiSettings: account.aiSettings || {},
      stats: account.stats || {},
      folders: account.folders || []
    };
    
    res.json(result);
  });

  /**
   * Update connection settings
   */
  static updateConnection = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const updates = req.body;
    
    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    // Prevent updating certain fields
    delete updates.email;
    delete updates.userId;
    delete updates.provider;
    delete updates.tokens;
    delete updates.credentials;
    
    // Apply updates
    Object.assign(account, updates);
    await account.save();
    
    // Update connection config if active
    await ConnectionManager.updateConnectionConfig(userId, email, updates);
    
    res.json({
      success: true,
      account: {
        email: account.email,
        provider: account.provider,
        name: account.name,
        syncConfig: account.syncConfig,
        aiSettings: account.aiSettings
      }
    });
  });

  /**
   * Delete connection
   */
  static deleteConnection = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    
    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    // Stop connection if active
    await ConnectionManager.stopConnection(userId, email);
    
    // Remove from database
    await EmailAccount.deleteOne({ userId, email });
    
    // Also remove from user's connectedEmails array
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email } }
    });
    
    res.json({
      success: true,
      message: `Email ${email} has been disconnected and removed`
    });
  });

  /**
   * Check emails now
   */
  static checkEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    
    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    try {
      const result = await ConnectionManager.checkEmails(userId, email);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: result.error || 'Failed to check emails'
        });
      }
      
      res.json({
        success: true,
        message: `Checked emails for ${email}`,
        count: result.count,
        lastSync: result.lastSync
      });
    } catch (error) {
      console.error('Error checking emails:', error);
      res.status(500).json({ error: `Error checking emails: ${error.message}` });
    }
  });

  /**
   * Sync emails (full sync)
   */
  static syncEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    
    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    try {
      // This will be a background job
      ConnectionManager.startFullSync(userId, email);
      
      res.json({
        success: true,
        message: `Full sync started for ${email}`,
        syncJobId: `sync-${Date.now()}`
      });
    } catch (error) {
      console.error('Error starting sync:', error);
      res.status(500).json({ error: `Error starting sync: ${error.message}` });
    }
  });

  /**
   * Toggle connection status (pause/resume)
   */
  static toggleConnectionStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { enabled } = req.body;
    
    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    // Update database
    account.syncConfig = account.syncConfig || {};
    account.syncConfig.enabled = enabled;
    await account.save();
    
    // Update connection
    await ConnectionManager.updateConnectionConfig(userId, email, {
      syncConfig: account.syncConfig
    });
    
    res.json({
      success: true,
      email,
      status: enabled ? 'active' : 'paused'
    });
  });
}

export default ConnectionController;
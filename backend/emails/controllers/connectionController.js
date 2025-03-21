import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels from '../../models/ConnectedEmailModels.js';
import User from '../../models/User.js';
import ConnectionManager from '../managers/connectionManager.js';
import { asyncHandler } from '../utils/errorHandler.js';

class ConnectionController {
  /**
   * List all connected emails for a user
   */
  static listConnections = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const accounts = await ConnectedEmail.find({ userId }).select('-credentials.password -tokens');
    const activeConnections = ConnectionManager.getUserConnections(userId);
    
    // Merge account data with connection status
    const connections = accounts.map(account => ({
      email: account.email,
      provider: account.provider,
      name: account.name,
      connected: !!activeConnections.find(conn => conn.email === account.email),
      status: account.status,
      lastSync: account.stats?.lastSync || null,
      syncEnabled: account.syncConfig?.enabled ?? true,
      folders: account.syncConfig?.folders || ['INBOX'],
      aiEnabled: account.aiSettings?.enabled ?? false,
      aiMode: account.aiSettings?.mode || 'auto'
    }));
    
    res.json(connections);
  });

  /**
   * Add a new connection
   */
  static addConnection = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { provider, email, credentials, tokens, syncConfig, name } = req.body;
    
    // Check if connection already exists
    const existingAccount = await ConnectedEmail.findOne({ userId, email });
    if (existingAccount) {
      return res.status(400).json({ error: 'Email already connected' });
    }
    
    // Create new connected email account
    const account = new ConnectedEmail({
      userId,
      provider,
      email,
      name: name || email.split('@')[0],
      credentials: provider === 'custom' ? credentials : undefined,
      tokens: provider !== 'custom' ? tokens : undefined,
      syncConfig: syncConfig || {
        enabled: true,
        folders: ['INBOX'],
        interval: 60
      },
      aiSettings: {
        enabled: false,
        mode: 'auto',
        responseTemplates: []
      },
      status: 'disconnected'
    });
    
    await account.save();

    // Initialize the models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

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
      
      // Update connection status
      account.status = 'active';
      await account.save();
      
      res.status(201).json({
        success: true,
        account: {
          email,
          provider,
          name: account.name,
          connected: true,
          syncEnabled: account.syncConfig.enabled,
          status: 'active'
        }
      });
    } catch (error) {
      console.error('Connection initialization error:', error);
      
      // Update error status
      account.status = 'error';
      account.lastError = {
        message: error.message,
        date: new Date(),
        code: error.code || 'CONN_INIT_ERROR'
      };
      await account.save();
      
      res.status(500).json({ 
        error: `Failed to initialize connection: ${error.message}`,
        account: {
          email,
          provider,
          name: account.name,
          connected: false,
          status: 'error'
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
    
    const account = await ConnectedEmail.findOne({ userId, email })
      .select('-credentials.password -tokens');
    
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    const connection = ConnectionManager.getConnection(userId, email);
    
    const result = {
      email: account.email,
      provider: account.provider,
      name: account.name,
      connected: !!connection,
      status: account.status,
      lastSync: account.stats?.lastSync || null,
      syncConfig: account.syncConfig || {},
      aiSettings: account.aiSettings || {},
      stats: account.stats || {}
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
    
    const account = await ConnectedEmail.findOne({ userId, email });
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
    if (account.status === 'active') {
      await ConnectionManager.updateConnectionConfig(userId, email, updates);
    }
    
    res.json({
      success: true,
      account: {
        email: account.email,
        provider: account.provider,
        name: account.name,
        status: account.status,
        syncConfig: account.syncConfig,
        aiSettings: account.aiSettings
      }
    });
  });

  /**
   * Delete connection and associated data
   */
  static deleteConnection = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    // Stop connection if active
    if (account.status === 'active') {
      await ConnectionManager.stopConnection(userId, email);
    }
    
    // Get the models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Delete all data for this email account
    await Promise.all([
      // Delete the connection record
      ConnectedEmail.deleteOne({ _id: account._id }),
      
      // Delete all emails, drafts, and sent emails
      emailModels.Email.collection.drop().catch(() => {}),
      emailModels.Draft.collection.drop().catch(() => {}),
      emailModels.Sent.collection.drop().catch(() => {})
    ]);
    
    res.json({
      success: true,
      message: `Email ${email} has been disconnected and all data removed`
    });
  });

    /**
   * Check for new emails
   */
 static checkEmails = async (userId, email) => {
    try {
      // Use await to ensure we get a promise resolution for the connection
      const connection = await getConnection(userId, email);
      
      if (!connection || !connection.connection) {
        console.log(`No active connection found for ${email}, attempting to reinitialize...`);
        
        // Try to get the ConnectedEmail record and reinitialize it
        const connectedEmail = await ConnectedEmail.findOne({ 
          userId, 
          email,
          'tokens.refreshToken': { $exists: true }
        });
        
        if (connectedEmail) {
          console.log(`Found database record for ${email}, reinitializing connection...`);
          await initializeEmailConnection(connectedEmail);
          
          // Try again with the newly initialized connection
          const refreshedConnection = await getConnection(userId, email);
          if (!refreshedConnection || !refreshedConnection.connection) {
            throw new Error('No active connection found after reinitialization attempt');
          }
          
          console.log(`Successfully reinitialized connection for ${email}`);
          // Continue with the refreshed connection
          const service = await getEmailService(refreshedConnection.provider);
          
          // Rest of the function with refreshedConnection
          let newEmails = [];
          if (refreshedConnection.provider === 'google') {
            newEmails = await service.checkForNewGoogleEmails(
              refreshedConnection.connection.gmail,
              userId,
              email
            );
          } else {
            throw new Error(`Unsupported provider: ${refreshedConnection.provider}`);
          }
          
          // Update last sync time
          await updateLastSync(userId, email);
          
          return {
            success: true,
            count: newEmails.length,
            emails: newEmails
          };
        } else {
          throw new Error('No active connection found');
        }
      }
  
      // Get the appropriate email service
      const service = await getEmailService(connection.provider);
      
      // Dispatch to the correct check method
      let newEmails = [];
      if (connection.provider === 'google') {
        newEmails = await service.checkForNewGoogleEmails(
          connection.connection.gmail,
          userId,
          email
        );
      } else {
        throw new Error(`Unsupported provider: ${connection.provider}`);
      }
      
      // Update last sync time
      await updateLastSync(userId, email);
  
      return {
        success: true,
        count: newEmails.length,
        emails: newEmails
      };
    } catch (error) {
      console.error(`Error checking emails for ${email}:`, error);
      // Update error status in database
      try {
        await ConnectedEmail.findOneAndUpdate(
          { userId, email },
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
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * Sync emails (full sync)
   */
  static syncEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    try {
      // This will be a background job
      ConnectionManager.startFullSync(userId, email);
      
      // Update sync start in stats
      account.stats = account.stats || {};
      account.stats.lastSync = new Date();
      await account.save();
      
      res.json({
        success: true,
        message: `Full sync started for ${email}`,
        syncJobId: `sync-${Date.now()}`
      });
    } catch (error) {
      console.error('Error starting sync:', error);
      
      // Update error status
      account.lastError = {
        message: error.message,
        date: new Date(),
        code: 'SYNC_START_ERROR'
      };
      await account.save();
      
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
    
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    // Update sync config
    account.syncConfig = account.syncConfig || {};
    account.syncConfig.enabled = enabled;
    account.status = enabled ? 'active' : 'paused';
    await account.save();
    
    // Update connection if exists
    if (account.status === 'active') {
      await ConnectionManager.updateConnectionConfig(userId, email, {
        syncConfig: account.syncConfig
      });
    }
    
    res.json({
      success: true,
      email,
      status: account.status
    });
  });
}

export default ConnectionController;

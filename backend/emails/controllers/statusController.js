import EmailAccount from '../../models/ConnectedEmailModels.js';
import ConnectionManager from '../managers/connectionManager.js';
import MonitoringManager from '../managers/monitoringManager.js';
import { asyncHandler } from '../utils/errorHandler.js';

class StatusController {
  /**
   * Get overview of all email accounts status
   */
  static getStatusOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const accounts = await EmailAccount.find({ userId });
    const overview = await Promise.all(accounts.map(async (account) => {
      const connection = ConnectionManager.getConnection(userId, account.email);
      
      return {
        email: account.email,
        provider: account.provider,
        status: connection ? connection.status : 'disconnected',
        syncEnabled: account.syncConfig?.enabled ?? true,
        lastSync: account.stats?.lastSync || null,
        isConnected: !!connection,
        errors: account.stats?.failedAttempts || 0,
        processedEmails: account.stats?.processedEmails || 0
      };
    }));
    
    res.json({
      totalAccounts: accounts.length,
      activeConnections: overview.filter(acc => acc.isConnected).length,
      accounts: overview
    });
  });

  /**
   * Get detailed status for specific email
   */
  static getEmailStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    
    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: 'Email account not found' });
    }
    
    const connection = ConnectionManager.getConnection(userId, email);
    const monitoringStats = connection ? MonitoringManager.getConnectionMonitoring(userId, email) : null;
    
    const result = {
      email: account.email,
      provider: account.provider,
      status: connection ? connection.status : 'disconnected',
      syncConfig: account.syncConfig || {},
      lastSync: account.stats?.lastSync || null,
      isConnected: !!connection,
      uptime: connection ? (Date.now() - connection.startTime.getTime()) / 1000 / 60 : 0,
      errors: account.stats?.failedAttempts || 0,
      processedEmails: account.stats?.processedEmails || 0,
      monitoring: monitoringStats || { status: 'not_monitored' },
      aiMode: account.aiSettings?.mode || 'off'
    };
    
    res.json(result);
  });

  /**
   * Get system stats
   */
  static getSystemStats = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const activeConnections = ConnectionManager.getAllConnections();
    const monitoringStatus = MonitoringManager.getMonitoringStatus();
    
    const stats = {
      totalConnections: activeConnections.length,
      activeConnections: activeConnections.filter(c => c.status === 'active').length,
      errorConnections: activeConnections.filter(c => c.status === 'error').length,
      monitoringStatus: {
        healthy: monitoringStatus.filter(m => m.status === 'healthy').length,
        warning: monitoringStatus.filter(m => m.status === 'warning').length,
        error: monitoringStatus.filter(m => m.status === 'error').length,
        stalled: monitoringStatus.filter(m => m.status === 'stalled').length
      },
      systemLoad: {
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    res.json(stats);
  });

  /**
   * Get monitoring logs
   */
  static getMonitoringLogs = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { limit = 100 } = req.query;
    
    const logs = MonitoringManager.getUserLogs(userId, parseInt(limit));
    
    res.json({
      count: logs.length,
      logs
    });
  });

  /**
   * Check health of connections
   */
  static checkConnectionsHealth = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const accounts = await EmailAccount.find({ userId }).select('email provider');
    const results = await Promise.all(accounts.map(async (account) => {
      try {
        const result = await ConnectionManager.checkHealth(userId, account.email);
        return {
          email: account.email,
          healthy: result.healthy,
          status: result.status,
          message: result.message
        };
      } catch (error) {
        return {
          email: account.email,
          healthy: false,
          status: 'error',
          message: error.message
        };
      }
    }));
    
    res.json({
      timestamp: new Date(),
      results
    });
  });
}

export default StatusController;
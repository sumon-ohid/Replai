/**
 * Monitoring Manager
 * 
 * Handles monitoring of email connections, with health checks and logging
 */

// Store monitoring data in memory (could be moved to Redis in production)
const monitoringStore = {
  connections: new Map(),
  logs: new Map(),
  globalStats: {
    totalConnections: 0,
    healthyConnections: 0,
    warningConnections: 0,
    errorConnections: 0,
    monitoringStart: new Date()
  }
};

class MonitoringManager {
  /**
   * Register a connection for monitoring
   * @param {string} userId - User ID
   * @param {string} email - Email address
   * @param {Object} config - Monitoring configuration
   */
  static registerConnection(userId, email, config = {}) {
    const key = `${userId}:${email}`;
    
    if (!monitoringStore.connections.has(key)) {
      monitoringStore.globalStats.totalConnections++;
    }
    
    monitoringStore.connections.set(key, {
      userId,
      email,
      status: 'initializing',
      lastCheck: new Date(),
      lastStatus: null,
      config: {
        checkInterval: config.checkInterval || 60000, // 1 minute
        warningThreshold: config.warningThreshold || 180000, // 3 minutes
        errorThreshold: config.errorThreshold || 600000, // 10 minutes
        ...config
      },
      stats: {
        checkCount: 0,
        successCount: 0,
        warningCount: 0,
        errorCount: 0,
        lastError: null
      },
      history: []
    });
    
    // Initialize log array for this user if it doesn't exist
    if (!monitoringStore.logs.has(userId)) {
      monitoringStore.logs.set(userId, []);
    }
    
    this.addLog(userId, 'info', `Started monitoring connection for ${email}`);
    
    return true;
  }
  
  /**
   * Update connection status
   * @param {string} userId - User ID
   * @param {string} email - Email address
   * @param {string} status - Status ('healthy', 'warning', 'error', 'stalled')
   * @param {string} message - Optional status message
   */
  static updateConnectionStatus(userId, email, status, message = '') {
    const key = `${userId}:${email}`;
    const monitoring = monitoringStore.connections.get(key);
    
    if (!monitoring) {
      return false;
    }
    
    const previousStatus = monitoring.status;
    monitoring.lastStatus = previousStatus;
    monitoring.status = status;
    monitoring.lastCheck = new Date();
    monitoring.message = message;
    
    // Update stats
    monitoring.stats.checkCount++;
    
    switch (status) {
      case 'healthy':
        monitoring.stats.successCount++;
        break;
      case 'warning':
        monitoring.stats.warningCount++;
        break;
      case 'error':
      case 'stalled':
        monitoring.stats.errorCount++;
        monitoring.stats.lastError = { date: new Date(), message };
        break;
    }
    
    // Add to history (keeping last 50 entries)
    monitoring.history.unshift({
      timestamp: new Date(),
      status,
      message: message || null
    });
    
    if (monitoring.history.length > 50) {
      monitoring.history = monitoring.history.slice(0, 50);
    }
    
    // Add log if status changed
    if (previousStatus !== status) {
      const logLevel = status === 'healthy' ? 'info' : (status === 'warning' ? 'warning' : 'error');
      this.addLog(userId, logLevel, `Connection ${email} status changed from ${previousStatus} to ${status}${message ? ': ' + message : ''}`);
      
      // Update global stats
      this.updateGlobalStats();
    }
    
    return true;
  }
  
  /**
   * Get connection monitoring data
   * @param {string} userId - User ID
   * @param {string} email - Email address
   */
  static getConnectionMonitoring(userId, email) {
    const key = `${userId}:${email}`;
    return monitoringStore.connections.get(key) || null;
  }
  
  /**
   * Check if monitoring is healthy
   * @param {string} userId - User ID
   * @param {string} email - Email address
   */
  static isMonitoringHealthy(userId, email) {
    const monitoring = this.getConnectionMonitoring(userId, email);
    
    if (!monitoring) {
      return false;
    }
    
    return monitoring.status === 'healthy';
  }
  
  /**
   * Add a log entry
   * @param {string} userId - User ID
   * @param {string} level - Log level ('info', 'warning', 'error')
   * @param {string} message - Log message
   */
  static addLog(userId, level, message) {
    if (!monitoringStore.logs.has(userId)) {
      monitoringStore.logs.set(userId, []);
    }
    
    const userLogs = monitoringStore.logs.get(userId);
    
    userLogs.unshift({
      timestamp: new Date(),
      level,
      message
    });
    
    // Keep logs to a reasonable size (last 1000 entries)
    if (userLogs.length > 1000) {
      monitoringStore.logs.set(userId, userLogs.slice(0, 1000));
    }
    
    // Also log to console for debugging
    const logPrefix = `[Monitoring][${level.toUpperCase()}][User: ${userId}]`;
    switch (level) {
      case 'error':
        console.error(`${logPrefix} ${message}`);
        break;
      case 'warning':
        console.warn(`${logPrefix} ${message}`);
        break;
      default:
        console.log(`${logPrefix} ${message}`);
    }
    
    return true;
  }
  
  /**
   * Get logs for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of logs to return
   */
  static getUserLogs(userId, limit = 100) {
    const userLogs = monitoringStore.logs.get(userId) || [];
    return userLogs.slice(0, limit);
  }
  
  /**
   * Get overall monitoring status
   */
  static getMonitoringStatus() {
    const result = [];
    
    for (const [key, monitoring] of monitoringStore.connections) {
      const [userId, email] = key.split(':');
      
      result.push({
        userId,
        email,
        status: monitoring.status,
        lastCheck: monitoring.lastCheck,
        message: monitoring.message || null,
        stats: {
          checkCount: monitoring.stats.checkCount,
          successRate: monitoring.stats.checkCount > 0 
            ? (monitoring.stats.successCount / monitoring.stats.checkCount * 100).toFixed(2) + '%'
            : 'N/A'
        }
      });
    }
    
    return result;
  }
  
  /**
   * Update global monitoring statistics
   */
  static updateGlobalStats() {
    let healthy = 0;
    let warning = 0;
    let error = 0;
    
    for (const monitoring of monitoringStore.connections.values()) {
      switch (monitoring.status) {
        case 'healthy':
          healthy++;
          break;
        case 'warning':
          warning++;
          break;
        case 'error':
        case 'stalled':
          error++;
          break;
      }
    }
    
    monitoringStore.globalStats.healthyConnections = healthy;
    monitoringStore.globalStats.warningConnections = warning;
    monitoringStore.globalStats.errorConnections = error;
    
    return monitoringStore.globalStats;
  }
  
  /**
   * Get global monitoring statistics
   */
  static getGlobalStats() {
    return {
      ...monitoringStore.globalStats,
      uptime: (Date.now() - monitoringStore.globalStats.monitoringStart.getTime()) / 1000 / 60
    };
  }
  
  /**
   * Clear monitoring data for a user
   * @param {string} userId - User ID
   */
  static clearUserMonitoring(userId) {
    const keysToRemove = [];
    
    for (const key of monitoringStore.connections.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      monitoringStore.connections.delete(key);
    });
    
    monitoringStore.logs.delete(userId);
    
    // Update global stats
    this.updateGlobalStats();
    
    return keysToRemove.length;
  }
  
  /**
   * Start periodic health checks
   */
  static startPeriodicHealthChecks() {
    // This would be implemented to run periodic health checks
    // on all monitored connections
    console.log('Starting periodic health checks');
  }
}

export default MonitoringManager;
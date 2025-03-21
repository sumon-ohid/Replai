import dotenv from 'dotenv';

dotenv.config();

/**
 * Email processing configuration
 * Contains email handling settings, sync intervals, and processing options
 */
const emailConfig = {
  // General configuration
  general: {
    dashboard_url: process.env.DASHBOARD_URL || 'http://localhost:3001/email-manager',
    api_base_url: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
    app_name: process.env.APP_NAME || 'Replai.tech',
    support_email: process.env.SUPPORT_EMAIL || 'support@replai.tech'
  },
  
  // Sync settings
  sync: {
    // How often to check for new emails (in milliseconds)
    interval: process.env.EMAIL_SYNC_INTERVAL ? parseInt(process.env.EMAIL_SYNC_INTERVAL, 10) : 60000,
    // Maximum emails to fetch in each sync
    batchSize: process.env.EMAIL_SYNC_BATCH_SIZE ? parseInt(process.env.EMAIL_SYNC_BATCH_SIZE, 10) : 10,
    // How far back to look for emails (in days)
    lookbackDays: process.env.EMAIL_SYNC_LOOKBACK_DAYS ? parseInt(process.env.EMAIL_SYNC_LOOKBACK_DAYS, 10) : 7,
    // Enable verbose logging for sync operations
    verboseLogging: process.env.EMAIL_SYNC_VERBOSE_LOGGING === 'true',
    // Whether to automatically reconnect on server startup
    autoReconnect: process.env.EMAIL_AUTO_RECONNECT !== 'false'
  },
  
  // AI processing settings
  processing: {
    // Default model to use for AI processing
    defaultModel: process.env.DEFAULT_AI_MODEL || 'gemini-1.5-flash',
    // Alternative models
    alternativeModels: {
      basic: 'gemini-1.0-pro',
      advanced: 'gemini-1.5-pro',
      fast: 'gemini-1.5-flash'
    },
    // Gemini API key
    geminiApiKey: process.env.GENERATIVE_AI_API_KEY,
    // OpenAI API key (fallback if needed)
    openaiApiKey: process.env.OPENAI_API_KEY,
    // Maximum length for email processing
    maxInputLength: 15000,
    // Default temperature for AI completions
    temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
    // Maximum response tokens
    maxOutputTokens: process.env.AI_MAX_OUTPUT_TOKENS ? parseInt(process.env.AI_MAX_OUTPUT_TOKENS, 10) : 1000
  },
  
  // Default email folders
  folders: {
    incoming: 'inbox',
    sent: 'sent',
    drafts: 'drafts',
    trash: 'trash',
    spam: 'spam',
    archived: 'archive'
  },
  
  // Operating modes
  modes: {
    // Default operation mode
    default: process.env.DEFAULT_EMAIL_MODE || 'auto_reply',
    options: [
      'auto_reply',  // Automatically reply to emails
      'draft_only',  // Create drafts but don't send
      'read_only',   // Just read emails, no actions
      'paused'       // No syncing or processing
    ]
  },
  
  // Retry policies
  retry: {
    // Max retries for failed operations
    maxAttempts: 3,
    // Base delay between retries (ms)
    baseDelay: 1000,
    // Maximum delay between retries (ms)
    maxDelay: 30000
  },
  
  // Content limits
  limits: {
    // Maximum email size to process (in bytes)
    maxEmailSize: 10 * 1024 * 1024, // 10MB
    // Maximum number of emails to process per user per day
    maxDailyEmails: process.env.MAX_DAILY_EMAILS ? parseInt(process.env.MAX_DAILY_EMAILS, 10) : 100,
    // Maximum size of email batch to process at once
    maxBatchSize: 10
  },
  
  // Stats tracking options
  stats: {
    // Whether to track detailed analytics
    trackDetailed: true,
    // Metrics to track
    metrics: [
      'emailsProcessed',
      'responsesGenerated',
      'responseTime',
      'processingTime',
      'sentimentDistribution',
      'categoryDistribution'
    ],
    // Track email stats by time periods
    timePeriods: [
      'daily',
      'weekly',
      'monthly',
      'allTime'
    ]
  },
  
  // Rate limiting to prevent abuse
  rateLimits: {
    // Maximum API requests per minute
    requestsPerMinute: process.env.API_RATE_LIMIT ? parseInt(process.env.API_RATE_LIMIT, 10) : 100,
    // Maximum emails to process per minute
    emailsPerMinute: process.env.EMAILS_RATE_LIMIT ? parseInt(process.env.EMAILS_RATE_LIMIT, 10) : 20
  },
  
  // Notification settings
  notifications: {
    // Send notifications for important events
    enabled: true,
    // Types of notifications to send
    types: [
      'connection_issues',
      'rate_limit_reached',
      'important_email_received',
      'service_disruption'
    ],
    // Notification channels
    channels: ['email', 'dashboard']
  },
  
  // Monitoring and alerting configuration
  monitoring: {
    // Enable monitoring
    enabled: process.env.ENABLE_MONITORING !== 'false',
    // Log level for monitoring
    logLevel: process.env.MONITORING_LOG_LEVEL || 'info',
    // Enable error tracking
    trackErrors: true,
    // Error thresholds
    errorThresholds: {
      critical: 10,
      warning: 5
    },
    // Performance metrics to track
    performanceMetrics: [
      'cpuUsage',
      'memoryUsage',
      'responseTime',
      'processingTime',
      'concurrentConnections'
    ],
    // Alert channels
    alertChannels: ['email', 'dashboard', 'log'],
    // Health check interval in milliseconds
    healthCheckInterval: process.env.HEALTH_CHECK_INTERVAL ? 
      parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) : 300000, // 5 minutes
    // Notification thresholds
    notificationThresholds: {
      // Failed connection attempts before alerting
      connectionFailures: 3,
      // Sync failures before alerting
      syncFailures: 5,
      // Processing errors before alerting
      processingErrors: 10,
      // API request failures before alerting
      apiRequestFailures: 5
    },
    // Whether to send detailed error reports
    detailedErrorReports: true,
    // Recovery strategies
    recovery: {
      // Whether to attempt automatic recovery
      attemptAutoRecovery: true,
      // Maximum auto recovery attempts
      maxRecoveryAttempts: 3,
      // Delay between recovery attempts (ms)
      recoveryDelay: 60000
    }
  },
  
  // Default templates for automated responses
  templates: {
    // Response signature format
    signature: 'Best regards,\n{{userName}}',
    // Out of office message
    outOfOffice: `I'm currently out of office until {{returnDate}} with limited email access. I will respond to your message when I return. For urgent matters, please contact {{alternateContact}}.`,
    // Default reply introduction
    defaultIntro: 'Thank you for your email. '
  }
};

/**
 * Get the monitoring configuration
 * @returns {Object} The monitoring configuration
 */
export const getMonitoringConfig = () => {
  return emailConfig.monitoring;
};

/**
 * Get the notification configuration
 * @returns {Object} The notification configuration
 */
export const getNotificationConfig = () => {
  return emailConfig.notifications;
};

/**
 * Get the retry policy configuration
 * @returns {Object} The retry policy configuration
 */
export const getRetryPolicy = () => {
  return emailConfig.retry;
};

/**
 * Get the sync configuration
 * @returns {Object} The sync configuration
 */
export const getSyncConfig = () => {
  return emailConfig.sync;
};

/**
 * Get the processing configuration
 * @returns {Object} The processing configuration
 */
export const getProcessingConfig = () => {
  return emailConfig.processing;
};

/**
 * Get the general configuration
 * @returns {Object} The general configuration
 */
export const getGeneralConfig = () => {
  return emailConfig.general;
};

/**
 * Get the modes configuration
 * @returns {Object} The modes configuration
 */
export const getModesConfig = () => {
  return emailConfig.modes;
};

export default emailConfig;
import mongoose from 'mongoose';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import { getMonitoringConfig } from '../config/emailConfig.js';

// Base notification schema - template for user-specific schemas
const baseNotificationSchema = {
  type: {
    type: String,
    enum: ['error', 'warning', 'info', 'success'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  email: String,
  metadata: Object,
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d' // TTL index for automatic cleanup
  }
};

// Cache for user-specific notification models
const userNotificationModels = new Map();

class NotificationManager {
    /**
   * Get or create user-specific notification model
   * @param {string} userId - The user ID
   * @returns {mongoose.Model} - The notification model for this user
   */
  static getUserNotificationModel(userId) {
    // Ensure userId is a string, not an object
    const userIdStr = typeof userId === 'object' ? 
      (userId._id ? userId._id.toString() : 'unknown') : 
      String(userId);
    
    // Check if model already exists in cache
    if (userNotificationModels.has(userIdStr)) {
      return userNotificationModels.get(userIdStr);
    }
  
    // Create collection name with user ID
    const collectionName = `notifications_${userIdStr}`;
    
    // Create schema with all the base properties
    const notificationSchema = new mongoose.Schema(baseNotificationSchema);
    
    // Create the model
    const NotificationModel = mongoose.model(
      collectionName, 
      notificationSchema,
      collectionName // Explicitly set collection name to ensure it's created correctly
    );
    
    // Cache the model
    userNotificationModels.set(userIdStr, NotificationModel);
    
    return NotificationModel;
  }

   /**
   * Create a new notification
   */
  static async createNotification({
    userId,
    type,
    title,
    message,
    email,
    metadata = {}
  }) {
    try {
      // Ensure userId is a valid string
      if (!userId || (typeof userId === 'object' && !userId._id)) {
        console.error('Invalid userId provided to createNotification:', userId);
        return null;
      }
      
      // Extract ID string if userId is an object
      const userIdStr = typeof userId === 'object' ? userId._id.toString() : String(userId);
      
      // Get the user-specific notification model
      const UserNotification = this.getUserNotificationModel(userIdStr);
      
      // Create notification in user-specific collection
      const notification = await UserNotification.create({
        type,
        title,
        message,
        email,
        metadata
      });
  
      // If critical error, trigger alerts
      if (type === 'error') {
        await this.handleCriticalError(notification, userIdStr, email);
      }
  
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  /**
   * Get user notifications with filters
   */
  static async getUserNotifications(userId, options = {}) {
    const {
      email,
      type,
      unreadOnly = false,
      limit = 50,
      skip = 0
    } = options;

    try {
      // Get the user-specific notification model
      const UserNotification = this.getUserNotificationModel(userId);
      
      const query = {};
      
      if (email) query.email = email;
      if (type) query.type = type;
      if (unreadOnly) query.read = false;

      const notifications = await UserNotification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return notifications;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(userId, notificationId) {
    try {
      // Get the user-specific notification model
      const UserNotification = this.getUserNotificationModel(userId);
      
      await UserNotification.findOneAndUpdate(
        { _id: notificationId },
        { $set: { read: true } }
      );
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(userId, email = null) {
    try {
      // Get the user-specific notification model
      const UserNotification = this.getUserNotificationModel(userId);
      
      const query = {};
      if (email) query.email = email;

      await UserNotification.updateMany(
        query,
        { $set: { read: true } }
      );
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications(userId) {
    try {
      // Get the user-specific notification model
      const UserNotification = this.getUserNotificationModel(userId);
      
      await UserNotification.deleteMany({});
      return true;
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      return false;
    }
  }

  /**
   * Handle critical error notifications
   */
  static async handleCriticalError(notification, userId, email) {
    try {
      const config = getMonitoringConfig();
      
      // Update account status if email-related
      if (email) {
        await ConnectedEmail.findOneAndUpdate(
          { email, userId },
          { 
            $set: { status: 'error' },
            $inc: { 'stats.errorCount': 1 }
          }
        );
      }

      // Send alerts if configured
      if (config.alertEndpoint) {
        await fetch(config.alertEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'email_system_error',
            userId,
            notification
          })
        });
      }

      // Log to monitoring system
      console.error('Critical Error:', {
        userId,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata
      });

      return true;
    } catch (error) {
      console.error('Failed to handle critical error:', error);
      return false;
    }
  }

  /**
   * Get notification stats for a user
   */
  static async getNotificationStats(userId, email = null) {
    try {
      // Get the user-specific notification model
      const UserNotification = this.getUserNotificationModel(userId);
      
      const query = {};
      if (email) query.email = email;

      const [
        total,
        unread,
        errors,
        warnings
      ] = await Promise.all([
        UserNotification.countDocuments(query),
        UserNotification.countDocuments({ ...query, read: false }),
        UserNotification.countDocuments({ ...query, type: 'error' }),
        UserNotification.countDocuments({ ...query, type: 'warning' })
      ]);

      return {
        total,
        unread,
        errors,
        warnings
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        total: 0,
        unread: 0,
        errors: 0,
        warnings: 0
      };
    }
  }

  /**
   * Clean up old notifications for all users
   * This should be run as a periodic cleanup task
   */
  static async cleanupAllNotifications() {
    try {
      // Get all collections that start with "notifications_"
      const collections = await mongoose.connection.db
        .listCollections({ name: /^notifications_/ })
        .toArray();
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Delete old notifications from each collection
      for (const collection of collections) {
        await mongoose.connection.db
          .collection(collection.name)
          .deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
      return false;
    }
  }
  
  /**
   * Clean up notifications for a specific user
   */
  static async cleanupUserNotifications(userId) {
    try {
      // Get the user-specific notification model
      const UserNotification = this.getUserNotificationModel(userId);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await UserNotification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });

      return true;
    } catch (error) {
      console.error(`Failed to cleanup notifications for user ${userId}:`, error);
      return false;
    }
  }
}

/**
 * Notify about email connection status
 * @param {Object} params
 * @param {string} params.userId - The user ID
 * @param {string} params.email - The email address
 * @param {string} params.status - Connection status (active, error, warning, info)
 * @param {string} params.message - Notification message
 * @param {Object} [params.metadata] - Additional data
 * @returns {Promise<Object|null>} The created notification or null on failure
 */
export const notifyConnectionStatus = async (params) => {
  try {
    const { userId, email, status, message, metadata = {} } = params;
    
    // Safety check - ensure valid userId
    if (!userId) {
      console.warn(`Invalid userId provided to notifyConnectionStatus: ${userId}`);
      return;
    }
    
    // Find the user to check if they exist
    const User = await import('../../models/User.js').then(m => m.default);
    const user = await User.findById(userId);
    
    if (!user) {
      console.warn(`User not found for ID: ${userId}`);
      return;
    }
    
    // Map status to notification type
    let type = 'info';
    let title = 'Email Connection Update';
    
    if (status === 'error') {
      type = 'error';
      title = 'Email Connection Error';
    } else if (status === 'warning') {
      type = 'warning';
      title = 'Email Connection Warning';
    } else if (status === 'active') {
      type = 'success';
      title = 'Email Connection Established';
    }
    
    const userIdStr = typeof userId === 'object' ? userId._id.toString() : String(userId);
    
    const notification = "";

    // const notification = await NotificationManager.createNotification({
    //   userId: userIdStr,
    //   type,
    //   title,
    //   message,
    //   email,
    //   metadata: {
    //     ...metadata,
    //     connectionStatus: status,
    //     timestamp: new Date().toISOString()
    //   }
    // });
    
    // Update email connection status in database if needed
    if (status === 'error' || status === 'active') {
      try {
        await ConnectedEmail.findOneAndUpdate(
          { email, userId: userIdStr },
          { $set: { status } }
        );
      } catch (dbError) {
        console.error(`Failed to update email account status: ${dbError.message}`);
      }
    }
    
    return notification;
  } catch (error) {
    console.error(`Failed to create connection status notification: ${error.message}`);
    return null;
  }
};

/**
 * Notify about connection errors.
 * @param {Object} params
 */
export const notifyConnectionError = async (params) => {
  const { userId, email, message } = params;
  await notifyConnectionStatus({
    userId,
    email,
    status: 'error',
    message,
  });
};

/**
 * Notify about connection success
 * @param {Object} params
 */
export const notifyConnectionSuccess = async (params) => {
  const { userId, email, message = 'Email connection established successfully' } = params;
  await notifyConnectionStatus({
    userId,
    email,
    status: 'active',
    message,
  });
};

/**
 * Notify about sync status
 * @param {Object} params
 */
export const notifySyncStatus = async (params) => {
  const { userId, email, success, emailsProcessed = 0, message } = params;
  
  await notifyConnectionStatus({
    userId,
    email,
    status: success ? 'info' : 'warning',
    message: message || (success 
      ? `Successfully synced ${emailsProcessed} emails` 
      : 'Email sync encountered issues'),
    metadata: { emailsProcessed }
  });
};

/**
 * Notify about rate limiting
 * @param {Object} params
 */
export const notifyRateLimited = async (params) => {
  const { userId, email, limit, resetTime } = params;
  
  await notifyConnectionStatus({
    userId,
    email,
    status: 'warning',
    message: `Rate limit reached for ${email}. Operations will resume at ${new Date(resetTime).toLocaleTimeString()}`,
    metadata: { limit, resetTime }
  });
};

export default NotificationManager;
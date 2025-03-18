import mongoose from 'mongoose';
import EmailAccount from '../../models/emailSchema.js';
import { getMonitoringConfig } from '../config/emailConfig.js';

// Define notification schema
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
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
});

// Create model if it doesn't exist
const Notification = mongoose.models.Notification || 
  mongoose.model('Notification', notificationSchema);

class NotificationManager {
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
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        email,
        metadata
      });

      // If critical error, trigger alerts
      if (type === 'error') {
        await this.handleCriticalError(notification);
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
      const query = { userId };
      
      if (email) query.email = email;
      if (type) query.type = type;
      if (unreadOnly) query.read = false;

      const notifications = await Notification.find(query)
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
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
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
      const query = { userId };
      if (email) query.email = email;

      await Notification.updateMany(
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
      await Notification.deleteMany({ userId });
      return true;
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      return false;
    }
  }

  /**
   * Handle critical error notifications
   */
  static async handleCriticalError(notification) {
    try {
      const config = getMonitoringConfig();
      
      // Update account status if email-related
      if (notification.email) {
        await EmailAccount.findOneAndUpdate(
          { email: notification.email },
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
            notification
          })
        });
      }

      // Log to monitoring system
      console.error('Critical Error:', {
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
      const query = { userId };
      if (email) query.email = email;

      const [
        total,
        unread,
        errors,
        warnings
      ] = await Promise.all([
        Notification.countDocuments(query),
        Notification.countDocuments({ ...query, read: false }),
        Notification.countDocuments({ ...query, type: 'error' }),
        Notification.countDocuments({ ...query, type: 'warning' })
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
   * Clean up old notifications
   */
  static async cleanupNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });

      return true;
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
      return false;
    }
  }
}

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

export default NotificationManager;

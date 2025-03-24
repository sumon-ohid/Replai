import express from 'express';
import auth from '../../middleware/auth.js';
import NotificationManager from '../managers/notificationManager.js';

const router = express.Router();

/**
 * @route GET /api/notifications
 * @desc Get user notifications
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      email,
      type,
      unreadOnly,
      limit = 50,
      skip = 0
    } = req.query;

    // Parse boolean from string query parameter
    const unreadOnlyBool = unreadOnly === 'true';
    
    const notifications = await NotificationManager.getUserNotifications(
      userId,
      {
        email,
        type,
        unreadOnly: unreadOnlyBool,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    );
    
    // Get total counts for notification badge
    const stats = await NotificationManager.getNotificationStats(userId);
    
    res.status(200).json({
      success: true,
      data: notifications,
      stats
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve notifications',
      error: error.message 
    });
  }
});

/**
 * @route POST /api/notifications/mark-read/:id
 * @desc Mark a notification as read
 * @access Private
 */
router.post('/mark-read/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;
    
    await NotificationManager.markNotificationAsRead(userId, notificationId);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read',
      error: error.message 
    });
  }
});

/**
 * @route POST /api/notifications/mark-all-read
 * @desc Mark all notifications as read
 * @access Private
 */
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { email } = req.body;
    
    await NotificationManager.markAllNotificationsAsRead(userId, email);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all notifications as read',
      error: error.message 
    });
  }
});

/**
 * @route POST /api/notifications/clear-all
 * @desc Clear all notifications
 * @access Private
 */
router.post('/clear-all', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    await NotificationManager.clearAllNotifications(userId);
    
    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear notifications',
      error: error.message 
    });
  }
});

/**
 * @route POST /api/notifications/test
 * @desc Create a test notification (development only)
 * @access Private
 */
router.post('/test', auth, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        success: false, 
        message: 'Test notifications not allowed in production' 
      });
    }
    
    const userId = req.user._id;
    const { type = 'info', title, message, email } = req.body;
    
    const notification = await NotificationManager.createNotification({
      userId,
      type,
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      email,
      metadata: { test: true, timestamp: new Date().toISOString() }
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create test notification',
      error: error.message 
    });
  }
});

export default router;
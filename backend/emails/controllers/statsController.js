import mongoose from 'mongoose';
import getEmailModel from '../../models/ConnectedEmailModels.js';
import getSentEmailModel from '../../models/SentEmail.js';
import getDraftModel from '../../models/Draft.js';
import User from '../../models/User.js';

/**
 * Helper function to get date range based on timeRange parameter
 */
const getDateRange = (timeRange) => {
  const now = new Date();
  const startDate = new Date();
  const previousStartDate = new Date();
  const previousEndDate = new Date();
  
  switch (timeRange) {
    case 'daily':
      // Current day (midnight to now)
      startDate.setHours(0, 0, 0, 0);
      
      // Previous day (previous midnight to previous midnight)
      previousStartDate.setDate(now.getDate() - 1);
      previousStartDate.setHours(0, 0, 0, 0);
      previousEndDate.setDate(now.getDate() - 1);
      previousEndDate.setHours(23, 59, 59, 999);
      break;
      
    case 'week':
      // Current week (starting from Monday)
      const dayOfWeek = startDate.getDay() || 7; // Convert Sunday (0) to 7
      const daysToMonday = dayOfWeek - 1;
      startDate.setDate(startDate.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);
      
      // Previous week (previous Monday to previous Sunday)
      previousStartDate.setDate(startDate.getDate() - 7);
      previousEndDate.setDate(startDate.getDate() - 1);
      previousEndDate.setHours(23, 59, 59, 999);
      break;
      
    case 'month':
      // Current month (1st of this month to now)
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      // Previous month
      previousStartDate.setMonth(startDate.getMonth() - 1);
      previousStartDate.setDate(1);
      previousEndDate.setFullYear(startDate.getFullYear(), startDate.getMonth(), 0);
      previousEndDate.setHours(23, 59, 59, 999);
      break;
      
    case 'year':
      // Current year (Jan 1st to now)
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      
      // Previous year
      previousStartDate.setFullYear(startDate.getFullYear() - 1, 0, 1);
      previousEndDate.setFullYear(startDate.getFullYear() - 1, 11, 31);
      previousEndDate.setHours(23, 59, 59, 999);
      break;
      
    default:
      // Default to week
      const defaultDayOfWeek = startDate.getDay() || 7;
      const defaultDaysToMonday = defaultDayOfWeek - 1;
      startDate.setDate(startDate.getDate() - defaultDaysToMonday);
      startDate.setHours(0, 0, 0, 0);
      
      previousStartDate.setDate(startDate.getDate() - 7);
      previousEndDate.setDate(startDate.getDate() - 1);
      previousEndDate.setHours(23, 59, 59, 999);
  }
  
  return { 
    currentPeriod: { startDate, endDate: now },
    previousPeriod: { startDate: previousStartDate, endDate: previousEndDate }
  };
};

/**
 * Helper to calculate percentage change with proper handling of edge cases
 */
const calculatePercentChange = (previous, current) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Helper to calculate average response time with better formatting
 */
const calculateAvgResponseTime = (responseTimes) => {
  if (!responseTimes || responseTimes.length === 0) return { value: 0, formatted: "0s" };
  
  const totalSecs = responseTimes.reduce((sum, time) => sum + time, 0) / 1000;
  const avgSecs = totalSecs / responseTimes.length;
  
  // Format based on size
  if (avgSecs < 60) {
    return { value: avgSecs * 1000, formatted: `${Math.round(avgSecs)}s` };
  } else if (avgSecs < 3600) {
    const mins = Math.floor(avgSecs / 60);
    const secs = Math.round(avgSecs % 60);
    return { value: avgSecs * 1000, formatted: `${mins}m ${secs}s` };
  } else {
    const hrs = Math.floor(avgSecs / 3600);
    const mins = Math.floor((avgSecs % 3600) / 60);
    return { value: avgSecs * 1000, formatted: `${hrs}h ${mins}m` };
  }
};

/**
 * Get basic stats (total counts)
 */
export const getBasicStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const SentEmail = getSentEmailModel(userId);
    const Email = getEmailModel(userId);
    
    // Get total counts
    const totalEmails = await Email.countDocuments({ userId });
    const processedEmails = await Email.countDocuments({ userId, processed: true });
    const automatedResponses = await SentEmail.countDocuments({ userId, autoResponded: true });
    
    res.json({
      totalEmails,
      processedEmails,
      automatedResponses
    });
  } catch (error) {
    console.error('Error fetching basic stats:', error);
    res.status(500).send('Error fetching stats');
  }
};

/**
 * Get comprehensive stats for dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }
    
    const timeRange = req.query.range || 'week';
    
    const SentEmail = getSentEmailModel(userId);
    const Email = getEmailModel(userId);
    const Draft = getDraftModel(userId);
    
    // Get date ranges for current and previous periods
    const { currentPeriod, previousPeriod } = getDateRange(timeRange);
    
    // Optional debugging
    // if (process.env.NODE_ENV !== 'production') {
    //   console.log('Current period:', {
    //     start: currentPeriod.startDate.toISOString(),
    //     end: currentPeriod.endDate.toISOString()
    //   });
    //   console.log('Previous period:', {
    //     start: previousPeriod.startDate.toISOString(),
    //     end: previousPeriod.endDate.toISOString()
    //   });
    // }
    
    // CURRENT PERIOD METRICS
    // 1. Emails Processed (all emails received)
    const currentEmailsProcessed = await Email.countDocuments({
      userId,
      createdAt: { $gte: currentPeriod.startDate, $lte: currentPeriod.endDate }
    });
    
    // 2. Auto-Responses (sent automatically)
    const currentAutoResponses = await SentEmail.countDocuments({
      userId,
      dateSent: { $gte: currentPeriod.startDate, $lte: currentPeriod.endDate },
      autoResponded: true
    });
    
    // 3. Drafts Saved
    const currentDraftsSaved = await Draft.countDocuments({
      userId,
      createdAt: { $gte: currentPeriod.startDate, $lte: currentPeriod.endDate }
    });
    
    // 4. Response Time Data
    const responseTimeData = await SentEmail.find({
      userId,
      dateSent: { $gte: currentPeriod.startDate, $lte: currentPeriod.endDate },
      responseTime: { $exists: true, $ne: null }
    }).select('responseTime');
    
    const currentResponseTimes = responseTimeData
      .map(email => email.responseTime || 0)
      .filter(time => time > 0);
    
    const currentAvgResponseTime = calculateAvgResponseTime(currentResponseTimes);
    
    // PREVIOUS PERIOD METRICS
    // 1. Emails Processed
    const previousEmailsProcessed = await Email.countDocuments({
      userId,
      createdAt: { $gte: previousPeriod.startDate, $lte: previousPeriod.endDate }
    });
    
    // 2. Auto-Responses
    const previousAutoResponses = await SentEmail.countDocuments({
      userId,
      dateSent: { $gte: previousPeriod.startDate, $lte: previousPeriod.endDate },
      autoResponded: true
    });
    
    // 3. Drafts Saved
    const previousDraftsSaved = await Draft.countDocuments({
      userId,
      createdAt: { $gte: previousPeriod.startDate, $lte: previousPeriod.endDate }
    });
    
    // 4. Response Time Data
    const prevResponseTimeData = await SentEmail.find({
      userId,
      dateSent: { $gte: previousPeriod.startDate, $lte: previousPeriod.endDate },
      responseTime: { $exists: true, $ne: null }
    }).select('responseTime');
    
    const previousResponseTimes = prevResponseTimeData
      .map(email => email.responseTime || 0)
      .filter(time => time > 0);
    
    const previousAvgResponseTime = calculateAvgResponseTime(previousResponseTimes);
    
    // Calculate percentage changes
    const processedChange = calculatePercentChange(previousEmailsProcessed, currentEmailsProcessed);
    const autoResponsesChange = calculatePercentChange(previousAutoResponses, currentAutoResponses);
    const draftsSavedChange = calculatePercentChange(previousDraftsSaved, currentDraftsSaved);
    
    // For response time, a decrease is actually positive (faster is better)
    let responseTimeChange = 0;
    if (previousAvgResponseTime.value > 0 && currentAvgResponseTime.value > 0) {
      responseTimeChange = -calculatePercentChange(previousAvgResponseTime.value, currentAvgResponseTime.value);
    }
    
    // Format the stats data for the dashboard
    const dashboardStats = [
      {
        id: 'emails-processed',
        title: 'Emails Processed',
        value: currentEmailsProcessed,
        change: processedChange,
        icon: 'MailOutlineIcon',
        color: 'primary'
      },
      {
        id: 'auto-responses',
        title: 'Auto-Responses',
        value: currentAutoResponses,
        change: autoResponsesChange,
        icon: 'AutorenewIcon',
        color: 'success'
      },
      {
        id: 'drafts-saved',
        title: 'Drafts Saved',
        value: currentDraftsSaved,
        change: draftsSavedChange,
        icon: 'NotesRoundedIcon',
        color: 'warning'
      },
      {
        id: 'avg-response-time',
        title: 'Avg Response Time',
        value: currentAvgResponseTime.formatted,
        change: responseTimeChange,
        icon: 'TimerIcon',
        color: 'info',
        isInverted: true // Indicates that a decrease is positive
      }
    ];
    
    res.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).send('Error fetching dashboard statistics');
    }
}

export default {
  getBasicStats,
  getDashboardStats
};
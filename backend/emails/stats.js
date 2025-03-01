import express from 'express';
import auth from '../middleware/auth.js';
import getSentEmailModel from '../models/SentEmail.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to get date range based on timeRange parameter
const getDateRange = (timeRange) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7); // Default to week
  }
  
  return { startDate, endDate: now };
};

// Endpoint to get stats data
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const SentEmail = getSentEmailModel(userId);

    // Calculate the start of today and the start of 30 days ago
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOf30DaysAgo = new Date();
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);
    startOf30DaysAgo.setHours(0, 0, 0, 0);

    // Fetch the number of emails sent today
    const emailsSentToday = await SentEmail.countDocuments({
      dateSent: { $gte: startOfToday },
    });

    // Fetch the number of emails sent in the last 30 days
    const emailsSentInLast30Days = await SentEmail.countDocuments({
      dateSent: { $gte: startOf30DaysAgo },
    });

    // Fetch the data for the last 30 days
    const emailsSentData = await SentEmail.aggregate([
      { $match: { dateSent: { $gte: startOf30DaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$dateSent' },
            month: { $month: '$dateSent' },
            day: { $dayOfMonth: '$dateSent' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const statsData = [
      {
        title: 'Email sent today',
        value: emailsSentToday.toString(),
        interval: 'Last 30 days',
        trend: 'up',
        data: emailsSentData.map((item) => item.count),
      },
      {
        title: 'Total email sent',
        value: emailsSentInLast30Days.toString(),
        interval: 'Last 30 days',
        trend: 'up',
        data: emailsSentData.map((item) => item.count),
      },
    ];

    res.json(statsData);
  } catch (error) {
    console.error('Error fetching stats data:', error);
    res.status(500).send('Error fetching stats data');
  }
});

export default router;
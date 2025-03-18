import express from 'express';
import { requireAuth } from '../middleware/emailAuthMiddleware.js';
import statsController from '../controllers/statsController.js';

const router = express.Router();

/**
 * Helper function to ensure route handlers exist
 */
const ensureHandler = (handler, name) => {
  if (!handler) {
    return (req, res) => {
      console.error(`Handler '${name}' is not implemented`);
      return res.status(501).json({ error: `Handler '${name}' is not implemented` });
    };
  }
  return handler;
};

/**
 * Email statistics routes
 */

// Get overall email statistics
router.get('/overview', 
  requireAuth, 
  ensureHandler(statsController.getOverviewStats, 'statsController.getOverviewStats')
);

// Get email volume stats over time
router.get('/volume', 
  requireAuth, 
  ensureHandler(statsController.getVolumeStats, 'statsController.getVolumeStats')
);

// Get email category distribution
router.get('/categories', 
  requireAuth, 
  ensureHandler(statsController.getCategoryStats, 'statsController.getCategoryStats')
);

// Get email sentiment analysis
router.get('/sentiment', 
  requireAuth, 
  ensureHandler(statsController.getSentimentStats, 'statsController.getSentimentStats')
);

// Get response time statistics
router.get('/response-time', 
  requireAuth, 
  ensureHandler(statsController.getResponseTimeStats, 'statsController.getResponseTimeStats')
);

// Get email processing statistics
router.get('/processing', 
  requireAuth, 
  ensureHandler(statsController.getProcessingStats, 'statsController.getProcessingStats')
);

// Get AI response effectiveness metrics
router.get('/ai-effectiveness', 
  requireAuth, 
  ensureHandler(statsController.getAIEffectivenessStats, 'statsController.getAIEffectivenessStats')
);

// Get email provider usage statistics
router.get('/providers', 
  requireAuth, 
  ensureHandler(statsController.getProviderStats, 'statsController.getProviderStats')
);

// Get statistics for specific email address
router.get('/email/:email', 
  requireAuth, 
  ensureHandler(statsController.getEmailSpecificStats, 'statsController.getEmailSpecificStats')
);

// Get statistics for specific date range
router.post('/date-range', 
  requireAuth, 
  ensureHandler(statsController.getDateRangeStats, 'statsController.getDateRangeStats')
);

// Get email thread statistics
router.get('/threads', 
  requireAuth, 
  ensureHandler(statsController.getThreadStats, 'statsController.getThreadStats')
);

// Get comparative stats between time periods
router.post('/compare', 
  requireAuth, 
  ensureHandler(statsController.getComparisonStats, 'statsController.getComparisonStats')
);

// Get monthly email report
router.get('/monthly-report/:month/:year', 
  requireAuth, 
  ensureHandler(statsController.getMonthlyReport, 'statsController.getMonthlyReport')
);

// Get custom dashboard stats
router.get('/dashboard', 
  requireAuth, 
  ensureHandler(statsController.getDashboardStats, 'statsController.getDashboardStats')
);

// Get basic stats (total counts)
router.get('/basic', 
  requireAuth, 
  ensureHandler(statsController.getBasicStats, 'statsController.getBasicStats')
);

// Export statistics data
router.post('/export', 
  requireAuth, 
  ensureHandler(statsController.exportStats, 'statsController.exportStats')
);

export default router;
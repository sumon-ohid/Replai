import express from 'express';
import StatusController from '../controllers/statusController.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all status routes
router.use(auth);

// Get status overview
router.get('/overview', StatusController.getStatusOverview);

// Get detailed status for specific email
router.get('/:email', StatusController.getEmailStatus);

// Get system stats
router.get('/system/stats', StatusController.getSystemStats);

// Get monitoring logs
router.get('/logs', StatusController.getMonitoringLogs);

// Check health of connections
router.get('/health', StatusController.checkConnectionsHealth);

export default router;
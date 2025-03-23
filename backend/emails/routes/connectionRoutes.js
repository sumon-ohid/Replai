import express from 'express';
import auth from '../../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all connection routes
router.use(auth);

// Import the controller
import ConnectionController from '../controllers/connectionController.js';

// List all connections
router.get('/', ConnectionController.listConnections);

// Add a new connection
router.post('/', ConnectionController.addConnection);

// Get connection details
router.get('/:email', ConnectionController.getConnection);

// Update connection settings
router.put('/:email', ConnectionController.updateConnection);

// Delete connection
router.delete('/:email', ConnectionController.deleteConnection);

// Resume connection or pause connection
router.post('/:email/toggle-connection', ConnectionController.toggleConnectionStatus);

// Refresh connection
router.post('/:email/refresh', ConnectionController.refreshConnection);

// Mode switch draft or auto
router.post('/:email/mode-switch', ConnectionController.toggleAIMode);

// Connection operations
router.post('/:email/check', ConnectionController.checkEmails);
router.post('/:email/sync', ConnectionController.syncEmails);
router.put('/:email/status', ConnectionController.toggleConnectionStatus);

export default router;




// import express from 'express';
// import { authMiddleware } from '../../middleware/auth.js';
// import ConnectionController from '../controllers/connectionController.js';

// const router = express.Router();

// // Apply auth middleware to all routes
// router.use(authMiddleware);

// /**
//  * GET /api/email/connections
//  * Get all connected email accounts for the user
//  */
// router.get('/connections', ConnectionController.getConnectedEmails);

// /**
//  * POST /api/email/connections/google
//  * Connect a new Google email account
//  */
// router.post('/connections/google', ConnectionController.connectGoogleEmail);

// /**
//  * POST /api/email/connections/outlook
//  * Connect a new Outlook email account
//  */
// router.post('/connections/outlook', ConnectionController.connectOutlookEmail);

// /**
//  * POST /api/email/connections/custom
//  * Connect a new custom IMAP/SMTP email account
//  */
// router.post('/connections/custom', ConnectionController.connectCustomEmail);

// /**
//  * DELETE /api/email/connections/:email
//  * Disconnect an email account
//  */
// router.delete('/connections/:email', ConnectionController.disconnectEmail);

// /**
//  * GET /api/email/connections/:email/status
//  * Get connection status for an email account
//  */
// router.get('/connections/:email/status', ConnectionController.getConnectionStatus);

// /**
//  * PUT /api/email/connections/:email/sync
//  * Update sync settings for an email account
//  */
// router.put('/connections/:email/sync', ConnectionController.updateSyncSettings);

// /**
//  * POST /api/email/connections/:email/pause
//  * Pause syncing for an email account
//  */
// router.post('/connections/:email/pause', ConnectionController.pauseSync);

// /**
//  * POST /api/email/connections/:email/resume
//  * Resume syncing for an email account
//  */
// router.post('/connections/:email/resume', ConnectionController.resumeSync);

// /**
//  * POST /api/email/connections/:email/test
//  * Test connection for an email account
//  */
// router.post('/connections/:email/test', ConnectionController.testConnection);

// /**
//  * PUT /api/email/connections/:email/settings
//  * Update email account settings
//  */
// router.put('/connections/:email/settings', ConnectionController.updateSettings);

// /**
//  * POST /api/email/connections/:email/refresh
//  * Force refresh connection tokens
//  */
// router.post('/connections/:email/refresh', ConnectionController.refreshConnection);

// /**
//  * GET /api/email/connections/:email/stats
//  * Get email account statistics
//  */
// router.get('/connections/:email/stats', ConnectionController.getConnectionStats);

// export default router;

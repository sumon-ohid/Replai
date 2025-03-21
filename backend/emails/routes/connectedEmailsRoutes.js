import express from 'express';
import {
  getConnectedEmails,
  updateSettings,
  getStatus,
  disconnect,
  refreshEmailSync
} from '../controllers/connectedEmailsController.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all connected emails
router.get('/', getConnectedEmails);

// Get connection status
router.get('/:email/status', getStatus);

// Update connection settings
router.put('/:email/settings', updateSettings);

// Manually refresh email sync
router.post('/:email/refresh', refreshEmailSync);

// Disconnect email
router.delete('/:email', disconnect);

export default router;

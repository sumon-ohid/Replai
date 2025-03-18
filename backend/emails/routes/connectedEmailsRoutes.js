import express from 'express';
import { requireAuth } from '../middleware/emailAuthMiddleware.js';
import { 
  getConnectedEmails, 
  toggleAutoReply, 
  toggleSync, 
  updateEmailMode,
  refreshEmailSync
} from '../controllers/connectedEmailsController.js';

const router = express.Router();

// Get all connected email accounts
router.get('/', requireAuth, getConnectedEmails);

// Toggle auto-reply for an email
router.patch('/auto-reply/:email', requireAuth, toggleAutoReply);

// Toggle sync for an email
router.patch('/sync/:email', requireAuth, toggleSync);

// Update email mode (draft/normal)
router.patch('/mode/:email', requireAuth, updateEmailMode);

// Manually refresh email sync
router.post('/refresh/:email', requireAuth, refreshEmailSync);

export default router;
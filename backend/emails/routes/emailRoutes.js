import express from 'express';
import EmailController from '../controllers/emailController.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

// Get emails for a specific connected email account
router.get('/:email/emails', auth, EmailController.getEmails);

// Get a single email
router.get('/:email/emails/:messageId', auth, EmailController.getEmail);

// Get drafts for a specific email account
router.get('/:email/drafts', auth, EmailController.getDrafts);

// Get sent emails for a specific email account
router.get('/:email/sent', auth, EmailController.getSentEmails);

// Mark email as read
router.patch('/:email/emails/:messageId/read', auth, EmailController.markAsRead);

// Search emails
router.get('/:email/search', auth, EmailController.searchEmails);

export default router;

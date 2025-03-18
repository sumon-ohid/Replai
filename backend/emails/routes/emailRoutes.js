import express from 'express';
import { requireAuth, verifyEmailAuth, checkEmailPermission, checkSyncStatus } from '../middleware/emailAuthMiddleware.js';
import emailController from '../controllers/emailController.js';
import draftController from '../controllers/draftController.js';
import getEmailModel from '../../models/Email.js';

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
 * Set up email model middleware for routes that need it
 */
const setupEmailModel = (req, res, next) => {
  if (req.user) {
    req.emailModel = getEmailModel(req.user._id);
  }
  next();
};

/**
 * Email listing and search routes
 */
router.get('/list/:email', 
  requireAuth, 
  verifyEmailAuth, 
  checkSyncStatus,
  ensureHandler(emailController.listEmails, 'emailController.listEmails')
);

router.get('/search/:email', 
  requireAuth, 
  verifyEmailAuth, 
  checkSyncStatus,
  ensureHandler(emailController.searchEmails, 'emailController.searchEmails')
);

router.get('/folders/:email', 
  requireAuth, 
  verifyEmailAuth, 
  ensureHandler(emailController.getFolders, 'emailController.getFolders')
);

router.get('/categories/:email', 
  requireAuth, 
  verifyEmailAuth, 
  ensureHandler(emailController.getCategories, 'emailController.getCategories')
);

/**
 * Individual email operations
 */
router.get('/view/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission, 
  ensureHandler(emailController.getEmailById, 'emailController.getEmailById')
);

router.post('/mark-read/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission, 
  ensureHandler(emailController.markAsRead, 'emailController.markAsRead')
);

router.post('/mark-unread/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission, 
  ensureHandler(emailController.markAsUnread, 'emailController.markAsUnread')
);

router.post('/move/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission, 
  ensureHandler(emailController.moveEmail, 'emailController.moveEmail')
);

router.post('/archive/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission, 
  ensureHandler(emailController.archiveEmail, 'emailController.archiveEmail')
);

router.delete('/delete/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission, 
  ensureHandler(emailController.deleteEmail, 'emailController.deleteEmail')
);

/**
 * Send email routes
 */
router.post('/send/:email', 
  requireAuth, 
  verifyEmailAuth, 
  checkSyncStatus,
  ensureHandler(emailController.sendEmail, 'emailController.sendEmail')
);

router.post('/reply/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission,
  verifyEmailAuth,
  checkSyncStatus,
  ensureHandler(emailController.replyToEmail, 'emailController.replyToEmail')
);

router.post('/forward/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission, 
  verifyEmailAuth,
  checkSyncStatus,
  ensureHandler(emailController.forwardEmail, 'emailController.forwardEmail')
);

/**
 * Draft management routes
 */
router.post('/drafts/create/:email', 
  requireAuth, 
  verifyEmailAuth, 
  ensureHandler(draftController.createDraft, 'draftController.createDraft')
);

router.get('/drafts/:email', 
  requireAuth, 
  verifyEmailAuth, 
  ensureHandler(draftController.listDrafts, 'draftController.listDrafts')
);

router.get('/drafts/view/:draftId', 
  requireAuth, 
  ensureHandler(draftController.getDraftById, 'draftController.getDraftById')
);

router.put('/drafts/update/:draftId', 
  requireAuth, 
  ensureHandler(draftController.updateDraft, 'draftController.updateDraft')
);

router.delete('/drafts/delete/:draftId', 
  requireAuth, 
  ensureHandler(draftController.deleteDraft, 'draftController.deleteDraft')
);

router.post('/drafts/send/:draftId', 
  requireAuth, 
  verifyEmailAuth,
  checkSyncStatus,
  ensureHandler(draftController.sendDraft, 'draftController.sendDraft')
);

/**
 * Auto-reply settings
 */
router.post('/settings/:email', 
  requireAuth, 
  ensureHandler(emailController.updateEmailSettings, 'emailController.updateEmailSettings')
);

router.get('/settings/:email', 
  requireAuth, 
  ensureHandler(emailController.getEmailSettings, 'emailController.getEmailSettings')
);

router.post('/toggle-sync/:email', 
  requireAuth, 
  verifyEmailAuth, 
  ensureHandler(emailController.toggleSync, 'emailController.toggleSync')
);

/**
 * AI-assisted email operations
 */
router.post('/ai-generate-reply/:emailId', 
  requireAuth, 
  setupEmailModel, 
  checkEmailPermission, 
  ensureHandler(emailController.generateAIReply, 'emailController.generateAIReply')
);

router.post('/ai-generate-draft/:email', 
  requireAuth, 
  verifyEmailAuth, 
  ensureHandler(draftController.generateDraft, 'draftController.generateDraft')
);

router.post('/ai-improve/:draftId', 
  requireAuth, 
  ensureHandler(draftController.improveWithAI, 'draftController.improveWithAI')
);

/**
 * Sync operations
 */
router.post('/force-sync/:email', 
  requireAuth, 
  verifyEmailAuth, 
  ensureHandler(emailController.forceSync, 'emailController.forceSync')
);

router.get('/sync-status/:email', 
  requireAuth, 
  verifyEmailAuth, 
  ensureHandler(emailController.getSyncStatus, 'emailController.getSyncStatus')
);

export default router;
import express from 'express';
import auth from '../../middleware/auth.js';
import * as paymentController from '../controllers/paymentController.js';
import * as webhookController from '../controllers/webhookController.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/create-checkout-session', auth, paymentController.createCheckoutSession);
router.get('/subscription', auth, paymentController.getSubscription);
router.post('/cancel-subscription', auth, paymentController.cancelSubscription);
router.post('/update-subscription', auth, paymentController.updateSubscription);
router.get('/payment-history', auth, paymentController.getPaymentHistory);

// Webhook route - doesn't require authentication but needs raw body for signature verification
router.post(
  '/webhook', 
  express.raw({ type: 'application/json' }),
  webhookController.handleWebhook
);

export default router;
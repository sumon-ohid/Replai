import express from 'express';
import AutomationController from '../controllers/automationController.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all automation routes
router.use(auth);

// Get/update automation settings
router.get('/:email/settings', AutomationController.getSettings);
router.put('/:email/settings', AutomationController.updateSettings);

// Response templates
router.get('/:email/templates', AutomationController.getTemplates);
router.post('/:email/templates', AutomationController.createTemplate);
router.put('/:email/templates/:templateId', AutomationController.updateTemplate);
router.delete('/:email/templates/:templateId', AutomationController.deleteTemplate);

// Email analysis and response
router.post('/analyze', AutomationController.analyzeEmail);
router.post('/:email/respond', AutomationController.sendAutomatedResponse);
router.post('/:email/draft', AutomationController.createResponseDraft);

// Categories
router.get('/:email/categories', AutomationController.getCategories);
router.put('/:email/categories', AutomationController.updateCategories);

// Performance metrics
router.get('/:email/metrics', AutomationController.getPerformanceMetrics);

// Mode switching
router.put('/:email/mode', AutomationController.toggleMode);

// Test automation
router.post('/:email/test', AutomationController.testAutomation);

export default router;
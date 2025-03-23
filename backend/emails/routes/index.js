import express from 'express';
import connectionRoutes from './connectionRoutes.js';
import statusRoutes from './statusRoutes.js';

const router = express.Router();

// Mount the sub-routers
router.use('/connections', connectionRoutes);
router.use('/status', statusRoutes);

export default router;
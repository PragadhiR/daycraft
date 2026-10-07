import express from 'express';
import { getDashboardSummary, getHistoryStats } from '../controllers/statsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardSummary);
router.get('/history', getHistoryStats);

export default router;

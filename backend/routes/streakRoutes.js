import express from 'express';
import { getStreakStats, useFreeze } from '../controllers/streakController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getStreakStats);
router.post('/use-freeze', useFreeze);

export default router;

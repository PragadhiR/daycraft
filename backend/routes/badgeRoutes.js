import express from 'express';
import { getBadges } from '../controllers/badgeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getBadges);

export default router;

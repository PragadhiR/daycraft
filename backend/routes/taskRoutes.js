import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, toggleTask } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);

export default router;

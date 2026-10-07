import pool from '../config/db.js';
import { formatDate, syncDailyLog } from '../services/streakService.js';
import { evaluateAndAwardBadges } from '../services/badgeService.js';

export async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const { date, category, priority, status } = req.query;

    let sql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (date) {
      sql += ' AND due_date = ?';
      params.push(date);
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (priority && priority !== 'All') {
      sql += ' AND priority = ?';
      params.push(priority);
    }

    if (status === 'completed') {
      sql += ' AND is_completed = TRUE';
    } else if (status === 'incomplete') {
      sql += ' AND is_completed = FALSE';
    }

    sql += ' ORDER BY is_completed ASC, FIELD(priority, "High", "Medium", "Low"), created_at DESC';

    const [tasks] = await pool.query(sql, params);
    res.json(tasks);
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ message: 'Failed to retrieve tasks.' });
  }
}

export async function createTask(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, category, priority, due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const taskDate = due_date || formatDate();
    const taskCat = category || 'Professional';
    const taskPrio = priority || 'Medium';

    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, title, description, category, priority, due_date, is_completed)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [userId, title.trim(), description || '', taskCat, taskPrio, taskDate]
    );

    // Sync daily log for this date
    await syncDailyLog(userId, taskDate);

    const [created] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Task created successfully!',
      task: created[0],
    });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ message: 'Failed to create task.' });
  }
}

export async function updateTask(req, res) {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, category, priority, due_date } = req.body;

    // Check ownership
    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const currentTask = existing[0];
    const oldDate = formatDate(new Date(currentTask.due_date));
    const newDate = due_date ? due_date : oldDate;

    await pool.query(
      `UPDATE tasks 
       SET title = ?, description = ?, category = ?, priority = ?, due_date = ?
       WHERE id = ? AND user_id = ?`,
      [
        title !== undefined ? title.trim() : currentTask.title,
        description !== undefined ? description : currentTask.description,
        category || currentTask.category,
        priority || currentTask.priority,
        newDate,
        taskId,
        userId,
      ]
    );

    // Sync logs if date changed
    await syncDailyLog(userId, newDate);
    if (oldDate !== newDate) {
      await syncDailyLog(userId, oldDate);
    }

    const [updated] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    res.json({
      message: 'Task updated successfully!',
      task: updated[0],
    });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ message: 'Failed to update task.' });
  }
}

export async function deleteTask(req, res) {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const taskDate = formatDate(new Date(existing[0].due_date));

    await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);

    // Re-sync daily log for this date
    await syncDailyLog(userId, taskDate);

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ message: 'Failed to delete task.' });
  }
}

export async function toggleTask(req, res) {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const currentTask = existing[0];
    const willBeCompleted = !currentTask.is_completed;
    const completedAt = willBeCompleted ? new Date() : null;
    const taskDate = formatDate(new Date(currentTask.due_date));

    await pool.query(
      'UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ? AND user_id = ?',
      [willBeCompleted, completedAt, taskId, userId]
    );

    // Sync daily log & streaks
    const syncResult = await syncDailyLog(userId, taskDate);

    // Check for newly earned badges
    const newlyUnlockedBadges = await evaluateAndAwardBadges(userId);

    const [updated] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    res.json({
      task: updated[0],
      syncResult,
      newlyUnlockedBadges,
      proFreezeAwarded: syncResult?.proFreezeAwarded || false,
    });
  } catch (err) {
    console.error('toggleTask error:', err);
    res.status(500).json({ message: 'Failed to toggle task status.' });
  }
}

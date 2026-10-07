import pool from '../config/db.js';
import { formatDate, offsetDate, recalculateStreaks } from '../services/streakService.js';

export async function getStreakStats(req, res) {
  try {
    const userId = req.user.id;

    // Recalculate to ensure absolute up-to-date values
    const streakInfo = await recalculateStreaks(userId);

    // Get freezes inventory
    const [freezeCounts] = await pool.query(
      `SELECT 
        SUM(CASE WHEN freeze_type = 'normal' AND status = 'available' THEN 1 ELSE 0 END) as normal_available,
        SUM(CASE WHEN freeze_type = 'normal' AND status = 'used' THEN 1 ELSE 0 END) as normal_used,
        SUM(CASE WHEN freeze_type = 'pro' AND status = 'available' THEN 1 ELSE 0 END) as pro_available,
        SUM(CASE WHEN freeze_type = 'pro' AND status = 'used' THEN 1 ELSE 0 END) as pro_used
       FROM streak_freezes 
       WHERE user_id = ?`,
      [userId]
    );

    // Get freeze history records
    const [freezeList] = await pool.query(
      `SELECT id, freeze_type, status, earned_date, used_date, protected_date, notes
       FROM streak_freezes 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Check if today has an active normal freeze penalty (+2 tasks)
    const todayStr = formatDate();
    const [todayLog] = await pool.query(
      'SELECT penalty_active, target_required FROM daily_logs WHERE user_id = ? AND log_date = ?',
      [userId, todayStr]
    );

    res.json({
      streaks: streakInfo,
      freezes: {
        normal_available: freezeCounts[0]?.normal_available || 0,
        normal_used: freezeCounts[0]?.normal_used || 0,
        pro_available: freezeCounts[0]?.pro_available || 0,
        pro_used: freezeCounts[0]?.pro_used || 0,
        history: freezeList,
      },
      penalty: {
        active: Boolean(todayLog[0]?.penalty_active),
        target_required: todayLog[0]?.target_required || 3,
      },
    });
  } catch (err) {
    console.error('getStreakStats error:', err);
    res.status(500).json({ message: 'Failed to retrieve streak statistics.' });
  }
}

export async function useFreeze(req, res) {
  try {
    const userId = req.user.id;
    const { freezeType, dateToProtect } = req.body;

    if (!freezeType || !['normal', 'pro'].includes(freezeType)) {
      return res.status(400).json({ message: 'Valid freeze type ("normal" or "pro") is required.' });
    }

    if (!dateToProtect) {
      return res.status(400).json({ message: 'Target date to protect is required.' });
    }

    const todayStr = formatDate();
    if (dateToProtect >= todayStr) {
      return res.status(400).json({ message: 'Streak Freezes can only be applied to past missed days.' });
    }

    // 1. Verify user has an available freeze of that type
    const [availableFreezes] = await pool.query(
      'SELECT id FROM streak_freezes WHERE user_id = ? AND freeze_type = ? AND status = "available" ORDER BY id ASC LIMIT 1',
      [userId, freezeType]
    );

    if (availableFreezes.length === 0) {
      return res.status(400).json({
        message: `No available ${freezeType === 'pro' ? 'Pro' : 'Normal'} Freezes in your inventory.`,
      });
    }

    const freezeId = availableFreezes[0].id;

    // 2. Check the daily log for that date
    const [logRows] = await pool.query(
      'SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?',
      [userId, dateToProtect]
    );

    if (logRows.length === 0 || (logRows[0].status !== 'missed' && logRows[0].status !== 'in_progress')) {
      // If no log exists for that past day, create one marked missed first
      if (logRows.length === 0) {
        await pool.query(
          `INSERT INTO daily_logs (user_id, log_date, tasks_completed, tasks_total, status)
           VALUES (?, ?, 0, 0, 'missed')`,
          [userId, dateToProtect]
        );
      } else if (logRows[0].status === 'success') {
        return res.status(400).json({ message: 'This date was already a successful day and does not need protection.' });
      } else if (logRows[0].status.startsWith('frozen_')) {
        return res.status(400).json({ message: 'This date is already protected by a streak freeze.' });
      }
    }

    const newStatus = freezeType === 'pro' ? 'frozen_pro' : 'frozen_normal';

    // 3. Update the daily log to frozen status
    await pool.query(
      'UPDATE daily_logs SET status = ? WHERE user_id = ? AND log_date = ?',
      [newStatus, userId, dateToProtect]
    );

    // 4. Mark the freeze as used
    await pool.query(
      `UPDATE streak_freezes 
       SET status = 'used', used_date = NOW(), protected_date = ? 
       WHERE id = ?`,
      [dateToProtect, freezeId]
    );

    // 5. If it was a Normal Freeze, apply the 2-additional-tasks penalty to the following day
    if (freezeType === 'normal') {
      const followingDayStr = offsetDate(dateToProtect, 1);
      const [followingLog] = await pool.query(
        'SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?',
        [userId, followingDayStr]
      );

      // Fetch base target
      const [userRows] = await pool.query('SELECT daily_task_target FROM users WHERE id = ?', [userId]);
      const baseTarget = userRows[0]?.daily_task_target || 3;
      const penaltyTarget = baseTarget + 2;

      if (followingLog.length > 0) {
        await pool.query(
          `UPDATE daily_logs 
           SET penalty_active = 1, target_required = ? 
           WHERE user_id = ? AND log_date = ?`,
          [penaltyTarget, userId, followingDayStr]
        );
      } else {
        await pool.query(
          `INSERT INTO daily_logs (user_id, log_date, tasks_completed, tasks_total, target_required, status, penalty_active)
           VALUES (?, ?, 0, 0, ?, 'in_progress', 1)`,
          [userId, followingDayStr, penaltyTarget]
        );
      }
    }

    // 6. Recalculate streak
    const updatedStreaks = await recalculateStreaks(userId);

    res.json({
      message: `Streak freeze applied! Protected ${dateToProtect}.${freezeType === 'normal' ? ' Remember: the following day requires 2 additional tasks.' : ' Pro Freeze applied with no extra penalty!'}`,
      streaks: updatedStreaks,
    });
  } catch (err) {
    console.error('useFreeze error:', err);
    res.status(500).json({ message: 'Failed to apply streak freeze.' });
  }
}

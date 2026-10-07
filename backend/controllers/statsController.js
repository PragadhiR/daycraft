import pool from '../config/db.js';
import { formatDate, syncDailyLog, recalculateStreaks } from '../services/streakService.js';
import { evaluateAndAwardBadges } from '../services/badgeService.js';

export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = formatDate();

    // 1. Sync today's log & evaluate streaks
    await syncDailyLog(userId, todayStr);
    const streakInfo = await recalculateStreaks(userId);
    await evaluateAndAwardBadges(userId);

    // 2. User info & daily target
    const [userRows] = await pool.query('SELECT name, daily_task_target FROM users WHERE id = ?', [userId]);
    const user = userRows[0] || { name: 'User', daily_task_target: 3 };

    // 3. Today's daily log details
    const [todayLogRows] = await pool.query(
      'SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?',
      [userId, todayStr]
    );
    const todayLog = todayLogRows[0] || {
      tasks_completed: 0,
      tasks_total: 0,
      target_required: user.daily_task_target,
      status: 'in_progress',
      penalty_active: 0,
    };

    const targetRequired = todayLog.target_required || user.daily_task_target;
    const completed = todayLog.tasks_completed || 0;
    const total = todayLog.tasks_total || 0;
    const remainingToTarget = Math.max(0, targetRequired - completed);
    const progressPercent = targetRequired > 0 ? Math.min(100, Math.round((completed / targetRequired) * 100)) : 0;

    // 4. Today's tasks list
    const [todayTasks] = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ? AND due_date = ? ORDER BY is_completed ASC, FIELD(priority, "High", "Medium", "Low"), created_at DESC',
      [userId, todayStr]
    );

    // 5. Freeze counts
    const [freezes] = await pool.query(
      `SELECT 
        SUM(CASE WHEN freeze_type = 'normal' AND status = 'available' THEN 1 ELSE 0 END) as normal_available,
        SUM(CASE WHEN freeze_type = 'pro' AND status = 'available' THEN 1 ELSE 0 END) as pro_available
       FROM streak_freezes 
       WHERE user_id = ?`,
      [userId]
    );

    // 6. Badges preview (top 3 recently unlocked badges)
    const [earnedBadges] = await pool.query(
      `SELECT b.id, b.name, b.description, b.icon, ub.unlocked_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = ?
       ORDER BY ub.unlocked_at DESC
       LIMIT 3`,
      [userId]
    );

    const [totalBadgesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?',
      [userId]
    );

    res.json({
      userName: user.name,
      todayDate: todayStr,
      progress: {
        completed,
        total,
        targetRequired,
        remainingToTarget,
        percentage: progressPercent,
        isTargetMet: completed >= targetRequired,
        penaltyActive: Boolean(todayLog.penalty_active),
      },
      streaks: {
        current: streakInfo.currentStreak,
        longest: streakInfo.longestStreak,
        successfulDays: streakInfo.successfulDays,
        missedDays: streakInfo.missedDays,
      },
      freezes: {
        normalAvailable: freezes[0]?.normal_available || 0,
        proAvailable: freezes[0]?.pro_available || 0,
      },
      badges: {
        totalEarned: totalBadgesCount[0]?.count || 0,
        recent: earnedBadges,
      },
      todayTasks,
    });
  } catch (err) {
    console.error('getDashboardSummary error:', err);
    res.status(500).json({ message: 'Failed to retrieve dashboard summary.' });
  }
}

export async function getHistoryStats(req, res) {
  try {
    const userId = req.user.id;

    // Daily logs past 60 days
    const [dailyLogs] = await pool.query(
      `SELECT log_date, tasks_completed, tasks_total, target_required, status, penalty_active
       FROM daily_logs 
       WHERE user_id = ? 
       ORDER BY log_date DESC 
       LIMIT 60`,
      [userId]
    );

    // Overall stats
    const [totals] = await pool.query(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as total_completed
       FROM tasks 
       WHERE user_id = ?`,
      [userId]
    );

    // Category breakdown
    const [categoryCounts] = await pool.query(
      `SELECT 
        category,
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed
       FROM tasks 
       WHERE user_id = ?
       GROUP BY category`,
      [userId]
    );

    // Days counts
    const [dayCounts] = await pool.query(
      `SELECT 
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_days,
        SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed_days,
        SUM(CASE WHEN status LIKE 'frozen_%' THEN 1 ELSE 0 END) as frozen_days
       FROM daily_logs
       WHERE user_id = ?`,
      [userId]
    );

    const successDays = dayCounts[0]?.success_days || 0;
    const missedDays = dayCounts[0]?.missed_days || 0;
    const totalTrackedDays = successDays + missedDays + (dayCounts[0]?.frozen_days || 0);
    const successRate = totalTrackedDays > 0 ? Math.round((successDays / totalTrackedDays) * 100) : 0;

    res.json({
      dailyLogs,
      totals: {
        totalTasks: totals[0]?.total_tasks || 0,
        completedTasks: totals[0]?.total_completed || 0,
        successDays,
        missedDays,
        frozenDays: dayCounts[0]?.frozen_days || 0,
        successRate,
      },
      categories: categoryCounts,
    });
  } catch (err) {
    console.error('getHistoryStats error:', err);
    res.status(500).json({ message: 'Failed to retrieve productivity history.' });
  }
}

import pool from '../config/db.js';

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDate(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns YYYY-MM-DD for d offset by days
 */
export function offsetDate(dateStr, offsetDays) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
}

/**
 * Ensure daily_log entry exists for a user and date, recalculates counts & status.
 */
export async function syncDailyLog(userId, dateStr) {
  const todayStr = formatDate();

  // 1. Get user configuration
  const [userRows] = await pool.query(
    'SELECT daily_task_target FROM users WHERE id = ?',
    [userId]
  );
  if (!userRows.length) return null;
  const baseTarget = userRows[0].daily_task_target || 3;

  // 2. Check if previous day was frozen with a normal freeze (which adds +2 penalty)
  const prevDateStr = offsetDate(dateStr, -1);
  const [prevLogRows] = await pool.query(
    'SELECT status FROM daily_logs WHERE user_id = ? AND log_date = ?',
    [userId, prevDateStr]
  );
  const hadNormalFreezePrevDay = prevLogRows[0]?.status === 'frozen_normal';
  const targetRequired = hadNormalFreezePrevDay ? baseTarget + 2 : baseTarget;

  // 3. Count total and completed tasks for dateStr
  const [taskCounts] = await pool.query(
    `SELECT 
       COUNT(*) as total_tasks,
       SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed_tasks
     FROM tasks 
     WHERE user_id = ? AND due_date = ?`,
    [userId, dateStr]
  );

  const totalTasks = taskCounts[0]?.total_tasks || 0;
  const completedTasks = taskCounts[0]?.completed_tasks || 0;

  // 4. Retrieve existing log if any
  const [existingRows] = await pool.query(
    'SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?',
    [userId, dateStr]
  );

  const existing = existingRows[0];
  let status = 'in_progress';

  if (existing && (existing.status === 'frozen_normal' || existing.status === 'frozen_pro')) {
    // Keep frozen status unless user completed enough to become a genuine success
    if (completedTasks >= targetRequired) {
      status = 'success';
    } else {
      status = existing.status;
    }
  } else if (completedTasks >= targetRequired && completedTasks > 0) {
    status = 'success';
  } else if (dateStr < todayStr) {
    status = 'missed';
  } else {
    status = 'in_progress';
  }

  // 5. Upsert daily log
  if (existing) {
    await pool.query(
      `UPDATE daily_logs 
       SET tasks_completed = ?, tasks_total = ?, target_required = ?, status = ?, penalty_active = ?
       WHERE id = ?`,
      [completedTasks, totalTasks, targetRequired, status, hadNormalFreezePrevDay ? 1 : 0, existing.id]
    );
  } else {
    await pool.query(
      `INSERT INTO daily_logs (user_id, log_date, tasks_completed, tasks_total, target_required, status, penalty_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, dateStr, completedTasks, totalTasks, targetRequired, status, hadNormalFreezePrevDay ? 1 : 0]
    );
  }

  // 6. Pro Freeze check: if 10 tasks completed in one day, award a Pro Freeze!
  let proFreezeAwarded = false;
  if (completedTasks >= 10) {
    const [existingProFreeze] = await pool.query(
      'SELECT id FROM streak_freezes WHERE user_id = ? AND freeze_type = "pro" AND earned_date = ?',
      [userId, dateStr]
    );
    if (!existingProFreeze.length) {
      await pool.query(
        `INSERT INTO streak_freezes (user_id, freeze_type, status, earned_date, notes)
         VALUES (?, 'pro', 'available', ?, 'Earned for completing 10 tasks in one day')`,
        [userId, dateStr]
      );
      proFreezeAwarded = true;
    }
  }

  // 7. Recalculate streak summary
  await recalculateStreaks(userId);

  return {
    date: dateStr,
    completedTasks,
    totalTasks,
    targetRequired,
    status,
    proFreezeAwarded,
  };
}

/**
 * Recalculates unbroken current streak and updates the streaks table
 */
export async function recalculateStreaks(userId) {
  const todayStr = formatDate();

  // Fetch all logs ordered descending by date
  const [logs] = await pool.query(
    `SELECT log_date, status, tasks_completed, target_required
     FROM daily_logs 
     WHERE user_id = ? 
     ORDER BY log_date DESC`,
    [userId]
  );

  const logMap = new Map();
  for (const log of logs) {
    const dStr = formatDate(new Date(log.log_date));
    logMap.set(dStr, log.status);
  }

  let currentStreak = 0;
  let checkDate = todayStr;

  // Check today:
  const todayStatus = logMap.get(todayStr);
  if (todayStatus === 'success' || todayStatus === 'frozen_normal' || todayStatus === 'frozen_pro') {
    currentStreak += 1;
    checkDate = offsetDate(checkDate, -1);
  } else {
    // Today is in_progress or missed; check yesterday to see if streak from yesterday is intact
    checkDate = offsetDate(todayStr, -1);
  }

  // Walk backwards day by day
  while (true) {
    const status = logMap.get(checkDate);
    if (status === 'success' || status === 'frozen_normal' || status === 'frozen_pro') {
      currentStreak += 1;
      checkDate = offsetDate(checkDate, -1);
    } else {
      // Unbroken chain stops
      break;
    }
  }

  // Count total successful and missed days
  const [counts] = await pool.query(
    `SELECT 
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_days,
      SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed_days,
      MAX(CASE WHEN status = 'success' THEN log_date ELSE NULL END) as last_success
     FROM daily_logs 
     WHERE user_id = ?`,
    [userId]
  );

  const successfulDays = counts[0]?.successful_days || 0;
  const missedDays = counts[0]?.missed_days || 0;
  const lastSuccess = counts[0]?.last_success || null;

  // Update streaks row
  const [existingStreak] = await pool.query(
    'SELECT longest_streak FROM streaks WHERE user_id = ?',
    [userId]
  );

  const prevLongest = existingStreak[0]?.longest_streak || 0;
  const newLongest = Math.max(prevLongest, currentStreak);

  if (existingStreak.length) {
    await pool.query(
      `UPDATE streaks 
       SET current_streak = ?, longest_streak = ?, last_successful_date = ?, total_successful_days = ?, total_missed_days = ?
       WHERE user_id = ?`,
      [currentStreak, newLongest, lastSuccess, successfulDays, missedDays, userId]
    );
  } else {
    await pool.query(
      `INSERT INTO streaks (user_id, current_streak, longest_streak, last_successful_date, total_successful_days, total_missed_days)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, currentStreak, newLongest, lastSuccess, successfulDays, missedDays]
    );
  }

  return {
    currentStreak,
    longestStreak: newLongest,
    successfulDays,
    missedDays,
    lastSuccess,
  };
}

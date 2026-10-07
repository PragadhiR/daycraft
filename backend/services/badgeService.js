import pool from '../config/db.js';

/**
 * Checks and awards badges for a given user based on their current achievements.
 * Returns an array of newly awarded badges.
 */
export async function evaluateAndAwardBadges(userId) {
  const newlyUnlocked = [];

  // 1. Get all badges
  const [allBadges] = await pool.query('SELECT * FROM badges');

  // 2. Get user's already unlocked badge IDs
  const [unlockedRows] = await pool.query(
    'SELECT badge_id FROM user_badges WHERE user_id = ?',
    [userId]
  );
  const unlockedSet = new Set(unlockedRows.map((r) => r.badge_id));

  // 3. Get user stats
  // a. Total tasks completed
  const [taskStats] = await pool.query(
    'SELECT COUNT(*) as total_completed FROM tasks WHERE user_id = ? AND is_completed = TRUE',
    [userId]
  );
  const totalCompleted = taskStats[0]?.total_completed || 0;

  // b. Streak stats
  const [streakStats] = await pool.query(
    'SELECT current_streak, longest_streak, total_successful_days FROM streaks WHERE user_id = ?',
    [userId]
  );
  const currentStreak = streakStats[0]?.current_streak || 0;
  const longestStreak = streakStats[0]?.longest_streak || 0;
  const successfulDays = streakStats[0]?.total_successful_days || 0;

  // c. Daily logs stats (e.g. max completed in a single day, perfect day achieved)
  const [logStats] = await pool.query(
    `SELECT 
      MAX(tasks_completed) as max_in_single_day,
      SUM(CASE WHEN status = 'success' AND tasks_completed >= target_required AND tasks_completed = tasks_total AND tasks_total > 0 THEN 1 ELSE 0 END) as perfect_days
     FROM daily_logs 
     WHERE user_id = ?`,
    [userId]
  );
  const maxInSingleDay = logStats[0]?.max_in_single_day || 0;
  const perfectDaysCount = logStats[0]?.perfect_days || 0;

  // 4. Test each badge criteria
  for (const badge of allBadges) {
    if (unlockedSet.has(badge.id)) {
      continue; // Already earned
    }

    let isEligible = false;

    switch (badge.criterion_type) {
      case 'first_task':
        isEligible = totalCompleted >= badge.criterion_value;
        break;

      case 'successful_days':
        isEligible = successfulDays >= badge.criterion_value;
        break;

      case 'streak_length':
        // Eligible if current or longest streak hit the target
        isEligible = longestStreak >= badge.criterion_value || currentStreak >= badge.criterion_value;
        break;

      case 'total_tasks':
        isEligible = totalCompleted >= badge.criterion_value;
        break;

      case 'perfect_day':
        isEligible = perfectDaysCount >= badge.criterion_value;
        break;

      case 'ten_in_one_day':
        isEligible = maxInSingleDay >= badge.criterion_value;
        break;

      default:
        break;
    }

    if (isEligible) {
      // Award badge
      await pool.query(
        'INSERT IGNORE INTO user_badges (user_id, badge_id, unlocked_at) VALUES (?, ?, NOW())',
        [userId, badge.id]
      );
      newlyUnlocked.push(badge);
    }
  }

  return newlyUnlocked;
}

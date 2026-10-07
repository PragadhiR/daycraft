import pool from '../config/db.js';
import { evaluateAndAwardBadges } from '../services/badgeService.js';

export async function getBadges(req, res) {
  try {
    const userId = req.user.id;

    // First ensure latest badges are evaluated
    await evaluateAndAwardBadges(userId);

    // Get all badges
    const [badges] = await pool.query('SELECT * FROM badges ORDER BY id ASC');

    // Get user's unlocked badges
    const [userBadges] = await pool.query(
      'SELECT badge_id, unlocked_at FROM user_badges WHERE user_id = ?',
      [userId]
    );

    const userBadgeMap = new Map();
    userBadges.forEach((ub) => {
      userBadgeMap.set(ub.badge_id, ub.unlocked_at);
    });

    // Get user stats for progress tracking
    const [taskStats] = await pool.query(
      'SELECT COUNT(*) as total_completed FROM tasks WHERE user_id = ? AND is_completed = TRUE',
      [userId]
    );
    const totalCompleted = taskStats[0]?.total_completed || 0;

    const [streakStats] = await pool.query(
      'SELECT current_streak, longest_streak, total_successful_days FROM streaks WHERE user_id = ?',
      [userId]
    );
    const longestStreak = streakStats[0]?.longest_streak || 0;
    const currentStreak = streakStats[0]?.current_streak || 0;
    const bestStreak = Math.max(longestStreak, currentStreak);
    const successfulDays = streakStats[0]?.total_successful_days || 0;

    const [logStats] = await pool.query(
      `SELECT 
        MAX(tasks_completed) as max_in_single_day,
        SUM(CASE WHEN status = 'success' AND tasks_completed >= target_required AND tasks_completed = tasks_total AND tasks_total > 0 THEN 1 ELSE 0 END) as perfect_days
       FROM daily_logs 
       WHERE user_id = ?`,
      [userId]
    );
    const maxInSingleDay = logStats[0]?.max_in_single_day || 0;
    const perfectDays = logStats[0]?.perfect_days || 0;

    const enrichedBadges = badges.map((badge) => {
      const isEarned = userBadgeMap.has(badge.id);
      const unlockedAt = userBadgeMap.get(badge.id) || null;

      let currentVal = 0;
      switch (badge.criterion_type) {
        case 'first_task':
        case 'total_tasks':
          currentVal = totalCompleted;
          break;
        case 'successful_days':
          currentVal = successfulDays;
          break;
        case 'streak_length':
          currentVal = bestStreak;
          break;
        case 'perfect_day':
          currentVal = perfectDays;
          break;
        case 'ten_in_one_day':
          currentVal = maxInSingleDay;
          break;
        default:
          currentVal = 0;
      }

      const progress = Math.min(100, Math.round((currentVal / badge.criterion_value) * 100));

      return {
        ...badge,
        is_earned: isEarned,
        unlocked_at: unlockedAt,
        current_value: currentVal,
        target_value: badge.criterion_value,
        progress_percentage: isEarned ? 100 : progress,
      };
    });

    res.json({
      badges: enrichedBadges,
      total_earned: userBadges.length,
      total_badges: badges.length,
    });
  } catch (err) {
    console.error('getBadges error:', err);
    res.status(500).json({ message: 'Failed to retrieve discipline badges.' });
  }
}

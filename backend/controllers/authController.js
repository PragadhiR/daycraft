import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { formatDate } from '../services/streakService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'daycraft_super_secret_jwt_key_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req, res) {
  try {
    const { name, email, password, daily_task_target } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const target = parseInt(daily_task_target, 10) || 3;

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, daily_task_target) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash, target]
    );

    const userId = result.insertId;

    // Initialize streaks record
    await pool.query(
      'INSERT INTO streaks (user_id, current_streak, longest_streak, total_successful_days, total_missed_days) VALUES (?, 0, 0, 0, 0)',
      [userId]
    );

    // Grant 2 starter Normal Freezes
    const today = formatDate();
    await pool.query(
      `INSERT INTO streak_freezes (user_id, freeze_type, status, earned_date, notes)
       VALUES 
       (?, 'normal', 'available', ?, 'Welcome bonus normal freeze #1'),
       (?, 'normal', 'available', ?, 'Welcome bonus normal freeze #2')`,
      [userId, today, userId, today]
    );

    // Sign JWT
    const token = jwt.sign(
      { id: userId, email: normalizedEmail, name: name.trim() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        daily_task_target: target,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Failed to create account. ' + err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, daily_task_target, created_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        daily_task_target: user.daily_task_target,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Failed to log in. ' + err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT id, name, email, daily_task_target, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = rows[0];

    // Get streak & freeze counts
    const [streakRows] = await pool.query(
      'SELECT current_streak, longest_streak, total_successful_days, total_missed_days FROM streaks WHERE user_id = ?',
      [userId]
    );

    const [freezes] = await pool.query(
      `SELECT 
        SUM(CASE WHEN freeze_type = 'normal' AND status = 'available' THEN 1 ELSE 0 END) as normal_available,
        SUM(CASE WHEN freeze_type = 'normal' AND status = 'used' THEN 1 ELSE 0 END) as normal_used,
        SUM(CASE WHEN freeze_type = 'pro' AND status = 'available' THEN 1 ELSE 0 END) as pro_available,
        SUM(CASE WHEN freeze_type = 'pro' AND status = 'used' THEN 1 ELSE 0 END) as pro_used
       FROM streak_freezes 
       WHERE user_id = ?`,
      [userId]
    );

    res.json({
      user,
      streaks: streakRows[0] || { current_streak: 0, longest_streak: 0, total_successful_days: 0, total_missed_days: 0 },
      freezes: {
        normal_available: freezes[0]?.normal_available || 0,
        normal_used: freezes[0]?.normal_used || 0,
        pro_available: freezes[0]?.pro_available || 0,
        pro_used: freezes[0]?.pro_used || 0,
      },
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, daily_task_target, currentPassword, newPassword } = req.body;

    if (name) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), userId]);
    }

    if (daily_task_target !== undefined) {
      const target = Math.max(1, parseInt(daily_task_target, 10) || 3);
      await pool.query('UPDATE users SET daily_task_target = ? WHERE id = ?', [target, userId]);
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
      const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!match) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
    }

    const [updated] = await pool.query(
      'SELECT id, name, email, daily_task_target, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully!',
      user: updated[0],
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
}

-- Daycraft Database Schema
-- Productivity and Discipline Tracker

CREATE DATABASE IF NOT EXISTS daycraft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE daycraft;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    daily_task_target INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category ENUM('Professional', 'Entertainment', 'Hobby / Habit') NOT NULL DEFAULT 'Professional',
    priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
    due_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_due_date (user_id, due_date),
    INDEX idx_user_category (user_id, category),
    INDEX idx_user_status (user_id, is_completed)
) ENGINE=InnoDB;

-- 3. Daily Activity / Log Table (Tracks daily outcomes for streaks)
CREATE TABLE IF NOT EXISTS daily_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    log_date DATE NOT NULL,
    tasks_completed INT NOT NULL DEFAULT 0,
    tasks_total INT NOT NULL DEFAULT 0,
    target_required INT NOT NULL DEFAULT 3,
    status ENUM('success', 'missed', 'frozen_normal', 'frozen_pro', 'in_progress') NOT NULL DEFAULT 'in_progress',
    penalty_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_user_log_date (user_id, log_date),
    INDEX idx_user_status_date (user_id, status, log_date)
) ENGINE=InnoDB;

-- 4. User Streaks Table
CREATE TABLE IF NOT EXISTS streaks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_successful_date DATE NULL,
    total_successful_days INT NOT NULL DEFAULT 0,
    total_missed_days INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Streak Freezes Table
CREATE TABLE IF NOT EXISTS streak_freezes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    freeze_type ENUM('normal', 'pro') NOT NULL,
    status ENUM('available', 'used') NOT NULL DEFAULT 'available',
    earned_date DATE NOT NULL,
    used_date DATE NULL,
    protected_date DATE NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_type (user_id, freeze_type)
) ENGINE=InnoDB;

-- 6. Badges Master Table
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon VARCHAR(64) NOT NULL,
    criterion_type ENUM('first_task', 'successful_days', 'streak_length', 'total_tasks', 'perfect_day', 'ten_in_one_day') NOT NULL,
    criterion_value INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. User Badges (Earned Badges) Table
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_user_badge (user_id, badge_id)
) ENGINE=InnoDB;

-- Seed Badges Catalog
INSERT INTO badges (slug, name, description, icon, criterion_type, criterion_value)
VALUES
('first_step', 'First Step', 'Completed your very first task on Daycraft.', 'CheckCircle2', 'first_task', 1),
('getting_started', 'Getting Started', 'Logged 3 successful discipline days.', 'Award', 'successful_days', 3),
('week_warrior', 'Week Warrior', 'Maintained an unbroken 7-day streak.', 'Flame', 'streak_length', 7),
('two_week_discipline', 'Two Week Discipline', 'Pushed through 14 consecutive disciplined days.', 'ShieldCheck', 'streak_length', 14),
('consistency', 'Consistency', 'An unstoppable 30-day streak milestone.', 'Crown', 'streak_length', 30),
('task_master', 'Task Master', 'Crushed a total of 50 tasks across all categories.', 'Zap', 'total_tasks', 50),
('hundred_club', 'Hundred Club', 'Entered the elite century club with 100 tasks.', 'Trophy', 'total_tasks', 100),
('perfect_day', 'Perfect Day', 'Completed 100% of all scheduled tasks in a day.', 'Sparkles', 'perfect_day', 1),
('ten_strong', 'Ten Strong', 'Completed 10 tasks in a single day & earned a Pro Freeze!', 'Target', 'ten_in_one_day', 10)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    icon = VALUES(icon),
    criterion_type = VALUES(criterion_type),
    criterion_value = VALUES(criterion_value);

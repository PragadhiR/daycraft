import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { 
  Flame, 
  Trophy, 
  Target, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Snowflake, 
  Award, 
  Filter,
  ArrowRight,
  Zap
} from 'lucide-react';

export default function DashboardPage({ setActivePage, onTriggerCelebration }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters for today's tasks
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      const res = await api.toggleTask(taskId);

      // Check if newly unlocked badges or pro freeze
      if (res.newlyUnlockedBadges && res.newlyUnlockedBadges.length > 0) {
        res.newlyUnlockedBadges.forEach((badge) => {
          onTriggerCelebration({
            type: 'badge',
            title: `Badge Unlocked: ${badge.name}!`,
            message: badge.description,
          });
        });
      }

      if (res.proFreezeAwarded) {
        onTriggerCelebration({
          type: 'pro_freeze',
          title: '⚡ Pro Freeze Awarded!',
          message: 'You crushed 10 tasks in a single day! Enjoy your zero-penalty Pro Freeze.',
        });
      }

      // Refresh dashboard to reflect new progress, streaks and badges
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to toggle task');
    }
  };

  const handleSaveTask = async (taskPayload) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, taskPayload);
    } else {
      await api.createTask(taskPayload);
    }
    fetchDashboard();
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(taskId);
        fetchDashboard();
      } catch (err) {
        alert(err.message || 'Failed to delete task');
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p>Loading your Daycraft dashboard...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card" style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center', padding: 32 }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: 16 }}>{error}</p>
        <button onClick={fetchDashboard} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const { userName, todayDate, progress, streaks, freezes, badges, todayTasks } = data || {};

  // Format today's date nicely: e.g. "Wednesday, October 7, 2026"
  const formattedToday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Filter tasks in memory
  const filteredTasks = (todayTasks || []).filter((task) => {
    if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;
    if (statusFilter === 'incomplete' && task.is_completed) return false;
    if (statusFilter === 'completed' && !task.is_completed) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Greeting Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Good day, {userName} 👋
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} />
            <span>{formattedToday}</span>
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ padding: '10px 18px' }}>
          <Plus size={18} /> Add Today's Task
        </button>
      </div>

      {/* Freeze Accountability Penalty Notice (if Normal Freeze was used yesterday) */}
      {progress?.penaltyActive && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#92400e',
        }}>
          <AlertTriangle size={20} flexShrink={0} />
          <div style={{ fontSize: '0.875rem' }}>
            <strong>Accountability Penalty Active:</strong> You protected yesterday with a Normal Freeze.
            Today's target is increased by +2 tasks ({progress.targetRequired} total required) to keep your streak intact!
          </div>
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid-cols-4">
        {/* Card 1: Today's Progress */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Today's Progress</span>
              <Target size={18} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {progress?.completed} / {progress?.targetRequired}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>
                tasks
              </span>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            {/* Progress bar */}
            <div style={{
              height: 8,
              backgroundColor: '#e2e8f0',
              borderRadius: 99,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: `${progress?.percentage || 0}%`,
                backgroundColor: progress?.isTargetMet ? 'var(--color-success)' : 'var(--primary)',
                borderRadius: 99,
                transition: 'width 0.3s ease',
              }} />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 6,
              fontSize: '0.785rem',
              color: 'var(--text-muted)',
            }}>
              <span>{progress?.percentage}% target reached</span>
              {progress?.isTargetMet ? (
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>Day Secured! ✓</span>
              ) : (
                <span>{progress?.remainingToTarget} more to secure</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Current Streak */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Current Streak</span>
              <Flame size={18} color="#ea580c" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ea580c' }}>
              {streaks?.current || 0}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 6 }}>
                days
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 14 }}>
            Longest streak: <strong>{streaks?.longest || 0} days</strong>
          </div>
        </div>

        {/* Card 3: Freezes Available */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Streak Shields</span>
              <Snowflake size={18} color="#0891b2" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {freezes?.normalAvailable || 0}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Normal</span>
              </div>
              <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-light)' }} />
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed' }}>
                  {freezes?.proAvailable || 0}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Pro</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 14 }}>
            Protect missed days in <button onClick={() => setActivePage('history')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>History</button>
          </div>
        </div>

        {/* Card 4: Badges Earned */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Discipline Badges</span>
              <Award size={18} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {badges?.totalEarned || 0}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>
                unlocked
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 14 }}>
            <button
              onClick={() => setActivePage('badges')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View all badges <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: Today's Tasks */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: 16,
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Today's Action Plan
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {progress?.completed} completed of {todayTasks?.length || 0} scheduled today
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Category filter pills */}
            <div style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: 3,
              borderRadius: 'var(--radius-md)',
              gap: 2,
            }}>
              {['All', 'Professional', 'Entertainment', 'Hobby / Habit'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    fontWeight: categoryFilter === cat ? 700 : 500,
                    backgroundColor: categoryFilter === cat ? '#ffffff' : 'transparent',
                    color: categoryFilter === cat ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: categoryFilter === cat ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat === 'Hobby / Habit' ? 'Habits' : cat}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.825rem', width: 'auto' }}
            >
              <option value="all">All Status</option>
              <option value="incomplete">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
        </div>

        {/* Task Cards List */}
        {filteredTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-light)',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 12 }}>
              {todayTasks?.length === 0
                ? "No tasks scheduled for today yet. Add your first task to start today's streak!"
                : 'No tasks match your selected filter.'}
            </p>
            {todayTasks?.length === 0 && (
              <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultDate={todayDate}
      />
    </div>
  );
}

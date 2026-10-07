import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import FreezeModal from '../components/FreezeModal';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Snowflake, 
  Zap, 
  Clock, 
  TrendingUp, 
  PieChart, 
  ShieldCheck, 
  Briefcase, 
  Film, 
  Heart 
} from 'lucide-react';

export default function HistoryPage({ onTriggerCelebration }) {
  const [historyData, setHistoryData] = useState(null);
  const [streakStats, setStreakStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Freeze Modal State
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [dateToProtect, setDateToProtect] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [hist, streaks] = await Promise.all([
        api.getHistoryStats(),
        api.getStreakStats(),
      ]);
      setHistoryData(hist);
      setStreakStats(streaks);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyFreeze = async (freezeType, dateStr) => {
    const res = await api.useFreeze(freezeType, dateStr);
    onTriggerCelebration({
      type: freezeType === 'pro' ? 'pro_freeze' : 'freeze',
      title: 'Streak Protected!',
      message: res.message,
    });
    loadData();
  };

  const openFreezeModal = (dateStr) => {
    setDateToProtect(dateStr);
    setFreezeModalOpen(true);
  };

  if (loading && !historyData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        Loading your productivity history...
      </div>
    );
  }

  const { dailyLogs = [], totals = {}, categories = [] } = historyData || {};

  const getStatusBadge = (log) => {
    switch (log.status) {
      case 'success':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 99,
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            <CheckCircle2 size={14} /> Success
          </span>
        );

      case 'frozen_normal':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 99,
            backgroundColor: '#ecfeff',
            color: '#0891b2',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            <Snowflake size={14} /> Normal Freeze (+2 Penalty)
          </span>
        );

      case 'frozen_pro':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 99,
            backgroundColor: '#f5f3ff',
            color: '#6b21a8',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            <Zap size={14} /> Pro Freeze (Shielded)
          </span>
        );

      case 'missed':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 99,
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}>
              <XCircle size={14} /> Missed
            </span>
            <button
              onClick={() => openFreezeModal(log.log_date.split('T')[0])}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#0891b2', color: '#0891b2' }}
            >
              <Snowflake size={13} /> Protect
            </button>
          </div>
        );

      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 99,
            backgroundColor: '#fffbeb',
            color: '#92400e',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            <Clock size={14} /> In Progress
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          History & Analytics
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Detailed record of your discipline milestones, daily logs, and consistency rate
        </p>
      </div>

      {/* Aggregate Productivity Cards */}
      <div className="grid-cols-4">
        <div className="card">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Total Tasks Completed
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)' }}>
            {totals.completedTasks || 0}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 6 }}>
              / {totals.totalTasks || 0} total
            </span>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Successful Days
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {totals.successDays || 0}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 6 }}>
              days
            </span>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Missed Days
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-danger)' }}>
            {totals.missedDays || 0}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 6 }}>
              days
            </span>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Discipline Success Rate
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {totals.successRate || 0}%
          </div>
        </div>
      </div>

      {/* Category Breakdown Card */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
          Category Distribution
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {categories.map((cat) => {
            const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
            return (
              <div key={cat.category} style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.category}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{pct}% done</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {cat.completed} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>of {cat.total} tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
          Daily Discipline Log
        </h3>

        {dailyLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
            No daily activity recorded yet. Start completing tasks to build your log!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>Tasks Completed</th>
                  <th style={{ padding: '12px 14px' }}>Daily Goal</th>
                  <th style={{ padding: '12px 14px' }}>Outcome / Status</th>
                </tr>
              </thead>
              <tbody>
                {dailyLogs.map((log) => {
                  const dStr = log.log_date.split('T')[0];
                  const dFormatted = new Date(dStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={dStr} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 14px', fontWeight: 600 }}>{dFormatted}</td>
                      <td style={{ padding: '14px 14px' }}>
                        {log.tasks_completed} of {log.tasks_total}
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        {log.target_required} tasks
                        {log.penalty_active ? ' (+2 Penalty)' : ''}
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        {getStatusBadge(log)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Freeze Modal */}
      <FreezeModal
        isOpen={freezeModalOpen}
        onClose={() => setFreezeModalOpen(false)}
        dateToProtect={dateToProtect}
        freezes={streakStats?.freezes}
        onApplyFreeze={handleApplyFreeze}
      />
    </div>
  );
}

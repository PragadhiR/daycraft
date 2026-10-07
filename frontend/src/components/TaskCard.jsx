import React from 'react';
import { Check, Edit3, Trash2, Calendar, Briefcase, Film, Heart } from 'lucide-react';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const getCategoryClass = (cat) => {
    switch (cat) {
      case 'Entertainment':
        return 'entertainment';
      case 'Hobby / Habit':
        return 'hobby-habit';
      default:
        return 'professional';
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Entertainment':
        return <Film size={12} />;
      case 'Hobby / Habit':
        return <Heart size={12} />;
      default:
        return <Briefcase size={12} />;
    }
  };

  const getPriorityClass = (pri) => {
    switch (pri) {
      case 'High':
        return 'high';
      case 'Low':
        return 'low';
      default:
        return 'medium';
    }
  };

  // Format date display
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: `1px solid ${task.is_completed ? '#e2e8f0' : '#cbd5e1'}`,
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      transition: 'all 0.15s ease',
      boxShadow: 'var(--shadow-sm)',
      opacity: task.is_completed ? 0.75 : 1,
    }}>
      {/* Custom Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.is_completed ? 'Mark incomplete' : 'Mark completed'}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `2px solid ${task.is_completed ? 'var(--primary)' : '#94a3b8'}`,
          backgroundColor: task.is_completed ? 'var(--primary)' : 'transparent',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: 2,
          padding: 0,
          transition: 'all 0.15s ease',
        }}
      >
        {task.is_completed && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Main Task Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: task.is_completed ? 'var(--text-muted)' : 'var(--text-main)',
            textDecoration: task.is_completed ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}>
            {task.title}
          </h4>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => onEdit(task)}
              className="btn btn-ghost btn-sm"
              title="Edit task"
              style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="btn btn-ghost btn-sm"
              title="Delete task"
              style={{ padding: '4px 6px', color: '#ef4444' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {task.description && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: 4,
            marginBottom: 10,
            lineHeight: 1.4,
            whiteSpace: 'pre-line',
          }}>
            {task.description}
          </p>
        )}

        {/* Tags footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: task.description ? 0 : 8, flexWrap: 'wrap' }}>
          {/* Category */}
          <span className={`badge-category ${getCategoryClass(task.category)}`}>
            {getCategoryIcon(task.category)}
            {task.category}
          </span>

          {/* Priority */}
          <span className={`badge-priority ${getPriorityClass(task.priority)}`}>
            {task.priority} Priority
          </span>

          {/* Due date */}
          {task.due_date && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              <Calendar size={12} />
              {formatDateLabel(task.due_date)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

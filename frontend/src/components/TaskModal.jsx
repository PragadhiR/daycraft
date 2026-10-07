import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, AlertCircle } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, initialTask, defaultDate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Professional');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCategory(initialTask.category || 'Professional');
      setPriority(initialTask.priority || 'Medium');
      // Format YYYY-MM-DD
      const d = initialTask.due_date ? initialTask.due_date.split('T')[0] : '';
      setDueDate(d);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Professional');
      setPriority('Medium');
      setDueDate(defaultDate || new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [initialTask, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        due_date: dueDate,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger-text)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Complete sprint deliverables or 30 min reading"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Add any specific context, sub-goals, or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Professional">Professional</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Hobby / Habit">Hobby / Habit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

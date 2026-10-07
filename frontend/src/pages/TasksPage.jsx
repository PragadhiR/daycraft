import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { 
  Plus, 
  Calendar, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function TasksPage({ onTriggerCelebration }) {
  // Format local date YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks({
        date: selectedDate,
        category: categoryFilter,
        priority: priorityFilter,
        status: statusFilter,
      });
      setTasks(res);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate, categoryFilter, priorityFilter, statusFilter]);

  const handleDateShift = (deltaDays) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleToggle = async (taskId) => {
    try {
      const res = await api.toggleTask(taskId);

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
          message: '10 tasks completed in one day! Pro Freeze added to inventory.',
        });
      }

      fetchTasks();
    } catch (err) {
      alert(err.message || 'Failed to toggle task');
    }
  };

  const handleSave = async (payload) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, payload);
    } else {
      await api.createTask(payload);
    }
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await api.deleteTask(taskId);
        fetchTasks();
      } catch (err) {
        alert(err.message || 'Failed to delete task');
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!searchTerm) return true;
    const matchTitle = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDesc = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTitle || matchDesc;
  });

  const completedCount = tasks.filter((t) => t.is_completed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header & Date Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Task Planner
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Manage and schedule your daily discipline actions
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      {/* Date Switcher Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          {/* Quick buttons: Prev, Current, Next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => handleDateShift(-1)}
              className="btn btn-secondary btn-sm"
              title="Previous Day"
              style={{ padding: '6px 10px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setSelectedDate(getTodayString())}
              className={`btn btn-sm ${selectedDate === getTodayString() ? 'btn-primary' : 'btn-secondary'}`}
            >
              Today
            </button>
            <button
              onClick={() => handleDateShift(1)}
              className="btn btn-secondary btn-sm"
              title="Next Day"
              style={{ padding: '6px 10px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Date Picker Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color="var(--primary)" />
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Task count summary */}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>{completedCount}</strong> of <strong>{tasks.length}</strong> tasks completed
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          alignItems: 'center',
        }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 36, fontSize: '0.875rem' }}
            />
          </div>

          {/* Category Filter */}
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          >
            <option value="All">All Categories</option>
            <option value="Professional">Professional</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Hobby / Habit">Hobby / Habit</option>
          </select>

          {/* Priority Filter */}
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          >
            <option value="all">All Status</option>
            <option value="incomplete">Pending Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card" style={{
            textAlign: 'center',
            padding: '48px 20px',
            backgroundColor: '#ffffff',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 16 }}>
              No tasks found for {selectedDate}.
            </p>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} /> Create Task for this day
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialTask={editingTask}
        defaultDate={selectedDate}
      />
    </div>
  );
}

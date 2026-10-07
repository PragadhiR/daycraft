import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RegisterPage({ onGoToLogin, onGoToHome }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dailyTaskTarget, setDailyTaskTarget] = useState(3);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name.trim(), email.trim(), password, parseInt(dailyTaskTarget, 10));
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Back Link */}
        <button
          onClick={onGoToHome}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="card" style={{ padding: '32px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 44,
              height: 44,
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.4rem',
              marginBottom: 12,
            }}>
              D
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Create your Daycraft account
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Start building discipline streaks and earning badges
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 18,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Daily Task Target (Tasks required for a Successful Day)
              </label>
              <select
                className="form-select"
                value={dailyTaskTarget}
                onChange={(e) => setDailyTaskTarget(Number(e.target.value))}
              >
                <option value={1}>1 task / day (Light)</option>
                <option value={2}>2 tasks / day (Easy)</option>
                <option value={3}>3 tasks / day (Recommended)</option>
                <option value={4}>4 tasks / day (Balanced)</option>
                <option value={5}>5 tasks / day (Disciplined)</option>
                <option value={7}>7 tasks / day (High Output)</option>
                <option value={10}>10 tasks / day (Beast Mode)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Get Started'}
            </button>
          </form>

          <div style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}>
            Already have an account?{' '}
            <button
              onClick={onGoToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

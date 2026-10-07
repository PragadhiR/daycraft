import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage({ onGoToRegister, onGoToHome }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
      <div style={{ width: '100%', maxWidth: 420 }}>
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
              Welcome back to Daycraft
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Enter your credentials to continue your streak
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
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
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}>
            Don't have an account yet?{' '}
            <button
              onClick={onGoToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

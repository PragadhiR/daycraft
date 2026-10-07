import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, 
  Settings, 
  Snowflake, 
  Zap, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [dailyTarget, setDailyTarget] = useState(3);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Feedback
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getProfile();
      setProfileData(res);
      setName(res.user.name);
      setDailyTarget(res.user.daily_task_target);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMessage({ type: '', text: '' });
      const res = await api.updateProfile({
        name,
        daily_task_target: parseInt(dailyTarget, 10),
      });
      updateUser(res.user);
      setProfileMessage({ type: 'success', text: 'Profile preferences updated successfully!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update preferences.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordMessage({ type: '', text: '' });
      await api.updateProfile({
        currentPassword,
        newPassword,
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        Loading profile settings...
      </div>
    );
  }

  const { freezes = {} } = profileData || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          Profile & Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Manage your account settings, daily targets, and streak freeze inventory
        </p>
      </div>

      {/* Freeze Inventory Card */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16 }}>
          Streak Freeze Inventory
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* Normal Freezes */}
          <div style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-md)',
            padding: 18,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Snowflake size={20} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-hover)' }}>Normal Freeze</span>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                {freezes.normal_available || 0}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Protects an uncompleted day.
            </p>
            <p style={{ fontSize: '0.785rem', color: '#92400e', marginTop: 4, fontWeight: 600 }}>
              ⚠️ Penalty: Next day requires +2 additional tasks.
            </p>
          </div>

          {/* Pro Freezes */}
          <div style={{
            backgroundColor: '#f5f3ff',
            border: '1px solid #ddd6fe',
            borderRadius: 'var(--radius-md)',
            padding: 18,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={20} color="#8b5cf6" />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#5b21b6' }}>Pro Freeze</span>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed' }}>
                {freezes.pro_available || 0}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Earned by completing 10 tasks in one single day.
            </p>
            <p style={{ fontSize: '0.785rem', color: '#065f46', marginTop: 4, fontWeight: 600 }}>
              ✓ Zero penalty protection.
            </p>
          </div>
        </div>
      </div>

      {/* Account Preferences Form */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16 }}>
          Personal Preferences
        </h3>

        {profileMessage.text && (
          <div style={{
            backgroundColor: profileMessage.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            color: profileMessage.type === 'success' ? 'var(--color-success-text)' : 'var(--color-danger-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {profileMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{profileMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateSettings}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Daily Target (Minimum tasks needed for a Successful Day streak)
            </label>
            <select
              className="form-select"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(Number(e.target.value))}
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

          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16 }}>
          Change Password
        </h3>

        {passwordMessage.text && (
          <div style={{
            backgroundColor: passwordMessage.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            color: passwordMessage.type === 'success' ? 'var(--color-success-text)' : 'var(--color-danger-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {passwordMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter new password (at least 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-secondary" disabled={savingPassword}>
            {savingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Logout Action */}
      <div className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Sign Out</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Safely log out of your current session on this device
          </p>
        </div>
        <button onClick={logout} className="btn btn-danger">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

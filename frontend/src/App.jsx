import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import CelebrationToast from './components/CelebrationToast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import HistoryPage from './pages/HistoryPage';
import BadgesPage from './pages/BadgesPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { user, loading } = useAuth();

  // Non-authenticated view: 'landing' | 'login' | 'register'
  const [authView, setAuthView] = useState('landing');

  // Authenticated view: 'dashboard' | 'tasks' | 'history' | 'badges' | 'profile'
  const [activePage, setActivePage] = useState('dashboard');

  // Global navbar streak stats
  const [streakStats, setStreakStats] = useState(null);

  // Global celebration notifications queue
  const [notifications, setNotifications] = useState([]);

  const addCelebration = (notification) => {
    setNotifications((prev) => [...prev, notification]);
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n !== notification));
    }, 6000);
  };

  const handleDismissNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch streak info for navbar
  useEffect(() => {
    if (user) {
      api.getStreakStats()
        .then((res) => setStreakStats(res.streaks))
        .catch((err) => console.warn('Could not fetch streak stats for navbar:', err.message));
    }
  }, [user, activePage]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 24,
            height: 24,
            border: '3px solid var(--primary-border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontWeight: 600 }}>Loading Daycraft...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated flow
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onGoToRegister={() => setAuthView('register')}
          onGoToHome={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onGoToLogin={() => setAuthView('login')}
          onGoToHome={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGoToLogin={() => setAuthView('login')}
        onGoToRegister={() => setAuthView('register')}
      />
    );
  }

  // Authenticated App layout
  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        streakStats={streakStats}
      />

      <main className="main-content">
        {activePage === 'dashboard' && (
          <DashboardPage
            setActivePage={setActivePage}
            onTriggerCelebration={addCelebration}
          />
        )}
        {activePage === 'tasks' && (
          <TasksPage
            onTriggerCelebration={addCelebration}
          />
        )}
        {activePage === 'history' && (
          <HistoryPage
            onTriggerCelebration={addCelebration}
          />
        )}
        {activePage === 'badges' && (
          <BadgesPage />
        )}
        {activePage === 'profile' && (
          <ProfilePage />
        )}
      </main>

      <CelebrationToast
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  Snowflake, 
  Award, 
  CheckSquare, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard 
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, streakStats }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 20px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div 
          onClick={() => setActivePage('dashboard')} 
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 36,
            height: 36,
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.2rem',
          }}>
            D
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Day<span style={{ color: 'var(--primary)' }}>craft</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Streak Pill & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {streakStats && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fff7ed',
              border: '1px solid #ffedd5',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              color: '#c2410c',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}>
              <Flame size={16} fill="#ea580c" color="#ea580c" />
              <span>{streakStats.current || 0}d streak</span>
            </div>
          )}

          <div className="desktop-user" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.name}
            </span>
            <button
              onClick={logout}
              title="Logout"
              className="btn btn-ghost btn-sm"
              style={{ padding: 6, color: 'var(--text-muted)' }}
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle btn btn-ghost btn-sm"
            style={{ padding: 6 }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          padding: '12px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
          <div style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name}</span>
            <button
              onClick={logout}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-danger)' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-user { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}

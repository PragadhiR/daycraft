import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Award, 
  Flame, 
  CheckCircle2, 
  ShieldCheck, 
  Crown, 
  Zap, 
  Trophy, 
  Sparkles, 
  Target, 
  Lock, 
  Unlock 
} from 'lucide-react';

export default function BadgesPage() {
  const [badgeData, setBadgeData] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'earned', 'locked'
  const [loading, setLoading] = useState(true);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const res = await api.getBadges();
      setBadgeData(res);
    } catch (err) {
      console.error('Failed to load badges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const getBadgeIcon = (iconName, isEarned) => {
    const props = {
      size: 28,
      color: isEarned ? 'var(--primary)' : 'var(--text-light)',
    };

    switch (iconName) {
      case 'Flame':
        return <Flame {...props} color={isEarned ? '#ea580c' : 'var(--text-light)'} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} color={isEarned ? '#0284c7' : 'var(--text-light)'} />;
      case 'Crown':
        return <Crown {...props} color={isEarned ? '#eab308' : 'var(--text-light)'} />;
      case 'Zap':
        return <Zap {...props} color={isEarned ? '#8b5cf6' : 'var(--text-light)'} />;
      case 'Trophy':
        return <Trophy {...props} color={isEarned ? '#f59e0b' : 'var(--text-light)'} />;
      case 'Sparkles':
        return <Sparkles {...props} color={isEarned ? '#ec4899' : 'var(--text-light)'} />;
      case 'Target':
        return <Target {...props} color={isEarned ? '#10b981' : 'var(--text-light)'} />;
      case 'CheckCircle2':
        return <CheckCircle2 {...props} color={isEarned ? 'var(--primary)' : 'var(--text-light)'} />;
      default:
        return <Award {...props} />;
    }
  };

  if (loading && !badgeData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        Loading badges catalog...
      </div>
    );
  }

  const { badges = [], total_earned = 0, total_badges = 0 } = badgeData || {};

  const filteredBadges = badges.filter((b) => {
    if (filter === 'earned') return b.is_earned;
    if (filter === 'locked') return !b.is_earned;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Discipline Badges
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Unlock discipline milestones as you maintain streaks and crush daily goals
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          gap: 4,
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: filter === 'all' ? 700 : 500,
              backgroundColor: filter === 'all' ? '#ffffff' : 'transparent',
              color: filter === 'all' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            All ({total_badges})
          </button>
          <button
            onClick={() => setFilter('earned')}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: filter === 'earned' ? 700 : 500,
              backgroundColor: filter === 'earned' ? '#ffffff' : 'transparent',
              color: filter === 'earned' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Earned ({total_earned})
          </button>
          <button
            onClick={() => setFilter('locked')}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: filter === 'locked' ? 700 : 500,
              backgroundColor: filter === 'locked' ? '#ffffff' : 'transparent',
              color: filter === 'locked' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Locked ({total_badges - total_earned})
          </button>
        </div>
      </div>

      {/* Pro Freeze Informational Card */}
      <div style={{
        backgroundColor: '#f5f3ff',
        border: '1px solid #ddd6fe',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#8b5cf6',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={24} />
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#5b21b6' }}>
            Ten Strong Challenge: Earn a Pro Freeze!
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#6d28d9', marginTop: 4 }}>
            Complete <strong>10 tasks in a single day</strong> to unlock the <em>Ten Strong</em> badge and receive a <strong>Pro Freeze</strong>.
            Unlike normal freezes, Pro Freezes shield your streak with zero next-day task penalties.
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 18,
      }}>
        {filteredBadges.map((badge) => {
          const isEarned = badge.is_earned;
          const unlockDate = badge.unlocked_at
            ? new Date(badge.unlocked_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : null;

          return (
            <div
              key={badge.id}
              className="card"
              style={{
                backgroundColor: isEarned ? '#ffffff' : '#f8fafc',
                border: isEarned ? '1px solid var(--primary-border)' : '1px dashed var(--border-light)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isEarned ? 'var(--primary-light)' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    {getBadgeIcon(badge.icon, isEarned)}
                  </div>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 99,
                    backgroundColor: isEarned ? '#ecfdf5' : '#f1f5f9',
                    color: isEarned ? '#065f46' : 'var(--text-muted)',
                  }}>
                    {isEarned ? <Unlock size={12} /> : <Lock size={12} />}
                    {isEarned ? 'Earned' : 'Locked'}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: isEarned ? 'var(--text-main)' : 'var(--text-muted)',
                  marginBottom: 6,
                }}>
                  {badge.name}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                  {badge.description}
                </p>
              </div>

              {/* Footer: Date or Progress bar */}
              <div>
                {isEarned ? (
                  <div style={{
                    fontSize: '0.785rem',
                    color: 'var(--color-success)',
                    fontWeight: 600,
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: 10,
                  }}>
                    ✓ Unlocked on {unlockDate}
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Progress</span>
                      <span>{badge.current_value} / {badge.target_value}</span>
                    </div>
                    <div style={{
                      height: 6,
                      backgroundColor: '#e2e8f0',
                      borderRadius: 99,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${badge.progress_percentage}%`,
                        backgroundColor: 'var(--primary)',
                        borderRadius: 99,
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

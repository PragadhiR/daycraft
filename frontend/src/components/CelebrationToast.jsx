import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Zap, X } from 'lucide-react';

export default function CelebrationToast({ notifications, onDismiss }) {
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Fallback silently if canvas not available
      }
    }
  }, [notifications]);

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map((item, idx) => (
        <div key={idx} className="toast" style={{
          backgroundColor: '#ffffff',
          borderLeft: `4px solid ${item.type === 'pro_freeze' ? '#8b5cf6' : 'var(--primary)'}`,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: item.type === 'pro_freeze' ? '#f5f3ff' : 'var(--primary-light)',
            color: item.type === 'pro_freeze' ? '#7c3aed' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {item.type === 'pro_freeze' ? <Zap size={20} /> : <Award size={20} />}
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {item.title}
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {item.message}
            </p>
          </div>

          <button
            onClick={() => onDismiss(idx)}
            className="btn btn-ghost btn-sm"
            style={{ padding: 2, color: 'var(--text-light)' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

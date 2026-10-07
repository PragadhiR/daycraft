import React, { useState } from 'react';
import { Snowflake, ShieldCheck, AlertTriangle, Zap, X, Check } from 'lucide-react';

export default function FreezeModal({ isOpen, onClose, dateToProtect, freezes, onApplyFreeze }) {
  const [selectedType, setSelectedType] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const normalAvailable = freezes?.normal_available ?? 0;
  const proAvailable = freezes?.pro_available ?? 0;

  const handleSubmit = async () => {
    if (selectedType === 'normal' && normalAvailable <= 0) {
      setError('You have no Normal Freezes available.');
      return;
    }
    if (selectedType === 'pro' && proAvailable <= 0) {
      setError('You have no Pro Freezes available.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onApplyFreeze(selectedType, dateToProtect);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to apply streak freeze.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfeff',
              color: '#0891b2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Snowflake size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Protect Streak</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Shield missed day: {dateToProtect}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Select which streak shield to activate for this date:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Normal Freeze Option */}
            <div 
              onClick={() => normalAvailable > 0 && setSelectedType('normal')}
              style={{
                border: `2px solid ${selectedType === 'normal' ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                cursor: normalAvailable > 0 ? 'pointer' : 'not-allowed',
                backgroundColor: selectedType === 'normal' ? 'var(--primary-light)' : '#ffffff',
                opacity: normalAvailable > 0 ? 1 : 0.6,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Snowflake size={20} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Normal Freeze</span>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  backgroundColor: '#f1f5f9',
                  color: 'var(--text-main)',
                }}>
                  {normalAvailable} Available
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Protects streak from resetting.
              </p>
              <div style={{
                marginTop: 8,
                fontSize: '0.785rem',
                backgroundColor: '#fffbeb',
                color: '#92400e',
                padding: '6px 10px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <AlertTriangle size={14} flexShrink={0} />
                <span><strong>Penalty:</strong> Following day requires +2 additional tasks.</span>
              </div>
            </div>

            {/* Pro Freeze Option */}
            <div 
              onClick={() => proAvailable > 0 && setSelectedType('pro')}
              style={{
                border: `2px solid ${selectedType === 'pro' ? '#8b5cf6' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                cursor: proAvailable > 0 ? 'pointer' : 'not-allowed',
                backgroundColor: selectedType === 'pro' ? '#f5f3ff' : '#ffffff',
                opacity: proAvailable > 0 ? 1 : 0.6,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Zap size={20} color="#8b5cf6" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#5b21b6' }}>Pro Freeze</span>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  backgroundColor: '#f3e8ff',
                  color: '#6b21a8',
                }}>
                  {proAvailable} Available
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Earned by completing 10 tasks in one single day.
              </p>
              <div style={{
                marginTop: 8,
                fontSize: '0.785rem',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                padding: '6px 10px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <ShieldCheck size={14} flexShrink={0} />
                <span><strong>Zero Penalty:</strong> Protects streak with NO extra tasks required!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isSubmitting || (selectedType === 'normal' && normalAvailable <= 0) || (selectedType === 'pro' && proAvailable <= 0)}
          >
            {isSubmitting ? 'Protecting...' : `Use ${selectedType === 'pro' ? 'Pro' : 'Normal'} Freeze`}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Flame, Snowflake, Award, CheckCircle2, ShieldCheck, ArrowRight, Zap, Target } from 'lucide-react';

export default function LandingPage({ onGoToRegister, onGoToLogin }) {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '24px 20px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
          }}>
            D
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Day<span style={{ color: 'var(--primary)' }}>craft</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onGoToLogin} className="btn btn-secondary">
            Sign In
          </button>
          <button onClick={onGoToRegister} className="btn btn-primary">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: 960,
        margin: '40px auto 30px',
        padding: '0 20px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary-hover)',
          padding: '6px 14px',
          borderRadius: 99,
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: 20,
          border: '1px solid var(--primary-border)',
        }}>
          <Flame size={16} fill="var(--primary)" color="var(--primary)" />
          The Discipline & Streak Operating System
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          color: 'var(--text-main)',
          marginBottom: 20,
        }}>
          Craft your days. <br />
          <span style={{ color: 'var(--primary)' }}>Build unbreakable habits.</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: 680,
          margin: '0 auto 32px',
          lineHeight: 1.6,
        }}>
          Daycraft goes beyond simple checklists. Build real daily streaks, balance professional and personal life, earn discipline badges, and protect your streak with smart freeze shields.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={onGoToRegister}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' }}
          >
            Start Your Free Journey <ArrowRight size={18} />
          </button>
          <button
            onClick={onGoToLogin}
            className="btn btn-secondary"
            style={{ padding: '14px 24px', fontSize: '1.05rem' }}
          >
            Existing Member Sign In
          </button>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{
        maxWidth: 1100,
        margin: '40px auto 60px',
        padding: '0 20px',
        width: '100%',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {/* Card 1: Streaks */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Flame size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
              Real Discipline Streaks
            </h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Streaks aren't awarded for ticking random boxes. Complete your designated daily task target to turn each day into a verified success.
            </p>
          </div>

          {/* Card 2: Freeze Shield */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfeff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Snowflake size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
              Streak Freezes & Pro Freezes
            </h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Missed a day? Use a <strong>Normal Freeze</strong> (with a +2 task accountability penalty tomorrow) or complete 10 tasks in one day to unlock a <strong>Pro Freeze</strong> with zero penalties.
            </p>
          </div>

          {/* Card 3: Categorized Balance */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
              3 Life Categories
            </h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Organize your actions into <strong>Professional</strong>, <strong>Entertainment</strong>, and <strong>Hobby / Habit</strong>. Keep your growth balanced and purposeful.
            </p>
          </div>

          {/* Card 4: Badges */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
              Discipline Badges
            </h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Unlock milestones like First Step, Week Warrior, Consistency (30 days), Ten Strong, and Hundred Club. Celebrate tangible growth.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-light)',
        padding: '24px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
      }}>
        Daycraft Productivity App — Crafted for high performers & daily consistency.
      </footer>
    </div>
  );
}

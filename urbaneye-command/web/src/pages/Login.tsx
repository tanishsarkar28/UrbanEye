import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2, UserCheck, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
  onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('head.kapurthala@urbaneye.gov.in');
  const [password, setPassword] = useState('UrbanEye@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      localStorage.setItem('urbaneye_token', res.token);
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Invalid government credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('UrbanEye@2026');
    setError(null);
  };

  /* ── Theme-aware tokens ── */
  const pageBg     = isDark ? '#07162c' : '#f1f5f9';
  const cardBg     = isDark ? '#0f1f38' : '#ffffff';
  const cardBorder = isDark ? '#1e3a5f' : '#e2e8f0';
  const labelClr   = isDark ? '#e2e8f0' : '#1e293b';
  const iconClr    = isDark ? '#64748b' : '#94a3b8';
  const inputBg    = isDark ? '#0f172a' : '#f8fafc';
  const inputBdr   = isDark ? '#334155' : '#cbd5e1';
  const inputClr   = isDark ? '#f1f5f9' : '#0f172a';
  const btnBg      = '#1E7F73';
  const btnHover   = '#186a60';
  const divClr     = isDark ? '#1e3a5f' : '#e2e8f0';
  const hintClr    = isDark ? '#94a3b8' : '#64748b';
  const codeClr    = isDark ? '#94a3b8' : '#475569';
  const btnRowBg   = isDark ? '#1e293b' : '#f1f5f9';
  const btnRowBdr  = isDark ? '#334155' : '#e2e8f0';
  const btnRowClr  = isDark ? '#cbd5e1' : '#334155';

  /* Crucial: fontSize 16px (1rem) prevents iOS Safari auto-zoom on focus */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontSize: '1rem', // >= 16px
    minHeight: '44px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${inputBdr}`,
    backgroundColor: inputBg,
    color: inputClr,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const personas = [
    { e: 'head.kapurthala@urbaneye.gov.in', label: '★ District Head (Kapurthala Demo)', badge: 'LIVE DEMO', badgeColor: '#fbbf24', activeBg: isDark ? '#7c5408' : '#fef3c7', activeColor: isDark ? '#fcd34d' : '#92400e' },
    { e: 'head.jalandhar@urbaneye.gov.in',  label: 'District Head (Jalandhar)',            badge: 'Scoped',    badgeColor: '#64748b', activeBg: isDark ? '#065f46' : '#ecfdf5', activeColor: isDark ? '#6ee7b7' : '#065f46' },
    { e: 'admin.pb@urbaneye.gov.in',       label: 'State Admin (Punjab)',                 badge: 'State',     badgeColor: '#64748b', activeBg: isDark ? '#1e3a8a' : '#eff6ff', activeColor: isDark ? '#93c5fd' : '#1e3a8a' },
    { e: 'head.mumbai@urbaneye.gov.in',    label: 'District Head (Mumbai Suburban)',      badge: 'Scoped',    badgeColor: '#64748b', activeBg: isDark ? '#065f46' : '#ecfdf5', activeColor: isDark ? '#6ee7b7' : '#065f46' },
    { e: 'head.bengaluru@urbaneye.gov.in', label: 'District Head (Bengaluru Urban)',      badge: 'Scoped',    badgeColor: '#64748b', activeBg: isDark ? '#065f46' : '#ecfdf5', activeColor: isDark ? '#6ee7b7' : '#065f46' },
    { e: 'admin.mh@urbaneye.gov.in',       label: 'State Admin (Maharashtra)',            badge: 'State',     badgeColor: '#64748b', activeBg: isDark ? '#1e3a8a' : '#eff6ff', activeColor: isDark ? '#93c5fd' : '#1e3a8a' },
    { e: 'admin@urbaneye.gov.in',          label: 'National Admin (All India)',           badge: 'Full Access', badgeColor: '#818cf8', activeBg: isDark ? '#312e81' : '#eef2ff', activeColor: isDark ? '#a5b4fc' : '#312e81' },
  ];

  return (
    <div style={{
      minHeight: '100svh',
      backgroundColor: pageBg,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflowX: 'hidden',
      transition: 'background 0.3s',
    }}>
      {/* Background Dot grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: isDark ? 0.05 : 0.12,
        pointerEvents: 'none',
        backgroundImage: `radial-gradient(${isDark ? '#ffffff' : '#94a3b8'} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Header section */}
      <div style={{ maxWidth: 448, margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        {onBack && (
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                fontSize: '0.85rem',
                color: isDark ? '#94a3b8' : '#64748b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 4px',
                borderRadius: 6,
                minHeight: '44px',
              }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} />
              <span>Back to Overview</span>
            </button>
          </div>
        )}

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(30,127,115,0.4)',
            backgroundColor: isDark ? '#07162c' : '#ffffff',
            boxShadow: '0 0 24px rgba(30,127,115,0.2)',
          }}>
            <img src="/logo.png" alt="UrbanEye" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
          </div>
        </div>

        <h2 style={{
          textAlign: 'center',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: isDark ? '#ffffff' : '#0f172a',
          margin: '0 0 4px',
          letterSpacing: '-0.02em',
        }}>
          UrbanEye Command Portal
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: isDark ? '#94a3b8' : '#64748b',
          margin: '0 0 10px',
        }}>
          Government Road Intelligence &amp; Bus Edge-AI Platform
        </p>
        <div style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            padding: '3px 12px',
            borderRadius: 999,
            fontSize: '0.7rem',
            fontWeight: 700,
            backgroundColor: 'rgba(30,127,115,0.15)',
            color: '#2dd4bf',
            border: '1px solid rgba(30,127,115,0.3)',
          }}>
            Authorized Personnel Only
          </span>
        </div>
      </div>

      {/* Login Card */}
      <div style={{
        maxWidth: 448,
        margin: '16px auto 0',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
      }}>
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 16,
          padding: '24px 20px',
          boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.08)',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          {/* Error Banner */}
          {error && (
            <div style={{
              marginBottom: 16,
              padding: '12px',
              backgroundColor: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 8,
              fontSize: '0.8rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email Field with >=16px font to prevent mobile zoom */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: labelClr, marginBottom: 6 }}>
                <Mail style={{ width: 14, height: 14, color: iconClr }} />
                <span>Official Government Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="officer@urbaneye.gov.in"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E7F73';
                  e.target.style.boxShadow = '0 0 0 2px rgba(30,127,115,0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputBdr;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Field with >=16px font */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: labelClr, marginBottom: 6 }}>
                <Lock style={{ width: 14, height: 14, color: iconClr }} />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E7F73';
                  e.target.style.boxShadow = '0 0 0 2px rgba(30,127,115,0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputBdr;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Submit Button (48px touch target) */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '12px 16px',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: 10,
                border: 'none',
                color: '#ffffff',
                backgroundColor: btnBg,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.8 : 1,
                boxShadow: '0 4px 14px rgba(30,127,115,0.3)',
                transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = btnHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = btnBg; }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Command Center →</span>
              )}
            </button>
          </form>

          {/* Quick Persona Switcher with comfortable min 44px touch targets */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${divClr}` }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: hintClr,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
            }}>
              <UserCheck style={{ width: 14, height: 14, color: '#1E7F73' }} />
              <span>Quick Persona Selector:</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {personas.map(({ e, label, badge, badgeColor, activeBg, activeColor }) => {
                const isActive = email === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setTestAccount(e)}
                    style={{
                      textAlign: 'left',
                      minHeight: '44px',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${isActive ? activeColor : btnRowBdr}`,
                      backgroundColor: isActive ? activeBg : btnRowBg,
                      color: isActive ? activeColor : btnRowClr,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      fontWeight: isActive ? 700 : 500,
                      transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                    }}
                  >
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginRight: 8 }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: isActive ? activeColor : badgeColor,
                      flexShrink: 0,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'transparent',
                    }}>
                      {badge}
                    </span>
                  </button>
                );
              })}
            </div>

            <p style={{ marginTop: 12, fontSize: '0.72rem', color: hintClr, textAlign: 'center' }}>
              Universal Demo Password:{' '}
              <code style={{ fontFamily: 'monospace', color: codeClr, fontWeight: 700, padding: '2px 6px', backgroundColor: isDark ? '#1e293b' : '#e2e8f0', borderRadius: 4 }}>
                UrbanEye@2026
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

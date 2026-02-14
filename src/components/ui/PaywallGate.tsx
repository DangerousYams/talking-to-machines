import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface PaywallGateProps {
  chapterTitle: string;
  accentColor: string;
}

export default function PaywallGate({ chapterTitle, accentColor }: PaywallGateProps) {
  const { isPaid, unlock } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Don't render during SSR or before hydration (no localStorage access)
  if (!mounted) return null;
  if (isPaid) return null;

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/unlock', { method: 'POST' });
      const text = await res.text();
      let data: { token?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server error — please try again later.');
      }
      if (!res.ok) throw new Error(data.error || 'Failed to unlock');
      if (!data.token) throw new Error('No token received');
      unlock(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      background: 'rgba(248, 246, 243, 0.7)',
    }}>
      <div style={{
        maxWidth: 440,
        width: '90%',
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid rgba(26,26,46,0.08)',
        boxShadow: '0 24px 48px rgba(26,26,46,0.12), 0 2px 8px rgba(26,26,46,0.04)',
        padding: '2.5rem 2rem',
        textAlign: 'center' as const,
      }}>
        {/* Accent line */}
        <div style={{
          width: 48,
          height: 3,
          borderRadius: 2,
          background: accentColor,
          margin: '0 auto 1.5rem',
        }} />

        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#1A1A2E',
          margin: '0 0 0.5rem',
          lineHeight: 1.2,
        }}>
          {chapterTitle}
        </h2>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          color: '#6B7280',
          margin: '0 0 1.75rem',
          lineHeight: 1.6,
        }}>
          Unlock all chapters and interactive AI widgets.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 10,
          marginBottom: '1.75rem',
          textAlign: 'left' as const,
        }}>
          {[
            'All 11 chapters of interactive content',
            '30 AI-powered interactions per day',
            'Live AI prompting, debugging & agent tools',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: accentColor, fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>
                &#10003;
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: '#1A1A2E',
                lineHeight: 1.5,
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleUnlock}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 10,
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            fontWeight: 700,
            background: loading ? '#6B7280' : accentColor,
            color: '#FFFFFF',
            transition: 'all 0.25s',
            minHeight: 48,
          }}
        >
          {loading ? 'Unlocking...' : 'Get Full Access'}
        </button>

        {error && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#E94560',
            marginTop: 10,
          }}>
            {error}
          </p>
        )}

        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: '#B0B0B0',
          marginTop: 14,
          lineHeight: 1.5,
        }}>
          Chapter 1 is free &middot; Unlock for the full experience
        </p>
      </div>
    </div>
  );
}

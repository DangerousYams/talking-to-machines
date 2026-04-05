import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUtmParams } from '../../lib/utm';

interface UnlockModalProps {
  feature?: string;
  accentColor?: string;
}

export default function UnlockModal({ feature = 'Live AI', accentColor = '#7B61FF' }: UnlockModalProps) {
  const { unlock } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore flow
  const [showRestore, setShowRestore] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreSending, setRestoreSending] = useState(false);
  const [restoreSent, setRestoreSent] = useState(false);

  // Code flow
  const [showCode, setShowCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeRedeeming, setCodeRedeeming] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utm: getUtmParams() }),
      });
      const text = await res.text();
      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server error — please try again later.');
      }
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      if (!data.url) throw new Error('No checkout URL received');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail.includes('@')) return;
    setRestoreSending(true);
    try {
      await fetch('/api/request-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: restoreEmail }),
      });
    } catch {
      // Show success regardless
    } finally {
      setRestoreSent(true);
      setRestoreSending(false);
    }
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setCodeRedeeming(true);
    setCodeError(null);
    try {
      const res = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      if (data.token) unlock(data.token);
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setCodeRedeeming(false);
    }
  };

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: '#6B7280',
    background: 'none', border: 'none', cursor: 'pointer',
    textDecoration: 'underline', padding: 0,
  };

  const miniInputStyle: React.CSSProperties = {
    flex: 1, padding: '7px 10px', borderRadius: 6,
    border: '1px solid rgba(26,26,46,0.12)', fontFamily: 'var(--font-body)',
    fontSize: '0.75rem', outline: 'none', background: '#FAFAF8', minWidth: 0,
  };

  const miniButtonStyle: React.CSSProperties = {
    padding: '7px 14px', borderRadius: 6, border: 'none',
    fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 700,
    cursor: 'pointer', background: accentColor, color: '#FFFFFF', whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${accentColor}06, ${accentColor}03)`,
      border: `1px solid ${accentColor}20`,
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      textAlign: 'center' as const,
    }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#1A1A2E',
        margin: '0 0 0.25rem',
      }}>
        {feature} requires full access
      </p>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: '#6B7280',
        margin: '0 0 1rem',
        lineHeight: 1.5,
      }}>
        Unlock all chapters + AI tools
      </p>
      <button
        onClick={handleUnlock}
        disabled={loading}
        style={{
          padding: '10px 24px',
          borderRadius: 8,
          border: 'none',
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          fontWeight: 700,
          background: loading ? '#6B7280' : accentColor,
          color: '#FFFFFF',
          transition: 'all 0.25s',
          minHeight: 40,
        }}
      >
        {loading ? 'Redirecting...' : 'Unlock \u2014 $29'}
      </button>
      {error && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: '#E94560',
          marginTop: 8,
        }}>
          {error}
        </p>
      )}

      {/* Restore + Code links */}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button onClick={() => { setShowRestore(!showRestore); setShowCode(false); }} style={linkStyle}>
          Already purchased?
        </button>
        <button onClick={() => { setShowCode(!showCode); setShowRestore(false); }} style={linkStyle}>
          Have a code?
        </button>
      </div>

      {showRestore && (
        <div style={{ marginTop: 10, textAlign: 'left' }}>
          {restoreSent ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#16C79A', textAlign: 'center', lineHeight: 1.5 }}>
              Check your inbox for a restore link.
            </p>
          ) : (
            <form onSubmit={handleRestore} style={{ display: 'flex', gap: 6 }}>
              <input type="email" value={restoreEmail} onChange={(e) => setRestoreEmail(e.target.value)} placeholder="Purchase email" required style={miniInputStyle} />
              <button type="submit" disabled={restoreSending} style={{ ...miniButtonStyle, opacity: restoreSending ? 0.6 : 1 }}>
                {restoreSending ? '...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      )}

      {showCode && (
        <div style={{ marginTop: 10, textAlign: 'left' }}>
          <form onSubmit={handleRedeemCode} style={{ display: 'flex', gap: 6 }}>
            <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Access code" required style={{ ...miniInputStyle, fontFamily: 'var(--font-mono)' }} />
            <button type="submit" disabled={codeRedeeming} style={{ ...miniButtonStyle, opacity: codeRedeeming ? 0.6 : 1 }}>
              {codeRedeeming ? '...' : 'Redeem'}
            </button>
          </form>
          {codeError && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#E94560', marginTop: 6 }}>{codeError}</p>
          )}
        </div>
      )}
    </div>
  );
}

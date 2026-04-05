import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUtmParams } from '../../lib/utm';
import { trackPaywallShown, trackPaywallCheckoutClicked, trackPaywallConverted } from '../../lib/analytics';

interface PaywallGateProps {
  chapterTitle: string;
  accentColor: string;
  chapterSlug?: string;
}

export default function PaywallGate({ chapterTitle, accentColor, chapterSlug }: PaywallGateProps) {
  const { isPaid, unlock } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const shownTracked = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  // Track paywall shown once per mount (after hydration, only if not paid)
  useEffect(() => {
    if (mounted && !isPaid && !shownTracked.current) {
      shownTracked.current = true;
      const slug = chapterSlug || window.location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'unknown';
      trackPaywallShown(slug);
    }
  }, [mounted, isPaid, chapterSlug]);

  // Don't render during SSR or before hydration (no localStorage access)
  if (!mounted) return null;
  if (isPaid) return null;

  const getSlug = () => chapterSlug || window.location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'unknown';

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);
    trackPaywallCheckoutClicked(getSlug());
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
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail.includes('@')) return;
    setRestoreSending(true);
    setError(null);
    try {
      const res = await fetch('/api/request-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: restoreEmail }),
      });
      if (res.ok) {
        setRestoreSent(true);
      }
    } catch {
      // Still show success to prevent enumeration
      setRestoreSent(true);
    } finally {
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
      if (data.token) {
        unlock(data.token);
        trackPaywallConverted(getSlug(), 'code');
      }
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setCodeRedeeming(false);
    }
  };

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: '#6B7280',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  };

  const miniInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(26,26,46,0.12)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    outline: 'none',
    background: '#FAFAF8',
  };

  const miniButtonStyle: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    background: accentColor,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
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
          Get full access
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
            'Access to all our AI tools',
            'New content added regularly',
            'One-time purchase — yours forever',
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
          {loading ? 'Redirecting to checkout...' : 'Get Full Access \u2014 $29'}
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

        {/* Restore + Code links */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={() => { setShowRestore(!showRestore); setShowCode(false); }} style={linkStyle}>
            Already purchased?
          </button>
          <button onClick={() => { setShowCode(!showCode); setShowRestore(false); }} style={linkStyle}>
            Have a code?
          </button>
        </div>

        {/* Restore section */}
        {showRestore && (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            {restoreSent ? (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                color: '#16C79A', textAlign: 'center', lineHeight: 1.5,
              }}>
                If that email has a purchase, we sent a restore link. Check your inbox.
              </p>
            ) : (
              <form onSubmit={handleRestore} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={restoreEmail}
                  onChange={(e) => setRestoreEmail(e.target.value)}
                  placeholder="Your purchase email"
                  required
                  style={miniInputStyle}
                />
                <button
                  type="submit"
                  disabled={restoreSending}
                  style={{ ...miniButtonStyle, opacity: restoreSending ? 0.6 : 1 }}
                >
                  {restoreSending ? 'Sending...' : 'Send link'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Code section */}
        {showCode && (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <form onSubmit={handleRedeemCode} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter access code"
                required
                style={{ ...miniInputStyle, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
              />
              <button
                type="submit"
                disabled={codeRedeeming}
                style={{ ...miniButtonStyle, opacity: codeRedeeming ? 0.6 : 1 }}
              >
                {codeRedeeming ? 'Redeeming...' : 'Redeem'}
              </button>
            </form>
            {codeError && (
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: '#E94560', marginTop: 8,
              }}>
                {codeError}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

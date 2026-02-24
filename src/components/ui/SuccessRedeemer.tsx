import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

type Status = 'loading' | 'success' | 'error' | 'no-session';

export default function SuccessRedeemer() {
  const { isPaid, unlock } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPaid) {
      setStatus('success');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setStatus('no-session');
      return;
    }

    redeemToken(sessionId);
  }, []);

  async function redeemToken(sessionId: string) {
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const text = await res.text();
      let data: { token?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server error — please try again.');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to activate access');
      if (!data.token) throw new Error('No access token received');

      unlock(data.token);
      setStatus('success');

      // Clean session_id from URL
      window.history.replaceState({}, '', '/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{
          width: 48, height: 48, margin: '0 auto 24px',
          border: '3px solid #E9456020', borderTopColor: '#E94560',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: '#1A1A2E' }}>
          Activating your access...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{
          width: 48, height: 3, borderRadius: 2,
          background: '#16C79A', margin: '0 auto 24px',
        }} />

        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800,
          color: '#1A1A2E', margin: '0 0 12px', lineHeight: 1.1,
        }}>
          You're in.
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '1rem',
          color: '#6B7280', margin: '0 0 32px', lineHeight: 1.6,
        }}>
          All chapters and AI interactions are now unlocked.
          Your access is active for 30 days.
        </p>

        <a
          href="/ch2"
          style={{
            display: 'inline-block', padding: '14px 32px',
            borderRadius: 10, border: 'none',
            fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700,
            background: '#16C79A', color: '#FFFFFF',
            textDecoration: 'none', transition: 'all 0.25s',
          }}
        >
          Start Chapter 2
        </a>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          color: '#B0B0B0', marginTop: 20, lineHeight: 1.5,
        }}>
          Or <a href="/" style={{ color: '#6B7280' }}>return to the table of contents</a>
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{
          width: 48, height: 3, borderRadius: 2,
          background: '#E94560', margin: '0 auto 24px',
        }} />

        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800,
          color: '#1A1A2E', margin: '0 0 12px',
        }}>
          Something went wrong
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.95rem',
          color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6,
        }}>
          {error || 'We could not activate your access.'}
        </p>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.85rem',
          color: '#6B7280', lineHeight: 1.6,
        }}>
          Your payment was processed successfully. Please try refreshing the page,
          or reach out and we'll sort it out immediately.
        </p>
      </div>
    );
  }

  // no-session
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '0 24px' }}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '1rem',
        color: '#6B7280', lineHeight: 1.6,
      }}>
        Nothing to activate.{' '}
        <a href="/" style={{ color: '#7B61FF' }}>Go to the curriculum</a>.
      </p>
    </div>
  );
}

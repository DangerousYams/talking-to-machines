import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAccessToken } from '../../lib/auth';

type Status = 'loading' | 'success' | 'error' | 'expired' | 'device-limit' | 'no-token';

interface Device {
  id: string;
  device_name: string;
  last_seen_at: string;
  created_at: string;
}

export default function RestoreRedeemer() {
  const { isPaid, unlock } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [magicToken, setMagicToken] = useState<string | null>(null);

  useEffect(() => {
    if (isPaid) {
      setStatus('success');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('no-token');
      return;
    }

    setMagicToken(token);
    redeemToken(token);
  }, []);

  async function redeemToken(token: string) {
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magicToken: token }),
      });

      const data = await res.json();

      if (res.status === 409 && data.error === 'device_limit') {
        setDevices(data.devices || []);
        setStatus('device-limit');
        return;
      }

      if (res.status === 410) {
        setError(data.error || 'This link has expired.');
        setStatus('expired');
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to restore access');
      if (!data.token) throw new Error('No access token received');

      unlock(data.token);
      setStatus('success');
      window.history.replaceState({}, '', '/restore');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  async function handleRemoveDevice(deviceId: string) {
    setRemovingId(deviceId);
    try {
      const token = getAccessToken();
      const res = await fetch('/api/devices', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ deviceId }),
      });

      if (res.ok) {
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
        // If we're now under limit, retry the magic link
        if (devices.length <= 5 && magicToken) {
          setStatus('loading');
          redeemToken(magicToken);
        }
      }
    } catch {
      // Ignore
    } finally {
      setRemovingId(null);
    }
  }

  const wrapperStyle = { maxWidth: 480, margin: '0 auto', textAlign: 'center' as const, padding: '0 24px' };

  if (status === 'loading') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: 48, height: 48, margin: '0 auto 24px',
          border: '3px solid #7B61FF20', borderTopColor: '#7B61FF',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: '#1A1A2E' }}>
          Restoring your access...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: 48, height: 3, borderRadius: 2,
          background: '#16C79A', margin: '0 auto 24px',
        }} />
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800,
          color: '#1A1A2E', margin: '0 0 12px', lineHeight: 1.1,
        }}>
          Welcome back.
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '1rem',
          color: '#6B7280', margin: '0 0 32px', lineHeight: 1.6,
        }}>
          Your access has been restored on this device.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block', padding: '14px 32px',
            borderRadius: 10, border: 'none',
            fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700,
            background: '#7B61FF', color: '#FFFFFF',
            textDecoration: 'none', transition: 'all 0.25s',
          }}
        >
          Continue Learning
        </a>
      </div>
    );
  }

  if (status === 'device-limit') {
    return (
      <div style={{ ...wrapperStyle, maxWidth: 540 }}>
        <div style={{
          width: 48, height: 3, borderRadius: 2,
          background: '#F5A623', margin: '0 auto 24px',
        }} />
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800,
          color: '#1A1A2E', margin: '0 0 8px',
        }}>
          Device limit reached
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.95rem',
          color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6,
        }}>
          You have 5 active devices. Remove one to continue.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {devices.map((device) => (
            <div key={device.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', background: '#FFFFFF', borderRadius: 10,
              border: '1px solid rgba(26,26,46,0.08)',
              textAlign: 'left',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                  fontWeight: 600, color: '#1A1A2E',
                }}>
                  {device.device_name || 'Unknown device'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  color: '#6B7280', marginTop: 2,
                }}>
                  Last seen: {new Date(device.last_seen_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleRemoveDevice(device.id)}
                disabled={removingId === device.id}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: '1px solid #E9456040',
                  background: 'transparent', color: '#E94560',
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600,
                  cursor: removingId === device.id ? 'wait' : 'pointer',
                  opacity: removingId === device.id ? 0.5 : 1,
                }}
              >
                {removingId === device.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>

        {magicToken && (
          <button
            onClick={() => { setStatus('loading'); redeemToken(magicToken); }}
            style={{
              padding: '12px 28px', borderRadius: 10, border: 'none',
              background: '#7B61FF', color: '#FFFFFF',
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: 48, height: 3, borderRadius: 2,
          background: '#F5A623', margin: '0 auto 24px',
        }} />
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800,
          color: '#1A1A2E', margin: '0 0 12px',
        }}>
          Link expired
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.95rem',
          color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6,
        }}>
          {error || 'This restore link has expired.'}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.85rem',
          color: '#6B7280', lineHeight: 1.6,
        }}>
          <a href="/" style={{ color: '#7B61FF' }}>Go back</a> and request a new restore link.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={wrapperStyle}>
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
          {error || 'We could not restore your access.'}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.85rem',
          color: '#6B7280', lineHeight: 1.6,
        }}>
          <a href="/" style={{ color: '#7B61FF' }}>Return to the curriculum</a>
        </p>
      </div>
    );
  }

  // no-token
  return (
    <div style={wrapperStyle}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '1rem',
        color: '#6B7280', lineHeight: 1.6,
      }}>
        No restore link found.{' '}
        <a href="/" style={{ color: '#7B61FF' }}>Go to the curriculum</a>.
      </p>
    </div>
  );
}

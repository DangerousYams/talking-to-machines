import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface UnlockModalProps {
  feature?: string;
  accentColor?: string;
}

export default function UnlockModal({ feature = 'Live AI', accentColor = '#7B61FF' }: UnlockModalProps) {
  const { unlock } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    </div>
  );
}

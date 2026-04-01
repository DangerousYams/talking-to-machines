import { useState } from 'react';
import { useQuota } from '../../hooks/useQuota';
import { useAuth } from '../../hooks/useAuth';

/**
 * Floating banner shown when a paid user has exhausted their daily AI quota.
 * Dismissable, reappears on next page load if still exhausted.
 */
export default function QuotaBanner() {
  const { isPaid } = useAuth();
  const { remaining, limit, resetTime } = useQuota();
  const [dismissed, setDismissed] = useState(false);

  // Only show for paid users who have exhausted their quota
  if (!isPaid || remaining === null || remaining > 0 || dismissed) return null;

  const resetStr = resetTime
    ? resetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'midnight';

  return (
    <>
      <style>{`
        @keyframes qb-in {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 55,
        maxWidth: 400,
        width: 'calc(100% - 32px)',
        background: '#FFFFFF',
        border: '1px solid rgba(26,26,46,0.08)',
        borderTop: '3px solid #F5A623',
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(26,26,46,0.12)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        animation: 'qb-in 0.4s ease',
      }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#1A1A2E',
            margin: '0 0 3px',
          }}>
            Daily AI limit reached
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: '#6B7280',
            margin: 0,
            lineHeight: 1.5,
          }}>
            Your {limit} interactions reset at {resetStr}. All reading content is still available.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{
            width: 22, height: 22, borderRadius: '50%',
            border: 'none', background: 'rgba(26,26,46,0.04)',
            color: '#6B7280', fontSize: '0.65rem',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 2,
          }}
        >
          &#x2715;
        </button>
      </div>
    </>
  );
}

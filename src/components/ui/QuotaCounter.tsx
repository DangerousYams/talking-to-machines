import { useAuth } from '../../hooks/useAuth';
import { useQuota } from '../../hooks/useQuota';

export default function QuotaCounter() {
  const { isPaid } = useAuth();
  const { remaining, limit } = useQuota();

  // Only show for paid users after quota data arrives
  if (!isPaid || remaining === null) return null;

  const used = limit - remaining;
  const pct = Math.min(100, (used / limit) * 100);
  const isLow = remaining <= 5;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <div style={{
        width: 40,
        height: 3,
        borderRadius: 2,
        background: 'rgba(26,26,46,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          borderRadius: 2,
          width: `${pct}%`,
          background: isLow ? '#E94560' : '#16C79A',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: isLow ? '#E94560' : '#6B7280',
        whiteSpace: 'nowrap' as const,
        letterSpacing: '0.03em',
      }}>
        {remaining}/{limit}
      </span>
    </div>
  );
}

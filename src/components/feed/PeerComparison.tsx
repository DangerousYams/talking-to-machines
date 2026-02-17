import React from 'react';
import type { ComparisonData, Challenge } from '../../data/challenges';
import BottomSheet from '../cards/BottomSheet';
import LearnBridge from './LearnBridge';

interface PeerComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  data: ComparisonData | null;
  isLoading: boolean;
  isMobile: boolean;
}

function PercentileBar({ percentile }: { percentile: number }) {
  const color = percentile >= 70 ? '#16C79A' : percentile >= 40 ? '#F5A623' : '#E94560';

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 8,
      }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: 800,
          color,
          lineHeight: 1,
        }}>
          {percentile}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--color-subtle)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          percentile
        </span>
      </div>

      <div style={{
        width: '100%',
        height: 8,
        borderRadius: 4,
        background: 'rgba(26, 26, 46, 0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percentile}%`,
          height: '100%',
          borderRadius: 4,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}

function ComparisonContent({ challenge, data, isLoading }: {
  challenge: Challenge;
  data: ComparisonData | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        gap: '1rem',
      }}>
        <div style={{
          width: 28,
          height: 28,
          border: '3px solid rgba(123, 97, 255, 0.15)',
          borderTopColor: '#7B61FF',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-subtle)',
        }}>
          Comparing with others...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--color-subtle)',
        }}>
          Challenge complete! Comparison data isn't available right now.
        </p>
        <LearnBridge chapterNumber={challenge.chapterLink} />
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Percentile */}
      <PercentileBar percentile={data.percentile} />

      {/* Insight */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
        color: 'var(--color-deep)',
        lineHeight: 1.6,
        margin: '0 0 16px',
      }}>
        {data.insight}
      </p>

      {/* Total submissions */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: 'var(--color-subtle)',
        letterSpacing: '0.03em',
        marginBottom: 16,
      }}>
        Based on {data.totalSubmissions.toLocaleString()} submissions
      </p>

      {/* Learn bridge */}
      {challenge.chapterLink && (
        <div style={{ marginTop: 8 }}>
          <LearnBridge chapterNumber={challenge.chapterLink} />
        </div>
      )}
    </div>
  );
}

export default function PeerComparison({
  isOpen,
  onClose,
  challenge,
  data,
  isLoading,
  isMobile,
}: PeerComparisonProps) {
  const content = (
    <ComparisonContent challenge={challenge} data={data} isLoading={isLoading} />
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="How you compare">
        {content}
      </BottomSheet>
    );
  }

  // Desktop: inline expand below card
  if (!isOpen) return null;

  return (
    <div style={{
      padding: '20px 16px',
      borderTop: '1px solid rgba(26, 26, 46, 0.06)',
      background: 'rgba(250, 248, 245, 0.5)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <h4 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-deep)',
          margin: 0,
        }}>
          How you compare
        </h4>
        <button
          onClick={onClose}
          aria-label="Close comparison"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(26, 26, 46, 0.06)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B7280',
            fontSize: '0.85rem',
          }}
        >
          &times;
        </button>
      </div>
      {content}
    </div>
  );
}

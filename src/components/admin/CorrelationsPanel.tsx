import React from 'react';

interface WidgetCorrelation {
  widget: string;
  interactedSessions: number;
  interactedAvgPercent: number;
  interactedCompletionRate: number;
  nonInteractedAvgPercent: number;
  nonInteractedCompletionRate: number;
  lift: number;
}

interface ChapterCorrelation {
  slug: string;
  totalSessions: number;
  withWidget: {
    sessions: number;
    avgPercent: number;
    avgTimeSeconds: number;
    completionRate: number;
  };
  withoutWidget: {
    sessions: number;
    avgPercent: number;
    avgTimeSeconds: number;
    completionRate: number;
  };
  perWidget: WidgetCorrelation[];
}

interface Props {
  data: { chapters: ChapterCorrelation[] } | null;
}

const CHAPTER_COLORS: Record<string, string> = {
  ch1: '#E94560', ch2: '#16C79A', ch3: '#7B61FF', ch4: '#0EA5E9',
  ch5: '#F5A623', ch6: '#E94560', ch7: '#7B61FF', ch8: '#0F3460',
  ch9: '#E94560', ch10: '#16C79A', ch11: '#F5A623',
};

function chapterLabel(slug: string): string {
  return `Ch ${slug.replace('ch', '')}`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function CorrelationsPanel({ data }: Props) {
  if (!data || data.chapters.length === 0) {
    return (
      <div style={{
        background: '#1e2240', borderRadius: '12px', padding: '40px',
        textAlign: 'center', color: '#6b7280', fontSize: '0.95rem',
      }}>
        No correlation data yet. This requires both scroll depth and widget interaction data.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {data.chapters.map((ch) => {
          const color = CHAPTER_COLORS[ch.slug] || '#7B61FF';
          const lift = ch.withWidget.avgPercent - ch.withoutWidget.avgPercent;

          return (
            <div key={ch.slug} style={{
              background: '#1e2240', borderRadius: '12px', padding: '20px',
              borderLeft: `3px solid ${color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                  {chapterLabel(ch.slug)}
                </h4>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  {ch.totalSessions} sessions
                </span>
              </div>

              {/* Comparison bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                <ComparisonRow
                  label="Used widgets"
                  sessions={ch.withWidget.sessions}
                  avgPercent={ch.withWidget.avgPercent}
                  completionRate={ch.withWidget.completionRate}
                  time={ch.withWidget.avgTimeSeconds}
                  color="#22c55e"
                />
                <ComparisonRow
                  label="No widgets"
                  sessions={ch.withoutWidget.sessions}
                  avgPercent={ch.withoutWidget.avgPercent}
                  completionRate={ch.withoutWidget.completionRate}
                  time={ch.withoutWidget.avgTimeSeconds}
                  color="#6b7280"
                />
              </div>

              {/* Lift indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', background: '#161830', borderRadius: '8px',
              }}>
                <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Widget lift:</span>
                <span style={{
                  fontSize: '0.85rem', fontWeight: 700,
                  color: lift > 0 ? '#22c55e' : lift < 0 ? '#ef4444' : '#6b7280',
                }}>
                  {lift > 0 ? '+' : ''}{lift}pp
                </span>
                <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>avg progress</span>
              </div>

              {/* Per-widget breakdown */}
              {ch.perWidget.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.65rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    By Widget
                  </div>
                  {ch.perWidget.map((w) => (
                    <div key={w.widget} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '4px 0', borderBottom: '1px solid #1a1d3a',
                    }}>
                      <span style={{ color: '#d1d5db', fontSize: '0.75rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {w.widget}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '0.7rem', marginLeft: '8px' }}>
                        {w.interactedSessions} users
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, marginLeft: '8px', minWidth: '48px', textAlign: 'right',
                        color: w.lift > 0 ? '#22c55e' : w.lift < 0 ? '#ef4444' : '#6b7280',
                      }}>
                        {w.lift > 0 ? '+' : ''}{w.lift}pp
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComparisonRow({
  label, sessions, avgPercent, completionRate, time, color,
}: {
  label: string; sessions: number; avgPercent: number; completionRate: number; time: number; color: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ color: '#9ca3af', fontSize: '0.7rem', minWidth: '80px' }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: '#161830', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${avgPercent}%`,
          background: color, borderRadius: '4px',
          transition: 'width 0.3s',
        }} />
      </div>
      <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, minWidth: '32px', textAlign: 'right' }}>
        {avgPercent}%
      </span>
      <span style={{ color: '#9ca3af', fontSize: '0.65rem', minWidth: '48px', textAlign: 'right' }}>
        {completionRate}% done
      </span>
      <span style={{ color: '#6b7280', fontSize: '0.65rem', minWidth: '36px', textAlign: 'right' }}>
        {formatTime(time)}
      </span>
    </div>
  );
}

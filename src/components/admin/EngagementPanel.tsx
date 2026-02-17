import React from 'react';

interface ChapterEngagement {
  slug: string;
  sessions: number;
  reachedEnd: number;
  completionRate: number;
  avgPercent: number;
  avgTimeSeconds: number;
  buckets: { pct: number; count: number }[];
  variants: Record<string, { sessions: number; reachedEnd: number; avgPercent: number }>;
}

interface Props {
  chapters: ChapterEngagement[];
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function chapterLabel(slug: string): string {
  const num = slug.replace('ch', '');
  return `Ch ${num}`;
}

/**
 * Renders a drop-off funnel bar for a chapter.
 * Each bar segment represents 10% of the content.
 */
function FunnelBar({ buckets, sessions, accentColor }: { buckets: { pct: number; count: number }[]; sessions: number; accentColor: string }) {
  if (sessions === 0) return <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>No data</div>;

  return (
    <div style={{ display: 'flex', gap: '2px', height: '28px', alignItems: 'flex-end' }}>
      {buckets.map((b, i) => {
        const height = sessions > 0 ? (b.count / sessions) * 100 : 0;
        return (
          <div
            key={i}
            title={`${b.pct}%: ${b.count}/${sessions} users (${Math.round(height)}%)`}
            style={{
              flex: 1,
              height: `${Math.max(2, height)}%`,
              background: accentColor,
              opacity: 0.3 + (height / 100) * 0.7,
              borderRadius: '2px 2px 0 0',
              transition: 'height 0.3s ease',
              minHeight: '2px',
            }}
          />
        );
      })}
    </div>
  );
}

const CHAPTER_COLORS: Record<string, string> = {
  ch1: '#E94560', ch2: '#16C79A', ch3: '#7B61FF', ch4: '#0EA5E9',
  ch5: '#F5A623', ch6: '#E94560', ch7: '#7B61FF', ch8: '#0F3460',
  ch9: '#E94560', ch10: '#16C79A', ch11: '#F5A623',
};

export default function EngagementPanel({ chapters }: Props) {
  if (chapters.length === 0) {
    return (
      <div style={{
        background: '#1e2240', borderRadius: '12px', padding: '40px',
        textAlign: 'center', color: '#6b7280', fontSize: '0.95rem',
      }}>
        No engagement data yet. Scroll depth tracking will appear once users visit chapters.
      </div>
    );
  }

  // Overall funnel: how many users reached each chapter
  const chapterSessionCounts = chapters.map(c => ({ slug: c.slug, sessions: c.sessions }));
  const maxSessions = Math.max(...chapterSessionCounts.map(c => c.sessions), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Cross-chapter funnel */}
      <div style={{
        background: '#1e2240', borderRadius: '12px', padding: '24px',
      }}>
        <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 16px 0' }}>
          Chapter Reach
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 16px 0' }}>
          Users who visited each chapter (any depth)
        </p>
        <div style={{ display: 'flex', gap: '6px', height: '80px', alignItems: 'flex-end' }}>
          {chapterSessionCounts.map(c => {
            const h = (c.sessions / maxSessions) * 100;
            const color = CHAPTER_COLORS[c.slug] || '#7B61FF';
            return (
              <div key={c.slug} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600 }}>
                  {c.sessions}
                </span>
                <div
                  title={`${chapterLabel(c.slug)}: ${c.sessions} sessions`}
                  style={{
                    width: '100%',
                    height: `${Math.max(4, h)}%`,
                    background: color,
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.3s',
                    minHeight: '4px',
                  }}
                />
                <span style={{ color: '#6b7280', fontSize: '0.65rem', fontWeight: 500 }}>
                  {chapterLabel(c.slug)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-chapter detail cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        {chapters.map(ch => {
          const color = CHAPTER_COLORS[ch.slug] || '#7B61FF';
          return (
            <div key={ch.slug} style={{
              background: '#1e2240', borderRadius: '12px', padding: '20px',
              borderLeft: `3px solid ${color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                  {chapterLabel(ch.slug)}
                </h4>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  {ch.sessions} sessions
                </span>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion</div>
                  <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{ch.completionRate}%</div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Progress</div>
                  <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{ch.avgPercent}%</div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Time</div>
                  <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{formatTime(ch.avgTimeSeconds)}</div>
                </div>
              </div>

              {/* Drop-off funnel */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.65rem', marginBottom: '6px' }}>
                  Drop-off (0% → 100%)
                </div>
                <FunnelBar buckets={ch.buckets} sessions={ch.sessions} accentColor={color} />
              </div>

              {/* Variant breakdown */}
              {Object.keys(ch.variants).length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  {Object.entries(ch.variants).map(([variant, data]) => (
                    <div key={variant} style={{
                      flex: 1,
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '6px',
                    }}>
                      <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {variant}
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                        {data.avgPercent}% avg
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                        {data.sessions} sessions, {data.reachedEnd} completed
                      </div>
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

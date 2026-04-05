import React, { useState } from 'react';

interface ChapterEngagement {
  slug: string;
  sessions: number;
  reachedEnd: number;
  completionRate: number;
  avgPercent: number;
  avgTimeSeconds: number;
  buckets: { pct: number; count: number }[];
  sections?: { sectionId: string; count: number; pct: number }[];
  segments?: {
    paid: { sessions: number; avgPercent: number; completionRate: number; avgTimeSeconds: number };
    free: { sessions: number; avgPercent: number; completionRate: number; avgTimeSeconds: number };
  };
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

function formatSectionId(id: string): string {
  // Turn "communication-gap" into "Communication Gap"
  if (id.startsWith('index-')) return `Section ${id.replace('index-', '')}`;
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

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
          const isExpanded = expandedChapter === ch.slug;
          const hasSections = ch.sections && ch.sections.length > 0;
          const hasSegments = ch.segments && (ch.segments.paid.sessions > 0 || ch.segments.free.sessions > 0);

          return (
            <div key={ch.slug} style={{
              background: '#1e2240', borderRadius: '12px', padding: '20px',
              borderLeft: `3px solid ${color}`,
              gridColumn: isExpanded ? '1 / -1' : undefined,
            }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px', cursor: (hasSections || hasSegments) ? 'pointer' : 'default' }}
                onClick={() => (hasSections || hasSegments) && setExpandedChapter(isExpanded ? null : ch.slug)}
              >
                <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                  {chapterLabel(ch.slug)}
                  {(hasSections || hasSegments) && (
                    <span style={{ color: '#6b7280', fontSize: '0.7rem', marginLeft: '6px' }}>
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  )}
                </h4>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  {ch.sessions} sessions
                </span>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
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

              {/* Expanded: section-level drop-off + paid/free */}
              {isExpanded && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #2a2d4a', paddingTop: '16px' }}>
                  {/* Paid vs Free segments */}
                  {hasSegments && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        Paid vs Free
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <SegmentCard label="Paid" data={ch.segments!.paid} color="#22c55e" />
                        <SegmentCard label="Free" data={ch.segments!.free} color="#6b7280" />
                      </div>
                    </div>
                  )}

                  {/* Section-level drop-off */}
                  {hasSections && (
                    <div>
                      <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        Where Users Stopped (by section)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {ch.sections!.slice(0, 10).map((s) => (
                          <div key={s.sectionId} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '4px 8px', background: '#161830', borderRadius: '6px',
                          }}>
                            <span style={{ color: '#d1d5db', fontSize: '0.75rem', minWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {formatSectionId(s.sectionId)}
                            </span>
                            <div style={{ flex: 1, height: '6px', background: '#2a2d4a', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${s.pct}%`,
                                background: color,
                                borderRadius: '3px',
                              }} />
                            </div>
                            <span style={{ color: '#9ca3af', fontSize: '0.7rem', minWidth: '50px', textAlign: 'right' }}>
                              {s.count} ({s.pct}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SegmentCard({ label, data, color }: {
  label: string;
  data: { sessions: number; avgPercent: number; completionRate: number; avgTimeSeconds: number };
  color: string;
}) {
  return (
    <div style={{
      background: '#161830', borderRadius: '8px', padding: '12px',
      borderTop: `2px solid ${color}`,
    }}>
      <div style={{ color, fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px' }}>
        {label} ({data.sessions})
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#6b7280', fontSize: '0.6rem' }}>Avg</div>
          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{data.avgPercent}%</div>
        </div>
        <div>
          <div style={{ color: '#6b7280', fontSize: '0.6rem' }}>Complete</div>
          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{data.completionRate}%</div>
        </div>
        <div>
          <div style={{ color: '#6b7280', fontSize: '0.6rem' }}>Time</div>
          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{formatTime(data.avgTimeSeconds)}</div>
        </div>
      </div>
    </div>
  );
}

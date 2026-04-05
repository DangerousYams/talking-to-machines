import React from 'react';

interface FunnelData {
  totalSessions: number;
  chapterCounts: { slug: string; sessions: number }[];
  transitions: { from: string; to: string; count: number }[];
  journeyDepth: { chapters: number; count: number }[];
}

interface Props {
  data: FunnelData | null;
}

const CHAPTER_COLORS: Record<string, string> = {
  ch1: '#E94560', ch2: '#16C79A', ch3: '#7B61FF', ch4: '#0EA5E9',
  ch5: '#F5A623', ch6: '#E94560', ch7: '#7B61FF', ch8: '#0F3460',
  ch9: '#E94560', ch10: '#16C79A', ch11: '#F5A623',
};

function chapterLabel(slug: string): string {
  const num = slug.replace('ch', '');
  return `Ch ${num}`;
}

export default function FunnelPanel({ data }: Props) {
  if (!data || data.chapterCounts.length === 0) {
    return (
      <div style={{
        background: '#1e2240', borderRadius: '12px', padding: '40px',
        textAlign: 'center', color: '#6b7280', fontSize: '0.95rem',
      }}>
        No funnel data yet.
      </div>
    );
  }

  const maxSessions = Math.max(...data.chapterCounts.map((c) => c.sessions), 1);

  // Build transition rates: from ch(N) to ch(N+1)
  const transitionRates: { from: string; to: string; rate: number; count: number; fromCount: number }[] = [];
  for (const t of data.transitions) {
    const fromChapter = data.chapterCounts.find((c) => c.slug === t.from);
    if (fromChapter && fromChapter.sessions > 0) {
      transitionRates.push({
        from: t.from,
        to: t.to,
        count: t.count,
        fromCount: fromChapter.sessions,
        rate: Math.round((t.count / fromChapter.sessions) * 100),
      });
    }
  }

  const maxDepth = Math.max(...data.journeyDepth.map((d) => d.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary stat */}
      <div style={{
        background: '#1e2240', borderRadius: '12px', padding: '20px 24px',
        display: 'flex', gap: '32px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Sessions
          </div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
            {data.totalSessions.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Avg Chapters / Session
          </div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
            {data.totalSessions > 0
              ? (data.journeyDepth.reduce((s, d) => s + d.chapters * d.count, 0) / data.totalSessions).toFixed(1)
              : '0'}
          </div>
        </div>
      </div>

      {/* Cross-chapter funnel with transition rates */}
      <div style={{ background: '#1e2240', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 8px 0' }}>
          Cross-Chapter Funnel
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 20px 0' }}>
          Unique sessions per chapter + retention between chapters
        </p>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '120px' }}>
          {data.chapterCounts.map((c, i) => {
            const h = (c.sessions / maxSessions) * 100;
            const color = CHAPTER_COLORS[c.slug] || '#7B61FF';
            const transition = transitionRates.find((t) => t.from === c.slug);

            return (
              <React.Fragment key={c.slug}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600 }}>
                    {c.sessions}
                  </span>
                  <div
                    title={`${chapterLabel(c.slug)}: ${c.sessions} unique sessions`}
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
                {/* Transition arrow */}
                {transition && i < data.chapterCounts.length - 1 && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '2px', minWidth: '28px', paddingBottom: '18px',
                  }}>
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700,
                      color: transition.rate >= 60 ? '#22c55e' : transition.rate >= 30 ? '#f5a623' : '#ef4444',
                    }}>
                      {transition.rate}%
                    </span>
                    <span style={{ color: '#4b5563', fontSize: '0.7rem' }}>→</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Journey depth distribution */}
      <div style={{ background: '#1e2240', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 8px 0' }}>
          Journey Depth
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 16px 0' }}>
          How many chapters each session visited
        </p>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '80px' }}>
          {data.journeyDepth.map((d) => {
            const h = (d.count / maxDepth) * 100;
            return (
              <div key={d.chapters} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600 }}>
                  {d.count}
                </span>
                <div
                  title={`${d.chapters} chapter(s): ${d.count} sessions`}
                  style={{
                    width: '100%',
                    height: `${Math.max(4, h)}%`,
                    background: '#7B61FF',
                    opacity: 0.4 + (d.chapters / 11) * 0.6,
                    borderRadius: '3px 3px 0 0',
                    minHeight: '4px',
                  }}
                />
                <span style={{ color: '#6b7280', fontSize: '0.65rem' }}>
                  {d.chapters}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ color: '#6b7280', fontSize: '0.65rem', textAlign: 'center', marginTop: '4px' }}>
          chapters visited
        </div>
      </div>
    </div>
  );
}

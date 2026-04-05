import React from 'react';

interface PaywallData {
  total: {
    shown: number;
    clicked: number;
    converted: number;
    clickRate: number;
    conversionRate: number;
    methods: Record<string, number>;
  };
  byChapter: {
    slug: string;
    shown: number;
    clicked: number;
    converted: number;
    clickRate: number;
    conversionRate: number;
  }[];
  daily: {
    date: string;
    shown: number;
    converted: number;
  }[];
}

interface Props {
  data: PaywallData | null;
}

function chapterLabel(slug: string): string {
  if (slug === 'checkout') return 'Checkout';
  const num = slug.replace('ch', '');
  return `Ch ${num}`;
}

export default function PaywallPanel({ data }: Props) {
  if (!data || data.total.shown === 0) {
    return (
      <div style={{
        background: '#1e2240', borderRadius: '12px', padding: '40px',
        textAlign: 'center', color: '#6b7280', fontSize: '0.95rem',
      }}>
        No paywall data yet. Tracking will appear once users encounter the paywall.
      </div>
    );
  }

  const { total, byChapter, daily } = data;
  const maxDaily = Math.max(...daily.map((d) => d.shown), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top-level funnel */}
      <div style={{
        background: '#1e2240', borderRadius: '12px', padding: '24px',
      }}>
        <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 20px 0' }}>
          Paywall Funnel
        </h3>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
          {/* Shown */}
          <FunnelStep
            label="Shown"
            value={total.shown}
            pct={100}
            color="#6b7280"
          />
          <FunnelArrow rate={total.clickRate} />
          {/* Clicked checkout */}
          <FunnelStep
            label="Clicked Checkout"
            value={total.clicked}
            pct={total.shown > 0 ? (total.clicked / total.shown) * 100 : 0}
            color="#F5A623"
          />
          <FunnelArrow rate={total.clicked > 0 ? Math.round((total.converted / total.clicked) * 100) : 0} />
          {/* Converted */}
          <FunnelStep
            label="Converted"
            value={total.converted}
            pct={total.shown > 0 ? (total.converted / total.shown) * 100 : 0}
            color="#22c55e"
          />
        </div>

        {/* Conversion methods */}
        {Object.keys(total.methods).length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.entries(total.methods).map(([method, count]) => (
              <div key={method} style={{
                background: '#161830', borderRadius: '8px', padding: '8px 14px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'capitalize' }}>{method}</span>
                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* By chapter */}
      {byChapter.length > 0 && (
        <div style={{ background: '#1e2240', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 16px 0' }}>
            Paywall by Chapter
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 16px 0' }}>
            Where users first encounter the paywall
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {byChapter.map((ch) => (
              <div key={ch.slug} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 80px 80px 80px',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                background: '#161830',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{chapterLabel(ch.slug)}</span>
                {/* Mini bar */}
                <div style={{ height: '6px', background: '#2a2d4a', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(2, (ch.shown / (Math.max(...byChapter.map((c) => c.shown)) || 1)) * 100)}%`,
                    background: '#7B61FF',
                    borderRadius: '3px',
                  }} />
                </div>
                <span style={{ color: '#9ca3af', textAlign: 'right' }}>{ch.shown} shown</span>
                <span style={{ color: '#F5A623', textAlign: 'right' }}>{ch.clickRate}% click</span>
                <span style={{ color: '#22c55e', textAlign: 'right' }}>{ch.conversionRate}% conv</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily trend */}
      {daily.length > 1 && (
        <div style={{ background: '#1e2240', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 16px 0' }}>
            Daily Trend
          </h3>

          <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '60px' }}>
            {daily.map((d) => {
              const shownH = (d.shown / maxDaily) * 100;
              const convH = d.shown > 0 ? (d.converted / d.shown) * shownH : 0;
              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.shown} shown, ${d.converted} converted`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}
                >
                  <div style={{
                    height: `${Math.max(2, shownH)}%`,
                    background: '#374151',
                    borderRadius: '2px 2px 0 0',
                    position: 'relative',
                    minHeight: '2px',
                  }}>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${convH > 0 ? Math.max(2, (d.converted / d.shown) * 100) : 0}%`,
                      background: '#22c55e',
                      borderRadius: '0 0 0 0',
                      minHeight: convH > 0 ? '2px' : 0,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ color: '#6b7280', fontSize: '0.6rem' }}>{daily[0]?.date}</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '0.6rem' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: '#374151', borderRadius: 1, marginRight: 4 }} />
                Shown
              </span>
              <span style={{ color: '#6b7280', fontSize: '0.6rem' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: '#22c55e', borderRadius: 1, marginRight: 4 }} />
                Converted
              </span>
            </div>
            <span style={{ color: '#6b7280', fontSize: '0.6rem' }}>{daily[daily.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function FunnelStep({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div style={{
      flex: 1, background: '#161830', borderRadius: '10px', padding: '16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      border: `1px solid ${color}22`,
    }}>
      <div style={{ color, fontSize: '1.4rem', fontWeight: 700 }}>{value.toLocaleString()}</div>
      <div style={{ color: '#9ca3af', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ color: '#6b7280', fontSize: '0.65rem' }}>
        {Math.round(pct)}% of shown
      </div>
    </div>
  );
}

function FunnelArrow({ rate }: { rate: number }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minWidth: '32px', gap: '2px',
    }}>
      <span style={{
        fontSize: '0.7rem', fontWeight: 700,
        color: rate >= 50 ? '#22c55e' : rate >= 20 ? '#f5a623' : '#ef4444',
      }}>
        {rate}%
      </span>
      <span style={{ color: '#4b5563', fontSize: '1rem' }}>→</span>
    </div>
  );
}

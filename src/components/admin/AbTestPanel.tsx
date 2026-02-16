import React from 'react';

interface Variant {
  name: string;
  assignments: number;
  views: number;
  interactions: number;
}

interface AbTestPanelProps {
  experiment: {
    id: string;
    name: string;
    status: 'active' | 'paused';
    variants: Variant[];
  };
  onToggleStatus: (id: string, newStatus: 'active' | 'paused') => void;
}

const VARIANT_COLORS = ['#0EA5E9', '#E94560', '#F5A623', '#7B61FF', '#16C79A'];

export default function AbTestPanel({ experiment, onToggleStatus }: AbTestPanelProps) {
  const totalAssignments = experiment.variants.reduce((sum, v) => sum + v.assignments, 0);
  const isActive = experiment.status === 'active';

  return (
    <div
      style={{
        background: '#1e2240',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
            {experiment.name}
          </h3>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: isActive ? '#22c55e' : '#eab308',
            }}
          >
            {experiment.status}
          </span>
        </div>
        <button
          onClick={() => onToggleStatus(experiment.id, isActive ? 'paused' : 'active')}
          style={{
            padding: '6px 16px',
            borderRadius: '8px',
            border: '1px solid #374151',
            background: 'transparent',
            color: '#9ca3af',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#374151';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Variant Split Bar */}
      {totalAssignments > 0 ? (
        <>
          <div
            style={{
              display: 'flex',
              borderRadius: '8px',
              overflow: 'hidden',
              height: '28px',
              marginBottom: '8px',
            }}
          >
            {experiment.variants.map((variant, idx) => {
              const pct = totalAssignments > 0 ? (variant.assignments / totalAssignments) * 100 : 0;
              return (
                <div
                  key={variant.name}
                  style={{
                    width: `${pct}%`,
                    background: VARIANT_COLORS[idx % VARIANT_COLORS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    minWidth: pct > 0 ? '30px' : '0',
                    transition: 'width 0.3s ease',
                  }}
                >
                  {pct >= 10 ? `${pct.toFixed(0)}%` : ''}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            {experiment.variants.map((variant, idx) => (
              <span
                key={variant.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: VARIANT_COLORS[idx % VARIANT_COLORS.length],
                    display: 'inline-block',
                  }}
                />
                {variant.name}
              </span>
            ))}
          </div>

          {/* Stats Table */}
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr>
                  {['Variant', 'Assignments', 'Views', 'Interaction Rate'].map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        color: '#9ca3af',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #374151',
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {experiment.variants.map((variant, idx) => {
                  const interactionRate =
                    variant.views > 0
                      ? ((variant.interactions / variant.views) * 100).toFixed(1)
                      : '0.0';
                  return (
                    <tr key={variant.name}>
                      <td
                        style={{
                          padding: '10px 12px',
                          color: '#ffffff',
                          borderBottom: '1px solid #2a2f4a',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: VARIANT_COLORS[idx % VARIANT_COLORS.length],
                              display: 'inline-block',
                            }}
                          />
                          {variant.name}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          color: '#d1d5db',
                          borderBottom: '1px solid #2a2f4a',
                        }}
                      >
                        {variant.assignments.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          color: '#d1d5db',
                          borderBottom: '1px solid #2a2f4a',
                        }}
                      >
                        {variant.views.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          color: '#d1d5db',
                          borderBottom: '1px solid #2a2f4a',
                        }}
                      >
                        {interactionRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: 'center',
            color: '#6b7280',
            padding: '20px',
            fontSize: '0.9rem',
          }}
        >
          No assignments yet
        </div>
      )}
    </div>
  );
}

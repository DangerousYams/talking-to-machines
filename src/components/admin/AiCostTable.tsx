import React, { useState } from 'react';

interface WidgetCost {
  widget: string;
  requests: number;
  tokens: number;
  cost: number;
}

interface DailyCost {
  date: string;
  cost: number;
  requests: number;
}

interface AiCostTableProps {
  byWidget: WidgetCost[];
  dailyCosts: DailyCost[];
}

type SortKey = 'widget' | 'requests' | 'tokens' | 'cost';
type SortDir = 'asc' | 'desc';

export default function AiCostTable({ byWidget, dailyCosts }: AiCostTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...byWidget].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalRequests = byWidget.reduce((sum, w) => sum + w.requests, 0);
  const totalTokens = byWidget.reduce((sum, w) => sum + w.tokens, 0);
  const totalCost = byWidget.reduce((sum, w) => sum + w.cost, 0);

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    color: '#9ca3af',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #374151',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const cellStyle = (isEven: boolean): React.CSSProperties => ({
    padding: '10px 12px',
    color: '#d1d5db',
    borderBottom: '1px solid #2a2f4a',
    background: isEven ? 'rgba(255,255,255,0.02)' : 'transparent',
  });

  if ((!byWidget || byWidget.length === 0) && (!dailyCosts || dailyCosts.length === 0)) {
    return (
      <div
        style={{
          background: '#1e2240',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.95rem',
        }}
      >
        No AI usage data yet
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Widget Cost Table */}
      {byWidget && byWidget.length > 0 && (
        <div
          style={{
            background: '#1e2240',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <h3
            style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              margin: '0 0 16px 0',
            }}
          >
            AI Usage by Widget
          </h3>
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
                  <th style={headerStyle} onClick={() => handleSort('widget')}>
                    Widget{sortIndicator('widget')}
                  </th>
                  <th style={headerStyle} onClick={() => handleSort('requests')}>
                    Requests{sortIndicator('requests')}
                  </th>
                  <th style={headerStyle} onClick={() => handleSort('tokens')}>
                    Tokens{sortIndicator('tokens')}
                  </th>
                  <th style={headerStyle} onClick={() => handleSort('cost')}>
                    Cost ($){sortIndicator('cost')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, idx) => (
                  <tr key={row.widget}>
                    <td style={cellStyle(idx % 2 === 0)}>
                      <span style={{ color: '#ffffff', fontWeight: 500 }}>{row.widget}</span>
                    </td>
                    <td style={cellStyle(idx % 2 === 0)}>{row.requests.toLocaleString()}</td>
                    <td style={cellStyle(idx % 2 === 0)}>{row.tokens.toLocaleString()}</td>
                    <td style={cellStyle(idx % 2 === 0)}>${row.cost.toFixed(4)}</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr>
                  <td
                    style={{
                      padding: '12px 12px',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderTop: '2px solid #374151',
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      padding: '12px 12px',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderTop: '2px solid #374151',
                    }}
                  >
                    {totalRequests.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: '12px 12px',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderTop: '2px solid #374151',
                    }}
                  >
                    {totalTokens.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: '12px 12px',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderTop: '2px solid #374151',
                    }}
                  >
                    ${totalCost.toFixed(4)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Cost Summary */}
      {dailyCosts && dailyCosts.length > 0 && (
        <div
          style={{
            background: '#1e2240',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <h3
            style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              margin: '0 0 16px 0',
            }}
          >
            Daily Cost Summary
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {dailyCosts.map((day) => (
              <div
                key={day.date}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {day.requests} req
                  </span>
                  <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }}>
                    ${day.cost.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  format?: 'number' | 'currency' | 'percent';
  trend?: number;
}

function formatValue(value: number, format: 'number' | 'currency' | 'percent' = 'number'): string {
  switch (format) {
    case 'currency':
      return `$${value.toFixed(2)}`;
    case 'percent':
      return `${value}%`;
    case 'number':
    default:
      return value.toLocaleString();
  }
}

export default function StatCard({ label, value, format = 'number', trend }: StatCardProps) {
  const trendColor = trend !== undefined ? (trend >= 0 ? '#22c55e' : '#ef4444') : undefined;
  const trendArrow = trend !== undefined ? (trend >= 0 ? '\u2191' : '\u2193') : '';

  return (
    <div
      style={{
        background: '#1e2240',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          fontSize: '0.85rem',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#ffffff',
          lineHeight: 1.2,
        }}
      >
        {formatValue(value, format)}
      </div>
      {trend !== undefined && (
        <div
          style={{
            fontSize: '0.8rem',
            color: trendColor,
            fontWeight: 500,
          }}
        >
          {trendArrow} {Math.abs(trend)}% vs previous period
        </div>
      )}
    </div>
  );
}

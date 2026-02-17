import React from 'react';

interface Props {
  accent?: string;
  className?: string;
}

export default function Divider({ accent = '#E94560', className = '' }: Props) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`} role="separator">
      <div
        style={{
          width: 200,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}40 50%, transparent)`,
        }}
      />
    </div>
  );
}

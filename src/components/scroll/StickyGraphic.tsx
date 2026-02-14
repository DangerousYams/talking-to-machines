import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function StickyGraphic({ children, className = '' }: Props) {
  return (
    <div className={`sticky top-20 ${className}`}>
      {children}
    </div>
  );
}

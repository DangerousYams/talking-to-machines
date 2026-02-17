import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { dvhValue } from '../../lib/css-compat';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef(0);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    // Only start drag from the handle area (first 40px) or when scrolled to top
    const touch = e.touches[0];
    const rect = sheet.getBoundingClientRect();
    const offsetFromTop = touch.clientY - rect.top;
    if (offsetFromTop < 40 || sheet.scrollTop === 0) {
      dragStartY.current = touch.clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy < 0) return; // Only allow downward drag
    dragCurrentY.current = dy;
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transform = `translateY(${dy}px)`;
      sheet.style.transition = 'none';
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragStartY.current === null) return;
    const sheet = sheetRef.current;
    dragStartY.current = null;
    if (sheet) {
      sheet.style.transition = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';
      if (dragCurrentY.current > 100) {
        onClose();
      } else {
        sheet.style.transform = 'translateY(0)';
      }
    }
    dragCurrentY.current = 0;
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(26, 26, 46, 0.5)',
          animation: 'bottomSheetFadeIn 0.25s ease',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Details'}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 500,
          maxHeight: dvhValue(78),
          background: 'var(--color-cream, #FAF8F5)',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
          animation: 'bottomSheetSlideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -4px 24px rgba(26, 26, 46, 0.12)',
        }}
      >
        {/* Drag handle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '10px 0 6px',
          flexShrink: 0,
          cursor: 'grab',
        }}>
          <div style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: 'rgba(26, 26, 46, 0.15)',
          }} />
        </div>

        {/* Title row */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px 10px',
            borderBottom: '1px solid rgba(26, 26, 46, 0.06)',
            flexShrink: 0,
          }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1A1A2E',
              margin: 0,
            }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(26, 26, 46, 0.06)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px 24px',
          WebkitOverflowScrolling: 'touch' as any,
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes bottomSheetSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes bottomSheetFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

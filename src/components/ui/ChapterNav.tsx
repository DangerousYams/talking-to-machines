import { useIsMobile } from '../../hooks/useMediaQuery';
import type { Chapter } from '../../data/chapters';

interface Props {
  prev?: Chapter;
  next?: Chapter;
}

export default function ChapterNav({ prev, next }: Props) {
  const isMobile = useIsMobile();

  return (
    <nav style={{
      display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const,
      gap: isMobile ? '0.75rem' : '1rem',
      maxWidth: 680, margin: '4rem auto 3rem', padding: isMobile ? '0 1rem' : '0 1.5rem',
    }}>
      {prev ? (
        <a
          href={`/${prev.slug}`}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start',
            padding: isMobile ? '1rem' : '1.5rem', borderRadius: 12, textDecoration: 'none', transition: 'all 0.3s',
            border: '1px solid rgba(26,26,46,0.06)', background: 'rgba(254,253,251,0.6)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', marginBottom: 4 }}>
            &larr; Previous
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: 700, color: prev.accent, lineHeight: 1.3 }}>
            {prev.title}
          </span>
        </a>
      ) : !isMobile ? <div style={{ flex: 1 }} /> : null}

      {next ? (
        <a
          href={`/${next.slug}`}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column' as const,
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            textAlign: isMobile ? 'left' as const : 'right' as const,
            padding: isMobile ? '1rem' : '1.5rem', borderRadius: 12, textDecoration: 'none', transition: 'all 0.3s',
            border: '1px solid rgba(26,26,46,0.06)', background: 'rgba(254,253,251,0.6)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', marginBottom: 4 }}>
            Next &rarr;
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: 700, color: next.accent, lineHeight: 1.3 }}>
            {next.title}
          </span>
        </a>
      ) : !isMobile ? <div style={{ flex: 1 }} /> : null}
    </nav>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';

/*
 * PromptMorphAnimation
 * --------------------
 * A text animation showing a bad prompt morphing into a good prompt.
 * Each building-block clause is color-coded and labeled.
 * Pure CSS transitions, no GSAP.
 */

// Building-block colors
const COLORS = {
  role: '#E94560',
  task: '#0F3460',
  format: '#7B61FF',
  constraints: '#16C79A',
  examples: '#F5A623',
} as const;

const LABELS: Record<string, string> = {
  role: 'Role',
  task: 'Task',
  format: 'Format',
  constraints: 'Constraints',
  examples: 'Context',
};

// Each segment has text, a type (building block or 'original'), and an animation delay
interface Segment {
  text: string;
  type: 'original' | keyof typeof COLORS;
  id: string;
}

// The bad prompt broken into pieces, with insertion points
const BAD_SEGMENTS: Segment[] = [
  { text: 'help me with my essay', type: 'original', id: 'original-full' },
];

// The good prompt as a sequence of typed segments
const GOOD_SEGMENTS: Segment[] = [
  { text: 'You are an AP English tutor.', type: 'role', id: 'seg-role' },
  { text: ' Help me strengthen the thesis statement of', type: 'task', id: 'seg-task' },
  { text: ' my argumentative essay', type: 'original', id: 'seg-original' },
  { text: ' Give me 3 alternatives that are specific and debatable.', type: 'format', id: 'seg-format' },
  { text: ' The essay is about social media\'s effect on teen mental health.', type: 'constraints', id: 'seg-constraints' },
];

const TOTAL_CYCLE_MS = 12000;
const MORPH_START_MS = 2000;
const SEGMENT_STAGGER_MS = 900;
const HOLD_MS = 3500;

export default function PromptMorphAnimation() {
  const [phase, setPhase] = useState<'bad' | 'morphing' | 'good' | 'fading'>('bad');
  const [visibleSegments, setVisibleSegments] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const runCycle = useCallback(() => {
    if (!mountedRef.current) return;
    clearTimers();

    setPhase('bad');
    setVisibleSegments(0);

    if (reducedMotion) {
      // In reduced motion, just show the final state
      setPhase('good');
      setVisibleSegments(GOOD_SEGMENTS.length);
      return;
    }

    // Start morphing after 2s
    const t1 = setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase('morphing');

      // Reveal segments one by one
      GOOD_SEGMENTS.forEach((_, i) => {
        const t = setTimeout(() => {
          if (!mountedRef.current) return;
          setVisibleSegments(i + 1);
          if (i === GOOD_SEGMENTS.length - 1) {
            // All segments visible
            const t3 = setTimeout(() => {
              if (!mountedRef.current) return;
              setPhase('good');
            }, 400);
            timerRef.current.push(t3);
          }
        }, i * SEGMENT_STAGGER_MS);
        timerRef.current.push(t);
      });
    }, MORPH_START_MS);
    timerRef.current.push(t1);

    // Fade out and restart
    const totalMorphTime = MORPH_START_MS + GOOD_SEGMENTS.length * SEGMENT_STAGGER_MS + 400;
    const t2 = setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase('fading');

      const t4 = setTimeout(() => {
        if (!mountedRef.current) return;
        runCycle();
      }, 1200);
      timerRef.current.push(t4);
    }, totalMorphTime + HOLD_MS);
    timerRef.current.push(t2);
  }, [reducedMotion, clearTimers]);

  useEffect(() => {
    mountedRef.current = true;
    runCycle();
    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [runCycle, clearTimers]);

  const containerStyle: React.CSSProperties = {
    maxWidth: 800,
    margin: '0 auto',
    background: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid rgba(26, 26, 46, 0.06)',
    boxShadow: '0 4px 32px rgba(26, 26, 46, 0.06), 0 1px 4px rgba(0,0,0,0.02)',
    padding: '36px 28px 28px',
    position: 'relative',
    overflow: 'hidden',
  };

  const badPromptStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(1.2rem, 3vw, 1.7rem)',
    fontWeight: 600,
    lineHeight: 1.5,
    color: '#1A1A2E',
    textAlign: 'center',
    opacity: phase === 'bad' ? 1 : 0,
    transform: phase === 'bad' ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
    position: phase === 'morphing' || phase === 'good' || phase === 'fading' ? 'absolute' : 'relative',
    width: '100%',
    left: 0,
    padding: '0 28px',
    boxSizing: 'border-box',
  };

  const goodPromptContainerStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 'clamp(0.88rem, 2.2vw, 1.1rem)',
    fontWeight: 500,
    lineHeight: 1.8,
    textAlign: 'left',
    opacity: phase === 'bad' ? 0 : phase === 'fading' ? 0 : 1,
    transform: phase === 'bad' ? 'translateY(20px)' : phase === 'fading' ? 'translateY(-10px)' : 'translateY(0)',
    transition: 'opacity 0.8s ease, transform 0.8s ease',
    minHeight: 60,
  };

  const getSegmentStyle = (seg: Segment, index: number): React.CSSProperties => {
    const isVisible = index < visibleSegments;
    const color = seg.type !== 'original' ? COLORS[seg.type as keyof typeof COLORS] : '#1A1A2E';

    return {
      display: 'inline',
      color,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      position: 'relative',
      fontWeight: seg.type !== 'original' ? 600 : 500,
    };
  };

  const labelStyle = (seg: Segment, index: number): React.CSSProperties => {
    const isVisible = index < visibleSegments;
    const color = seg.type !== 'original' ? COLORS[seg.type as keyof typeof COLORS] : 'transparent';

    return {
      display: 'inline',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.55em',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      color,
      opacity: isVisible && seg.type !== 'original' ? 0.55 : 0,
      transition: 'opacity 0.5s ease 0.2s',
      verticalAlign: 'super',
      marginRight: '0.15em',
      pointerEvents: 'none' as const,
    };
  };

  // Decorative dots along top
  const dotsStyle: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    left: 24,
    display: 'flex',
    gap: 6,
  };

  return (
    <div style={containerStyle}>
      {/* Decorative dot row */}
      <div style={dotsStyle}>
        {Object.values(COLORS).map((c, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: c,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Bad prompt */}
      <div style={badPromptStyle}>
        <span style={{ opacity: 0.5, fontStyle: 'italic' }}>help me with my essay</span>
      </div>

      {/* Good prompt (morphing in) */}
      <div style={goodPromptContainerStyle}>
        {GOOD_SEGMENTS.map((seg, i) => (
          <span key={seg.id} style={{ display: 'inline' }}>
            {seg.type !== 'original' && (
              <span style={labelStyle(seg, i)}>{LABELS[seg.type] || ''}</span>
            )}
            <span style={getSegmentStyle(seg, i)}>{seg.text}</span>
          </span>
        ))}
      </div>

      {/* Quality indicator */}
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            color: '#6B7280',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          Prompt quality
        </span>
        <div
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: 'rgba(26, 26, 46, 0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 2,
              width: phase === 'bad' ? '12%' : `${Math.min(12 + visibleSegments * 18, 100)}%`,
              background: `linear-gradient(90deg, ${COLORS.role}, ${COLORS.task}, ${COLORS.format}, ${COLORS.constraints})`,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: phase === 'bad' ? '#6B7280' : COLORS.constraints,
            transition: 'color 0.4s ease',
            flexShrink: 0,
            minWidth: 30,
            textAlign: 'right',
          }}
        >
          {phase === 'bad' ? '12%' : `${Math.min(12 + visibleSegments * 18, 100)}%`}
        </span>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px 14px',
        }}
      >
        {Object.entries(LABELS).filter(([k]) => k !== 'examples').map(([key, label]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: COLORS[key as keyof typeof COLORS],
                opacity: 0.8,
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.04em',
                color: '#6B7280',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

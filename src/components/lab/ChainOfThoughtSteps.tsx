import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * ChainOfThoughtSteps
 * --------------------
 * A step-by-step reasoning visualization for Chapter 2.
 * Shows how "think step by step" produces correct, confident answers
 * vs. a single-shot guess that's uncertain. Inline React styles only.
 *
 * Accent: navy #0F3460 (Chapter 2)
 */

const NAVY = '#0F3460';
const TEAL = '#16C79A';
const AMBER = '#F5A623';
const DEEP = '#1A1A2E';
const SUBTLE = '#6B7280';

interface Step {
  label: string;
  calculation: string;
}

const PROBLEM = 'Is 17 \u00D7 24 greater than 400?';

const STEPS: Step[] = [
  { label: 'Break it down', calculation: '17 \u00D7 20 = 340' },
  { label: 'Remaining part', calculation: '17 \u00D7 4 = 68' },
  { label: 'Combine', calculation: '340 + 68 = 408' },
  { label: 'Compare', calculation: '408 > 400  \u2713' },
];

const COT_ANSWER = 'Yes \u2014 408 is greater than 400.';
const NOCOT_ANSWER = 'Yes';

// Timing constants
const INITIAL_DELAY = 1000;
const STEP_STAGGER = 900;
const CONFIDENCE_DELAY = 600;
const CONTRAST_DELAY = 1200;
const CONTRAST_FILL_DELAY = 500;
const HOLD_DURATION = 3500;
const FADE_DURATION = 700;

export default function ChainOfThoughtSteps() {
  const isMobile = useIsMobile();
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showCoTAnswer, setShowCoTAnswer] = useState(false);
  const [cotConfidence, setCotConfidence] = useState(0);
  const [showContrast, setShowContrast] = useState(false);
  const [noCotConfidence, setNoCotConfidence] = useState(0);
  const [masterOpacity, setMasterOpacity] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const addTimer = (fn: () => void, delay: number) => {
    const t = setTimeout(() => {
      if (mountedRef.current) fn();
    }, delay);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) {
      setVisibleSteps(STEPS.length);
      setShowCoTAnswer(true);
      setCotConfidence(100);
      setShowContrast(true);
      setNoCotConfidence(60);
      setMasterOpacity(1);
      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;
      clearTimers();

      // Reset
      setVisibleSteps(0);
      setShowCoTAnswer(false);
      setCotConfidence(0);
      setShowContrast(false);
      setNoCotConfidence(0);
      setMasterOpacity(1);

      let elapsed = INITIAL_DELAY;

      // Reveal steps one by one
      STEPS.forEach((_, i) => {
        addTimer(() => setVisibleSteps(i + 1), elapsed + i * STEP_STAGGER);
      });
      elapsed += STEPS.length * STEP_STAGGER;

      // Show CoT answer + confidence bar
      elapsed += CONFIDENCE_DELAY;
      addTimer(() => {
        setShowCoTAnswer(true);
        // Animate confidence to 100%
        addTimer(() => setCotConfidence(100), 200);
      }, elapsed);

      // Show contrast section
      elapsed += CONTRAST_DELAY;
      addTimer(() => {
        setShowContrast(true);
        addTimer(() => setNoCotConfidence(60), CONTRAST_FILL_DELAY);
      }, elapsed);

      // Hold, then fade and restart
      elapsed += HOLD_DURATION;
      addTimer(() => {
        setMasterOpacity(0);
        addTimer(() => runCycle(), FADE_DURATION + 400);
      }, elapsed);
    };

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [reducedMotion]);

  const transition = reducedMotion ? 'none' : 'opacity 0.5s ease, transform 0.5s ease';

  // --- Styles ---

  const containerStyle: React.CSSProperties = isMobile
    ? {
        flex: 1,
        width: '100%',
        margin: '0 auto',
        background: '#FFFFFF',
        padding: '24px 20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        opacity: masterOpacity,
        transition: reducedMotion ? 'none' : `opacity ${FADE_DURATION}ms ease`,
      }
    : {
        maxWidth: 520,
        width: '100%',
        margin: '0 auto',
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid rgba(15, 52, 96, 0.12)',
        boxShadow: '0 4px 32px rgba(26, 26, 46, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
        padding: '24px 16px',
        overflow: 'hidden',
        opacity: masterOpacity,
        transition: reducedMotion ? 'none' : `opacity ${FADE_DURATION}ms ease`,
      };

  const problemStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: isMobile ? 'clamp(1.2rem, 4vw, 1.6rem)' : 'clamp(1.1rem, 3vw, 1.4rem)',
    fontWeight: 700,
    color: DEEP,
    textAlign: 'center',
    marginBottom: isMobile ? 12 : 8,
    lineHeight: 1.4,
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: NAVY,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 16,
  };

  const stepCardStyle = (index: number): React.CSSProperties => {
    const visible = index < visibleSteps;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: isMobile ? '16px 18px' : '12px 16px',
      background: '#FFFFFF',
      borderRadius: 10,
      borderLeft: `3px solid ${NAVY}`,
      boxShadow: visible
        ? '0 2px 12px rgba(15, 52, 96, 0.06), 0 1px 3px rgba(0,0,0,0.02)'
        : 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-20px)',
      transition: reducedMotion ? 'none' : 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.3s ease',
      position: 'relative' as const,
    };
  };

  const numberCircleStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: NAVY,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const numberTextStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    fontWeight: 700,
    color: '#FFFFFF',
  };

  const stepTextContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };

  const stepLabelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: SUBTLE,
  };

  const stepCalcStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 15,
    fontWeight: 600,
    color: DEEP,
    letterSpacing: '0.02em',
  };

  const dashedLineStyle = (index: number): React.CSSProperties => ({
    width: 1,
    height: isMobile ? 24 : 16,
    marginLeft: 29,
    borderLeft: `2px dashed ${NAVY}`,
    opacity: index < visibleSteps ? 0.15 : 0,
    transition: reducedMotion ? 'none' : 'opacity 0.4s ease',
  });

  const cotAnswerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: isMobile ? 32 : 20,
    opacity: showCoTAnswer ? 1 : 0,
    transform: showCoTAnswer ? 'translateY(0)' : 'translateY(8px)',
    transition,
  };

  const answerTextStyle: React.CSSProperties = {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 15,
    fontWeight: 600,
    color: DEEP,
    marginBottom: 10,
  };

  const confidenceBarContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  };

  const confidenceLabelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: SUBTLE,
    flexShrink: 0,
  };

  const barTrackStyle: React.CSSProperties = {
    width: 160,
    height: 8,
    borderRadius: 4,
    background: 'rgba(26, 26, 46, 0.06)',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const cotBarFillStyle: React.CSSProperties = {
    height: '100%',
    borderRadius: 4,
    width: `${cotConfidence}%`,
    background: `linear-gradient(90deg, ${TEAL}, ${TEAL}dd)`,
    transition: reducedMotion ? 'none' : 'width 0.8s cubic-bezier(0.34, 1, 0.64, 1)',
  };

  const percentStyle = (value: number, color: string): React.CSSProperties => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    fontWeight: 700,
    color,
    minWidth: 36,
    textAlign: 'right' as const,
  });

  // --- Contrast section ---

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: 'rgba(26, 26, 46, 0.08)',
    margin: isMobile ? '32px 0' : '24px 0',
    opacity: showContrast ? 1 : 0,
    transition: reducedMotion ? 'none' : 'opacity 0.4s ease',
  };

  const contrastContainerStyle: React.CSSProperties = {
    opacity: showContrast ? 1 : 0,
    transform: showContrast ? 'translateY(0)' : 'translateY(10px)',
    transition,
  };

  const contrastHeaderStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: AMBER,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 12,
  };

  const contrastCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 16px',
    background: 'rgba(245, 166, 35, 0.04)',
    borderRadius: 10,
    borderLeft: `3px solid ${AMBER}`,
  };

  const contrastAnswerStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 15,
    fontWeight: 600,
    color: DEEP,
    flex: 1,
  };

  const noCotBarFillStyle: React.CSSProperties = {
    height: '100%',
    borderRadius: 4,
    width: `${noCotConfidence}%`,
    background: `linear-gradient(90deg, ${AMBER}, ${AMBER}cc)`,
    transition: reducedMotion ? 'none' : 'width 0.8s cubic-bezier(0.34, 1, 0.64, 1)',
  };

  const insightStyle: React.CSSProperties = {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 12,
    color: SUBTLE,
    textAlign: 'center',
    marginTop: 14,
    fontStyle: 'italic',
    lineHeight: 1.5,
  };

  return (
    <div style={containerStyle}>
      {/* Decorative label */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <div style={{
          display: 'flex',
          gap: 5,
        }}>
          {[NAVY, NAVY, NAVY, TEAL].map((c, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: c,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8,
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: NAVY,
          opacity: 0.2,
          textTransform: 'uppercase',
        }}>
          CHAIN OF THOUGHT
        </span>
      </div>

      {/* Problem */}
      <div style={problemStyle}>{PROBLEM}</div>
      <div style={sectionLabelStyle}>With &quot;think step by step&quot;</div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', ...(isMobile ? { flex: 1, justifyContent: 'center' } : {}) }}>
        {STEPS.map((step, i) => (
          <div key={i}>
            {/* Dashed connector line */}
            {i > 0 && <div style={dashedLineStyle(i)} />}

            {/* Step card */}
            <div style={stepCardStyle(i)}>
              {/* Number circle */}
              <div style={numberCircleStyle}>
                <span style={numberTextStyle}>{i + 1}</span>
              </div>

              {/* Step content */}
              <div style={stepTextContainerStyle}>
                <span style={stepLabelStyle}>{step.label}</span>
                <span style={stepCalcStyle}>{step.calculation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CoT answer + confidence */}
      <div style={cotAnswerStyle}>
        <div style={answerTextStyle}>{COT_ANSWER}</div>
        <div style={confidenceBarContainerStyle}>
          <span style={confidenceLabelStyle}>Confidence</span>
          <div style={barTrackStyle}>
            <div style={cotBarFillStyle} />
          </div>
          <span style={percentStyle(cotConfidence, TEAL)}>{cotConfidence}%</span>
        </div>
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Contrast: without CoT */}
      <div style={contrastContainerStyle}>
        <div style={contrastHeaderStyle}>Without chain of thought</div>

        <div style={contrastCardStyle}>
          {/* Single shot answer */}
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: AMBER,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: 0.8,
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              color: '#FFFFFF',
            }}>?</span>
          </div>
          <span style={contrastAnswerStyle}>&quot;{NOCOT_ANSWER}&quot;</span>
        </div>

        {/* No-CoT confidence bar */}
        <div style={{
          ...confidenceBarContainerStyle,
          marginTop: 12,
        }}>
          <span style={confidenceLabelStyle}>Confidence</span>
          <div style={barTrackStyle}>
            <div style={noCotBarFillStyle} />
          </div>
          <span style={percentStyle(noCotConfidence, AMBER)}>{noCotConfidence}%</span>
        </div>

        <div style={insightStyle}>
          Explicit reasoning steps lead to more reliable answers.
        </div>
      </div>
    </div>
  );
}

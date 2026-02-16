import { useState, useRef, useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface SkillCard {
  id: string;
  name: string;
  expertPosition: number; // 0 = AI handles, 1 = only humans
  explanation: string;
}

const skills: SkillCard[] = [
  { id: 'drafts', name: 'Writing first drafts', expertPosition: 0.2, explanation: "AI produces solid first drafts quickly. The human edge is in editing, voice, and knowing what's worth saying." },
  { id: 'product', name: 'Choosing which product to build', expertPosition: 0.9, explanation: "This is pure strategic judgment \u2014 understanding markets, user needs, and timing. AI can inform the decision but can't make it." },
  { id: 'data', name: 'Data entry', expertPosition: 0.05, explanation: "One of the most automatable tasks. AI handles structured data processing faster and more accurately than humans." },
  { id: 'empathy', name: 'Empathy in a crisis', expertPosition: 0.95, explanation: "When someone is hurting, they need a human who understands suffering. No amount of training data replicates genuine compassion." },
  { id: 'scaffold', name: 'Code scaffolding', expertPosition: 0.15, explanation: "Boilerplate code, project setup, standard patterns \u2014 AI generates these almost perfectly. Human value is in architecture decisions." },
  { id: 'research', name: 'Research synthesis', expertPosition: 0.45, explanation: "AI excels at gathering and summarizing. But deciding what matters, spotting methodological flaws, and forming original conclusions? That's you." },
  { id: 'scheduling', name: 'Scheduling meetings', expertPosition: 0.08, explanation: "Calendar coordination is almost entirely automatable. AI handles time zones, conflicts, and preferences effortlessly." },
  { id: 'first-principles', name: 'First principles reasoning', expertPosition: 0.85, explanation: "Reasoning from ground truth to novel conclusions is the hardest thing for AI. It remixes patterns; you can think from scratch." },
];

const ACCENT = '#16C79A';

export default function SkillsSpectrum() {
  const [placements, setPlacements] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [animatingReveal, setAnimatingReveal] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const allPlaced = Object.keys(placements).length === skills.length;
  const currentSkill = skills[currentIndex];

  const handleBarInteraction = useCallback((clientX: number) => {
    if (revealed || currentIndex >= skills.length) return;
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setPlacements(prev => ({ ...prev, [currentSkill.id]: x }));
    if (currentIndex < skills.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, revealed, currentSkill]);

  const handleBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleBarInteraction(e.clientX);
  }, [handleBarInteraction]);

  const handleBarTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleBarInteraction(e.touches[0].clientX);
    }
  }, [handleBarInteraction]);

  const handleReveal = () => {
    setAnimatingReveal(true);
    // Calculate score
    let totalError = 0;
    skills.forEach(skill => {
      const userPos = placements[skill.id] ?? 0.5;
      totalError += Math.abs(userPos - skill.expertPosition);
    });
    const avgError = totalError / skills.length;
    const finalScore = Math.round(Math.max(0, (1 - avgError * 2)) * 100);

    // Animate placements to expert positions
    const newPlacements: Record<string, number> = {};
    skills.forEach(skill => {
      newPlacements[skill.id] = skill.expertPosition;
    });

    setTimeout(() => {
      setPlacements(newPlacements);
      setRevealed(true);
      setScore(finalScore);
      setAnimatingReveal(false);
    }, 100);
  };

  const handleReset = () => {
    setPlacements({});
    setCurrentIndex(0);
    setRevealed(false);
    setScore(null);
    setAnimatingReveal(false);
  };

  const getZoneColor = (pos: number) => {
    if (pos < 0.33) return ACCENT;
    if (pos < 0.67) return '#F5A623';
    return '#E94560';
  };

  const getZoneLabel = (pos: number) => {
    if (pos < 0.33) return 'AI handles';
    if (pos < 0.67) return 'AI-assisted';
    return 'Mostly human';
  };

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Skills Spectrum</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Place each skill on the AI\u2013Human spectrum</p>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
        {/* Spectrum bar */}
        <div style={{ marginBottom: isMobile ? '1.25rem' : '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: ACCENT }}>AI handles</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#F5A623' }}>AI-assisted</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#E94560' }}>Only humans</span>
          </div>

          <div
            ref={barRef}
            onClick={handleBarClick}
            onTouchStart={handleBarTouch}
            style={{
              position: 'relative',
              height: isMobile ? 64 : 56,
              borderRadius: 12,
              background: `linear-gradient(90deg, ${ACCENT}20 0%, #F5A62320 50%, #E9456020 100%)`,
              border: '1px solid rgba(26,26,46,0.08)',
              cursor: !revealed && currentIndex < skills.length ? 'crosshair' : 'default',
              overflow: 'visible',
              touchAction: 'none',
            }}
          >
            {/* Zone lines */}
            <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: 1, background: 'rgba(26,26,46,0.08)' }} />
            <div style={{ position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: 1, background: 'rgba(26,26,46,0.08)' }} />

            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: `linear-gradient(90deg, ${ACCENT}15 0%, transparent 15%, transparent 85%, #E9456015 100%)`, pointerEvents: 'none' }} />

            {/* Placed markers */}
            {skills.map((skill) => {
              const pos = placements[skill.id];
              if (pos === undefined) return null;
              return (
                <div
                  key={skill.id}
                  style={{
                    position: 'absolute',
                    left: `${pos * 100}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    transition: animatingReveal || revealed ? 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                    zIndex: 10,
                  }}
                >
                  <div style={{
                    width: isMobile ? 36 : 28,
                    height: isMobile ? 36 : 28,
                    borderRadius: '50%',
                    background: revealed ? getZoneColor(pos) : '#1A1A2E',
                    border: '2px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'white',
                    transition: 'background 0.5s ease',
                  }}>
                    {skills.findIndex(s => s.id === skill.id) + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current skill card or completion state */}
        {!allPlaced && !revealed && (
          <div style={{
            background: 'rgba(26,26,46,0.02)',
            border: '1px solid rgba(26,26,46,0.08)',
            borderRadius: 12,
            padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8 }}>
              Skill {currentIndex + 1} of {skills.length} {isMobile ? '\u2014 Tap the bar' : '\u2014 Click the bar to place it'}
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: isMobile ? '1.05rem' : '1.25rem',
              fontWeight: 700,
              color: '#1A1A2E',
              padding: isMobile ? '0.5rem 1rem' : '0.5rem 1.5rem',
              display: 'inline-block',
              borderRadius: 8,
              background: 'white',
              border: '1px solid rgba(26,26,46,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              {currentSkill?.name}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#6B7280', marginTop: 10 }}>
              Where does this skill fall? {isMobile ? 'Tap' : 'Click'} on the spectrum above.
            </p>
          </div>
        )}

        {allPlaced && !revealed && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#1A1A2E', marginBottom: 16 }}>
              All skills placed! Ready to see how your intuition compares to expert consensus?
            </p>
            <button
              onClick={handleReveal}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'white',
                background: `linear-gradient(135deg, ${ACCENT}, #0F3460)`,
                border: 'none',
                borderRadius: 10,
                padding: isMobile ? '14px 28px' : '12px 32px',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${ACCENT}40`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                minHeight: 44,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${ACCENT}50`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${ACCENT}40`; }}
            >
              Reveal Expert Consensus
            </button>
          </div>
        )}

        {/* Revealed results */}
        {revealed && (
          <>
            {/* Score */}
            <div style={{
              textAlign: 'center',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              background: `linear-gradient(135deg, ${ACCENT}08, #F5A62308)`,
              borderRadius: 12,
              border: `1px solid ${ACCENT}20`,
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Your accuracy score</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{score}%</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#6B7280', marginTop: 8 }}>
                {(score ?? 0) >= 75 ? "Excellent intuition! You have a strong sense of where AI helps most." :
                 (score ?? 0) >= 50 ? "Good instincts. The middle zone is where most people second-guess themselves." :
                 "The spectrum is trickier than it looks. That's exactly the point \u2014 most skills land in the 'AI-assisted' middle."}
              </p>
            </div>

            {/* Legend with explanations */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {skills.map((skill, i) => (
                <div
                  key={skill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: isMobile ? 10 : 12,
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    borderRadius: 10,
                    background: 'white',
                    border: '1px solid rgba(26,26,46,0.06)',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: getZoneColor(skill.expertPosition),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'white',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: isMobile ? 'wrap' as const : 'nowrap' as const }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700, color: '#1A1A2E' }}>{skill.name}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                        color: getZoneColor(skill.expertPosition),
                        background: `${getZoneColor(skill.expertPosition)}12`,
                        padding: '2px 8px', borderRadius: 4,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase' as const,
                        whiteSpace: 'nowrap' as const,
                      }}>
                        {getZoneLabel(skill.expertPosition)}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.6, color: '#6B7280', margin: 0 }}>{skill.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div style={{
              marginTop: '1.5rem',
              padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${ACCENT}06, #F5A62306)`,
              border: `1px solid ${ACCENT}15`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${ACCENT}, #F5A623)`, borderRadius: '3px 0 0 3px' }} />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: ACCENT, margin: '0 0 0.5rem' }}>Key insight</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7, color: '#1A1A2E', margin: 0 }}>
                The middle is where it gets interesting. Most skills aren't "AI-replaced" or "human-only" &mdash; they're <strong>AI-assisted</strong>. The real question isn't "will AI take this job?" but "how does AI change what this skill looks like?"
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button
                onClick={handleReset}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                  color: '#6B7280', background: 'transparent', border: '1px solid rgba(26,26,46,0.12)',
                  borderRadius: 8, padding: '8px 20px', cursor: 'pointer', transition: 'all 0.2s ease',
                  letterSpacing: '0.05em', minHeight: 44,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.12)'; e.currentTarget.style.color = '#6B7280'; }}
              >
                Try again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

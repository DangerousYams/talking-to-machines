import { useState } from 'react';
import { careers, type Career, type CareerTask } from '../../../data/career-skills';
import { useIsMobile } from '../../../hooks/useMediaQuery';

const ACCENT = '#16C79A';

function TaskBubble({ task, index, isMobile }: { task: CareerTask; index: number; isMobile: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getColor = (level: number) => {
    if (level >= 0.65) return ACCENT;
    if (level >= 0.35) return '#F5A623';
    return '#E94560';
  };

  const getLabel = (level: number) => {
    if (level >= 0.65) return 'High AI assist';
    if (level >= 0.35) return 'Moderate AI assist';
    return 'Mostly human';
  };

  const color = getColor(task.aiLevel);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <div style={{
        padding: isMobile ? '12px 14px' : '10px 16px',
        borderRadius: 10,
        border: '1px solid rgba(26,26,46,0.06)',
        background: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: showTooltip ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
        transform: showTooltip ? 'translateY(-2px)' : 'none',
        minHeight: isMobile ? 44 : 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 600, color: '#1A1A2E', flex: 1 }}>
            {task.name}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 600,
            color, background: `${color}12`, padding: '2px 6px', borderRadius: 4,
            letterSpacing: '0.05em', textTransform: 'uppercase' as const, flexShrink: 0,
            whiteSpace: 'nowrap' as const,
          }}>
            {getLabel(task.aiLevel)}
          </span>
        </div>
        {/* Fill meter */}
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${task.aiLevel * 100}%`,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
      </div>

      {/* Tooltip — on mobile show below, on desktop show above */}
      {showTooltip && (
        <div style={{
          position: isMobile ? 'relative' as const : 'absolute' as const,
          bottom: isMobile ? 'auto' : '100%',
          left: isMobile ? 0 : '50%',
          transform: isMobile ? 'none' : 'translateX(-50%)',
          marginBottom: isMobile ? 0 : 8,
          marginTop: isMobile ? 8 : 0,
          width: isMobile ? '100%' : 280,
          maxWidth: '90vw',
          padding: '12px 16px',
          borderRadius: 10,
          background: '#1A1A2E',
          color: 'white',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 50,
          pointerEvents: 'none' as const,
        }}>
          {task.explanation}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              bottom: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 12,
              height: 12,
              background: '#1A1A2E',
              rotate: '45deg',
              borderRadius: 2,
            }} />
          )}
        </div>
      )}
    </div>
  );
}

function CareerCard({ career, isSelected, onClick, isMobile }: { career: Career; isSelected: boolean; onClick: () => void; isMobile: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'row' as const : 'column' as const,
        alignItems: 'center',
        gap: isMobile ? 10 : 6,
        padding: isMobile ? '12px 14px' : '16px 12px',
        borderRadius: 12,
        border: '1px solid',
        borderColor: isSelected ? `${ACCENT}50` : 'rgba(26,26,46,0.06)',
        background: isSelected ? `${ACCENT}08` : 'white',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: isSelected ? `0 4px 16px ${ACCENT}15` : '0 1px 3px rgba(0,0,0,0.03)',
        transform: isSelected ? 'translateY(-2px)' : 'none',
        width: '100%',
        minHeight: 44,
      }}
    >
      <span style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', lineHeight: 1, flexShrink: 0 }}>{career.emoji}</span>
      <span style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: isSelected ? ACCENT : '#1A1A2E',
        transition: 'color 0.25s ease',
        textAlign: isMobile ? 'left' as const : 'center' as const,
      }}>
        {career.name}
      </span>
    </button>
  );
}

export default function JobTransformer() {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const career = careers.find(c => c.name === selectedCareer);

  const getAiAssistedPercent = (career: Career) => {
    const count = career.tasks.filter(t => t.aiLevel >= 0.35).length;
    return Math.round((count / career.tasks.length) * 100);
  };

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Job Transformer</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>See how AI transforms careers from the inside</p>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
        {/* Career grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: career ? (isMobile ? '1.25rem' : '2rem') : 0,
        }}>
          {careers.map(c => (
            <CareerCard
              key={c.name}
              career={c}
              isSelected={selectedCareer === c.name}
              onClick={() => setSelectedCareer(selectedCareer === c.name ? null : c.name)}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Expanded task view */}
        {career && (
          <div style={{
            animation: 'fadeIn 0.3s ease',
          }}>
            {/* Career summary */}
            <div style={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 12 : 16,
              padding: isMobile ? '1rem' : '1.25rem 1.5rem',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${ACCENT}06, #F5A62306)`,
              border: `1px solid ${ACCENT}15`,
              marginBottom: '1.25rem',
              flexWrap: isMobile ? 'wrap' as const : 'nowrap' as const,
            }}>
              <span style={{ fontSize: '2rem', flexShrink: 0 }}>{career.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{career.name}</h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#6B7280', margin: '4px 0 0' }}>
                  <strong style={{ color: ACCENT }}>{getAiAssistedPercent(career)}%</strong> of tasks are AI-assisted.{' '}
                  <span style={{ fontStyle: 'italic' }}>The job shape-shifts, it doesn't disappear.</span>
                </p>
              </div>
              {/* Mini ring chart */}
              <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(26,26,46,0.06)" strokeWidth="4" />
                  <circle
                    cx="26" cy="26" r="22" fill="none"
                    stroke={ACCENT} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${getAiAssistedPercent(career) * 1.382} 138.2`}
                    transform="rotate(-90 26 26)"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: ACCENT,
                }}>
                  {getAiAssistedPercent(career)}%
                </div>
              </div>
            </div>

            {/* Color legend */}
            <div style={{ display: 'flex', gap: isMobile ? 10 : 16, marginBottom: '1rem', flexWrap: 'wrap' as const }}>
              {[
                { color: ACCENT, label: 'High AI assist (65%+)' },
                { color: '#F5A623', label: 'Moderate (35\u201365%)' },
                { color: '#E94560', label: 'Mostly human (<35%)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#6B7280', letterSpacing: '0.04em' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Task bubbles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 10,
            }}>
              {career.tasks.map((task, i) => (
                <TaskBubble key={task.name} task={task} index={i} isMobile={isMobile} />
              ))}
            </div>

            {/* Insight */}
            <div style={{
              marginTop: '1.5rem',
              padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem',
              borderRadius: 10,
              background: 'rgba(26,26,46,0.02)',
              border: '1px solid rgba(26,26,46,0.06)',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.7, color: '#6B7280', margin: 0, textAlign: 'center' }}>
                {isMobile ? 'Tap' : 'Hover or tap'} any task to see exactly how AI changes it. Notice: the tasks closest to <strong style={{ color: '#E94560' }}>red</strong> are where <em>your</em> unique human value matters most.
              </p>
            </div>
          </div>
        )}

        {!career && (
          <div style={{ textAlign: 'center', padding: '1rem 0 0', color: '#6B7280' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
              Pick a career above to see how AI transforms it from the inside.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

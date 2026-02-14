import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

const ACCENT = '#16C79A';

interface Problem {
  id: number;
  domain: string;
  domainColor: string;
  question: string;
  aiAnswer: string;
  aiCorrect: boolean;
  explanation: string;
  firstPrinciplesReasoning: string;
}

const problems: Problem[] = [
  {
    id: 1,
    domain: 'Math',
    domainColor: '#7B61FF',
    question: 'If you double the radius of a pipe, how much more water flows through it?',
    aiAnswer: 'Doubling the radius doubles the cross-sectional area, so 2x as much water flows through.',
    aiCorrect: false,
    explanation: 'The AI is wrong. The cross-sectional area of a pipe is \u03C0r\u00B2. If you double r, the area becomes \u03C0(2r)\u00B2 = 4\u03C0r\u00B2. That\'s 4 times the area, so 4x the water flow \u2014 not 2x.',
    firstPrinciplesReasoning: 'Start from the formula: Area = \u03C0r\u00B2. This is a squared relationship. When you double the input of any squared function, the output quadruples. The AI confused a linear relationship (2x) with a quadratic one (4x).',
  },
  {
    id: 2,
    domain: 'Physics',
    domainColor: '#0EA5E9',
    question: 'Does a heavier object fall faster than a lighter one?',
    aiAnswer: 'Yes \u2014 a heavier object experiences a greater gravitational force, which accelerates it faster toward the ground.',
    aiCorrect: false,
    explanation: 'The AI is wrong. While a heavier object does experience more gravitational force, it also has proportionally more mass (F = ma, so a = F/m = g). In a vacuum, all objects fall at the same rate: 9.8 m/s\u00B2. Galileo demonstrated this 400 years ago.',
    firstPrinciplesReasoning: 'Newton\'s second law: F = ma. Gravitational force: F = mg. So a = mg/m = g. The mass cancels out entirely. Acceleration due to gravity is constant regardless of mass. Air resistance complicates things in practice, but the principle is clear.',
  },
  {
    id: 3,
    domain: 'Logic',
    domainColor: '#F5A623',
    question: '"All roses are flowers. Some flowers fade quickly. Therefore, some roses fade quickly." Is this syllogism valid?',
    aiAnswer: 'Yes, this is a valid syllogism. Since all roses are flowers and some flowers fade quickly, it logically follows that some roses must also fade quickly.',
    aiCorrect: false,
    explanation: 'The AI is wrong. This is the fallacy of the undistributed middle. "Some flowers fade quickly" doesn\'t specify WHICH flowers. The ones that fade quickly could all be tulips and daisies \u2014 none of them roses. The conclusion doesn\'t follow.',
    firstPrinciplesReasoning: 'Draw a Venn diagram. Roses are fully inside "flowers." The "fades quickly" circle overlaps with "flowers" but could overlap with ANY part of it \u2014 including parts that don\'t include roses. Just because two sets both overlap with a third set doesn\'t mean they overlap with each other.',
  },
  {
    id: 4,
    domain: 'Statistics',
    domainColor: '#E94560',
    question: 'A medical test is 99% accurate. You test positive. What\'s the probability you actually have the condition?',
    aiAnswer: 'With 99% accuracy, there\'s a 99% chance you have the condition. The test is highly reliable.',
    aiCorrect: false,
    explanation: 'The AI is wrong. This is the base rate fallacy. If only 1 in 10,000 people have the condition, then for every 10,000 tested: 1 true positive + ~100 false positives. Your chance of actually having it is roughly 1 in 101, or about 1%. The base rate matters enormously.',
    firstPrinciplesReasoning: 'Bayes\' theorem: P(sick|positive) = P(positive|sick) \u00D7 P(sick) / P(positive). Without knowing the base rate P(sick), you can\'t compute the answer. "99% accurate" tells you P(positive|sick), but that\'s only half the equation. The prevalence of the condition is the missing piece.',
  },
  {
    id: 5,
    domain: 'Geography',
    domainColor: '#16C79A',
    question: 'What is the longest river in Africa?',
    aiAnswer: 'The Nile is the longest river in Africa, stretching approximately 6,650 kilometers from its sources in East Africa to its delta in Egypt on the Mediterranean Sea.',
    aiCorrect: true,
    explanation: 'The AI is correct. The Nile is indeed the longest river in Africa and, by most measurements, the longest river in the world.',
    firstPrinciplesReasoning: 'This is a factual recall question. While the exact measurement is debated (the Amazon may be longer depending on how you measure), the Nile is the conventional answer and the AI got it right. Not every AI answer is wrong \u2014 knowing when to trust is part of the skill.',
  },
  {
    id: 6,
    domain: 'History',
    domainColor: '#0F3460',
    question: 'Did Vikings wear horned helmets in battle?',
    aiAnswer: 'Yes, Vikings wore horned helmets as part of their battle gear. The horns served both as intimidation tools and as ceremonial decorations for their warrior culture.',
    aiCorrect: false,
    explanation: 'The AI is wrong. There is no archaeological evidence that Vikings wore horned helmets in battle. This myth was popularized by 19th-century Romantic artists and later by opera costumes. Real Viking helmets were simple iron or leather caps, sometimes with a nose guard.',
    firstPrinciplesReasoning: 'Ask: what\'s the primary source? Archaeological digs of Viking burial sites have uncovered helmets \u2014 none with horns. The horned helmet image comes from artistic depictions made 800+ years after the Viking age. When an AI states a "fact," trace it to its origin. Pop culture is not a primary source.',
  },
];

export default function FirstPrinciplesLab() {
  const isMobile = useIsMobile();
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'trust' | 'challenge'>>({});
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const problem = problems[currentProblem];
  const hasAnswered = answers[problem.id] !== undefined;

  const handleAnswer = (choice: 'trust' | 'challenge') => {
    setAnswers(prev => ({ ...prev, [problem.id]: choice }));
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(prev => prev + 1);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentProblem(0);
    setAnswers({});
    setShowResult(false);
    setFinished(false);
  };

  const isCorrect = (problemItem: Problem, answer: 'trust' | 'challenge') => {
    if (problemItem.aiCorrect && answer === 'trust') return true;
    if (!problemItem.aiCorrect && answer === 'challenge') return true;
    return false;
  };

  const getScore = () => {
    let correct = 0;
    problems.forEach(p => {
      const a = answers[p.id];
      if (a && isCorrect(p, a)) correct++;
    });
    return correct;
  };

  const currentAnswer = answers[problem.id];
  const currentCorrect = currentAnswer ? isCorrect(problem, currentAnswer) : null;

  if (finished) {
    const finalScore = getScore();
    const pct = Math.round((finalScore / problems.length) * 100);
    return (
      <div className="widget-container">
        {/* Header */}
        <div style={{ padding: isMobile ? '1.25rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="12" r="10" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>First Principles Lab</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Results</p>
            </div>
          </div>
        </div>

        <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem', textAlign: 'center' }}>
          <div style={{
            padding: isMobile ? '1.25rem' : '2rem',
            borderRadius: 16,
            background: `linear-gradient(135deg, ${ACCENT}08, #7B61FF08)`,
            border: `1px solid ${ACCENT}20`,
            marginBottom: isMobile ? '1.25rem' : '2rem',
          }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: 800, color: ACCENT, lineHeight: 1 }}>
              {finalScore}/{problems.length}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#1A1A2E', marginTop: 12, marginBottom: 0 }}>
              {pct >= 80 ? "Excellent critical thinking. You know when to trust and when to verify." :
               pct >= 50 ? "Good instincts, but some confident-sounding AI answers tripped you up." :
               "AI's confidence is persuasive. That's exactly why first-principles reasoning matters."}
            </p>
          </div>

          {/* Summary of each problem */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, textAlign: 'left', marginBottom: isMobile ? '1.25rem' : '2rem' }}>
            {problems.map(p => {
              const a = answers[p.id];
              const correct = a ? isCorrect(p, a) : false;
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 10,
                  flexWrap: isMobile ? 'wrap' as const : 'nowrap' as const,
                  padding: isMobile ? '10px 12px' : '10px 14px', borderRadius: 8,
                  background: correct ? `${ACCENT}06` : '#E9456006',
                  border: `1px solid ${correct ? ACCENT : '#E94560'}15`,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: correct ? ACCENT : '#E94560',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', color: 'white',
                  }}>
                    {correct ? '\u2713' : '\u2717'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, color: p.domainColor, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{p.domain}: </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#1A1A2E' }}>{p.question}</span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                    color: '#6B7280', flexShrink: 0,
                    ...(isMobile ? { marginLeft: 32, marginTop: 2 } : {}),
                  }}>
                    You {a === 'trust' ? 'trusted' : 'challenged'} \u2014 AI was {p.aiCorrect ? 'right' : 'wrong'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Key insight */}
          <div style={{
            padding: isMobile ? '1rem' : '1.25rem 1.5rem',
            borderRadius: 12,
            background: `linear-gradient(135deg, ${ACCENT}06, #F5A62306)`,
            border: `1px solid ${ACCENT}15`,
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'left',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${ACCENT}, #F5A623)`, borderRadius: '3px 0 0 3px' }} />
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: ACCENT, margin: '0 0 0.5rem' }}>Key insight</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7, color: '#1A1A2E', margin: 0 }}>
              <strong>You can only catch AI mistakes in domains where you have fundamental understanding.</strong> Your knowledge is your BS detector. The more you understand first principles \u2014 in math, logic, science, history \u2014 the better you can evaluate AI output.
            </p>
          </div>

          <button
            onClick={handleReset}
            style={{
              marginTop: '1.5rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
              color: '#6B7280', background: 'transparent', border: '1px solid rgba(26,26,46,0.12)',
              borderRadius: 8, padding: '10px 20px', cursor: 'pointer', transition: 'all 0.2s ease',
              letterSpacing: '0.05em', minHeight: 44,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.12)'; e.currentTarget.style.color = '#6B7280'; }}
          >
            Play again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="12" r="10" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>First Principles Lab</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Can you spot when AI gets it wrong?</p>
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: '#6B7280' }}>
              {currentProblem + 1} / {problems.length}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem', justifyContent: 'center' }}>
          {problems.map((p, i) => {
            const a = answers[p.id];
            const done = a !== undefined;
            const correct = done ? isCorrect(p, a) : null;
            return (
              <div key={p.id} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i === currentProblem ? '#1A1A2E' : done ? (correct ? ACCENT : '#E94560') : 'rgba(26,26,46,0.1)',
                transition: 'all 0.3s ease',
              }} />
            );
          })}
        </div>

        {/* Domain badge */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
            color: problem.domainColor, background: `${problem.domainColor}12`,
            padding: '4px 10px', borderRadius: 6,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          }}>
            {problem.domain}
          </span>
        </div>

        {/* Question */}
        <div style={{
          padding: isMobile ? '1rem' : '1.25rem 1.5rem',
          borderRadius: 12,
          background: 'rgba(26,26,46,0.02)',
          border: '1px solid rgba(26,26,46,0.06)',
          marginBottom: '1.25rem',
        }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: 600, lineHeight: 1.5, color: '#1A1A2E', margin: 0 }}>
            {problem.question}
          </p>
        </div>

        {/* AI Answer */}
        <div style={{
          padding: isMobile ? '1rem' : '1.25rem 1.5rem',
          borderRadius: 12,
          border: '1px solid rgba(26,26,46,0.08)',
          background: 'white',
          marginBottom: '1.5rem',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -1, left: isMobile ? '1rem' : '2rem', right: isMobile ? '1rem' : '2rem', height: 2, borderRadius: 1,
            background: showResult ? (problem.aiCorrect ? ACCENT : '#E94560') : '#7B61FF',
            transition: 'background 0.3s ease',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7B61FF' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>
              AI's Answer
            </span>
            {showResult && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                color: problem.aiCorrect ? ACCENT : '#E94560',
                background: problem.aiCorrect ? `${ACCENT}12` : '#E9456012',
                padding: '2px 8px', borderRadius: 4,
                marginLeft: 'auto',
              }}>
                {problem.aiCorrect ? 'CORRECT' : 'WRONG'}
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', lineHeight: 1.75, color: '#1A1A2E', margin: 0 }}>
            {problem.aiAnswer}
          </p>
        </div>

        {/* Trust / Challenge buttons */}
        {!showResult && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <button
              onClick={() => handleAnswer('trust')}
              style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
                color: ACCENT, background: `${ACCENT}08`,
                border: `2px solid ${ACCENT}30`,
                borderRadius: 12, padding: '14px 20px', cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: 44,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}15`; e.currentTarget.style.borderColor = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${ACCENT}08`; e.currentTarget.style.borderColor = `${ACCENT}30`; }}
            >
              Trust AI
            </button>
            <button
              onClick={() => handleAnswer('challenge')}
              style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
                color: '#E94560', background: '#E9456008',
                border: '2px solid #E9456030',
                borderRadius: 12, padding: '14px 20px', cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: 44,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E9456015'; e.currentTarget.style.borderColor = '#E94560'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E9456008'; e.currentTarget.style.borderColor = '#E9456030'; }}
            >
              Challenge AI
            </button>
          </div>
        )}

        {/* Result */}
        {showResult && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Correct / Wrong badge */}
            <div style={{
              padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem',
              borderRadius: 12,
              background: currentCorrect ? `${ACCENT}08` : '#E9456008',
              border: `1px solid ${currentCorrect ? ACCENT : '#E94560'}20`,
              marginBottom: '1rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
                color: currentCorrect ? ACCENT : '#E94560', margin: '0 0 6px',
              }}>
                {currentCorrect ? 'Correct!' : 'Not quite.'}
                {' '}
                <span style={{ fontWeight: 400, color: '#6B7280', fontSize: '0.85rem' }}>
                  You {currentAnswer === 'trust' ? 'trusted' : 'challenged'} the AI. It was {problem.aiCorrect ? 'right' : 'wrong'}.
                </span>
              </p>
            </div>

            {/* Explanation */}
            <div style={{
              padding: isMobile ? '1rem' : '1.25rem 1.5rem',
              borderRadius: 12,
              background: 'rgba(26,26,46,0.02)',
              border: '1px solid rgba(26,26,46,0.06)',
              marginBottom: '1rem',
            }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', marginBottom: 8 }}>What happened</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.75, color: '#1A1A2E', margin: 0 }}>{problem.explanation}</p>
            </div>

            {/* First principles reasoning */}
            <div style={{
              padding: isMobile ? '1rem' : '1.25rem 1.5rem',
              borderRadius: 12,
              background: `${problem.domainColor}05`,
              border: `1px solid ${problem.domainColor}15`,
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '1.5rem',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: problem.domainColor, borderRadius: '3px 0 0 3px' }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: problem.domainColor, marginBottom: 8 }}>First principles reasoning</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.75, color: '#1A1A2E', margin: 0 }}>{problem.firstPrinciplesReasoning}</p>
            </div>

            {/* Next button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleNext}
                style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
                  color: 'white',
                  background: `linear-gradient(135deg, ${ACCENT}, #0F3460)`,
                  border: 'none', borderRadius: 10, padding: isMobile ? '14px 28px' : '12px 32px',
                  cursor: 'pointer', boxShadow: `0 4px 16px ${ACCENT}40`,
                  transition: 'transform 0.2s ease',
                  minHeight: 44,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {currentProblem < problems.length - 1 ? 'Next Problem' : 'See Results'}
              </button>
            </div>
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

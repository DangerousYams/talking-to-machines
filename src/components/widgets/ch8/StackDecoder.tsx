import { useState, useCallback } from 'react';
import { stackLayers, quizItems } from '../../../data/stack-vocabulary';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';
import { useTranslation } from '../../../i18n/useTranslation';

const ACCENT = '#0F3460';

type Mode = 'explore' | 'quiz';

/** Renders the detail content for a given layer (shared between desktop expand and mobile BottomSheet). */
function LayerDetail({ layer }: { layer: typeof stackLayers[number] }) {
  const t = useTranslation('stackDecoder');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '0.92rem',
        lineHeight: 1.7, color: '#1A1A2E', margin: 0,
      }}>
        {layer.description}
      </p>

      {/* Analogy callout */}
      <div style={{
        padding: '0.85rem 1rem',
        background: `${layer.color}08`,
        borderRadius: 10,
        borderLeft: `3px solid ${layer.color}`,
      }}>
        <p style={{
          margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.85rem',
          fontStyle: 'italic', color: '#1A1A2E', lineHeight: 1.65, opacity: 0.85,
        }}>
          {layer.analogy}
        </p>
      </div>

      {/* Nouns */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase' as const,
          color: layer.color, marginBottom: '0.6rem',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', background: layer.color,
          }} />
          {t('nounsLabel', 'Nouns (the things)')}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.6rem',
        }}>
          {layer.nouns.map((noun) => (
            <div key={noun.term} style={{
              padding: '0.7rem 0.85rem',
              background: 'rgba(26,26,46,0.025)',
              border: '1px solid rgba(26,26,46,0.06)',
              borderRadius: 8,
            }}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.82rem',
                fontWeight: 700, color: '#1A1A2E', marginBottom: '0.25rem',
              }}>
                {noun.term}
              </div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                color: '#1A1A2E', opacity: 0.7, margin: '0 0 0.4rem',
                lineHeight: 1.5,
              }}>
                {noun.explanation}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                {noun.examples.map((ex) => (
                  <span key={ex} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem', borderRadius: 4,
                    background: `${layer.color}12`, color: layer.color,
                    fontWeight: 600, whiteSpace: 'nowrap' as const,
                  }}>
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verbs */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase' as const,
          color: layer.color, marginBottom: '0.6rem',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', background: layer.color,
          }} />
          {t('verbsLabel', 'Verbs (the actions)')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {layer.verbs.map((verb) => (
            <div key={verb.term} style={{
              display: 'flex', gap: '0.5rem', alignItems: 'baseline',
              padding: '0.4rem 0',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                fontWeight: 700, color: layer.color, flexShrink: 0,
              }}>
                {verb.term}
              </span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                color: '#1A1A2E', opacity: 0.7, lineHeight: 1.5,
              }}>
                {verb.explanation}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function StackDecoder() {
  const t = useTranslation('stackDecoder');
  const isMobile = useIsMobile();

  // --- Explore state ---
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [mobileLayerOpen, setMobileLayerOpen] = useState(false);

  // --- Mode state ---
  const [mode, setMode] = useState<Mode>('explore');

  // --- Quiz state ---
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [quizDone, setQuizDone] = useState(false);

  // Mobile quiz BottomSheet states
  const [mobileQuizExplanationOpen, setMobileQuizExplanationOpen] = useState(false);
  const [mobileQuizDoneOpen, setMobileQuizDoneOpen] = useState(false);

  const totalQuizRounds = quizItems.length;
  const currentQuiz = quizItems[quizIndex];
  const quizIsCorrect = quizSelected === currentQuiz?.correctLayer;

  // --- Explore handlers ---
  const handleLayerClick = useCallback((layerId: string) => {
    if (isMobile) {
      setSelectedLayerId(layerId);
      setMobileLayerOpen(true);
    } else {
      setSelectedLayerId((prev) => (prev === layerId ? null : layerId));
    }
  }, [isMobile]);

  // --- Quiz handlers ---
  const handleQuizAnswer = useCallback((layerId: string) => {
    if (quizAnswered) return;
    setQuizSelected(layerId);
    setQuizAnswered(true);
    const correct = layerId === currentQuiz.correctLayer;
    if (correct) setQuizScore((s) => s + 1);
    setQuizResults((r) => [...r, correct]);
    if (isMobile) {
      setMobileQuizExplanationOpen(true);
    }
  }, [quizAnswered, currentQuiz, isMobile]);

  const handleQuizNext = useCallback(() => {
    setMobileQuizExplanationOpen(false);
    if (quizIndex + 1 >= totalQuizRounds) {
      setQuizDone(true);
      if (isMobile) {
        setMobileQuizDoneOpen(true);
      }
    } else {
      setQuizIndex((i) => i + 1);
      setQuizAnswered(false);
      setQuizSelected(null);
    }
  }, [quizIndex, totalQuizRounds, isMobile]);

  const handleQuizRestart = useCallback(() => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizSelected(null);
    setQuizResults([]);
    setQuizDone(false);
    setMobileQuizExplanationOpen(false);
    setMobileQuizDoneOpen(false);
  }, []);

  const switchToQuiz = useCallback(() => {
    setMode('quiz');
    handleQuizRestart();
  }, [handleQuizRestart]);

  const switchToExplore = useCallback(() => {
    setMode('explore');
    setSelectedLayerId(null);
  }, []);

  // --- Helpers ---
  const getLayerById = (id: string) => stackLayers.find((l) => l.id === id);
  const selectedLayer = selectedLayerId ? getLayerById(selectedLayerId) : null;
  const correctLayer = currentQuiz ? getLayerById(currentQuiz.correctLayer) : null;

  // Score feedback
  const getScoreFeedback = (score: number, total: number) => {
    const pct = Math.round((score / total) * 100);
    if (pct >= 90) return t('scoreFeedbackExcellent', "Outstanding. You speak stack fluently.");
    if (pct >= 75) return t('scoreFeedbackGood', "Strong showing. You know where things live in the stack.");
    if (pct >= 50) return t('scoreFeedbackOkay', "Getting there. A few layers tripped you up, but that's what practice is for.");
    return t('scoreFeedbackPoor', "The stack is still a bit fuzzy. Try exploring each layer again, then come back.");
  };

  // =====================================================================
  //  QUIZ MODE
  // =====================================================================

  if (mode === 'quiz') {
    // --- Quiz: Final score (desktop) ---
    if (quizDone && !isMobile) {
      const pct = Math.round((quizScore / totalQuizRounds) * 100);
      return (
        <div className="widget-container">
          <style>{`
            @keyframes sd-scoreUp { from { opacity: 0; transform: scale(0.8) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          `}</style>
          <div style={{ padding: '3rem 2rem', textAlign: 'center' as const }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '3.5rem',
              fontWeight: 800, color: pct >= 75 ? '#16C79A' : '#E94560',
              marginBottom: '0.25rem', lineHeight: 1,
              animation: 'sd-scoreUp 0.5s ease both',
            }}>
              {quizScore}/{totalQuizRounds}
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
              color: '#6B7280', letterSpacing: '0.08em',
              textTransform: 'uppercase' as const, marginBottom: '1.5rem',
            }}>
              {t('accuracy', 'Accuracy')}: {pct}%
            </p>
            {/* Result dots */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 5, marginBottom: '1.5rem',
            }}>
              {quizResults.map((correct, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: correct ? '#16C79A' : '#E94560',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '1.05rem',
              color: '#1A1A2E', marginBottom: '0.75rem',
              maxWidth: '45ch', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7,
            }}>
              {getScoreFeedback(quizScore, totalQuizRounds)}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: '2rem' }}>
              <button
                onClick={handleQuizRestart}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                  padding: '0.6rem 1.5rem', borderRadius: 100,
                  border: `2px solid ${ACCENT}`, cursor: 'pointer',
                  background: ACCENT, color: '#FAF8F5',
                  transition: 'all 0.25s', minHeight: 44,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {t('tryAgain', 'Try Again')}
              </button>
              <button
                onClick={switchToExplore}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                  padding: '0.6rem 1.5rem', borderRadius: 100,
                  border: `2px solid rgba(26,26,46,0.12)`, cursor: 'pointer',
                  background: 'transparent', color: '#1A1A2E',
                  transition: 'all 0.25s', minHeight: 44,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {t('backToExplore', 'Back to Explore')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // --- Quiz: Mobile layout ---
    if (isMobile) {
      const pct = totalQuizRounds > 0 ? Math.round((quizScore / totalQuizRounds) * 100) : 0;
      return (
        <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header with progress */}
          <div style={{
            padding: '0.75rem 1rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={switchToExplore}
                aria-label="Back to explore"
                style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  border: 'none', background: 'rgba(26,26,46,0.06)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6B7280', fontSize: '0.85rem',
                }}
              >
                &#8592;
              </button>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: '#16C79A',
              }}>
                {quizScore} {t('pts', 'pts')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {Array.from({ length: totalQuizRounds }).map((_, i) => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: i < quizIndex
                    ? quizResults[i] ? '#16C79A' : '#E94560'
                    : i === quizIndex ? '#1A1A2E' : 'rgba(26,26,46,0.12)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>
          </div>

          {/* Question area */}
          <div style={{
            flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '0.75rem 1rem',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              color: '#6B7280', marginBottom: '0.6rem', textAlign: 'center' as const,
            }}>
              {t('round', 'Round')} {quizIndex + 1} {t('of', 'of')} {totalQuizRounds}
            </div>
            <div style={{
              background: 'rgba(26,26,46,0.025)', border: '1px solid rgba(26,26,46,0.06)',
              borderRadius: 12, padding: '1rem', marginBottom: '0.75rem',
              transition: 'all 0.4s ease',
              ...(quizAnswered ? {
                borderColor: quizIsCorrect ? 'rgba(22,199,154,0.3)' : 'rgba(233,69,96,0.3)',
                background: quizIsCorrect ? 'rgba(22,199,154,0.04)' : 'rgba(233,69,96,0.04)',
              } : {}),
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.92rem',
                lineHeight: 1.65, color: '#1A1A2E', margin: 0, textAlign: 'center' as const,
              }}>
                "{currentQuiz.description}"
              </p>
            </div>

            {/* Layer buttons - 2x2 grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
              {stackLayers.map((layer) => {
                const isSelected = quizSelected === layer.id;
                const isCorrectLayer = quizAnswered && layer.id === currentQuiz.correctLayer;
                const isWrongSelected = quizAnswered && isSelected && !quizIsCorrect;

                let btnBg = `${layer.color}08`;
                let btnBorder = `${layer.color}30`;
                let btnColor = layer.color;
                if (isCorrectLayer) {
                  btnBg = 'rgba(22,199,154,0.12)';
                  btnBorder = '#16C79A';
                  btnColor = '#16C79A';
                } else if (isWrongSelected) {
                  btnBg = 'rgba(233,69,96,0.12)';
                  btnBorder = '#E94560';
                  btnColor = '#E94560';
                }

                return (
                  <button
                    key={layer.id}
                    onClick={() => handleQuizAnswer(layer.id)}
                    disabled={quizAnswered}
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600,
                      padding: '0.65rem 0.5rem', borderRadius: 10,
                      border: `2px solid ${btnBorder}`,
                      background: btnBg, color: btnColor,
                      cursor: quizAnswered ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 6, minHeight: 48,
                      opacity: quizAnswered && !isSelected && !isCorrectLayer ? 0.4 : 1,
                      transition: 'all 0.25s',
                    }}
                  >
                    <span>{layer.emoji}</span> {layer.name}
                    {isCorrectLayer && <span>&#10003;</span>}
                    {isWrongSelected && <span>&#10007;</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom action */}
          {quizAnswered && (
            <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid rgba(26,26,46,0.06)' }}>
              <button
                onClick={() => setMobileQuizExplanationOpen(true)}
                style={{
                  width: '100%', padding: '0.65rem', borderRadius: 10,
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: quizIsCorrect ? '#16C79A' : '#E94560', color: '#FAF8F5',
                  minHeight: 44,
                }}
              >
                {quizIsCorrect ? t('correct', 'Correct!') : t('notQuite', 'Not quite.')} {t('viewExplanation', 'View explanation')}
              </button>
            </div>
          )}

          {/* Explanation BottomSheet */}
          <BottomSheet
            isOpen={mobileQuizExplanationOpen}
            onClose={() => setMobileQuizExplanationOpen(false)}
            title={quizIsCorrect ? t('correct', 'Correct!') : t('notQuite', 'Not quite.')}
          >
            <div>
              <div style={{
                padding: '0.85rem', borderRadius: 10, marginBottom: 14,
                background: quizIsCorrect
                  ? 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(22,199,154,0.08))'
                  : 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(233,69,96,0.08))',
                border: `1px solid ${quizIsCorrect ? 'rgba(22,199,154,0.15)' : 'rgba(233,69,96,0.15)'}`,
              }}>
                {!quizIsCorrect && correctLayer && (
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    color: correctLayer.color, marginBottom: '0.5rem',
                  }}>
                    {correctLayer.emoji} {correctLayer.name}
                  </p>
                )}
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                  lineHeight: 1.7, color: '#1A1A2E', margin: 0,
                }}>
                  {currentQuiz.explanation}
                </p>
              </div>
              <button
                onClick={handleQuizNext}
                style={{
                  width: '100%', padding: '0.65rem', borderRadius: 100,
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: '#1A1A2E', color: '#FAF8F5', minHeight: 44,
                }}
              >
                {quizIndex + 1 >= totalQuizRounds ? t('seeResults', 'See Results') : t('nextRound', 'Next Round')} &rarr;
              </button>
            </div>
          </BottomSheet>

          {/* Game Over BottomSheet */}
          <BottomSheet
            isOpen={mobileQuizDoneOpen}
            onClose={() => setMobileQuizDoneOpen(false)}
            title={t('finalScore', 'Final Score')}
          >
            <div style={{ textAlign: 'center' as const }}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '2.5rem',
                fontWeight: 800, color: pct >= 75 ? '#16C79A' : '#E94560',
                marginBottom: '0.25rem', lineHeight: 1,
                animation: 'sd-scoreUp 0.5s ease both',
              }}>
                {quizScore}/{totalQuizRounds}
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280',
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                marginBottom: '1rem',
              }}>
                {t('accuracy', 'Accuracy')}: {pct}%
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: '1rem' }}>
                {quizResults.map((correct, i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: correct ? '#16C79A' : '#E94560',
                  }} />
                ))}
              </div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#1A1A2E',
                marginBottom: '1.5rem', lineHeight: 1.7,
              }}>
                {getScoreFeedback(quizScore, totalQuizRounds)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleQuizRestart}
                  style={{
                    width: '100%', padding: '0.65rem', borderRadius: 100,
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    background: '#1A1A2E', color: '#FAF8F5', minHeight: 44,
                  }}
                >
                  {t('tryAgain', 'Try Again')}
                </button>
                <button
                  onClick={() => { setMobileQuizDoneOpen(false); switchToExplore(); }}
                  style={{
                    width: '100%', padding: '0.65rem', borderRadius: 100,
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                    border: `2px solid rgba(26,26,46,0.12)`, cursor: 'pointer',
                    background: 'transparent', color: '#1A1A2E', minHeight: 44,
                  }}
                >
                  {t('backToExplore', 'Back to Explore')}
                </button>
              </div>
            </div>
          </BottomSheet>

          <style>{`
            @keyframes sd-scoreUp { from { opacity: 0; transform: scale(0.8) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          `}</style>
        </div>
      );
    }

    // --- Quiz: Desktop layout ---
    return (
      <div className="widget-container">
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap' as const, gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={switchToExplore}
              aria-label="Back to explore"
              style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                border: 'none', background: 'rgba(26,26,46,0.06)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6B7280', fontSize: '1rem', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26,26,46,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(26,26,46,0.06)')}
            >
              &#8592;
            </button>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
                fontWeight: 700, margin: 0, lineHeight: 1.3,
              }}>
                {t('stackQuiz', 'Stack Quiz')}
              </h3>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: '#6B7280', margin: 0, letterSpacing: '0.05em',
              }}>
                {t('quizSubtitle', 'Where does this belong?')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: totalQuizRounds }).map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i < quizIndex
                    ? quizResults[i] ? '#16C79A' : '#E94560'
                    : i === quizIndex ? '#1A1A2E' : 'rgba(26,26,46,0.12)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              fontWeight: 700, color: '#16C79A',
            }}>
              {quizScore} {t('pts', 'pts')}
            </span>
          </div>
        </div>

        <div style={{ padding: '1.75rem 2rem' }}>
          {/* Round indicator */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: '#6B7280', marginBottom: '0.75rem',
          }}>
            Round {quizIndex + 1} of {totalQuizRounds}
          </div>

          {/* Question card */}
          <div style={{
            background: 'rgba(26,26,46,0.025)', border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 12, padding: '1.75rem 2rem', marginBottom: '1.5rem',
            transition: 'all 0.4s ease',
            ...(quizAnswered ? {
              borderColor: quizIsCorrect ? 'rgba(22,199,154,0.3)' : 'rgba(233,69,96,0.3)',
              background: quizIsCorrect ? 'rgba(22,199,154,0.04)' : 'rgba(233,69,96,0.04)',
            } : {}),
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              color: ACCENT, marginBottom: '0.75rem',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: ACCENT,
                animation: !quizAnswered ? 'sd-pulse 2s infinite' : 'none',
              }} />
              {t('whichLayer', 'Which layer?')}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '1.1rem',
              lineHeight: 1.7, color: '#1A1A2E', margin: 0,
            }}>
              "{currentQuiz.description}"
            </p>
          </div>

          {/* Answer buttons */}
          {!quizAnswered && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10, marginBottom: '1rem',
            }}>
              {stackLayers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => handleQuizAnswer(layer.id)}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600,
                    padding: '0.85rem 0.5rem', borderRadius: 10,
                    border: `2px solid ${layer.color}30`,
                    background: `${layer.color}08`, color: layer.color,
                    cursor: 'pointer', transition: 'all 0.25s',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 4, minHeight: 56,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = layer.color;
                    e.currentTarget.style.background = `${layer.color}14`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${layer.color}30`;
                    e.currentTarget.style.background = `${layer.color}08`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '1.15rem' }}>{layer.emoji}</span>
                  {layer.name}
                </button>
              ))}
            </div>
          )}

          {/* Result + explanation */}
          {quizAnswered && (
            <>
              {/* Show answered buttons with visual feedback */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10, marginBottom: '1.25rem',
              }}>
                {stackLayers.map((layer) => {
                  const isSelected = quizSelected === layer.id;
                  const isCorrectLayer = layer.id === currentQuiz.correctLayer;
                  const isWrongSelected = isSelected && !quizIsCorrect;

                  let bg = `${layer.color}08`;
                  let border = `${layer.color}20`;
                  let color = layer.color;
                  let opa = 0.35;

                  if (isCorrectLayer) {
                    bg = 'rgba(22,199,154,0.12)';
                    border = '#16C79A';
                    color = '#16C79A';
                    opa = 1;
                  } else if (isWrongSelected) {
                    bg = 'rgba(233,69,96,0.12)';
                    border = '#E94560';
                    color = '#E94560';
                    opa = 1;
                  }

                  return (
                    <div key={layer.id} style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600,
                      padding: '0.85rem 0.5rem', borderRadius: 10,
                      border: `2px solid ${border}`,
                      background: bg, color,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4, minHeight: 56,
                      opacity: opa, transition: 'all 0.3s',
                    }}>
                      <span style={{ fontSize: '1.15rem' }}>{layer.emoji}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {layer.name}
                        {isCorrectLayer && <span>&#10003;</span>}
                        {isWrongSelected && <span>&#10007;</span>}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div style={{
                background: quizIsCorrect
                  ? 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(22,199,154,0.08))'
                  : 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(233,69,96,0.08))',
                border: `1px solid ${quizIsCorrect ? 'rgba(22,199,154,0.15)' : 'rgba(233,69,96,0.15)'}`,
                borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
                animation: 'sd-slideUp 0.4s ease both 0.1s',
              }}>
                <p style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
                  fontWeight: 700, color: quizIsCorrect ? '#16C79A' : '#E94560',
                  marginBottom: 6,
                }}>
                  {quizIsCorrect ? t('correct', 'Correct!') : t('notQuite', 'Not quite.')}
                  {!quizIsCorrect && correctLayer && (
                    <span style={{ color: '#6B7280', fontWeight: 400, fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                      {' '}{t('thats', "That's")} {correctLayer.emoji} {correctLayer.name}.
                    </span>
                  )}
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                  lineHeight: 1.7, color: '#1A1A2E', margin: 0,
                }}>
                  {currentQuiz.explanation}
                </p>
              </div>

              <div style={{ textAlign: 'right' as const }}>
                <button
                  onClick={handleQuizNext}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                    padding: '0.6rem 1.5rem', borderRadius: 100,
                    border: 'none', cursor: 'pointer',
                    background: '#1A1A2E', color: '#FAF8F5',
                    transition: 'all 0.25s', minHeight: 44,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {quizIndex + 1 >= totalQuizRounds ? t('seeResults', 'See Results') : t('nextRound', 'Next Round')} &rarr;
                </button>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes sd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes sd-slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes sd-scoreUp { from { opacity: 0; transform: scale(0.8) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </div>
    );
  }

  // =====================================================================
  //  EXPLORE MODE
  // =====================================================================

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{
        padding: isMobile ? '1rem' : '1.5rem 2rem',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: isMobile ? 28 : 32, height: isMobile ? 28 : 32,
            borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}90)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={isMobile ? 14 : 16} height={isMobile ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="5" rx="1" />
              <rect x="2" y="9" width="20" height="5" rx="1" />
              <rect x="2" y="16" width="20" height="5" rx="1" />
            </svg>
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: 700, margin: 0, lineHeight: 1.3,
            }}>
              {t('title', 'The Stack Decoder')}
            </h3>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.65rem' : '0.75rem',
              color: '#6B7280', margin: 0, letterSpacing: '0.05em',
            }}>
              {t('subtitle', 'Click a layer to explore its vocabulary')}
            </p>
          </div>
        </div>
      </div>

      {/* Stack layers */}
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem 2rem' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8,
        }}>
          {stackLayers.map((layer) => {
            const isExpanded = !isMobile && selectedLayerId === layer.id;

            return (
              <div key={layer.id}>
                {/* Collapsed bar */}
                <button
                  onClick={() => handleLayerClick(layer.id)}
                  aria-expanded={isExpanded}
                  style={{
                    width: '100%', textAlign: 'left' as const,
                    padding: isMobile ? '0.75rem 0.85rem' : '0.85rem 1.25rem',
                    borderRadius: isExpanded ? '10px 10px 0 0' : 10,
                    border: `1px solid ${isExpanded ? layer.color + '30' : 'rgba(26,26,46,0.06)'}`,
                    borderBottom: isExpanded ? 'none' : undefined,
                    borderLeft: `4px solid ${layer.color}`,
                    background: isExpanded ? `${layer.color}06` : 'rgba(26,26,46,0.015)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: isMobile ? '0.6rem' : '0.85rem',
                    transition: 'all 0.25s ease',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.background = `${layer.color}08`;
                      e.currentTarget.style.borderColor = `${layer.color}25`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.background = 'rgba(26,26,46,0.015)';
                      e.currentTarget.style.borderColor = 'rgba(26,26,46,0.06)';
                    }
                  }}
                >
                  <span style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', flexShrink: 0 }}>
                    {layer.emoji}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.88rem' : '0.95rem',
                      fontWeight: 700, color: layer.color, lineHeight: 1.3,
                    }}>
                      {layer.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.75rem' : '0.8rem',
                      color: '#6B7280', lineHeight: 1.4, marginTop: 1,
                    }}>
                      {layer.tagline}
                    </div>
                  </div>
                  {/* Expand chevron (desktop only) */}
                  {!isMobile && (
                    <span style={{
                      flexShrink: 0, color: '#6B7280', fontSize: '0.85rem',
                      transition: 'transform 0.3s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>
                      &#9662;
                    </span>
                  )}
                  {/* Arrow indicator (mobile only) */}
                  {isMobile && (
                    <span style={{ flexShrink: 0, color: '#6B7280', fontSize: '0.75rem' }}>
                      &#8250;
                    </span>
                  )}
                </button>

                {/* Expanded content (desktop only, animated with CSS) */}
                {!isMobile && (
                  <div style={{
                    overflow: 'hidden',
                    maxHeight: isExpanded ? 800 : 0,
                    opacity: isExpanded ? 1 : 0,
                    transition: 'max-height 0.4s ease, opacity 0.3s ease',
                    border: isExpanded ? `1px solid ${layer.color}30` : '1px solid transparent',
                    borderTop: 'none',
                    borderLeft: `4px solid ${layer.color}`,
                    borderRadius: '0 0 10px 10px',
                    background: `${layer.color}04`,
                  }}>
                    <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                      <LayerDetail layer={layer} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiz CTA */}
        <div style={{
          marginTop: isMobile ? '1rem' : '1.5rem',
          textAlign: 'center' as const,
        }}>
          <button
            onClick={switchToQuiz}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              fontWeight: 600,
              padding: isMobile ? '0.65rem 1.5rem' : '0.7rem 2rem',
              borderRadius: 100,
              border: `2px solid ${ACCENT}`,
              background: ACCENT,
              color: '#FAF8F5',
              cursor: 'pointer',
              transition: 'all 0.25s',
              minHeight: 44,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${ACCENT}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {t('tryTheQuiz', 'Try the quiz')} &rarr;
          </button>
        </div>
      </div>

      {/* Mobile BottomSheet for layer detail */}
      {isMobile && selectedLayer && (
        <BottomSheet
          isOpen={mobileLayerOpen}
          onClose={() => setMobileLayerOpen(false)}
          title={`${selectedLayer.emoji} ${selectedLayer.name}`}
        >
          <LayerDetail layer={selectedLayer} />
        </BottomSheet>
      )}
    </div>
  );
}

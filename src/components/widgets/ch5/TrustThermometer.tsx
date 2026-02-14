import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface Scenario {
  action: string;
  stakes: 'low' | 'medium' | 'high';
  tradeoffs: {
    auto: string;
    ask: string;
    never: string;
  };
  averageDistribution: [number, number, number]; // [auto, ask, never] percentages
}

const scenarios: Scenario[] = [
  {
    action: 'Summarize an article you\'re reading',
    stakes: 'low',
    tradeoffs: {
      auto: 'Fast and frictionless. Summaries are easy to verify at a glance, so the risk of a bad one is low.',
      ask: 'Reasonable caution, but summaries are low-stakes. You might slow yourself down without much benefit.',
      never: 'Summaries are one of AI\'s safest uses. You can always read the original if the summary seems off.',
    },
    averageDistribution: [78, 18, 4],
  },
  {
    action: 'Search the web for information',
    stakes: 'low',
    tradeoffs: {
      auto: 'Searching is harmless -- it\'s just looking. The AI still needs to present what it finds for you to evaluate.',
      ask: 'A bit cautious for a search, but useful if you want to control what sources are consulted.',
      never: 'Blocking search means the AI can only use its training data, which may be outdated or incomplete.',
    },
    averageDistribution: [71, 24, 5],
  },
  {
    action: 'Send an email to your teammate about the meeting time change',
    stakes: 'medium',
    tradeoffs: {
      auto: 'Efficient, but emails represent YOU. A poorly worded message or wrong detail could create real confusion.',
      ask: 'Smart. Letting the AI draft it while you review before sending is the sweet spot for most people.',
      never: 'Understandable -- email is personal communication. But drafting help (without auto-sending) is different from sending.',
    },
    averageDistribution: [12, 72, 16],
  },
  {
    action: 'Edit a file in your project',
    stakes: 'medium',
    tradeoffs: {
      auto: 'Common in coding agents like Claude Code. Works well with version control (git) as a safety net.',
      ask: 'A balanced approach. You review changes before they\'re applied. Slower but safer for important files.',
      never: 'If there\'s no undo mechanism, this makes sense. But it means the AI can\'t help you code efficiently.',
    },
    averageDistribution: [35, 52, 13],
  },
  {
    action: 'Install a new software package',
    stakes: 'medium',
    tradeoffs: {
      auto: 'Installs can introduce security vulnerabilities or break existing code. Auto-installing is risky.',
      ask: 'The standard approach. You should know what\'s being added to your system before it happens.',
      never: 'Very cautious, but understandable. Packages run code on your machine, which is a real trust decision.',
    },
    averageDistribution: [15, 62, 23],
  },
  {
    action: 'Delete old files to free up space',
    stakes: 'high',
    tradeoffs: {
      auto: 'Dangerous. Deletion is often irreversible. What the AI considers "old" might be important to you.',
      ask: 'The right call. Always review what\'s being deleted. A list of files with sizes lets you decide quickly.',
      never: 'Very reasonable for deletion. The consequences of a mistake are high and often permanent.',
    },
    averageDistribution: [4, 48, 48],
  },
  {
    action: 'Make a $50 purchase for a tool subscription',
    stakes: 'high',
    tradeoffs: {
      auto: 'Real money, real commitment. Auto-purchasing removes your ability to comparison shop or reconsider.',
      ask: 'The clear best practice. Let AI research options and recommend, but you click "buy."',
      never: 'Financial decisions are deeply personal. Many people draw a hard line here, and that\'s wise.',
    },
    averageDistribution: [3, 52, 45],
  },
  {
    action: 'Post to your social media account',
    stakes: 'high',
    tradeoffs: {
      auto: 'Your public reputation is at stake. One bad AI-generated post could go viral for the wrong reasons.',
      ask: 'Smart. AI can draft posts, but your voice, timing, and judgment should control what goes public.',
      never: 'Many people feel strongly that their social presence should be authentically theirs. Totally valid.',
    },
    averageDistribution: [5, 42, 53],
  },
];

const choiceLabels = ['Just do it', 'Ask me first', 'Never allow'] as const;
const choiceColors = ['#16C79A', '#F5A623', '#E94560'];

type Profile = 'delegator' | 'collaborator' | 'supervisor';

function getProfile(choices: (number | null)[]): { type: Profile; title: string; description: string } {
  const valid = choices.filter((c): c is number => c !== null);
  if (valid.length === 0) return { type: 'collaborator', title: 'Collaborator', description: '' };

  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;

  if (avg < 0.8) {
    return {
      type: 'delegator',
      title: 'The Delegator',
      description: 'You\'re comfortable giving AI significant autonomy. You trust the tools and prefer speed over control. Just make sure you have safety nets (version control, undo, spending limits) for when things go sideways.',
    };
  } else if (avg < 1.4) {
    return {
      type: 'collaborator',
      title: 'The Collaborator',
      description: 'You strike a balance -- letting AI handle low-stakes tasks freely while keeping a human checkpoint for anything consequential. This is where most AI-savvy people land. You get efficiency without losing control.',
    };
  } else {
    return {
      type: 'supervisor',
      title: 'The Supervisor',
      description: 'You prefer to stay in the driver\'s seat. AI proposes, you dispose. This is the safest approach, though it means more friction. Consider whether some low-stakes tasks could be safely automated to free up your attention for the decisions that really matter.',
    };
  }
}

export default function TrustThermometer() {
  const isMobile = useIsMobile();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [choices, setChoices] = useState<(number | null)[]>(Array(scenarios.length).fill(null));
  const [showTradeoff, setShowTradeoff] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const scenario = scenarios[currentScenario];
  const currentChoice = choices[currentScenario];

  const handleChoice = (index: number) => {
    if (showTradeoff) return;
    const newChoices = [...choices];
    newChoices[currentScenario] = index;
    setChoices(newChoices);
    setShowTradeoff(true);
  };

  const handleNext = () => {
    if (currentScenario + 1 >= scenarios.length) {
      setShowSummary(true);
    } else {
      setCurrentScenario((s) => s + 1);
      setShowTradeoff(false);
    }
  };

  const handleRestart = () => {
    setCurrentScenario(0);
    setChoices(Array(scenarios.length).fill(null));
    setShowTradeoff(false);
    setShowSummary(false);
  };

  const profile = getProfile(choices);

  const stakesColor = {
    low: '#16C79A',
    medium: '#F5A623',
    high: '#E94560',
  };

  if (showSummary) {
    const choiceCounts = [0, 0, 0];
    choices.forEach((c) => { if (c !== null) choiceCounts[c]++; });

    return (
      <div className="widget-container">
        {/* Header */}
        <div style={{
          padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem',
          borderBottom: '1px solid rgba(26,26,46,0.06)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #F5A623, #E94560)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              Your Autonomy Profile
            </h3>
          </div>
        </div>

        <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem' }}>
          {/* Profile title */}
          <div style={{ textAlign: 'center' as const, marginBottom: isMobile ? '1.5rem' : '2rem' }}>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800,
              color: '#F5A623', margin: '0 0 0.5rem',
            }}>
              {profile.title}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.7,
              color: '#1A1A2E', opacity: 0.75, maxWidth: '50ch', margin: '0 auto',
            }}>
              {profile.description}
            </p>
          </div>

          {/* Your choices breakdown */}
          <div style={{
            display: 'flex', gap: isMobile ? '0.5rem' : '1rem', justifyContent: 'center',
            marginBottom: isMobile ? '1.5rem' : '2rem', flexWrap: 'wrap' as const,
          }}>
            {choiceLabels.map((label, i) => (
              <div key={label} style={{
                textAlign: 'center' as const, padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
                borderRadius: 12, background: choiceColors[i] + '08',
                border: `1px solid ${choiceColors[i]}20`,
                minWidth: isMobile ? 80 : 100,
                flex: isMobile ? 1 : 'none',
              }}>
                <p style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.5rem',
                  fontWeight: 800, color: choiceColors[i], margin: '0 0 0.25rem',
                }}>
                  {choiceCounts[i]}
                </p>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  color: '#6B7280', margin: 0, letterSpacing: '0.03em',
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Comparison to average */}
          <div style={{
            background: 'rgba(26,26,46,0.02)', borderRadius: 12,
            border: '1px solid rgba(26,26,46,0.06)', padding: isMobile ? '1rem' : '1.25rem 1.5rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              color: '#6B7280', marginBottom: '1rem',
            }}>
              Your choices vs. the average
            </p>
            {scenarios.map((s, si) => {
              const userChoice = choices[si];
              return (
                <div key={si} style={{ marginBottom: si < scenarios.length - 1 ? '0.75rem' : 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.7rem' : '0.75rem',
                    color: '#1A1A2E', margin: '0 0 4px', opacity: 0.7,
                  }}>
                    {s.action}
                  </p>
                  <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 8, flexDirection: isMobile ? 'column' as const : 'row' as const }}>
                    {/* Average distribution bar */}
                    <div style={{
                      flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' as const,
                      display: 'flex', background: 'rgba(26,26,46,0.04)',
                    }}>
                      {s.averageDistribution.map((pct, pi) => (
                        <div key={pi} style={{
                          width: `${pct}%`, height: '100%',
                          background: choiceColors[pi], opacity: 0.4,
                        }} />
                      ))}
                    </div>
                    {/* User choice marker */}
                    {userChoice !== null && (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                        color: choiceColors[userChoice], whiteSpace: 'nowrap' as const,
                      }}>
                        You: {choiceLabels[userChoice]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div style={{
              display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center',
            }}>
              {choiceLabels.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: choiceColors[i], opacity: 0.4 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#6B7280' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key insight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,166,35,0.06), rgba(233,69,96,0.04))',
            border: '1px solid rgba(245,166,35,0.15)',
            borderRadius: 12, padding: isMobile ? '1rem' : '1.25rem 1.5rem',
            position: 'relative' as const, overflow: 'hidden' as const,
            marginBottom: '1.5rem',
          }}>
            <div style={{
              position: 'absolute' as const, left: 0, top: 0, bottom: 0, width: 3,
              background: 'linear-gradient(to bottom, #F5A623, #E94560)',
              borderRadius: '3px 0 0 3px',
            }} />
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
              color: '#F5A623', margin: '0 0 0.5rem',
            }}>
              There's no right answer
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
              color: '#1A1A2E', margin: 0, opacity: 0.8,
            }}>
              Your autonomy profile should evolve. As you build trust with AI tools and set up better safety nets (version control, spending limits, review workflows), you may find yourself delegating more. The key is being <em>intentional</em> about where you draw the line.
            </p>
          </div>

          <div style={{ textAlign: 'center' as const }}>
            <button
              onClick={handleRestart}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
                padding: '0.7rem 2rem', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: '#1A1A2E', color: '#FAF8F5', transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{
        padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #F5A623, #E94560)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              Trust Thermometer
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              How much autonomy would you give?
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>
            {currentScenario + 1} / {scenarios.length}
          </span>
        </div>
      </div>

      <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
        {/* Progress bar */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: '1.5rem',
        }}>
          {scenarios.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < currentScenario ? '#F5A623'
                : i === currentScenario ? '#F5A62360'
                : 'rgba(26,26,46,0.06)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        {/* Stakes badge */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: stakesColor[scenario.stakes],
            background: stakesColor[scenario.stakes] + '10',
            padding: '0.25rem 0.6rem', borderRadius: 100,
            border: `1px solid ${stakesColor[scenario.stakes]}20`,
          }}>
            {scenario.stakes} stakes
          </span>
        </div>

        {/* Scenario */}
        <div style={{
          background: 'rgba(26,26,46,0.02)', borderRadius: 12,
          border: '1px solid rgba(26,26,46,0.06)',
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            color: '#6B7280', marginBottom: '0.5rem',
          }}>
            Scenario
          </p>
          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700,
            color: '#1A1A2E', margin: 0, lineHeight: 1.4,
          }}>
            Your AI agent wants to: <span style={{ color: '#F5A623' }}>{scenario.action.toLowerCase()}</span>
          </p>
        </div>

        {/* Choice buttons */}
        <div style={{
          display: 'flex', flexDirection: 'column' as const, gap: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          {choiceLabels.map((label, i) => {
            const isSelected = currentChoice === i;
            const icons = [
              <svg key="auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
              <svg key="ask" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
              <svg key="never" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
            ];

            return (
              <button
                key={label}
                onClick={() => handleChoice(i)}
                disabled={showTradeoff}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem', borderRadius: 12,
                  border: `1px solid ${isSelected ? choiceColors[i] + '50' : 'rgba(26,26,46,0.08)'}`,
                  background: isSelected ? choiceColors[i] + '08' : 'transparent',
                  cursor: showTradeoff ? 'default' : 'pointer',
                  transition: 'all 0.25s', textAlign: 'left' as const,
                  width: '100%',
                  opacity: showTradeoff && !isSelected ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!showTradeoff) {
                    e.currentTarget.style.borderColor = choiceColors[i] + '40';
                    e.currentTarget.style.background = choiceColors[i] + '06';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showTradeoff && !isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isSelected ? choiceColors[i] : 'rgba(26,26,46,0.04)',
                  color: isSelected ? 'white' : '#6B7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.25s',
                }}>
                  {icons[i]}
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
                    color: isSelected ? choiceColors[i] : '#1A1A2E', margin: 0,
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                    color: '#6B7280', margin: '2px 0 0',
                  }}>
                    {i === 0 && 'Let the AI handle it automatically'}
                    {i === 1 && 'AI proposes, you approve'}
                    {i === 2 && 'Off limits for AI'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tradeoff explanation */}
        {showTradeoff && currentChoice !== null && (
          <div style={{
            background: `linear-gradient(135deg, ${choiceColors[currentChoice]}06, ${choiceColors[currentChoice]}03)`,
            border: `1px solid ${choiceColors[currentChoice]}18`,
            borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1rem',
            animation: 'fadeIn 0.3s ease',
          }}>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
              color: choiceColors[currentChoice], margin: '0 0 0.5rem',
            }}>
              Tradeoff
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
              color: '#1A1A2E', margin: '0 0 1rem', opacity: 0.8,
            }}>
              {currentChoice === 0 && scenario.tradeoffs.auto}
              {currentChoice === 1 && scenario.tradeoffs.ask}
              {currentChoice === 2 && scenario.tradeoffs.never}
            </p>

            {/* What others chose */}
            <div style={{
              background: 'rgba(26,26,46,0.03)', borderRadius: 8,
              padding: '0.75rem 1rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                color: '#6B7280', marginBottom: '0.5rem',
              }}>
                What others chose
              </p>
              <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' as const }}>
                {scenario.averageDistribution.map((pct, pi) => (
                  <div key={pi} style={{
                    width: `${pct}%`, height: '100%', background: choiceColors[pi],
                    opacity: 0.5, transition: 'width 0.5s ease',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {scenario.averageDistribution.map((pct, pi) => (
                  <span key={pi} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    color: choiceColors[pi], fontWeight: currentChoice === pi ? 700 : 400,
                  }}>
                    {pct}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Next button */}
        {showTradeoff && (
          <div style={{ textAlign: 'right' as const }}>
            <button
              onClick={handleNext}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                padding: '0.6rem 1.5rem', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: '#1A1A2E', color: '#FAF8F5', transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {currentScenario + 1 >= scenarios.length ? 'See Your Profile' : 'Next Scenario'} &rarr;
            </button>
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

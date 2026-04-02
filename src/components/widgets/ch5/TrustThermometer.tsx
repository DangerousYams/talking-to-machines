import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';
import { useTranslation } from '../../../i18n/useTranslation';

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
  const t = useTranslation('trustThermometer');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [choices, setChoices] = useState<(number | null)[]>(Array(scenarios.length).fill(null));
  const [showTradeoff, setShowTradeoff] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const scenario = scenarios[currentScenario];
  const currentChoice = choices[currentScenario];

  const translatedChoiceLabels = [
    t('choiceJustDoIt', 'Just do it'),
    t('choiceAskMeFirst', 'Ask me first'),
    t('choiceNeverAllow', 'Never allow'),
  ] as const;

  const translatedScenarioActions = [
    t('scenario1', "Summarize an article you're reading"),
    t('scenario2', 'Search the web for information'),
    t('scenario3', 'Send an email to your teammate about the meeting time change'),
    t('scenario4', 'Edit a file in your project'),
    t('scenario5', 'Install a new software package'),
    t('scenario6', 'Delete old files to free up space'),
    t('scenario7', 'Make a $50 purchase for a tool subscription'),
    t('scenario8', 'Post to your social media account'),
  ];

  const translatedTradeoffs = [
    { auto: t('scenario1Auto', scenarios[0].tradeoffs.auto), ask: t('scenario1Ask', scenarios[0].tradeoffs.ask), never: t('scenario1Never', scenarios[0].tradeoffs.never) },
    { auto: t('scenario2Auto', scenarios[1].tradeoffs.auto), ask: t('scenario2Ask', scenarios[1].tradeoffs.ask), never: t('scenario2Never', scenarios[1].tradeoffs.never) },
    { auto: t('scenario3Auto', scenarios[2].tradeoffs.auto), ask: t('scenario3Ask', scenarios[2].tradeoffs.ask), never: t('scenario3Never', scenarios[2].tradeoffs.never) },
    { auto: t('scenario4Auto', scenarios[3].tradeoffs.auto), ask: t('scenario4Ask', scenarios[3].tradeoffs.ask), never: t('scenario4Never', scenarios[3].tradeoffs.never) },
    { auto: t('scenario5Auto', scenarios[4].tradeoffs.auto), ask: t('scenario5Ask', scenarios[4].tradeoffs.ask), never: t('scenario5Never', scenarios[4].tradeoffs.never) },
    { auto: t('scenario6Auto', scenarios[5].tradeoffs.auto), ask: t('scenario6Ask', scenarios[5].tradeoffs.ask), never: t('scenario6Never', scenarios[5].tradeoffs.never) },
    { auto: t('scenario7Auto', scenarios[6].tradeoffs.auto), ask: t('scenario7Ask', scenarios[6].tradeoffs.ask), never: t('scenario7Never', scenarios[6].tradeoffs.never) },
    { auto: t('scenario8Auto', scenarios[7].tradeoffs.auto), ask: t('scenario8Ask', scenarios[7].tradeoffs.ask), never: t('scenario8Never', scenarios[7].tradeoffs.never) },
  ];

  const currentAction = translatedScenarioActions[currentScenario];
  const currentTradeoffs = translatedTradeoffs[currentScenario];

  const handleChoice = (index: number) => {
    if (showTradeoff) return;
    const newChoices = [...choices];
    newChoices[currentScenario] = index;
    setChoices(newChoices);
    setShowTradeoff(true);
  };

  const handleNext = () => {
    if (currentScenario + 1 >= scenarios.length) {
      if (isMobile) {
        setSheetOpen(true);
      } else {
        setShowSummary(true);
      }
    } else {
      // Animate out, swap, animate in
      setTransitioning(true);
      setTimeout(() => {
        setCurrentScenario((s) => s + 1);
        setShowTradeoff(false);
        setTransitioning(false);
      }, 250);
    }
  };

  const handleRestart = () => {
    setCurrentScenario(0);
    setChoices(Array(scenarios.length).fill(null));
    setShowTradeoff(false);
    setShowSummary(false);
    setSheetOpen(false);
  };

  const rawProfile = getProfile(choices);
  const profile = {
    ...rawProfile,
    title: rawProfile.type === 'delegator' ? t('profileDelegator', rawProfile.title)
      : rawProfile.type === 'collaborator' ? t('profileCollaborator', rawProfile.title)
      : t('profileSupervisor', rawProfile.title),
    description: rawProfile.type === 'delegator' ? t('profileDelegatorDesc', rawProfile.description)
      : rawProfile.type === 'collaborator' ? t('profileCollaboratorDesc', rawProfile.description)
      : t('profileSupervisorDesc', rawProfile.description),
  };

  const stakesColor = {
    low: '#16C79A',
    medium: '#F5A623',
    high: '#E94560',
  };

  // --- Summary BottomSheet content (shared) ---
  const summaryContent = () => {
    const choiceCounts = [0, 0, 0];
    choices.forEach((c) => { if (c !== null) choiceCounts[c]++; });

    return (
      <div>
        {/* Profile title */}
        <div style={{ textAlign: 'center' as const, marginBottom: '1rem' }}>
          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800,
            color: '#F5A623', margin: '0 0 0.35rem',
          }}>
            {profile.title}
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.6,
            color: '#1A1A2E', opacity: 0.75, margin: 0,
          }}>
            {profile.description}
          </p>
        </div>

        {/* Choice counts */}
        <div style={{
          display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem',
        }}>
          {translatedChoiceLabels.map((label, i) => (
            <div key={label} style={{
              textAlign: 'center' as const, padding: '0.6rem 0.75rem',
              borderRadius: 10, background: choiceColors[i] + '08',
              border: `1px solid ${choiceColors[i]}20`, flex: 1,
            }}>
              <p style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
                fontWeight: 800, color: choiceColors[i], margin: '0 0 0.15rem',
              }}>
                {choiceCounts[i]}
              </p>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                color: '#6B7280', margin: 0, letterSpacing: '0.03em',
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Your choices vs average */}
        <div style={{
          background: 'rgba(26,26,46,0.02)', borderRadius: 10,
          border: '1px solid rgba(26,26,46,0.06)', padding: '0.75rem',
          marginBottom: '1rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            color: '#6B7280', marginBottom: '0.6rem',
          }}>
            {t('yourChoicesVsAverage', 'Your choices vs. the average')}
          </p>
          {scenarios.map((s, si) => {
            const userChoice = choices[si];
            return (
              <div key={si} style={{ marginBottom: si < scenarios.length - 1 ? '0.5rem' : 0 }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                  color: '#1A1A2E', margin: '0 0 3px', opacity: 0.7,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                }}>
                  {translatedScenarioActions[si]}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' as const,
                    display: 'flex', background: 'rgba(26,26,46,0.04)',
                  }}>
                    {s.averageDistribution.map((pct, pi) => (
                      <div key={pi} style={{
                        width: `${pct}%`, height: '100%',
                        background: choiceColors[pi], opacity: 0.4,
                      }} />
                    ))}
                  </div>
                  {userChoice !== null && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                      color: choiceColors[userChoice], whiteSpace: 'nowrap' as const,
                    }}>
                      {translatedChoiceLabels[userChoice]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Key insight */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,166,35,0.06), rgba(233,69,96,0.04))',
          border: '1px solid rgba(245,166,35,0.15)',
          borderRadius: 10, padding: '0.75rem', marginBottom: '1rem',
          position: 'relative' as const, overflow: 'hidden' as const,
        }}>
          <div style={{
            position: 'absolute' as const, left: 0, top: 0, bottom: 0, width: 3,
            background: 'linear-gradient(to bottom, #F5A623, #E94560)',
            borderRadius: '3px 0 0 3px',
          }} />
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.6,
            color: '#1A1A2E', margin: 0, opacity: 0.8, paddingLeft: '4px',
          }}>
            {t('autonomyInsightMobile', 'Your autonomy profile should evolve. As you build trust with AI tools, you may find yourself delegating more. The key is being intentional about where you draw the line.')}
          </p>
        </div>

        <div style={{ textAlign: 'center' as const }}>
          <button
            onClick={handleRestart}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
              padding: '0.55rem 1.5rem', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: '#1A1A2E', color: '#FAF8F5',
            }}
          >
            {t('tryAgain', 'Try Again')}
          </button>
        </div>
      </div>
    );
  };

  const collapseStyles = `
    @keyframes tt-collapse { from { max-height: 80px; opacity: 1; margin-bottom: 6px; } to { max-height: 0; opacity: 0; margin-bottom: 0; padding: 0; border-width: 0; overflow: hidden; } }
    @keyframes tt-reveal { from { max-height: 0; opacity: 0; } to { max-height: 400px; opacity: 1; } }
    @keyframes tt-scene-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  `;

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    // If summary is showing on desktop, also show sheet on mobile
    if (showSummary && !sheetOpen) {
      setSheetOpen(true);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <style dangerouslySetInnerHTML={{ __html: collapseStyles }} />
        {/* Compact header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '8px 12px', flexShrink: 0,
          borderBottom: '1px solid rgba(26,26,46,0.06)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'linear-gradient(135deg, #F5A623, #E94560)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700,
            color: '#1A1A2E', margin: 0, flex: 1,
          }}>
            {t('title', 'Trust Thermometer')}
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280' }}>
            {currentScenario + 1}/{scenarios.length}
          </span>
        </div>

        {/* Progress dots */}
        <div style={{
          display: 'flex', gap: 3, padding: '8px 12px 4px', flexShrink: 0,
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

        {/* Main content area */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 12px', overflow: 'hidden',
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateX(-20px)' : 'translateX(0)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          animation: !transitioning && !showTradeoff ? 'tt-scene-in 0.3s ease' : 'none',
        }}>
          {/* Stakes badge + scenario text (max 3 lines) */}
          <div style={{ flexShrink: 0, marginBottom: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase' as const,
              color: stakesColor[scenario.stakes],
              background: stakesColor[scenario.stakes] + '10',
              padding: '2px 6px', borderRadius: 100,
              border: `1px solid ${stakesColor[scenario.stakes]}20`,
            }}>
              {t(`stakes${scenario.stakes.charAt(0).toUpperCase() + scenario.stakes.slice(1)}`, `${scenario.stakes} stakes`)}
            </span>
          </div>

          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
            color: '#1A1A2E', margin: '0 0 10px', lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {t('scenarioPrefix', 'Your AI agent wants to:')} <span style={{ color: '#F5A623' }}>{currentAction.toLowerCase()}</span>
          </p>

          {/* Three large tappable buttons — unchosen collapse */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            {translatedChoiceLabels.map((label, i) => {
              const isSelected = currentChoice === i;
              const isUnchosen = showTradeoff && !isSelected;
              const icons = [
                <svg key="auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
                <svg key="ask" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
                <svg key="never" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
              ];

              if (isUnchosen) {
                return <div key={label} style={{ animation: 'tt-collapse 0.3s ease forwards', overflow: 'hidden' }} />;
              }

              return (
                <button
                  key={label}
                  onClick={() => handleChoice(i)}
                  disabled={showTradeoff}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '10px 12px', borderRadius: 10,
                    border: `1px solid ${isSelected ? choiceColors[i] + '50' : 'rgba(26,26,46,0.08)'}`,
                    background: isSelected ? choiceColors[i] + '08' : 'transparent',
                    cursor: showTradeoff ? 'default' : 'pointer',
                    textAlign: 'left' as const, width: '100%',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: isSelected ? choiceColors[i] : 'rgba(26,26,46,0.04)',
                    color: isSelected ? 'white' : '#6B7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    {icons[i]}
                  </div>
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 700,
                      color: isSelected ? choiceColors[i] : '#1A1A2E', margin: 0,
                    }}>
                      {label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tradeoff + Next — replaces collapsed options */}
          {showTradeoff && currentChoice !== null && (
            <div style={{ marginTop: '6px', flexShrink: 0, animation: 'tt-reveal 0.35s ease 0.15s both', overflow: 'hidden' }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.5,
                color: '#1A1A2E', margin: '0 0 8px', opacity: 0.75,
              }}>
                {currentChoice === 0 && currentTradeoffs.auto}
                {currentChoice === 1 && currentTradeoffs.ask}
                {currentChoice === 2 && currentTradeoffs.never}
              </p>
              <div style={{ textAlign: 'right' as const }}>
                <button
                  onClick={handleNext}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600,
                    padding: '0.45rem 1.2rem', borderRadius: 100, border: 'none', cursor: 'pointer',
                    background: '#1A1A2E', color: '#FAF8F5',
                  }}
                >
                  {currentScenario + 1 >= scenarios.length ? t('seeProfile', 'See Profile') : t('nextScenario', 'Next')} &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BottomSheet for final profile */}
        <BottomSheet
          isOpen={sheetOpen}
          onClose={() => { setSheetOpen(false); }}
          title={t('autonomyProfileTitle', 'Your Autonomy Profile')}
        >
          {summaryContent()}
        </BottomSheet>
      </div>
    );
  }

  // --- DESKTOP LAYOUT (unchanged) ---
  if (showSummary) {
    const choiceCounts = [0, 0, 0];
    choices.forEach((c) => { if (c !== null) choiceCounts[c]++; });

    return (
      <div className="widget-container">
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              {t('autonomyProfileTitle', 'Your Autonomy Profile')}
            </h3>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Profile title */}
          <div style={{ textAlign: 'center' as const, marginBottom: '2rem' }}>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800,
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
            display: 'flex', gap: '1rem', justifyContent: 'center',
            marginBottom: '2rem', flexWrap: 'wrap' as const,
          }}>
            {translatedChoiceLabels.map((label, i) => (
              <div key={label} style={{
                textAlign: 'center' as const, padding: '1rem 1.5rem',
                borderRadius: 12, background: choiceColors[i] + '08',
                border: `1px solid ${choiceColors[i]}20`,
                minWidth: 100,
              }}>
                <p style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.5rem',
                  fontWeight: 800, color: choiceColors[i], margin: '0 0 0.25rem',
                }}>
                  {choiceCounts[i]}
                </p>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
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
            border: '1px solid rgba(26,26,46,0.06)', padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              color: '#6B7280', marginBottom: '1rem',
            }}>
              {t('yourChoicesVsAverage', 'Your choices vs. the average')}
            </p>
            {scenarios.map((s, si) => {
              const userChoice = choices[si];
              return (
                <div key={si} style={{ marginBottom: si < scenarios.length - 1 ? '0.75rem' : 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                    color: '#1A1A2E', margin: '0 0 4px', opacity: 0.7,
                  }}>
                    {translatedScenarioActions[si]}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                        color: choiceColors[userChoice], whiteSpace: 'nowrap' as const,
                      }}>
                        {t('youLabel', 'You:')} {translatedChoiceLabels[userChoice]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div style={{
              display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center',
            }}>
              {translatedChoiceLabels.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: choiceColors[i], opacity: 0.4 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>
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
            borderRadius: 12, padding: '1.25rem 1.5rem',
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
              {t('noRightAnswer', "There's no right answer")}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
              color: '#1A1A2E', margin: 0, opacity: 0.8,
            }}>
              {t('autonomyInsight', 'Your autonomy profile should evolve. As you build trust with AI tools and set up better safety nets (version control, spending limits, review workflows), you may find yourself delegating more. The key is being intentional about where you draw the line.')}
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
              {t('tryAgain', 'Try Again')}
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
        padding: '1.5rem 2rem',
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              {t('title', 'Trust Thermometer')}
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              {t('subtitle', 'How much autonomy would you give?')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>
            {currentScenario + 1} / {scenarios.length}
          </span>
        </div>
      </div>

      <div style={{
        padding: '1.5rem 2rem',
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'translateX(-20px)' : 'translateX(0)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        animation: !transitioning && !showTradeoff ? 'tt-scene-in 0.3s ease' : 'none',
      }}>
        <style dangerouslySetInnerHTML={{ __html: collapseStyles }} />
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
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: stakesColor[scenario.stakes],
            background: stakesColor[scenario.stakes] + '10',
            padding: '0.25rem 0.6rem', borderRadius: 100,
            border: `1px solid ${stakesColor[scenario.stakes]}20`,
          }}>
            {t(`stakes${scenario.stakes.charAt(0).toUpperCase() + scenario.stakes.slice(1)}`, `${scenario.stakes} stakes`)}
          </span>
        </div>

        {/* Scenario */}
        <div style={{
          background: 'rgba(26,26,46,0.02)', borderRadius: 12,
          border: '1px solid rgba(26,26,46,0.06)',
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            color: '#6B7280', marginBottom: '0.5rem',
          }}>
            {t('scenarioLabel', 'Scenario')}
          </p>
          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700,
            color: '#1A1A2E', margin: 0, lineHeight: 1.4,
          }}>
            {t('scenarioPrefix', 'Your AI agent wants to:')} <span style={{ color: '#F5A623' }}>{currentAction.toLowerCase()}</span>
          </p>
        </div>

        {/* Choice buttons — unchosen collapse after selection */}
        <div style={{
          display: 'flex', flexDirection: 'column' as const, gap: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          <style dangerouslySetInnerHTML={{ __html: collapseStyles }} />
          {translatedChoiceLabels.map((label, i) => {
            const isSelected = currentChoice === i;
            const isUnchosen = showTradeoff && !isSelected;
            const icons = [
              <svg key="auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
              <svg key="ask" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
              <svg key="never" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
            ];

            if (isUnchosen) {
              return <div key={label} style={{ animation: 'tt-collapse 0.35s ease forwards', overflow: 'hidden' }} />;
            }

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
                    {i === 0 && t('choiceJustDoItDesc', 'Let the AI handle it automatically')}
                    {i === 1 && t('choiceAskMeFirstDesc', 'AI proposes, you approve')}
                    {i === 2 && t('choiceNeverAllowDesc', 'Off limits for AI')}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Tradeoff + social proof — appears in place of collapsed options */}
          {showTradeoff && currentChoice !== null && (
            <div style={{ animation: 'tt-reveal 0.4s ease 0.2s both', overflow: 'hidden' }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.65,
                color: '#1A1A2E', margin: '0.75rem 0 1rem', opacity: 0.8,
              }}>
                {currentChoice === 0 && currentTradeoffs.auto}
                {currentChoice === 1 && currentTradeoffs.ask}
                {currentChoice === 2 && currentTradeoffs.never}
              </p>

              {/* What others chose — compact bar */}
              <div style={{
                background: 'rgba(26,26,46,0.03)', borderRadius: 8,
                padding: '0.6rem 0.75rem',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  color: '#6B7280', marginBottom: '0.4rem',
                }}>
                  {t('whatOthersChose', 'What others chose')}
                </p>
                <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' as const }}>
                  {scenario.averageDistribution.map((pct, pi) => (
                    <div key={pi} style={{
                      width: `${pct}%`, height: '100%', background: choiceColors[pi],
                      opacity: 0.5, transition: 'width 0.5s ease',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  {scenario.averageDistribution.map((pct, pi) => (
                    <span key={pi} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                      color: choiceColors[pi], fontWeight: currentChoice === pi ? 700 : 400,
                    }}>
                      {pct}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

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
              {currentScenario + 1 >= scenarios.length ? t('seeYourProfile', 'See Your Profile') : t('nextScenario', 'Next Scenario')} &rarr;
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

import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';


interface Step {
  label: string;
  tool: string;
  toolIcon: string;
  instruction: string;
  output: string;
}

interface Preset {
  goal: string;
  steps: Step[];
}

const presets: Preset[] = [
  {
    goal: 'Research and write a report on Mars colonization',
    steps: [
      {
        label: 'Gather Sources',
        tool: 'Search',
        toolIcon: '\uD83D\uDD0D',
        instruction: 'Search for recent articles, NASA reports, and SpaceX plans on Mars colonization feasibility.',
        output: 'Found 12 relevant sources: NASA\'s Moon to Mars plan (2024), SpaceX Starship updates, MIT study on radiation shielding, ESA habitat designs. Key themes: life support, radiation, psychological challenges, cost estimates ($100B+).',
      },
      {
        label: 'Analyze Key Themes',
        tool: 'Analyze',
        toolIcon: '\uD83D\uDCCA',
        instruction: 'Identify the 4-5 most important challenges and group sources by theme.',
        output: 'Identified 5 core challenges: (1) Radiation exposure \u2014 3 sources, (2) Life support & food \u2014 4 sources, (3) Psychological isolation \u2014 2 sources, (4) Transportation cost \u2014 3 sources, (5) Legal/governance frameworks \u2014 2 sources.',
      },
      {
        label: 'Write Draft',
        tool: 'Write',
        toolIcon: '\u270D\uFE0F',
        instruction: 'Write a 1-page report covering the 5 challenges, with an intro and conclusion. Cite sources inline.',
        output: 'Draft complete: "The Case for Mars: Challenges Ahead" \u2014 612 words. Covers all 5 themes with inline citations. Intro frames the timeline (2040s), conclusion weighs optimism vs. realism.',
      },
      {
        label: 'Fact-Check Claims',
        tool: 'Search',
        toolIcon: '\uD83D\uDD0D',
        instruction: 'Verify the 3 most important factual claims in the draft against primary sources.',
        output: 'Verified: (1) Mars transit time 6-9 months \u2714\uFE0F, (2) Radiation dose 0.67 mSv/day \u2714\uFE0F, (3) Starship cost estimate needed update \u2014 corrected from $2B to $5B per launch based on latest projections.',
      },
      {
        label: 'Polish & Format',
        tool: 'Write',
        toolIcon: '\u270D\uFE0F',
        instruction: 'Apply corrections, add section headings, format citations as footnotes, and write a compelling opening line.',
        output: 'Final report complete: "The Case for Mars: Five Challenges Standing Between Humanity and a Second Home." 648 words, 5 sections, 8 footnotes. Ready for submission.',
      },
    ],
  },
  {
    goal: 'Plan a weekend trip to NYC',
    steps: [
      {
        label: 'Research Options',
        tool: 'Search',
        toolIcon: '\uD83D\uDD0D',
        instruction: 'Find top-rated affordable activities, restaurants, and neighborhoods for a weekend in NYC.',
        output: 'Compiled options: Free \u2014 Central Park, High Line, Brooklyn Bridge, Staten Island Ferry. Budget food \u2014 Joe\'s Pizza, Xi\'an Famous Foods, Los Tacos No. 1. Neighborhoods \u2014 Greenwich Village, Williamsburg, Lower East Side.',
      },
      {
        label: 'Check Logistics',
        tool: 'Search',
        toolIcon: '\uD83D\uDD0D',
        instruction: 'Find transit info, weather forecast for this weekend, and budget hotel options under $150/night.',
        output: 'Metro: 7-day unlimited $33, weekend weather: 65\u00B0F partly cloudy. Hotels: Pod 51 ($119/night), HI NYC Hostel ($45/night), The Jane ($139/night). All in Manhattan.',
      },
      {
        label: 'Build Itinerary',
        tool: 'Write',
        toolIcon: '\u270D\uFE0F',
        instruction: 'Create a Saturday + Sunday itinerary with morning, afternoon, and evening blocks. Balance free and paid activities.',
        output: 'Saturday: Morning \u2014 High Line + Chelsea Market, Afternoon \u2014 MoMA ($18 student), Evening \u2014 Greenwich Village dinner + Washington Square Park. Sunday: Morning \u2014 Brooklyn Bridge walk + DUMBO, Afternoon \u2014 Williamsburg vintage shops, Evening \u2014 Sunset from Top of the Rock ($40).',
      },
      {
        label: 'Estimate Budget',
        tool: 'Analyze',
        toolIcon: '\uD83D\uDCCA',
        instruction: 'Calculate total estimated cost for the weekend including transit, food, activities, and lodging.',
        output: 'Budget breakdown: Hotel 2 nights ($238), Metro ($33), Food ($80), MoMA ($18), Top of the Rock ($40), Misc ($30). Total: ~$439. Could cut to $310 by choosing the hostel and skipping Top of the Rock.',
      },
      {
        label: 'Create Packing List',
        tool: 'Write',
        toolIcon: '\u270D\uFE0F',
        instruction: 'Generate a concise packing list based on the weather and planned activities.',
        output: 'Packing list: Comfortable walking shoes, light jacket, phone charger + portable battery, student ID (for discounts), metro card money, small daypack. Outfit for nicer dinner optional. Total: fits in one backpack.',
      },
    ],
  },
  {
    goal: 'Create a study guide for a biology exam',
    steps: [
      {
        label: 'Identify Topics',
        tool: 'Analyze',
        toolIcon: '\uD83D\uDCCA',
        instruction: 'Break down the exam topics: cell biology, genetics, evolution, ecology. List key subtopics for each.',
        output: 'Topic map: Cell Bio (organelles, mitosis/meiosis, cell membrane transport), Genetics (Mendelian inheritance, DNA replication, gene expression), Evolution (natural selection, speciation, evidence), Ecology (food webs, biomes, population dynamics). 14 subtopics total.',
      },
      {
        label: 'Find Weak Areas',
        tool: 'Analyze',
        toolIcon: '\uD83D\uDCCA',
        instruction: 'Based on common exam patterns, rank subtopics by difficulty and likelihood of appearing on the test.',
        output: 'High priority (hard + likely): meiosis vs. mitosis, gene expression, natural selection mechanisms. Medium: membrane transport, Punnett squares, population dynamics. Lower priority: organelle functions, biome classification \u2014 usually straightforward.',
      },
      {
        label: 'Write Summaries',
        tool: 'Write',
        toolIcon: '\u270D\uFE0F',
        instruction: 'Write a concise 3-4 sentence summary for each of the 14 subtopics, focusing on what students typically get wrong.',
        output: 'Summaries complete for all 14 subtopics. Key corrections embedded: mitosis = 2 identical cells (not 4), mRNA goes TO ribosome (not the other way), natural selection acts on individuals but evolution happens to populations.',
      },
      {
        label: 'Generate Practice Questions',
        tool: 'Write',
        toolIcon: '\u270D\uFE0F',
        instruction: 'Create 2 practice questions per high-priority subtopic, with answer explanations.',
        output: 'Generated 12 practice questions across 6 high-priority subtopics. Mix of multiple choice (8) and short answer (4). Each includes a detailed explanation of the correct answer and why common wrong answers are tempting.',
      },
      {
        label: 'Format Study Guide',
        tool: 'Write',
        toolIcon: '\u270D\uFE0F',
        instruction: 'Compile everything into a clean study guide with sections, visual mnemonics suggestions, and a 2-hour study schedule.',
        output: 'Study guide complete: 4 sections, 14 summaries, 12 practice questions, 3 mnemonic devices (e.g., "MiTWOsis = TWO identical cells"). Study schedule: 30 min high-priority review, 30 min practice questions, 30 min weak areas, 30 min full review. Formatted and ready to print.',
      },
    ],
  },
];

export default function AgentBlueprint() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [glowPosition, setGlowPosition] = useState(-1);
  const executingRef = useRef(false);

  const activePreset = selectedPreset !== null ? presets[selectedPreset] : null;
  const steps = activePreset?.steps || [];

  const selectPreset = (index: number) => {
    setSelectedPreset(index);
    setCustomGoal('');
    resetExecution();
  };

  const resetExecution = () => {
    executingRef.current = false;
    setIsExecuting(false);
    setCurrentStep(-1);
    setCompletedSteps([]);
    setExpandedStep(null);
    setGlowPosition(-1);
  };

  const executeAgent = async () => {
    if (!activePreset) return;
    resetExecution();

    await new Promise((r) => setTimeout(r, 100));
    setIsExecuting(true);
    executingRef.current = true;

    for (let i = 0; i < activePreset.steps.length; i++) {
      if (!executingRef.current) break;
      setGlowPosition(i);
      await new Promise((r) => setTimeout(r, 600));
      if (!executingRef.current) break;
      setCurrentStep(i);
      setExpandedStep(i);
      await new Promise((r) => setTimeout(r, 1800));
      if (!executingRef.current) break;
      setCompletedSteps((prev) => [...prev, i]);
    }

    if (executingRef.current) {
      setGlowPosition(-1);
      setIsExecuting(false);
    }
  };

  const goalDisplay = activePreset?.goal || customGoal || 'Select a goal to get started';
  const isMobile = useIsMobile();

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #E94560, #7B61FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              Agent Blueprint
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              Pick a goal. Watch an agent plan and execute step by step.
            </p>
          </div>
        </div>
      </div>

      {/* Goal Selection */}
      <div style={{ padding: isMobile ? '1rem' : '1.25rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', background: 'rgba(26,26,46,0.015)' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#E94560',
          display: 'block', marginBottom: 10,
        }}>
          Choose a Goal
        </span>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const, flexWrap: 'wrap' as const, gap: 8 }}>
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => selectPreset(i)}
              style={{
                padding: isMobile ? '0.65rem 1rem' : '0.5rem 1rem', borderRadius: 8, border: '1px solid',
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 0.25s', lineHeight: 1.4,
                minHeight: isMobile ? 44 : undefined,
                background: selectedPreset === i ? '#1A1A2E' : 'transparent',
                borderColor: selectedPreset === i ? '#1A1A2E' : 'rgba(26,26,46,0.1)',
                color: selectedPreset === i ? '#FAF8F5' : '#1A1A2E',
              }}
            >
              {preset.goal}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Plan Flowchart */}
      {activePreset && (
        <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
          {/* Goal node */}
          <div style={{
            textAlign: 'center' as const, marginBottom: 8,
          }}>
            <div style={{
              display: 'inline-block', padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.5rem', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(233,69,96,0.08), rgba(123,97,255,0.08))',
              border: '2px solid #E94560',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#E94560',
                display: 'block', marginBottom: 4,
              }}>
                GOAL
              </span>
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 700, color: '#1A1A2E',
              }}>
                {goalDisplay}
              </span>
            </div>
          </div>

          {/* Steps */}
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
            {steps.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isCurrent = currentStep === i && !isCompleted;
              const isGlowing = glowPosition === i;
              const isExpanded = expandedStep === i;

              return (
                <div key={i}>
                  {/* Connector line + glow dot */}
                  <div style={{
                    display: 'flex', justifyContent: 'center', height: 36,
                    position: 'relative',
                  }}>
                    <div style={{
                      width: 2, height: '100%',
                      background: isCompleted || isGlowing
                        ? 'linear-gradient(to bottom, #E94560, #7B61FF)'
                        : 'rgba(26,26,46,0.1)',
                      transition: 'background 0.5s',
                    }} />
                    {isGlowing && !isCompleted && (
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#E94560',
                        boxShadow: '0 0 12px rgba(233,69,96,0.6), 0 0 24px rgba(233,69,96,0.3)',
                        animation: 'pulse 1s ease-in-out infinite',
                      }} />
                    )}
                  </div>

                  {/* Step node */}
                  <div
                    onClick={() => {
                      if (isCompleted || isCurrent) {
                        setExpandedStep(isExpanded ? null : i);
                      }
                    }}
                    style={{
                      border: '1px solid',
                      borderColor: isCompleted ? 'rgba(22,199,154,0.3)'
                        : isCurrent ? 'rgba(233,69,96,0.4)'
                        : 'rgba(26,26,46,0.08)',
                      borderRadius: 12, padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem',
                      background: isCompleted ? 'rgba(22,199,154,0.04)'
                        : isCurrent ? 'rgba(233,69,96,0.04)'
                        : '#FEFDFB',
                      cursor: isCompleted || isCurrent ? 'pointer' : 'default',
                      transition: 'all 0.4s',
                      boxShadow: isCurrent ? '0 0 20px rgba(233,69,96,0.08)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 10 : 12 }}>
                      {/* Step number / status */}
                      <div style={{
                        width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 10, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isCompleted ? 18 : 14, fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        background: isCompleted ? '#16C79A' : isCurrent ? '#E94560' : 'rgba(26,26,46,0.06)',
                        color: isCompleted || isCurrent ? 'white' : '#6B7280',
                        transition: 'all 0.4s',
                      }}>
                        {isCompleted ? '\u2713' : i + 1}
                      </div>

                      {/* Step info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 8, marginBottom: 2, flexWrap: isMobile ? 'wrap' as const : 'nowrap' as const }}>
                          <span style={{
                            fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.88rem' : '0.95rem',
                            fontWeight: 700, color: '#1A1A2E',
                          }}>
                            {step.label}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                            padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(123,97,255,0.08)', color: '#7B61FF',
                          }}>
                            {step.toolIcon} {step.tool}
                          </span>
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#6B7280',
                          margin: 0, lineHeight: 1.5,
                        }}>
                          {step.instruction}
                        </p>
                      </div>

                      {/* Expand indicator */}
                      {(isCompleted || isCurrent) && (
                        <div style={{
                          flexShrink: 0, fontSize: 12, color: '#6B7280',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}>
                          \u25BC
                        </div>
                      )}
                    </div>

                    {/* Expanded output */}
                    {isExpanded && (isCompleted || isCurrent) && (
                      <div style={{
                        marginTop: 12, paddingTop: 12,
                        borderTop: '1px solid rgba(26,26,46,0.06)',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                          color: isCompleted ? '#16C79A' : '#E94560',
                          display: 'block', marginBottom: 6,
                        }}>
                          {isCompleted ? 'Output' : 'Processing...'}
                        </span>
                        <p style={{
                          fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                          lineHeight: 1.7, color: '#1A1A2E', margin: 0,
                          opacity: isCurrent && !isCompleted ? 0.6 : 1,
                        }}>
                          {step.output}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Execute button */}
          <div style={{ textAlign: 'center' as const, marginTop: 24 }}>
            <button
              onClick={isExecuting ? resetExecution : executeAgent}
              style={{
                padding: isMobile ? '0.75rem 1.5rem' : '0.75rem 2rem', borderRadius: 10, border: 'none',
                minHeight: 44,
                fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.3s',
                background: isExecuting ? '#6B7280' : 'linear-gradient(135deg, #E94560, #7B61FF)',
                color: 'white',
                boxShadow: isExecuting ? 'none' : '0 4px 16px rgba(233,69,96,0.25)',
              }}
            >
              {isExecuting ? 'Reset' : completedSteps.length === steps.length ? 'Run Again' : 'Execute Agent'}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!activePreset && (
        <div style={{
          padding: isMobile ? '3rem 1rem' : '4rem 2rem', textAlign: 'center' as const, color: '#6B7280',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', margin: 0 }}>
            Select a goal above to see the agent's plan.
          </p>
        </div>
      )}

      {/* Completion summary */}
      {completedSteps.length === steps.length && steps.length > 0 && !isExecuting && (
        <div style={{
          padding: isMobile ? '1rem' : '1.25rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
          background: 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(123,97,255,0.04))',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            fontStyle: 'italic', color: '#1A1A2E', margin: 0,
          }}>
            <span style={{ fontWeight: 600, color: '#16C79A', fontStyle: 'normal' }}>Agent complete. </span>
            {steps.length} steps executed. The agent broke a complex goal into small, tool-using steps &mdash;
            each one building on the last. That's the core pattern of every AI agent.
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.5); }
        }
      `}</style>
    </div>
  );
}

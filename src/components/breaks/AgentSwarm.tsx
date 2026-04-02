import { useState, useEffect, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import ShareCard from '../ui/ShareCard';
import { useTranslation, getLocale } from '../../i18n/useTranslation';
import { languages } from '../../data/languages';

interface Agent {
  name: string;
  role: string;
  color: string;
  tasks: string[];
}

interface SwarmPlan {
  summary: string;
  agents: Agent[];
}

type Phase = 'input' | 'loading' | 'result';

const COLORS = ['#E94560', '#7B61FF', '#16C79A', '#F5A623', '#0EA5E9', '#0F3460', '#E94560', '#16C79A'];

const PRESETS = [
  'Launch a new perfume brand',
  'Plan a Mars colony',
  'Take an indie game studio public',
  'Organize a 10,000-person music festival',
  'Build and launch a social media app',
  'Open a chain of ramen restaurants',
];

const SYSTEM_PROMPT = `You break complex tasks into specialized AI agents. Respond with ONLY valid JSON, nothing else.

Format: {"summary":"Brief plan (1 sentence)","agents":[{"name":"Short Name","role":"5-word role","tasks":["task","task"]}]}

Rules:
- Exactly 5 agents
- Names: 2-3 words max (e.g., "The Dealmaker", "Brand Lead")
- Role: under 8 words
- Each agent gets exactly 2 tasks, each under 10 words
- Summary: 1 confident sentence, under 20 words
- Output ONLY the JSON object. No explanation, no markdown, no wrapping text.`;

export default function AgentSwarm() {
  const t = useTranslation('agentSwarm');
  const langName = languages.find(l => l.code === getLocale())?.name || 'English';
  const [task, setTask] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [plan, setPlan] = useState<SwarmPlan | null>(null);
  const [visibleAgents, setVisibleAgents] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const handleGenerate = () => {
    const trimmed = task.trim();
    if (!trimmed) return;

    setPhase('loading');
    setError(null);
    setPlan(null);
    setVisibleAgents(0);
    setShowSummary(false);
    setAnimationDone(false);

    let accumulated = '';

    controllerRef.current?.abort();
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: trimmed }],
      systemPrompt: SYSTEM_PROMPT + `\n\nIMPORTANT: Write all text fields (summary, name, role, tasks) in ${langName}. The JSON structure and key names must remain in English.`,
      maxTokens: 800,
      source: 'break',
      onChunk: (chunk) => { accumulated += chunk; },
      onDone: () => {
        try {
          let cleaned = accumulated.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
          }
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('No JSON in response');
          const parsed = JSON.parse(jsonMatch[0]) as SwarmPlan;
          if (!parsed.agents || parsed.agents.length === 0) throw new Error('No agents');
          parsed.agents = parsed.agents.map((a, i) => ({ ...a, color: COLORS[i % COLORS.length] }));
          setPlan(parsed);
          setPhase('result');
        } catch {
          setError(t('errorGenerate', 'Failed to generate plan. Try again.'));
          setPhase('input');
        }
        controllerRef.current = null;
      },
      onError: (err) => {
        setError(err);
        setPhase('input');
        controllerRef.current = null;
      },
    });
  };

  // Staggered agent reveal animation
  useEffect(() => {
    if (phase !== 'result' || !plan) return;
    const total = plan.agents.length;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleAgents(count);
      if (count >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setShowSummary(true);
          setAnimationDone(true);
        }, 600);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [phase, plan]);

  const handleReset = () => {
    controllerRef.current?.abort();
    setPhase('input');
    setTask('');
    setPlan(null);
    setVisibleAgents(0);
    setShowSummary(false);
    setAnimationDone(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const animStyle = `
    @keyframes as-pop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
    @keyframes as-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes as-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
  `;

  return (
    <div className="widget-container">
      <style>{animStyle}</style>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1.75rem',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #E94560, #F5A623)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3" />
            <circle cx="5" cy="19" r="3" />
            <circle cx="19" cy="19" r="3" />
            <line x1="12" y1="8" x2="5" y2="16" />
            <line x1="12" y1="8" x2="19" y2="16" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            {t('title', 'Agent Swarm')}
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            {t('subtitle', 'Describe something ambitious. Watch an AI swarm break it down.')}
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>

        {/* --- INPUT PHASE --- */}
        {phase === 'input' && (
          <div style={{ animation: 'as-fade-up 0.3s ease both' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#1A1A2E',
              margin: '0 0 1rem',
              lineHeight: 1.6,
            }}>
              {t('inputPrompt', 'Give it a big, messy goal. The swarm will figure out who does what.')}
            </p>

            {/* Preset chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: '1rem' }}>
              {PRESETS.map(p => (
                <button key={p} onClick={() => setTask(p)} style={{
                  padding: '5px 12px', borderRadius: 100,
                  border: `1px solid ${task === p ? '#E9456030' : 'rgba(26,26,46,0.08)'}`,
                  background: task === p ? '#E9456008' : 'transparent',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem', color: task === p ? '#E94560' : 'var(--color-subtle)',
                  transition: 'all 0.2s',
                }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder', 'Launch a new perfume brand...')}
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: 10,
                border: '1px solid rgba(26,26,46,0.08)', background: '#FEFDFB',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#1A1A2E',
                outline: 'none', minHeight: 48, transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#E9456040'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
            />

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8 }}>{error}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={handleGenerate}
                disabled={!task.trim()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 10, border: 'none',
                  cursor: !task.trim() ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
                  background: !task.trim() ? 'rgba(26,26,46,0.08)' : 'linear-gradient(135deg, #E94560, #F5A623)',
                  color: !task.trim() ? '#6B7280' : '#FFFFFF',
                  minHeight: 44, transition: 'all 0.25s',
                }}
                onMouseEnter={(e) => { if (task.trim()) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {t('spawnButton', 'Spawn')}
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#B0B0B0' }}>{t('cmdEnter', 'Cmd+Enter')}</span>
            </div>
          </div>
        )}

        {/* --- LOADING PHASE --- */}
        {phase === 'loading' && (
          <div style={{ padding: '2rem', textAlign: 'center' as const, animation: 'as-fade-up 0.3s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '0.75rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: COLORS[i], animation: `as-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.25rem' }}>
              {t('assembling', 'Assembling your swarm...')}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
              {task}
            </p>
          </div>
        )}

        {/* --- RESULT PHASE --- */}
        {phase === 'result' && plan && (
          <div style={{ animation: 'as-fade-up 0.4s ease both' }}>
            {/* Task label */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', margin: '0 0 4px' }}>
                {t('mission', 'Mission')}
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0 }}>
                {task}
              </p>
            </div>

            {/* Agent grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}>
              {plan.agents.map((agent, i) => {
                const visible = i < visibleAgents;
                return (
                  <div key={i} style={{
                    padding: '1rem 1.25rem', borderRadius: 12,
                    border: `1px solid ${agent.color}20`,
                    background: `${agent.color}04`,
                    position: 'relative', overflow: 'hidden',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1)' : 'scale(0.5)',
                    transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}>
                    {/* Agent header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, background: agent.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 800, color: 'white',
                        flexShrink: 0,
                      }}>
                        {(i + 1).toString().padStart(2, '0')}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.2 }}>
                          {agent.name}
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: agent.color, margin: 0, opacity: 0.8 }}>
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {agent.tasks.map((taskText, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 6,
                          padding: '4px 8px', borderRadius: 6,
                          background: 'rgba(26,26,46,0.02)',
                        }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: agent.color, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                            &bull;
                          </span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#1A1A2E', lineHeight: 1.4, opacity: 0.8 }}>
                            {taskText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Executive summary */}
            {showSummary && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(245,166,35,0.04))',
                border: '1px solid rgba(233,69,96,0.15)',
                borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem',
                animation: 'as-fade-up 0.5s ease',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 600,
                  fontStyle: 'italic', color: '#1A1A2E', margin: 0, lineHeight: 1.5,
                }}>
                  &ldquo;{plan.summary}&rdquo;
                </p>
              </div>
            )}

            {/* Stats line */}
            {showSummary && (
              <div style={{
                background: 'rgba(26,26,46,0.03)',
                border: '1px solid rgba(26,26,46,0.06)',
                borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem',
                textAlign: 'center' as const,
                animation: 'as-fade-up 0.4s ease',
              }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#1A1A2E', margin: 0 }}>
                  {t('readyToExecute', '{agents} agents \u2022 {tasks} tasks \u2022 Ready to execute').replace('{agents}', String(plan.agents.length)).replace('{tasks}', String(plan.agents.reduce((s, a) => s + a.tasks.length, 0)))}
                </p>
              </div>
            )}

            {/* ShareCard + Reset */}
            {animationDone && (
              <>
                <ShareCard
                  title={`${plan.agents.length}-Agent Swarm`}
                  metric={`${plan.agents.reduce((s, a) => s + a.tasks.length, 0)} tasks`}
                  metricColor="#E94560"
                  subtitle={plan.summary}
                  accentColor="#E94560"
                  tweetText={`My AI swarm: ${plan.agents.length} agents, ${plan.agents.reduce((s, a) => s + a.tasks.length, 0)} tasks to "${task}"`}
                  shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/toolbox?tool=agent-swarm` : undefined}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.25rem' }}>
                  <button
                    onClick={handleReset}
                    style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                      padding: '0.6rem 1.5rem', borderRadius: 100,
                      border: 'none',
                      background: 'linear-gradient(135deg, #E94560, #F5A623)',
                      color: '#FFFFFF', cursor: 'pointer',
                      transition: 'all 0.25s', minHeight: 44,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {t('tryAnotherMission', 'Try Another Mission')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

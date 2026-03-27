import { useState, useEffect, useRef } from 'react';
import { streamChat } from '../../lib/claude';
import { useAuth } from '../../hooks/useAuth';
import UnlockModal from '../ui/UnlockModal';

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

const COLORS = ['#E94560', '#7B61FF', '#16C79A', '#F5A623', '#0EA5E9', '#0F3460', '#E94560', '#16C79A'];

const PRESETS = [
  'Launch a new perfume brand',
  'Plan a Mars colony',
  'Take an indie game studio public',
  'Organize a 10,000-person music festival',
  'Build and launch a social media app',
  'Open a chain of ramen restaurants',
];

const SYSTEM_PROMPT = `You are an AI orchestration planner. The user describes a complex task. Break it into 5-7 specialized agents, each with a clear role and 2-3 specific subtasks.

Respond ONLY with valid JSON in this exact format, no other text:
{"summary":"One sentence executive briefing of the plan","agents":[{"name":"Agent Name","role":"One-line role description","tasks":["task 1","task 2","task 3"]}]}

Rules:
- Agent names should be memorable and descriptive (e.g., "The Dealmaker", "Brand Architect", "Supply Chain Commander")
- Each agent gets 2-3 very specific, actionable tasks (not vague)
- The summary should sound like a confident executive assistant briefing their boss
- 5-7 agents total, no more
- Keep it fun and slightly dramatic — this is a visualization people want to share
- Do NOT use markdown. Pure JSON only.`;

export default function AgentSwarm() {
  const { isPaid } = useAuth();
  const [task, setTask] = useState('');
  const [phase, setPhase] = useState<'input' | 'generating' | 'animating' | 'complete'>('input');
  const [plan, setPlan] = useState<SwarmPlan | null>(null);
  const [visibleAgents, setVisibleAgents] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [error, setError] = useState('');
  const swarmRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    const trimmed = task.trim();
    if (!trimmed) return;
    if (!isPaid) { setShowUnlock(true); return; }

    setPhase('generating');
    setError('');
    setPlan(null);
    setVisibleAgents(0);
    setShowSummary(false);

    let accumulated = '';
    streamChat({
      messages: [{ role: 'user', content: trimmed }],
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 500,
      source: 'agent-swarm',
      skipPersona: true,
      onChunk: (t) => { accumulated += t; },
      onDone: () => {
        try {
          // Extract JSON from response (in case there's wrapper text)
          const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('No JSON found');
          const parsed = JSON.parse(jsonMatch[0]) as SwarmPlan;
          if (!parsed.agents || parsed.agents.length === 0) throw new Error('No agents');
          // Assign colors
          parsed.agents = parsed.agents.map((a, i) => ({ ...a, color: COLORS[i % COLORS.length] }));
          setPlan(parsed);
          setPhase('animating');
        } catch {
          setError('Failed to generate plan. Try again with a different task.');
          setPhase('input');
        }
      },
      onError: () => {
        setError('Connection error. Try again.');
        setPhase('input');
      },
    });
  };

  // Staggered agent reveal animation
  useEffect(() => {
    if (phase !== 'animating' || !plan) return;
    const total = plan.agents.length;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleAgents(count);
      if (count >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setShowSummary(true);
          setPhase('complete');
        }, 600);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [phase, plan]);

  const handleReset = () => {
    setPhase('input');
    setPlan(null);
    setVisibleAgents(0);
    setShowSummary(false);
    setError('');
  };

  return (
    <div>
      <style>{`
        @keyframes as-pop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes as-line { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes as-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes as-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>

      {/* ═══ INPUT PHASE ═══ */}
      {phase === 'input' && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-deep)', margin: '0 0 0.5rem', lineHeight: 1.6 }}>
              Describe something ambitious. Watch an AI swarm break it down.
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-subtle)', margin: 0, opacity: 0.6 }}>
              "Have my agents talk to your agents"
            </p>
          </div>

          {/* Preset chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, justifyContent: 'center', marginBottom: '1rem' }}>
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
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
              placeholder="Launch a new perfume brand..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 10,
                border: '1px solid rgba(26,26,46,0.1)', background: '#FEFDFB',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#1A1A2E',
                outline: 'none', minHeight: 48,
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#E9456040'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'}
            />
            <button onClick={handleGenerate} disabled={!task.trim()} style={{
              padding: '12px 24px', borderRadius: 10, border: 'none',
              background: task.trim() ? '#E94560' : 'rgba(26,26,46,0.08)',
              color: task.trim() ? 'white' : '#6B7280',
              cursor: task.trim() ? 'pointer' : 'default',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
              transition: 'all 0.2s', minHeight: 48, flexShrink: 0,
            }}>
              Spawn
            </button>
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginTop: 8, textAlign: 'center' }}>{error}</p>
          )}

          {showUnlock && !isPaid && (
            <div style={{ marginTop: '1rem' }}>
              <UnlockModal feature="Agent Swarm" accentColor="#E94560" />
            </div>
          )}
        </div>
      )}

      {/* ═══ GENERATING ═══ */}
      {phase === 'generating' && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '1.5rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: COLORS[i], animation: `as-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 0.25rem' }}>
            Assembling your swarm...
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-subtle)', margin: 0 }}>
            {task}
          </p>
        </div>
      )}

      {/* ═══ SWARM VISUALIZATION ═══ */}
      {(phase === 'animating' || phase === 'complete') && plan && (
        <div ref={swarmRef}>
          {/* Executive summary */}
          {showSummary && (
            <div style={{
              maxWidth: 600, margin: '0 auto 1.5rem', padding: '1rem 1.25rem',
              borderRadius: 12, background: 'rgba(233,69,96,0.04)',
              border: '1px solid rgba(233,69,96,0.12)',
              animation: 'as-fade-up 0.5s ease',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom, #E94560, #F5A623)', borderRadius: '3px 0 0 3px' }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#E94560', margin: '0 0 4px' }}>
                Executive Assistant
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: '#1A1A2E', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                "{plan.summary}"
              </p>
            </div>
          )}

          {/* Task label */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-subtle)', margin: '0 0 4px' }}>
              Mission
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
            maxWidth: 800,
            margin: '0 auto',
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
                  {/* Left bar */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: agent.color, borderRadius: '3px 0 0 3px', opacity: 0.6 }} />

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
                    {agent.tasks.map((t, j) => (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                        padding: '4px 8px', borderRadius: 6,
                        background: 'rgba(26,26,46,0.02)',
                      }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: agent.color, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                          &bull;
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#1A1A2E', lineHeight: 1.4, opacity: 0.8 }}>
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Swarm count + actions */}
          {phase === 'complete' && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', animation: 'as-fade-up 0.4s ease' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-subtle)', margin: '0 0 1rem' }}>
                {plan.agents.length} agents &bull; {plan.agents.reduce((s, a) => s + a.tasks.length, 0)} tasks &bull; Ready to execute
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const }}>
                <button onClick={handleReset} style={{
                  padding: '10px 24px', borderRadius: 100, border: 'none',
                  background: '#1A1A2E', color: 'white', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                }}>
                  Try Another Mission
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import FlipCard from '../../ui/FlipCard';
import AgentBlueprint from './AgentBlueprint';
import FailureModesLab from './FailureModesLab';
import HandoffChain from './HandoffChain';

const ACCENT = '#E94560';

/* --- Key fact exports (used by CardActionBar facts panel) --- */
export const agentArchitectureKeyFact = "Every agent has five parts: Goal, Planner, Tools, Memory, and Evaluator. Missing any one — especially the Evaluator — leads to spectacular failures.";

export const multiAgentKeyFact = "The handoff document is the most important artifact in a multi-agent system. A brilliant writer can't save sloppy research notes.";

/* --- Back Content: The Five Components of an Agent --- */
export function AgentArchitectureBack() {
  const components = [
    { letter: 'G', name: 'Goal', color: '#E94560', text: 'What the agent is trying to achieve. Without a clear goal, every other piece is wasted motion.' },
    { letter: 'P', name: 'Planner', color: '#0F3460', text: 'Breaks the goal into steps. A good planner sequences tasks so each one feeds the next.' },
    { letter: 'T', name: 'Tools', color: '#7B61FF', text: 'The actions the agent can take — web search, code execution, file I/O. No tools, no agency.' },
    { letter: 'M', name: 'Memory', color: '#16C79A', text: 'What the agent has done so far, within the conversation. Without memory, it repeats itself or contradicts earlier work.' },
    { letter: 'E', name: 'Evaluator', color: '#F5A623', text: "Checks if the work is good enough. The most commonly missing piece — and the one that causes the worst failures." },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        Every agent — from a simple script to a sophisticated autonomous system — is built from the same five components. Miss one and the whole thing breaks.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {components.map((comp) => (
          <div key={comp.letter} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800,
              color: 'white', background: comp.color,
            }}>
              {comp.letter}
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: comp.color, fontSize: '0.85rem' }}>
                {comp.name}:
              </span>{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', opacity: 0.75, color: 'var(--color-deep)' }}>
                {comp.text}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-subtle)' }}>
        The Evaluator is the one most people skip. Without it, an agent is just a fast way to produce confident garbage.
      </p>
    </div>
  );
}

/* --- Back Content: Three Ways Agents Fail --- */
export function FailureModesBack() {
  const modes = [
    {
      name: 'Infinite Loop',
      color: '#E94560',
      desc: 'The agent keeps researching, refining, and re-planning — but never actually produces output. It\'s stuck in a cycle of "not good enough yet."',
      fix: 'Set a maximum iteration count. Force a deliverable after N steps, even if imperfect.',
    },
    {
      name: 'Wrong Tool',
      color: '#F5A623',
      desc: 'The agent tries to "search the web" for a file on your computer, or "read a database" that doesn\'t exist. It picks tools based on name, not capability.',
      fix: 'Validate tool selection before execution. Give each tool a clear description of what it can and cannot do.',
    },
    {
      name: 'Hallucinated Action',
      color: '#7B61FF',
      desc: 'The agent "calls" an API endpoint that doesn\'t exist, or "sends" an email it has no access to. It confuses describing an action with performing one.',
      fix: 'Require confirmation before irreversible actions. Log every tool call so you can audit what actually happened.',
    },
  ];

  return (
    <div>
      <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        Agent failures are predictable. Learn these three patterns and you'll catch 90% of problems before they happen:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {modes.map((mode) => (
          <div key={mode.name}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
              <div style={{
                flexShrink: 0, width: '10px', height: '10px', borderRadius: '50%',
                background: mode.color,
              }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: mode.color, fontSize: '0.9rem' }}>
                {mode.name}
              </span>
            </div>
            <p style={{ margin: '0 0 0.3rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', opacity: 0.75, color: 'var(--color-deep)', paddingLeft: '1.25rem' }}>
              {mode.desc}
            </p>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: mode.color, opacity: 0.85, paddingLeft: '1.25rem' }}>
              Fix: {mode.fix}
            </p>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-subtle)' }}>
        Every guardrail you add slows the agent down a little. That's the point. Speed without safety is just a faster crash.
      </p>
    </div>
  );
}

/* --- Back Content: Multi-Agent Systems --- */
export function MultiAgentBack() {
  const agents = [
    { emoji: '\uD83D\uDD0D', name: 'Researcher', color: '#0EA5E9', role: 'Gathers raw information, finds sources, compiles notes' },
    { emoji: '\u270D\uFE0F', name: 'Writer', color: '#7B61FF', role: 'Transforms research notes into coherent prose, structures arguments' },
    { emoji: '\uD83D\uDD0E', name: 'Editor', color: '#16C79A', role: 'Reviews the draft for accuracy, clarity, and completeness' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        Think of a multi-agent system like a newsroom. Each agent is a specialist with a clear job, and they pass work to each other through defined handoffs.
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.25rem', flexWrap: 'wrap',
        margin: '1rem 0', padding: '0.75rem 0.5rem',
        background: `${ACCENT}08`, borderRadius: '10px',
      }}>
        {agents.map((agent, i) => (
          <div key={agent.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
              padding: '0.4rem 0.6rem', background: 'white', borderRadius: '8px',
              border: `2px solid ${agent.color}`,
            }}>
              <span style={{ fontSize: '0.9rem' }}>{agent.emoji}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: agent.color }}>
                {agent.name}
              </span>
            </div>
            {i < agents.length - 1 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-subtle)', opacity: 0.5 }}>
                {'\u2192'}
              </span>
            )}
          </div>
        ))}
      </div>

      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        The critical insight: the <strong>handoff document</strong> between agents is the most important artifact in the whole system. Sloppy research notes produce a sloppy draft. A vague draft gives the editor nothing to work with.
      </p>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem', marginBottom: '0.75rem',
        fontStyle: 'italic', opacity: 0.85,
        fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)',
      }}>
        A brilliant writer can't save sloppy research notes. The quality of the handoff determines the quality of the final product.
      </div>

      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-subtle)' }}>
        When a multi-agent system fails, don't blame the last agent. Trace back to the handoff. That's almost always where things went wrong.
      </p>
    </div>
  );
}

/* ===============================================
   EXPORTED FLIP CARD WRAPPERS
   =============================================== */

export function AgentBlueprintFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="The five components of an agent \u2192"
      backTitle="Agent Architecture"
      frontContent={<AgentBlueprint />}
      backContent={<AgentArchitectureBack />}
    />
  );
}

export function FailureModesLabFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Three ways agents fail \u2192"
      backTitle="Agent Failure Modes"
      frontContent={<FailureModesLab />}
      backContent={<FailureModesBack />}
    />
  );
}

export function HandoffChainFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why handoffs matter in multi-agent systems \u2192"
      backTitle="Multi-Agent Handoffs"
      frontContent={<HandoffChain />}
      backContent={<MultiAgentBack />}
    />
  );
}

import FlipCard from '../../ui/FlipCard';
import ProjectOrchestrator from './ProjectOrchestrator';
import ContextPacking from './ContextPacking';

const ACCENT = '#0F3460';

/* --- Key fact exports (used by CardActionBar facts panel) --- */
export const decompositionKeyFact = "Complex projects fail in one conversation because of context overflow, attention dilution, and error compounding. The fix: decompose into focused tasks with clear interfaces.";

export const contextPackingKeyFact = "Context packing is a Goldilocks problem. Too little and the AI hallucinates. Too much and it gets confused. The sweet spot: relevant, well-structured, with clear priorities.";

/* --- Back Content: The Master Skill — Decomposition --- */
export function DecompositionBack() {
  const breakdowns = [
    {
      name: 'Context overflow',
      color: '#0F3460',
      desc: 'Too much information for one context window. The AI literally cannot hold your entire project in its head at once.',
    },
    {
      name: 'Attention dilution',
      color: '#0EA5E9',
      desc: 'When you ask for ten things at once, the AI spreads its attention thin. Each task gets a fraction of the quality it would get alone.',
    },
    {
      name: 'Error compounding',
      color: '#E94560',
      desc: 'One small mistake early on cascades through everything that follows. A wrong assumption in step 2 poisons steps 3 through 10.',
    },
  ];

  return (
    <div>
      <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        Three ways complexity breaks the one-prompt approach:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {breakdowns.map((item) => (
          <div key={item.name}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
              <div style={{
                flexShrink: 0, width: '10px', height: '10px', borderRadius: '50%',
                background: item.color,
              }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: item.color, fontSize: '0.9rem' }}>
                {item.name}
              </span>
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.85rem', opacity: 0.75, color: 'var(--color-deep)', paddingLeft: '1.25rem' }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '1.25rem', padding: '0.75rem 1rem',
        background: `${ACCENT}08`, borderRadius: '10px',
        borderLeft: `3px solid ${ACCENT}`,
      }}>
        <p style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: ACCENT, fontSize: '0.85rem' }}>
          The fix: break work into single-responsibility tasks.
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.85rem', opacity: 0.75, color: 'var(--color-deep)' }}>
          Each task needs: clear inputs, clear outputs, minimal dependencies. One conversation, one job. The output of one becomes the input of the next.
        </p>
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-subtle)' }}>
        Decomposition is a human skill, not an AI skill. The AI can help you brainstorm the breakdown, but deciding what matters and in what order — that's on you.
      </p>
    </div>
  );
}

/* --- Back Content: The Art of Context Packing --- */
export function ContextPackingBack() {
  const strategies = [
    { label: 'Use headers', desc: 'Structure context with clear section headers so the AI knows what each piece is for.' },
    { label: 'Bullet points', desc: 'Dense lists beat prose for packing information. Save narrative for the actual task.' },
    { label: 'Explicit labels', desc: 'Tag each chunk: "BACKGROUND:", "CONSTRAINTS:", "EXAMPLES:". Remove all ambiguity about purpose.' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        Context packing is like packing a suitcase with limited space. You can't bring everything, so you need to bring the <strong>right</strong> things.
      </p>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        margin: '1rem 0', padding: '0.75rem 1rem',
        background: `${ACCENT}08`, borderRadius: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 800,
            color: 'white', background: '#E94560',
          }}>
            !
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)', opacity: 0.75 }}>
            Too little context — hallucinations and guessing
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 800,
            color: 'white', background: '#F5A623',
          }}>
            ~
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)', opacity: 0.75 }}>
            Too much context — confusion and ignored details
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 800,
            color: 'white', background: '#16C79A',
          }}>
            *
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)', opacity: 0.75 }}>
            The sweet spot — relevant, well-structured, with clear priorities
          </span>
        </div>
      </div>

      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: ACCENT, fontSize: '0.85rem' }}>
        Strategies for packing well:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem' }}>
        {strategies.map((s) => (
          <p key={s.label} style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)' }}>
            <strong style={{ fontFamily: 'var(--font-heading)', color: ACCENT }}>{s.label}:</strong>{' '}
            <span style={{ opacity: 0.75 }}>{s.desc}</span>
          </p>
        ))}
      </div>

      <div style={{
        marginTop: '1.25rem',
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem',
        fontStyle: 'italic', opacity: 0.85,
        fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)',
      }}>
        Version control for AI work: track what prompts worked, compare output versions, maintain a decision trail. Your future self will thank you.
      </div>
    </div>
  );
}

/* ===============================================
   EXPORTED FLIP CARD WRAPPERS
   =============================================== */

export function ProjectOrchestratorFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why one-prompt projects fail \u2192"
      backTitle="Decomposition: The Master Skill"
      frontContent={<ProjectOrchestrator />}
      backContent={<DecompositionBack />}
    />
  );
}

export function ContextPackingFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="The art of packing context \u2192"
      backTitle="Context Packing"
      frontContent={<ContextPacking />}
      backContent={<ContextPackingBack />}
    />
  );
}

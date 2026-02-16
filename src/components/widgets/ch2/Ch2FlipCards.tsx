import FlipCard from '../../ui/FlipCard';
import PromptLaboratory from './PromptLaboratory';
import FlipTheScript from './FlipTheScript';
import DebugThePrompt from './DebugThePrompt';

const ACCENT = '#0F3460';

/* ─── Key fact exports (used by CardActionBar facts panel) ─── */
export const socraticKeyFact = "Instead of asking the AI for an answer, ask it to interview you. One technique — flipping who asks the questions — produces dramatically better results than any amount of prompt tweaking.";

export const techniqueMixKeyFact = "Over-prompting is real. A 500-word prompt for a simple question can confuse the AI. Match your prompt complexity to the task complexity.";

/* ─── Back Content: The Socratic Flip ─── */
export function SocraticFlipBack() {
  return (
    <div>
      <p style={{ marginBottom: '1rem' }}>
        Most people use AI like a vending machine. Insert prompt, get answer. But the best results come from flipping the script entirely.
      </p>

      <div style={{
        background: '#6B728010', border: '1px solid #6B728020', borderRadius: '8px',
        padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
        color: '#6B7280', marginBottom: '1rem',
      }}>
        "I want to plan a birthday party"
      </div>

      <p style={{ marginBottom: '1rem' }}>
        That prompt gets you a generic party plan. But try this instead:
      </p>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        lineHeight: 1.7, marginBottom: '1rem',
      }}>
        "I want to plan a birthday party. Before you start planning, ask me 5 specific questions that will help you give me a much better plan."
      </div>

      <p style={{ marginBottom: '1rem' }}>
        Now the AI asks: <em>How many people? Indoor or outdoor? Budget? Theme preferences? Age group?</em> After you answer, the plan it produces is dramatically better — because it actually knows what you need.
      </p>

      <p style={{ margin: 0 }}>
        This is the <strong>Socratic flip.</strong> Instead of treating AI as an answer machine, you turn it into a <strong>thinking partner</strong> that helps you figure out what you actually want.
      </p>
    </div>
  );
}

/* ─── Back Content: Combining Techniques ─── */
export function TechniqueMixBack() {
  const levels = [
    { label: 'Casual brainstorm', techniques: 'Task only', color: '#16C79A', desc: '"Give me 10 ideas for a science project"' },
    { label: 'School assignment', techniques: 'Role + Task + Format', color: '#F5A623', desc: '"You are an AP Bio tutor. Explain mitosis in 3 bullet points."' },
    { label: 'Important project', techniques: 'Role + Context + Task + Format + Examples', color: ACCENT, desc: 'Detailed prompt with background info and sample outputs' },
    { label: 'High-stakes', techniques: 'All techniques + chain-of-thought', color: '#E94560', desc: 'System role, few-shot examples, step-by-step reasoning, constraints' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        Real power comes from combining techniques: few-shot + chain-of-thought, role + constraints + format. But <strong>more isn't always better.</strong>
      </p>

      <p style={{ marginBottom: '1rem', fontStyle: 'italic', opacity: 0.85 }}>
        Match your prompt complexity to the task complexity:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {levels.map((level) => (
          <div key={level.label} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '10px', height: '10px', borderRadius: '50%',
              background: level.color, marginTop: '6px',
            }} />
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: level.color, fontSize: '0.85rem' }}>
                {level.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-subtle)', marginLeft: '0.5rem' }}>
                ({level.techniques})
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
                {level.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem',
        fontStyle: 'italic', opacity: 0.85,
      }}>
        A 500-word prompt for "what's the capital of France?" doesn't make the answer better. It makes it worse. The AI gets confused by all the noise and overthinks a simple question.
      </div>
    </div>
  );
}

/* ─── Back Content: The Five Prompt Bugs ─── */
export function PromptBugsBack() {
  const bugs = [
    { name: 'Ambiguous', color: '#F5A623', text: 'The prompt can be read two different ways. "Make it better" — better how? More formal? Shorter? More accurate?' },
    { name: 'Contradictory', color: '#E94560', text: '"Write a concise 2,000-word essay." The AI can\'t satisfy both constraints, so it picks one and ignores the other.' },
    { name: 'Missing context', color: '#7B61FF', text: 'You know the background. The AI doesn\'t. "Fix the bug in my code" without sharing the code is like calling a mechanic and saying "my car is broken."' },
    { name: 'Too many tasks', color: '#16C79A', text: '"Research climate change, write a paper, create citations, and suggest counterarguments." That\'s four prompts crammed into one.' },
    { name: 'Leading question', color: ACCENT, text: '"Don\'t you think React is the best framework?" You\'ve told the AI what answer you want. It will usually agree — even if it shouldn\'t.' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '1rem' }}>
        When the AI gives you a bad response, your first instinct is to blame the AI. But most of the time, <strong>the prompt has a bug.</strong> Here are the five most common ones:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
        {bugs.map((bug) => (
          <div key={bug.name} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '10px', height: '10px', borderRadius: '50%',
              background: bug.color, marginTop: '6px',
            }} />
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: bug.color, fontSize: '0.85rem' }}>
                {bug.name}:
              </span>{' '}
              <span style={{ opacity: 0.75, fontSize: '0.9rem' }}>{bug.text}</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ margin: 0 }}>
        The most insidious is the <strong style={{ color: ACCENT }}>leading question</strong>. You don't even realize you're doing it — and the AI is trained to be agreeable. If you frame a question with a built-in answer, you'll almost always get that answer back, whether it's right or not.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EXPORTED FLIP CARD WRAPPERS
   ═══════════════════════════════════════════════ */

export function FlipTheScriptFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? The Socratic Flip →"
      backTitle="The Socratic Flip"
      frontContent={<FlipTheScript />}
      backContent={<SocraticFlipBack />}
    />
  );
}

export function PromptLaboratoryFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? Combining Techniques →"
      backTitle="Combining Techniques"
      frontContent={<PromptLaboratory />}
      backContent={<TechniqueMixBack />}
    />
  );
}

export function DebugThePromptFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? The Five Prompt Bugs →"
      backTitle="The Five Prompt Bugs"
      frontContent={<DebugThePrompt />}
      backContent={<PromptBugsBack />}
    />
  );
}

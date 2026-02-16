import FlipCard from '../../ui/FlipCard';
import PromptMakeover from './PromptMakeover';
import GuessThePrompt from './GuessThePrompt';
import IterationLoop from './IterationLoop';
import PromptRoast from './PromptRoast';

const ACCENT = '#E94560';

/* ─── Key fact exports (used by CardActionBar facts panel) ─── */
export const buildingBlocksKeyFact = "You don't need all five every time. But when the AI gives you garbage, look at what's missing. It's almost always one of these five.";

export const iterationKeyFact = "The average good result takes 3–5 iterations, not 1. If you're nailing it on the first try, you're probably not pushing hard enough.";

/* ─── Back Content: The Five Building Blocks ─── */
export function BuildingBlocksBack() {
  const blocks = [
    { letter: 'R', name: 'Role', color: '#E94560', text: 'Who should the AI be? A tutor explains. A professor lectures. A friend riffs.' },
    { letter: 'T', name: 'Task', color: '#0F3460', text: 'What exactly should it do? Be ruthlessly specific. One task per prompt beats three.' },
    { letter: 'F', name: 'Format', color: '#7B61FF', text: 'How should the response look? "Give me 3 alternatives" or "as a bulleted list" prevents rambling.' },
    { letter: 'C', name: 'Constraints', color: '#16C79A', text: 'What should it not do? Guardrails that prevent unhelpful tangents.' },
    { letter: 'E', name: 'Examples', color: '#F5A623', text: "Show, don't tell. One example of 'good' is worth a hundred words of description." },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        Every good prompt is built from the same five pieces. You don't always need all five — but knowing they exist is like knowing the parts of a sentence.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {blocks.map((block) => (
          <div key={block.letter} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800,
              color: 'white', background: block.color,
            }}>
              {block.letter}
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: block.color, fontSize: '0.85rem' }}>
                {block.name}:
              </span>{' '}
              <span style={{ opacity: 0.75 }}>{block.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Back Content: The Vague Prompt Problem ─── */
export function VaguePromptBack() {
  return (
    <div>
      <p style={{ marginBottom: '1rem' }}>
        Here's a prompt most people would type without thinking:
      </p>

      <div style={{
        background: '#6B728010', border: '1px solid #6B728020', borderRadius: '8px',
        padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
        color: '#6B7280', marginBottom: '1rem',
      }}>
        "help me with my essay"
      </div>

      <p style={{ marginBottom: '1rem' }}>
        What do you get back? A generic, wishy-washy response. The AI isn't being lazy. <strong>You gave it nothing to work with.</strong>
      </p>

      <p style={{ marginBottom: '1rem' }}>
        Now watch what happens when you get specific:
      </p>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        lineHeight: 1.7, marginBottom: '1rem',
      }}>
        "You are an AP English tutor. Help me strengthen the thesis statement of my argumentative essay about social media's effect on teen mental health. My current thesis is: 'Social media is bad for teens.' Give me 3 stronger alternatives that are specific and debatable."
      </div>

      <p style={{ margin: 0 }}>
        <em>That</em> gets you something useful. Same AI, wildly different result. The difference? Not intelligence. <strong>Structure.</strong>
      </p>
    </div>
  );
}

/* ─── Back Content: Iteration, Not Perfection ─── */
export function IterationBack() {
  const steps = [
    { word: 'Prompt.', desc: 'Write your best first attempt.' },
    { word: 'Evaluate.', desc: "Read the response. What's good? What's off?" },
    { word: 'Refine.', desc: 'Adjust the prompt. Be more specific where it failed.' },
    { word: 'Repeat.', desc: "Until the output is something you'd actually use." },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        Here's the thing nobody tells you: <strong>the first prompt almost never works.</strong> And that's fine. That's the whole point.
      </p>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem', marginBottom: '1rem',
        fontStyle: 'italic', opacity: 0.85,
      }}>
        Amazing AI demos show the final prompt — after five, ten, maybe twenty rounds of refinement. You're seeing the highlight reel, not the practice sessions.
      </div>

      <p style={{ marginBottom: '0.5rem' }}>The real workflow:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem' }}>
        {steps.map((step) => (
          <p key={step.word} style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong style={{ color: ACCENT, fontFamily: 'var(--font-heading)' }}>{step.word}</strong>
            <span style={{ opacity: 0.7 }}> {step.desc}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── Back Content: The Prompt Spectrum ─── */
export function SpectrumBack() {
  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        Think of every prompt on a spectrum from vague to precise:
      </p>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-subtle)', opacity: 0.6 }}>VAGUE</span>
          <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, #CBD5E1 0%, #F5A623 40%, #E94560 70%, #16C79A 100%)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-subtle)', opacity: 0.6 }}>PRECISE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' as const }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-subtle)', margin: '0 0 2px' }}>"help me"</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-subtle)', opacity: 0.5, margin: 0 }}>generic</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#F5A623', margin: '0 0 2px' }}>"write about X"</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-subtle)', opacity: 0.5, margin: 0 }}>unfocused</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: ACCENT, fontWeight: 600, margin: '0 0 2px' }}>"R + T + F + C + E"</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-subtle)', opacity: 0.5, margin: 0 }}>targeted</p>
          </div>
        </div>
      </div>

      <p style={{ marginBottom: '1rem' }}>
        Your goal isn't to always be at the "precise" end. A casual brainstorm can be vague on purpose. But <strong>you should be choosing where you are on the spectrum intentionally</strong>, not landing there by accident.
      </p>

      <p style={{ margin: 0 }}>
        The people who get the most out of AI aren't the ones who memorize magic prompts. They're the ones who've developed an instinct for <em>how specific to be</em> — and who know how to slide toward precision when the first response isn't good enough.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EXPORTED FLIP CARD WRAPPERS
   ═══════════════════════════════════════════════ */

export function PromptMakeoverFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? The Five Building Blocks →"
      backTitle="The Five Building Blocks"
      frontContent={<PromptMakeover />}
      backContent={<BuildingBlocksBack />}
    />
  );
}

export function GuessThePromptFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? The Vague Prompt Problem →"
      backTitle="The Vague Prompt Problem"
      frontContent={<GuessThePrompt />}
      backContent={<VaguePromptBack />}
    />
  );
}

export function IterationLoopFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? Iteration, Not Perfection →"
      backTitle="Iteration, Not Perfection"
      frontContent={<IterationLoop />}
      backContent={<IterationBack />}
    />
  );
}

export function PromptRoastFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? The Prompt Spectrum →"
      backTitle="The Prompt Spectrum"
      frontContent={<PromptRoast />}
      backContent={<SpectrumBack />}
    />
  );
}

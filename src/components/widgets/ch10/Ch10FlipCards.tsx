import FlipCard from '../../ui/FlipCard';
import SkillsSpectrum from './SkillsSpectrum';
import JobTransformer from './JobTransformer';
import TasteTest from './TasteTest';
import FirstPrinciplesLab from './FirstPrinciplesLab';

const ACCENT = '#16C79A';

/* ─── Key fact exports (used by CardActionBar facts panel) ─── */
export const spectrumKeyFact = "Jobs don't disappear — they shape-shift. Some tasks become AI-handled, some AI-assisted, and some stay fully human. The most interesting zone is the middle.";

export const jobShiftKeyFact = "When ATMs arrived, the number of bank tellers actually increased — the job changed, not disappeared. The same pattern plays out with AI across every industry.";

/* ─── Back Content: The Spectrum, Not the Cliff ─── */
export function SpectrumBack() {
  const skills = [
    { name: 'Judgment', text: 'Weighing tradeoffs with incomplete information' },
    { name: 'Empathy', text: 'Understanding what someone needs emotionally' },
    { name: 'Vision', text: 'Deciding what to build and why' },
    { name: 'Leadership', text: 'Motivating and coordinating people' },
    { name: 'Original questions', text: 'Asking what nobody has asked before' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        Reality isn't binary — "replaced" vs. "safe." It's a <strong>spectrum.</strong> Some tasks are almost fully automatable. Some are enhanced by AI. Some are untouched entirely.
      </p>

      <div style={{
        marginBottom: '1.25rem', padding: '1rem',
        background: `${ACCENT}08`, borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-subtle)', opacity: 0.6 }}>AI HANDLES</span>
          <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: `linear-gradient(90deg, ${ACCENT} 0%, #F5A623 50%, #E94560 100%)` }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-subtle)', opacity: 0.6 }}>FULLY HUMAN</span>
        </div>
        <p style={{ textAlign: 'center' as const, fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--color-subtle)', margin: 0 }}>
          The most interesting ones fall in the middle — AI-assisted
        </p>
      </div>

      <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        Five irreplaceable human skills:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {skills.map((skill) => (
          <div key={skill.name} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '8px', height: '8px', borderRadius: '50%',
              background: ACCENT, marginTop: '0.4rem',
            }} />
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: ACCENT, fontSize: '0.85rem' }}>
                {skill.name}:
              </span>{' '}
              <span style={{ opacity: 0.75 }}>{skill.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Back Content: Jobs Don't Disappear, They Shape-Shift ─── */
export function JobShiftBack() {
  const tasks = [
    { name: 'Write narrative & dialogue', pct: 70, color: ACCENT, text: 'AI drafts quickly, but voice, humor, and emotional beats need a human author' },
    { name: 'Balance game mechanics', pct: 30, color: '#F5A623', text: 'Intuition for "fun" is deeply human' },
    { name: 'Create concept art', pct: 80, color: ACCENT, text: 'AI generates options fast, but art direction and style coherence need human taste' },
    { name: 'Set creative vision', pct: 10, color: '#E94560', text: 'What the game IS, who it\'s for, why it matters — that\'s all you' },
  ];

  return (
    <div>
      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem', marginBottom: '1rem',
        fontStyle: 'italic', opacity: 0.85,
      }}>
        When ATMs arrived, the number of bank tellers actually <strong>increased</strong> — the job changed, not disappeared. The same pattern plays out with AI.
      </div>

      <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        Game Designer — task breakdown:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {tasks.map((task) => (
          <div key={task.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-deep)' }}>
                {task.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: task.color, fontWeight: 600 }}>
                {task.pct}% AI-assisted
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: '#6B728015' }}>
              <div style={{ width: `${task.pct}%`, height: '100%', borderRadius: '2px', background: task.color }} />
            </div>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', opacity: 0.6 }}>{task.text}</p>
          </div>
        ))}
      </div>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7,
      }}>
        X% of tasks are AI-assisted. <strong>0% are eliminated.</strong> The job shape-shifts.
      </div>
    </div>
  );
}

/* ─── Back Content: Taste — The Irreplaceable Skill ─── */
export function TasteBack() {
  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        When generating options is nearly free, <strong>choosing the right one</strong> becomes the most valuable skill you can have.
      </p>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem', marginBottom: '1rem',
        fontStyle: 'italic', opacity: 0.85,
      }}>
        AI can generate 50 logo options in minutes. Which one is <em>right?</em> That's taste.
      </div>

      <p style={{ marginBottom: '0.75rem' }}>
        Taste isn't a mystical gift. It's trained by <strong>exposure, not memorization.</strong> You develop taste by:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { word: 'Seeing.', desc: 'Lots of good and bad work — developing pattern recognition for quality.' },
          { word: 'Making.', desc: 'Producing your own work, failing, learning what falls flat and what sings.' },
          { word: 'Caring.', desc: 'Noticing the difference between "fine" and "great" — and insisting on great.' },
        ].map((step) => (
          <p key={step.word} style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong style={{ color: ACCENT, fontFamily: 'var(--font-heading)' }}>{step.word}</strong>
            <span style={{ opacity: 0.7 }}> {step.desc}</span>
          </p>
        ))}
      </div>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7,
      }}>
        In a world of infinite generation, <strong>curation is the superpower.</strong> The human who can look at ten options and pick the right one is the one who ships great work.
      </div>
    </div>
  );
}

/* ─── Back Content: Your Knowledge Is Your BS Detector ─── */
export function FirstPrinciplesBack() {
  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        AI remixes what exists. First principles thinking <strong>reasons from ground truth.</strong> These are fundamentally different abilities.
      </p>

      <div style={{
        background: '#6B728010', border: '1px solid #6B728020', borderRadius: '8px',
        padding: '1rem', marginBottom: '1rem',
      }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-deep)', margin: '0 0 0.5rem' }}>
          Example:
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-subtle)', margin: '0 0 0.5rem' }}>
          "If you double the radius of a pipe, how much more water flows through?"
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: '#E9456010', border: '1px solid #E9456030' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: '#E94560', margin: '0 0 0.25rem' }}>AI says:</p>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>"2x more water" <span style={{ color: '#E94560', fontWeight: 600 }}>(wrong)</span></p>
          </div>
          <div style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: `${ACCENT}10`, border: `1px solid ${ACCENT}30` }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: ACCENT, margin: '0 0 0.25rem' }}>Physics says:</p>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>"16x more water" <span style={{ color: ACCENT, fontWeight: 600 }}>(correct)</span></p>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-subtle)', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
          Area scales with r^2, flow scales even faster (Hagen-Poiseuille: r^4).
        </p>
      </div>

      <p style={{ marginBottom: '0.75rem' }}>
        You can only catch AI mistakes in domains where you have <strong>fundamental understanding.</strong> Without it, a confidently wrong answer looks identical to a correct one.
      </p>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7,
      }}>
        Your knowledge isn't obsolete because AI exists. It's <strong>more valuable</strong> — it's what lets you verify. Your knowledge is your BS detector.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EXPORTED FLIP CARD WRAPPERS
   ═══════════════════════════════════════════════ */

export function SkillsSpectrumFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? The Spectrum, Not the Cliff →"
      backTitle="The Spectrum, Not the Cliff"
      frontContent={<SkillsSpectrum />}
      backContent={<SpectrumBack />}
    />
  );
}

export function JobTransformerFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? Jobs Shape-Shift →"
      backTitle="Jobs Don't Disappear, They Shape-Shift"
      frontContent={<JobTransformer />}
      backContent={<JobShiftBack />}
    />
  );
}

export function TasteTestFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? Taste Is the Skill →"
      backTitle="Taste: The Irreplaceable Skill"
      frontContent={<TasteTest />}
      backContent={<TasteBack />}
    />
  );
}

export function FirstPrinciplesLabFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? Your BS Detector →"
      backTitle="Your Knowledge Is Your BS Detector"
      frontContent={<FirstPrinciplesLab />}
      backContent={<FirstPrinciplesBack />}
    />
  );
}

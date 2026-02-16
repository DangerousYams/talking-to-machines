import FlipCard from '../../ui/FlipCard';
import TerminalPlayground from './TerminalPlayground';
import SkillBuilder from './SkillBuilder';
import RefactorRace from './RefactorRace';

const ACCENT = '#7B61FF';

/* ─── Key fact exports (used by CardActionBar facts panel) ─── */
export const claudeCodeKeyFact = "Claude Code follows a loop: Read your codebase → Plan changes → Write code → Run it → Fix errors. CLAUDE.md is the permanent instruction set that shapes every interaction.";

export const skillsKeyFact = "A skill has three parts: Trigger (when to activate), Steps (what to do), Examples (what good looks like). One skill definition replaces hundreds of repeated explanations.";

/* ─── Back Content: How Claude Code Thinks ─── */
export function ClaudeCodeBack() {
  const loopSteps = [
    { icon: 'R', name: 'Read', color: '#7B61FF', text: 'Scans your files, understands your architecture, reads CLAUDE.md for project rules.' },
    { icon: 'P', name: 'Plan', color: '#0F3460', text: 'Breaks the task into steps, decides which files to touch and in what order.' },
    { icon: 'W', name: 'Write', color: '#16C79A', text: 'Generates code across multiple files — not snippets, but coherent, connected changes.' },
    { icon: 'X', name: 'Run', color: '#F5A623', text: 'Executes the code, runs tests, checks for errors. If something breaks, loops back to fix it.' },
    { icon: 'F', name: 'Fix', color: '#E94560', text: 'Reads the error, diagnoses the cause, writes a patch, and runs again. Automatically.' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        Claude Code isn't a chatbot that writes code. It's an <strong>agentic loop</strong> — a system that reads, plans, writes, runs, and fixes, cycling until the task is done.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loopSteps.map((step) => (
          <div key={step.icon} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800,
              color: 'white', background: step.color,
            }}>
              {step.icon}
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: step.color, fontSize: '0.85rem' }}>
                {step.name}:
              </span>{' '}
              <span style={{ opacity: 0.75 }}>{step.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '1.25rem', background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7,
      }}>
        It sees your <strong>entire project</strong> — not just the file you're editing. And <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: ACCENT }}>CLAUDE.md</span> is your project's constitution: permanent instructions that shape every interaction. Think of it as the system prompt for your codebase.
      </div>
    </div>
  );
}

/* ─── Back Content: Building Skills (T-S-E Framework) ─── */
export function SkillsBack() {
  const parts = [
    {
      letter: 'T',
      name: 'Trigger',
      color: '#7B61FF',
      text: 'When should this skill activate? e.g., "when asked to create a React component"',
    },
    {
      letter: 'S',
      name: 'Steps',
      color: '#16C79A',
      text: 'What should it do? A numbered list of specific actions, in order.',
    },
    {
      letter: 'E',
      name: 'Examples',
      color: '#F5A623',
      text: 'What does good output look like? Concrete input/output pairs that anchor quality.',
    },
  ];

  const templates = ['React Component Generator', 'Test Writer', 'Documentation Generator'];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        A skill is a reusable instruction set — a recipe that tells Claude Code <em>exactly</em> how to handle a category of task. Every skill follows the <strong>T-S-E framework</strong>:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
        {parts.map((part) => (
          <div key={part.letter} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800,
              color: 'white', background: part.color,
            }}>
              {part.letter}
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: part.color, fontSize: '0.85rem' }}>
                {part.name}:
              </span>{' '}
              <span style={{ opacity: 0.75 }}>{part.text}</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        Pre-loaded templates to start from:
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', marginBottom: '1rem' }}>
        {templates.map((t) => (
          <span key={t} style={{
            display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: '6px',
            background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`,
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: ACCENT,
          }}>
            {t}
          </span>
        ))}
      </div>

      <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.8 }}>
        One skill definition replaces hundreds of repeated explanations. Write it once, use it forever.
      </p>
    </div>
  );
}

/* ─── Back Content: The Skill Paradox ─── */
export function SkillParadoxBack() {
  const workflow = [
    { word: 'Specify.', desc: 'Be ruthlessly clear about what you want. Ambiguity is the enemy.' },
    { word: 'Generate.', desc: 'Let Claude Code do the typing. It handles the boilerplate, the syntax, the wiring.' },
    { word: 'Verify.', desc: 'Read, test, and judge the result. This is where your knowledge matters most.' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        Here's the paradox nobody warns you about: <strong>AI makes coding faster, but it doesn't eliminate the need to understand code.</strong>
      </p>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem', marginBottom: '1rem',
        fontStyle: 'italic', opacity: 0.85,
      }}>
        The tool is only as good as the human steering it. If you can't read what Claude generates, you can't tell the difference between working code and plausible-looking nonsense.
      </div>

      <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        The fundamental workflow:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem', marginBottom: '1.25rem' }}>
        {workflow.map((step) => (
          <p key={step.word} style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong style={{ color: ACCENT, fontFamily: 'var(--font-heading)' }}>{step.word}</strong>
            <span style={{ opacity: 0.7 }}> {step.desc}</span>
          </p>
        ))}
      </div>

      <p style={{ marginBottom: '1rem' }}>
        You need enough knowledge to <strong>evaluate output</strong>, not to write every line. That's the skill paradox — AI lowers the floor for producing code, but raises the bar for judging it.
      </p>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7,
      }}>
        The people who thrive with AI coding tools aren't the ones who type the least. They're the ones who <strong>think the most clearly</strong> about what needs to exist — and can tell when the output is right.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EXPORTED FLIP CARD WRAPPERS
   ═══════════════════════════════════════════════ */

export function TerminalPlaygroundFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? How Claude Code Thinks →"
      backTitle="How Claude Code Thinks"
      frontContent={<TerminalPlayground />}
      backContent={<ClaudeCodeBack />}
    />
  );
}

export function SkillBuilderFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? Building Skills →"
      backTitle="Building Skills (T-S-E Framework)"
      frontContent={<SkillBuilder />}
      backContent={<SkillsBack />}
    />
  );
}

export function RefactorRaceFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why did that work? The Skill Paradox →"
      backTitle="The Skill Paradox"
      frontContent={<RefactorRace />}
      backContent={<SkillParadoxBack />}
    />
  );
}

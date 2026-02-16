import FlipCard from '../../ui/FlipCard';
import ProjectPlanner from './ProjectPlanner';
import ShowcaseGallery from './ShowcaseGallery';

const ACCENT = '#16C79A';

/* ─── Key fact exports (used by CardActionBar facts panel) ─── */
export const projectPlanningKeyFact = "The best projects start with a plan, not a prompt. Choose a track, scope it small enough to finish, decompose into steps, then build and ship.";

/* ─── Back Content: Plan Before You Build ─── */
export function ProjectPlanningBack() {
  const tracks = [
    { name: 'Game Maker', desc: 'Build a game with AI-generated assets and mechanics' },
    { name: 'Storyteller', desc: 'Create an interactive narrative or multimedia piece' },
    { name: 'Investigator', desc: 'Research a topic deeply using AI research tools' },
    { name: 'Tool Builder', desc: 'Build an app or tool powered by AI' },
    { name: 'Agent Designer', desc: 'Design and deploy an AI agent' },
  ];

  const steps = [
    { word: 'Choose.', desc: 'Pick the track that excites you most.' },
    { word: 'Scope.', desc: 'Define what "done" looks like in 1–3 weeks.' },
    { word: 'Decompose.', desc: 'Break it into tasks small enough to finish in one sitting.' },
    { word: 'Build.', desc: 'Use every technique from this curriculum. Iterate relentlessly.' },
    { word: 'Ship.', desc: 'Share it. A finished project beats a perfect idea every time.' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        Before you touch a prompt, choose your track. Each one leads to a different kind of project — and uses different skills from the curriculum.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {tracks.map((track) => (
          <div key={track.name} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: 8, height: 8, borderRadius: '50%',
              background: ACCENT, marginTop: 7,
            }} />
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: ACCENT, fontSize: '0.85rem' }}>
                {track.name}
              </span>
              <span style={{ opacity: 0.75 }}> — {track.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-deep)', fontSize: '0.9rem' }}>
        The planning process:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
        {steps.map((step) => (
          <p key={step.word} style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong style={{ color: ACCENT, fontFamily: 'var(--font-heading)' }}>{step.word}</strong>
            <span style={{ opacity: 0.7 }}> {step.desc}</span>
          </p>
        ))}
      </div>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem',
        fontStyle: 'italic', opacity: 0.85,
      }}>
        Keep it small enough to finish. A complete small project beats an ambitious unfinished one every time.
      </div>
    </div>
  );
}

/* ─── Back Content: Shipping Is a Skill ─── */
export function ShippingBack() {
  const shareItems = [
    { num: '1', text: 'What you built and why' },
    { num: '2', text: 'The prompts and techniques that worked' },
    { num: '3', text: 'What you\'d do differently next time' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-deep)', fontSize: '0.95rem' }}>
        Shipping is a skill.
      </p>

      <p style={{ marginBottom: '1rem' }}>
        The portfolio mindset: <strong>what you've made</strong> will always matter more than what you've memorized. In a world where everyone has access to the same AI, the people who stand out are the ones who actually build things.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{
          background: `${ACCENT}08`, borderRadius: 8, padding: '0.75rem 1rem',
          fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6,
        }}>
          <strong style={{ color: ACCENT }}>Done {'>'} perfect.</strong>
          <span style={{ opacity: 0.75 }}> Version 1 is never final. Ship it, learn from it, make version 2.</span>
        </div>
        <div style={{
          background: `${ACCENT}08`, borderRadius: 8, padding: '0.75rem 1rem',
          fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6,
        }}>
          <strong style={{ color: ACCENT }}>Projects {'>'} certificates.</strong>
          <span style={{ opacity: 0.75 }}> Nobody asks for your "AI course completion badge." They ask what you've built.</span>
        </div>
        <div style={{
          background: `${ACCENT}08`, borderRadius: 8, padding: '0.75rem 1rem',
          fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6,
        }}>
          <strong style={{ color: ACCENT }}>A finished project teaches you more than ten tutorials.</strong>
          <span style={{ opacity: 0.75 }}> Tutorials are safe. Projects are where learning actually happens.</span>
        </div>
      </div>

      <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-deep)', fontSize: '0.9rem' }}>
        Three things to include when sharing your work:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.5rem', marginBottom: '1.25rem' }}>
        {shareItems.map((item) => (
          <div key={item.num} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
              color: 'white', background: ACCENT,
            }}>
              {item.num}
            </div>
            <span style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.6, paddingTop: 1 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem',
        fontStyle: 'italic', opacity: 0.85,
        lineHeight: 1.7,
      }}>
        You have the knowledge. You have the skills. You have the tools. The only thing left? <strong style={{ fontStyle: 'normal' }}>Build it.</strong>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EXPORTED FLIP CARD WRAPPERS
   ═══════════════════════════════════════════════ */

export function ProjectPlannerFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why does planning matter? Plan Before You Build →"
      backTitle="Plan Before You Build"
      frontContent={<ProjectPlanner />}
      backContent={<ProjectPlanningBack />}
    />
  );
}

export function ShowcaseGalleryFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="Why does shipping matter? Shipping Is a Skill →"
      backTitle="Shipping Is a Skill"
      frontContent={<ShowcaseGallery />}
      backContent={<ShippingBack />}
    />
  );
}

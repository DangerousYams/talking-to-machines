import FlipCard from '../../ui/FlipCard';
import ToolWall from './ToolWall';
import WorkflowBuilder from './WorkflowBuilder';
import HeadToHead from './HeadToHead';

const ACCENT = '#0EA5E9';

/* --- Key fact exports (used by CardActionBar facts panel) --- */
export const toolLandscapeKeyFact = "The chatbot is the tip of the iceberg. AI has splintered into dozens of specialized tools across image, video, audio, research, and code.";

export const pipelinesKeyFact = "Tools become exponentially more powerful when chained. A pipeline of five tools, each doing what it does best, produces results no single tool can match.";

/* --- Back Content: The Eight Families of AI Tools --- */
export function ToolLandscapeBack() {
  const families = [
    { name: 'Image Generators', color: '#E94560', desc: 'Create images from text — photorealistic, artistic, abstract' },
    { name: 'Image Editors', color: '#F5A623', desc: 'Modify existing images — remove, replace, upscale, restyle' },
    { name: 'Video Creators', color: '#0EA5E9', desc: 'Generate video clips from text or images, edit footage' },
    { name: 'Music & Audio', color: '#7B61FF', desc: 'Compose songs, generate sound effects, clone and synthesize voices' },
    { name: 'Research Agents', color: '#16C79A', desc: 'Search, summarize, and synthesize information from the web and papers' },
    { name: 'AI Browsers', color: '#0F3460', desc: 'Browse the web autonomously, take actions on your behalf' },
    { name: 'Coding Tools', color: '#7B61FF', desc: 'Write, edit, debug, and deploy code from natural language' },
    { name: 'Chatbots & Assistants', color: '#6B7280', desc: 'General-purpose conversation, reasoning, writing, and analysis' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        AI isn't one thing. It's an ecosystem of specialized tools, each built to do one type of work really well. Here are the eight major families:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {families.map((family) => (
          <div key={family.name} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '10px', height: '10px', borderRadius: '50%',
              marginTop: '5px', background: family.color,
            }} />
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: family.color, fontSize: '0.85rem' }}>
                {family.name}:
              </span>{' '}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', opacity: 0.75, color: 'var(--color-deep)' }}>
                {family.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-subtle)' }}>
        Most people only ever use one family — chatbots. The rest of the landscape is wide open.
      </p>
    </div>
  );
}

/* --- Back Content: Choosing the Right Tool --- */
export function ChoosingToolsBack() {
  const steps = [
    { number: 1, question: 'What is the output?', detail: 'Text, image, video, audio, or code. Start here — it narrows the field immediately.' },
    { number: 2, question: 'What is the quality bar?', detail: 'A rough draft for brainstorming? Or a polished final product? Some tools are fast and loose, others are slow and precise.' },
    { number: 3, question: 'What is the budget?', detail: 'Free tools exist for almost everything. Paid tools are usually faster, higher quality, or more reliable. Know the tradeoffs.' },
    { number: 4, question: 'What is the workflow?', detail: 'Is this a standalone task or one step in a larger pipeline? Some tools integrate easily; others live in their own world.' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        With hundreds of tools available, the real skill isn't using them — it's <strong>choosing</strong> the right one. Four questions cut through the noise:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((step) => (
          <div key={step.number} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800,
              color: 'white', background: ACCENT,
            }}>
              {step.number}
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: ACCENT, fontSize: '0.9rem' }}>
                {step.question}
              </span>
              <p style={{ margin: '0.2rem 0 0', fontFamily: 'var(--font-body)', fontSize: '0.85rem', opacity: 0.75, color: 'var(--color-deep)' }}>
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-subtle)' }}>
        Answer these four and you'll almost always land on the right tool — or at least eliminate the wrong ones.
      </p>
    </div>
  );
}

/* --- Back Content: The Power of Chaining Tools --- */
export function PipelinesBack() {
  const pipelineSteps = [
    { tool: 'Perplexity', role: 'Research', color: '#16C79A' },
    { tool: 'Claude', role: 'Write', color: '#7B61FF' },
    { tool: 'Midjourney', role: 'Illustrate', color: '#E94560' },
    { tool: 'Canva', role: 'Layout', color: '#F5A623' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        The real power isn't in any single tool. It's in <strong>chaining them together</strong> — letting each tool do what it does best, then passing the result to the next.
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.25rem', flexWrap: 'wrap',
        margin: '1.25rem 0', padding: '1rem 0.5rem',
        background: `${ACCENT}08`, borderRadius: '10px',
      }}>
        {pipelineSteps.map((step, i) => (
          <div key={step.tool} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              padding: '0.5rem 0.75rem', background: 'white', borderRadius: '8px',
              border: `2px solid ${step.color}`,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: step.color }}>
                {step.tool}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-subtle)' }}>
                {step.role}
              </span>
            </div>
            {i < pipelineSteps.length - 1 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-subtle)', opacity: 0.5 }}>
                {'\u2192'}
              </span>
            )}
          </div>
        ))}
      </div>

      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        This pipeline — research, write, illustrate, layout — produces a polished blog post with custom visuals in a fraction of the time it would take doing everything manually.
      </p>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem', marginBottom: '0.5rem',
        fontStyle: 'italic', opacity: 0.85,
        fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)',
      }}>
        Tools become exponentially more powerful when you chain them together. A pipeline of five tools, each doing what it does best, produces results no single tool can match.
      </div>

      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-subtle)' }}>
        The human in the middle — choosing the tools, shaping the handoffs, judging the quality — is the orchestrator. That's you.
      </p>
    </div>
  );
}

/* ===============================================
   EXPORTED FLIP CARD WRAPPERS
   =============================================== */

export function ToolWallFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="The eight families of AI tools \u2192"
      backTitle="The AI Tool Landscape"
      frontContent={<ToolWall />}
      backContent={<ToolLandscapeBack />}
    />
  );
}

export function HeadToHeadFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="How to choose the right tool \u2192"
      backTitle="Choosing the Right Tool"
      frontContent={<HeadToHead />}
      backContent={<ChoosingToolsBack />}
    />
  );
}

export function WorkflowBuilderFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="The power of chaining tools \u2192"
      backTitle="Pipelines: Chaining Tools Together"
      frontContent={<WorkflowBuilder />}
      backContent={<PipelinesBack />}
    />
  );
}

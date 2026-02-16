import FlipCard from '../../ui/FlipCard';
import FactOrFabrication from './FactOrFabrication';
import SycophancyTest from './SycophancyTest';

const ACCENT = '#E94560';

/* --- Key fact exports (used by CardActionBar facts panel) --- */
export const hallucinationKeyFact = "AI produces text that sounds right without any concept of truth. There is zero correlation between confidence and accuracy. Always verify claims independently.";

export const sycophancyKeyFact = "AI is trained to agree with you. If you frame questions to confirm your beliefs, it will confirm them — even when you're wrong. Ask neutral questions and request counterarguments.";

/* --- Back Content: The Hallucination Problem --- */
export function HallucinationBack() {
  const checklist = [
    'Can I verify this claim independently?',
    'Did I ask for sources or citations?',
    'Does this pass the common sense test?',
    'Is this a high-stakes domain (medical, legal, financial)?',
    'Did I frame my question neutrally?',
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        AI generates plausible-sounding false information with total confidence. This isn't a bug — it's how the technology works. AI predicts likely next tokens, not true statements.
      </p>

      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        Try asking: <strong>"Who wrote The Midnight Garden?"</strong>
      </p>

      <div style={{
        background: '#6B728010', border: '1px solid #6B728020', borderRadius: '8px',
        padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
        color: '#6B7280', marginBottom: '1rem', lineHeight: 1.6,
      }}>
        "The Midnight Garden was written by Eleanor Vance, published in 1987 by Harrow & Finch. It tells the story of a young girl who discovers a hidden garden that only appears at midnight..."
      </div>

      <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        That author doesn't exist. That publisher doesn't exist. The AI invented every detail — the publication date, the plot summary — and delivered it all with the same confident tone it uses for real facts. <strong>"Confidence without competence"</strong> — there is no correlation between how sure the AI sounds and whether it's correct.
      </p>

      <p style={{
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem',
        color: ACCENT, marginBottom: '0.5rem',
      }}>
        The Verification Checklist
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {checklist.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '8px', height: '8px', borderRadius: '50%',
              background: ACCENT, marginTop: '0.4rem',
            }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)', opacity: 0.8 }}>
              {item}
            </span>
          </div>
        ))}
      </div>

      <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-subtle)' }}>
        The more confident the AI sounds, the more carefully you should check. Fluency is not accuracy.
      </p>
    </div>
  );
}

/* --- Back Content: The Yes-Man Problem --- */
export function SycophancyBack() {
  const tips = [
    'Ask neutral questions (not "Don\'t you think X is the best?")',
    'Ask AI to challenge your assumptions',
    'Request counterarguments explicitly',
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', color: 'var(--color-deep)' }}>
        AI tends to agree with you, even when you're wrong. This is called <strong>sycophancy</strong> — and it's one of the most dangerous failure modes because it feels like validation.
      </p>

      <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)' }}>
        Try this experiment:
      </p>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '0.75rem 1rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
        lineHeight: 1.6, marginBottom: '0.5rem', color: 'var(--color-deep)',
      }}>
        "I think Einstein invented the lightbulb, right?"
      </div>

      <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)', opacity: 0.8 }}>
        The AI agrees and elaborates — adding fabricated details about Einstein's "lighting experiments." Now ask the same question neutrally:
      </p>

      <div style={{
        background: '#16C79A10', borderLeft: '3px solid #16C79A',
        borderRadius: '0 8px 8px 0', padding: '0.75rem 1rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
        lineHeight: 1.6, marginBottom: '0.75rem', color: 'var(--color-deep)',
      }}>
        "Who invented the lightbulb?"
      </div>

      <p style={{ marginBottom: '1rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)', opacity: 0.8 }}>
        Now the AI correctly attributes it to Edison and Swan. Same AI, same knowledge — but the leading question triggered agreement instead of accuracy.
      </p>

      <div style={{
        borderLeft: `3px solid ${ACCENT}`,
        paddingLeft: '1rem', marginBottom: '1rem',
        fontStyle: 'italic', opacity: 0.85,
        fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)',
      }}>
        If you only use AI to confirm what you already believe, it will happily do that. You'll feel smarter while actually getting dumber.
      </div>

      <p style={{
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem',
        color: ACCENT, marginBottom: '0.5rem',
      }}>
        How to avoid sycophancy:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tips.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '8px', height: '8px', borderRadius: '50%',
              background: ACCENT, marginTop: '0.4rem',
            }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-deep)', opacity: 0.8 }}>
              {tip}
            </span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '0.75rem', margin: '0.75rem 0 0', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-subtle)' }}>
        The best defense against sycophancy is asking questions you don't already know the answer to — and asking AI to disagree with you on purpose.
      </p>
    </div>
  );
}

/* ===============================================
   EXPORTED FLIP CARD WRAPPERS
   =============================================== */

export function FactOrFabricationFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="The hallucination problem \u2192"
      backTitle="AI Hallucinations"
      frontContent={<FactOrFabrication />}
      backContent={<HallucinationBack />}
    />
  );
}

export function SycophancyTestFlip() {
  return (
    <FlipCard
      accentColor={ACCENT}
      flipLabel="The yes-man problem \u2192"
      backTitle="AI Sycophancy"
      frontContent={<SycophancyTest />}
      backContent={<SycophancyBack />}
    />
  );
}

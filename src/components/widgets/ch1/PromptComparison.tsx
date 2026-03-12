import { useState } from 'react';

const VAGUE_PROMPT = `"Help me with my essay"`;

const VAGUE_RESPONSE = `Sure! I'd be happy to help you with your essay. To get started, could you tell me:

1. What's the topic of your essay?
2. What type of essay is it (argumentative, narrative, etc.)?
3. What grade level is this for?
4. Do you have a draft already, or are you starting from scratch?

Once I know more about what you're working on, I can give you more specific guidance!`;

const GOOD_PROMPT = `"You are an AP English tutor. Help me strengthen the thesis statement of my argumentative essay about social media's effect on teen mental health. My current thesis is: 'Social media is bad for teens.' Give me 3 stronger alternatives that are specific and debatable. Format each as a single sentence followed by a one-line explanation of why it's stronger."`;

const GOOD_RESPONSE = `Here are three stronger thesis statements:

1. "The algorithmic design of social media platforms exploits adolescent reward-seeking behavior, making teens more vulnerable to anxiety and depression than any previous generation."
→ This is stronger because it names a specific mechanism (algorithms + reward-seeking) rather than a vague "bad," giving you something concrete to argue.

2. "While social media connects teens globally, the platforms' emphasis on curated self-presentation has fundamentally distorted how adolescents form their identities."
→ This acknowledges the counterargument (connection) before making a specific claim (identity distortion), which shows nuance and makes your essay more persuasive.

3. "Schools should require digital literacy curricula that teach students to recognize how social media manipulates attention, rather than banning phones outright."
→ This takes a clear policy position with a specific call to action, moving beyond description ("it's bad") into argumentation ("here's what we should do").`;

export default function PromptComparison({ accentColor }: { accentColor: string }) {
  const [revealed, setRevealed] = useState(false);

  const cardStyle = (isGood: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    overflow: 'hidden',
    border: isGood ? `1.5px solid ${accentColor}30` : '1.5px solid rgba(107, 114, 128, 0.15)',
    background: isGood ? '#FFFFFF' : '#FAFAFA',
    opacity: revealed ? 1 : (isGood ? 0.5 : 1),
    transition: 'opacity 0.5s ease, border-color 0.5s ease',
  });

  const promptHeaderStyle = (isGood: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: isGood ? accentColor : '#9CA3AF',
    background: isGood ? `${accentColor}08` : 'rgba(107, 114, 128, 0.04)',
    borderBottom: isGood ? `1px solid ${accentColor}15` : '1px solid rgba(107, 114, 128, 0.08)',
  });

  const promptTextStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    lineHeight: 1.65,
    color: '#1A1A2E',
    margin: 0,
    borderBottom: '1px solid rgba(0,0,0,0.04)',
  };

  const responseHeaderStyle = (isGood: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: isGood ? '#16C79A' : '#D1D5DB',
    background: isGood ? 'rgba(22, 199, 154, 0.04)' : 'rgba(0,0,0,0.02)',
  });

  const responseTextStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    lineHeight: 1.75,
    color: '#1A1A2E',
    margin: 0,
    whiteSpace: 'pre-wrap',
  };

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Vague prompt card */}
        <div style={cardStyle(false)}>
          <div style={promptHeaderStyle(false)}>Prompt</div>
          <p style={promptTextStyle}>{VAGUE_PROMPT}</p>
          <div style={responseHeaderStyle(false)}>AI Response</div>
          <p style={{ ...responseTextStyle, color: '#6B7280' }}>{VAGUE_RESPONSE}</p>
        </div>

        {/* Good prompt card */}
        <div style={cardStyle(true)}>
          <div style={promptHeaderStyle(true)}>Better Prompt</div>
          <p style={{ ...promptTextStyle, fontSize: '0.78rem' }}>{GOOD_PROMPT}</p>
          <div style={responseHeaderStyle(true)}>AI Response</div>
          <p style={responseTextStyle}>{GOOD_RESPONSE}</p>
        </div>
      </div>

      {!revealed && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setRevealed(true)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: accentColor,
              background: `${accentColor}0A`,
              border: `1.5px solid ${accentColor}25`,
              borderRadius: 100,
              padding: '10px 28px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${accentColor}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${accentColor}0A`;
            }}
          >
            Same AI. Compare the responses &rarr;
          </button>
        </div>
      )}

      {revealed && (
        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          fontStyle: 'italic',
          color: 'rgba(26, 26, 46, 0.5)',
          margin: 0,
        }}>
          Same AI, wildly different result. The difference? <strong style={{ color: '#1A1A2E', fontStyle: 'normal' }}>Structure.</strong>
        </p>
      )}
    </div>
  );
}

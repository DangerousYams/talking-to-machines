const ACCENT = '#7B61FF';

/* ─── Key fact exports (used by CardActionBar facts panel) ─── */
export const contextWindowKeyFact = "Every AI response is generated from scratch. The system re-sends the entire conversation each time. There is no persistent memory between turns.";

export const forgettingKeyFact = "Explicit reminders act as anchors. 'Important: the user is vegetarian. Do not forget this.' Sounds silly, but it works.";

/* ─── Back Content: The Context Window ─── */
export function ContextWindowBack() {
  return (
    <div>
      <p style={{ marginBottom: '1rem' }}>
        Here's the whiteboard metaphor, taken literally: every time you send a message, the system doesn't just send <em>that</em> message. It sends <strong>the entire conversation</strong> — from the very first message to your latest one — and the AI reads the whole thing fresh.
      </p>

      <p style={{ marginBottom: '1rem' }}>
        It doesn't "recall" what you said earlier. It re-reads it. Every. Single. Time.
      </p>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        lineHeight: 1.7, marginBottom: '1rem',
      }}>
        The context window is not memory. It's a whiteboard — and it has edges. Once the conversation grows past what fits on the whiteboard, the earliest messages get erased. The AI doesn't know they were ever there.
      </div>

      <p style={{ marginBottom: '1rem' }}>
        This means every response is based <strong>entirely</strong> on what's currently in the context window. If something important was said 50 messages ago but has since been pushed out, it's gone — as if it never happened.
      </p>

      <p style={{ margin: 0 }}>
        The implications are huge: the order of your messages matters. The length of your messages matters. What you choose to include — and leave out — shapes the response more than any clever wording ever could.
      </p>
    </div>
  );
}

/* ─── Back Content: Managing Context Overflow ─── */
export function ForgettingBack() {
  const strategies = [
    { num: '1', name: 'Summarize as you go', color: '#7B61FF', text: 'Every 10–15 messages, ask the AI to summarize the key decisions so far. Paste that summary into the next message. You just compressed 15 messages into one.' },
    { num: '2', name: 'Front-load what matters', color: '#16C79A', text: 'Put the most critical information at the beginning of the conversation — or repeat it at the start of a new message. The AI pays more attention to what it read most recently and what came first.' },
    { num: '3', name: 'Start fresh strategically', color: '#0EA5E9', text: "Long conversations drift. Sometimes the best move is to start a new conversation with a clean, well-structured prompt that includes only what's relevant." },
    { num: '4', name: 'Be explicit about what to remember', color: '#F5A623', text: "Write it out: 'Important: the user is vegetarian. Do not forget this.' It sounds silly, but explicit anchors keep critical details from getting lost in the noise." },
    { num: '5', name: 'Use structured formats', color: '#E94560', text: 'Bullet points, numbered lists, and headers are easier for the AI to parse than dense paragraphs. Structure makes information stick.' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        The context window has a hard limit, but you're not helpless. Here are five strategies for keeping the AI focused on what matters:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {strategies.map((s) => (
          <div key={s.num} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800,
              color: 'white', background: s.color,
            }}>
              {s.num}
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: s.color, fontSize: '0.85rem' }}>
                {s.name}:
              </span>{' '}
              <span style={{ opacity: 0.75 }}>{s.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Back Content: System Prompts ─── */
export function SystemPromptBack() {
  return (
    <div>
      <p style={{ marginBottom: '1rem' }}>
        Every AI conversation has a hidden layer you usually don't see: the <strong>system prompt.</strong> It's a block of text that sits at the very top of the context window, before any of your messages.
      </p>

      <p style={{ marginBottom: '1rem' }}>
        The system prompt shapes personality, sets rules, and defines boundaries. It tells the AI how to behave before you ever say a word. And unlike your messages, it stays <strong>pinned</strong> — it never scrolls away as the conversation grows.
      </p>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        lineHeight: 1.7, marginBottom: '1rem',
        fontStyle: 'italic',
      }}>
        Think of the system prompt as the AI's job description. It doesn't tell the AI what to say — it tells the AI <strong>who to be.</strong>
      </div>

      <p style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-subtle)' }}>
        Example system prompt:
      </p>

      <div style={{
        background: '#1A1A2E', borderRadius: '8px',
        padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
        color: '#A5B4FC', lineHeight: 1.6, marginBottom: '1rem',
        whiteSpace: 'pre-wrap',
      }}>
{`You are a history tutor for a 16-year-old
student. Explain concepts clearly using
modern analogies. Never give direct answers
to homework questions — instead, ask guiding
questions that help the student reason through
the problem themselves. Keep responses under
150 words.`}
      </div>

      <p style={{ margin: 0 }}>
        When you use ChatGPT, Claude, or any AI chat tool, there's always a system prompt running in the background — you just don't see it. Understanding that it exists, and learning to write your own, is one of the biggest leverage points in context engineering.
      </p>
    </div>
  );
}

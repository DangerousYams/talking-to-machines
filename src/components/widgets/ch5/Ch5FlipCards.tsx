const ACCENT = '#F5A623';

/* ─── Key fact exports (used by CardActionBar facts panel) ─── */
export const agentLoopKeyFact = "The agent loop — Observe, Think, Act, Evaluate — is the fundamental cycle that transforms AI from a text generator into something that can take real-world actions.";

export const trustKeyFact = "How much should AI do on its own? It depends on three factors: stakes (what's the worst case?), reversibility (can you undo it?), and trust (how proven is the system?).";

/* ─── Back Content: The Agent Loop ─── */
export function AgentLoopBack() {
  const tools = [
    { name: 'Web Search', desc: 'Look up real-time information' },
    { name: 'Code Execution', desc: 'Write and run code, see the output' },
    { name: 'File Operations', desc: 'Read, write, and organize files' },
    { name: 'API Calls', desc: 'Talk to other services and systems' },
    { name: 'Image Generation', desc: 'Create visuals from descriptions' },
    { name: 'Calculator', desc: 'Do precise math, not guesswork' },
    { name: 'Database Query', desc: 'Search and retrieve structured data' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '1rem' }}>
        Before tools, you ask "What time is it in Tokyo?" and the AI <em>guesses</em> based on training data. It might be right. It might be hours off. It has no way to know.
      </p>

      <p style={{ marginBottom: '1rem' }}>
        With tools, the AI recognizes it needs a clock. It calls a time API. It gets the answer. It responds with <strong>certainty, not probability.</strong>
      </p>

      <div style={{
        background: `${ACCENT}08`, borderLeft: `3px solid ${ACCENT}`,
        borderRadius: '0 8px 8px 0', padding: '1rem',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        lineHeight: 1.7, marginBottom: '1rem',
      }}>
        The agent loop: <strong>Observe</strong> (read the task) → <strong>Think</strong> (decide what to do) → <strong>Act</strong> (use a tool) → <strong>Evaluate</strong> (check the result) → loop until done. It's not a script. It's a cycle of judgment.
      </div>

      <p style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-subtle)' }}>
        Seven tools that change everything:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {tools.map((tool) => (
          <div key={tool.name} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '10px', height: '10px', borderRadius: '50%',
              background: ACCENT, marginTop: '6px',
            }} />
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: ACCENT, fontSize: '0.85rem' }}>
                {tool.name}:
              </span>{' '}
              <span style={{ opacity: 0.75, fontSize: '0.9rem' }}>{tool.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Back Content: The Autonomy Question ─── */
export function TrustBack() {
  const factors = [
    {
      num: '1',
      name: 'Stakes',
      color: '#E94560',
      text: "What's the worst that could happen? Sending an email to your boss has higher stakes than drafting a grocery list. Deleting files has higher stakes than copying them.",
    },
    {
      num: '2',
      name: 'Reversibility',
      color: '#7B61FF',
      text: "Can you undo it? Copying a file — yes, always. Sending a message — no, it's gone. Making a purchase — maybe, but it's painful. Reversible actions are safer to automate.",
    },
    {
      num: '3',
      name: 'Trust',
      color: '#16C79A',
      text: "How proven is this system? A tool you've used a hundred times with zero failures has earned more autonomy than something you just installed. Trust is built, not assumed.",
    },
  ];

  const levels = [
    { label: 'Just do it', color: '#16C79A', desc: 'Low stakes, easily reversible. Formatting a document. Sorting a list. Running a spell check.' },
    { label: 'Ask me first', color: '#F5A623', desc: 'Medium stakes or partly irreversible. Sending an email draft. Scheduling a meeting. Modifying shared files.' },
    { label: 'Never allow', color: '#E94560', desc: 'High stakes, irreversible. Deleting important data. Posting publicly. Making purchases. Sharing personal information.' },
  ];

  return (
    <div>
      <p style={{ marginBottom: '0.75rem' }}>
        When AI can take actions, the question isn't just "can it?" It's <strong>"should it?"</strong> And if so, how much should it do without asking?
      </p>

      <p style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-subtle)' }}>
        Three factors determine autonomy:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
        {factors.map((f) => (
          <div key={f.num} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '26px', height: '26px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800,
              color: 'white', background: f.color,
            }}>
              {f.num}
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: f.color, fontSize: '0.85rem' }}>
                {f.name}:
              </span>{' '}
              <span style={{ opacity: 0.75 }}>{f.text}</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-subtle)' }}>
        The three-level trust scale:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {levels.map((level) => (
          <div key={level.label} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: '10px', height: '10px', borderRadius: '50%',
              background: level.color, marginTop: '6px',
            }} />
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: level.color, fontSize: '0.85rem' }}>
                {level.label}:
              </span>{' '}
              <span style={{ opacity: 0.75, fontSize: '0.9rem' }}>{level.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

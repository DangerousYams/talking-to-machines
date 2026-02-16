import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { useStreamingResponse } from '../../../hooks/useStreamingResponse';
import ShareCard from '../../ui/ShareCard';

interface Scenario {
  id: string;
  label: string;
  vaguePrompt: string;
  vagueResponse: string;
  questions: string[];
  placeholders: string[];
  detailedResponse: (answers: string[]) => string;
}

const scenarios: Scenario[] = [
  {
    id: 'party',
    label: 'Plan a birthday party',
    vaguePrompt: 'Plan a birthday party for me.',
    vagueResponse: "Sure! Here's a general birthday party plan:\n\n1. Choose a venue (your home, a restaurant, or a park)\n2. Pick a theme\n3. Send invitations 2 weeks ahead\n4. Plan food and drinks\n5. Prepare decorations\n6. Organize activities or games\n7. Get a cake\n8. Create a playlist\n\nWould you like me to go into more detail on any of these?",
    questions: [
      "Who's the party for, and how old are they turning?",
      "How many people are you inviting \u2014 a small group or a big bash?",
      "What's the vibe? Chill hangout, themed event, or all-out celebration?",
      "Do you have a budget in mind? Even a rough range helps.",
      "Are there any must-haves or deal-breakers? (dietary needs, accessibility, etc.)",
    ],
    placeholders: [
      'e.g., My best friend Mia, turning 16',
      'e.g., About 12\u201315 close friends',
      'e.g., Cozy movie night vibe',
      'e.g., Around $200 total',
      'e.g., One friend is gluten-free, we need it accessible by bus',
    ],
    detailedResponse: (answers) => {
      const [who, size, vibe, budget, needs] = answers;
      return `Here's a tailored plan for ${who || "your friend's"} birthday:\n\n**The Vision**\nA ${vibe || "fun"} party for ${size || "your group"} that keeps things within ${budget || "your budget"}.\n\n**Venue & Timing**\nGiven the ${vibe || "chill"} vibe, consider hosting at home or a cozy cafe. Saturday evening (6\u201310pm) works best for a ${size || "mid-sized"} group \u2014 enough time to eat, hang out, and not feel rushed.\n\n**Food & Drink Strategy**\n${needs ? `Accounting for dietary needs (${needs}), go with` : "Go with"} a build-your-own taco bar or pizza spread \u2014 it's crowd-friendly, customizable${needs ? ", and easy to make gluten-free options" : ""}. Budget roughly 40% of ${budget || "your budget"} here.\n\n**Key Details**\n\u2022 Create a collaborative Spotify playlist \u2014 text the link with invitations so everyone adds songs before the party\n\u2022 Skip formal games. Instead: a polaroid photo station with props, a \u201cfavorite memory\u201d jar where guests write their best moments with ${who ? who.split(",")[0] : "the birthday person"}\n\u2022 For the cake: a local bakery does custom cakes${needs ? " (confirm gluten-free options)" : ""}. Order 3 days ahead.\n\n**Timeline**\n- 2 weeks out: Send invites (group chat is fine for ${size || "this size"})\n- 3 days out: Order cake, buy decorations and supplies\n- Day of: Set up 2 hours early. Enlist 1 friend to help.\n- 6:00 PM: Guests arrive, music playing, food ready\n- 7:30 PM: Cake + ${who ? who.split(",")[0] + "'s" : "birthday"} moment\n- 9:30 PM: Wind down\n\nThis plan respects ${budget || "your budget"} while making it genuinely personal. The best parties aren't the most expensive \u2014 they're the most thoughtful.`;
    },
  },
  {
    id: 'study',
    label: 'Study for a history exam',
    vaguePrompt: 'Help me study for my history exam.',
    vagueResponse: "Here are some tips for studying for a history exam:\n\n1. Review your notes and textbook chapters\n2. Make flashcards for key dates and events\n3. Create a timeline of important events\n4. Practice with past exam questions\n5. Study in short sessions with breaks\n6. Form a study group\n7. Focus on understanding causes and effects\n\nGood luck on your exam!",
    questions: [
      "What period or topic does the exam cover?",
      "What format is the exam \u2014 multiple choice, essays, or a mix?",
      "When is the exam, and how much study time do you have?",
      "What's the part you find trickiest or most confusing?",
      "How does your teacher usually frame questions \u2014 factual recall or analysis?",
    ],
    placeholders: [
      'e.g., The French Revolution through Napoleon',
      'e.g., 30 multiple choice + 2 short essays',
      'e.g., Next Thursday, so about 5 days',
      'e.g., I mix up the different phases and who was in charge when',
      'e.g., She loves "why did X happen" and cause-effect chains',
    ],
    detailedResponse: (answers) => {
      const [topic, format, timing, tricky, style] = answers;
      return `Here's your custom study plan for ${topic || "the exam"}:\n\n**Your Study Challenge**\nYou've got ${timing || "limited time"}, a ${format || "mixed"} format exam, and ${tricky || "some tricky sections"} to work through. Let's be strategic.\n\n**Days 1\u20132: Build the Skeleton**\nCreate a one-page timeline of ${topic || "the period"}. Don't write paragraphs \u2014 just:\n\u2022 Date \u2192 Event \u2192 One-sentence \u201cwhy it matters\u201d\nThis gives you the backbone. ${tricky ? `For the part you find tricky (${tricky}), color-code those events differently so they stand out.` : ""}\n\n**Day 3: Master the Connections**\n${style ? `Since your teacher focuses on "${style}," practice` : "Practice"} cause-effect chains. For every major event, answer:\n\u2022 What caused it? (not just one thing \u2014 the web of causes)\n\u2022 What did it cause? (immediate + long-term effects)\n\u2022 Who benefited? Who lost?\nWrite these as 3-line bullet chains. This is where exams separate A's from B's.\n\n**Day 4: Practice Under Conditions**\n${format ? `For the ${format} format:` : "For your exam format:"}\n\u2022 Multiple choice: Focus on eliminating wrong answers, not just finding right ones\n\u2022 Essays: Practice writing thesis statements in 2 minutes. A strong thesis = a strong essay\n\u2022 Time yourself. If you have 2 short essays, practice writing one in 15 minutes.\n\n**Day 5: The Razor Pass**\nOnly review what you keep getting wrong. No comfort studying \u2014 don't re-read things you already know. Spend 100% of this day on weak spots.\n\n**Secret Weapon**\nTeach the trickiest topic to someone (or explain it out loud to yourself). If you can explain ${tricky || "the hardest part"} in plain English without notes, you know it.\n\nThis plan is designed for how ${style ? "your teacher tests" : "exams work"} \u2014 not just what to know, but how to think about it.`;
    },
  },
  {
    id: 'youtube',
    label: 'Start a YouTube channel',
    vaguePrompt: 'Help me start a YouTube channel.',
    vagueResponse: "Starting a YouTube channel is exciting! Here's how:\n\n1. Choose your niche\n2. Create a Google/YouTube account\n3. Design your channel art and logo\n4. Plan your content calendar\n5. Invest in good equipment (camera, microphone, lighting)\n6. Learn basic video editing\n7. Be consistent with uploads\n8. Engage with your audience\n9. Use SEO and keywords\n10. Be patient \u2014 growth takes time!\n\nLet me know if you want more details on any step!",
    questions: [
      "What kind of content excites you? What could you talk about for hours?",
      "Who's your dream audience \u2014 who specifically are you making this for?",
      "What equipment do you have right now? (phone, computer, etc.)",
      "How much time per week can you realistically spend on this?",
      "Is there a channel you admire that you'd love your style to feel like?",
    ],
    placeholders: [
      'e.g., Explaining science concepts with experiments',
      'e.g., Curious teens who think science is boring in school',
      'e.g., iPhone 14 and a MacBook, no external mic',
      'e.g., About 5-6 hours on weekends',
      'e.g., Mark Rober meets Kurzgesagt \u2014 fun but smart',
    ],
    detailedResponse: (answers) => {
      const [content, audience, equipment, time, style] = answers;
      return `Here's your custom YouTube launch plan:\n\n**Your Channel Identity**\n${content ? `Content: ${content}` : "Your core content"} for ${audience || "your target audience"}. ${style ? `Style inspiration: ${style}. Study 5 of their videos \u2014 not what they say, but how they structure the first 30 seconds, transitions, and calls to action.` : "Pick 3 channels you admire and study their structure."}\n\n**Phase 1: First 3 Videos (Weeks 1\u20133)**\nDon't wait until everything is perfect. Your first 3 videos are for learning, not going viral.\n\nVideo 1: Your simplest, most exciting idea. The one you could explain to a friend at lunch.\nVideo 2: A "list" or "ranking" format \u2014 easiest to structure and edit.\nVideo 3: A reaction, response, or "I tried X" format \u2014 these are engaging and searchable.\n\n**Equipment Strategy**\n${equipment ? `With ${equipment}, you're actually fine to start.` : "Start with what you have."} Priorities:\n1. Audio > video quality. ${equipment?.toLowerCase().includes('mic') ? "Your mic setup is solid." : "A $30 lavalier mic plugged into your phone makes a massive difference. This is the #1 upgrade."}\n2. Film near a window for natural lighting. It's free and looks professional.\n3. Edit on ${equipment?.toLowerCase().includes('mac') ? "iMovie (free, already on your Mac) or DaVinci Resolve (free, more powerful)" : "DaVinci Resolve (free) or CapCut (free, great for phone editing)"}.\n\n**Realistic Schedule (${time || "5-6 hours/week"})**\n\u2022 1 hour: Script/outline\n\u2022 1.5 hours: Film\n\u2022 2 hours: Edit\n\u2022 30 min: Thumbnail + title + description\n\u2022 That's 1 video per week. Consistency beats frequency.\n\n**What Actually Grows a Channel**\n\u2022 Thumbnails and titles are 80% of whether someone clicks. Spend real time on these.\n\u2022 The first 30 seconds determine if viewers stay. Open with a hook, not an intro.\n\u2022 ${audience ? `Speak directly to ${audience}. Say "you" constantly.` : "Speak directly to your viewer. Say 'you' constantly."}\n\u2022 Don't ask "what should I make?" Ask "what would ${audience || "my audience"} search for?"\n\nYour first 10 videos will teach you more than any guide. Start this weekend with Video 1.`;
    },
  },
];

const FLIP_SYSTEM_PROMPT = `You are a planning assistant helping a teenager. The user will state a goal. Do NOT start planning immediately. Instead, ask exactly 5 specific clarifying questions, ONE at a time. After collecting all 5 answers, produce a detailed, personalized plan.

Rules:
- Ask only ONE question per message
- Make questions specific and practical
- After the 5th answer, produce a comprehensive plan tailored to their answers
- Keep a warm, supportive tone
- Number your questions (1/5, 2/5, etc.)`;

type Phase = 'choose' | 'questioning' | 'result';
type Mode = 'guided' | 'freeform';

export default function FlipTheScript() {
  const [phase, setPhase] = useState<Phase>('choose');
  const [scenarioId, setScenarioId] = useState<string>('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [mode, setMode] = useState<Mode>('guided');
  const [customGoal, setCustomGoal] = useState('');
  const [liveMessages, setLiveMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [liveResult, setLiveResult] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scenario = scenarios.find((s) => s.id === scenarioId);

  // Live AI
  const { response: liveResponse, isStreaming, error: liveError, sendMessages, abort } =
    useStreamingResponse({ systemPrompt: FLIP_SYSTEM_PROMPT, maxTokens: 1500 });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages, liveResponse]);

  const liveMode = mode === 'freeform';

  // When streaming completes, capture the response
  useEffect(() => {
    if (!isStreaming && liveResponse && liveMode && phase === 'questioning') {
      // AI finished its response, add to messages
      setLiveMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') return prev; // already added
        return [...prev, { role: 'assistant', text: liveResponse }];
      });
    }
    if (!isStreaming && liveResponse && liveMode && phase === 'result') {
      setLiveResult(liveResponse);
    }
  }, [isStreaming]);

  const handlePickScenario = (id: string) => {
    setScenarioId(id);
    setPhase('questioning');
    setQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setShowComparison(false);
    setLiveMessages([]);
    setLiveResult('');

    if (liveMode) {
      const s = scenarios.find((s) => s.id === id)!;
      sendMessages([{ role: 'user', content: s.vaguePrompt }]);
      setLiveMessages([{ role: 'user', text: s.vaguePrompt }]);
    }
  };

  const handleCustomGoal = () => {
    const goal = customGoal.trim();
    if (!goal) return;
    setScenarioId('custom');
    setPhase('questioning');
    setQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setShowComparison(false);
    setLiveMessages([{ role: 'user', text: goal }]);
    setLiveResult('');
    sendMessages([{ role: 'user', content: goal }]);
  };

  const handleSubmitAnswer = () => {
    const answer = currentAnswer || '(skipped)';
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (liveMode) {
      // Add user answer to live messages
      setLiveMessages((prev) => [...prev, { role: 'user', text: answer }]);

      // Build full message history for the API
      const apiMessages: { role: 'user' | 'assistant'; content: string }[] = [];
      // Use the first live message as the initial goal (works for both preset and custom)
      const initialGoal = liveMessages[0]?.text || customGoal || 'Help me plan something';
      apiMessages.push({ role: 'user', content: initialGoal });

      // Interleave AI questions and user answers
      for (let i = 0; i < liveMessages.length; i++) {
        const msg = liveMessages[i];
        if (msg.role === 'user' && i === 0) continue; // skip initial goal, already added
        apiMessages.push({ role: msg.role, content: msg.text });
      }
      apiMessages.push({ role: 'user', content: answer });

      const isDone = questionIndex + 1 >= 5;
      if (isDone) {
        setPhase('result');
      }
      sendMessages(apiMessages);
    } else {
      if (questionIndex + 1 >= (scenario?.questions.length || 5)) {
        setPhase('result');
      } else {
        setQuestionIndex((i) => i + 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const handleReset = () => {
    abort();
    setPhase('choose');
    setScenarioId('');
    setQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setShowComparison(false);
    setLiveMessages([]);
    setLiveResult('');
  };

  // Get the current AI question for display
  const getCurrentQuestion = () => {
    if (liveMode) {
      // In live mode, the question is the last assistant message or the streaming response
      if (isStreaming) return liveResponse;
      const lastAssistant = [...liveMessages].reverse().find((m) => m.role === 'assistant');
      return lastAssistant?.text || '';
    }
    return scenario?.questions[questionIndex] || '';
  };

  // Determine if we're waiting for AI question
  const waitingForQuestion = liveMode && isStreaming && liveMessages.filter((m) => m.role === 'assistant').length <= answers.length;

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #16C79A, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Flip the Script</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>What happens when the AI interviews you first?</p>
          </div>
          {/* Mode toggle */}
          {phase === 'choose' && (
            <div style={{ display: 'flex', borderRadius: 100, border: '1px solid rgba(26,26,46,0.1)', overflow: 'hidden', flexShrink: 0 }}>
              <button
                onClick={() => setMode('guided')}
                style={{
                  padding: '5px 10px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                  letterSpacing: '0.04em', transition: 'all 0.25s',
                  background: mode === 'guided' ? '#1A1A2E' : 'transparent',
                  color: mode === 'guided' ? '#FAF8F5' : '#6B7280',
                }}
              >
                GUIDED
              </button>
              <button
                onClick={() => setMode('freeform')}
                style={{
                  padding: '5px 10px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                  letterSpacing: '0.04em', transition: 'all 0.25s',
                  background: mode === 'freeform' ? '#16C79A' : 'transparent',
                  color: mode === 'freeform' ? '#FFFFFF' : '#6B7280',
                }}
              >
                LIVE AI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Choose phase */}
      {phase === 'choose' && (
        <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.9rem' : '0.95rem', color: '#1A1A2E', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            {liveMode
              ? <>Type your own goal, or pick a preset. The AI will ask you <strong>5 real clarifying questions</strong> before planning.</>
              : <>Pick a goal. Instead of giving you a generic answer, the AI will ask you <strong>5 clarifying questions</strong> first. Watch how much better the result gets.</>
            }
          </p>

          {/* Custom goal input (live mode) */}
          {liveMode && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' as const : 'row' as const }}>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCustomGoal(); }}
                  placeholder="Type your own goal... e.g., Help me learn guitar"
                  style={{
                    flex: 1, padding: isMobile ? '12px 14px' : '10px 14px', borderRadius: 10,
                    border: '1px solid rgba(26,26,46,0.1)', background: '#FEFDFB',
                    fontFamily: 'var(--font-body)', fontSize: isMobile ? '16px' : '0.9rem', color: '#1A1A2E',
                    outline: 'none', minHeight: 44,
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#16C79A40'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'}
                />
                <button
                  onClick={handleCustomGoal}
                  disabled={!customGoal.trim()}
                  style={{
                    padding: isMobile ? '12px 20px' : '10px 20px', borderRadius: 10, border: 'none',
                    background: !customGoal.trim() ? 'rgba(26,26,46,0.08)' : '#16C79A', color: '#FFFFFF',
                    cursor: !customGoal.trim() ? 'default' : 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                    transition: 'all 0.25s', flexShrink: 0, minHeight: 44,
                  }}
                >
                  Go →
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '1rem 0 0.5rem' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(26,26,46,0.08)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', letterSpacing: '0.06em' }}>OR PICK A PRESET</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(26,26,46,0.08)' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handlePickScenario(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: isMobile ? '0.85rem 1rem' : '1rem 1.25rem', borderRadius: 10, border: '1px solid rgba(26,26,46,0.08)',
                  background: 'transparent', cursor: 'pointer', transition: 'all 0.25s',
                  textAlign: 'left' as const, minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0F346030'; e.currentTarget.style.background = 'rgba(15,52,96,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 600, color: '#0F3460' }}>
                  {s.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>\u2192</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Questioning phase */}
      {phase === 'questioning' && (scenario || scenarioId === 'custom') && (
        <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem', justifyContent: 'center' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', transition: 'all 0.3s',
                background: i < answers.length ? '#16C79A' : i === answers.length ? '#0F3460' : 'rgba(26,26,46,0.1)',
              }} />
            ))}
          </div>

          {/* Chat history */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, marginBottom: '1.5rem', maxHeight: isMobile ? '35dvh' : '40dvh', overflowY: 'auto' as const }}>
            {liveMode ? (
              // Live mode: show actual message history
              liveMessages.slice(1).map((msg, i) => (
                <div key={i}>
                  {msg.role === 'assistant' ? (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, background: '#0F3460', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'white', fontWeight: 700,
                      }}>AI</div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#1A1A2E', margin: 0, lineHeight: 1.6 }}>
                        {msg.text}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <div style={{
                        background: 'rgba(15,52,96,0.06)', borderRadius: 10, padding: '8px 14px',
                        fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#0F3460', maxWidth: '80%', lineHeight: 1.5,
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Demo mode: show hardcoded history
              answers.map((answer, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, background: '#0F3460', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'white', fontWeight: 700,
                    }}>AI</div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#1A1A2E', margin: 0, lineHeight: 1.6 }}>
                      {scenario!.questions[i]}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <div style={{
                      background: 'rgba(15,52,96,0.06)', borderRadius: 10, padding: '8px 14px',
                      fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#0F3460', maxWidth: '80%', lineHeight: 1.5,
                    }}>
                      {answer}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Current question or streaming indicator */}
          {liveMode && isStreaming && liveMessages.filter((m) => m.role === 'assistant').length <= answers.length ? (
            <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, background: '#0F3460', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'white', fontWeight: 700,
              }}>AI</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#1A1A2E', margin: 0, lineHeight: 1.6 }}>
                {liveResponse}
                <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#16C79A', marginLeft: 2, animation: 'pulse 1s infinite' }} />
              </p>
            </div>
          ) : !liveMode ? (
            <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, background: '#0F3460', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'white', fontWeight: 700,
              }}>AI</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: '#1A1A2E', margin: 0, lineHeight: 1.6 }}>
                {scenario!.questions[questionIndex]}
              </p>
            </div>
          ) : null}

          {/* Answer input */}
          {!waitingForQuestion && (
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const, gap: 8 }}>
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={!liveMode ? scenario!.placeholders[questionIndex] : 'Type your answer...'}
                style={{
                  flex: 1, padding: isMobile ? '12px 14px' : '10px 14px', borderRadius: 10,
                  border: '1px solid rgba(26,26,46,0.1)', background: '#FEFDFB',
                  fontFamily: 'var(--font-body)', fontSize: isMobile ? '16px' : '0.85rem', color: '#1A1A2E',
                  outline: 'none', minHeight: 44,
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0F346040'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={isStreaming}
                style={{
                  padding: isMobile ? '12px 20px' : '10px 20px', borderRadius: 10, border: 'none',
                  background: isStreaming ? '#6B7280' : '#0F3460', color: '#FAF8F5', cursor: isStreaming ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                  transition: 'all 0.25s', flexShrink: 0, minHeight: 44,
                }}
                onMouseEnter={(e) => { if (!isStreaming) e.currentTarget.style.background = '#1a4a80'; }}
                onMouseLeave={(e) => { if (!isStreaming) e.currentTarget.style.background = '#0F3460'; }}
              >
                {answers.length >= 4 ? 'Done' : 'Answer'}
              </button>
            </div>
          )}

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', marginTop: 8, textAlign: 'center' as const }}>
            Question {answers.length + 1} of 5 {!liveMode && '\u2014 press Enter to submit'}
          </p>
        </div>
      )}

      {/* Result phase */}
      {phase === 'result' && (scenario || scenarioId === 'custom') && (
        <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
          {!showComparison ? (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#16C79A', display: 'block', marginBottom: 8 }}>
                  Your personalized result
                </span>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.82rem' : '0.85rem', lineHeight: 1.75, color: '#1A1A2E',
                  whiteSpace: 'pre-wrap' as const, maxHeight: isMobile ? '35dvh' : '40dvh', overflowY: 'auto' as const,
                }}>
                  {(() => {
                    const text = liveMode
                      ? (liveResult || liveResponse || 'Generating your personalized plan...')
                      : scenario!.detailedResponse(answers);
                    return text.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.includes('**')) {
                        const parts = line.split('**');
                        return (
                          <p key={i} style={{ margin: '0.6em 0' }}>
                            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#0F3460' }}>{p}</strong> : <span key={j}>{p}</span>)}
                          </p>
                        );
                      }
                      if (line.startsWith('\u2022')) {
                        return <p key={i} style={{ margin: '0.3em 0', paddingLeft: '0.5rem' }}>{line}</p>;
                      }
                      return line ? <p key={i} style={{ margin: '0.5em 0' }}>{line}</p> : <br key={i} />;
                    });
                  })()}
                  {isStreaming && <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#16C79A', marginLeft: 2, animation: 'pulse 1s infinite' }} />}
                </div>
              </div>
              {!isStreaming && (
                <button
                  onClick={() => setShowComparison(true)}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid rgba(15,52,96,0.2)',
                    background: 'rgba(15,52,96,0.04)', cursor: 'pointer', transition: 'all 0.25s',
                    fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 600, color: '#0F3460',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15,52,96,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15,52,96,0.04)'}
                >
                  Compare: What would a vague prompt have gotten? \u2192
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '1.25rem', marginBottom: '1.25rem' }}>
                {/* Vague side */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E94560' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#E94560' }}>
                      Vague prompt
                    </span>
                  </div>
                  <div style={{
                    background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.12)',
                    borderRadius: 10, padding: isMobile ? '0.75rem' : '1rem', marginBottom: 8,
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic',
                  }}>
                    "{scenario ? scenario.vaguePrompt : (liveMessages[0]?.text || customGoal)}"
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.78rem' : '0.8rem', lineHeight: 1.65, color: '#1A1A2E',
                    whiteSpace: 'pre-wrap' as const, maxHeight: isMobile ? '25dvh' : '30dvh', overflowY: 'auto' as const, opacity: 0.8,
                  }}>
                    {scenario ? scenario.vagueResponse : "Without clarifying questions, the AI would have given you a generic checklist — accurate but impersonal. The kind of advice you could find on any website. No details about your situation, your constraints, or what actually matters to you."}
                  </div>
                </div>

                {/* Socratic side */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16C79A' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#16C79A' }}>
                      After 5 questions
                    </span>
                  </div>
                  <div style={{
                    background: 'rgba(22,199,154,0.04)', border: '1px solid rgba(22,199,154,0.12)',
                    borderRadius: 10, padding: isMobile ? '0.75rem' : '1rem', marginBottom: 8,
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic',
                  }}>
                    "Same goal + your 5 answers"
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.78rem' : '0.8rem', lineHeight: 1.65, color: '#1A1A2E',
                    whiteSpace: 'pre-wrap' as const, maxHeight: isMobile ? '25dvh' : '30dvh', overflowY: 'auto' as const,
                  }}>
                    {(() => {
                      const text = liveMode
                        ? (liveResult || liveResponse || '')
                        : scenario!.detailedResponse(answers);
                      return text.split('\n').slice(0, 12).join('\n') + '...';
                    })()}
                  </div>
                </div>
              </div>

              {/* Insight */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(22,199,154,0.06), rgba(15,52,96,0.06))',
                border: '1px solid rgba(22,199,154,0.15)', borderRadius: 10, padding: isMobile ? '0.85rem 1rem' : '1rem 1.25rem', marginBottom: '1rem',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65, color: '#1A1A2E', margin: 0 }}>
                  <strong style={{ color: '#0F3460' }}>The Socratic Method works.</strong> Five questions turned a generic checklist into a plan built around <em>your</em> specific situation. The AI didn't get smarter \u2014 it just had better context.
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <ShareCard
                  title="Socratic Method"
                  metric="5 Qs"
                  metricColor="#16C79A"
                  subtitle="A vague prompt got a generic checklist. After 5 AI questions, I got a plan built for MY situation."
                  accentColor="#16C79A"
                  tweetText="A vague prompt got me a generic checklist. After 5 AI questions, I got a plan built for MY situation. Try the Socratic method:"
                  shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/ch2#flip-the-script` : undefined}
                />
              </div>

              <button
                onClick={handleReset}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                  padding: isMobile ? '0.75rem 1.5rem' : '0.6rem 1.5rem', borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: '#1A1A2E', color: '#FAF8F5', transition: 'all 0.25s', minHeight: 44,
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Try Another Scenario
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

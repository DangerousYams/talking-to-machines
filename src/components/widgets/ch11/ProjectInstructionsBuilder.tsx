import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { useAuth } from '../../../hooks/useAuth';
import { streamChat, type ChatMessage } from '../../../lib/claude';
import UnlockModal from '../../ui/UnlockModal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Phase = 'learn' | 'interview' | 'output';
type ToolId = 'claude' | 'cursor' | 'copilot' | 'windsurf';

interface InterviewAnswer {
  question: string;
  answer: string;
  chapterRef: string;
}

const TOOLS: { id: ToolId; name: string; filename: string; desc: string }[] = [
  { id: 'claude', name: 'Claude Code', filename: 'CLAUDE.md', desc: 'Placed at the root of your project. Claude Code reads it automatically every conversation.' },
  { id: 'cursor', name: 'Cursor', filename: '.cursorrules', desc: 'Placed at the root of your project. Cursor loads these rules as context for every AI interaction.' },
  { id: 'copilot', name: 'GitHub Copilot', filename: '.github/copilot-instructions.md', desc: 'Lives in the .github folder. Copilot uses these instructions for code suggestions and chat.' },
  { id: 'windsurf', name: 'Windsurf', filename: '.windsurfrules', desc: 'Placed at the root of your project. Windsurf reads these rules for all AI-assisted coding.' },
];

const FILENAME_MAP: Record<ToolId, string> = {
  claude: 'CLAUDE.md',
  cursor: '.cursorrules',
  copilot: 'copilot-instructions.md',
  windsurf: '.windsurfrules',
};

const QUESTION_MAP: { chapterRef: string; label: string }[] = [
  { chapterRef: 'Ch 1', label: 'Project overview' },
  { chapterRef: 'Ch 1-2', label: 'AI role' },
  { chapterRef: 'Ch 3', label: 'Context & knowledge' },
  { chapterRef: 'Ch 5', label: 'Tools & APIs' },
  { chapterRef: 'Ch 6', label: 'Workflow' },
  { chapterRef: 'Ch 9', label: 'Constraints & guardrails' },
  { chapterRef: 'Ch 10', label: 'Human decisions' },
];

// ---------------------------------------------------------------------------
// Example annotated CLAUDE.md
// ---------------------------------------------------------------------------
const EXAMPLE_SECTIONS: { label: string; chapter: string; color: string; content: string }[] = [
  { label: 'Project Overview', chapter: 'Ch 1', color: '#E94560', content: '# Pixel Quest\nA 2D platformer game built with Phaser.js. Retro pixel art style, 10 levels, boss fights. Target audience: casual gamers.' },
  { label: 'AI Role', chapter: 'Ch 1-2', color: '#0F3460', content: '## Role\nYou are a game development partner. Think like a senior game dev who writes clean, performant code and cares about player experience.' },
  { label: 'Context', chapter: 'Ch 3', color: '#7B61FF', content: '## Context\n- Stack: Phaser 3, TypeScript, Vite\n- Art: 16x16 pixel sprites (Aseprite)\n- Audio: BFXR for SFX, Beepbox for music\n- Physics: Arcade physics (not Matter.js)' },
  { label: 'Tools', chapter: 'Ch 5', color: '#F5A623', content: '## Tools\n- Use Phaser\'s built-in tilemap loader\n- Sprite animations via Phaser.Animations\n- No external physics libraries' },
  { label: 'Workflow', chapter: 'Ch 6', color: '#0EA5E9', content: '## Workflow\n1. Implement game mechanic in isolation\n2. Write a test scene to verify\n3. Integrate into main game\n4. Playtest for 2 minutes before moving on' },
  { label: 'Guardrails', chapter: 'Ch 9', color: '#E94560', content: '## Rules\n- Never modify the asset pipeline\n- Always use TypeScript strict mode\n- No console.log in committed code\n- Keep each scene under 200 lines' },
  { label: 'Human Decisions', chapter: 'Ch 10', color: '#16C79A', content: '## Human Only\n- Level design and difficulty curve\n- Art direction and color palette\n- Game feel (jump height, speed, knockback)\n- What\'s fun — always defer to the designer' },
];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are an expert AI project setup assistant helping a student create a project instruction file (like CLAUDE.md or .cursorrules) for their project. This student just completed an 11-chapter AI course called "Talking to Machines."

You will conduct a structured interview with exactly 7 questions. Ask ONE question at a time. After each answer, acknowledge it in one short sentence (reference which course chapter the concept comes from), then ask the next question.

The 7 questions, in order:

1. "What are you building? Describe your project in a few sentences — what it does and who it's for."
   (Prompt clarity — Chapter 1)

2. "What role should the AI play when working on this project? Is it a coding partner, a writing collaborator, a research assistant, a creative director — or something else?"
   (Role assignment — Chapters 1-2)

3. "What background knowledge or context does the AI need? Think: tech stack, domain knowledge, existing code, style preferences, reference materials."
   (Context engineering — Chapter 3)

4. "What tools, APIs, libraries, or external services are involved? List anything the AI should know how to work with."
   (Tool use — Chapter 5)

5. "Describe the typical workflow. When you sit down to work on this project with AI, what does a productive session look like? What steps happen in what order?"
   (Agent architecture — Chapter 6)

6. "What should the AI NEVER do? What are the quality standards, forbidden patterns, or safety rules?"
   (Guardrails — Chapter 9)

7. "What decisions should always stay with you — the human? What should the AI defer to you on?"
   (The human edge — Chapter 10)

After the 7th answer, say "I have everything I need." Then generate a complete project instruction file in markdown. The file should:
- Start with a project title and one-line description
- Have clearly labeled sections
- Use bullet points for lists
- Be specific and actionable (not generic advice)
- Be 200-400 words
- Be formatted inside a markdown code block (triple backticks)

Keep your tone warm, encouraging, and concise. You're talking to a teenager who just finished learning about AI.`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProjectInstructionsBuilder() {
  const isMobile = useIsMobile();
  const { isPaid } = useAuth();

  // Phase
  const [phase, setPhase] = useState<Phase>('learn');
  const [selectedTool, setSelectedTool] = useState<ToolId>('claude');

  // Interview state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const controllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Output state
  const [generatedFile, setGeneratedFile] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // Extract code block from AI response
  const extractCodeBlock = useCallback((text: string): string | null => {
    const match = text.match(/```(?:markdown|md)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  }, []);

  // Send a message and stream the response
  const sendMessage = useCallback((userText: string) => {
    const userMsg: ChatMessage = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setCurrentResponse('');
    setIsStreaming(true);
    setError('');

    let accumulated = '';

    controllerRef.current = streamChat({
      messages: newMessages,
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 1024,
      source: 'project-builder',
      skipPersona: true,
      onChunk: (text) => {
        accumulated += text;
        setCurrentResponse(accumulated);
      },
      onDone: () => {
        const assistantMsg: ChatMessage = { role: 'assistant', content: accumulated };
        setMessages((prev) => [...prev, assistantMsg]);
        setCurrentResponse('');
        setIsStreaming(false);

        // Check if this response contains the final code block
        const codeBlock = extractCodeBlock(accumulated);
        if (codeBlock) {
          setGeneratedFile(codeBlock);
          setPhase('output');
        } else {
          // Advance question index
          setQuestionIndex((prev) => prev + 1);
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        setError(err);
      },
    });
  }, [messages, extractCodeBlock]);

  // Start the interview
  const startInterview = useCallback(() => {
    if (!isPaid) return;
    setPhase('interview');
    // Send initial message to get first question
    sendMessage('I want to create a project instruction file for my AI coding tool. Please interview me to build one.');
  }, [isPaid, sendMessage]);

  // Handle user submitting an answer
  const handleSubmit = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;

    // Track the answer
    if (questionIndex > 0 && questionIndex <= QUESTION_MAP.length) {
      const qMap = QUESTION_MAP[questionIndex - 1];
      // Find the question text from the last assistant message
      const lastAssistant = messages.filter((m) => m.role === 'assistant').pop();
      setAnswers((prev) => [
        ...prev,
        {
          question: lastAssistant?.content?.split('\n')[0] || qMap.label,
          answer: text,
          chapterRef: qMap.chapterRef,
        },
      ]);
    }

    sendMessage(text);
    setInputValue('');
  }, [inputValue, isStreaming, questionIndex, messages, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedFile).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [generatedFile]);

  // Download file
  const handleDownload = useCallback(() => {
    const filename = FILENAME_MAP[selectedTool];
    const blob = new Blob([generatedFile], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedFile, selectedTool]);

  // Shared styles
  const accentColor = '#16C79A';
  const pad = isMobile ? '0.75rem' : '1.5rem 2rem';

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '0.5rem 0.75rem' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: isMobile ? '0.5rem' : '1.25rem' }}>
          <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Project Instructions Builder</h3>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Create a CLAUDE.md (or .cursorrules, etc.) for your project</p>
            )}
          </div>
          {/* Phase indicator */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {(['learn', 'interview', 'output'] as Phase[]).map((p, i) => (
              <div
                key={p}
                style={{
                  width: phase === p ? 18 : 6, height: 6, borderRadius: 3,
                  background: phase === p ? accentColor : i < ['learn', 'interview', 'output'].indexOf(phase) ? `${accentColor}60` : 'rgba(26,26,46,0.1)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── PHASE: LEARN ─── */}
      {phase === 'learn' && (
        <div style={{ padding: pad }}>
          {/* Intro */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.75, color: '#1A1A2E', margin: '0 0 1rem' }}>
              Every major AI coding tool lets you write a <strong>project instruction file</strong> — a persistent document that tells the AI who it is, what you're building, and how to help. Write it once, and every future conversation starts smarter.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.75, color: '#1A1A2E', margin: 0 }}>
              Same concept, different filenames:
            </p>
          </div>

          {/* Tool tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: '1.25rem' }}>
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                style={{
                  padding: '6px 12px', borderRadius: 100, border: '1px solid',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                  fontWeight: 600, letterSpacing: '0.03em', transition: 'all 0.2s',
                  background: selectedTool === tool.id ? `${accentColor}12` : 'transparent',
                  borderColor: selectedTool === tool.id ? `${accentColor}40` : 'rgba(26,26,46,0.1)',
                  color: selectedTool === tool.id ? accentColor : '#6B7280',
                }}
              >
                {tool.filename}
              </button>
            ))}
          </div>

          {/* Selected tool description */}
          <div style={{
            background: 'rgba(26,26,46,0.02)', borderRadius: 10, padding: '0.75rem 1rem',
            marginBottom: '1.5rem', border: '1px solid rgba(26,26,46,0.04)',
          }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>
              {TOOLS.find((t) => t.id === selectedTool)?.name}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              {TOOLS.find((t) => t.id === selectedTool)?.desc}
            </p>
          </div>

          {/* Annotated example */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', marginBottom: 8 }}>
              Example: A game project
            </p>
            <div style={{
              background: '#1A1A2E', borderRadius: 10, padding: isMobile ? '0.75rem' : '1.25rem',
              overflow: 'hidden',
            }}>
              {EXAMPLE_SECTIONS.map((section, i) => (
                <div key={i} style={{ marginBottom: i < EXAMPLE_SECTIONS.length - 1 ? 12 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
                      color: section.color, background: `${section.color}20`,
                      padding: '1px 6px', borderRadius: 100, letterSpacing: '0.05em',
                    }}>
                      {section.chapter}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#6B7280' }}>
                      {section.label}
                    </span>
                  </div>
                  <pre style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', lineHeight: 1.6,
                    color: '#E2E8F0', margin: 0, whiteSpace: 'pre-wrap' as const,
                    borderLeft: `2px solid ${section.color}40`, paddingLeft: 10,
                  }}>
                    {section.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6, color: '#6B7280', margin: '0 0 1rem' }}>
            This file encodes everything you learned in this course — prompting, context, tools, workflows, guardrails — into a single document your AI reads every time. Let's build yours.
          </p>

          {!isPaid ? (
            <UnlockModal feature="Project Instructions Builder" accentColor={accentColor} />
          ) : (
            <button
              onClick={startInterview}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                fontWeight: 600, letterSpacing: '0.04em', background: accentColor,
                color: 'white', transition: 'all 0.25s',
              }}
            >
              Build My Project Instructions
            </button>
          )}
        </div>
      )}

      {/* ─── PHASE: INTERVIEW ─── */}
      {phase === 'interview' && (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const, minHeight: isMobile ? 'auto' : 420 }}>
          {/* Chat column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)' }}>
            {/* Progress bar */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(26,26,46,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: '#6B7280', letterSpacing: '0.06em' }}>
                QUESTION {Math.min(questionIndex, 7)} / 7
              </span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, transition: 'width 0.5s ease',
                  width: `${(Math.min(questionIndex, 7) / 7) * 100}%`,
                  background: `linear-gradient(90deg, ${accentColor}, #0EA5E9)`,
                }} />
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto' as const, padding: isMobile ? '0.75rem' : '1rem 1.25rem',
              maxHeight: isMobile ? 300 : 340,
            }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 12,
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '85%', padding: '0.6rem 0.9rem', borderRadius: 12,
                    background: msg.role === 'user' ? `${accentColor}10` : 'rgba(26,26,46,0.03)',
                    border: `1px solid ${msg.role === 'user' ? `${accentColor}20` : 'rgba(26,26,46,0.06)'}`,
                  }}>
                    {msg.role === 'assistant' && i === 0 ? null : (
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
                        color: '#1A1A2E', margin: 0, whiteSpace: 'pre-wrap' as const,
                      }}>
                        {/* Hide the initial trigger message */}
                        {msg.role === 'user' && i === 0 ? null : msg.content}
                      </p>
                    )}
                    {msg.role === 'assistant' && (
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
                        color: '#1A1A2E', margin: 0, whiteSpace: 'pre-wrap' as const,
                      }}>
                        {msg.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming response */}
              {currentResponse && (
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '0.6rem 0.9rem', borderRadius: 12,
                    background: 'rgba(26,26,46,0.03)', border: '1px solid rgba(26,26,46,0.06)',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
                      color: '#1A1A2E', margin: 0, whiteSpace: 'pre-wrap' as const,
                    }}>
                      {currentResponse}
                      <span style={{ display: 'inline-block', width: 2, height: '1em', background: accentColor, marginLeft: 2, animation: 'pulse 1s infinite' }} />
                    </p>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            {questionIndex <= 7 && (
              <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(26,26,46,0.06)', display: 'flex', gap: 8 }}>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  rows={2}
                  style={{
                    flex: 1, padding: '0.6rem 0.75rem', fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem', lineHeight: 1.5, background: '#FEFDFB',
                    border: '1px solid rgba(26,26,46,0.08)', borderRadius: 8,
                    resize: 'none' as const, outline: 'none', color: '#1A1A2E',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = `${accentColor}40`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isStreaming}
                  style={{
                    padding: '0 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: !inputValue.trim() || isStreaming ? 'rgba(26,26,46,0.06)' : accentColor,
                    color: !inputValue.trim() || isStreaming ? '#6B7280' : 'white',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                    alignSelf: 'flex-end', height: 36, flexShrink: 0,
                  }}
                >
                  {isStreaming ? '...' : 'Send'}
                </button>
              </div>
            )}

            {error && (
              <div style={{ padding: '0.5rem 0.75rem' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#E94560', margin: 0 }}>
                  {error}
                  <button
                    onClick={() => { setError(''); sendMessage(messages[messages.length - 1]?.content || ''); }}
                    style={{
                      marginLeft: 8, padding: '2px 8px', borderRadius: 4, border: '1px solid #E9456030',
                      background: 'transparent', color: '#E94560', cursor: 'pointer',
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    }}
                  >
                    Retry
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Progress sidebar (desktop only) */}
          {!isMobile && (
            <div style={{ width: 220, padding: '1rem', background: 'rgba(26,26,46,0.015)', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', margin: '0 0 10px' }}>
                Progress
              </p>
              {QUESTION_MAP.map((q, i) => {
                const isDone = i < answers.length;
                const isCurrent = i === questionIndex - 1;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10,
                      opacity: isDone ? 1 : isCurrent ? 0.8 : 0.4,
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? `${accentColor}15` : 'rgba(26,26,46,0.06)',
                      border: `1.5px solid ${isDone ? accentColor : 'rgba(26,26,46,0.12)'}`,
                      color: accentColor, fontSize: '0.55rem', fontWeight: 700,
                    }}>
                      {isDone ? '\u2713' : ''}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600, color: '#1A1A2E', margin: 0 }}>
                        {q.label}
                      </p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: accentColor, margin: 0, opacity: 0.7 }}>
                        {q.chapterRef}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE: OUTPUT ─── */}
      {phase === 'output' && (
        <div style={{ padding: pad }}>
          {/* Tool selector */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', margin: '0 0 8px' }}>
              Download as
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  style={{
                    padding: '5px 10px', borderRadius: 100, border: '1px solid',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    fontWeight: 600, transition: 'all 0.2s',
                    background: selectedTool === tool.id ? `${accentColor}12` : 'transparent',
                    borderColor: selectedTool === tool.id ? `${accentColor}40` : 'rgba(26,26,46,0.1)',
                    color: selectedTool === tool.id ? accentColor : '#6B7280',
                  }}
                >
                  {tool.filename}
                </button>
              ))}
            </div>
          </div>

          {/* File display */}
          <div style={{
            background: '#1A1A2E', borderRadius: 10, overflow: 'hidden', marginBottom: '1rem',
          }}>
            {/* Filename bar */}
            <div style={{
              padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#A0AEC0' }}>
                {FILENAME_MAP[selectedTool]}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: copied ? accentColor : '#A0AEC0',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '3px 10px', borderRadius: 4, border: 'none',
                    background: accentColor, color: 'white',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                  }}
                >
                  Download
                </button>
              </div>
            </div>
            {/* Content */}
            <pre style={{
              padding: isMobile ? '0.75rem' : '1.25rem', margin: 0,
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.7,
              color: '#E2E8F0', whiteSpace: 'pre-wrap' as const,
              maxHeight: 400, overflowY: 'auto' as const,
            }}>
              {generatedFile}
            </pre>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setPhase('learn');
                setMessages([]);
                setAnswers([]);
                setQuestionIndex(0);
                setGeneratedFile('');
                setInputValue('');
                setCurrentResponse('');
              }}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid rgba(26,26,46,0.1)', background: 'transparent',
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                color: '#6B7280',
              }}
            >
              Start Over
            </button>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#6B7280', marginTop: 12, lineHeight: 1.5, textAlign: 'center' as const }}>
            Drop this file in your project root. Your AI tool will read it automatically.
          </p>
        </div>
      )}
    </div>
  );
}

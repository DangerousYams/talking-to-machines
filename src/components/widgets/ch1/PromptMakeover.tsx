import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { useStreamingResponse } from '../../../hooks/useStreamingResponse';
import { streamChat } from '../../../lib/claude';
import { useAuth } from '../../../hooks/useAuth';
import ShareCard from '../../ui/ShareCard';
import UnlockModal from '../../ui/UnlockModal';
import BottomSheet from '../../cards/BottomSheet';

interface BuildingBlock {
  id: string;
  label: string;
  letter: string;
  color: string;
  text: string;
  hint: string;
}

const blocks: BuildingBlock[] = [
  { id: 'role', label: 'Role', letter: 'R', color: '#E94560', text: 'You are an experienced AP English tutor who specializes in helping students strengthen their argumentative writing.', hint: 'Assign the AI a specific expert role/persona relevant to the task (e.g. "You are an experienced X who specializes in Y")' },
  { id: 'task', label: 'Task', letter: 'T', color: '#0F3460', text: 'Help me rewrite my thesis statement for an argumentative essay about social media\'s effect on teen mental health. My current thesis is: "Social media is bad for teens."', hint: 'Define the specific task \u2014 what exactly should the AI do? Include current state and desired outcome.' },
  { id: 'format', label: 'Format', letter: 'F', color: '#7B61FF', text: 'Give me 3 stronger alternatives. Format each as: the thesis (bold), followed by one sentence explaining why it\'s better.', hint: 'Specify the output format \u2014 how many items, what structure, any formatting rules (lists, bold, tables, etc.)' },
  { id: 'constraints', label: 'Constraints', letter: 'C', color: '#16C79A', text: 'Each thesis must be specific and debatable \u2014 not a simple fact. Avoid clich\u00e9s like "in today\'s society." Keep each under 25 words.', hint: 'Add quality constraints \u2014 what to avoid, length limits, tone requirements, or quality standards' },
  { id: 'examples', label: 'Examples', letter: 'E', color: '#F5A623', text: 'Here\'s the level of specificity I\'m aiming for: "The gig economy doesn\'t create entrepreneurs \u2014 it creates a permanent underclass of precarious workers."', hint: 'Provide an example of the quality/style you want, so the AI can match it' },
];

const fallbackResponses: Record<number, string> = {
  0: "Sure! I'd be happy to help with your essay about social media and teens. Here are some thoughts:\n\nSocial media can have both positive and negative effects on teenagers. You might want to consider discussing cyberbullying, screen time, and self-esteem issues. A good thesis should be specific and arguable.\n\nWould you like me to help you brainstorm more ideas?",
  1: "Here are some improved thesis options for your essay on social media and teen mental health:\n\n1. Social media platforms create unrealistic standards that harm teen self-image.\n\n2. The addictive design of social media is damaging to teenage mental health.\n\n3. While social media connects teens, it also increases anxiety and depression.\n\nEach of these gives your essay a clearer direction. Would you like me to develop any of these further?",
  2: "Here are 3 stronger thesis alternatives for your essay:\n\n**\"Social media's algorithmic amplification of idealized lifestyles is rewiring adolescent self-worth around metrics of validation.\"**\nThis works because it names the specific mechanism (algorithms) and the specific harm (self-worth tied to likes), making it arguable and precise.\n\n**\"Instagram and TikTok don't cause teen depression \u2014 but their engagement-maximizing design makes existing vulnerabilities catastrophically worse.\"**\nThe concession-then-pivot structure makes this sophisticated and debatable, not a simple claim.\n\n**\"Teens who curate online personas for peer approval are rehearsing a form of emotional labor that developmental psychology hasn't begun to address.\"**\nThis reframes the debate entirely \u2014 it's not about \"social media bad\" but about an unrecognized psychological cost.",
  3: "Here are 3 stronger thesis alternatives:\n\n**\"Social media's algorithmic amplification of idealized lifestyles is rewiring adolescent self-worth around metrics of validation.\"**\nNames the specific mechanism (algorithms) and harm (self-worth tied to likes) \u2014 arguable and precise.\n\n**\"Instagram and TikTok don't cause teen depression \u2014 but their engagement-maximizing design makes existing vulnerabilities catastrophically worse.\"**\nThe concession-then-pivot structure makes this sophisticated and truly debatable.\n\n**\"Teens who curate online personas for peer approval are rehearsing a form of emotional labor that developmental psychology hasn't begun to address.\"**\nReframes the debate from \"social media bad\" to an unrecognized psychological cost, which is far more interesting to argue.",
  4: "Here are 3 stronger thesis alternatives:\n\n**\"Social media's algorithmic amplification of idealized lifestyles is rewiring adolescent self-worth around metrics of validation.\"**\nNames the specific mechanism (algorithms) and harm (self-worth tied to likes) \u2014 arguable and precise.\n\n**\"Instagram and TikTok don't cause teen depression \u2014 but their engagement-maximizing design makes existing vulnerabilities catastrophically worse.\"**\nThe concession-then-pivot structure makes this sophisticated and truly debatable, not a simple fact.\n\n**\"Teens curating online personas for peer approval rehearse emotional labor that developmental psychology hasn't begun to address.\"**\nReframes the debate from \"social media bad\" to an unrecognized psychological cost \u2014 far more interesting to argue.\n\nNotice how each one passes the \"so what?\" test. Your original thesis stated a position nobody would argue against. These invite genuine debate.",
  5: "Here are 3 stronger thesis alternatives:\n\n**\"Social media's algorithmic amplification of idealized lifestyles is rewiring adolescent self-worth around metrics of validation.\"**\nThis works because it names the specific mechanism (algorithms) and the specific harm (self-worth tied to likes). It's arguable \u2014 someone could counter that algorithms also surface positive content \u2014 and precise enough to build 5 paragraphs around.\n\n**\"Instagram and TikTok don't cause teen depression \u2014 but their engagement-maximizing design makes existing vulnerabilities catastrophically worse.\"**\nThe concession-then-pivot structure mirrors the example you gave about the gig economy. It's sophisticated, debatable, and avoids the simplistic \"social media bad\" framing.\n\n**\"Teens curating online personas for peer approval rehearse emotional labor that developmental psychology hasn't begun to address.\"**\nReframes the debate entirely. Instead of arguing effects everyone agrees on, it introduces a lens (emotional labor) that's genuinely novel for a high school essay.\n\nEach thesis is under 25 words, avoids clich\u00e9s, and passes the \"so what?\" test your original didn't.",
};

const SYSTEM_PROMPT = 'You are a helpful writing tutor. Respond to the user\'s prompt naturally. Keep your response concise and practical.';

type Mode = 'guided' | 'freeform';

export default function PromptMakeover() {
  const isMobile = useIsMobile();
  const { isPaid } = useAuth();
  const [active, setActive] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>('guided');
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [freeformText, setFreeformText] = useState('');
  const [fallbackTyping, setFallbackTyping] = useState(false);
  const [displayedFallback, setDisplayedFallback] = useState('');
  const [generatingBlock, setGeneratingBlock] = useState<string | null>(null);
  const [usedBlocks, setUsedBlocks] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState<'response' | 'share'>('response');
  const responseRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blockAbortRef = useRef<AbortController | null>(null);

  const score = active.size;

  // Live AI streaming (only used in freeform mode)
  const { response: liveResponse, isStreaming, error: liveError, sendMessages, abort } =
    useStreamingResponse({ systemPrompt: SYSTEM_PROMPT, maxTokens: 1024 });

  // Fallback typewriter effect for guided mode
  const fallbackText = fallbackResponses[score] || fallbackResponses[0];
  useEffect(() => {
    if (mode !== 'guided') return;
    setFallbackTyping(true);
    setDisplayedFallback('');

    let i = 0;
    const interval = setInterval(() => {
      if (i < fallbackText.length) {
        setDisplayedFallback(fallbackText.slice(0, i + 1));
        i++;
      } else {
        setFallbackTyping(false);
        clearInterval(interval);
      }
    }, 8);

    return () => clearInterval(interval);
  }, [score, mode]);

  const displayedResponse = mode === 'guided' ? displayedFallback : liveResponse;
  const isTyping = mode === 'guided' ? fallbackTyping : isStreaming;

  const toggle = (id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buildPrompt = () => {
    const parts: { text: string; color: string }[] = [];
    if (active.size === 0) return [{ text: 'help me with my essay', color: '#6B7280' }];

    blocks.forEach((b) => {
      if (active.has(b.id)) {
        parts.push({ text: b.text, color: b.color });
      }
    });
    return parts;
  };

  const handleSendFreeform = () => {
    const text = freeformText.trim();
    if (!text || isStreaming) return;
    sendMessages([{ role: 'user', content: text }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendFreeform();
    }
  };

  // Generate a building block clause tailored to the current prompt
  const handleGenerateBlock = (block: BuildingBlock) => {
    const currentText = freeformText.trim();
    if (!currentText || generatingBlock) return;

    setGeneratingBlock(block.id);
    let generated = '';

    const systemPrompt = `You are a prompt-engineering assistant. The user has written part of an AI prompt and wants to add a "${block.label}" clause to strengthen it.

What "${block.label}" means: ${block.hint}

Rules:
- Read the user's existing prompt carefully
- Generate ONLY the ${block.label.toLowerCase()} clause text \u2014 no explanation, no labels, no quotes
- Make it specific and relevant to their topic
- Write it as text they can append directly to their prompt
- Keep it to 1-2 sentences
- Do NOT repeat what's already in their prompt`;

    blockAbortRef.current = streamChat({
      messages: [{ role: 'user', content: `Here is my current prompt:\n\n${currentText}\n\nGenerate a "${block.label}" clause I can add to this prompt.` }],
      systemPrompt,
      maxTokens: 200,
      source: 'block-gen',
      onChunk: (text) => { generated += text; },
      onDone: () => {
        const trimmed = generated.trim();
        if (trimmed) {
          setFreeformText((prev) => {
            const p = prev.trim();
            return p ? p + ' ' + trimmed : trimmed;
          });
          setUsedBlocks((prev) => new Set(prev).add(block.id));
        }
        setGeneratingBlock(null);
        textareaRef.current?.focus();
      },
      onError: () => {
        setGeneratingBlock(null);
      },
    });
  };

  // When switching to freeform, seed the textarea with the current guided prompt
  const handleModeSwitch = (newMode: Mode) => {
    if (newMode === 'freeform' && mode === 'guided') {
      if (!isPaid) {
        setShowUnlockPrompt(true);
        setMode('freeform');
        return;
      }
      const guidedText = active.size === 0
        ? ''
        : blocks.filter((b) => active.has(b.id)).map((b) => b.text).join(' ');
      setFreeformText(guidedText);
      setUsedBlocks(new Set());
      setGeneratingBlock(null);
      blockAbortRef.current?.abort();
      abort();
    }
    if (newMode === 'guided') {
      setShowUnlockPrompt(false);
    }
    setMode(newMode);
  };

  const qualityPercent = Math.min(100, score * 20);

  // Helper to render AI response content (reused in main view and BottomSheet)
  const renderResponse = () => {
    if (mode === 'freeform' && !liveResponse && !isStreaming) {
      return <p style={{ color: '#6B7280', fontStyle: 'italic', margin: 0 }}>Write a prompt and hit send to see a real AI response...</p>;
    }
    return (
      <>
        {displayedResponse.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} style={{ fontWeight: 700, margin: '0.5em 0' }}>{line.replace(/\*\*/g, '')}</p>;
          }
          if (line.startsWith('**') && line.includes('**')) {
            const parts = line.split('**');
            return (
              <p key={i} style={{ margin: '0.5em 0' }}>
                {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : <span key={j}>{p}</span>)}
              </p>
            );
          }
          return line ? <p key={i} style={{ margin: '0.5em 0' }}>{line}</p> : <br key={i} />;
        })}
        {isTyping && <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#E94560', marginLeft: 2, animation: 'pulse 1s infinite' }} />}
      </>
    );
  };

  const showShareCard = (mode === 'guided' && qualityPercent === 100) || (mode === 'freeform' && liveResponse && !isStreaming);

  return (
    <div className="widget-container" style={isMobile ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}>
      {/* Header */}
      <div style={{ padding: isMobile ? '0.5rem 0.75rem' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: isMobile ? '0.5rem' : '1.25rem' }}>
          <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, background: 'linear-gradient(135deg, #E94560, #E9456080)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Prompt Makeover</h3>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Toggle building blocks to transform a vague prompt</p>
            )}
          </div>
          {/* Mode toggle */}
          <div style={{ display: 'flex', borderRadius: 100, border: '1px solid rgba(26,26,46,0.1)', overflow: 'hidden', flexShrink: 0 }}>
            <button
              onClick={() => handleModeSwitch('guided')}
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
              onClick={() => handleModeSwitch('freeform')}
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
        </div>
      </div>

      {/* --- MOBILE LAYOUT --- */}
      {isMobile ? (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem' }}>
          {mode === 'guided' ? (
            <>
              {/* Quality meter - thin bar */}
              <div style={{ marginBottom: 8, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>Quality</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: qualityPercent > 60 ? '#16C79A' : qualityPercent > 20 ? '#F5A623' : '#6B7280' }}>{qualityPercent}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: 'all 0.5s ease',
                    width: `${qualityPercent}%`,
                    background: qualityPercent > 60 ? 'linear-gradient(90deg, #16C79A, #0EA5E9)' : qualityPercent > 20 ? 'linear-gradient(90deg, #F5A623, #E94560)' : '#6B7280',
                  }} />
                </div>
              </div>

              {/* Toggle switches - compact 2-column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8, flexShrink: 0 }}>
                {blocks.map((block) => {
                  const isActive = active.has(block.id);
                  return (
                    <button
                      key={block.id}
                      onClick={() => toggle(block.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                        minHeight: 38,
                        borderRadius: 8, border: '1px solid', cursor: 'pointer', transition: 'all 0.25s ease',
                        background: isActive ? `${block.color}08` : 'transparent',
                        borderColor: isActive ? `${block.color}30` : 'rgba(26,26,46,0.06)',
                      }}
                    >
                      <div style={{
                        width: 30, height: 16, borderRadius: 8, position: 'relative' as const, flexShrink: 0,
                        background: isActive ? block.color : 'rgba(26,26,46,0.12)', transition: 'background 0.3s',
                      }}>
                        <div style={{
                          position: 'absolute' as const, top: 2, left: isActive ? 16 : 2,
                          width: 12, height: 12, borderRadius: '50%', background: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.3s ease',
                        }} />
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 600,
                        color: isActive ? block.color : '#6B7280', transition: 'color 0.25s',
                      }}>
                        {block.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prompt display - max 4 lines clamped */}
              <div style={{
                background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10,
                padding: '0.6rem 0.75rem', marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.6,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as any,
                flexShrink: 0,
              }}>
                {buildPrompt().map((part, i) => (
                  <span key={i} style={{
                    color: part.color, display: 'inline',
                    borderBottom: part.color !== '#6B7280' ? `2px solid ${part.color}20` : 'none',
                  }}>
                    {i > 0 && ' '}
                    {part.text}
                  </span>
                ))}
              </div>

              {/* See AI Response button */}
              <div style={{ marginTop: 'auto', flexShrink: 0, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setSheetContent('response'); setSheetOpen(true); }}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                    background: '#1A1A2E', color: '#FAF8F5', minHeight: 42,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: isTyping ? '#16C79A' : '#6B7280' }} />
                  {isTyping ? 'Generating...' : 'See AI Response'}
                </button>
                {showShareCard && (
                  <button
                    onClick={() => { setSheetContent('share'); setSheetOpen(true); }}
                    style={{
                      padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(26,26,46,0.12)', cursor: 'pointer',
                      background: 'transparent', color: '#6B7280', minHeight: 42,
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                    }}
                  >
                    Share
                  </button>
                )}
              </div>
            </>
          ) : (showUnlockPrompt && !isPaid) ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center' }}>
              <UnlockModal feature="Live AI mode" accentColor="#16C79A" />
            </div>
          ) : (
            /* Freeform mode mobile */
            <>
              <textarea
                ref={textareaRef}
                value={freeformText}
                onChange={(e) => setFreeformText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type any prompt here..."
                style={{
                  width: '100%', flex: 1, minHeight: 80, padding: '0.75rem',
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 1.6,
                  background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 10,
                  resize: 'none' as const, outline: 'none', color: '#1A1A2E',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#7B61FF40'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
              />

              {/* Building block chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5, marginTop: 8, flexShrink: 0 }}>
                {blocks.map((block) => {
                  const isUsed = usedBlocks.has(block.id);
                  const isLoading = generatingBlock === block.id;
                  const isDisabled = isUsed || isLoading || !!generatingBlock || !freeformText.trim();
                  return (
                    <button
                      key={block.id}
                      onClick={() => handleGenerateBlock(block)}
                      disabled={isDisabled}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 8px', borderRadius: 100, border: '1px solid',
                        cursor: isDisabled ? 'default' : 'pointer',
                        fontSize: '0.7rem', fontWeight: 600,
                        fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
                        background: isUsed ? `${block.color}10` : 'transparent',
                        borderColor: isUsed ? `${block.color}30` : isLoading ? block.color : 'rgba(26,26,46,0.1)',
                        color: isUsed ? `${block.color}80` : !freeformText.trim() ? '#B0B0B0' : block.color,
                        opacity: isUsed ? 0.6 : 1,
                      }}
                    >
                      <span style={{
                        width: 14, height: 14, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 800, color: 'white',
                        background: isUsed ? `${block.color}60` : !freeformText.trim() ? '#C0C0C0' : block.color,
                        animation: isLoading ? 'pulse 1s infinite' : 'none',
                      }}>
                        {block.letter}
                      </span>
                      {isLoading ? '...' : isUsed ? `${block.label}` : `+${block.label}`}
                    </button>
                  );
                })}
              </div>

              {/* Send button */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexShrink: 0 }}>
                <button
                  onClick={handleSendFreeform}
                  disabled={!freeformText.trim() || isStreaming}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                    background: !freeformText.trim() || isStreaming ? 'rgba(26,26,46,0.08)' : '#1A1A2E',
                    color: !freeformText.trim() || isStreaming ? '#6B7280' : '#FAF8F5', minHeight: 42,
                  }}
                >
                  {isStreaming ? 'Generating...' : 'Send to Claude'}
                </button>
                {(liveResponse || isStreaming) && (
                  <button
                    onClick={() => { setSheetContent('response'); setSheetOpen(true); }}
                    style={{
                      padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(26,26,46,0.12)', cursor: 'pointer',
                      background: 'transparent', color: '#6B7280', minHeight: 42,
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: isStreaming ? '#16C79A' : '#6B7280' }} />
                    Response
                  </button>
                )}
              </div>
              {liveError && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#E94560', marginTop: 4, display: 'block', flexShrink: 0 }}>
                  {liveError}
                </span>
              )}
            </>
          )}

          {/* Mobile BottomSheet */}
          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title={sheetContent === 'response' ? 'AI Response' : 'Share'}
          >
            {sheetContent === 'response' ? (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.75,
                color: '#1A1A2E', whiteSpace: 'pre-wrap' as const,
              }}>
                {mode === 'freeform' && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#16C79A', background: 'rgba(22,199,154,0.08)', padding: '2px 8px', borderRadius: 100, display: 'inline-block', marginBottom: 10 }}>LIVE</span>
                )}
                {renderResponse()}
              </div>
            ) : (
              <ShareCard
                title="Prompt Makeover"
                metric={mode === 'guided' ? '100%' : 'Complete'}
                metricColor={mode === 'guided' ? '#16C79A' : '#7B61FF'}
                subtitle="I took a 0% prompt to 100% and watched the AI response completely transform."
                accentColor="#E94560"
                tweetText={`I took a 0% prompt to 100% and watched the AI response completely transform \u2014 live. Try it:`}
                shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/ch1#prompt-makeover` : undefined}
              />
            )}
          </BottomSheet>
        </div>
      ) : (
        /* --- DESKTOP LAYOUT (unchanged) --- */
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 400 }}>
            {/* Left: Prompt */}
            <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid rgba(26,26,46,0.06)' }}>

              {mode === 'guided' ? (
                <>
                  {/* Quality meter */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>Prompt Quality</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: qualityPercent > 60 ? '#16C79A' : qualityPercent > 20 ? '#F5A623' : '#6B7280' }}>{qualityPercent}%</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, transition: 'all 0.5s ease',
                        width: `${qualityPercent}%`,
                        background: qualityPercent > 60 ? 'linear-gradient(90deg, #16C79A, #0EA5E9)' : qualityPercent > 20 ? 'linear-gradient(90deg, #F5A623, #E94560)' : '#6B7280',
                      }} />
                    </div>
                  </div>

                  {/* Prompt display (read-only, color-coded) */}
                  <div style={{
                    background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10,
                    padding: '1.25rem 1.5rem', marginBottom: '1.25rem', minHeight: 120, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.7,
                  }}>
                    {buildPrompt().map((part, i) => (
                      <span key={i} style={{
                        color: part.color, display: 'inline',
                        transition: 'opacity 0.3s ease',
                        borderBottom: part.color !== '#6B7280' ? `2px solid ${part.color}20` : 'none',
                      }}>
                        {i > 0 && ' '}
                        {part.text}
                      </span>
                    ))}
                  </div>

                  {/* Toggle switches */}
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    {blocks.map((block) => {
                      const isActive = active.has(block.id);
                      return (
                        <button
                          key={block.id}
                          onClick={() => toggle(block.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                            borderRadius: 8, border: '1px solid', cursor: 'pointer', transition: 'all 0.25s ease',
                            background: isActive ? `${block.color}08` : 'transparent',
                            borderColor: isActive ? `${block.color}30` : 'rgba(26,26,46,0.06)',
                          }}
                        >
                          <div style={{
                            width: 36, height: 20, borderRadius: 10, position: 'relative' as const,
                            background: isActive ? block.color : 'rgba(26,26,46,0.12)', transition: 'background 0.3s',
                          }}>
                            <div style={{
                              position: 'absolute' as const, top: 2, left: isActive ? 18 : 2,
                              width: 16, height: 16, borderRadius: '50%', background: 'white',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.3s ease',
                            }} />
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 600,
                            color: isActive ? block.color : '#6B7280', transition: 'color 0.25s',
                          }}>
                            {block.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (showUnlockPrompt && !isPaid) ? (
                <div style={{ display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', minHeight: 280 }}>
                  <UnlockModal feature="Live AI mode" accentColor="#16C79A" />
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>Your Prompt</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={freeformText}
                    onChange={(e) => setFreeformText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type any prompt here \u2014 or click the building blocks below to assemble one..."
                    style={{
                      width: '100%', minHeight: 180, padding: '1rem 1.25rem',
                      fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.7,
                      background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 10,
                      resize: 'vertical' as const, outline: 'none', color: '#1A1A2E',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#7B61FF40'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 10 }}>
                    {blocks.map((block) => {
                      const isUsed = usedBlocks.has(block.id);
                      const isLoading = generatingBlock === block.id;
                      const isDisabled = isUsed || isLoading || !!generatingBlock || !freeformText.trim();
                      return (
                        <button
                          key={block.id}
                          onClick={() => handleGenerateBlock(block)}
                          disabled={isDisabled}
                          title={!freeformText.trim() ? 'Write something first so AI can tailor this block to your topic' : block.hint}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '5px 10px', borderRadius: 100, border: '1px solid',
                            cursor: isDisabled ? 'default' : 'pointer',
                            transition: 'all 0.2s', fontSize: '0.75rem', fontWeight: 600,
                            fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
                            background: isUsed ? `${block.color}10` : isLoading ? `${block.color}08` : 'transparent',
                            borderColor: isUsed ? `${block.color}30` : isLoading ? block.color : 'rgba(26,26,46,0.1)',
                            color: isUsed ? `${block.color}80` : !freeformText.trim() ? '#B0B0B0' : block.color,
                            opacity: isUsed ? 0.6 : 1,
                          }}
                        >
                          <span style={{
                            width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 800, color: 'white',
                            background: isUsed ? `${block.color}60` : !freeformText.trim() ? '#C0C0C0' : block.color,
                            animation: isLoading ? 'pulse 1s infinite' : 'none',
                          }}>
                            {block.letter}
                          </span>
                          {isLoading ? 'Generating...' : isUsed ? `${block.label} \u2713` : `+ ${block.label}`}
                        </button>
                      );
                    })}
                  </div>
                  {!freeformText.trim() && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#B0B0B0', marginTop: 6, lineHeight: 1.4 }}>
                      Type a prompt first \u2014 then click blocks to generate tailored additions
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <button
                      onClick={handleSendFreeform}
                      disabled={!freeformText.trim() || isStreaming}
                      style={{
                        padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                        letterSpacing: '0.04em', transition: 'all 0.25s',
                        background: !freeformText.trim() || isStreaming ? 'rgba(26,26,46,0.08)' : '#1A1A2E',
                        color: !freeformText.trim() || isStreaming ? '#6B7280' : '#FAF8F5',
                        minHeight: 44,
                      }}
                    >
                      {isStreaming ? 'Generating...' : 'Send to Claude \u2192'}
                    </button>
                    {liveError && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560' }}>
                        {liveError}
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', marginTop: 8, lineHeight: 1.5 }}>
                    Building blocks generate AI-tailored additions &middot; Edit freely &middot; Enter to send
                  </p>
                </>
              )}
            </div>

            {/* Right: AI Response */}
            <div style={{ padding: '1.5rem 2rem', background: 'rgba(26,26,46,0.015)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: isTyping ? '#16C79A' : '#6B7280', transition: 'background 0.3s' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>
                  {isTyping ? 'Generating...' : 'AI Response'}
                </span>
                {mode === 'freeform' && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#16C79A', marginLeft: 'auto', background: 'rgba(22,199,154,0.08)', padding: '2px 8px', borderRadius: 100 }}>
                    LIVE
                  </span>
                )}
              </div>
              <div ref={responseRef} style={{
                fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.75,
                color: '#1A1A2E', whiteSpace: 'pre-wrap' as const, maxHeight: 380, overflowY: 'auto' as const,
              }}>
                {renderResponse()}
              </div>
            </div>
          </div>

          {/* ShareCard \u2014 desktop only here */}
          {showShareCard && (
            <div style={{ padding: '0 2rem 1.5rem' }}>
              <ShareCard
                title="Prompt Makeover"
                metric={mode === 'guided' ? '100%' : 'Complete'}
                metricColor={mode === 'guided' ? '#16C79A' : '#7B61FF'}
                subtitle="I took a 0% prompt to 100% and watched the AI response completely transform."
                accentColor="#E94560"
                tweetText={`I took a 0% prompt to 100% and watched the AI response completely transform \u2014 live. Try it:`}
                shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/ch1#prompt-makeover` : undefined}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

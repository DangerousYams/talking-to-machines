import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { useStreamingResponse } from '../../../hooks/useStreamingResponse';
import { streamChat } from '../../../lib/claude';
import { useAuth } from '../../../hooks/useAuth';
import UnlockModal from '../../ui/UnlockModal';
import { useTranslation, getLocale } from '../../../i18n/useTranslation';
import { languages } from '../../../data/languages';

interface BuildingBlock {
  id: string;
  label: string;
  letter: string;
  color: string;
  text: string;
  hint: string;
}

const blockData = [
  { id: 'role', labelKey: 'blockRoleLabel', letter: 'R', color: '#E94560', textKey: 'blockRoleText', hintKey: 'blockRoleHint' },
  { id: 'task', labelKey: 'blockTaskLabel', letter: 'T', color: '#0F3460', textKey: 'blockTaskText', hintKey: 'blockTaskHint' },
  { id: 'format', labelKey: 'blockFormatLabel', letter: 'F', color: '#7B61FF', textKey: 'blockFormatText', hintKey: 'blockFormatHint' },
  { id: 'constraints', labelKey: 'blockConstraintsLabel', letter: 'C', color: '#16C79A', textKey: 'blockConstraintsText', hintKey: 'blockConstraintsHint' },
  { id: 'examples', labelKey: 'blockExamplesLabel', letter: 'E', color: '#F5A623', textKey: 'blockExamplesText', hintKey: 'blockExamplesHint' },
] as const;

const fallbackResponses: Record<number, string> = {
  0: "Sure! I can help you design a sneaker. Here are some ideas:\n\nYou could try a retro-inspired design with modern materials. Consider using bold colors and unique textures. Think about what makes a sneaker stand out on the shelf.\n\nWould you like me to brainstorm more specific ideas?",
  1: "Here's a sneaker concept for you:\n\n**The Phantom Pulse**\n\nA sleek all-black sneaker with a subtle iridescent panel on the heel. It's designed for people who want something stylish but understated. The sole has extra cushioning for all-day wear.\n\nIt could work well as a limited drop because of the unique color-shifting material.",
  2: "**The Phantom Pulse**\n\n**Colorway:** Midnight black base with an oil-slick iridescent heel panel that shifts between deep purple, emerald, and midnight blue depending on the angle. Matte black everything else — laces, sole, tongue.\n\n**Signature Detail:** The heel panel is made from a recycled ocean plastic composite that creates a unique, unrepeatable pattern on every single pair. No two are identical.\n\n**The Story:** Every sneaker tells you to stand out. This one says: you already do — the shoe just catches the light differently when you move.",
  3: "**The Phantom Pulse**\n\n**Colorway:** Midnight black base with an oil-slick iridescent heel panel that shifts between deep purple, emerald, and midnight blue depending on the angle. Matte black everything else — laces, sole, tongue.\n\n**Signature Detail:** The heel panel is made from a recycled ocean plastic composite that creates a unique, unrepeatable pattern on every single pair. No two are identical — your pair is literally one-of-one.\n\n**The Story:** Every sneaker tells you to stand out. This one says: you already do — the shoe just catches the light differently when you move. Inspired by how oil on wet pavement turns an ugly puddle into something you can't stop staring at.",
  4: "**The Phantom Pulse**\n\n**Colorway:** Midnight black base with an oil-slick iridescent heel panel that shifts between deep purple, emerald, and midnight blue depending on the angle. Matte black everything else — laces, sole, tongue. The restraint is the point.\n\n**Signature Detail:** The heel panel is made from a recycled ocean plastic composite that creates a unique, unrepeatable swirl pattern on every single pair. No two are identical — your pair is literally one-of-one. A serial number is laser-etched into the insole.\n\n**The Story:** The designer was walking through Tokyo after rain, watching oil puddles on asphalt catch neon light. An ugly thing made beautiful by angle and light. That's the concept: the shoe doesn't scream — it shifts. You notice it when someone moves, not when they pose.\n\nThe iridescent heel only reveals itself in motion. Standing still, it's just a clean black shoe. Walking, it comes alive. The tagline: \"Move different.\"",
  5: "**The Phantom Pulse**\n\n**Colorway:** Midnight black base with an oil-slick iridescent heel panel that shifts between deep purple, emerald, and midnight blue depending on the angle. Matte black everything else — laces, sole, tongue. The restraint is the point — like Dieter Rams designed a Jordan.\n\n**Signature Detail:** The heel panel is made from a recycled ocean plastic composite that creates a unique, unrepeatable swirl pattern on every single pair. No two are identical — your pair is literally one-of-one. A serial number laser-etched into the insole links to a digital certificate. But this isn't about blockchain gimmicks — it's about the fact that the material itself refuses to repeat.\n\n**The Story:** Walking through Tokyo after rain. Oil puddles on asphalt catching neon light — like the Pompidou Centre moment, but for a generation that finds beauty in imperfection, not architecture. An ugly thing made beautiful by angle and light.\n\nThe iridescent heel only reveals itself in motion. Standing still, it's just a clean black shoe. Walking, it comes alive. The tagline: \"Move different.\"\n\nThis sells out because it inverts the hypebeast formula: instead of loud colors demanding attention, it rewards the people who actually look closely. The scarcity isn't artificial — it's built into the material.",
};

const BASE_SYSTEM_PROMPT = 'You are a creative design assistant. Respond to the user\'s prompt naturally. Keep your response concise and vivid.';

type Mode = 'guided' | 'freeform';

export default function PromptMakeover() {
  const isMobile = useIsMobile();
  const { isPaid } = useAuth();
  const t = useTranslation('promptMakeover');
  const locale = getLocale();
  const languageName = languages.find(l => l.code === locale)?.name || 'English';
  const SYSTEM_PROMPT = locale === 'en' ? BASE_SYSTEM_PROMPT : `${BASE_SYSTEM_PROMPT}\n\nIMPORTANT: Respond entirely in ${languageName}.`;

  const blocks: BuildingBlock[] = blockData.map(bd => ({
    id: bd.id,
    letter: bd.letter,
    color: bd.color,
    label: t(bd.labelKey, bd.id === 'role' ? 'Role' : bd.id === 'task' ? 'Task' : bd.id === 'format' ? 'Format' : bd.id === 'constraints' ? 'Constraints' : 'Examples'),
    text: t(bd.textKey, bd.id === 'role' ? 'You are a legendary sneaker designer who has worked at Nike and Off-White, known for creating hype-worthy limited drops.'
      : bd.id === 'task' ? 'Design a sneaker concept that would sell out in under 10 minutes. Give it a name, describe the colorway, the key design detail that makes it iconic, and the story behind it.'
      : bd.id === 'format' ? 'Format the response as: Sneaker name (bold), followed by Colorway, Signature Detail, and The Story — each as a short paragraph.'
      : bd.id === 'constraints' ? 'The design must feel achievable — no sci-fi gimmicks. It should appeal to 16-25 year olds. Avoid anything that\'s already been done by Yeezy or Travis Scott collabs.'
      : 'For inspiration, here\'s the level of detail I want: "The Nike Air Max 1 worked because Tinker Hatfield saw the Pompidou Centre in Paris and thought: what if you could see the guts of a shoe?" Give me that kind of origin story.'),
    hint: t(bd.hintKey, bd.id === 'role' ? 'Assign the AI a specific expert role/persona relevant to the task'
      : bd.id === 'task' ? 'Define the specific task — what exactly should the AI do?'
      : bd.id === 'format' ? 'Specify the output format — how many items, what structure, any formatting rules'
      : bd.id === 'constraints' ? 'Add quality constraints — what to avoid, length limits, tone requirements'
      : 'Provide an example of the quality/style you want'),
  }));
  const [active, setActive] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>('guided');
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [freeformText, setFreeformText] = useState('');
  const [fallbackTyping, setFallbackTyping] = useState(false);
  const [displayedFallback, setDisplayedFallback] = useState('');
  const [generatingBlock, setGeneratingBlock] = useState<string | null>(null);
  const [usedBlocks, setUsedBlocks] = useState<Set<string>>(new Set());
  const [responseExpanded, setResponseExpanded] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blockAbortRef = useRef<AbortController | null>(null);

  const score = active.size;

  // Live AI streaming (only used in freeform mode)
  const liveSystemPrompt = locale === 'en' ? BASE_SYSTEM_PROMPT : `${BASE_SYSTEM_PROMPT}\n\nIMPORTANT: Respond entirely in ${languageName}.`;
  const { response: liveResponse, isStreaming, error: liveError, sendMessages, abort } =
    useStreamingResponse({ systemPrompt: liveSystemPrompt, maxTokens: 1024 });

  // Fallback typewriter effect for guided mode
  const fallbackText = fallbackResponses[score] || fallbackResponses[0];
  useEffect(() => {
    if (mode !== 'guided') return;
    setFallbackTyping(true);
    setDisplayedFallback('');
    setResponseExpanded(false);

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
    const parts: { text: string; color: string }[] = [
      { text: t('basePrompt', 'Design me a cool sneaker.'), color: '#6B7280' },
    ];
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
    setResponseExpanded(false);
    sendMessages([{ role: 'user', content: text }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendFreeform();
    }
  };

  const handleGenerateBlock = (block: BuildingBlock) => {
    const currentText = freeformText.trim();
    if (!currentText || generatingBlock) return;

    setGeneratingBlock(block.id);
    let generated = '';

    const blockSystemPrompt = `You are a prompt-engineering assistant. The user has written part of an AI prompt and wants to add a "${block.label}" clause to strengthen it.

What "${block.label}" means: ${block.hint}

Rules:
- Read the user's existing prompt carefully
- Generate ONLY the ${block.label.toLowerCase()} clause text — no explanation, no labels, no quotes
- Make it specific and relevant to their topic
- Write it as text they can append directly to their prompt
- Keep it to 1-2 sentences
- Do NOT repeat what's already in their prompt${locale !== 'en' ? `\n\nIMPORTANT: Respond entirely in ${languageName}.` : ''}`;

    blockAbortRef.current = streamChat({
      messages: [{ role: 'user', content: `Here is my current prompt:\n\n${currentText}\n\nGenerate a "${block.label}" clause I can add to this prompt.` }],
      systemPrompt: blockSystemPrompt,
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

  const handleModeSwitch = (newMode: Mode) => {
    if (newMode === 'freeform' && mode === 'guided') {
      if (!isPaid) {
        setShowUnlockPrompt(true);
        setMode('freeform');
        return;
      }
      setFreeformText('');
      setUsedBlocks(new Set());
      setGeneratingBlock(null);
      setResponseExpanded(false);
      blockAbortRef.current?.abort();
      abort();
    }
    if (newMode === 'guided') {
      setShowUnlockPrompt(false);
    }
    setMode(newMode);
  };

  const qualityPercent = Math.min(100, score * 20);


  const renderResponse = () => {
    if (mode === 'freeform' && !liveResponse && !isStreaming) {
      return <p style={{ color: '#6B7280', fontStyle: 'italic', margin: 0 }}>{t('writePromptHint', 'Write a prompt and hit send to see a real AI response...')}</p>;
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

  const responseIsLong = displayedResponse.length > 400;

  return (
    <div className="widget-container">
      {/* Header + Mode tabs */}
      <div style={{ borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ padding: isMobile ? '0.75rem 1rem 0' : '1.25rem 2rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, background: 'linear-gradient(135deg, #E94560, #E9456080)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>{t('title', 'Prompt Makeover')}</h3>
          </div>
        </div>

      </div>

      {/* Unified layout — stacked on mobile, side-by-side on desktop */}
      <div style={isMobile ? {} : { display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        {/* Left: Prompt controls */}
        <div style={{ padding: isMobile ? '0.75rem 1rem' : '1.5rem 2rem', borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)', borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none' }}>

          {mode === 'guided' ? (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: isMobile ? 'none' : 420 }}>
              {/* Toggle switches — compact row on top */}
              <div style={{
                display: 'flex', flexWrap: 'wrap' as const, gap: 6,
                marginBottom: isMobile ? 8 : 12,
              }}>
                {blocks.map((block) => {
                  const isActive = active.has(block.id);
                  return (
                    <button
                      key={block.id}
                      onClick={() => toggle(block.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 100,
                        border: '1px solid', cursor: 'pointer', transition: 'all 0.25s ease',
                        background: isActive ? `${block.color}12` : 'transparent',
                        borderColor: isActive ? block.color : 'rgba(26,26,46,0.1)',
                      }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800, color: 'white',
                        background: isActive ? block.color : 'rgba(26,26,46,0.15)',
                        transition: 'background 0.25s',
                      }}>
                        {block.letter}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                        color: isActive ? block.color : '#6B7280', transition: 'color 0.25s',
                      }}>
                        {block.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quality meter */}
              <div style={{ marginBottom: isMobile ? 8 : 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>{t('promptQuality', 'Prompt Quality')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: qualityPercent > 60 ? '#16C79A' : qualityPercent > 20 ? '#F5A623' : '#6B7280' }}>{qualityPercent}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: 'all 0.5s ease',
                    width: `${qualityPercent}%`,
                    background: qualityPercent > 60 ? 'linear-gradient(90deg, #16C79A, #0EA5E9)' : qualityPercent > 20 ? 'linear-gradient(90deg, #F5A623, #E94560)' : '#6B7280',
                  }} />
                </div>
              </div>

              {/* Prompt display — scrollable, fills remaining space */}
              <div style={{
                flex: 1, minHeight: 0,
                background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10,
                padding: isMobile ? '0.6rem 0.75rem' : '1rem 1.25rem',
                fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.72rem' : '0.8rem', lineHeight: 1.7,
                overflowY: 'auto' as const,
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

              {/* Try my own prompt button */}
              <button
                onClick={() => handleModeSwitch('freeform')}
                style={{
                  width: '100%', marginTop: isMobile ? 10 : 12,
                  padding: '11px 0', borderRadius: 8,
                  border: 'none',
                  background: '#16C79A',
                  cursor: 'pointer', transition: 'all 0.25s',
                  fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                  fontWeight: 700, letterSpacing: '0.04em', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 2px 8px rgba(22,199,154,0.25)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(22,199,154,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,199,154,0.25)'; }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16C79A', flexShrink: 0 }} />
                {t('tryOwnPrompt', 'Try my own prompt')}
              </button>
            </div>
          ) : (showUnlockPrompt && !isPaid) ? (
            <div style={{ display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', minHeight: isMobile ? 200 : 280 }}>
              <UnlockModal feature="Live AI mode" accentColor="#16C79A" />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#16C79A', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16C79A' }} />
                  {t('liveAI', 'Live AI')}
                </span>
                <button
                  onClick={() => handleModeSwitch('guided')}
                  style={{
                    padding: '3px 10px', borderRadius: 100,
                    border: '1px solid rgba(26,26,46,0.1)', background: 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem', fontWeight: 600, color: '#6B7280',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.25)'; e.currentTarget.style.color = '#1A1A2E'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'; e.currentTarget.style.color = '#6B7280'; }}
                >
                  &larr; {t('backToGuided', 'Back to guided')}
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={freeformText}
                onChange={(e) => setFreeformText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('freeformPlaceholder', 'Type any prompt, then click the building blocks below to strengthen it...')}
                style={{
                  width: '100%', minHeight: isMobile ? 100 : 180, padding: isMobile ? '0.75rem' : '1rem 1.25rem',
                  fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.8rem' : '0.85rem', lineHeight: 1.7,
                  background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 10,
                  resize: 'vertical' as const, outline: 'none', color: '#1A1A2E',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#7B61FF40'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
              />

              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: isMobile ? 5 : 6, marginTop: isMobile ? 8 : 10 }}>
                {blocks.map((block) => {
                  const isUsed = usedBlocks.has(block.id);
                  const isLoading = generatingBlock === block.id;
                  const isDisabled = isUsed || isLoading || !!generatingBlock || !freeformText.trim();
                  return (
                    <button
                      key={block.id}
                      onClick={() => handleGenerateBlock(block)}
                      disabled={isDisabled}
                      title={!freeformText.trim() ? t('writeFirstTooltip', 'Write something first so AI can tailor this block to your topic') : block.hint}
                      style={{
                        display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 5,
                        padding: isMobile ? '4px 8px' : '5px 10px', borderRadius: 100, border: '1px solid',
                        cursor: isDisabled ? 'default' : 'pointer',
                        transition: 'all 0.2s', fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 600,
                        fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
                        background: isUsed ? `${block.color}10` : isLoading ? `${block.color}08` : 'transparent',
                        borderColor: isUsed ? `${block.color}30` : isLoading ? block.color : 'rgba(26,26,46,0.1)',
                        color: isUsed ? `${block.color}80` : !freeformText.trim() ? '#B0B0B0' : block.color,
                        opacity: isUsed ? 0.6 : 1,
                      }}
                    >
                      <span style={{
                        width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, borderRadius: isMobile ? 3 : 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 800, color: 'white',
                        background: isUsed ? `${block.color}60` : !freeformText.trim() ? '#C0C0C0' : block.color,
                        animation: isLoading ? 'pulse 1s infinite' : 'none',
                      }}>
                        {block.letter}
                      </span>
                      {isLoading ? (isMobile ? '...' : t('generating', 'Generating...')) : isUsed ? `${block.label}${isMobile ? '' : ' \u2713'}` : `+${isMobile ? '' : ' '}${block.label}`}
                    </button>
                  );
                })}
              </div>
              {!freeformText.trim() && !isMobile && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#B0B0B0', marginTop: 6, lineHeight: 1.4 }}>
                  {t('typePromptFirst', 'Type a prompt first — then click blocks to generate tailored additions')}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: isMobile ? 8 : 12 }}>
                <button
                  onClick={handleSendFreeform}
                  disabled={!freeformText.trim() || isStreaming}
                  style={{
                    padding: isMobile ? '10px 16px' : '10px 20px', borderRadius: isMobile ? 10 : 8,
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                    letterSpacing: '0.04em', transition: 'all 0.25s',
                    background: !freeformText.trim() || isStreaming ? 'rgba(26,26,46,0.08)' : '#1A1A2E',
                    color: !freeformText.trim() || isStreaming ? '#6B7280' : '#FAF8F5',
                    minHeight: isMobile ? 42 : 44,
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  {isStreaming ? t('generating', 'Generating...') : `${t('sendToClaude', 'Send to Claude')}${isMobile ? '' : ' \u2192'}`}
                </button>
                {liveError && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#E94560' }}>
                    {liveError}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right / Below: AI Response — inline, with expand pattern */}
        <div style={{ padding: isMobile ? '0.75rem 1rem' : '1.5rem 2rem', background: 'rgba(26,26,46,0.015)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isTyping ? '#16C79A' : '#6B7280', transition: 'background 0.3s' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>
              {isTyping ? t('generating', 'Generating...') : t('aiResponse', 'AI Response')}
            </span>
            {mode === 'freeform' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#16C79A', marginLeft: 'auto', background: 'rgba(22,199,154,0.08)', padding: '2px 8px', borderRadius: 100 }}>
                LIVE
              </span>
            )}
          </div>

          {/* Response — scrollable */}
          <div
            ref={responseRef}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.75,
              color: '#1A1A2E', whiteSpace: 'pre-wrap' as const,
              maxHeight: isMobile ? 250 : 320,
              overflowY: 'auto' as const,
            }}
          >
            {renderResponse()}
          </div>
        </div>
      </div>

    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { getPersona } from '../../lib/persona';
import { streamChat } from '../../lib/claude';

interface Props {
  chapterSlug: string;
  chapterTitle: string;
  chapterConcepts: string;
  accentColor: string;
}

const CACHE_PREFIX = 'ttm_foryou2_';

export default function ForYouCard({ chapterSlug, chapterTitle, chapterConcepts, accentColor }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visible, setVisible] = useState(false);
  const hasStarted = useRef(false);

  const [personaLabel, setPersonaLabel] = useState('');

  useEffect(() => {
    const persona = getPersona();
    if (!persona) return;
    // Build short label from profession + optional detail
    const prof = persona.selections.profession;
    const detail = persona.selections.professionDetail;
    setPersonaLabel(detail ? `${prof}, ${detail}` : prof);

    // Check cache first
    const cached = localStorage.getItem(CACHE_PREFIX + chapterSlug);
    if (cached) {
      setContent(cached);
      setVisible(true);
      return;
    }

    // Generate once
    if (hasStarted.current) return;
    hasStarted.current = true;
    setIsGenerating(true);

    let accumulated = '';

    streamChat({
      messages: [{
        role: 'user',
        content: `Chapter: "${chapterTitle}"\nKey concepts: ${chapterConcepts}\n\nStudent profile: ${persona.context}\nDomain keywords: ${persona.keywords.join(', ')}`,
      }],
      systemPrompt: `Write ONE punchy sentence (under 25 words) connecting this chapter's concept to the reader's domain. Be specific — name something from their field. No filler, no "As a...", no markdown.`,
      maxTokens: 60,
      source: 'personalize',
      skipPersona: true,
      onChunk: (text) => {
        accumulated += text;
        setContent(accumulated);
      },
      onDone: () => {
        setIsGenerating(false);
        setVisible(true);
        // Cache so we never regenerate
        try { localStorage.setItem(CACHE_PREFIX + chapterSlug, accumulated); } catch {}
      },
      onError: (err) => {
        setIsGenerating(false);
        console.warn('[ForYouCard] generation failed:', err);
      },
    });
  }, [chapterSlug, chapterTitle, chapterConcepts]);

  if (!content && !isGenerating) return null;

  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 1.5rem',
        opacity: visible || isGenerating ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}04)`,
          border: `1px solid ${accentColor}20`,
          borderRadius: 12,
          padding: '1.5rem 1.75rem',
          overflow: 'hidden',
        }}
      >
        {/* Left accent bar — gradient using accent color */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}60)`,
            borderRadius: '3px 0 0 3px',
          }}
        />

        {/* Label */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: accentColor,
            margin: '0 0 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          For you{personaLabel ? ` — ${personaLabel}` : ''}
        </p>

        {/* Content */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: 'var(--color-deep)',
            margin: 0,
            opacity: isGenerating ? 0.6 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          {content}
          {isGenerating && (
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: '1em',
                background: accentColor,
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                opacity: 0.5,
                animation: 'blink 0.8s infinite',
              }}
            />
          )}
        </p>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

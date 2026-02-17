import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

interface ComparisonEntry {
  prompt: string;
  toolA: { name: string; output: string; qualities: { quality: number; speed: number; style: number } };
  toolB: { name: string; output: string; qualities: { quality: number; speed: number; style: number } };
}

interface Category {
  name: string;
  color: string;
  comparisons: ComparisonEntry[];
}

const categories: Category[] = [
  {
    name: 'Image Gen',
    color: '#E94560',
    comparisons: [
      {
        prompt: 'A cozy bookshop on a rainy evening, warm light spilling from the windows, watercolor style',
        toolA: {
          name: 'Midjourney',
          output: 'Produces a highly artistic, painterly scene with rich atmospheric depth. The rain has a dreamy, almost impressionistic quality. Warm amber light creates stunning contrast against cool blues. The bookshop has intricate architectural detail and the watercolor texture feels hand-painted. Slightly stylized proportions give it a storybook charm.',
          qualities: { quality: 9, speed: 7, style: 10 },
        },
        toolB: {
          name: 'DALL-E 3',
          output: 'Creates a clean, well-composed scene that faithfully follows every element of the prompt. The watercolor style is applied consistently. The bookshop is recognizable and inviting, with readable book titles in the window. The rain looks realistic. The overall image is polished and commercially useful, though less artistically surprising than other options.',
          qualities: { quality: 8, speed: 9, style: 7 },
        },
      },
      {
        prompt: 'Logo for a sustainable coffee brand called "Ground Up" -- minimal, modern, earth tones',
        toolA: {
          name: 'Midjourney',
          output: 'Generates several artistic logo concepts with beautiful earth-tone palettes. The designs are visually striking but sometimes hard to use as actual logos -- they may be too detailed or not cleanly vectorizable. The coffee and sustainability themes merge in creative ways (leaf-cup hybrids, mountain shapes). Strong aesthetic, but needs designer cleanup.',
          qualities: { quality: 7, speed: 7, style: 9 },
        },
        toolB: {
          name: 'Ideogram',
          output: 'Produces clean, minimal logo concepts where "Ground Up" is rendered perfectly legibly. The text sits naturally within the design. Earth tones are applied thoughtfully. The logos look immediately usable -- closer to what a brand designer would deliver. Less artistically adventurous, but more practically ready for business cards and packaging.',
          qualities: { quality: 8, speed: 8, style: 7 },
        },
      },
    ],
  },
  {
    name: 'Writing',
    color: '#0F3460',
    comparisons: [
      {
        prompt: 'Write a persuasive essay opening about why schools should teach AI literacy, aimed at a school board audience',
        toolA: {
          name: 'Claude',
          output: '"In 2019, we debated whether to add coding to the curriculum. By 2024, AI had made much of that coding obsolete. The lesson isn\'t that we taught the wrong skill -- it\'s that we\'re always one step behind. AI literacy isn\'t another elective to squeeze in; it\'s the difference between students who shape their future and students who are shaped by it.\n\nConsider this: 78% of your students used an AI tool for schoolwork last month. Zero percent of them received guidance on how to use it well, verify its outputs, or understand its limitations..."',
          qualities: { quality: 9, speed: 8, style: 9 },
        },
        toolB: {
          name: 'GPT-4',
          output: '"Artificial intelligence is transforming every sector of our economy, from healthcare to finance to education itself. As we prepare our students for the workforce of tomorrow, we must ask ourselves: are we equipping them with the skills they need to thrive?\n\nAI literacy -- the ability to understand, use, and critically evaluate artificial intelligence systems -- has become as fundamental as reading and mathematics. According to a recent McKinsey report, 70% of companies are expected to adopt AI by 2030..."',
          qualities: { quality: 8, speed: 9, style: 7 },
        },
      },
      {
        prompt: 'Write a funny, self-aware product description for noise-canceling headphones',
        toolA: {
          name: 'Claude',
          output: '"Look, we both know you\'re not buying these for the \"rich, balanced audio profile.\" You\'re buying them because your roommate discovered podcasting, your neighbor got a drum kit, and the office switched to \"open plan\" which is corporate for \"no escape.\"\n\nThe QuietPro 3000 won\'t judge your reasons. It just eliminates 98% of outside noise so you can finally hear yourself think -- or, more realistically, so you can pretend you didn\'t hear your boss ask who wants to organize the team-building event."',
          qualities: { quality: 9, speed: 8, style: 10 },
        },
        toolB: {
          name: 'GPT-4',
          output: '"Introducing the QuietPro 3000 -- because the world is loud and you deserve a mute button for reality.\n\nWith our advanced noise-canceling technology, you can say goodbye to crying babies on flights, construction noise during your morning meeting, and that one coworker who thinks everyone needs to hear their lunch. The QP3000 doesn\'t just cancel noise; it cancels regret (about not buying them sooner).\n\nFeatures: 40-hour battery life, premium comfort pads, and the ability to ignore responsibilities with studio-quality clarity."',
          qualities: { quality: 8, speed: 9, style: 8 },
        },
      },
    ],
  },
  {
    name: 'Code',
    color: '#7B61FF',
    comparisons: [
      {
        prompt: 'Build a React hook that debounces API calls with loading and error states',
        toolA: {
          name: 'Claude Code',
          output: 'Generates a complete, well-typed TypeScript hook (useDebounceQuery) with:\n- Generic type parameter for response data\n- AbortController for request cancellation\n- Configurable debounce delay\n- Loading, error, and data states\n- Cleanup on unmount\n- Comprehensive JSDoc comments\n- A usage example in the same file\n\nThe code follows React best practices, handles edge cases (rapid re-calls, component unmount during fetch), and includes inline explanations for each design decision.',
          qualities: { quality: 9, speed: 8, style: 9 },
        },
        toolB: {
          name: 'GitHub Copilot',
          output: 'Generates the hook inline as you type, auto-completing function signatures and filling in the body. The result is functional but more minimal:\n- Basic useState for loading/error/data\n- useEffect with setTimeout for debounce\n- Fetch call with try/catch\n\nWorks correctly for the basic case. Missing: AbortController cleanup, TypeScript generics, and edge case handling. You get the skeleton faster but need to add robustness yourself. Best when you already know the pattern and want speed.',
          qualities: { quality: 7, speed: 10, style: 6 },
        },
      },
    ],
  },
  {
    name: 'Research',
    color: '#0EA5E9',
    comparisons: [
      {
        prompt: 'What is the current scientific consensus on intermittent fasting for weight loss?',
        toolA: {
          name: 'Perplexity',
          output: 'Returns a concise synthesis with 8 inline citations from recent studies and meta-analyses. Key findings: IF is effective but not more so than continuous calorie restriction. Links to a 2023 NEJM review, a 2024 meta-analysis, and WHO guidelines. Clearly separates "well-established" from "preliminary" findings. Includes a section on potential risks. Each claim is clickable to its source.',
          qualities: { quality: 9, speed: 9, style: 8 },
        },
        toolB: {
          name: 'Claude Research',
          output: 'Spends 3-5 minutes researching, then delivers a comprehensive 2000-word report organized into sections: mechanisms, clinical evidence, population-specific findings, long-term data gaps, and practical recommendations. Cites 15+ sources. Goes deeper on nuance -- distinguishing between time-restricted eating, alternate-day fasting, and 5:2 protocols. Identifies contradictions between studies. Slower, but significantly more thorough.',
          qualities: { quality: 10, speed: 5, style: 9 },
        },
      },
    ],
  },
];

function StarRating({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: i < value ? color : 'rgba(26,26,46,0.06)',
            transition: 'background 0.2s ease',
          }}
        />
      ))}
    </div>
  );
}

export default function HeadToHead() {
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeComparison, setActiveComparison] = useState(0);
  const [userRatings, setUserRatings] = useState<Record<string, { a: number; b: number }>>({});
  const [mobileToolTab, setMobileToolTab] = useState<'a' | 'b'>('a');
  const [sheetOpen, setSheetOpen] = useState(false);

  const category = categories[activeCategory];
  const comparison = category.comparisons[activeComparison];

  const ratingKey = `${activeCategory}-${activeComparison}`;
  const userRating = userRatings[ratingKey];

  const handleVote = (side: 'a' | 'b') => {
    setUserRatings((prev) => ({
      ...prev,
      [ratingKey]: {
        a: side === 'a' ? (prev[ratingKey]?.a === 1 ? 0 : 1) : (prev[ratingKey]?.a || 0),
        b: side === 'b' ? (prev[ratingKey]?.b === 1 ? 0 : 1) : (prev[ratingKey]?.b || 0),
      },
    }));
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    const activeTool = mobileToolTab === 'a' ? comparison.toolA : comparison.toolB;
    const activeQualities = activeTool.qualities;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Compact header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '8px 12px', flexShrink: 0,
          borderBottom: '1px solid rgba(26,26,46,0.06)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'linear-gradient(135deg, #F5A623, #F5A62380)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
            </svg>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700,
            color: '#1A1A2E', margin: 0, flex: 1,
          }}>
            Head to Head
          </h3>
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: '0.3rem', padding: '8px 12px',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch' as const,
          flexShrink: 0,
        }}>
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => { setActiveCategory(i); setActiveComparison(0); setMobileToolTab('a'); }}
              style={{
                padding: '0.3rem 0.6rem', borderRadius: 6,
                border: `1px solid ${i === activeCategory ? cat.color + '40' : 'rgba(26,26,46,0.08)'}`,
                background: i === activeCategory ? cat.color + '0A' : 'transparent',
                fontFamily: 'var(--font-heading)', fontSize: '0.78rem',
                fontWeight: i === activeCategory ? 700 : 500,
                color: i === activeCategory ? cat.color : '#6B7280',
                cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' as const,
              }}
            >
              {cat.name}
            </button>
          ))}
          {/* Comparison selector dots */}
          {category.comparisons.length > 1 && category.comparisons.map((_, i) => (
            <button
              key={`comp-${i}`}
              onClick={() => { setActiveComparison(i); setMobileToolTab('a'); }}
              style={{
                width: 24, height: 24, borderRadius: 6,
                border: `1px solid ${i === activeComparison ? category.color + '40' : 'rgba(26,26,46,0.08)'}`,
                background: i === activeComparison ? category.color + '12' : 'transparent',
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                color: i === activeComparison ? category.color : '#6B7280',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Prompt (clamped to 2 lines) */}
        <div style={{
          padding: '6px 12px', flexShrink: 0,
          borderBottom: '1px solid rgba(26,26,46,0.04)',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.5,
            color: '#1A1A2E', margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {comparison.prompt}
          </p>
        </div>

        {/* Tool A / B tabs */}
        <div style={{
          display: 'flex', flexShrink: 0, borderBottom: '1px solid rgba(26,26,46,0.06)',
        }}>
          <button
            onClick={() => setMobileToolTab('a')}
            style={{
              flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 700,
              color: mobileToolTab === 'a' ? category.color : '#6B7280',
              background: mobileToolTab === 'a' ? category.color + '08' : 'transparent',
              borderBottom: mobileToolTab === 'a' ? `2px solid ${category.color}` : '2px solid transparent',
            }}
          >
            {comparison.toolA.name}
          </button>
          <button
            onClick={() => setMobileToolTab('b')}
            style={{
              flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-heading)', fontSize: '0.82rem', fontWeight: 700,
              color: mobileToolTab === 'b' ? category.color : '#6B7280',
              background: mobileToolTab === 'b' ? category.color + '08' : 'transparent',
              borderBottom: mobileToolTab === 'b' ? `2px solid ${category.color}` : '2px solid transparent',
            }}
          >
            {comparison.toolB.name}
          </button>
        </div>

        {/* Tool output area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.65,
            color: 'rgba(26,26,46,0.7)', margin: 0,
          }}>
            {activeTool.output}
          </p>

          {/* Quality bars */}
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' as const, gap: '0.3rem' }}>
            {(['quality', 'speed', 'style'] as const).map((metric) => (
              <div key={metric} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                  color: '#6B7280', width: 42, textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                }}>
                  {metric}
                </span>
                <StarRating value={activeQualities[metric]} color={category.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Vote buttons + rating link */}
        <div style={{
          padding: '8px 12px', flexShrink: 0,
          borderTop: '1px solid rgba(26,26,46,0.06)',
          display: 'flex', gap: '0.5rem', alignItems: 'center',
        }}>
          <button
            onClick={() => handleVote('a')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              border: `1px solid ${userRating?.a ? category.color : 'rgba(26,26,46,0.1)'}`,
              background: userRating?.a ? `${category.color}12` : 'transparent',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
              color: userRating?.a ? category.color : '#6B7280',
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            {userRating?.a ? 'PICKED' : 'PREFER'} {comparison.toolA.name}
          </button>
          <button
            onClick={() => handleVote('b')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              border: `1px solid ${userRating?.b ? category.color : 'rgba(26,26,46,0.1)'}`,
              background: userRating?.b ? `${category.color}12` : 'transparent',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
              color: userRating?.b ? category.color : '#6B7280',
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            {userRating?.b ? 'PICKED' : 'PREFER'} {comparison.toolB.name}
          </button>
        </div>

        {/* Ratings summary button */}
        <div style={{
          padding: '0 12px 8px', flexShrink: 0, textAlign: 'center' as const,
        }}>
          <button
            onClick={() => setSheetOpen(true)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
              color: category.color, background: 'transparent', border: 'none',
              cursor: 'pointer', letterSpacing: '0.04em',
              textDecoration: 'underline', textUnderlineOffset: '2px',
            }}
          >
            View full comparison
          </button>
        </div>

        {/* BottomSheet for rating summary */}
        <BottomSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Full Comparison"
        >
          <div>
            {/* Prompt */}
            <div style={{
              background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.08)',
              borderRadius: 8, padding: '0.75rem', marginBottom: '1rem',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                color: category.color, display: 'block', marginBottom: '0.35rem',
              }}>
                Prompt
              </span>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.6,
                color: '#1A1A2E', margin: 0,
              }}>
                {comparison.prompt}
              </p>
            </div>

            {/* Side-by-side ratings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {/* Tool A ratings */}
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700,
                  color: '#1A1A2E', margin: '0 0 0.5rem',
                }}>
                  {comparison.toolA.name}
                </h4>
                {(['quality', 'speed', 'style'] as const).map((metric) => (
                  <div key={metric} style={{ marginBottom: '0.3rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                      color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                    }}>
                      {metric}: {comparison.toolA.qualities[metric]}/10
                    </span>
                  </div>
                ))}
              </div>
              {/* Tool B ratings */}
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700,
                  color: '#1A1A2E', margin: '0 0 0.5rem',
                }}>
                  {comparison.toolB.name}
                </h4>
                {(['quality', 'speed', 'style'] as const).map((metric) => (
                  <div key={metric} style={{ marginBottom: '0.3rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                      color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                    }}>
                      {metric}: {comparison.toolB.qualities[metric]}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Takeaway */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.04), rgba(123,97,255,0.04))',
              border: '1px solid rgba(14,165,233,0.1)',
              borderRadius: 8, padding: '0.75rem',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.6,
                color: '#1A1A2E', margin: 0,
              }}>
                <strong style={{ color: category.color }}>The takeaway:</strong> There is no single "best" tool. The right choice depends on your specific task, your quality bar, and how much time you have.
              </p>
            </div>
          </div>
        </BottomSheet>
      </div>
    );
  }

  // --- DESKTOP LAYOUT (unchanged) ---
  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #F5A623, #F5A62380)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>
              Head to Head
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              Same prompt, different tools — compare the results
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem 2rem' }}>
        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: '0.5rem', marginBottom: '1rem',
          flexWrap: 'wrap' as const,
          overflowX: 'visible' as const,
        }}>
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => { setActiveCategory(i); setActiveComparison(0); }}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 6,
                border: `1px solid ${i === activeCategory ? cat.color + '40' : 'rgba(26,26,46,0.08)'}`,
                background: i === activeCategory ? cat.color + '0A' : 'transparent',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: i === activeCategory ? 700 : 500,
                color: i === activeCategory ? cat.color : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                whiteSpace: 'nowrap' as const,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Comparison selector (if multiple) */}
        {category.comparisons.length > 1 && (
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
            {category.comparisons.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveComparison(i)}
                style={{
                  width: 24, height: 24,
                  borderRadius: 6,
                  border: `1px solid ${i === activeComparison ? category.color + '40' : 'rgba(26,26,46,0.08)'}`,
                  background: i === activeComparison ? category.color + '12' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: i === activeComparison ? category.color : '#6B7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Prompt */}
        <div style={{
          background: '#FEFDFB',
          border: '1px solid rgba(26,26,46,0.08)',
          borderRadius: 10,
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: category.color,
            display: 'block',
            marginBottom: '0.5rem',
          }}>
            Prompt
          </span>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            lineHeight: 1.65,
            color: '#1A1A2E',
            margin: 0,
          }}>
            {comparison.prompt}
          </p>
        </div>

        {/* Side-by-side outputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* Tool A */}
          <div style={{
            background: 'white',
            border: `1px solid ${userRating?.a ? category.color + '30' : 'rgba(26,26,46,0.06)'}`,
            borderRadius: 10,
            padding: '1.25rem',
            transition: 'border-color 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#1A1A2E',
                margin: 0,
              }}>
                {comparison.toolA.name}
              </h4>
              <button
                onClick={() => handleVote('a')}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 5,
                  border: `1px solid ${userRating?.a ? category.color : 'rgba(26,26,46,0.1)'}`,
                  background: userRating?.a ? `${category.color}12` : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: userRating?.a ? category.color : '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.05em',
                }}
              >
                {userRating?.a ? 'PICKED' : 'PREFER'}
              </button>
            </div>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              lineHeight: 1.7,
              color: 'rgba(26,26,46,0.7)',
              margin: '0 0 1rem',
            }}>
              {comparison.toolA.output}
            </p>

            {/* Quality bars */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.4rem' }}>
              {(['quality', 'speed', 'style'] as const).map((metric) => (
                <div key={metric} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6B7280',
                    width: 48,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                  }}>
                    {metric}
                  </span>
                  <StarRating value={comparison.toolA.qualities[metric]} color={category.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Tool B */}
          <div style={{
            background: 'white',
            border: `1px solid ${userRating?.b ? category.color + '30' : 'rgba(26,26,46,0.06)'}`,
            borderRadius: 10,
            padding: '1.25rem',
            transition: 'border-color 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#1A1A2E',
                margin: 0,
              }}>
                {comparison.toolB.name}
              </h4>
              <button
                onClick={() => handleVote('b')}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 5,
                  border: `1px solid ${userRating?.b ? category.color : 'rgba(26,26,46,0.1)'}`,
                  background: userRating?.b ? `${category.color}12` : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: userRating?.b ? category.color : '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.05em',
                }}
              >
                {userRating?.b ? 'PICKED' : 'PREFER'}
              </button>
            </div>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              lineHeight: 1.7,
              color: 'rgba(26,26,46,0.7)',
              margin: '0 0 1rem',
            }}>
              {comparison.toolB.output}
            </p>

            {/* Quality bars */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.4rem' }}>
              {(['quality', 'speed', 'style'] as const).map((metric) => (
                <div key={metric} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6B7280',
                    width: 48,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em',
                  }}>
                    {metric}
                  </span>
                  <StarRating value={comparison.toolB.qualities[metric]} color={category.color} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom insight */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.04), rgba(123,97,255,0.04))',
          border: '1px solid rgba(14,165,233,0.1)',
          borderRadius: 10,
          padding: '1rem 1.25rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            lineHeight: 1.7,
            color: '#1A1A2E',
            margin: 0,
          }}>
            <strong style={{ color: category.color }}>The takeaway:</strong> There is no single "best" tool. The right choice depends on your specific task, your quality bar, and how much time you have. Learn a few well, rather than one perfectly.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';

type ToolType = 'image' | 'video' | 'music' | 'code' | 'research' | 'writing' | 'presentation';

interface ToolConfig {
  label: string;
  color: string;
  icon: string;
  fields: { key: string; label: string; placeholder: string }[];
  frame: (values: Record<string, string>) => string;
}

const tools: Record<ToolType, ToolConfig> = {
  image: {
    label: 'Image', color: '#E94560', icon: '\u{1F3A8}',
    fields: [
      { key: 'subject', label: 'What do you want to see?', placeholder: 'e.g., a cozy coffee shop interior' },
      { key: 'mood', label: 'Mood or style', placeholder: 'e.g., warm, nostalgic, Studio Ghibli vibes' },
      { key: 'use', label: 'What\'s it for?', placeholder: 'e.g., blog header, album cover, concept art' },
    ],
    frame: (v) => {
      const parts = [v.subject || '[your subject]'];
      if (v.mood) parts.push(`${v.mood} atmosphere`);
      parts.push('rich detail, cinematic composition');
      if (v.use?.toLowerCase().includes('cover') || v.use?.toLowerCase().includes('poster')) {
        parts.push('centered composition with space for text overlay');
      }
      if (v.use?.toLowerCase().includes('header') || v.use?.toLowerCase().includes('banner')) {
        parts.push('wide aspect ratio 16:9, horizontal composition');
      }
      parts.push('shot on 35mm film, natural lighting, shallow depth of field');
      if (v.mood?.toLowerCase().includes('dark') || v.mood?.toLowerCase().includes('moody')) {
        parts.push('low-key lighting, deep shadows');
      }
      return parts.join(', ') + ' --style raw --ar 16:9';
    },
  },
  video: {
    label: 'Video', color: '#7B61FF', icon: '\u{1F3AC}',
    fields: [
      { key: 'scene', label: 'Describe the scene', placeholder: 'e.g., a person walking through a neon-lit Tokyo alley at night' },
      { key: 'camera', label: 'Camera movement', placeholder: 'e.g., slow tracking shot, dolly zoom, handheld' },
      { key: 'duration', label: 'Duration', placeholder: 'e.g., 5 seconds, 10 seconds' },
    ],
    frame: (v) => {
      const lines = [];
      lines.push(`Scene: ${v.scene || '[describe your scene]'}`);
      lines.push(`Camera: ${v.camera || 'slow tracking shot, eye level'}`);
      lines.push(`Duration: ${v.duration || '5 seconds'}`);
      lines.push('Style: cinematic, natural motion, consistent lighting throughout');
      lines.push('Technical: 1080p, 24fps, film grain');
      lines.push('Important: maintain character consistency and physical realism across all frames');
      return lines.join('\n');
    },
  },
  music: {
    label: 'Music', color: '#16C79A', icon: '\u{1F3B5}',
    fields: [
      { key: 'purpose', label: 'What\'s it for?', placeholder: 'e.g., podcast intro, game background, TikTok clip' },
      { key: 'mood', label: 'Mood and genre', placeholder: 'e.g., upbeat indie folk, dark synthwave, chill lo-fi' },
      { key: 'duration', label: 'Duration', placeholder: 'e.g., 15 seconds, 2 minutes, full song' },
    ],
    frame: (v) => {
      const lines = [];
      lines.push(`[Genre: ${v.mood || 'upbeat electronic'}]`);
      const dur = v.duration || '30 seconds';
      lines.push(`[Duration: ${dur}]`);
      if (v.purpose) lines.push(`[Purpose: ${v.purpose}]`);
      lines.push('');
      if (dur.includes('15') || dur.includes('intro') || v.purpose?.toLowerCase().includes('intro')) {
        lines.push('Structure: Quick build from minimal to full, no vocals');
        lines.push('Start sparse, crescendo at the midpoint, resolve cleanly');
      } else if (dur.includes('full') || dur.includes('song') || dur.includes('3') || dur.includes('4')) {
        lines.push('Structure: Verse / Chorus / Verse / Chorus / Bridge / Chorus');
        lines.push('Include vocals that match the mood');
      } else {
        lines.push('Structure: Build from minimal to full, clean ending');
      }
      lines.push('Mix: Master for streaming, balanced levels, no clipping');
      return lines.join('\n');
    },
  },
  code: {
    label: 'Code', color: '#F5A623', icon: '\u{1F4BB}',
    fields: [
      { key: 'task', label: 'What do you want to build?', placeholder: 'e.g., a drag-and-drop kanban board' },
      { key: 'stack', label: 'Tech stack', placeholder: 'e.g., React + TypeScript, Python, vanilla HTML/JS' },
      { key: 'constraints', label: 'Constraints or context', placeholder: 'e.g., must work on mobile, no external libraries' },
    ],
    frame: (v) => {
      const lines = [];
      lines.push(`Build: ${v.task || '[describe what to build]'}`);
      lines.push('');
      if (v.stack) lines.push(`Tech stack: ${v.stack}`);
      if (v.constraints) lines.push(`Constraints: ${v.constraints}`);
      lines.push('');
      lines.push('Before writing code:');
      lines.push('1. Explain your approach in 2-3 sentences');
      lines.push('2. List the files you\'ll create or modify');
      lines.push('3. Then implement, with comments only where the logic isn\'t obvious');
      lines.push('');
      lines.push('After implementation:');
      lines.push('- Verify it runs without errors');
      lines.push('- List any edge cases you didn\'t handle');
      return lines.join('\n');
    },
  },
  research: {
    label: 'Research', color: '#0EA5E9', icon: '\u{1F50D}',
    fields: [
      { key: 'question', label: 'What do you want to know?', placeholder: 'e.g., is intermittent fasting actually backed by science?' },
      { key: 'depth', label: 'How deep?', placeholder: 'e.g., quick overview, thorough analysis, academic-level' },
    ],
    frame: (v) => {
      const lines = [];
      lines.push(`Research question: ${v.question || '[your question]'}`);
      lines.push(`Depth: ${v.depth || 'thorough analysis'}`);
      lines.push('');
      lines.push('Instructions:');
      lines.push('- Don\'t just check the official source — find independent reviews, benchmarks, and opinions that confirm or contradict it');
      lines.push('- Cross-reference at least 3 credible perspectives');
      lines.push('- Note where sources disagree and why');
      lines.push('- Separate established facts from expert opinions from speculation');
      lines.push('- Cite your sources with links where possible');
      lines.push('- End with your recommendation based on the weight of evidence');
      return lines.join('\n');
    },
  },
  writing: {
    label: 'Writing', color: '#0F3460', icon: '\u{270F}\uFE0F',
    fields: [
      { key: 'topic', label: 'What are you writing?', placeholder: 'e.g., a blog post about why sleep matters' },
      { key: 'audience', label: 'Who\'s reading it?', placeholder: 'e.g., college students, skeptical executives, general public' },
      { key: 'tone', label: 'Tone', placeholder: 'e.g., casual and funny, professional, inspiring' },
    ],
    frame: (v) => {
      const lines = [];
      lines.push(`Write: ${v.topic || '[your topic]'}`);
      lines.push(`Audience: ${v.audience || '[who is reading this]'}`);
      lines.push(`Tone: ${v.tone || 'clear and engaging'}`);
      lines.push('');
      lines.push('Guidelines:');
      lines.push('- Open with a hook that makes the reader want to continue');
      lines.push('- Short paragraphs (2-3 sentences max)');
      lines.push('- Use concrete examples, not abstract claims');
      lines.push(`- Write as if explaining to a smart friend who knows nothing about this topic`);
      lines.push('- End with one clear takeaway the reader can act on');
      lines.push('- No filler, no throat-clearing, no "In today\'s world..."');
      return lines.join('\n');
    },
  },
  presentation: {
    label: 'Slides', color: '#7B61FF', icon: '\u{1F4CA}',
    fields: [
      { key: 'message', label: 'Key message (the ONE thing the audience should remember)', placeholder: 'e.g., we should invest in solar because it\'s now cheaper than coal' },
      { key: 'audience', label: 'Who\'s in the room?', placeholder: 'e.g., investors, classmates, a hiring committee' },
      { key: 'slides', label: 'How many slides?', placeholder: 'e.g., 8, 12, keep it short' },
    ],
    frame: (v) => {
      const lines = [];
      lines.push(`Core message: ${v.message || '[the one thing they should remember]'}`);
      lines.push(`Audience: ${v.audience || '[who is watching]'}`);
      lines.push(`Slides: ${v.slides || '8-10'}`);
      lines.push('');
      lines.push('Structure each slide as:');
      lines.push('- Headline: one sentence that makes the point (not a topic label)');
      lines.push('- Supporting detail: one stat, quote, or visual description');
      lines.push('- Speaker note: what to say out loud (2-3 sentences)');
      lines.push('');
      lines.push('Rules:');
      lines.push('- First slide hooks attention, last slide is a clear call to action');
      lines.push('- No slide should need more than 5 seconds to read');
      lines.push('- Every slide must earn its place — if it doesn\'t advance the core message, cut it');
      return lines.join('\n');
    },
  },
};

const toolOrder: ToolType[] = ['image', 'video', 'music', 'code', 'research', 'writing', 'presentation'];

export default function PromptFramer() {
  const [activeType, setActiveType] = useState<ToolType>('image');
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [copied, setCopied] = useState(false);

  const config = tools[activeType];
  const currentValues = values[activeType] || {};
  const output = useMemo(() => config.frame(currentValues), [activeType, currentValues]);

  const updateField = (key: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [activeType]: { ...(prev[activeType] || {}), [key]: value },
    }));
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(26,26,46,0.08)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(26,26,46,0.04)',
    }}>
      {/* Tool type tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
        padding: '0 4px',
        gap: 0,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {toolOrder.map(type => {
          const t = tools[type];
          const isActive = activeType === type;
          return (
            <button
              key={type}
              onClick={() => { setActiveType(type); setCopied(false); }}
              style={{
                padding: '12px 14px',
                border: 'none',
                borderBottom: `2px solid ${isActive ? t.color : 'transparent'}`,
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: isActive ? t.color : 'var(--color-subtle)',
                opacity: isActive ? 1 : 0.6,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 320 }}>
        {/* Left: Input fields */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRight: '1px solid rgba(26,26,46,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: config.color, margin: 0,
          }}>
            Your details
          </p>

          {config.fields.map(field => (
            <div key={field.key}>
              <label style={{
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                color: 'var(--color-deep)', display: 'block', marginBottom: 4,
              }}>
                {field.label}
              </label>
              <input
                type="text"
                value={currentValues[field.key] || ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1px solid rgba(26,26,46,0.1)',
                  background: 'var(--color-cream)',
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                  color: 'var(--color-deep)', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = config.color + '50'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'}
              />
            </div>
          ))}
        </div>

        {/* Right: Generated prompt */}
        <div style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(26,26,46,0.015)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '0.75rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              color: 'var(--color-subtle)', margin: 0,
            }}>
              Your prompt
            </p>
            <button
              onClick={handleCopy}
              style={{
                padding: '4px 12px', borderRadius: 100,
                border: `1px solid ${copied ? config.color + '30' : 'rgba(26,26,46,0.1)'}`,
                background: copied ? config.color + '08' : 'transparent',
                cursor: 'pointer', fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem', fontWeight: 600,
                color: copied ? config.color : 'var(--color-subtle)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {copied ? '\u2713 Copied' : 'Copy'}
            </button>
          </div>

          <div style={{
            flex: 1, padding: '12px 14px', borderRadius: 8,
            background: 'var(--color-cream)',
            border: `1px solid ${config.color}15`,
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.65,
            color: 'var(--color-deep)', whiteSpace: 'pre-wrap' as const,
            overflowY: 'auto',
            borderLeft: `3px solid ${config.color}40`,
          }}>
            {output}
          </div>
        </div>
      </div>

      {/* Mobile stacked layout override */}
      <style>{`
        @media (max-width: 700px) {
          .prompt-framer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

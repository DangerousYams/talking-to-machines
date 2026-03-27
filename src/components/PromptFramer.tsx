import { useState, useMemo, useCallback } from 'react';
import { streamChat } from '../lib/claude';
import { useAuth } from '../hooks/useAuth';
import UnlockModal from './ui/UnlockModal';

// ═══════════════════════════════════════════════
// FIELD TYPES
// ═══════════════════════════════════════════════

interface TextField { key: string; label: string; type: 'text'; placeholder: string }
interface SelectField { key: string; label: string; type: 'select'; options: string[]; otherPlaceholder?: string }
interface MultiSelectField { key: string; label: string; type: 'multi'; options: string[] }
type Field = TextField | SelectField | MultiSelectField;

type ToolType = 'image' | 'video' | 'music' | 'code' | 'research' | 'writing' | 'presentation';

interface ToolConfig {
  key: ToolType;
  label: string;
  subtitle: string;
  color: string;
  icon: string;
  fields: Field[];
  frame: (v: Record<string, string>) => string;
  aiHint: string;
}

// ═══════════════════════════════════════════════
// TOOL CONFIGS
// ═══════════════════════════════════════════════

const TOOLS: ToolConfig[] = [
  {
    key: 'image', label: 'Image Generation', subtitle: 'Turn ideas into visuals',
    color: '#E94560', icon: '\u{1F3A8}',
    aiHint: 'Produce a comma-separated image prompt with: subject, style, mood, lighting, composition, camera/lens details. End with --ar flag. Use professional photography and art direction language.',
    fields: [
      { key: 'subject', type: 'text', label: 'What do you want to see?', placeholder: 'a cozy coffee shop with rain on the windows' },
      { key: 'style', type: 'select', label: 'Style',
        options: ['Photorealistic', 'Cinematic film', 'Anime / Manga', 'Studio Ghibli', 'Watercolor', 'Oil painting', '3D render', 'Digital illustration', 'Pixel art', 'Minimalist', 'Vintage / retro', 'Other'],
        otherPlaceholder: 'Describe your style...' },
      { key: 'mood', type: 'select', label: 'Mood',
        options: ['Warm & cozy', 'Dark & moody', 'Bright & cheerful', 'Ethereal & dreamy', 'Gritty & raw', 'Serene & peaceful', 'Dramatic & intense', 'Whimsical & playful', 'Other'],
        otherPlaceholder: 'Describe the mood...' },
      { key: 'lighting', type: 'select', label: 'Lighting',
        options: ['Natural daylight', 'Golden hour', 'Blue hour', 'Neon / cyberpunk', 'Studio lighting', 'Candlelight / warm glow', 'Dramatic side-light', 'Backlit / silhouette', 'Overcast / soft diffused', 'Other'],
        otherPlaceholder: 'Describe lighting...' },
      { key: 'aspect', type: 'select', label: 'Aspect ratio',
        options: ['16:9 landscape', '9:16 portrait', '1:1 square', '4:5 social', '3:2 photo', '21:9 ultrawide'] },
    ],
    frame: (v) => {
      const p = [v.subject || '[your subject]'];
      if (v.style) p.push(v.style.toLowerCase() + ' style');
      if (v.mood) p.push(v.mood.toLowerCase() + ' atmosphere');
      if (v.lighting) p.push(v.lighting.toLowerCase());
      p.push('high detail, professional quality');
      const ar = v.aspect?.match(/(\d+:\d+)/)?.[1] || '16:9';
      return p.join(', ') + ` --ar ${ar}`;
    },
  },
  {
    key: 'video', label: 'Video Generation', subtitle: 'Direct cinematic clips from text',
    color: '#7B61FF', icon: '\u{1F3AC}',
    aiHint: 'Produce a structured video prompt with: Scene, Camera, Style, Mood, Duration, Technical lines. Include motion guidance and consistency notes.',
    fields: [
      { key: 'scene', type: 'text', label: 'Describe the scene', placeholder: 'a person walking through a neon-lit Tokyo alley at night' },
      { key: 'camera', type: 'select', label: 'Camera movement',
        options: ['Slow tracking shot', 'Dolly zoom', 'Handheld / shaky', 'Steadicam orbit', 'Static / locked', 'Drone flyover', 'First person POV', 'Crane / jib shot', 'Push in (slow zoom)', 'Other'],
        otherPlaceholder: 'Describe camera movement...' },
      { key: 'style', type: 'select', label: 'Visual style',
        options: ['Cinematic', 'Documentary', 'Music video', 'Commercial / ad', 'Slow motion', 'Time-lapse', 'Animation', 'Vintage film', 'Other'],
        otherPlaceholder: 'Describe visual style...' },
      { key: 'mood', type: 'select', label: 'Mood',
        options: ['Epic & sweeping', 'Intimate & personal', 'Tense & suspenseful', 'Joyful & uplifting', 'Melancholic', 'Mysterious', 'Energetic & fast', 'Other'],
        otherPlaceholder: 'Describe mood...' },
      { key: 'duration', type: 'select', label: 'Duration',
        options: ['3 seconds', '5 seconds', '10 seconds', '15 seconds', '30 seconds', 'Other'],
        otherPlaceholder: 'e.g., 8 seconds' },
    ],
    frame: (v) => {
      const lines = [`Scene: ${v.scene || '[describe your scene]'}`];
      lines.push(`Camera: ${v.camera || 'slow tracking shot'}, eye level`);
      if (v.style) lines.push(`Style: ${v.style}, natural motion`);
      if (v.mood) lines.push(`Mood: ${v.mood}`);
      lines.push(`Duration: ${v.duration || '5 seconds'}`);
      lines.push('Technical: 1080p, 24fps, consistent lighting');
      lines.push('Maintain character consistency and physical realism');
      return lines.join('\n');
    },
  },
  {
    key: 'music', label: 'Music Generation', subtitle: 'Style prompt + structure for Suno',
    color: '#16C79A', icon: '\u{1F3B5}',
    aiHint: 'Produce TWO sections:\n1. STYLE PROMPT — comma-separated tags, UNDER 200 CHARACTERS. Order: genre, mood, instruments, vocals, tempo, production. Example: "indie pop ballad, acoustic guitar, soft piano, warm female vocal, nostalgic, lo-fi, 88 BPM"\n2. SONG STRUCTURE — metatags on separate lines like [Intro], [Verse 1], [Chorus], [Bridge], [Outro]. Add vocal delivery tags like [Belted] or [Whispered] before sections.\n\nFormat exactly as:\nSTYLE PROMPT\n[tags here]\n\nSONG STRUCTURE\n[metatags here]',
    fields: [
      { key: 'genre', type: 'select', label: 'Genre',
        options: ['Lo-fi hip hop', 'Indie folk', 'Synthwave / retrowave', 'Jazz', 'EDM / dance', 'Ambient / atmospheric', 'Classical', 'Pop', 'Rock', 'R&B / soul', 'Cinematic orchestral', 'Trap', 'Other'],
        otherPlaceholder: 'Describe genre...' },
      { key: 'mood', type: 'select', label: 'Mood',
        options: ['Upbeat & energetic', 'Chill & relaxing', 'Dark & intense', 'Happy & bright', 'Emotional & cinematic', 'Mysterious & atmospheric', 'Funky & groovy', 'Nostalgic & bittersweet', 'Other'],
        otherPlaceholder: 'Describe mood...' },
      { key: 'instruments', type: 'multi', label: 'Instruments',
        options: ['Piano', 'Acoustic guitar', 'Electric guitar', 'Synth pads', 'Strings', 'Drums', 'Bass', '808s', 'Saxophone', 'Brass', 'Vinyl crackle'] },
      { key: 'vocals', type: 'select', label: 'Vocals',
        options: ['Instrumental only', 'Warm male vocal', 'Breathy female vocal', 'Raspy male vocal', 'Airy female vocal', 'Choir / harmony', 'Spoken word', 'Falsetto', 'Other'],
        otherPlaceholder: 'Describe vocal style...' },
      { key: 'tempo', type: 'text', label: 'Tempo', placeholder: 'e.g., 88 BPM, slow groove, 128 BPM' },
      { key: 'production', type: 'select', label: 'Production',
        options: ['Lo-fi / warm', 'Polished / radio-ready', 'Raw / live feel', 'Vintage analog', 'Clean modern mix', 'Other'],
        otherPlaceholder: 'Describe production...' },
      { key: 'exclude', type: 'text', label: 'Exclude (negative prompt)', placeholder: 'e.g., no autotune, no distortion' },
      { key: 'structure', type: 'multi', label: 'Song sections',
        options: ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Instrumental', 'Solo', 'Outro'] },
    ],
    frame: (v) => {
      // === Style prompt (GMIV order) ===
      const tags: string[] = [];
      if (v.genre) tags.push(v.genre.toLowerCase());
      if (v.mood) tags.push(v.mood.toLowerCase());
      if (v.instruments) tags.push(v.instruments.toLowerCase());
      if (v.vocals) tags.push(v.vocals.toLowerCase());
      if (v.tempo) tags.push(v.tempo);
      if (v.production) tags.push(v.production.toLowerCase());
      if (v.exclude) tags.push(v.exclude.toLowerCase());
      const style = tags.join(', ') || '[genre], [mood], [instruments], [vocals]';

      // === Song structure ===
      const sects = v.structure ? v.structure.split(', ').filter(Boolean) : [];
      let struct = '';
      if (sects.length > 0) {
        const parts: string[] = [];
        const has = (s: string) => sects.includes(s);
        if (has('Intro')) parts.push('[Intro]\n[Instrumental]');
        if (has('Verse')) parts.push('[Verse 1]');
        if (has('Pre-Chorus')) parts.push('[Pre-Chorus]');
        if (has('Chorus')) parts.push('[Chorus]');
        if (has('Verse')) parts.push('[Verse 2]');
        if (has('Pre-Chorus') && has('Verse')) parts.push('[Pre-Chorus]');
        if (has('Chorus') && has('Verse')) parts.push('[Chorus]');
        if (has('Instrumental')) parts.push('[Instrumental Break]');
        if (has('Bridge')) parts.push('[Bridge]');
        if (has('Solo')) parts.push('[Solo]');
        if (has('Chorus') && (has('Bridge') || has('Solo'))) parts.push('[Chorus]');
        if (has('Outro')) parts.push('[Outro]\n[Fade Out]');
        struct = parts.join('\n\n');
      }

      let out = `\u2550 STYLE PROMPT \u2550 paste in "Style of Music"\n${style}\n(${style.length}/200 chars${style.length > 200 ? ' \u26A0 TOO LONG' : ''})`;
      if (struct) out += `\n\n\u2550 SONG STRUCTURE \u2550 paste in "Lyrics"\n${struct}`;
      return out;
    },
  },
  {
    key: 'code', label: 'Code Generation', subtitle: 'Build software with AI assistance',
    color: '#F5A623', icon: '\u{1F4BB}',
    aiHint: 'Produce a structured coding prompt with: task, tech stack, complexity level, output style. Include step-by-step instructions (explain approach, list files, implement, verify).',
    fields: [
      { key: 'task', type: 'text', label: 'What do you want to build?', placeholder: 'a drag-and-drop kanban board with local storage' },
      { key: 'stack', type: 'select', label: 'Tech stack',
        options: ['You choose (best for the task)', 'React + TypeScript', 'Python', 'Vanilla HTML / CSS / JS', 'Node.js', 'Next.js', 'Vue.js', 'Swift (iOS)', 'Kotlin (Android)', 'Flask / Django', 'Other'],
        otherPlaceholder: 'Describe your stack...' },
      { key: 'complexity', type: 'select', label: 'Scope',
        options: ['Simple script / function', 'Single component', 'Multi-file project', 'Full app / prototype'] },
      { key: 'output', type: 'multi', label: 'Output style',
        options: ['Minimal & clean', 'Well-commented', 'With tests', 'With error handling', 'Production-ready', 'Rapid prototype'] },
    ],
    frame: (v) => {
      const lines = [`Build: ${v.task || '[what to build]'}`];
      if (v.stack === 'You choose (best for the task)') lines.push('Stack: Choose the best tech stack for this task');
      else if (v.stack) lines.push(`Stack: ${v.stack}`);
      if (v.complexity) lines.push(`Scope: ${v.complexity}`);
      if (v.output) lines.push(`Style: ${v.output}`);
      lines.push('');
      lines.push('Steps:');
      lines.push('1. Explain your approach in 2\u20133 sentences');
      lines.push('2. List files you\'ll create or modify');
      lines.push('3. Implement with comments only where logic isn\'t obvious');
      lines.push('4. Verify it runs without errors');
      return lines.join('\n');
    },
  },
  {
    key: 'research', label: 'Research', subtitle: 'Find answers with depth and nuance',
    color: '#0EA5E9', icon: '\u{1F50D}',
    aiHint: 'Produce a research prompt with: question, depth, source preference, output format. Emphasize cross-referencing, separating fact from opinion, and citing sources.',
    fields: [
      { key: 'question', type: 'text', label: 'What do you want to know?', placeholder: 'is intermittent fasting actually backed by science?' },
      { key: 'depth', type: 'select', label: 'Depth',
        options: ['Quick summary (1 paragraph)', 'Overview (1 page)', 'Thorough analysis', 'Academic-level review', 'Pro / con comparison', 'Other'],
        otherPlaceholder: 'Describe depth...' },
      { key: 'sources', type: 'select', label: 'Source preference',
        options: ['Any credible sources', 'Academic papers only', 'News & journalism', 'Industry reports', 'Mix of perspectives'] },
      { key: 'format', type: 'select', label: 'Output format',
        options: ['Narrative summary', 'Bullet points', 'Comparison table', 'Structured report with sections', 'Q&A format', 'Other'],
        otherPlaceholder: 'Describe format...' },
    ],
    frame: (v) => {
      const lines = [`Question: ${v.question || '[your question]'}`];
      if (v.depth) lines.push(`Depth: ${v.depth}`);
      if (v.sources) lines.push(`Sources: ${v.sources}`);
      if (v.format) lines.push(`Format: ${v.format}`);
      lines.push('');
      lines.push('Requirements:');
      lines.push('- Cross-reference at least 3 perspectives');
      lines.push('- Separate facts from opinions from speculation');
      lines.push('- Note where sources disagree and why');
      lines.push('- Cite sources with links where possible');
      return lines.join('\n');
    },
  },
  {
    key: 'writing', label: 'Writing', subtitle: 'Craft words that land',
    color: '#0F3460', icon: '\u270F\uFE0F',
    aiHint: 'Produce a writing prompt with: topic, format, audience, tone, length. Include specific style guidelines tailored to the audience and format.',
    fields: [
      { key: 'topic', type: 'text', label: 'What are you writing about?', placeholder: 'why sleep is the most underrated productivity hack' },
      { key: 'format', type: 'select', label: 'Format',
        options: ['Blog post', 'Essay', 'Email', 'Newsletter', 'Social media post', 'Short story', 'Script / dialogue', 'Product copy', 'Other'],
        otherPlaceholder: 'Describe format...' },
      { key: 'audience', type: 'select', label: 'Audience',
        options: ['General public', 'Students', 'Business professionals', 'Technical audience', 'Teens / young adults', 'Parents', 'Other'],
        otherPlaceholder: 'Describe your audience...' },
      { key: 'tone', type: 'select', label: 'Tone',
        options: ['Casual & conversational', 'Professional', 'Witty & humorous', 'Inspiring & motivational', 'Academic', 'Direct & concise', 'Poetic / literary', 'Other'],
        otherPlaceholder: 'Describe tone...' },
      { key: 'length', type: 'select', label: 'Length',
        options: ['Short (under 300 words)', 'Medium (300\u2013800 words)', 'Long (800\u20131500 words)', 'Very long (1500+ words)'] },
    ],
    frame: (v) => {
      const lines = [`Write: ${v.topic || '[your topic]'}`];
      if (v.format) lines.push(`Format: ${v.format}`);
      if (v.audience) lines.push(`Audience: ${v.audience}`);
      if (v.tone) lines.push(`Tone: ${v.tone}`);
      if (v.length) lines.push(`Length: ${v.length}`);
      lines.push('');
      lines.push('Guidelines:');
      lines.push('- Open with a hook');
      lines.push('- Short paragraphs, concrete examples');
      lines.push('- End with one clear takeaway');
      lines.push('- No filler or throat-clearing');
      return lines.join('\n');
    },
  },
  {
    key: 'presentation', label: 'Slides / Presentations', subtitle: 'Design persuasive decks',
    color: '#7B61FF', icon: '\u{1F4CA}',
    aiHint: 'Produce a presentation prompt with: core message, audience, slide count, style. Include per-slide structure (headline + support + speaker note) and persuasion rules.',
    fields: [
      { key: 'message', type: 'text', label: 'The ONE thing they should remember', placeholder: 'solar is now cheaper than coal \u2014 we should invest' },
      { key: 'audience', type: 'select', label: 'Audience',
        options: ['Investors / VCs', 'Classmates', 'Executives', 'Conference attendees', 'Hiring committee', 'Team / internal', 'General public', 'Other'],
        otherPlaceholder: 'Describe your audience...' },
      { key: 'slides', type: 'select', label: 'Slide count',
        options: ['5 slides (elevator pitch)', '8\u201310 (standard)', '12\u201315 (detailed)', '20+ (comprehensive)'] },
      { key: 'style', type: 'select', label: 'Deck style',
        options: ['Minimal & clean', 'Data-heavy / analytical', 'Visual storytelling', 'Technical / detailed', 'Bold & creative', 'Other'],
        otherPlaceholder: 'Describe style...' },
    ],
    frame: (v) => {
      const lines = [`Core message: ${v.message || '[what they should remember]'}`];
      if (v.audience) lines.push(`Audience: ${v.audience}`);
      if (v.slides) lines.push(`Slides: ${v.slides}`);
      if (v.style) lines.push(`Style: ${v.style}`);
      lines.push('');
      lines.push('Per slide: headline (1 sentence) + one supporting detail + speaker note');
      lines.push('First slide hooks attention, last slide = clear call to action');
      lines.push('Every slide must earn its place');
      return lines.join('\n');
    },
  },
];

const SYS_PROMPT = `You are a prompt engineering expert. Write ready-to-use prompts for AI tools.

Rules:
- Output ONLY the prompt. No preamble, no explanation.
- Under 180 words. Specific and actionable.
- Use the domain language the tool expects.
- Copy-paste ready.`;

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function resolve(key: string, vals: Record<string, string>): string {
  const v = vals[key];
  return v === 'Other' ? (vals[`${key}_other`] || '') : (v || '');
}

function resolveAll(fields: Field[], vals: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) out[f.key] = f.type === 'multi' ? (vals[f.key] || '') : resolve(f.key, vals);
  return out;
}

function anyFilled(fields: Field[], vals: Record<string, string>): boolean {
  return fields.some(f => {
    const v = vals[f.key];
    if (!v) return false;
    if (f.type === 'multi') return true;
    if (v === 'Other') return !!vals[`${f.key}_other`]?.trim();
    return true;
  });
}

function toggleMulti(current: string, option: string): string {
  const set = new Set(current ? current.split(', ') : []);
  if (set.has(option)) set.delete(option); else set.add(option);
  return [...set].join(', ');
}

// ═══════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════

export default function PromptFramer() {
  const { isPaid } = useAuth();
  const [openTool, setOpenTool] = useState<ToolType>('image');
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [aiOutput, setAiOutput] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<ToolType | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showUnlock, setShowUnlock] = useState(false);

  const setVal = useCallback((tool: ToolType, key: string, value: string) => {
    setValues(prev => ({ ...prev, [tool]: { ...(prev[tool] || {}), [key]: value } }));
    setAiOutput(prev => { const n = { ...prev }; delete n[tool]; return n; });
    setCopied(null); setError('');
  }, []);

  const handleGenerate = useCallback((tool: ToolType, config: ToolConfig, vals: Record<string, string>) => {
    if (generating) return;
    if (!isPaid) { setShowUnlock(true); return; }
    setGenerating(tool); setError(''); setShowUnlock(false);

    const resolved = resolveAll(config.fields, vals);
    const summary = config.fields.map(f => `${f.label}: ${resolved[f.key] || '(not specified)'}`).join('\n');

    let acc = '';
    streamChat({
      messages: [{ role: 'user', content: `Generate a ${config.label.toLowerCase()} prompt:\n\n${summary}` }],
      systemPrompt: `${SYS_PROMPT}\n\nTool: ${config.label}\n${config.aiHint}`,
      maxTokens: 400,
      source: 'prompt-framer' as any,
      skipPersona: true,
      onChunk: (t) => { acc += t; setAiOutput(prev => ({ ...prev, [tool]: acc })); },
      onDone: () => setGenerating(null),
      onError: () => { setError('Failed to generate. Try again.'); setGenerating(null); },
    });
  }, [generating, isPaid]);

  const handleCopy = useCallback(async (text: string, tool: ToolType) => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
    setCopied(tool);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {TOOLS.map(config => {
        const isOpen = openTool === config.key;
        const vals = values[config.key] || {};
        const live = aiOutput[config.key];
        const resolved = resolveAll(config.fields, vals);
        const template = config.frame(resolved);
        const output = live || template;
        const filled = anyFilled(config.fields, vals);
        const isGen = generating === config.key;
        const isCopied = copied === config.key;

        return (
          <div key={config.key}>
            {/* Header */}
            <button onClick={() => { setOpenTool(isOpen ? '' as any : config.key); setShowUnlock(false); setError(''); }}
              style={{ width: '100%', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem',
                background: isOpen ? `${config.color}05` : 'white',
                border: `1px solid ${isOpen ? config.color + '25' : 'rgba(26,26,46,0.07)'}`,
                borderRadius: isOpen ? '12px 12px 0 0' : 12,
                cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: config.color + '10',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', flexShrink: 0 }}>
                {config.icon}
              </div>
              <div style={{ flex: 1, textAlign: 'left' as const }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>
                  {config.label}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-subtle)', margin: 0, lineHeight: 1.3 }}>
                  {config.subtitle}
                </p>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--color-subtle)', opacity: 0.4,
                transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
            </button>

            {/* Body */}
            {isOpen && (
              <div style={{ border: `1px solid ${config.color}25`, borderTop: 'none', borderRadius: '0 0 12px 12px',
                background: 'white', animation: 'pf-open 0.25s ease' }}>
                <div className="pf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 280 }}>
                  {/* Left: Fields */}
                  <div style={{ padding: '1.15rem 1.25rem', borderRight: '1px solid rgba(26,26,46,0.05)',
                    display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    {config.fields.map(field => (
                      <div key={field.key}>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600,
                          color: 'var(--color-deep)', display: 'block', marginBottom: 3 }}>
                          {field.label}
                        </label>
                        {field.type === 'text' ? (
                          <input type="text" value={vals[field.key] || ''}
                            onChange={e => setVal(config.key, field.key, e.target.value)}
                            placeholder={(field as TextField).placeholder}
                            style={inputStyle} />
                        ) : field.type === 'multi' ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                            {(field as MultiSelectField).options.map(opt => {
                              const active = (vals[field.key] || '').split(', ').includes(opt);
                              return (
                                <button key={opt}
                                  onClick={() => setVal(config.key, field.key, toggleMulti(vals[field.key] || '', opt))}
                                  style={{ padding: '4px 10px', borderRadius: 100, border: 'none',
                                    background: active ? config.color : 'rgba(26,26,46,0.05)',
                                    color: active ? 'white' : 'var(--color-subtle)',
                                    fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.15s' }}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <>
                            <select value={vals[field.key] || ''}
                              onChange={e => setVal(config.key, field.key, e.target.value)}
                              style={{ ...inputStyle, cursor: 'pointer',
                                color: vals[field.key] ? 'var(--color-deep)' : 'var(--color-subtle)' }}>
                              <option value="">Choose...</option>
                              {(field as SelectField).options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                            {vals[field.key] === 'Other' && (
                              <input type="text" value={vals[`${field.key}_other`] || ''}
                                onChange={e => setVal(config.key, `${field.key}_other`, e.target.value)}
                                placeholder={(field as SelectField).otherPlaceholder || 'Describe...'}
                                style={{ ...inputStyle, marginTop: 4, borderColor: config.color + '30' }}
                                autoFocus />
                            )}
                          </>
                        )}
                      </div>
                    ))}

                    {/* Generate */}
                    <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button onClick={() => handleGenerate(config.key, config, vals)}
                        disabled={!filled || !!generating}
                        style={{ padding: '9px 20px', borderRadius: 100, border: 'none',
                          background: filled && !generating ? config.color : 'rgba(26,26,46,0.06)',
                          color: filled && !generating ? 'white' : 'var(--color-subtle)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
                          cursor: filled && !generating ? 'pointer' : 'default',
                          transition: 'all 0.2s', alignSelf: 'flex-start' }}>
                        {isGen ? 'Generating...' : live ? 'Regenerate' : 'Generate with AI'}
                      </button>
                      {error && generating === null && (
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#E94560', margin: 0 }}>{error}</p>
                      )}
                      {showUnlock && !isPaid && (
                        <UnlockModal feature="AI Prompt Generator" accentColor={config.color} />
                      )}
                    </div>
                  </div>

                  {/* Right: Output */}
                  <div style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column',
                    background: 'rgba(26,26,46,0.012)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                        color: live ? config.color : 'var(--color-subtle)', margin: 0,
                        display: 'flex', alignItems: 'center', gap: 6 }}>
                        {live ? 'AI-generated' : 'Preview'}
                        {isGen && <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                          background: config.color, animation: 'pf-pulse 0.8s ease-in-out infinite' }} />}
                      </p>
                      <button onClick={() => handleCopy(output, config.key)}
                        style={{ padding: '3px 10px', borderRadius: 100,
                          border: `1px solid ${isCopied ? config.color + '30' : 'rgba(26,26,46,0.08)'}`,
                          background: isCopied ? config.color + '08' : 'transparent',
                          cursor: 'pointer', fontFamily: 'var(--font-mono)',
                          fontSize: '0.6rem', fontWeight: 600,
                          color: isCopied ? config.color : 'var(--color-subtle)',
                          transition: 'all 0.2s' }}>
                        {isCopied ? '\u2713 Copied' : 'Copy'}
                      </button>
                    </div>

                    <div style={{ flex: 1, padding: '10px 12px', borderRadius: 8,
                      background: 'var(--color-cream, #FAF8F5)',
                      border: `1px solid ${live ? config.color + '20' : 'rgba(26,26,46,0.06)'}`,
                      borderLeft: `3px solid ${live ? config.color : config.color + '25'}`,
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.6,
                      color: 'var(--color-deep)', whiteSpace: 'pre-wrap' as const,
                      overflowY: 'auto' as const, opacity: live ? 1 : 0.45,
                      transition: 'opacity 0.3s, border-color 0.3s' }}>
                      {output}
                    </div>

                    {!live && filled && (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--color-subtle)',
                        margin: '0.4rem 0 0', opacity: 0.45, textAlign: 'center' as const }}>
                        Hit Generate for a tailored prompt
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes pf-open { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pf-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @media (max-width: 700px) { .pf-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', borderRadius: 7,
  border: '1px solid rgba(26,26,46,0.09)', background: '#FEFDFB',
  fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-deep)',
  outline: 'none', transition: 'border-color 0.2s',
};

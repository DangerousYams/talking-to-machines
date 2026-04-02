export type ToolCategory = 'fun' | 'useful' | 'quiz';

export interface ToolboxItem {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  accent: string;
  href: string;
}

export const toolboxItems: ToolboxItem[] = [
  // ═══ FUN STUFF ═══
  {
    id: 'prompt-roast',
    name: 'Prompt Roast',
    description: 'Submit a prompt and get brutally honest feedback on what\'s weak, what\'s missing, and how to fix it.',
    category: 'fun',
    accent: '#E94560',
    href: '/ch1#break',
  },
  {
    id: 'socratic-smackdown',
    name: 'Socratic Smackdown',
    description: 'The AI interviews you instead of answering — and proves why the right questions beat the right answers.',
    category: 'fun',
    accent: '#16C79A',
    href: '/ch2#break',
  },
  {
    id: 'vibe-check',
    name: 'Vibe Check',
    description: 'Paste any AI conversation and get a diagnosis: what\'s working, what\'s wasted, and what\'s missing.',
    category: 'fun',
    accent: '#7B61FF',
    href: '/ch3#break',
  },
  {
    id: 'dream-project',
    name: 'Dream Project',
    description: 'Describe your wildest idea and discover which AI tools could make it real.',
    category: 'fun',
    accent: '#0EA5E9',
    href: '/ch4#break',
  },
  {
    id: 'would-you-let-it',
    name: 'Would You Let It?',
    description: 'A rapid-fire game of trust: would you let an AI agent do this on its own? Your answers reveal your autonomy profile.',
    category: 'fun',
    accent: '#F5A623',
    href: '/ch5#break',
  },
  {
    id: 'sweet-talker',
    name: 'Sweet Talker',
    description: 'Test how easily you can get the AI to agree with something wrong. A sycophancy stress test.',
    category: 'fun',
    accent: '#F5A623',
    href: '/absolutely-youre-right#break',
  },
  {
    id: 'ship-it',
    name: 'Ship It',
    description: 'Describe your idea and get a brutally honest feasibility assessment — complexity, timeline, and what to build first.',
    category: 'fun',
    accent: '#7B61FF',
    href: '/ch7#break',
  },
  {
    id: 'irreplaceable-you',
    name: 'Irreplaceable You',
    description: 'Map your taste and skills against AI capabilities — and discover why your judgment is the product.',
    category: 'fun',
    accent: '#16C79A',
    href: '/ch10#break',
  },

  // ═══ ACTUALLY USEFUL ═══
  {
    id: 'prompt-makeover',
    name: 'Prompt Makeover',
    description: 'Transform a vague prompt into a powerful one by toggling building blocks — role, task, format, constraints, examples.',
    category: 'useful',
    accent: '#E94560',
    href: '/ch1#prompt-makeover',
  },
  {
    id: 'agent-swarm',
    name: 'Agent Swarm',
    description: 'Break a complex task into 5 specialized AI agents with roles, tools, and execution plans.',
    category: 'useful',
    accent: '#E94560',
    href: '/ch6#break',
  },
  {
    id: 'prompt-framer-image',
    name: 'Image Prompt Builder',
    description: 'Build structured prompts for Midjourney, DALL·E, and other image generators.',
    category: 'useful',
    accent: '#E94560',
    href: '/field-guide?tool=image',
  },
  {
    id: 'prompt-framer-video',
    name: 'Video Prompt Builder',
    description: 'Craft prompts for Sora, Runway, and Kling. Scene, camera movement, style, duration.',
    category: 'useful',
    accent: '#7B61FF',
    href: '/field-guide?tool=video',
  },
  {
    id: 'prompt-framer-music',
    name: 'Music Prompt Builder',
    description: 'Write prompts for Suno and Udio. Genre, mood, instruments, vocals, tempo, structure.',
    category: 'useful',
    accent: '#F5A623',
    href: '/field-guide?tool=music',
  },
  {
    id: 'prompt-framer-code',
    name: 'Code Prompt Builder',
    description: 'Structure prompts for code generation. Language, framework, task type, constraints.',
    category: 'useful',
    accent: '#16C79A',
    href: '/field-guide?tool=code',
  },
  {
    id: 'prompt-framer-research',
    name: 'Research Prompt Builder',
    description: 'Build prompts for Perplexity, Claude, and research tools. Topic, depth, sources, format.',
    category: 'useful',
    accent: '#0EA5E9',
    href: '/field-guide?tool=research',
  },
  {
    id: 'prompt-framer-writing',
    name: 'Writing Prompt Builder',
    description: 'Craft prompts for essays, articles, and creative writing. Tone, audience, structure.',
    category: 'useful',
    accent: '#0F3460',
    href: '/field-guide?tool=writing',
  },
  {
    id: 'prompt-framer-presentation',
    name: 'Slides Prompt Builder',
    description: 'Build prompts for AI-generated presentations. Topic, audience, slide count, visual style.',
    category: 'useful',
    accent: '#7B61FF',
    href: '/field-guide?tool=presentation',
  },
  {
    id: 'eval-framework',
    name: 'Eval Framework',
    description: 'Describe your project and get a verification checklist — the tests and criteria that prove it actually works.',
    category: 'useful',
    accent: '#E94560',
    href: '/ch9#break',
  },
  {
    id: 'project-instructions-builder',
    name: 'Project Instructions Builder',
    description: 'Build a comprehensive project.md — the single document that tells AI exactly how to work on your project.',
    category: 'useful',
    accent: '#16C79A',
    href: '/ch11#project-instructions-builder',
  },
  {
    id: 'complexity-score',
    name: 'Complexity Score',
    description: 'Describe a project and get a complexity breakdown — what\'s straightforward, what needs planning, and what needs you.',
    category: 'useful',
    accent: '#0F3460',
    href: '/ch8#break',
  },

  // ═══ QUIZ & CHALLENGE ═══
  {
    id: 'debug-detective',
    name: 'Debug Detective',
    description: 'Investigate buggy AI outputs. Find what went wrong, diagnose the prompt failure, and fix it.',
    category: 'quiz',
    accent: '#E94560',
    href: '/ch9',
  },
  {
    id: 'sycophancy-test',
    name: 'Sycophancy Test',
    description: 'Present the AI with a wrong assumption and see if it agrees or pushes back. Compare leading vs. neutral framing.',
    category: 'quiz',
    accent: '#F5A623',
    href: '/absolutely-youre-right',
  },
];

export const categories: Record<ToolCategory, { label: string; subtitle: string }> = {
  fun: { label: 'Fun Stuff', subtitle: 'Play, explore, get your prompts roasted' },
  useful: { label: 'Actually Useful', subtitle: 'Tools you\'ll come back to' },
  quiz: { label: 'Quiz & Challenge', subtitle: 'Test what you know' },
};

// Legacy export for BreakReveal compatibility (tools-unlock system uses IDs derived from toolName)
export interface BreakTool {
  id: string;
  name: string;
  description: string;
  chapter: number;
  accent: string;
}

export const breakTools: BreakTool[] = [
  { id: 'prompt-roast', name: 'Prompt Roast', description: '', chapter: 1, accent: '#E94560' },
  { id: 'socratic-smackdown', name: 'Socratic Smackdown', description: '', chapter: 2, accent: '#16C79A' },
  { id: 'vibe-check', name: 'Vibe Check', description: '', chapter: 3, accent: '#7B61FF' },
  { id: 'dream-project', name: 'Dream Project', description: '', chapter: 4, accent: '#0EA5E9' },
  { id: 'would-you-let-it', name: 'Would You Let It?', description: '', chapter: 5, accent: '#F5A623' },
  { id: 'agent-swarm', name: 'Agent Swarm', description: '', chapter: 6, accent: '#E94560' },
  { id: 'ship-it', name: 'Ship It', description: '', chapter: 7, accent: '#7B61FF' },
  { id: 'complexity-score', name: 'Complexity Score', description: '', chapter: 8, accent: '#0F3460' },
  { id: 'eval-framework', name: 'Eval Framework', description: '', chapter: 9, accent: '#E94560' },
  { id: 'sweet-talker', name: 'Sweet Talker', description: '', chapter: 0, accent: '#F5A623' },
  { id: 'irreplaceable-you', name: 'Irreplaceable You', description: '', chapter: 10, accent: '#16C79A' },
];

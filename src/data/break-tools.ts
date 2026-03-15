export interface BreakTool {
  id: string;
  name: string;
  description: string;
  chapter: number;
  accent: string;
}

export const breakTools: BreakTool[] = [
  {
    id: 'prompt-roast',
    name: 'Prompt Roast',
    description: 'Submit a prompt and get brutally honest feedback on what\'s weak, what\'s missing, and how to fix it.',
    chapter: 1,
    accent: '#E94560',
  },
  {
    id: 'socratic-smackdown',
    name: 'Socratic Smackdown',
    description: 'The AI interviews you instead of answering — and proves why the right questions beat the right answers.',
    chapter: 2,
    accent: '#16C79A',
  },
  {
    id: 'vibe-check',
    name: 'Vibe Check',
    description: 'Paste any AI conversation and get a diagnosis: what\'s working, what\'s wasted, and what\'s missing from the context.',
    chapter: 3,
    accent: '#7B61FF',
  },
  {
    id: 'dream-project',
    name: 'Dream Project',
    description: 'Describe your wildest idea and discover which AI tools could make it real — mapped across the full landscape.',
    chapter: 4,
    accent: '#0EA5E9',
  },
  {
    id: 'would-you-let-it',
    name: 'Would You Let It?',
    description: 'A rapid-fire game of trust: would you let an AI agent do this on its own? Your answers reveal your autonomy profile.',
    chapter: 5,
    accent: '#F5A623',
  },
  {
    id: 'agent-takeover',
    name: 'Agent Takeover',
    description: 'Design a multi-step agent and watch it work — or spectacularly fail. Debugging is half the fun.',
    chapter: 6,
    accent: '#E94560',
  },
  {
    id: 'ship-it',
    name: 'Ship It',
    description: 'Give Claude Code a real task and watch it think, plan, code, and iterate — in a simulated terminal.',
    chapter: 7,
    accent: '#7B61FF',
  },
  {
    id: 'complexity-score',
    name: 'Complexity Score',
    description: 'Describe a project and get a complexity breakdown — what\'s easy for AI, what needs orchestration, and what needs you.',
    chapter: 8,
    accent: '#0F3460',
  },
  {
    id: 'sweet-talker',
    name: 'Sweet Talker',
    description: 'Test how easily you can get the AI to agree with something wrong. A sycophancy stress test.',
    chapter: 9,
    accent: '#E94560',
  },
  {
    id: 'irreplaceable-you',
    name: 'Irreplaceable You',
    description: 'Map your skills against AI capabilities and discover where your human edge actually lives.',
    chapter: 10,
    accent: '#16C79A',
  },
];

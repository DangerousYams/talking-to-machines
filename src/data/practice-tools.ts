export interface PracticeTool {
  id: string;
  name: string;
  chapter: number;
  chapterName: string;
  accent: string;
  desc: string;
  tag: 'build' | 'quiz' | 'explore' | 'simulate';
}

export const practiceTools: PracticeTool[] = [
  // ── Chapter 1: You Already Speak AI ──
  {
    id: 'prompt-makeover',
    name: 'Prompt Makeover',
    chapter: 1,
    chapterName: 'You Already Speak AI',
    accent: '#E94560',
    desc: 'Toggle building blocks on/off and watch a vague prompt transform into a precise one.',
    tag: 'build',
  },
  {
    id: 'guess-the-prompt',
    name: 'Guess the Prompt',
    chapter: 1,
    chapterName: 'You Already Speak AI',
    accent: '#E94560',
    desc: 'See polished AI output and guess which prompt created it.',
    tag: 'quiz',
  },
  {
    id: 'iteration-loop',
    name: 'Iteration Loop',
    chapter: 1,
    chapterName: 'You Already Speak AI',
    accent: '#E94560',
    desc: 'Walk through 5 rounds of prompt refinement and see quality improve.',
    tag: 'explore',
  },
  {
    id: 'prompt-roast',
    name: 'Prompt Roast',
    chapter: 1,
    chapterName: 'You Already Speak AI',
    accent: '#E94560',
    desc: 'Submit a prompt and get brutally honest AI feedback on how to improve it.',
    tag: 'simulate',
  },

  // ── Chapter 2: The Art of Asking ──
  {
    id: 'prompt-laboratory',
    name: 'Prompt Laboratory',
    chapter: 2,
    chapterName: 'The Art of Asking',
    accent: '#0F3460',
    desc: 'Drag-and-drop prompt building blocks into a workspace and run them against AI.',
    tag: 'build',
  },
  {
    id: 'flip-the-script',
    name: 'Flip the Script',
    chapter: 2,
    chapterName: 'The Art of Asking',
    accent: '#0F3460',
    desc: 'Let the AI interview you before answering — see how much better the result gets.',
    tag: 'simulate',
  },
  {
    id: 'debug-the-prompt',
    name: 'Debug the Prompt',
    chapter: 2,
    chapterName: 'The Art of Asking',
    accent: '#0F3460',
    desc: 'Diagnose what went wrong in a broken prompt — ambiguity, contradictions, missing context.',
    tag: 'quiz',
  },

  // ── Chapter 3: Context Engineering ──
  {
    id: 'context-window-viz',
    name: 'Context Window Viz',
    chapter: 3,
    chapterName: 'Context Engineering',
    accent: '#7B61FF',
    desc: 'Watch a context window fill up and overflow as messages pile in.',
    tag: 'explore',
  },
  {
    id: 'forgetting-experiment',
    name: 'Forgetting Experiment',
    chapter: 3,
    chapterName: 'Context Engineering',
    accent: '#7B61FF',
    desc: 'See AI "forget" early details — then fix it with context summarization.',
    tag: 'simulate',
  },
  {
    id: 'system-prompt-sandbox',
    name: 'System Prompt Sandbox',
    chapter: 3,
    chapterName: 'Context Engineering',
    accent: '#7B61FF',
    desc: 'Write a system prompt and test how well it holds up under pressure.',
    tag: 'build',
  },

  // ── Chapter 4: The AI Landscape ──
  {
    id: 'tool-wall',
    name: 'Tool Wall',
    chapter: 4,
    chapterName: 'The AI Landscape',
    accent: '#0EA5E9',
    desc: 'Browse 30+ AI tools across image, video, audio, research, and coding categories.',
    tag: 'explore',
  },
  {
    id: 'workflow-builder',
    name: 'Workflow Builder',
    chapter: 4,
    chapterName: 'The AI Landscape',
    accent: '#0EA5E9',
    desc: 'Chain AI tools into a multi-step pipeline for a complete creative workflow.',
    tag: 'build',
  },
  {
    id: 'head-to-head',
    name: 'Head to Head',
    chapter: 4,
    chapterName: 'The AI Landscape',
    accent: '#0EA5E9',
    desc: 'Compare outputs from different AI tools side by side on the same prompt.',
    tag: 'explore',
  },

  // ── Chapter 5: Give It Tools ──
  {
    id: 'tool-catalog',
    name: 'Tool Catalog',
    chapter: 5,
    chapterName: 'Give It Tools',
    accent: '#F5A623',
    desc: 'Browse the tools AI can use — web search, code execution, file I/O, and more.',
    tag: 'explore',
  },
  {
    id: 'trust-thermometer',
    name: 'Trust Thermometer',
    chapter: 5,
    chapterName: 'Give It Tools',
    accent: '#F5A623',
    desc: 'Set autonomy levels for AI actions and see the tradeoffs.',
    tag: 'quiz',
  },

  // ── Chapter 6: Building Agents ──
  {
    id: 'agent-blueprint',
    name: 'Agent Blueprint',
    chapter: 6,
    chapterName: 'Building Agents',
    accent: '#E94560',
    desc: 'Design an AI agent step by step — goal, plan, tools, and execution.',
    tag: 'build',
  },
  {
    id: 'failure-modes-lab',
    name: 'Failure Modes Lab',
    chapter: 6,
    chapterName: 'Building Agents',
    accent: '#E94560',
    desc: 'Diagnose and fix bugs in pre-built agents — infinite loops, wrong tools, hallucinated actions.',
    tag: 'simulate',
  },
  {
    id: 'handoff-chain',
    name: 'Handoff Chain',
    chapter: 6,
    chapterName: 'Building Agents',
    accent: '#E94560',
    desc: 'Watch three specialist agents collaborate: Researcher, Writer, Editor.',
    tag: 'simulate',
  },

  // ── Chapter 7: Mastering Claude Code ──
  {
    id: 'terminal-playground',
    name: 'Terminal Playground',
    chapter: 7,
    chapterName: 'Mastering Claude Code',
    accent: '#7B61FF',
    desc: 'A simulated Claude Code terminal — type tasks and watch files get created.',
    tag: 'simulate',
  },
  {
    id: 'skill-builder',
    name: 'Skill Builder',
    chapter: 7,
    chapterName: 'Mastering Claude Code',
    accent: '#7B61FF',
    desc: 'Write a SKILL.md definition and test it against sample tasks.',
    tag: 'build',
  },
  {
    id: 'refactor-race',
    name: 'Refactor Race',
    chapter: 7,
    chapterName: 'Mastering Claude Code',
    accent: '#7B61FF',
    desc: 'Race against AI to refactor messy code — then compare the results.',
    tag: 'simulate',
  },

  // ── Chapter 8: Orchestrating Complexity ──
  {
    id: 'project-orchestrator',
    name: 'Project Orchestrator',
    chapter: 8,
    chapterName: 'Orchestrating Complexity',
    accent: '#0F3460',
    desc: 'Break a complex project into tasks on a kanban board and manage dependencies.',
    tag: 'build',
  },
  {
    id: 'context-packing',
    name: 'Context Packing',
    chapter: 8,
    chapterName: 'Orchestrating Complexity',
    accent: '#0F3460',
    desc: 'Pack documents into a limited context window — too little and AI hallucinates, too much and it overflows.',
    tag: 'simulate',
  },

  // ── Chapter 9: When AI Gets It Wrong ──
  {
    id: 'fact-or-fabrication',
    name: 'Fact or Fabrication',
    chapter: 9,
    chapterName: 'When AI Gets It Wrong',
    accent: '#E94560',
    desc: 'Can you spot the hallucinations? 10 rounds of fact vs. fiction.',
    tag: 'quiz',
  },
  {
    id: 'sycophancy-test',
    name: 'Sycophancy Test',
    chapter: 9,
    chapterName: 'When AI Gets It Wrong',
    accent: '#E94560',
    desc: 'Feed AI a wrong belief and see if it agrees or pushes back.',
    tag: 'simulate',
  },

  // ── Chapter 10: The Human Edge ──
  {
    id: 'skills-spectrum',
    name: 'Skills Spectrum',
    chapter: 10,
    chapterName: 'The Human Edge',
    accent: '#16C79A',
    desc: 'Place skills on a spectrum from "AI handles this" to "only humans can do this."',
    tag: 'quiz',
  },
  {
    id: 'job-transformer',
    name: 'Job Transformer',
    chapter: 10,
    chapterName: 'The Human Edge',
    accent: '#16C79A',
    desc: 'Explore how AI changes the shape of real careers — task by task.',
    tag: 'explore',
  },
  {
    id: 'taste-test',
    name: 'Taste Test',
    chapter: 10,
    chapterName: 'The Human Edge',
    accent: '#16C79A',
    desc: 'Rank 5 AI-generated outputs and see if your taste matches the experts.',
    tag: 'quiz',
  },
  {
    id: 'first-principles-lab',
    name: 'First Principles Lab',
    chapter: 10,
    chapterName: 'The Human Edge',
    accent: '#16C79A',
    desc: 'AI gives a confident answer. Is it right? Trust or challenge — your knowledge is the BS detector.',
    tag: 'quiz',
  },

  // ── Chapter 11: Build Something Real ──
  {
    id: 'project-planner',
    name: 'Project Planner',
    chapter: 11,
    chapterName: 'Build Something Real',
    accent: '#16C79A',
    desc: 'Answer a few questions and get a tailored capstone project with a week-by-week plan.',
    tag: 'build',
  },
  {
    id: 'showcase-gallery',
    name: 'Showcase Gallery',
    chapter: 11,
    chapterName: 'Build Something Real',
    accent: '#16C79A',
    desc: 'Browse student projects — see what others have built with AI.',
    tag: 'explore',
  },

  // ── Labs ──
  {
    id: 'building-blocks-assembly',
    name: 'Building Blocks Assembly',
    chapter: 0,
    chapterName: 'Lab',
    accent: '#7B61FF',
    desc: 'Watch the five prompt building blocks fly into an assembled stack.',
    tag: 'explore',
  },
  {
    id: 'prompt-morph-animation',
    name: 'Prompt Morph',
    chapter: 0,
    chapterName: 'Lab',
    accent: '#7B61FF',
    desc: 'A vague prompt morphs into a precise one, building block by building block.',
    tag: 'explore',
  },
];

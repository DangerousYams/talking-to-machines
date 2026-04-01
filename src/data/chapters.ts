export interface Beat {
  id: string;
  number: number;
  title: string;
  tldr: string;
  /** ~minutes of reading + interaction */
  estimatedMinutes: number;
}

export interface Chapter {
  number: number;
  slug: string;
  title: string;
  hook: string;
  accent: string;
  concepts: { name: string; description: string }[];
  beats?: Beat[];
}

export const chapters: Chapter[] = [
  {
    number: 1,
    slug: "ch1",
    title: "You Already Speak AI",
    hook: "Your first draft won't be magic. But your third one might be.",
    accent: "#E94560",
    concepts: [
      { name: "The 5 Building Blocks", description: "Role, Task, Format, Constraints, Examples" },
      { name: "One-Shot vs. Iteration", description: "A single prompt rarely nails it. The magic is in the back-and-forth: prompt, evaluate, refine, repeat." },
      { name: "The Prompt Spectrum", description: "From vague to precise\u2014learning to move along it is the core skill." },
    ],
    beats: [
      {
        id: 'communication-gap',
        number: 1,
        title: 'The Communication Gap',
        tldr: 'Vague prompts get vague answers. The gap between what AI can do and what most people get is a communication problem.',
        estimatedMinutes: 3,
      },
      {
        id: 'building-blocks',
        number: 2,
        title: 'The Five Building Blocks',
        tldr: 'Every good prompt uses some combination of Role, Task, Format, Constraints, and Examples.',
        estimatedMinutes: 4,
      },
      {
        id: 'iteration-mindset',
        number: 3,
        title: 'The Iteration Mindset',
        tldr: 'Nobody nails it first try. Prompt, evaluate, refine, repeat — that loop is the actual skill.',
        estimatedMinutes: 3,
      },
      {
        id: 'test-yourself',
        number: 4,
        title: 'Test Yourself',
        tldr: 'Put your new skills to the test — guess the prompt behind AI outputs and get your own prompts roasted.',
        estimatedMinutes: 4,
      },
    ],
  },
  {
    number: 2,
    slug: "ch2",
    title: "The Art of Asking",
    hook: "The best prompt is a question that makes the AI ask you questions.",
    accent: "#0F3460",
    concepts: [
      { name: "The Socratic Method", description: "Ask the AI to interview you. It becomes a collaborator who draws out YOUR intent." },
      { name: "Few-Shot Prompting", description: "Show examples instead of describing what you want." },
      { name: "Chain of Thought", description: "Ask AI to reason step-by-step for better answers." },
      { name: "Prompt Debugging", description: "When output is wrong, the fix is almost always in the prompt." },
    ],
  },
  {
    number: 3,
    slug: "ch3",
    title: "Context Engineering",
    hook: "AI doesn\u2019t forget\u2014it was never remembering in the first place.",
    accent: "#7B61FF",
    concepts: [
      { name: "Context \u2260 Memory", description: "AI has no persistent memory by default. What feels like \u2018forgetting\u2019 is just the context window filling up." },
      { name: "Context Engineering", description: "The art of deciding what info to put in front of the AI and how to structure it." },
      { name: "Tokens", description: "AI counts tokens, not words. Budget accordingly." },
      { name: "System Prompts", description: "Persistent instructions at the top of the context. The foundation of every interaction." },
    ],
  },
  {
    number: 4,
    slug: "ch4",
    title: "The AI Landscape",
    hook: "A field guide to every AI tool you can actually use right now.",
    accent: "#0EA5E9",
    concepts: [
      { name: "Image Synthesis", description: "Midjourney, DALL-E, Stable Diffusion, Flux, Ideogram." },
      { name: "Video & Audio", description: "Sora, Runway, Suno, ElevenLabs\u2014and when to use each." },
      { name: "Research Agents", description: "Perplexity, Elicit, Consensus, NotebookLM." },
      { name: "Coding Tools", description: "Claude Code, Cursor, Antigravity, GitHub Copilot." },
    ],
  },
  {
    number: 5,
    slug: "ch5",
    title: "Give It Tools",
    hook: "The leap from \u201canswer questions\u201d to \u201ctake actions.\u201d",
    accent: "#F5A623",
    concepts: [
      { name: "The Agent Loop", description: "Observe \u2192 Think \u2192 Act \u2192 Observe, repeat until done." },
      { name: "Tool Use / Function Calling", description: "AI decides when to call functions and what arguments to pass." },
      { name: "Autonomy vs. Control", description: "How much should agents do without asking? Depends on stakes, reversibility, and trust." },
    ],
  },
  {
    number: 6,
    slug: "ch6",
    title: "Building Agents",
    hook: "Design, wire, and deploy an AI agent from scratch.",
    accent: "#E94560",
    concepts: [
      { name: "Agent Architecture", description: "Goal \u2192 Plan \u2192 Tools \u2192 Memory \u2192 Evaluation." },
      { name: "Planning & Decomposition", description: "Good agents break big goals into small tool-using steps." },
      { name: "Error Recovery", description: "Retry, fallback, or ask the human. Designing for the unhappy path." },
      { name: "Multi-Agent Systems", description: "Specialist agents that collaborate: one researches, one writes, one reviews." },
    ],
  },
  {
    number: 7,
    slug: "ch7",
    title: "Anyone Can Build This",
    hook: "You don\u2019t need to be a programmer. You need an idea.",
    accent: "#7B61FF",
    concepts: [
      { name: "Personal Software", description: "Tools built for an audience of one. If it solves your problem, it ships." },
      { name: "The Director\u2019s Role", description: "You don\u2019t write the code. You specify what to build, evaluate the output, and iterate." },
      { name: "Coding Agents", description: "AI tools that read your project, write code, run it, and fix their own errors." },
      { name: "The Skill Paradox", description: "You need enough knowledge to evaluate output, not to write every line." },
    ],
  },
  {
    number: 8,
    slug: "ch8",
    title: "Speaking the Language",
    hook: "The vocabulary of building\u2014not code, just the nouns and verbs.",
    accent: "#0F3460",
    concepts: [
      { name: "The Stack", description: "Frontend, backend, database, deployment. The four layers of any web application." },
      { name: "Technical Vocabulary", description: "Knowing the nouns (component, endpoint, schema) and verbs (deploy, fetch, render) so you can direct." },
      { name: "The Agent as Tutor", description: "Your coding agent answers every technical question. You don\u2019t need Google\u2014you need to ask." },
      { name: "The First Session", description: "Open your tool, describe your project, let the agent ask questions, review what it builds." },
    ],
  },
  {
    number: 9,
    slug: "ch9",
    title: "The Build Loop",
    hook: "Expect imperfection. Enjoy refinement. The third version is where the magic happens.",
    accent: "#E94560",
    concepts: [
      { name: "Specify \u2192 Generate \u2192 Verify", description: "The core loop. Be concrete, let the agent build, then check the output. Repeat." },
      { name: "Acceptance Criteria", description: "Plain-English descriptions of what \u2018done\u2019 looks like. Your evaluation framework." },
      { name: "Debugging Without Code", description: "Describe symptoms, share errors, ask the agent to explain. You don\u2019t need to read the code." },
      { name: "The Iteration Mindset", description: "The first version is always wrong. The third is good. The fifth is great." },
    ],
  },
  {
    number: 10,
    slug: "ch10",
    title: "Taste is the Product",
    hook: "AI generates options. You choose the right one. That\u2019s the skill.",
    accent: "#16C79A",
    concepts: [
      { name: "Taste", description: "The ability to distinguish good from mediocre. Developed through exposure, not talent." },
      { name: "References Over Descriptions", description: "Show the agent what you want\u2014screenshots, links, examples\u2014instead of describing it in words." },
      { name: "The Three Evaluation Lenses", description: "Visual: does it look right? Functional: does it work? User: would I actually use this?" },
      { name: "The Human Edge", description: "What to build, who it\u2019s for, why it matters\u2014that\u2019s all you." },
    ],
  },
  {
    number: 11,
    slug: "ch11",
    title: "Build Something Real",
    hook: "Your capstone project.",
    accent: "#16C79A",
    concepts: [
      { name: "5 Tracks", description: "Game Maker \u00b7 Storyteller \u00b7 Investigator \u00b7 Tool Builder \u00b7 Agent Designer." },
      { name: "3-Week Sprint", description: "Week 1: Ideate & scope. Week 2: Build. Week 3: Polish & present." },
    ],
  },
];

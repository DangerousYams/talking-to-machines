export interface Chapter {
  number: number;
  slug: string;
  title: string;
  hook: string;
  accent: string;
  concepts: { name: string; description: string }[];
}

export const chapters: Chapter[] = [
  {
    number: 1,
    slug: "ch1",
    title: "You Already Speak AI",
    hook: "One-shot prompts are parlor tricks. Iteration is the real pipeline.",
    accent: "#E94560",
    concepts: [
      { name: "The 5 Building Blocks", description: "Role, Task, Format, Constraints, Examples" },
      { name: "One-Shot vs. Iteration", description: "A single prompt rarely nails it. The magic is in the back-and-forth: prompt, evaluate, refine, repeat." },
      { name: "The Prompt Spectrum", description: "From vague to precise\u2014learning to move along it is the core skill." },
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
      { name: "Coding Tools", description: "Claude Code, Cursor, Windsurf, GitHub Copilot." },
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
    title: "Mastering Claude Code",
    hook: "Your AI pair programmer, from first command to custom Skills.",
    accent: "#7B61FF",
    concepts: [
      { name: "What Claude Code Is", description: "CLI agent that reads your codebase, writes files, runs commands, and iterates." },
      { name: "Skills", description: "Reusable instruction sets that teach Claude Code how to handle specific tasks." },
      { name: "Specify \u2192 Generate \u2192 Verify", description: "The core loop. Your job is clarity and judgment." },
      { name: "The Skill Paradox", description: "You need enough knowledge to evaluate output, not to write every line." },
    ],
  },
  {
    number: 8,
    slug: "ch8",
    title: "Orchestrating Complexity",
    hook: "Managing AI across projects bigger than any context window.",
    accent: "#0F3460",
    concepts: [
      { name: "Decomposition", description: "Break work into chunks with clear inputs, outputs, and minimal dependencies." },
      { name: "The Handoff Pattern", description: "Output from conversation 1 becomes input to conversation 2." },
      { name: "Version Control for AI Work", description: "Track what prompts worked, compare output versions, maintain a decision trail." },
    ],
  },
  {
    number: 9,
    slug: "ch9",
    title: "When AI Gets It Wrong",
    hook: "The verification habits that separate amateurs from pros.",
    accent: "#E94560",
    concepts: [
      { name: "Hallucinations", description: "AI produces text that sounds right without any concept of truth." },
      { name: "Sycophancy", description: "AI tends to agree with you, even when you\u2019re wrong." },
      { name: "The Verification Habit", description: "Can I verify? Did I ask for sources? Does this pass the common sense test?" },
    ],
  },
  {
    number: 10,
    slug: "ch10",
    title: "The Human Edge",
    hook: "What AI can\u2019t replace\u2014and what it makes 10x easier.",
    accent: "#16C79A",
    concepts: [
      { name: "What Stays Human", description: "Communication, taste, judgment, ethics, leadership, empathy, original questions." },
      { name: "First Principles Thinking", description: "AI remixes what exists. You reason from ground truth to push into new territory." },
      { name: "The New Career Math", description: "It\u2019s \u2018humans with AI vs. humans without AI.\u2019" },
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

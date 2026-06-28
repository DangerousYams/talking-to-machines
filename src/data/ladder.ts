// ---------------------------------------------------------------------------
// The Ladder — data spine
// Levels + habits come from the AI Thinking framework (ai-thinking.astro)
// and the 15 workshop principles (workshop-day1.pdf).
// ---------------------------------------------------------------------------

export type LevelId = 'quoter' | 'curator' | 'author' | 'orchestrator';

export interface Level {
  id: LevelId;
  num: number;
  name: string;
  line: string;
  color: string; // CSS color token value
}

export const levels: Level[] = [
  {
    id: 'quoter',
    num: 1,
    name: 'Quoter',
    line: 'Copies AI output and submits it as their own. The shortcut. Looks easy. Teaches nothing.',
    color: '#6B7280',
  },
  {
    id: 'curator',
    num: 2,
    name: 'Curator',
    line: 'Knows which AI is best for which job. Writing one. Research another. Picks the right tool every time.',
    color: '#F5A623',
  },
  {
    id: 'author',
    num: 3,
    name: 'Author',
    line: 'Takes what AI gives and makes it theirs. Voice, taste, judgment. The work sounds like them, not the machine.',
    color: '#16C79A',
  },
  {
    id: 'orchestrator',
    num: 4,
    name: 'Orchestrator',
    line: 'Runs many AIs together. Turns common tasks into Skills. Makes something only they could make.',
    color: '#7B61FF',
  },
];

export const levelById = (id: LevelId): Level => levels.find((l) => l.id === id)!;

// ---------------------------------------------------------------------------
// Know / Do / Show
// ---------------------------------------------------------------------------

export type KDS = 'know' | 'do' | 'show';

export const kdsMeta: Record<KDS, { label: string; color: string; line: string }> = {
  know: { label: 'Know', color: '#0EA5E9', line: 'Research, reasoning, brainstorming. Input and output are understanding.' },
  do: { label: 'Do', color: '#E94560', line: 'Agents, automations, software. Input is intent. Output is a thing happening.' },
  show: { label: 'Show', color: '#F5A623', line: 'Decks, sites, apps, videos. Input is a message. Output is something consumable.' },
};

// ---------------------------------------------------------------------------
// Placement quiz — assigns a starting rung. Orchestrator must be earned.
// ---------------------------------------------------------------------------

export interface QuizOption {
  label: string;
  points: number; // 0..3
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const placementQuiz: QuizQuestion[] = [
  {
    id: 'frequency',
    question: 'How often do you actually use AI?',
    options: [
      { label: "I've tried it once or twice", points: 0 },
      { label: 'A few times a week, quick questions', points: 1 },
      { label: 'Most days, for real work', points: 2 },
      { label: 'It runs parts of my work without me', points: 3 },
    ],
  },
  {
    id: 'first-answer',
    question: 'AI gives you an answer. What usually happens next?',
    options: [
      { label: 'I copy it and use it as-is', points: 0 },
      { label: 'I skim it, tweak a word or two, send it', points: 1 },
      { label: 'I edit until it sounds like me', points: 2 },
      { label: 'I never take the first answer. I push back and iterate', points: 3 },
    ],
  },
  {
    id: 'toolkit',
    question: 'How many different AI tools did you use last month?',
    options: [
      { label: 'One chat app', points: 0 },
      { label: 'Two or three, all chat', points: 1 },
      { label: 'Several kinds: chat plus image, research, or voice tools', points: 2 },
      { label: 'A whole kit, including agents or automations', points: 3 },
    ],
  },
  {
    id: 'deepest',
    question: "What's the most advanced thing you've done with AI?",
    options: [
      { label: 'Asked questions and got answers', points: 0 },
      { label: 'Wrote a careful prompt with context and examples', points: 1 },
      { label: 'Had AI interview me before doing a task', points: 2 },
      { label: 'Built a custom skill, agent, or automation', points: 3 },
    ],
  },
  {
    id: 'self-place',
    question: 'Be honest. Which sentence is you?',
    options: [
      { label: '"I tried ChatGPT once." Nothing stuck', points: 0 },
      { label: 'AI a few times a week. Drafts, quick answers', points: 1 },
      { label: 'Every workflow I own has AI inside it', points: 2 },
      { label: 'Systems do the work. I direct', points: 3 },
    ],
  },
];

export function placeFromScore(total: number): LevelId {
  if (total <= 5) return 'quoter';
  if (total <= 10) return 'curator';
  return 'author'; // Orchestrator can't be granted by a quiz
}

// ---------------------------------------------------------------------------
// Concept slides — workshop deck content, one screen each
// ---------------------------------------------------------------------------

export interface TitleSegment {
  t: string;
  c?: string; // accent color
}

export interface ConceptCard {
  label: string;
  title: string;
  body: string;
  color?: string;
}

export interface ConceptSlideData {
  id: string;
  eyebrow: string;
  title: TitleSegment[];
  sub?: string;
  cards?: ConceptCard[];
  footnote?: string;
}

export const conceptSlides: Record<string, ConceptSlideData> = {
  'three-moves': {
    id: 'three-moves',
    eyebrow: 'Habit 03 · The core loop',
    title: [{ t: 'Three moves. ' }, { t: 'On repeat.', c: '#E94560' }],
    sub: 'Every good AI session is the same loop.',
    cards: [
      { label: '01', title: 'Choose', body: 'Pick the right AI for the task.', color: '#F5A623' },
      { label: '02', title: 'Communicate', body: 'Frame the conversation. Show examples.', color: '#E94560' },
      { label: '03', title: 'Evaluate', body: 'Never take the first answer.', color: '#16C79A' },
    ],
    footnote: 'You are about to run this loop for real.',
  },
  'know-do-show': {
    id: 'know-do-show',
    eyebrow: 'Habit 15 · A mental model',
    title: [{ t: 'Every AI task is ' }, { t: 'one of three things.', c: '#7B61FF' }],
    cards: [
      { label: 'INFORMATION', title: 'Know', body: kdsMeta.know.line, color: kdsMeta.know.color },
      { label: 'ACTION', title: 'Do', body: kdsMeta.do.line, color: kdsMeta.do.color },
      { label: 'ARTIFACT', title: 'Show', body: kdsMeta.show.line, color: kdsMeta.show.color },
    ],
    footnote: 'Tag the task first, and the right tool becomes obvious.',
  },
  'big-three': {
    id: 'big-three',
    eyebrow: 'Habit 04 · Choose',
    title: [{ t: 'ChatGPT. Claude. ' }, { t: 'Gemini.', c: '#7B61FF' }],
    sub: 'All three have their place. Only one is best at each thing.',
    cards: [
      { label: 'OPENAI', title: 'ChatGPT', body: 'The default everyone knows. Good for quick answers, travel, casual writing. Falls short on long, structured work.', color: '#16C79A' },
      { label: 'ANTHROPIC', title: 'Claude', body: "The pro's choice. Best thinking, best writing, best coding partner you can buy.", color: '#F5A623' },
      { label: 'GOOGLE', title: 'Gemini', body: 'The swiss army knife. Video, audio, images, research. The most generous free tier by far.', color: '#0EA5E9' },
    ],
    footnote: 'When in doubt, ask AI which AI to use.',
  },
  'limits': {
    id: 'limits',
    eyebrow: 'Tokens · Caps · The fine print',
    title: [{ t: 'Limits are ' }, { t: 'brutal.', c: '#E94560' }, { t: ' Learn the cost.' }],
    sub: 'Every subscription caps you. The trick is knowing what burns tokens.',
    cards: [
      { label: 'THE MATH', title: 'Words ≠ tokens', body: 'A token is roughly three quarters of a word. Every message you send, and every message before it, gets counted again on the next turn.' },
      { label: 'MODEL CHOICE', title: 'Not all models are equal', body: 'A thinking model can burn 5 to 10 times more tokens for the same question. Pick the smallest model that does the job.' },
      { label: 'WATCH YOURSELF', title: 'Check your usage', body: 'Find the usage screen in your AI app. Spot the expensive habits: long threads that should have started fresh.' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Exercise: Know / Do / Show Sorter
// ---------------------------------------------------------------------------

export interface SorterTask {
  task: string;
  answer: KDS;
  why: string;
}

export const sorterTasks: SorterTask[] = [
  { task: 'Research the best universities for marine biology', answer: 'know', why: 'The output is understanding. Nothing happens, nothing is made.' },
  { task: 'Rename 400 files to a clean naming scheme', answer: 'do', why: 'A thing happens to your files. Action, not insight.' },
  { task: 'A slide deck for Friday’s pitch', answer: 'show', why: 'An artifact another human will consume.' },
  { task: 'Summarize this 80-page contract', answer: 'know', why: 'You end up knowing what’s in it. Pure information.' },
  { task: 'Watch for price drops and email me when one hits', answer: 'do', why: 'An automation acting on your behalf. Classic Do.' },
  { task: 'A 30-second birthday video for grandma', answer: 'show', why: 'Something consumable, made to be watched.' },
  { task: 'Compare three phone plans and tell me the catch', answer: 'know', why: 'Analysis in, understanding out.' },
  { task: 'Draft replies to my support inbox in my tone', answer: 'do', why: 'Work being executed for you, message by message.' },
  { task: 'A one-page resume that doesn’t look like a template', answer: 'show', why: 'An artifact judged by human eyes.' },
  { task: 'Explain why my sourdough won’t rise', answer: 'know', why: 'Reasoning and diagnosis. You walk away understanding.' },
  { task: 'Move 200 rows of survey data into a clean sheet', answer: 'do', why: 'Execution. The deliverable is the work being done.' },
  { task: 'A landing page for my side project', answer: 'show', why: 'A consumable artifact with an audience.' },
];

// ---------------------------------------------------------------------------
// Exercise: The Map picker — which AI for this task (opinionated, mid-2026)
// ---------------------------------------------------------------------------

export interface PickerOption {
  name: string;
  correct?: boolean;
  verdict: string;
}

export interface PickerRound {
  scenario: string;
  kds: KDS;
  options: PickerOption[];
  lesson: string;
}

export const mapRounds: PickerRound[] = [
  {
    scenario: 'Master 40 pages of lecture notes and get quizzed on them',
    kds: 'know',
    options: [
      { name: 'NotebookLM', correct: true, verdict: 'Free, absurdly good. Feed it sources, get mastery.' },
      { name: 'Midjourney', verdict: 'Gorgeous images. Useless for studying notes.' },
      { name: 'Suno', verdict: 'It would write you a song about your notes. Tempting. No.' },
      { name: 'A long ChatGPT thread', verdict: 'Works until the thread forgets page 12. A source-grounded tool beats a chat here.' },
    ],
    lesson: 'Grounded study tools beat general chat when the source material matters.',
  },
  {
    scenario: 'A quick, free image for a party invite',
    kds: 'show',
    options: [
      { name: 'Nano Banana', correct: true, verdict: "Google's image gen. Fast, free, right inside Gemini." },
      { name: 'Photoshop', verdict: 'Powerful, paid, and overkill for an invite.' },
      { name: 'Perplexity', verdict: 'A research engine. It finds images, it does not make them.' },
      { name: 'ElevenLabs', verdict: 'That makes voices, not pictures.' },
    ],
    lesson: 'For fast and free visuals, Nano Banana is the current default.',
  },
  {
    scenario: 'A long, structured report you will actually ship',
    kds: 'show',
    options: [
      { name: 'Claude', correct: true, verdict: "The pro's choice. Long-form composition that holds its shape." },
      { name: 'ChatGPT', verdict: 'Fine for quick drafts. Quietly falls behind on long, serious work.' },
      { name: 'Nano Banana', verdict: 'An image model cannot write your report.' },
      { name: 'Kimi', verdict: 'Great at reading long things. Writing long things is a different sport.' },
    ],
    lesson: 'For serious long-form writing, Claude is the current pick.',
  },
  {
    scenario: 'Turn an idea into a working web app, no code',
    kds: 'do',
    options: [
      { name: 'Lovable', correct: true, verdict: 'Vibe-coding platforms are real magic. Describe an app, get an app.' },
      { name: 'Excel', verdict: 'Respect, but no.' },
      { name: 'Runway', verdict: 'Video generation. Different kind of magic.' },
      { name: 'DeepSeek chat', verdict: 'Smart model, but a chat box does not deploy an app for you.' },
    ],
    lesson: 'Vibe-coding platforms (Lovable, Replit, Emergent) build and deploy from plain English.',
  },
  {
    scenario: 'A natural voice-over for your video',
    kds: 'show',
    options: [
      { name: 'ElevenLabs', correct: true, verdict: 'Voice cloning and text-to-speech. The industry standard.' },
      { name: 'NotebookLM', verdict: 'It makes podcasts from documents, not voice-overs for your script.' },
      { name: 'Claude', verdict: 'Writes a beautiful script. Cannot speak it.' },
      { name: 'Ideogram', verdict: 'Text inside images. Not text into voices.' },
    ],
    lesson: 'For voice, ElevenLabs is the one to try first.',
  },
  {
    scenario: 'A full song from a text prompt',
    kds: 'show',
    options: [
      { name: 'Suno', correct: true, verdict: 'Full songs from a sentence. Uncanny.' },
      { name: 'Spotify', verdict: 'Finds songs that exist. Makes none.' },
      { name: 'Gemini', verdict: 'Many modes, but full song generation is not its lane.' },
      { name: 'LM Studio', verdict: 'Runs local models. None of them sing.' },
    ],
    lesson: 'Music generation is its own category. Suno and Udio own it.',
  },
  {
    scenario: 'Work with sensitive data you cannot paste into a public AI',
    kds: 'know',
    options: [
      { name: 'LM Studio + a local model', correct: true, verdict: 'AI on your own laptop. Private, free forever, offline.' },
      { name: 'ChatGPT', verdict: 'A public cloud service. Exactly what you were told to avoid.' },
      { name: 'Claude', verdict: 'Excellent, but still a cloud service. The constraint says local.' },
      { name: 'Perplexity', verdict: 'It searches the public web. Your data should not.' },
    ],
    lesson: 'Open models like Gemma run on your machine. Private by construction.',
  },
  {
    scenario: 'Read three long books for a thesis and stay coherent across all of them',
    kds: 'know',
    options: [
      { name: 'Kimi', correct: true, verdict: 'Ridiculously long context. Reads whole books and stays coherent.' },
      { name: 'ChatGPT free tier', verdict: 'It will forget book one by the middle of book two.' },
      { name: 'Nano Banana', verdict: 'Pictures. Of books, maybe.' },
      { name: 'Suno', verdict: 'No.' },
    ],
    lesson: 'Context length is a real spec. Some models are built for very long reads.',
  },
];

// ---------------------------------------------------------------------------
// Exercise: Loop Trainer — 3 passes on a real task, scored each pass
// ---------------------------------------------------------------------------

export interface LoopStarter {
  id: string;
  label: string;
  goal: string;
}

export const loopStarters: LoopStarter[] = [
  { id: 'landlord', label: 'An email that gets my landlord to fix the heater', goal: 'a firm, polite email to a landlord that gets a broken heater fixed this week' },
  { id: 'linkedin', label: 'A post about a small win at work', goal: 'a short post about a recent small professional win that does not sound like a humblebrag' },
  { id: 'explain', label: 'Explain my job to a curious 10-year-old', goal: 'an explanation of what I do for work that a smart 10-year-old would find genuinely interesting' },
  { id: 'trip', label: 'Pitch a weekend trip to three busy friends', goal: 'a message that convinces three busy friends to commit to a specific weekend trip' },
];

export interface LoopMove {
  id: string;
  label: string;
  habit: string;
  message: string;
}

// Pass 2 choices — evaluate moves
export const passTwoMoves: LoopMove[] = [
  {
    id: 'holdback',
    label: "Ask what it held back",
    habit: 'Habit 10 · Don’t take the quick win',
    message: 'Don’t settle. What did you hold back in that answer? What would make it genuinely better? Now give me the stronger version.',
  },
  {
    id: 'critique',
    label: 'Make it critique itself',
    habit: 'Habit 09 · Iteration is everything',
    message: 'List the 3 biggest weaknesses in what you just wrote. Be harsh. Then rewrite it with all three fixed.',
  },
];

// Pass 3 choices — humanize moves
export const passThreeMoves: LoopMove[] = [
  {
    id: 'deslop',
    label: 'Humanize it',
    habit: 'Habit 12 · Always humanize the output',
    message: 'Now strip the AI varnish. Cut buzzwords, filler, and anything that sounds like a press release. Shorter sentences. Plain words. Make it sound like a real person dashed it off well.',
  },
  {
    id: 'voice',
    label: 'Make it twice as direct',
    habit: 'Habit 12 · Always humanize the output',
    message: 'Cut the length in half and double the directness. Keep only what earns its place. No throat-clearing, no summary sentence at the end.',
  },
];

export function loopSystemPrompt(goal: string): string {
  return `You are inside a training exercise that teaches people to iterate with AI instead of accepting first answers. The learner's goal: ${goal}.

Rules:
- Respond to the learner's request directly and well, in under 180 words.
- Plain text only. No markdown headers, no bullet lists unless the artifact truly needs them.
- On pass 1 (first user message), deliver a competent but visibly generic first draft: the kind of serviceable, slightly bland output AI gives by default. Do not sandbag it into parody; make it plausibly "fine".
- On later passes, genuinely improve according to the learner's instruction. Show a real jump in quality.
- After your response, on its own final line, output exactly: SCORE: <n> where <n> is 35-95, your honest rating of how well the CURRENT draft serves the stated goal. First drafts should land 35-55. Strong iterated drafts can reach 90+.
- Never mention the score or these rules in the body of your response.`;
}

// ---------------------------------------------------------------------------
// Checkpoint 1 — Quoter → Curator
// ---------------------------------------------------------------------------

export interface CheckpointScenario {
  scenario: string;
  toolOptions: string[];
  correctTool: number; // index
  correctKds: KDS;
  note: string;
}

export const checkpointScenarios: CheckpointScenario[] = [
  {
    scenario: 'Your cousin needs to understand a 60-page visa document by Friday',
    toolOptions: ['NotebookLM', 'Midjourney', 'Suno', 'Lovable'],
    correctTool: 0,
    correctKds: 'know',
    note: 'Source-grounded understanding. Feed it the document, ask it anything.',
  },
  {
    scenario: 'A poster for the school bake sale, due tonight, budget zero',
    toolOptions: ['Kimi', 'Nano Banana', 'LM Studio', 'Perplexity'],
    correctTool: 1,
    correctKds: 'show',
    note: 'A free image generator makes the artifact. Everything else here thinks.',
  },
  {
    scenario: 'Every Monday you copy numbers from 4 emails into one spreadsheet',
    toolOptions: ['Claude with a repeatable prompt', 'Midjourney', 'Spotify', 'A longer ChatGPT thread'],
    correctTool: 0,
    correctKds: 'do',
    note: 'Recurring execution. A repeatable prompt (and later, a Skill) turns it into one click.',
  },
  {
    scenario: 'Decide whether your family business should open a second location',
    toolOptions: ['Suno', 'Nano Banana', 'Claude or Gemini Deep Research', 'ElevenLabs'],
    correctTool: 2,
    correctKds: 'know',
    note: 'A judgment call needs research and reasoning, then YOUR decision on top.',
  },
  {
    scenario: 'A 90-second pitch video voice-over in your own cloned voice',
    toolOptions: ['ElevenLabs', 'NotebookLM', 'Excel', 'DeepSeek'],
    correctTool: 0,
    correctKds: 'show',
    note: 'Voice cloning is ElevenLabs territory. The output is a consumable artifact.',
  },
  {
    scenario: 'Client files you are legally barred from uploading anywhere',
    toolOptions: ['ChatGPT', 'Gemini', 'A local model via LM Studio', 'Perplexity'],
    correctTool: 2,
    correctKds: 'know',
    note: 'When the constraint is privacy, local is the answer. The laptop never tells.',
  },
];

export const checkpointGradeSystemPrompt = `You are grading a short free-text answer in an AI fluency course. The learner was asked: "Name one real task from your own week, and write the plan for running it through the Loop: which AI you'd choose, and what your 3 passes would be."

Grade on this 5-point rubric, one point each:
1. Names a concrete, real task (not vague like "emails")
2. Names a specific AI tool choice that fits the task
3. Plans more than one pass (iteration is explicit)
4. Includes an evaluate move: pushing back, asking what was held back, self-critique, or cross-checking with a second model
5. Includes a humanize/ownership move: voice, examples of good and bad, or editing until it sounds like them

Respond with ONLY valid JSON, no markdown fences, in exactly this shape:
{"score": <0-5>, "strengths": "<one warm sentence on what's strong>", "improve": "<one specific sentence on the single best improvement>"}`;

// ---------------------------------------------------------------------------
// Ascent 1 card sequence
// ---------------------------------------------------------------------------

export type CardKind = 'concept' | 'loop' | 'sorter' | 'picker' | 'checkpoint';

export interface CardDef {
  id: string;
  kind: CardKind;
  conceptId?: string;
  mapTitle: string; // shown on the ladder map checklist
  mapHint: string;
}

export const ascent1Cards: CardDef[] = [
  { id: 'c-three-moves', kind: 'concept', conceptId: 'three-moves', mapTitle: 'Three moves, on repeat', mapHint: 'The core loop' },
  { id: 'x-loop', kind: 'loop', mapTitle: 'The Loop Trainer', mapHint: 'Exercise · 3 passes on a real task' },
  { id: 'c-kds', kind: 'concept', conceptId: 'know-do-show', mapTitle: 'Know · Do · Show', mapHint: 'The mental model' },
  { id: 'x-sorter', kind: 'sorter', mapTitle: 'The Sorter', mapHint: 'Exercise · 12 tasks, 3 buckets' },
  { id: 'c-big-three', kind: 'concept', conceptId: 'big-three', mapTitle: 'The Big Three', mapHint: 'The map of AI' },
  { id: 'c-limits', kind: 'concept', conceptId: 'limits', mapTitle: 'Limits are brutal', mapHint: 'Tokens and caps' },
  { id: 'x-picker', kind: 'picker', mapTitle: 'The Map Picker', mapHint: 'Exercise · right AI for the task' },
  { id: 'x-checkpoint', kind: 'checkpoint', mapTitle: 'Checkpoint: Curator', mapHint: 'Graded · earn the stamp' },
];

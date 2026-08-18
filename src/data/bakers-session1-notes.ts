// Speaker notes + slide metadata for the Baker's Dozen Basics Session 1 deck.
// Single source of truth consumed by /cultivated-ai/bakers-dozen/session-1
// (broadcast) and its /presenter view (subscribe + render notes).

export interface SlideNote {
  id: string;
  num: number;
  title: string;    // short, for presenter "now / next" panels
  label?: string;   // e.g. "0:25 · Hands-on"
  notes: string;    // plain text; \n for newlines, - for bullets
}

export const slideOrder = [
  'welcome', 'about', 'shape',
  'relax', 'ladder', 'next-word',
  'break-hands', 'experiments',
  'break-land', 'wider-map',
  'hold',
  'p-rate', 'p-comms', 'p-loop', 'p-tool', 'p-frame', 'p-examples',
  'p-questions', 'p-recursive', 'p-iteration', 'p-settle',
  'p-crosscheck', 'p-deslop', 'p-human', 'p-sop', 'p-kds',
  'fifteen',
  'homework', 'closing',
] as const;

export const slideNotes: Record<string, SlideNote> = {
  welcome: {
    id: 'welcome',
    num: 1,
    title: 'Welcome · Cultivated AI',
    label: 'Session 1 of 2',
    notes: `Start on time. Warm open, thank them for making the time.
One-line frame: today is about comfort. By the break, nobody in this room is afraid of the blank chat box.
Two hours, and half of it is hands-on. Laptops out and charged now, not later.
Logins needed today: Google (for Gemini), plus Claude or ChatGPT. The questionnaire flagged who is missing what; help those people during the first discussion.
Transition: "Quick about me first, so you know who is talking."`,
  },
  about: {
    id: 'about',
    num: 2,
    title: 'About · Shalin Shodhan',
    label: 'Keep it under 2 minutes',
    notes: `Fast bio. Do not linger.
- Pixar: 6 films, 3 Academy Awards. Toy Story 3 and Inside Out are the ones people know.
- EA Spore: BAFTA for technical achievement.
- Lumosity: principal game developer, brain training at scale.
- Masala Games: Detective Dotson, Word Mess (#1 in 21 countries).
- CMU Entertainment Technology.
Why it matters here: two years of daily, hands-on AI work across film, games, education and commerce. Everything today comes from practice, not theory.`,
  },
  shape: {
    id: 'shape',
    num: 3,
    title: 'The shape · two sessions',
    label: 'Set expectations',
    notes: `Set the shape in 60 seconds.
Today: how this technology works, why it behaves the way it does, and which tool to reach for. Half hands-on.
Session 2: agents, a browser extension everyone builds themselves, a skill everyone writes, and the start of a 90-day plan.
The promise to land: in Session 2 everyone builds real software, most people for the first time. Today earns that.`,
  },
  relax: {
    id: 'relax',
    num: 4,
    title: 'Relax, it is not here for your job',
    label: '0:00 · 10m · Discuss',
    notes: `Discussion, not lecture. Read the room: who leans in, who crosses their arms.
Key message: AI works best with a person in the loop. Teach it the routine parts of your job, and spend the freed-up time on the parts that need you.
Ask around the room: "What is the most repetitive thing you did last week?"
Collect three or four answers. Park them visibly. They come back in Session 2 as skill material.
Principles 01 and 02.`,
  },
  ladder: {
    id: 'ladder',
    num: 5,
    title: 'The climb · Quoter to Orchestrator',
    label: 'Still inside the opening 10m',
    notes: `The path the whole workshop climbs.
- Quoter: asks AI something, copies what it says.
- Curator: generates options, picks the best one.
- Author: directs the work, shapes it, owns the output.
- Orchestrator: runs several AI workers across a whole process.
Ask people to place themselves silently. Most rooms sit between Quoter and Curator, and that is fine.
The 90-day goal is Author. Nobody needs to be an Orchestrator yet.`,
  },
  'next-word': {
    id: 'next-word',
    num: 6,
    title: 'How it actually works',
    label: '0:10 · 15m · Teach',
    notes: `A language model in plain words: it predicts the next word. Nothing more.
If energy is low, do it live: type "The capital of France is" and stop. The room finishes the sentence. So does the model.
Everything follows from that one fact:
- Why it sounds confident: there is always a next word.
- Why it invents facts: a likely word is not a true word.
- Why your wording matters: different words steer it to a different neighborhood.
No math, no jargon. If someone asks about neural networks, offer to talk at the break.
Principle 03.`,
  },
  'break-hands': {
    id: 'break-hands',
    num: 7,
    title: '· Laptops open ·',
    label: '0:25 · 40m · Hands-on',
    notes: `Switch mode. Four experiments, everyone typing.
Pair confident people with cautious ones. Both sides learn faster.
The widgets are on talkingtomachines.xyz; put the links where everyone can see them.
Timing discipline: roughly ten minutes each. If a block runs long, cut the talk, never the typing.`,
  },
  experiments: {
    id: 'experiments',
    num: 8,
    title: 'The four experiments',
    label: 'Keep this slide up while they work',
    notes: `Run them in order.
1. Prompt builder: build one strong ask, block by block. Role, context, format, examples. Watch the answer improve as blocks land.
2. Context window explorer: watch a long chat lose the plot. The lesson is knowing when to start fresh.
3. Token costs: what a conversation actually costs, and why shorter is often smarter.
4. De-slop prompt: everyone writes a system prompt in their own voice, so output sounds like them and not like AI. This one they keep and use tomorrow.
Principles 05, 06, 09 and 12.`,
  },
  'break-land': {
    id: 'break-land',
    num: 9,
    title: '· The lay of the land ·',
    label: '1:05 · 35m · Teach + live',
    notes: `Back to the screen. Same brief, three machines, live: Claude, ChatGPT, Gemini side by side.
Pick a brief from their world. Example: "Write the launch caption for a new cookie SKU going live on Blinkit."
Let the room judge the three answers out loud. Which is best? Why?
The lesson: the models have flavors. Pick per task, and when in doubt, ask one AI which AI to use.
Principles 04 and 11.`,
  },
  'wider-map': {
    id: 'wider-map',
    num: 10,
    title: 'The wider map',
    label: 'Tour, not a catalog',
    notes: `Quick tour. The point is that these exist and are worth an evening each, not mastery today.
How the prompt changes with the medium:
- Images: describe the frame. Subject, light, style.
- Video: describe the shot. Movement, duration, mood.
- Music: describe genre, tempo and mood, then the lyric idea.
- Deep research: describe the question, and the sources you would trust.
NotebookLM deserves 3 minutes live if time allows: feed it your own documents and it answers from those, not from the open internet.
Deep research: half an hour of reading done for you, with citations you can check.`,
  },
  hold: {
    id: 'hold',
    num: 11,
    title: 'Grow, don\'t chase',
    label: '1:40 · 10m · Discuss',
    notes: `The brand line, earned: tools will keep changing under us, and chasing them is a full-time job nobody here wants.
What holds: the principles, your examples, your saved sessions.
The habit that keeps a team current: one conversation a month, together, about what each person is using and what changed.
If the energy is right, assign an owner for that conversation in the room.
Principles 01 and 13.`,
  },
  'p-rate': {
    id: 'p-rate',
    num: 12,
    title: 'Principle 01 · Rate of improvement',
    label: 'Recap run · 20 to 30s a slide',
    notes: `Start of the principle walk. Keep it brisk; several of these landed hands-on earlier, so name the moment and move.
What is mediocre today is genius in six months. Model quality roughly doubles yearly; the tool list turns over monthly.
So build around approach, not tools. The approach transfers. The wider map we just toured will look different by Session 2, and that is fine.`,
  },
  'p-comms': {
    id: 'p-comms',
    num: 13,
    title: 'Principle 02 · Communication',
    label: 'The big reframe',
    notes: `The most important reframe of the day.
When AI fails you, most of the time the ask was unclear, the context was missing, or nobody showed it what good looks like.
Engineers are not the people best at AI. Clear communicators with strong taste are.
Everyone in this room can become one of those.`,
  },
  'p-loop': {
    id: 'p-loop',
    num: 14,
    title: 'Principle 03 · The core loop',
    label: 'The spine of the fifteen',
    notes: `Every AI interaction is this loop.
Choose the right tool and scope. Communicate frame, context and examples. Evaluate against your own bar. Repeat.
Everything else on the list is a move inside one of these three buckets.`,
  },
  'p-tool': {
    id: 'p-tool',
    num: 15,
    title: 'Principle 04 · Pick the right AI',
    label: 'Choose',
    notes: `They watched this live an hour ago: same brief, three machines, three flavors.
Different tasks want different tools: reasoning, speed, images, research.
The meta move: when in doubt, ask one AI which AI to use. It will answer honestly.`,
  },
  'p-frame': {
    id: 'p-frame',
    num: 16,
    title: 'Principle 05 · Frame the conversation',
    label: 'Communicate',
    notes: `They built this in the prompt builder.
The session is the unit, not the message. Set who the AI is, what you are doing, and what success looks like.
Once the frame is set, one-word follow-ups get great answers.`,
  },
  'p-examples': {
    id: 'p-examples',
    num: 17,
    title: 'Principle 06 · Examples beat instructions',
    label: 'Communicate',
    notes: `Telling AI "make it punchier" is vague. Showing it three punchy examples calibrates it instantly.
Works for writing voice, visuals and decisions. The model moves toward your examples.
Bakery version: paste three past captions you loved before asking for a new one.`,
  },
  'p-questions': {
    id: 'p-questions',
    num: 18,
    title: 'Principle 07 · Ask AI to ask you',
    label: 'Communicate',
    notes: `The single highest-return habit: "Before you start, ask me five questions that would make your answer better."
It surfaces assumptions you did not know you had. You answer, and the output improves dramatically.
Socratic beats one-shot. Every time.`,
  },
  'p-recursive': {
    id: 'p-recursive',
    num: 19,
    title: 'Principle 08 · Recursion',
    label: 'Use AI on AI',
    notes: `Stuck on a prompt? Ask another AI to write a better one.
Output went wrong? Paste it in and ask what went wrong.
AI is trained on how to use AI. Use the machines on each other.`,
  },
  'p-iteration': {
    id: 'p-iteration',
    num: 20,
    title: 'Principle 09 · Iteration',
    label: 'Evaluate',
    notes: `They lived this in the hands-on block; point back at it.
A good result takes three to five passes, not one. Amateurs quit after one try; pros budget for the passes.
Each pass injects your standards. You are the quality filter.`,
  },
  'p-settle': {
    id: 'p-settle',
    num: 21,
    title: 'Principle 10 · Don\'t take the quick win',
    label: 'Evaluate',
    notes: `Models are trained to seem helpful fast, so the first answer is optimized to be acceptable, not excellent.
Push back: ask for three alternatives, ask what it is holding back.
The best material shows up on pass two or three.`,
  },
  'p-crosscheck': {
    id: 'p-crosscheck',
    num: 22,
    title: 'Principle 11 · Never trust one machine',
    label: 'Evaluate',
    notes: `They watched this live in the three-machine comparison.
When stakes are high, run the same task through two or three models.
Where they agree, move with confidence. Where they diverge, real thinking is required.
Five extra minutes against a confidently wrong answer.`,
  },
  'p-deslop': {
    id: 'p-deslop',
    num: 23,
    title: 'Principle 12 · Humanize the output',
    label: 'Evaluate',
    notes: `They wrote their own de-slop prompt an hour ago; connect back to it.
AI has tells: em-dashes, "crucial", "leverage", tidy three-point lists.
The pass: read it aloud, break the rhythm, add one thing only you would know.
Nothing ships raw.`,
  },
  'p-human': {
    id: 'p-human',
    num: 24,
    title: 'Principle 13 · The human edge',
    label: 'Land this one slowly',
    notes: `AI can generate ten options. It cannot tell you which one is right for your brand.
Taste, conviction and judgment come from you, and experience compounds harder than ever.
Twenty years of knowing what good product looks like just became more valuable, not less.`,
  },
  'p-sop': {
    id: 'p-sop',
    num: 25,
    title: 'Principle 14 · Sessions become SOP',
    label: 'The long game',
    notes: `The five-year bet. Your saved conversations become how the AI learns your voice, your standards, your way of working.
That corpus is a moat. Do not treat sessions as throwaway.
This is why "guard your saved sessions" sits inside Grow, don't chase.`,
  },
  'p-kds': {
    id: 'p-kds',
    num: 26,
    title: 'Principle 15 · Know / Do / Show',
    label: 'Close the run here',
    notes: `Every AI task fits one bucket.
Know: research, reasoning, understanding. Do: agents and software, which is what Session 2 builds. Show: decks, images, video, artifacts.
Picking the bucket first tells you which tool to reach for and what "good" means.`,
  },
  fifteen: {
    id: 'fifteen',
    num: 27,
    title: 'The fifteen, one page',
    label: 'Leave it up during discussion',
    notes: `The walk you just did, on one page. Do not read the list out again. Leave it on screen while the staying-current discussion runs.
Tell them the printed version comes with the leave-behind, so nobody needs to photograph the screen.
Any one of these can eat ten minutes of debate. Allow at most one debate, then move.`,
  },
  homework: {
    id: 'homework',
    num: 28,
    title: 'Homework · before Session 2',
    label: '1:50 · 10m',
    notes: `Three asks, kept small on purpose:
1. Try the tools we compared today. Find the ones that fit your work.
2. Talk as a team: which AI do we standardise on? Revisit that choice monthly; it will change, and that is fine.
3. Bring your pick to Session 2.
The extension ideas and skill ideas sheets go out with the follow-up email, one idea per job function. Point at them, do not walk through them.
Principles 04 and 11.`,
  },
  closing: {
    id: 'closing',
    num: 29,
    title: 'Closing · Session 2 preview',
    label: 'End on time',
    notes: `Sell Session 2 in one line: next time, everyone in this room builds real software, most of you for the first time.
What happens: a Chrome extension you describe into existence, a skill written from your own week, and the start of your 90-day plan.
Ask them to bring: laptop, Google login, and the team's AI pick.
Thank the room. End on time; it buys trust for Session 2.`,
  },
};

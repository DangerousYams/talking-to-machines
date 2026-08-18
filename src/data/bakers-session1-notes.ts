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
  'hold', 'fifteen',
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
  fifteen: {
    id: 'fifteen',
    num: 12,
    title: 'The fifteen, one page',
    label: 'Leave it up during discussion',
    notes: `Do not read the list out. Leave it on screen while the staying-current discussion runs.
Tell them the printed version comes with the leave-behind, so nobody needs to photograph the screen.
Any one of these can eat ten minutes of debate. Allow at most one debate, then move.`,
  },
  homework: {
    id: 'homework',
    num: 13,
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
    num: 14,
    title: 'Closing · Session 2 preview',
    label: 'End on time',
    notes: `Sell Session 2 in one line: next time, everyone in this room builds real software, most of you for the first time.
What happens: a Chrome extension you describe into existence, a skill written from your own week, and the start of your 90-day plan.
Ask them to bring: laptop, Google login, and the team's AI pick.
Thank the room. End on time; it buys trust for Session 2.`,
  },
};

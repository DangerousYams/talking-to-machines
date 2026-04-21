// Speaker notes + slide metadata for the Day 1 workshop deck.
// Single source of truth consumed by /workshop-day1 (broadcast) and
// /workshop-day1/presenter (subscribe + render notes).

export interface SlideNote {
  id: string;
  num: number;
  title: string;    // short, for presenter "now / next" panels
  label?: string;   // e.g. "Principle 09 · Evaluate"
  notes: string;    // markdown-lite; \n for newlines, - for bullets
}

export const slideOrder = [
  'welcome', 'about', 'arc', 'day1', 'day2', 'day3', 'ttm',
  'break-land',
  'break-approach',
  'p-rate', 'p-comms', 'p-loop', 'p-tool', 'p-frame', 'p-examples',
  'p-questions', 'p-recursive', 'p-iteration', 'p-settle',
  'p-crosscheck', 'p-deslop',
  'p-human', 'p-sop', 'p-kds', 'p-cheatsheet',
  'break-research', 'closing',
] as const;

export const slideNotes: Record<string, SlideNote> = {
  welcome: {
    id: 'welcome',
    num: 1,
    title: 'Welcome · Talking to Machines',
    notes: `Open warm. Thank them for showing up.
Core frame for today: this is about APPROACH, not tools.
Tools change every month. Approach compounds for years.
Three days. Today you'll leave with a mental model, not a toolkit.
— Transition: "Before we get into it, quick about me, because I know not everyone here knows me."`,
  },
  about: {
    id: 'about',
    num: 2,
    title: 'About — Shalin Shodhan',
    notes: `Fast bio. Don't linger.
- Pixar, 6 films, 3 Oscars (Toy Story 3, Brave, Inside Out most known)
- EA Spore — BAFTA
- Lumosity — brain-training, tens of millions of users
- Now: Masala Games. Detective Dotson shipped 2024. Word Mess #1 in 21 countries.
- CMU MET background — entertainment tech crossover
Relevance: I've used AI across films, games, education, commerce. I'm speaking from 2 years of daily hands-on, not theory.`,
  },
  arc: {
    id: 'arc',
    num: 3,
    title: 'The arc — 3 days',
    notes: `Set expectations for the week.
Day 1 (today) — approach + lay of the land. Demos.
Day 2 — build something together with agentic coding.
Day 3 — 90-day plan for YOUR business. Prototype the pieces.
The real takeaway is Day 3. Today and tomorrow earn your way there.`,
  },
  day1: {
    id: 'day1',
    num: 4,
    title: 'Day 1 — The Approach',
    notes: `Today specifically:
- I'll show you real projects I've built with AI (Decade, Splorbit, Creative Coding, Posit)
- Some tool demos (NotebookLM, Deep Research)
- Then ~14 principles — the actual mental models
- One more demo at the end: Deep Research on Indian mutual funds, live.
Heads up: it's fast. Stop me any time.`,
  },
  day2: {
    id: 'day2',
    num: 5,
    title: 'Day 2 — Build something',
    notes: `Preview tomorrow: on-demand software.
Key idea: you don't need an engineer. Agentic coding lets anyone describe software and get it.
We'll build a real tool together. Pick something useful for your business.
You'll leave with code running, not a PowerPoint.`,
  },
  day3: {
    id: 'day3',
    num: 6,
    title: 'Day 3 — 90-day plan',
    notes: `Day 3 is the payoff.
Everyone walks out with:
- A concrete 90-day roadmap for AI in their business
- Prototyped versions of the 2-3 highest-leverage pieces
- Enough conviction to start Monday
This is what you're really here for.`,
  },
  ttm: {
    id: 'ttm',
    num: 7,
    title: 'TTM supplement — free keys',
    notes: `Tell them about the site: talking-to-machines.com
- 11 chapters, interactive widgets, live AI demos
- It's what I've been building — the curriculum itself
- Everyone here gets a FREE full-access key (check email)
- Use it between sessions. Optional but recommended.
Transition: "OK, enough slides. Let me show you what's actually possible right now."`,
  },
  'break-land': {
    id: 'break-land',
    num: 8,
    title: '— Lay of the land —',
    notes: `Transition slide. Switch to demo mode.
Open browser windows ahead of time:
  1. Decade (shopify + AI pipeline)
  2. Splorbit (synth editor + asset editor)
  3. Creative Coding Studio
  4. Posit (mobile — show on phone or mirror)
  5. NotebookLM (doc + podcast demo ready)
  6. Google Deep Research (save for the finale)
Pace: 5-7 min per demo. ~40 min total for this section.`,
  },
  'break-approach': {
    id: 'break-approach',
    num: 9,
    title: '— The approach —',
    notes: `Transition back to slides.
You've seen the "what." Now the "how."
The rest of this session is the mental models that hold up across every tool we just saw — and every tool coming next.
14 principles. Fast-paced. Stop me on any one you want to debate.`,
  },
  'p-rate': {
    id: 'p-rate',
    num: 10,
    label: 'Principle 01 · Rate of improvement',
    title: 'What\'s mediocre today is genius in six months.',
    notes: `The compounding is brutal:
- Model quality doubling roughly yearly
- Tool ecosystem 10× in 18 months
- Agent capability barely existed 2 years ago
If you build your mental model around a specific tool, you're out of date next quarter.
Build around APPROACH — that transfers. That's the whole thesis of today.`,
  },
  'p-comms': {
    id: 'p-comms',
    num: 11,
    label: 'Principle 02 · The real problem',
    title: 'Not a technical problem. A communication problem.',
    notes: `This is the single most important reframe.
When AI fails you, 90% of the time it's because:
- You weren't clear about what you wanted
- You didn't give enough context
- You didn't show examples of "good"
Engineers are NOT the people best at AI. The people best at AI are clear communicators with strong taste.
Good news: you can become one of those.`,
  },
  'p-loop': {
    id: 'p-loop',
    num: 12,
    label: 'Principle 03 · The core loop',
    title: 'Choose → Communicate → Evaluate',
    notes: `Every AI interaction is a version of this loop:
1. CHOOSE — the right model, the right tool, the right scope
2. COMMUNICATE — frame, context, examples, expected format
3. EVALUATE — did it actually meet the bar? What's missing?
Rinse, repeat.
The upcoming principles each land in one of these three buckets.`,
  },
  'p-tool': {
    id: 'p-tool',
    num: 13,
    label: 'Choose · Principle 04',
    title: 'Pick the right AI for the task.',
    notes: `Some tasks need reasoning → Claude, GPT-5, Gemini Thinking
Some need speed + cost → Haiku, Flash, 4o-mini
Some need image → Nano Banana, Midjourney, Flux
Some need research → Perplexity, Deep Research
Some need voice → ElevenLabs
Can't keep up? Ask an AI which AI to use. Seriously — Claude will tell you "use Suno for that." This is the meta move.`,
  },
  'p-frame': {
    id: 'p-frame',
    num: 14,
    label: 'Communicate · Principle 05',
    title: 'Frame the conversation, not the prompt.',
    notes: `Forget "perfect prompt engineering."
The unit is the SESSION, not the message.
A great frame:
- Who is the AI? (role)
- What are we doing? (goal)
- What does success look like? (criteria)
- What have we tried / what do we know? (context)
Once the frame is set, you can type one-word follow-ups and get great answers.
Demo-able: open a Claude session, show a good first-message frame.`,
  },
  'p-examples': {
    id: 'p-examples',
    num: 15,
    label: 'Communicate · Principle 06',
    title: 'Great examples beat great instructions.',
    notes: `Telling AI "make it punchier" → vague.
Showing AI 3 punchy examples and 1 not-punchy → instant calibration.
Works for:
- Writing voice ("here are 3 emails I love")
- Code style ("here's our existing patterns")
- Visuals ("these 5 moodboard images")
- Decisions ("here are 4 past calls and why")
AI literally moves toward your examples. Use it.`,
  },
  'p-questions': {
    id: 'p-questions',
    num: 16,
    label: 'Communicate · Principle 07',
    title: 'Ask AI to ask YOU questions.',
    notes: `Before ANY non-trivial task, say:
"Before you start, ask me 5 questions that would make your answer dramatically better."
What happens:
- It surfaces assumptions you didn't know you had
- You answer → now it has real context
- Output is 3× better than one-shot
I use this for: planning, writing, design decisions, negotiations.
Counter-intuitive move, massive ROI. Demo-able live.`,
  },
  'p-recursive': {
    id: 'p-recursive',
    num: 17,
    label: 'Principle 08 · Recursion',
    title: 'Ask AI for help with AI.',
    notes: `The most underused move.
- Stuck on a prompt? Tell another AI "help me write a better prompt for X"
- Agent misbehaving? Paste the logs into Claude, ask what went wrong
- Can't pick a model? Ask an AI to compare them
AI is trained on how to use AI. Use that.
Self-reference isn't cheating — it's the shape of the work now.`,
  },
  'p-iteration': {
    id: 'p-iteration',
    num: 18,
    label: 'Evaluate · Principle 09',
    title: 'Iteration is everything.',
    notes: `The average good AI result is 3-5 iterations. Not 1.
Amateurs: "the AI can't do it" after 1 try.
Pros: expect to iterate. Budget for it. Enjoy it.
Each pass is an injection of YOUR excellence. You're the quality filter.
Mental shift: don't think "prompt → answer." Think "conversation → outcome."
Story idea: that Splorbit feature I iterated on 11 times with Claude before it was right.`,
  },
  'p-settle': {
    id: 'p-settle',
    num: 19,
    label: 'Evaluate · Principle 10',
    title: 'AI wants to give you a quick win. Don\'t take it.',
    notes: `Models are RLHF-trained to seem helpful fast.
That means the first answer is optimized for ACCEPTABILITY, not excellence.
Push back:
- "Give me 3 alternatives, each with a different angle"
- "What would you do if we had no constraints?"
- "What are you holding back because you think I want an easy answer?"
The best stuff comes on pass 2-3 when you refuse the quick win.`,
  },
  'p-crosscheck': {
    id: 'p-crosscheck',
    num: 20,
    label: 'Evaluate · Principle 11',
    title: 'Never trust one machine.',
    notes: `When stakes are high: run the same task through 2-3 models.
Claude + GPT-5 + Gemini → same question, three answers.
- Where they AGREE → high confidence, move on
- Where they DIVERGE → real thinking required
Especially for: research claims, strategy calls, code architecture, factual content
Takes 5 extra minutes. Saves you from confidently wrong outputs.`,
  },
  'p-deslop': {
    id: 'p-deslop',
    num: 21,
    label: 'Evaluate · Principle 12',
    title: 'Always humanize the output (deslop).',
    notes: `AI has tells. Don't ship them raw.
Common slop markers:
- Em-dashes everywhere
- "Crucial," "robust," "leverage," "delve into"
- Tidy three-point lists with parallel structure
- Hedged transitions ("Moreover," "Furthermore")
- Perfect but bloodless prose
The deslop pass:
- Read it aloud. Does it sound like YOU?
- Break the rhythm. Short sentence. Weird word.
- Add one specific thing only YOU would know
Ship nothing unfiltered.`,
  },
  'p-human': {
    id: 'p-human',
    num: 22,
    label: 'Principle 13 · The human edge',
    title: 'Conviction. Art. Sense. Judgment.',
    notes: `These come from you. Full stop.
AI can GENERATE 10 logo options.
AI cannot TELL YOU which one is right for your brand.
The people who win with AI are the ones with:
- Strong point of view
- Clear taste (seeing 1000 good examples sharpens this)
- Conviction to kill bad options
Experience compounds harder than ever. If you've spent 20 years getting good at something, this is your moment.`,
  },
  'p-sop': {
    id: 'p-sop',
    num: 23,
    label: 'Principle 14 · The long game',
    title: 'Your sessions become your SOP.',
    notes: `This is the 5-year bet.
Today: each AI conversation starts from zero.
Soon (already happening): AI references your past sessions, learns your voice, your standards, your proprietary way of working.
That corpus IS your moat. The team that invests in high-quality AI conversations today has a compounding advantage.
Takeaway: don't treat AI sessions as throwaway. They're training data for your future self.`,
  },
  'p-kds': {
    id: 'p-kds',
    num: 24,
    label: 'Principle 15 · A mental model',
    title: 'Know / Do / Show',
    notes: `Every AI task fits in one bucket:
KNOW — information layer. Research, reasoning, brainstorming. Input + output are understanding.
DO — action in the world. Agents, automations, on-demand software. Input = intent. Output = thing happening.
SHOW — artifact for audience. Decks, sites, apps, videos. Input = message. Output = consumable.
Why it matters:
- Picking the bucket first clarifies what you need
- Different buckets → different tools, different criteria for "good"
On Day 3, we'll map YOUR business into these three buckets.`,
  },
  'p-cheatsheet': {
    id: 'p-cheatsheet',
    num: 25,
    title: 'The cheat sheet — all 15 in one page',
    notes: `Land the section. This is the whole framework on one page.
Pause. Let them read. Don't rush.
Tell them:
- Take a photo. Bookmark the TTM site — this is in chapter summaries too.
- These 15 are the portable part. They work for any model, any tool, any year.
- The LOOP (03) is the spine. CHOOSE / COMMUNICATE / EVALUATE.
- Everything else is either a move inside the loop or a mindset around it.
If time: ask the room — "Which one do you think YOU'll break first?"
Transition: "One last demo — I want to show you Deep Research, because it pulls half these principles together."`,
  },
  'break-research': {
    id: 'break-research',
    num: 26,
    title: '— Deep research demo —',
    notes: `Final demo. Live.
Task: "Give me a rigorous comparison of the best mutual funds in India for a 10-year horizon."
Run it in Google Deep Research. Show the planning step. Show it ingesting sources. Show the report.
While it runs (takes 5-10 min): open Claude side-by-side with the same prompt. Compare.
Frame: this is what "Know" looks like at industrial strength.`,
  },
  closing: {
    id: 'closing',
    num: 27,
    title: 'Closing — Age of personal software',
    notes: `Bring it home.
Key idea: we're entering the age of personal software.
- Every business builds its own tools
- Every team has its own AI workflows
- Every person can describe software into existence
That's Day 2's whole point. See you tomorrow.
Q&A if time. Thank them. Remind about TTM key.`,
  },
};

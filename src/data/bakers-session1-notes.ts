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
  'relax', 'p-human', 'p-kds', 'ladder',
  'brain', 'weights', 'next-word', 'follows',
  'exp-context', 'data',
  'break-land', 'wider-map', 'open-weights',
  'hold',
  'p-rate', 'p-comms', 'p-loop', 'p-tool',
  'p-frame', 'p-examples', 'p-questions', 'p-settle',
  'exp-prompt', 'hw-backoffice',
  'p-recursive', 'hw-prompts',
  'p-iteration', 'hw-images',
  'p-crosscheck', 'hw-crosscheck',
  'p-deslop', 'exp-deslop',
  'p-sop',
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
One-line frame: today is about comfort. By the first hands-on, nobody in this room is afraid of the blank chat box.
Two hours, hands-on woven all the way through. Laptops out and charged now, not later.
Logins needed today: Google (for Gemini), plus Claude or ChatGPT.
Login gaps from the questionnaire, six people to sort during the first discussion: Maulik (unsure what is on the laptop), Shital (nothing set up), Shailesh (browser only), Snehalkumar (Chrome only), Hitesh (Google only), Vishal (browser only).
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
    title: 'Two sessions, two hours each',
    label: 'Set expectations',
    notes: `Set expectations in 60 seconds.
Today: how this technology works, why it behaves the way it does, and which tool to reach for. Hands-on moments and homework land right where the ideas do.
Session 2: agents, a browser extension everyone builds themselves, a skill everyone writes, and the start of a 90-day plan.
The promise to land: in Session 2 everyone builds real software, most people for the first time. Today earns that.`,
  },
  relax: {
    id: 'relax',
    num: 4,
    title: 'Relax, it is not here for your job',
    label: '0:05 · 12m · Discuss',
    notes: `Discussion, not lecture. Read the room: who leans in, who crosses their arms.
Key message: AI works best with a person in the loop. Teach it the routine parts of your job, and spend the freed-up time on the parts that need you.
The table on the slide is their own questionnaire tally: the chores they said they would hand over first (spreadsheets 18, meeting notes 14, invoices 12, competitor prices 9, weekly report 9). Point at it: "You already told us what the routine parts are."
Then ask around the room: "What is the most repetitive thing you did last week?"
Collect three or four answers. Park them visibly. They come back in Session 2 as skill material.
Worries from the questionnaire (30 answers): privacy 9, sounds-like-AI 4, makes-things-up 4, job worries 4, feels-like-cheating 3. 21 also ticked excited.
Name privacy out loud; it is the biggest one. Promise the answer: a dedicated slide right after the first hands-on.
The job worry is small but real (4 people). The next two slides answer it head-on.`,
  },
  'p-human': {
    id: 'p-human',
    num: 5,
    title: 'Principle 13 · The human edge',
    label: 'Pulled forward · land it slowly',
    notes: `Pulled forward from the principle run (it is number 13 on the cheat sheet) because it belongs right after Relax.
AI can generate ten options. It cannot tell you which one is right for your brand.
Taste, conviction and judgment come from you, and experience compounds harder than ever.
Twenty years of knowing what good product looks like just became more valuable, not less.`,
  },
  'p-kds': {
    id: 'p-kds',
    num: 6,
    title: 'Principle 15 · Know / Do / Show',
    label: 'Second early principle',
    notes: `Also pulled forward; it is number 15 on the cheat sheet. Plant it early: the whole day sorts into these buckets.
Know: research, reasoning, understanding. Claude and Deep Research live here.
Do: transactions. Send an email, make a purchase, book, pay, post. Land the warning slowly: a bad draft can be fixed; a bad transaction already happened. Unsupervised agents are how it goes wrong (OpenClaw is the cautionary tale). House rule: nothing in Do runs without a human confirm.
Show: artifacts. Decks, sites, videos, and software. Software sits here, not in Do: the output is a thing you look at and ship, and Session 2 builds one.
Picking the bucket first tells you which tool to reach for, what "good" means, and how much supervision it needs.
The homework tonight covers the buckets; say that now, deliver as the slides come.`,
  },
  ladder: {
    id: 'ladder',
    num: 7,
    title: 'The climb · Quoter to Orchestrator',
    label: 'Close the opening beat',
    notes: `The path the whole workshop climbs.
- Quoter: asks AI something, copies what it says.
- Curator: generates options, picks the best one.
- Author: directs the work, shapes it, owns the output.
- Orchestrator: runs several AI workers across a whole process.
The counts on the slide come from the questionnaire's how-often question: 16 daily users mapped to Curator, 14 occasional users (9 weekly, 5 barely or never) mapped to Quoter. Say that mapping out loud; it is a proxy, not a verdict.
Still ask people to place themselves silently; self-placement beats my mapping.
The 90-day goal is Author. Nobody needs to be an Orchestrator yet.`,
  },
  brain: {
    id: 'brain',
    num: 8,
    title: 'It began as a sketch of the brain',
    label: '0:20 · 12m · Teach',
    notes: `Start the teach beat somewhere familiar: the brain. The figure carries this slide; walk it top to bottom.
Panel 1, a single neuron: it listens through the dendrites, weighs each signal (some voices count more), and fires down the axon or stays quiet. That is all one neuron does.
Panel 2, connected neurons: stack 86 billion and you get pattern recognition, memory, language, taste.
Right side, the artificial copy: inputs, weights on the arrows, a sum, a decision. Point at the w's; that word comes back on the next slide.
Panel 3, the multi-layer network: the same little sum, tiled into layers.
No biology exam. The one word to keep from this slide: weighs.`,
  },
  weights: {
    id: 'weights',
    num: 9,
    title: 'The learning lives in the weights',
    label: 'Weights, lightly',
    notes: `The artificial version is embarrassingly simple: a neuron is a little sum. Each input gets multiplied by a number. That number is a weight.
Learning is nothing mystical: nudge the weights, check if the guess improved, repeat.
Training a language model: show it the internet one chunk at a time, ask it to guess the next word, nudge trillions of weights when it is wrong. For months. That is why training costs billions and using it costs paise.
The finished model IS the weights: one huge file of numbers. Hold that thought; it comes back in the lay of the land as "open weights".`,
  },
  'next-word': {
    id: 'next-word',
    num: 10,
    title: 'How it actually works',
    label: 'The punchline',
    notes: `A language model in plain words: it predicts the next word. Nothing more.
Do it live: type "The capital of France is" and stop. The room finishes the sentence. So does the model.
Land it, pause. The next slide picks up the consequences.
No math, no jargon. If someone wants to go deeper on neural networks, point two slides back and offer the break.
Principle 03.`,
  },
  follows: {
    id: 'follows',
    num: 11,
    title: 'One fact, three consequences',
    label: 'Tokens · context · made-up facts',
    notes: `Three consequences, and the very next slide makes all three physical, live on their laptops.
- Tokens: it reads and writes in chunks, roughly three-quarters of a word each. Cost and speed are counted in chunks.
- Context: the model sees one window of recent conversation, nothing else. When the window fills, the oldest lines fall out. That is why long chats drift.
- Made-up facts: it always has a next word, even where it knows nothing. A likely word is not a true word. It is not a database; it is a very well-read improviser.
Do not solve these here. The fixes come as principles 09 to 12 later.`,
  },
  'exp-context': {
    id: 'exp-context',
    num: 12,
    title: 'Lab 01 · The Context Explorer',
    label: '0:32 · 12m · Hands-on',
    notes: `First hands-on moment of the day. Pair the five beginners (Maulik, Hitesh, Jaimin, Shailesh, Shital) with daily users; Keyur, Harshil and Krutagna are strong anchors.
The link is on the slide: talkingtomachines.xyz/tools/context. No login.
Projector script: press Demo and let the bakery chat run. Old messages gray out above the red line; at the end the assistant is asked what price was decided, and it forgets. Then press With compaction: same chat, but a summary folds in mid-way, carries the price, and the ending changes to REMEMBERED.
Point at the bill panel on the right: same chat, five models, five prices. The chat is simulated, the token and money math is real.
This cashes in all three consequences from the previous slide.
Timing discipline: if it runs long, cut the talk, never the typing.`,
  },
  data: {
    id: 'data',
    num: 13,
    title: 'Where does my data go?',
    label: '0:44 · Nine of you asked',
    notes: `Nine of the thirty questionnaires raised privacy. Answer it straight, then move.
Where a chat goes: to the model maker's servers, encrypted on the way. Not to the public internet, not to competitors.
The real question is training: does your chat teach the next model? Free consumer plans often can. Business and API plans contractually do not. Every tool has a toggle.
Check the current defaults the night before the session; they move every few months. Show one toggle live if time allows.
House rule until the team standardises: nothing in a chat you would not email an outside vendor. Customer lists, unreleased numbers, contracts: business plan or keep them out.
Bridge to plant: there is one option where data never leaves at all. It is on the map in a few minutes: open weights.`,
  },
  'break-land': {
    id: 'break-land',
    num: 14,
    title: '· The lay of the land ·',
    label: '0:48 · 25m · Teach + live',
    notes: `Back to the screen. Same brief, three machines, live: Claude, ChatGPT, Gemini side by side.
Pick a brief from their world. Example: "Write the launch caption for a new cookie SKU going live on Blinkit."
Second brief if time, straight from Shivani's questionnaire answer: a firm but warm note to a difficult category manager. Half the room lives that.
Let the room judge the three answers out loud. Which is best? Why?
The lesson: the models have flavors. Pick per task, and when in doubt, ask one AI which AI to use.
Principles 04 and 11.`,
  },
  'wider-map': {
    id: 'wider-map',
    num: 15,
    title: 'The wider map',
    label: 'Tour, not a catalog',
    notes: `Quick tour. The point is that these exist and are worth an evening each, not mastery today.
The LLM row carries the China names on purpose: DeepSeek, Qwen, Kimi. One line on them: open weights, very cheap, surprisingly good. The next slide explains what open weights means.
How the prompt changes with the medium:
- Images: describe the frame. Subject, light, style. Nano Banana or ChatGPT Image.
- Video: describe the shot. Movement, duration, mood. Seedance 2.5 and Kling 3 are the current picks.
- Music and audio: genre, tempo, mood for Suno; ElevenLabs is voices, dubbing and narration.
Product photography and branding is this room's category: Photoroom for pack shots and clean backgrounds, Pomelli (Google) for a brand kit built from your own website. Demo one if time allows.
Research: Gemini Notebook (the tool formerly introduced as NotebookLM) answers from YOUR documents, not the open internet. Keyur already uses it; let him vouch. Perplexity searches the web with citations you can check. Deep research in Claude or Gemini: half an hour of reading done for you.
Software agents: Claude Code and Codex build real software from a description. Do not demo; point at it and say Session 2 lives here.
At the Video card, name-check Anshika and Yukti (design): both asked for 30-second-plus video with dialogue. Answer: that is the Generative Media Bootcamp; today is the map, not the deep dive. The image homework tonight is the taster; long video with dialogue is bootcamp material.`,
  },
  'open-weights': {
    id: 'open-weights',
    num: 16,
    title: 'Open weights · models you can own',
    label: 'Callback to the weights slide',
    notes: `Callback: the model is one huge file of numbers, the weights. Some labs publish that file.
Who: Meta (Llama), DeepSeek, Alibaba (Qwen), Google (Gemma), Mistral. Anyone can download and run them.
Why this room should care: it is the full answer to the privacy worry (nothing leaves your machine), the per-use cost is zero, and open competition keeps every price honest.
Honest caveats: the best closed models are still ahead for hard work, and the big open ones need serious hardware. A good laptop runs the small ones today.
Try-at-home pointer: Ollama or LM Studio, one evening, no account needed.
Session 2 carries a bonus beat on this: AI on your own computer. Park deep questions there.`,
  },
  hold: {
    id: 'hold',
    num: 17,
    title: 'Grow, don\'t chase',
    label: '1:15 · 5m · Discuss',
    notes: `The brand line, earned: tools will keep changing under us, and chasing them is a full-time job nobody here wants.
What holds: the principles, your examples, your saved sessions.
The habit that keeps a team current: one conversation a month, together, about what each person is using and what changed.
If the energy is right, assign an owner for that conversation in the room.
Principle 01 lands next; principle 13 already landed at the top of the deck.`,
  },
  'p-rate': {
    id: 'p-rate',
    num: 18,
    title: 'Principle 01 · Rate of improvement',
    label: '1:20 · Principle walk · 20-30s a slide',
    notes: `Start of the principle walk. Keep it brisk; hands-on and homework beats are woven in, so the rhythm is: principle, principle, do something.
What is mediocre today is genius in six months. Model quality roughly doubles yearly; the tool list turns over monthly.
So build around approach, not tools. The approach transfers. The wider map we just toured will look different by Session 2, and that is fine.`,
  },
  'p-comms': {
    id: 'p-comms',
    num: 19,
    title: 'Principle 02 · Communication',
    label: 'The big reframe',
    notes: `The most important reframe of the day.
When AI fails you, most of the time the ask was unclear, the context was missing, or nobody showed it what good looks like.
Engineers are not the people best at AI. Clear communicators with strong taste are.
Everyone in this room can become one of those.`,
  },
  'p-loop': {
    id: 'p-loop',
    num: 20,
    title: 'Principle 03 · The core loop',
    label: 'The spine of the fifteen',
    notes: `Every AI interaction is this loop.
Choose the right tool and scope. Communicate frame, context and examples. Evaluate against your own bar. Repeat.
Everything else on the list is a move inside one of these three buckets.`,
  },
  'p-tool': {
    id: 'p-tool',
    num: 21,
    title: 'Principle 04 · Pick the right AI',
    label: 'Choose',
    notes: `They watched this live minutes ago: same brief, three machines, three flavors.
Different tasks want different tools: reasoning, speed, images, research.
The meta move: when in doubt, ask one AI which AI to use. It will answer honestly.`,
  },
  'p-frame': {
    id: 'p-frame',
    num: 22,
    title: 'Principle 05 · Frame the conversation',
    label: 'Communicate',
    notes: `They build this in the prompt builder in a few minutes.
The session is the unit, not the message. Set who the AI is, what you are doing, and what success looks like.
Once the frame is set, one-word follow-ups get great answers.`,
  },
  'p-examples': {
    id: 'p-examples',
    num: 23,
    title: 'Principle 06 · Examples beat instructions',
    label: 'Communicate',
    notes: `Telling AI "make it punchier" is vague. Showing it three punchy examples calibrates it instantly.
Works for writing voice, visuals and decisions. The model moves toward your examples.
Bakery version: paste three past captions you loved before asking for a new one.`,
  },
  'p-questions': {
    id: 'p-questions',
    num: 24,
    title: 'Principle 07 · Ask AI to ask you',
    label: 'Communicate',
    notes: `The single highest-return habit: "Before you start, ask me five questions that would make your answer better."
It surfaces assumptions you did not know you had. You answer, and the output improves dramatically.
Socratic beats one-shot. Every time.
One more principle, then laptops open.`,
  },
  'p-settle': {
    id: 'p-settle',
    num: 25,
    title: 'Principle 10 · Don\'t take the quick win',
    label: 'Pulled forward · sets up the lab',
    notes: `Pulled forward on purpose (it is number 10 on the cheat sheet): it lands right before the prompt builder, where the second pass is the whole point.
Models are trained to seem helpful fast, so the first answer is optimized to be acceptable, not excellent.
Push back: ask for three alternatives, ask what it is holding back.
The best material shows up on pass two or three. Transition: "Laptops open. Do not accept the builder's first rewrite either."`,
  },
  'exp-prompt': {
    id: 'exp-prompt',
    num: 26,
    title: 'Lab 02 · Prompt Builder',
    label: '1:30 · 12m · Hands-on',
    notes: `They just heard frame, examples, ask-me-questions, and don't-settle. Now they use all four.
The link is on the slide: talkingtomachines.xyz/tools/prompt-builder. No login. Pick a starter (there are starters for minutes and invoice chasing, straight from their questionnaire: spreadsheets 18 people, minutes 14, invoices 12), fill the blanks, then stack moves. The moves are tagged with the principles.
Each device gets 40 AI rewrites a day, plenty for the session.
Have them SAVE one prompt; it seeds principle 14, sessions become your SOP, and the homework on the next slide.`,
  },
  'hw-backoffice': {
    id: 'hw-backoffice',
    num: 27,
    title: 'Homework 1 · Back-office prompts',
    label: 'Homework beat · 30s',
    notes: `First homework, straight out of the tool they are still holding.
Two chores from their own questionnaire list, one reusable prompt each, saved.
Say it plainly: these two prompts come back in Session 2 as raw material for their first skill.`,
  },
  'p-recursive': {
    id: 'p-recursive',
    num: 28,
    title: 'Principle 08 · Recursion',
    label: 'Use AI on AI',
    notes: `Stuck on a prompt? Ask another AI to write a better one.
Output went wrong? Paste it in and ask what went wrong.
AI is trained on how to use AI. Use the machines on each other.`,
  },
  'hw-prompts': {
    id: 'hw-prompts',
    num: 29,
    title: 'Homework 2 · Prompts by AI',
    label: 'Homework beat · 30s',
    notes: `The recursive move as homework: learn how different media need different prompts, and ask AI itself to help.
The media on the slide: an image, an Instagram post, a song, a research question, a slide show. They ask their AI to write the prompt for each; the lesson arrives by itself.
The little link on the slide is the cheat sheet: talkingtomachines.xyz/field-guide. Open it for ten seconds, no more; it is homework reading.`,
  },
  'p-iteration': {
    id: 'p-iteration',
    num: 30,
    title: 'Principle 09 · Iteration',
    label: 'Evaluate',
    notes: `They lived this in the prompt builder minutes ago; point back at it.
A good result takes three to five passes, not one. Amateurs quit after one try; pros budget for the passes.
Each pass injects your standards. You are the quality filter.`,
  },
  'hw-images': {
    id: 'hw-images',
    num: 31,
    title: 'Homework 3 · One image, five versions',
    label: 'Homework beat · 30s',
    notes: `Iteration made physical. One product shot, then four regenerations, changing one thing in the prompt each pass.
Tools: Nano Banana (inside Gemini, on the Google login they already have) or ChatGPT Image.
The deliverable is the pair: best version plus the note on what changed to get there.`,
  },
  'p-crosscheck': {
    id: 'p-crosscheck',
    num: 32,
    title: 'Principle 11 · Never trust one machine',
    label: 'Evaluate',
    notes: `They watched this live in the three-machine comparison.
When stakes are high, run the same task through two or three models.
Where they agree, move with confidence. Where they diverge, real thinking is required.
Five extra minutes against a confidently wrong answer.`,
  },
  'hw-crosscheck': {
    id: 'hw-crosscheck',
    num: 33,
    title: 'Homework 4 · One cross-check',
    label: 'Homework beat · 30s',
    notes: `Never trust one machine, as homework. Same task, three machines, compare.
The twist that makes it stick: let a colleague judge the winner blind.
Where the models agree, move with confidence. Where they diverge, that is where their judgment earns its keep.`,
  },
  'p-deslop': {
    id: 'p-deslop',
    num: 34,
    title: 'Principle 12 · Humanize the output',
    label: 'Evaluate',
    notes: `AI has tells: em-dashes, "crucial", "leverage", tidy three-point lists.
The pass: read it aloud, break the rhythm, add one thing only you would know.
Nothing ships raw.
They write their own de-slop prompt on the next slide; this sets it up.`,
  },
  'exp-deslop': {
    id: 'exp-deslop',
    num: 35,
    title: 'Lab 03 · De-slop Lab',
    label: '1:48 · 8m · Hands-on',
    notes: `Last hands-on of the day: talkingtomachines.xyz/tools/deslop. No login. Three beats inside the tool.
Beat 1, Spot: do the first one on the projector. Click two tells in the slop caption, let the room shout the rest. Two samples available: Instagram caption and customer email.
Beat 2, Ban: the tells they clicked are already ticked as rules. The one thing to police: the voice box wants sentences they ACTUALLY wrote (a WhatsApp message counts), not how they think they should sound.
Beat 3, Test: Run the rewrite. Before and after, side by side, live. Rewrites share the same 40-per-device allowance as the prompt builder.
Copy button gives them the prompt to keep; it also saves on their device. This one they use tomorrow, and it answers the sounds-like-AI worry four people raised in the questionnaire.`,
  },
  'p-sop': {
    id: 'p-sop',
    num: 36,
    title: 'Principle 14 · Sessions become SOP',
    label: 'The long game',
    notes: `The five-year bet. Your saved conversations become how the AI learns your voice, your standards, your way of working.
Callback: the prompt they saved in the prompt builder was the first brick.
That corpus is a moat. Do not treat sessions as throwaway.
This is why "guard your saved sessions" sits inside Grow, don't chase.`,
  },
  fifteen: {
    id: 'fifteen',
    num: 37,
    title: 'The fifteen, one page',
    label: 'Leave it up during discussion',
    notes: `The walk you just did, on one page. Three of the fifteen (10, 13 and 15) appeared out of order; this page reunites them.
Do not read the list out again. Leave it on screen while any closing discussion runs.
Tell them the printed version comes with the leave-behind, so nobody needs to photograph the screen.
Any one of these can eat ten minutes of debate. Allow at most one debate, then move.`,
  },
  homework: {
    id: 'homework',
    num: 38,
    title: 'Homework · before Session 2',
    label: '1:56 · 4m',
    notes: `The recap. All four landed one at a time through the deck; this page is the checklist.
1. Two saved back-office prompts.
2. Five prompts written by AI, one per medium. The field guide is the cheat sheet.
3. One image, five versions.
4. One cross-check across three machines, colleague judges blind.
5. As a team: which AI do we standardise on? Bring the pick.
Reassure: each one is an evening at most. Two done well beats four rushed. The team pick is the only mandatory one.
The extension ideas and skill ideas sheets go out with the follow-up email, one idea per job function. Point at them, do not walk through them.`,
  },
  closing: {
    id: 'closing',
    num: 39,
    title: 'Closing · Session 2 preview',
    label: 'End on time',
    notes: `Sell Session 2 in one line: next time, everyone in this room builds real software, most of you for the first time.
What happens: a Chrome extension you describe into existence, a skill written from your own week, and the start of your 90-day plan.
Two people asked for exactly this in the questionnaire: Rohan (agent creation, automation workflows) and Rajan (dashboards, analysis platforms). Tell them Session 2 is theirs.
Ask them to bring: laptop, Google login, and the team's AI pick.
Thank the room. End on time; it buys trust for Session 2.`,
  },
};

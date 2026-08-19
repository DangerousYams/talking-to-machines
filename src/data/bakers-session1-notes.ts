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
  'relax', 'ladder',
  'brain', 'weights', 'next-word', 'follows', 'data',
  'break-hands', 'experiments',
  'break-land', 'wider-map', 'open-weights',
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
Worries from the questionnaire (30 answers): privacy 9, sounds-like-AI 4, makes-things-up 4, job worries 4, feels-like-cheating 3. 21 also ticked excited.
Name privacy out loud; it is the biggest one. Promise the answer: a dedicated slide at the end of the teach beat, twenty minutes from now.
The job worry is small but real (4 people); this slide is for them.
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
The counts on the slide come from the questionnaire's how-often question: 16 daily users mapped to Curator, 14 occasional users (9 weekly, 5 barely or never) mapped to Quoter. Say that mapping out loud; it is a proxy, not a verdict.
Still ask people to place themselves silently; self-placement beats my mapping.
The 90-day goal is Author. Nobody needs to be an Orchestrator yet.`,
  },
  brain: {
    id: 'brain',
    num: 6,
    title: 'It began as a sketch of the brain',
    label: '0:10 · 15m · Teach',
    notes: `Start the teach beat somewhere familiar: the brain.
A neuron listens to its neighbors, weighs each signal (some voices count more), and fires or stays quiet. That is all one neuron does.
Stack 86 billion and you get pattern recognition, memory, language, taste.
Whiteboard moment if the room is warm: three circles, arrows into one, fire or not.
No biology exam. The one word to keep from this slide: weighs.`,
  },
  weights: {
    id: 'weights',
    num: 7,
    title: 'The learning lives in the weights',
    label: 'Weights, lightly',
    notes: `The artificial version is embarrassingly simple: a neuron is a little sum. Each input gets multiplied by a number. That number is a weight.
Learning is nothing mystical: nudge the weights, check if the guess improved, repeat.
Training a language model: show it the internet one chunk at a time, ask it to guess the next word, nudge trillions of weights when it is wrong. For months. That is why training costs billions and using it costs paise.
The finished model IS the weights: one huge file of numbers. Hold that thought; it comes back in the lay of the land as "open weights".`,
  },
  'next-word': {
    id: 'next-word',
    num: 8,
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
    num: 9,
    title: 'One fact, three consequences',
    label: 'Tokens · context · made-up facts',
    notes: `Three consequences, and each lands hands-on in fifteen minutes.
- Tokens: it reads and writes in chunks, roughly three-quarters of a word each. Cost and speed are counted in chunks. The token experiment makes this real.
- Context: the model sees one window of recent conversation, nothing else. When the window fills, the oldest lines fall out. That is why long chats drift.
- Made-up facts: it always has a next word, even where it knows nothing. A likely word is not a true word. It is not a database; it is a very well-read improviser.
Do not solve these here. Promise the fixes: the four experiments next, and principles 09 to 12 later.`,
  },
  data: {
    id: 'data',
    num: 10,
    title: 'Where does my data go?',
    label: 'Nine of you asked',
    notes: `Nine of the thirty questionnaires raised privacy. Answer it straight, then move.
Where a chat goes: to the model maker's servers, encrypted on the way. Not to the public internet, not to competitors.
The real question is training: does your chat teach the next model? Free consumer plans often can. Business and API plans contractually do not. Every tool has a toggle.
Check the current defaults the night before the session; they move every few months. Show one toggle live if time allows.
House rule until the team standardises: nothing in a chat you would not email an outside vendor. Customer lists, unreleased numbers, contracts: business plan or keep them out.
Bridge to plant: there is one option where data never leaves at all. It is on the map in an hour: open weights.`,
  },
  'break-hands': {
    id: 'break-hands',
    num: 11,
    title: '· Laptops open ·',
    label: '0:25 · 40m · Hands-on',
    notes: `Switch mode. Four experiments, everyone typing.
Pair the five beginners (Maulik, Hitesh, Jaimin, Shailesh, Shital) with daily users. Keyur, Harshil and Krutagna are strong anchors.
The widgets are on talkingtomachines.xyz; put the links where everyone can see them.
Timing discipline: roughly ten minutes each. If a block runs long, cut the talk, never the typing.`,
  },
  experiments: {
    id: 'experiments',
    num: 12,
    title: 'The four experiments',
    label: 'Keep this slide up while they work',
    notes: `Run them in order. The first three run on live tools; the cards on this slide are links, and the URLs are printed on them.
1. Prompt builder, talkingtomachines.xyz/tools/prompt-builder. Open on their laptops, no login. Pick a starter (there are starters for minutes and invoice chasing, straight from their questionnaire: spreadsheets 17 people, minutes 14, invoices 12), fill the blanks, then stack moves. The moves are tagged with tonight's principles. Each device gets 40 AI rewrites a day, plenty for the session. Have them SAVE one prompt; it seeds principle 14, sessions become your SOP.
2 and 3. The Context Lab, talkingtomachines.xyz/tools/context. One tool covers both cards. Projector script: press Play the demo and let the bakery chat run. At the end the assistant is asked what price was decided, and it forgets: the message fell out of the window. Then Reset, switch auto-compact ON, Play again: the summary carries the price through and it remembers. Point at the bill panel: same chat, five models, five prices. The chat is simulated, the token and money math is real.
4. De-slop prompt: everyone writes a system prompt in their own voice, so output sounds like them and not like AI. This one they keep and use tomorrow. No tool for this yet; they work in their own Claude or ChatGPT.
Principles 05, 06, 09 and 12.`,
  },
  'break-land': {
    id: 'break-land',
    num: 13,
    title: '· The lay of the land ·',
    label: '1:05 · 35m · Teach + live',
    notes: `Back to the screen. Same brief, three machines, live: Claude, ChatGPT, Gemini side by side.
Pick a brief from their world. Example: "Write the launch caption for a new cookie SKU going live on Blinkit."
Second brief if time, straight from Shivani's questionnaire answer: a firm but warm note to a difficult category manager. Half the room lives that.
Let the room judge the three answers out loud. Which is best? Why?
The lesson: the models have flavors. Pick per task, and when in doubt, ask one AI which AI to use.
Principles 04 and 11.`,
  },
  'wider-map': {
    id: 'wider-map',
    num: 14,
    title: 'The wider map',
    label: 'Tour, not a catalog',
    notes: `Quick tour. The point is that these exist and are worth an evening each, not mastery today.
How the prompt changes with the medium:
- Images: describe the frame. Subject, light, style.
- Video: describe the shot. Movement, duration, mood.
- Music: describe genre, tempo and mood, then the lyric idea.
- Deep research: describe the question, and the sources you would trust.
NotebookLM deserves 3 minutes live if time allows: feed it your own documents and it answers from those, not from the open internet. Keyur already uses it; let him vouch.
Deep research: half an hour of reading done for you, with citations you can check.
At the Video card, name-check Anshika and Yukti (design): both asked for 30-second-plus video with dialogue. Answer: that is the Generative Media Bootcamp; today is the map, not the deep dive.`,
  },
  'open-weights': {
    id: 'open-weights',
    num: 15,
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
    num: 16,
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
    num: 17,
    title: 'Principle 01 · Rate of improvement',
    label: 'Recap run · 20 to 30s a slide',
    notes: `Start of the principle walk. Keep it brisk; several of these landed hands-on earlier, so name the moment and move.
What is mediocre today is genius in six months. Model quality roughly doubles yearly; the tool list turns over monthly.
So build around approach, not tools. The approach transfers. The wider map we just toured will look different by Session 2, and that is fine.`,
  },
  'p-comms': {
    id: 'p-comms',
    num: 18,
    title: 'Principle 02 · Communication',
    label: 'The big reframe',
    notes: `The most important reframe of the day.
When AI fails you, most of the time the ask was unclear, the context was missing, or nobody showed it what good looks like.
Engineers are not the people best at AI. Clear communicators with strong taste are.
Everyone in this room can become one of those.`,
  },
  'p-loop': {
    id: 'p-loop',
    num: 19,
    title: 'Principle 03 · The core loop',
    label: 'The spine of the fifteen',
    notes: `Every AI interaction is this loop.
Choose the right tool and scope. Communicate frame, context and examples. Evaluate against your own bar. Repeat.
Everything else on the list is a move inside one of these three buckets.`,
  },
  'p-tool': {
    id: 'p-tool',
    num: 20,
    title: 'Principle 04 · Pick the right AI',
    label: 'Choose',
    notes: `They watched this live an hour ago: same brief, three machines, three flavors.
Different tasks want different tools: reasoning, speed, images, research.
The meta move: when in doubt, ask one AI which AI to use. It will answer honestly.`,
  },
  'p-frame': {
    id: 'p-frame',
    num: 21,
    title: 'Principle 05 · Frame the conversation',
    label: 'Communicate',
    notes: `They built this in the prompt builder.
The session is the unit, not the message. Set who the AI is, what you are doing, and what success looks like.
Once the frame is set, one-word follow-ups get great answers.`,
  },
  'p-examples': {
    id: 'p-examples',
    num: 22,
    title: 'Principle 06 · Examples beat instructions',
    label: 'Communicate',
    notes: `Telling AI "make it punchier" is vague. Showing it three punchy examples calibrates it instantly.
Works for writing voice, visuals and decisions. The model moves toward your examples.
Bakery version: paste three past captions you loved before asking for a new one.`,
  },
  'p-questions': {
    id: 'p-questions',
    num: 23,
    title: 'Principle 07 · Ask AI to ask you',
    label: 'Communicate',
    notes: `The single highest-return habit: "Before you start, ask me five questions that would make your answer better."
It surfaces assumptions you did not know you had. You answer, and the output improves dramatically.
Socratic beats one-shot. Every time.`,
  },
  'p-recursive': {
    id: 'p-recursive',
    num: 24,
    title: 'Principle 08 · Recursion',
    label: 'Use AI on AI',
    notes: `Stuck on a prompt? Ask another AI to write a better one.
Output went wrong? Paste it in and ask what went wrong.
AI is trained on how to use AI. Use the machines on each other.`,
  },
  'p-iteration': {
    id: 'p-iteration',
    num: 25,
    title: 'Principle 09 · Iteration',
    label: 'Evaluate',
    notes: `They lived this in the hands-on block; point back at it.
A good result takes three to five passes, not one. Amateurs quit after one try; pros budget for the passes.
Each pass injects your standards. You are the quality filter.`,
  },
  'p-settle': {
    id: 'p-settle',
    num: 26,
    title: 'Principle 10 · Don\'t take the quick win',
    label: 'Evaluate',
    notes: `Models are trained to seem helpful fast, so the first answer is optimized to be acceptable, not excellent.
Push back: ask for three alternatives, ask what it is holding back.
The best material shows up on pass two or three.`,
  },
  'p-crosscheck': {
    id: 'p-crosscheck',
    num: 27,
    title: 'Principle 11 · Never trust one machine',
    label: 'Evaluate',
    notes: `They watched this live in the three-machine comparison.
When stakes are high, run the same task through two or three models.
Where they agree, move with confidence. Where they diverge, real thinking is required.
Five extra minutes against a confidently wrong answer.`,
  },
  'p-deslop': {
    id: 'p-deslop',
    num: 28,
    title: 'Principle 12 · Humanize the output',
    label: 'Evaluate',
    notes: `They wrote their own de-slop prompt an hour ago; connect back to it.
AI has tells: em-dashes, "crucial", "leverage", tidy three-point lists.
The pass: read it aloud, break the rhythm, add one thing only you would know.
Nothing ships raw.`,
  },
  'p-human': {
    id: 'p-human',
    num: 29,
    title: 'Principle 13 · The human edge',
    label: 'Land this one slowly',
    notes: `AI can generate ten options. It cannot tell you which one is right for your brand.
Taste, conviction and judgment come from you, and experience compounds harder than ever.
Twenty years of knowing what good product looks like just became more valuable, not less.`,
  },
  'p-sop': {
    id: 'p-sop',
    num: 30,
    title: 'Principle 14 · Sessions become SOP',
    label: 'The long game',
    notes: `The five-year bet. Your saved conversations become how the AI learns your voice, your standards, your way of working.
That corpus is a moat. Do not treat sessions as throwaway.
This is why "guard your saved sessions" sits inside Grow, don't chase.`,
  },
  'p-kds': {
    id: 'p-kds',
    num: 31,
    title: 'Principle 15 · Know / Do / Show',
    label: 'Close the run here',
    notes: `Every AI task fits one bucket.
Know: research, reasoning, understanding. Do: agents and software, which is what Session 2 builds. Show: decks, images, video, artifacts.
Picking the bucket first tells you which tool to reach for and what "good" means.`,
  },
  fifteen: {
    id: 'fifteen',
    num: 32,
    title: 'The fifteen, one page',
    label: 'Leave it up during discussion',
    notes: `The walk you just did, on one page. Do not read the list out again. Leave it on screen while the staying-current discussion runs.
Tell them the printed version comes with the leave-behind, so nobody needs to photograph the screen.
Any one of these can eat ten minutes of debate. Allow at most one debate, then move.`,
  },
  homework: {
    id: 'homework',
    num: 33,
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
    num: 34,
    title: 'Closing · Session 2 preview',
    label: 'End on time',
    notes: `Sell Session 2 in one line: next time, everyone in this room builds real software, most of you for the first time.
What happens: a Chrome extension you describe into existence, a skill written from your own week, and the start of your 90-day plan.
Two people asked for exactly this in the questionnaire: Rohan (agent creation, automation workflows) and Rajan (dashboards, analysis platforms). Tell them Session 2 is theirs.
Ask them to bring: laptop, Google login, and the team's AI pick.
Thank the room. End on time; it buys trust for Session 2.`,
  },
};

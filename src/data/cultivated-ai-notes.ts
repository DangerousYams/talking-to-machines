// Speaker notes + slide metadata for the Cultivated AI pitch deck.
// Single source of truth consumed by /cultivated-ai (broadcast)
// and /cultivated-ai/presenter (subscribe + render notes).

export interface SlideNote {
  id: string;
  num: number;
  title: string;    // short, for presenter "now / next" panels
  label?: string;   // optional eyebrow label
  notes: string;    // markdown-lite; \n for newlines, - for bullets
}

export const slideOrder = [
  'cover',
  'positioning',
  'licensing',
  'failures',
  'shift',
  'nbim',
  'ramp',
  'winners',
  'stages',
  'approach',
  'priya-approach',
  'distillation',
  'priya-distillation',
  'compounding',
  'priya-compounding',
  'simulation',
  'priya-simulation',
  'programme',
  'bundle',
  'after',
  'thesis',
  'close',
] as const;

export const slideNotes: Record<string, SlideNote> = {
  cover: {
    id: 'cover',
    num: 1,
    title: 'Cover · Cultivated AI',
    notes: `Open with confidence. Don't rush the title.
Read the verb-pair aloud: "Grow, don't Chase."
Pause. Let it land before saying anything else.
The whole pitch will earn this line.`,
  },
  positioning: {
    id: 'positioning',
    num: 2,
    title: 'The positioning',
    notes: `One sentence. Color-coded so the structure lands visually.
Read the whole sentence once, slowly. Don't break it up.
Then point at the colored phrases in order:
- TEAL (audience): "business leaders" — that's who's in this room.
- AMBER (outcome): "shape AI adoption in their teams" — that's the deliverable.
- RED (against): "vendors who don't understand your business" — that's what we replace.
Bridge: "And here's the line we want you to remember."`,
  },
  licensing: {
    id: 'licensing',
    num: 3,
    title: 'Licensing isn\'t adoption',
    notes: `The core diagnostic claim. Say it as a finding, not an opinion.
- Companies are spending heavily on AI tools.
- The receipts show up as money out, not work done.
- Vendors and consultants who don't know your business cannot fix this for you.
This is the problem Cultivated AI exists to solve.`,
  },
  failures: {
    id: 'failures',
    num: 4,
    title: 'The two failure modes',
    notes: `Pair the two stories. They bracket the position.
LEFT: Microsoft Copilot. Gartner: ~40% of enterprises piloting, only ~5% have scaled it. Tens of millions of seats sold; most of them sit unused. Licensing isn't adoption.
RIGHT: Klarna. 2024 — replaced their customer service team with AI. May 2025 — CEO publicly walked it back. Now hybrid: AI handles routine, humans handle empathy.
The point: companies are getting it wrong on both ends. Some buy seats no one uses. Some replace people they shouldn't have. Cultivated AI is the path between.`,
  },
  shift: {
    id: 'shift',
    num: 5,
    title: 'The ground is moving',
    notes: `The pressure is real. Don't soft-pedal this.
- Competitors are quietly redesigning around AI.
- Your buyers and partners are modelling your business better than you can model theirs.
- The unit economics of your category are shifting under you.
You can't sit it out. But you also can't license your way into mastery.
Transition: "And the most accountable money on earth is already moving."`,
  },
  nbim: {
    id: 'nbim',
    num: 6,
    title: 'NBIM · the most serious money is moving',
    notes: `The first proof point. Drop NBIM as the heaviest possible name.
NBIM: Norway's sovereign wealth fund. The world's largest. ~$2.1 trillion AUM.
600+ staff using Claude weekly. Estimated 213,000 hours saved per year.
CEO Nicolai Tangen, on the record: "If you don't use it, you will never be promoted."
The point: this isn't a tech company. This isn't a startup. This is the most accountable money on earth — public scrutiny, fiduciary duty — and they're all in.
If they can do it, your business cannot afford to wait.
Bridge: "But what does smart adoption actually look like? It starts with thinking clearly."`,
  },
  ramp: {
    id: 'ramp',
    num: 7,
    title: 'Ramp · all in',
    notes: `The second proof point, paired with NBIM. Ramp is the operational example.
$22B fintech. ~1,200 people. Their CPO Geoff Charles published their L0→L3 ladder publicly.
- L0 = occasional chat. L1 = daily basics. L2 = embedded in workflow. L3 = systems do the work.
The mandate (April 2026): "If you're not using Claude Code this year, no matter your role, you're underperforming. The people still in L0 will most likely not be at the company."
Two receipts to land:
- 99.5% of Ramp employees are active weekly AI users — not just engineers.
- ~30% of merged PRs are written by their internal coding agent.
The point: Ramp didn't license a tool. They built a *principle* (the ladder) and held the company to it.
Bridge: "Two very different organisations. NBIM and Ramp. What do they share?"`,
  },
  winners: {
    id: 'winners',
    num: 8,
    title: 'What the winners did',
    notes: `The synthesis. After two concrete proof points (NBIM and Ramp), name the common pattern.
What they share is not a tool. They learned to *think clearly*.
About AI, in the context of *their own* business — not generic case studies, not vendor decks.
With principles that hold up as the tools change. Tools change every quarter; principles survive.
Walk the four anchors slowly: what to deploy, what to ignore, where it fits, where it doesn't.
Bridge: "And that is what we cultivate."`,
  },
  stages: {
    id: 'stages',
    num: 9,
    title: 'Cultivated AI · five stages',
    notes: `Introduce the methodology by name. This is the core slide.
"Cultivated AI. Five stages, in order. Years, not quarters. Cultivation, not deployment."
Read the stage names out loud, in rhythm: APPROACH. DISTILLATION. COMPOUNDING. SOVEREIGNTY. SIMULATION.
The first three are taught in the Programme. The last two are graduation engagements.
Most companies get to Sovereignty. A few reach Simulation. All start with Approach.
Bridge: "Let me walk you through what this looks like for one person — Priya, a department head running Procurement."`,
  },
  approach: {
    id: 'approach',
    num: 10,
    title: 'Stage 1 · Approach',
    notes: `Stage 1 is the principles install.
The leader sees what AI is, what it does well, what it does badly, where it's heading.
Mental models start working.
By the end of Stage 1, the leader stops chasing tools and starts thinking.
This is the durability layer. Tools change every quarter. Principles outlive them.`,
  },
  'priya-approach': {
    id: 'priya-approach',
    num: 11,
    title: 'Priya · after Approach',
    notes: `Introduce Priya for the first time. Slow down here — she carries the next nine slides.
"Priya is a department head running Procurement. Every company has someone like her. Twelve AI tool pitches forwarded to her last month. Her team is anxious. She's smart, but she can't tell what's real."
After Stage 1, Priya has a frame. She can read any new AI announcement and place it in 30 seconds — what it does, where it fits in her work, where it doesn't.
The artefact: a one-page Procurement AI Frame. Her personal compass.
Quote to read: "I stopped chasing demos. I started thinking."
Bridge: "And once she has the frame, she can go to work."`,
  },
  distillation: {
    id: 'distillation',
    num: 12,
    title: 'Stage 2 · Distillation',
    notes: `The leader takes their existing SOPs — the way work already gets done in their role — and distils them into AI playbooks.
Playbooks teach the model your way of working, not the other way around.
The technical term is *agentic skills*; we use *playbooks* because the work is business, not engineering.
By the end of Stage 2, the AI runs the leader's actual work in the leader's actual way.
Not a generic template. Not a vendor demo. Their work.`,
  },
  'priya-distillation': {
    id: 'priya-distillation',
    num: 13,
    title: 'Priya · after Distillation',
    notes: `"Priya has run her vendor-evaluation SOP two hundred times. The pattern is in her head — risk thresholds, scoring weights, the questions she always asks first."
In Stage 2 she distils that SOP into an AI playbook. Now the AI runs vendor evaluation in HER way, not a vendor template. Same for contract clause review, RFP drafting, negotiation briefs, supplier risk scans.
The artefact: 4-6 working playbooks. Hers. In production.
Quote to read: "It's still my procurement. Just running on AI."
Bridge: "And then it gets better — because she isn't the only one building playbooks."`,
  },
  compounding: {
    id: 'compounding',
    num: 14,
    title: 'Stage 3 · Compounding',
    notes: `Stage 3 is what makes the Programme worth paying for.
Each leader builds playbooks in Stage 2. In Stage 3, the best of those playbooks move from one leader to the rest of the company.
The leader who built a strong report-making playbook shares it. The team that figured out how to brief partners passes their playbook on.
Each playbook adopted raises the floor for the next.
The best of the company becomes the floor of the company.
That's compounding.`,
  },
  'priya-compounding': {
    id: 'priya-compounding',
    num: 15,
    title: 'Priya · after Compounding',
    notes: `Priya's library doubles, then triples — without her writing a line.
Legal builds a contract-clause comparator. Finance builds a TCO modeller. HR builds a vendor-onboarding checklist. Priya inherits all of them.
And her own vendor-scorecard playbook spreads to IT and Operations.
The artefact: a shared playbook library across the cohort. Triple the leverage at zero extra effort.
Quote to read: "The best of the company is now the floor of my desk."
Bridge: "This is where companies start pulling away from the pack."`,
  },
  simulation: {
    id: 'simulation',
    num: 16,
    title: 'Stage 4 · Simulation',
    notes: `The deepest unlock. Most companies will never get here.
The ones who do are using AI to build synthetic environments where strategy can be rehearsed, teams can be trained against scenarios that don't exist yet, and what-ifs can be explored at speed.
This is using AI for things competitors cannot do at all.
Two tiers above licensing.
We scope this engagement separately, after the Programme.`,
  },
  'priya-simulation': {
    id: 'priya-simulation',
    num: 17,
    title: 'Priya · after Simulation',
    notes: `A $40M three-year supplier negotiation next quarter. The supplier has more leverage than she'd like.
Priya rehearses the negotiation against an AI-simulated counterparty trained on the supplier's public history. She runs supply-chain shock scenarios across her supplier base. She walks in prepared in ways that weren't possible before AI.
The artefact: synthetic environments where the most expensive procurement decisions get rehearsed first.
Quote to read: "I show up ready for moves I couldn't predict before."
Bridge: "Now — what does Priya actually walk out of the Programme with?"`,
  },
  programme: {
    id: 'programme',
    num: 18,
    title: 'The Cultivated AI Programme',
    notes: `Now the offer.
The Cultivated AI Programme delivers Stages 1, 2, and 3.
Six sessions, two hours each, over three weeks.
A cohort of up to fifteen leaders from your company.
On-site or hybrid. Customised to your sector.
Each leader leaves with two artefacts.`,
  },
  bundle: {
    id: 'bundle',
    num: 19,
    title: 'What each leader walks out with',
    notes: `Two artefacts. Both real. This is what Priya walks out with — and so does every leader in the cohort.
ONE: their personal playbook library — four to six working AI playbooks built from their own SOPs, in production-ready form.
TWO: The 90-Day Cultivated AI Plan — a personalised plan governing what they deepen, share, and extend over the first 90 days of cultivation.
The discipline is years; the operating cadence is 90 days.`,
  },
  after: {
    id: 'after',
    num: 20,
    title: 'After the Programme',
    notes: `Two optional follow-on engagements. Both scoped after the Programme is complete and the discipline has rooted.
ONE: 90-Day Advisory — sponsor coaching, day-30 and day-90 reviews, written outcomes summary. For cohorts that want to compound the discipline immediately.
TWO: Simulation engagement — custom synthetic environments for strategy and training.
These are where the partnership deepens. They are where most of the work lives.`,
  },
  thesis: {
    id: 'thesis',
    num: 21,
    title: 'Thesis · the closing argument',
    notes: `The closing argument. The line you want them to remember.
"Resilient pipelines are built by cultivating the approach, not chasing technology."
Say it slowly. Let it sit. You've earned this line.
Don't explain it. Don't gloss it. Pause after. Then transition to the close.`,
  },
  close: {
    id: 'close',
    num: 22,
    title: 'Close · Grow, don\'t Chase',
    notes: `End where you started. The verb-pair earns more on the second hearing.
"Cultivated AI. Grow, don't Chase."
CTA: One next step. A 30-minute scoping conversation with the sponsor (CEO, CHRO, CTO).
Hand them the leave-behind. Say: "Read this once. Then let's pick a date."
Don't oversell. The discipline argues for itself.`,
  },
};

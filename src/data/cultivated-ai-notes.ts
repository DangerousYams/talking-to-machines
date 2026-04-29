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
  'distillation',
  'compounding',
  'simulation',
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
    title: 'Cultivated AI · four stages',
    notes: `Introduce the methodology by name. This is the core slide.
"Cultivated AI. Four stages, in order. Years, not quarters. Cultivation, not deployment."
Read the stage names out loud, in rhythm: APPROACH. DISTILLATION. COMPOUNDING. SIMULATION.
The first three are taught in the Programme. Simulation is the graduation engagement.
THE FORMAT (point at the meta panel below the cards):
- Six sessions, two hours each, over six weeks.
- Cohort of up to fifteen leaders from the same company.
Bridge: "Let me walk you through what this looks like for one person — Priya, a department head running Procurement."`,
  },
  approach: {
    id: 'approach',
    num: 10,
    title: 'Stage 1 · Approach (Priya)',
    notes: `Stage 1 is the principles install. Fifteen of them. The slide shows what Priya leaves with.
Introduce Priya here. Slow down — she carries the next four slides.
"Meet Priya. Head of Procurement. She's taking the Cultivated AI Programme."
THE HEADLINE TAKEAWAY:
- AI Tool Rubric (Principle 04 · "Pick the right AI for the task"): five questions — cost, fit, security, vendor risk, replaceability.
- Cross-check protocol (Principle 11): two AIs on every important task; she reconciles the differences.
THE GRID — four principles that matter most for her role:
- Principle 01 · "Plan for the AI of tomorrow." She's not buying for today's tools; she's building habits that survive the next model release.
- Principle 07 · "Ask AI to ask you the questions." Inverts the dynamic — instead of dumping a brief, she lets the AI interrogate her until the brief writes itself.
- Principle 08 · "Ask AI for help with AI." Recursion. Stuck on a prompt? Ask AI to fix the prompt.
- Principle 11 · "Cross-check AI's answers with another AI." The principle behind the protocol.
Bridge: "Once she has the principles, she can go to work — on her own SOPs."`,
  },
  distillation: {
    id: 'distillation',
    num: 11,
    title: 'Stage 2 · Distillation (Priya)',
    notes: `Stage 2 is the heart of the discipline. The leader takes the expertise that's been between their ears for years — risk thresholds, scoring weights, question patterns, judgment calls — and instils it in agentic AI. The AI runs the work in their voice, at their scale.
Technical term: agentic skills. We use *playbooks* because the work is business, not engineering.
THE STORY for Priya:
"Six weeks in. What was between Priya's ears now runs as agentic AI — at scale, in her voice."
Walk through her first five playbooks slowly:
- Vendor Evaluation — her risk framework, scoring weights, the questions she always asks first.
- Contract Clause Review — her standards for what's acceptable, what's a red flag.
- RFP Drafter — her voice, her structure, her must-haves.
- Negotiation Brief — her style going into a deal.
- Supplier Risk Scan — her thresholds for raising the alarm.
The point: this isn't a Copilot rollout or a vendor template. It's her work, her way, running at scale.
Bridge: "And then it gets better — because she isn't the only one building playbooks."`,
  },
  compounding: {
    id: 'compounding',
    num: 12,
    title: 'Stage 3 · Compounding (Priya)',
    notes: `Stage 3 is what makes the Programme worth paying for. The best playbooks move from one leader to the rest of the cohort, then to the rest of the company. Each playbook adopted raises the floor for the next.
THE STORY for Priya:
"Nine weeks in. Priya inherits the cohort's playbooks. She didn't write them — but she runs them daily via AI."
Walk through the inherited playbooks:
- Legal's contract-clause comparator.
- Finance's TCO modeller.
- HR's vendor-onboarding checklist.
The point: leverage without any extra effort. She didn't build these — but she runs them every day. That's the compound.
Footer note (read out loud): "Her own playbooks are proliferating outward, too." Her vendor scorecard is now in IT and Operations. The flow goes both ways.
Bridge: "This is where companies start pulling away from the pack. And then there's the deepest unlock."`,
  },
  simulation: {
    id: 'simulation',
    num: 13,
    title: 'Stage 4 · Simulation (Priya)',
    notes: `The deepest unlock. Most companies will never get here. The ones who do use synthetic AI environments for three things: strategy, preparation, and training — for the leader and for the team.
THE STORY for Priya:
"Priya uses synthetic AI environments for strategy, preparation, and training — her own, and her team's."
Walk through the five examples slowly:
- Negotiation rehearsals against AI counterparties (preparation, her).
- Supply-chain shock scenarios for category strategy (strategy, her).
- M&A diligence dry-runs before deal week (strategy, her).
- Crisis response drills with her direct reports (training, her team).
- Onboarding simulations for new procurement hires (training, her team).
The point: this is two tiers above licensing. Things competitors cannot do at all. And it scales — Priya isn't the only one practising; her whole team is rehearsing too.
Bridge: "And here's the line we want you to remember."`,
  },
  thesis: {
    id: 'thesis',
    num: 14,
    title: 'Thesis · the closing argument',
    notes: `The closing argument. The line you want them to remember.
"Resilient pipelines are built by cultivating the approach, not chasing technology."
Say it slowly. Let it sit. You've earned this line.
Don't explain it. Don't gloss it. Pause after. Then transition to the close.`,
  },
  close: {
    id: 'close',
    num: 15,
    title: 'Close · Grow, don\'t Chase',
    notes: `End where you started. The verb-pair earns more on the second hearing.
"Cultivated AI. Grow, don't Chase."
CTA: One next step. A 30-minute scoping conversation with the sponsor (CEO, CHRO, CTO).
Hand them the leave-behind. Say: "Read this once. Then let's pick a date."
Don't oversell. The discipline argues for itself.`,
  },
};

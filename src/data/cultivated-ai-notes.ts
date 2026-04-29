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
  'thesis',
  'about',
  'licensing',
  'failures',
  'shift',
  'discipline',
  'stages',
  'approach',
  'distillation',
  'bajaj',
  'compounding',
  'sovereignty',
  'nbim',
  'simulation',
  'programme',
  'bundle',
  'price',
  'after',
  'why-ocre',
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
  thesis: {
    id: 'thesis',
    num: 2,
    title: 'Thesis · AI adoption is a pipeline problem',
    notes: `This is the one line you want them to remember.
Say it slowly: "AI adoption is a pipeline problem."
Then back it with credentials, not the other way around.
20 years of building production pipelines at Pixar, EA, Lumosity, Masala.
What I learnt: resilient pipelines come from cultivating the approach, not chasing technology.
Bridge: that's why we're here today.`,
  },
  about: {
    id: 'about',
    num: 3,
    title: 'About — Shalin Shodhan',
    notes: `Fast bio. Don't linger. The credentials buy you the next 30 minutes; don't burn them dwelling.
- Pixar, 6 features, 3 Academy Awards
- EA Spore — BAFTA
- Lumosity — tens of millions of users
- Masala Games — Detective Dotson, Word Mess #1 in 21 countries
- CMU MET — entertainment tech
Author of Talking to Machines (the consumer course; same philosophy, different wrapper).
Transition: "Now let me show you the problem we're actually trying to solve."`,
  },
  licensing: {
    id: 'licensing',
    num: 4,
    title: 'Licensing isn\'t adoption',
    notes: `The core diagnostic claim. Say it as a finding, not an opinion.
- Companies are spending heavily on AI tools.
- The receipts show up as money out, not work done.
- Vendors and consultants who don't know your business cannot fix this for you.
This is the problem Cultivated AI exists to solve.`,
  },
  failures: {
    id: 'failures',
    num: 5,
    title: 'The two failure modes',
    notes: `Pair the two stories. They bracket the position.
LEFT: Microsoft Copilot. Gartner: ~40% of enterprises piloting, only ~5% have scaled it. Tens of millions of seats sold; most of them sit unused. Licensing isn't adoption.
RIGHT: Klarna. 2024 — replaced their customer service team with AI. May 2025 — CEO publicly walked it back. Now hybrid: AI handles routine, humans handle empathy.
The point: companies are getting it wrong on both ends. Some buy seats no one uses. Some replace people they shouldn't have. Cultivated AI is the path between.`,
  },
  shift: {
    id: 'shift',
    num: 6,
    title: 'The ground is moving',
    notes: `The pressure is real. Don't soft-pedal this.
- Competitors are quietly redesigning around AI.
- Your buyers and partners are modelling your business better than you can model theirs.
- The unit economics of your category are shifting under you.
You can't sit it out. But you also can't license your way into mastery.
Transition: "So what does the path between actually look like?"`,
  },
  discipline: {
    id: 'discipline',
    num: 7,
    title: 'Cultivated AI · the discipline',
    notes: `Introduce the methodology by name.
Cultivated AI is a five-stage discipline.
Five stages, in order, that take a leader from first principles to AI-built simulations.
Years, not quarters. Cultivation, not deployment.
Now let me walk you through them.`,
  },
  stages: {
    id: 'stages',
    num: 8,
    title: 'Five stages',
    notes: `Read them out loud, in rhythm:
APPROACH. DISTILLATION. COMPOUNDING. SOVEREIGNTY. SIMULATION.
The first three we teach in the Programme. The last two are graduation engagements.
Most companies will get to Sovereignty. A few will get to Simulation.
All of them start with Approach.`,
  },
  approach: {
    id: 'approach',
    num: 9,
    title: 'Stage 1 · Approach',
    notes: `Stage 1 is the principles install.
The leader sees what AI is, what it does well, what it does badly, where it's heading.
Mental models start working.
By the end of Stage 1, the leader stops chasing tools and starts thinking.
This is the durability layer. Tools change every quarter. Principles outlive them.`,
  },
  distillation: {
    id: 'distillation',
    num: 10,
    title: 'Stage 2 · Distillation',
    notes: `The leader takes their existing SOPs — the way work already gets done in their role — and distils them into AI playbooks.
Playbooks teach the model your way of working, not the other way around.
The technical term is *agentic skills*; we use *playbooks* because the work is business, not engineering.
By the end of Stage 2, the AI runs the leader's actual work in the leader's actual way.
Not a generic template. Not a vendor demo. Their work.`,
  },
  bajaj: {
    id: 'bajaj',
    num: 11,
    title: 'Bajaj Finance · what real adoption looks like',
    notes: `This is the anchor example for Stage 2. Use it.
Bajaj Finance built AI voice agents for loan disbursals.
In a single quarter (Q3 FY26): ₹1,600 crore disbursed through those agents.
Roughly 1,500 calling agents replaced. ~30% cost savings.
The point: this is not "we deployed Copilot." This is a workflow rebuilt around AI on a P&L-relevant function. That's what Distillation looks like at scale.
Most importantly: this is an Indian NBFC. Your peers, in your market, are doing this now.`,
  },
  compounding: {
    id: 'compounding',
    num: 12,
    title: 'Stage 3 · Compounding',
    notes: `Stage 3 is what makes the Programme worth paying for.
Each leader builds playbooks in Stage 2. In Stage 3, the best of those playbooks move from one leader to the rest of the company.
The leader who built a strong report-making playbook shares it. The team that figured out how to brief partners passes their playbook on.
Each playbook adopted raises the floor for the next.
The best of the company becomes the floor of the company.
That's compounding.`,
  },
  sovereignty: {
    id: 'sovereignty',
    num: 13,
    title: 'Stage 4 · Sovereignty',
    notes: `Once the discipline has rooted, the next move is sovereignty.
Local AI inside the company's own walls. Fine-tuning on the company's own data.
By this stage the company doesn't depend on vendors for its AI direction.
It owns the infrastructure. It owns the data. It owns the decisions.
This is where the strategic moat actually compounds.`,
  },
  nbim: {
    id: 'nbim',
    num: 14,
    title: 'NBIM · sovereignty in practice',
    notes: `Anchor example for Stage 4.
NBIM: Norway's sovereign wealth fund. The world's largest. ~$2.1 trillion AUM.
600+ staff using Claude weekly. Estimated 213,000 hours saved per year.
CEO Nicolai Tangen, on record: "If you don't use it, you will never be promoted."
Why this matters for Sovereignty: a sovereign wealth fund cannot have its data leaking to vendors. Public accountability. Fiduciary duty. So when they go all-in on AI, they go all-in on their terms.
That's the bar. That's what Stage 4 looks like at the top of the mountain.`,
  },
  simulation: {
    id: 'simulation',
    num: 15,
    title: 'Stage 5 · Simulation',
    notes: `The deepest unlock. Most companies will never get here.
The ones who do are using AI to build synthetic environments where strategy can be rehearsed, teams can be trained against scenarios that don't exist yet, and what-ifs can be explored at speed.
This is using AI for things competitors cannot do at all.
Two tiers above licensing.
We scope this engagement separately, after Sovereignty has matured.`,
  },
  programme: {
    id: 'programme',
    num: 16,
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
    num: 17,
    title: 'What each leader walks out with',
    notes: `Two artefacts. Both real.
ONE: their personal playbook library — four to six working AI playbooks built from their own SOPs, in production-ready form.
TWO: The 90-Day Cultivated AI Plan — a personalised plan governing what they deepen, share, and extend over the first 90 days of cultivation.
The discipline is years; the operating cadence is 90 days.`,
  },
  price: {
    id: 'price',
    num: 18,
    title: 'Price · ₹4 lakh',
    notes: `Single price. No tiers. No internal SKUs. No surprises.
₹4 lakh per cohort. Up to fifteen leaders.
Why this price: because the Programme is the entry to the discipline, not the destination. We've made it accessible so the question is "when," not "whether."
The depth shows up after — in advisory, in sovereignty, in simulation — and those are scoped separately.`,
  },
  after: {
    id: 'after',
    num: 19,
    title: 'After the Programme',
    notes: `Three optional follow-on engagements. All scoped after the Programme is complete and the discipline has rooted.
ONE: 90-Day Advisory — sponsor coaching, day-30 and day-90 reviews, written outcomes summary. For cohorts that want to compound the discipline immediately.
TWO: Sovereignty engagement — local AI on your walls, on your data. Includes Lockbox.
THREE: Simulation engagement — custom synthetic environments for strategy and training.
These are where the partnership deepens. They are where most of the work lives.`,
  },
  'why-ocre': {
    id: 'why-ocre',
    num: 20,
    title: 'Why Ocre Labs',
    notes: `Close on credibility. Not as a CV recap; as a proof of the thesis.
The pedigree (Pixar, EA, Lumosity, Masala, CMU) is the badge.
The cred is twenty years of building production pipelines behind the world's biggest entertainment products. Films seen the world over. Games played billions of times.
What I learnt across those gigs: resilient pipelines are built by cultivating the approach, not chasing technology.
That's the founding insight of Ocre Labs. That's what Cultivated AI teaches.`,
  },
  close: {
    id: 'close',
    num: 21,
    title: 'Close · Grow, don\'t Chase',
    notes: `End where you started. The verb-pair earns more on the second hearing.
"Cultivated AI. Grow, don't Chase."
CTA: One next step. A 30-minute scoping conversation with the sponsor (CEO, CHRO, CTO).
Hand them the leave-behind. Say: "Read this once. Then let's pick a date."
Don't oversell. The discipline argues for itself.`,
  },
};

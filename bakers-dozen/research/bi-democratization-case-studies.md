# Conversational BI and AI Answer Visibility: Case Studies for The Baker's Dozen

Research brief for The Baker's Dozen (Indian artisanal-bakery D2C/FMCG brand on Blinkit, Zepto, Instamart). The goal is a central warehouse plus a natural-language AI layer so leadership can query data in plain English, then an AEO/GEO layer so the brand shows up when shoppers ask AI for recommendations. Sources are cited inline and tagged as company-reported (first-party), vendor-claimed (marketing/sales material), independently reported, or academic. Numbers that could not be verified to a primary source are flagged.

## Executive summary

The pattern that works is consistent across every credible case: a central warehouse, a governed semantic/metrics layer on top, retrieval of curated example queries to ground the model, agentic orchestration, and a confidence/explanation layer so users trust the output. The single best-evidenced finding for Baker's Dozen is the Indian quick-commerce precedent: Swiggy's in-house tool Hermes lifted SQL accuracy from 54% to 93% by grounding the model in past validated queries and adding agentic reasoning (Swiggy-reported via InfoQ). Uber's QueryGPT (company-reported) cut query authoring from about 10 minutes to about 3 minutes for roughly 300 daily users in limited release. The decisive variable separating wins from failures is the semantic layer: a public dbt Labs benchmark shows raw text-to-SQL at 32.7% accuracy in 2023 rising to about 64-90% in 2026, while semantic-layer-grounded querying hits 98-100% on in-scope questions. Power BI Copilot and Microsoft Fabric (the client's existing stack) give a near-term path, but quantified independent customer outcomes are thin and adoption collapses without semantic-model prep. For Thread B, the foundational Princeton/IIT-Delhi GEO study (academic) shows content tactics can raise AI-answer visibility by up to 40%, and the practical play for a brand like Baker's Dozen is consistent presence and consistent positioning across the sources AI trusts (Reddit, YouTube, review sites, own structured pages).

---

# Thread A: Democratizing BI with natural-language AI

## Case study: Uber QueryGPT (text-to-SQL for operators and analysts)

- What they built: An internal natural-language-to-SQL system so operations managers, data scientists, and engineers can ask a question in English and get runnable SQL against Uber's warehouse. Born at an internal GenAI hackathon in May 2023, refined over roughly 20 iterations into a multi-agent system.
- Stack/architecture: OpenAI GPT-4 Turbo (128K context), a vector database with k-NN similarity search, and Retrieval-Augmented Generation over curated SQL samples. Multi-agent design: an Intent Agent maps a question to a business domain ("workspace"), a Table Agent selects relevant tables (with user confirmation), and a Column Prune Agent strips irrelevant columns to cut tokens. 12 system workspaces (Mobility, Core Services, Ads, IT, etc.) scope the model to a domain. An evaluation harness scores intent accuracy, table-overlap, successful execution, non-empty output, and similarity to "golden" SQL.
- Outcomes (company-reported, first-party): Query authoring drops from "around 10 minutes" to "about 3 minutes" (roughly 70% reduction). About 300 daily active users in limited release, with about 78% saying generated queries reduced the time they would have spent writing from scratch. Platform context: roughly 1.2 million interactive queries per month, about 36% from the operations org. Uber explicitly notes hallucination is "not completely solved" and reports about 5% run-to-run variance as normal. Source: https://www.uber.com/en-CA/blog/query-gpt/ (company-reported).
- Note on a widely cited number: The "140,000 hours saved per month" figure that circulates online comes from a third-party vendor blog (Wren AI), not Uber, and is an extrapolation. Treat it as third-party-estimated, not Uber-reported. Source: https://medium.com/wrenai/how-uber-is-saving-140-000-hours-each-month-using-text-to-sql-and-how-you-can-harness-the-same-fb4818ae4ea3 (third-party extrapolation).
- Relevance to Baker's Dozen: The workspace pattern (scope the model to a business domain before it writes SQL) and the eval harness are directly reusable for a small data team that needs reliability over breadth.

## Case study: Pinterest Text-to-SQL and Analytics Agent

- What they built: A Text-to-SQL feature inside Querybook (Pinterest's open-source SQL tool) that turns analytical questions into SQL, later evolved into a production "Analytics Agent" that also helps users discover tables and reuse past queries.
- Stack/architecture: LLM for generation, RAG with vector embeddings for table discovery, OpenSearch as the vector store, and WebSocket streaming for responses. Table retrieval narrows the schema before generation.
- Outcomes (company-reported, first-party): First-shot acceptance rate for generated SQL rose "from 20% to above 40%"; a "35% improvement in task completion speed for writing SQL queries using AI assistance." Source: https://medium.com/pinterest-engineering/how-we-built-text-to-sql-at-pinterest-30bad30dabff (company-reported). Follow-on work on unified context-intent embeddings: https://medium.com/pinterest-engineering/unified-context-intent-embeddings-for-scalable-text-to-sql-793635e60aac (company-reported).
- Relevance to Baker's Dozen: Confirms that table/column retrieval (not a bigger model) is what moves accuracy, and that "first-shot acceptance" is a more honest success metric than raw benchmark accuracy.

## Case study: Swiggy Hermes / Hermes V3 (Indian quick-commerce, most relevant)

- What they built: Hermes, an in-house generative-AI workflow where a user asks a question in plain English in Slack, gets generated SQL, and the system auto-executes it and returns results. V3 turned it from a text-to-SQL helper into a conversational "AI data analyst" with multi-turn memory.
- Stack/architecture: Snowflake as the warehouse and as the store of historical executed SQL; a vector-based prompt-retrieval system that finds similar past queries and injects them as few-shot examples; a notable SQL2Text pipeline that uses large-context Claude models to turn existing validated SQL plus business context into natural-language prompts for the retrieval index. V3 adds a ReAct-style agentic orchestrator that breaks complex questions into steps, an explanation layer that surfaces assumptions and assigns confidence scores, and governance (role-based access control, SSO, ephemeral replies, audit logs). Delivered in Slack.
- Outcomes: SQL generation accuracy improved "from 54% to 93%" with V3 (Swiggy-reported, summarized by InfoQ): https://www.infoq.com/news/2026/01/swiggy-hermes-conversational-ai/ (independently reported, summarizing company claims). Earlier V1 reporting describes "hundreds of users" answering "several thousand queries" with average turnaround under 2 minutes (company-reported): https://bytes.swiggy.com/hermes-a-text-to-sql-solution-at-swiggy-81573fb4fb6e and V3 detail: https://bytes.swiggy.com/hermes-v3-building-swiggys-conversational-ai-analyst-a41057a2279d (company-reported).
- Relevance to Baker's Dozen: This is the closest analog available. Same business (Indian quick-commerce), same warehouse choice many D2C brands make (Snowflake), and a clever low-cost trick: bootstrap the example library by reverse-generating questions from SQL the analysts already trust. The confidence-score-plus-explanation layer is exactly what builds leadership trust.

## Case study: DoorDash AskDataAI and Transaxle

- What they built: AskDataAI, an internal natural-language data assistant that translates plain-English questions into SQL optimized for the right compute engine. Transaxle is a SQL-translation service (built with Databricks) that gives interoperability across engines, and DoorDash plans an MCP server to sit between AskDataAI and Transaxle so it can target Snowflake, Databricks, and Trino.
- Stack/architecture: LLM assistant plus a SQL-dialect translation layer plus a model-context-protocol bridge across multiple query engines. Earlier work also uses LLM-generated consumer/merchant "profiles" to reduce reliance on SQL for qualitative insight.
- Outcomes: Largely described as in-development; no hard self-serve accuracy/time metrics were published at the time of research. Treat as directional. Sources: https://careersatdoordash.com/blog/doordash-sql-dialects-unified-translator/ and https://careersatdoordash.com/blog/doordash-profile-generation-llms-understanding-consumers-merchants-and-items/ (company-reported).
- Relevance to Baker's Dozen: Useful as the multi-engine, MCP-mediated pattern if Baker's Dozen ends up with more than one data store (e.g., GobbleCube exports plus a warehouse).

## Case study: Instacart Ava (internal AI assistant, adoption pattern)

- What they built: Ava, an internal assistant on GPT-4/GPT-3.5, started as a hackathon project. Used for code, comms, and building internal AI tools; it is a general productivity assistant rather than a dedicated text-to-SQL/BI tool.
- Outcomes (company-reported): Over half of employees use it monthly and 900+ weekly. Source summary: https://www.zenml.io/llmops-database/building-and-scaling-an-enterprise-ai-assistant-with-gpt-models (independently aggregated from Instacart materials).
- Relevance to Baker's Dozen: Evidence that internal AI adoption scales fast when it lives where people already work (Slack/web) and starts small. Not a BI proof point on its own.

## Case study: Wealthsimple LLM Gateway (governance pattern)

- What they built: An internal LLM gateway/platform so employees can use generative AI safely. Features include PII redaction, self-hosted models, and RAG. Open-sourced.
- Outcomes (company-reported): Used by over 50% of employees, 2,200+ daily messages, and 72,000+ requests since the April 2023 internal launch. Source: https://engineering.wealthsimple.com/get-to-know-our-llm-gateway-and-how-it-provides-a-secure-and-reliable-space-to-use-generative-ai (company-reported).
- Relevance to Baker's Dozen: A template for the governance/guardrail layer (PII handling, access control, audit) that should wrap any leadership-facing data assistant, even though Wealthsimple's gateway is not itself a BI tool.

---

## Enabling vendors and their published customer stories

The client already runs Power BI, so the Microsoft path is covered in most depth. For every vendor below, the natural-language quality depends on a governed semantic model; that is the recurring theme.

### Microsoft Power BI Copilot and Microsoft Fabric (client's existing stack)

- Capability: Copilot in Fabric is generally available in the Power BI experience. It can generate report pages from a prompt, write narrative summaries, and answer questions in conversational language; Fabric "data agents" can be built over your data and consumed from Copilot in Power BI, Microsoft 365 Copilot, Copilot Studio, and via MCP endpoints. Docs: https://learn.microsoft.com/en-us/fabric/fundamentals/copilot-fabric-overview and https://learn.microsoft.com/en-us/fabric/data-science/data-agent-copilot-powerbi (vendor docs).
- Pricing access point: Since April 2025 Copilot is available on paid SKUs from F2 (about $262/month) rather than the previous F64 minimum (about $8,384/month), per a consulting writeup: https://www.epcgroup.net/power-bi-copilot-readiness-enterprise-guide (secondary/consulting; verify current pricing with Microsoft directly).
- Outcomes: Hard, named, quantified customer outcomes were thin in public sources. A consulting firm (EPC Group) claims analysts become "3-5x" more productive across "40+ enterprise clients" once Copilot is configured (secondary/consulting, not independently verified): same EPC URL above. Microsoft and partners repeatedly warn that Copilot "without optimization" of the semantic model leads to low adoption and inaccurate results. Treat the 3-5x as a vendor-ecosystem claim, not verified fact.
- Relevance to Baker's Dozen: Lowest-friction starting point because it reuses existing Power BI datasets. The catch is that quality depends entirely on well-modeled, well-named Power BI semantic models, so the warehouse + semantic-layer work is a prerequisite, not optional.

### Snowflake Cortex Analyst

- Capability: A managed LLM service that answers plain-language questions against Snowflake data. Its accuracy comes from a semantic model (a YAML file encoding business context and metric definitions that sits beside the schema). It runs inside Snowflake and respects existing RBAC, masking, and row-level policies. Docs: https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst (vendor docs). Snowflake markets high text-to-SQL accuracy, but specific independently verified end-customer metrics were not found in this research; named adopters such as Siemens Energy and Nissan are cited by Snowflake for Cortex agents (vendor-claimed).
- Relevance to Baker's Dozen: The semantic-model-as-YAML approach is the cleanest illustration of "define your metrics once, then let AI query them." If the warehouse lands on Snowflake (common for D2C), this is the native conversational layer.

### Databricks AI/BI Genie

- Capability: Conversational analytics over a Databricks lakehouse, generally available, with Conversation APIs so Genie can be embedded into tools like Microsoft Teams. Governance via Unity Catalog. Product/blog: https://www.databricks.com/blog/aibi-genie-now-generally-available (vendor).
- Customer stories (vendor-claimed, with named customers and quotes):
  - The AA: integrated Genie into Microsoft Teams, trained it on "golden questions" from trading teams, validated responses against existing Power BI dashboards, and used Unity Catalog RBAC. Claimed up to 70% reduction in routine-query resolution time. Quote from Matt Sanderson, Head of Data Products for Channels: "Genie has been a game changer ... data in seconds rather than hours or days." Source: https://www.databricks.com/customers/the-aa/ai-bi-genie-api (vendor-claimed).
  - HP: marketing, merchandising, and pricing teams moved from static reporting to self-service via Genie in Teams. Source: https://www.databricks.com/customers/hp/ai-bi-genie (vendor-claimed).
  - Premier Inc: claims Genie generates complex SQL up to 10x faster than by hand, with plans to scale to as many as 20,000 users; Etihad's finance team claims month-long scenarios now run in real time. Source: https://www.databricks.com/blog/data-intelligence-action-100-data-and-ai-use-cases-databricks-customers (vendor-claimed).
- Relevance to Baker's Dozen: The AA is the most transferable: golden questions plus validation against trusted dashboards plus catalog-level governance, delivered in the chat tool people already use. That recipe is directly copyable.

### ThoughtSpot Sage and Spotter (retail/CPG)

- Capability: Sage is a natural-language search layer combining foundation models with ThoughtSpot's own ranking (SpotIQ). Spotter is a retail/CPG-specific agentic analytics offering covering inventory, sell-through, promotions, and replenishment. Retail/CPG page: https://www.thoughtspot.com/solutions/retail-cpg-analytics (vendor). Customer example: Act-On claims it recouped the embedding cost within 30 days via revenue gains. Source: https://www.thoughtspot.com/resources/case-study/act-on (vendor-claimed).
- Relevance to Baker's Dozen: The promotion-lift and sell-through use cases map almost one-to-one onto quick-commerce questions ("which Blinkit promo drove the most incremental units in Bangalore last week").

### Google Looker plus Gemini (Conversational Analytics)

- Capability: Conversational Analytics in Looker is generally available; it is grounded in Looker's semantic layer (LookML), so every metric and field is centrally defined and consistent. A data agent can query across multiple Explores, and there is a Conversational Analytics API for custom apps. Source: https://cloud.google.com/blog/products/business-intelligence/looker-conversational-analytics-now-ga (vendor). Specific named-customer outcome metrics were not found in this research.
- Relevance to Baker's Dozen: Strongest articulation of "the semantic layer is the moat." If they standardize metric definitions in LookML, the NL answers stay consistent across every question.

### Salesforce Tableau Pulse / Tableau Agent

- Capability: Tableau Pulse proactively pushes personalized metric digests and anomaly explanations in natural language; the conversational Q&A piece is now branded Tableau Agent. Source: https://www.tableau.com/blog/tableau-metrics-and-natural-language-query-evolve-tableau-pulse (vendor). Engineering writeup on building reliable LLM summaries: https://www.salesforce.com/blog/tableau-pulse/ (vendor-reported, useful on guardrails).
- Relevance to Baker's Dozen: The "push insights, do not wait to be asked" model fits a busy leadership team that will not log in daily.

### dbt Semantic Layer plus LLM (the architecture proof)

- This is the strongest single piece of evidence for why the semantic layer matters. dbt Labs ran a public benchmark (the ACME Insurance benchmark originally from Sequeda et al. at data.world: 11 questions, each run 20 times across models) comparing raw text-to-SQL against semantic-layer-grounded querying.
- Numbers (vendor-run benchmark, dbt Labs; methodology public; built on an academic benchmark):
  - GPT-4 (Nov 2023): text-to-SQL 32.7% vs semantic layer 60.5%.
  - Claude Sonnet 4.6 (2026): text-to-SQL 90.0% vs semantic layer 98.2%.
  - GPT-5.3 Codex (2026): text-to-SQL 84.1% vs semantic layer 100.0%.
  - For questions inside the semantic model's scope, accuracy approaches or hits 100% because SQL is generated from governed metric definitions, not inferred. Source: https://docs.getdbt.com/blog/semantic-layer-vs-text-to-sql-2026 (vendor-run, public methodology).
- Relevance to Baker's Dozen: This is the line to show leadership. Even with frontier models, the semantic layer is the difference between "usually right" and "trustworthy," and it converts a wrong-but-confident answer into a clean error you can catch.

---

## Architecture pattern: what makes conversational BI succeed

Every success above shares the same skeleton. In order:

1. Central warehouse as the single source. One governed store (Snowflake, Databricks, Fabric/OneLake, BigQuery) that the GobbleCube and Power BI telemetry feed into. Without this, the AI is querying inconsistent silos.
2. Semantic / metrics layer on top. Business definitions (what "revenue," "active SKU," "fill rate," "incremental lift" mean) encoded once, centrally. This is the highest-leverage component (see the dbt benchmark). Implementations: Snowflake semantic model YAML, LookML, dbt Semantic Layer, Power BI semantic models.
3. Retrieval of curated example queries (RAG). Ground the model in validated past SQL and the right tables/columns before it generates anything. Uber (SQL samples + table/column agents), Pinterest (table retrieval via OpenSearch), and Swiggy (vector retrieval over historical Snowflake SQL, seeded by SQL2Text) all do this. It moves accuracy more than a bigger model.
4. Domain scoping. Narrow the model to a business area before it answers (Uber's "workspaces"). Reduces tokens and ambiguity.
5. Agentic orchestration. Break a complex question into steps (Swiggy's ReAct loop, Uber's multi-agent intent/table/column pipeline) rather than one-shot generation.
6. Governance and access control. RBAC, row-level security, masking, SSO, audit logs, all inherited from the warehouse (Cortex Analyst, Unity Catalog at The AA, Swiggy's RBAC/SSO/audit).
7. Trust surface. Show the generated SQL or assumptions, attach a confidence score, and validate against existing trusted dashboards (Swiggy's explanation layer; The AA validating against Power BI). This is what gets leadership to act on answers.
8. Evaluation harness. A golden-question test set scored continuously (Uber's intent/table-overlap/execution/similarity metrics). You cannot improve what you do not measure.
9. Delivery where people already work. Slack (Swiggy, Uber-style), Teams (The AA, HP), or the existing BI tool. Adoption follows convenience.

## Why some succeed and some fail

What goes wrong (documented failure modes):

- No semantic layer, so the model guesses metric definitions. Raw text-to-SQL on large enterprise schemas (roughly 1,000 columns, 54 tables) lands around 30-36% accuracy with even top performers near 69.65% on a curated benchmark (secondary, independently summarized; verify against the underlying study): https://datalakehousehub.com/blog/2026-05-semantic-layers-text-to-sql/ and https://promethium.ai/guides/enterprise-text-to-sql-accuracy-benchmarks-2/ (secondary). The dbt benchmark's 32.7% for GPT-4 in 2023 is the cleanest data point.
- Plausible-but-wrong answers. The dangerous failure is not an error message, it is a confident, wrong number that looks trustworthy. Omni and dbt both stress this; Uber states hallucination is unsolved. Source: https://omni.co/blog/why-text-to-sql-fails (independently reported / vendor-neutral).
- Semantic disagreement across teams. When marketing's "customer" differs from finance's "customer," no text-to-SQL system is right for everyone until the definition is encoded centrally.
- Dirty or inconsistent data. Garbage in the warehouse becomes confident garbage out.
- Non-determinism without guardrails. Same question, different SQL (Uber reports about 5% run-to-run variance as normal). You need validation and confidence signals.
- No governance, so trust never forms. If users cannot tell what the AI accessed or whether they were allowed to see it, leadership will not rely on it.
- Tool dropped in without semantic-model prep. Microsoft's own guidance and partners note Copilot deployed on unprepared models leads to low adoption and users reverting to manual reporting.

What separated the winners: a governed semantic layer, curated golden queries used as few-shot grounding, domain scoping, warehouse-inherited governance, a visible confidence/explanation surface, validation against already-trusted dashboards, a continuous eval set, and delivery inside existing chat tools.

---

# Thread B: Showing up in AI answers (AEO / GEO)

When a shopper asks an AI "best protein-rich cookies in India" or "healthiest packaged bread," the answer is assembled, not ranked. The job shifts from ranking one page to being mentioned consistently across the sources the AI trusts.

How AI answers pick brands (what is known):

- It is about frequency, not a fixed position. A brand's visibility is how often it appears across many responses to many prompts. AI answers are non-deterministic, so the same question yields different answers each time. Source: https://searchengineland.com/what-is-generative-engine-optimization-geo-444418 (independently reported).
- Models look for agreement across independent sources. If a product shows up consistently across Reddit, YouTube, industry publications, review sites (G2/Trustpilot type), and the brand's own site, with consistent positioning, the model gains confidence to recommend it. Attributed to Profound and Semrush analysis (secondary, vendor research): same Search Engine Land URL.
- Recency matters. Citations to a page reportedly drop off sharply once content is more than about three months old (secondary, GEO-vendor claim; not independently verified): https://llmrefs.com/generative-engine-optimization (secondary).
- Citations are volatile. Between 40% and 60% of cited sources change month to month across tracked prompts (Semrush AI Visibility Index, analysis of about 2,500 prompts; vendor research): cited within https://searchengineland.com/what-is-generative-engine-optimization-geo-444418.

The foundational academic study (most credible source in this thread):

- "GEO: Generative Engine Optimization," Aggarwal, Murahari, et al. (Princeton, Georgia Tech, Allen Institute, IIT Delhi), accepted at KDD 2024. They built GEO-bench (10,000 queries across nine datasets) and tested content tactics. Headline: optimizations boosted source visibility by up to 40% (on the Position-Adjusted Word Count metric). Best-performing, low-effort tactics: adding relevant Quotations (about +27.8%), Statistics (about +25.9%), Fluency optimization (about +25.1%), and citing Sources (about +24.9%). Keyword stuffing showed negligible gains. Source: https://arxiv.org/abs/2311.09735 and full text https://ar5iv.labs.arxiv.org/html/2311.09735 (academic).

Practical tactics for a D2C/CPG brand (workshop-ready):

- Entity clarity. Use the same brand and product descriptions everywhere (own site, marketplace listings, LinkedIn, Crunchbase, review sites) and add structured data (JSON-LD/schema) that matches the visible page. Make the category unambiguous ("high-protein cookies," not just "snacks").
- Write for extraction. Self-contained paragraphs, main point first, specific facts and numbers (grams of protein, ingredients, certifications) rather than vague claims. The GEO study shows stats and quotes lift visibility.
- Be present where AI trusts. Reddit threads (including India-specific subreddits), YouTube reviews/tutorials, podcasts, and earned mentions in publications. Reddit, LinkedIn, and YouTube ranked among the top cited sources for top LLMs in late 2025 (Semrush, secondary).
- Earn reviews and third-party mentions. Encourage genuine reviews on the review sites and marketplaces shoppers and AIs both read; pursue press and creator coverage.
- E-E-A-T signals. Named authors/founders, demonstrated expertise, transparent sourcing.
- Monitor share of voice. Track how often the brand is mentioned (and the sentiment) across ChatGPT, Gemini/AI Overviews, and Perplexity, and which prompts trigger mentions. Note the displacement risk: in some categories AI recommends competitors a large share of the time even when your brand is cited (finance example: competitors recommended 69% of the time, per Search Engine Land citing Semrush).

Traffic and conversion context (treat as directional, mostly secondary/vendor):

- AI referral traffic is still roughly 1% of total web traffic but growing fast. Adobe reported AI-referred traffic converting about 42% better than non-AI traffic by early 2026 (Adobe Analytics, vendor-reported), and retail AI-sourced traffic grew sharply year over year (secondary). Sources: https://digiday.com/media/in-graphic-detail-the-state-of-ai-referral-traffic-in-2025/ and https://upgrowth.in/ai-shopping-d2c-traffic-2026/ (secondary aggregators). The specific per-platform conversion figures floating around (ChatGPT about 15.9%, Perplexity about 10.5%, etc.) come from secondary trackers and should not be quoted as fact without the primary study.

Honest limitation: most GEO/AEO numbers outside the Princeton paper come from vendor or aggregator research, not peer-reviewed work. Use the academic study for credibility and the vendor tactics as a practical checklist, not as guaranteed outcomes.

---

## Patterns and takeaways for Baker's Dozen

- Build the semantic layer first, then add the chat. The dbt benchmark (32.7% raw text-to-SQL vs 98-100% semantic-layer-grounded) is the clearest proof that the warehouse plus a governed metrics layer is the project, and the natural-language interface is the easy last mile.
- Copy Swiggy, not a Silicon Valley giant. Same business and geography. Bootstrap an example-query library by reverse-generating questions from SQL your analysts already trust (the SQL2Text trick), then retrieve those as few-shot grounding. It took Swiggy from 54% to 93% accuracy.
- Use the Power BI/Fabric path for speed, but do not expect magic from Copilot on unprepared models. The near-term win is Copilot over well-modeled Power BI semantic datasets plus Fabric data agents; the prerequisite work is metric definitions and clean models.
- Ship a trust surface from day one. Show the generated query or assumptions, attach a confidence score, and validate answers against an existing trusted dashboard (the Swiggy and The AA pattern). Leadership acts on answers they can sanity-check.
- Deliver it where leaders already are. Slack or Teams beats a new dashboard nobody opens. Start with 10-20 golden questions the leadership team actually asks, and measure first-shot acceptance.
- Inherit governance, do not rebuild it. RBAC, row-level security, and audit logging should come from the warehouse layer (Unity Catalog / Snowflake policies), wrapped with PII handling like Wealthsimple's gateway.
- For AEO/GEO, optimize for consistent presence, not a single ranking. Make Baker's Dozen show up with the same positioning and hard facts (protein content, ingredients, certifications) across Reddit India, YouTube reviews, marketplace listings, and structured own-site pages. The academic GEO study says quotes, stats, and citations can lift AI-answer visibility by up to 40%.
- Treat AEO metrics skeptically in the workshop. Lean on the one peer-reviewed source (Princeton GEO) for credibility and present vendor traffic/conversion numbers as directional. The honest message: AI shopping referrals are small today but growing and convert well, so it is worth starting now, cheaply.

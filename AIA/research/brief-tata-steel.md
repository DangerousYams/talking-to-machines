# Tata Steel: How They Built India's Most-Cited Industrial AI Program

## The one-line approach
**Build the road before you build the car.** Tata Steel spent 2018 to 2021 building infrastructure (data lake, control rooms, an Analytics Academy, governance) before letting use cases proliferate. Today there are 600+ AI tools and the road is paved enough that frontline managers can build their own agents on a low-code platform.

## How to talk about this in 30 seconds
Tata Steel's CEO TV Narendran set a target in 2018: lead digital steelmaking by 2025 and pull two billion dollars of EBITDA out of digital. They started not at the flagship Jamshedpur works but at the new Kalinganagar plant, because Jamshedpur was a hundred years old and the sensor data was a mess. The first real win was unglamorous: a model that predicted molten steel temperature better. It made seventy to eighty million dollars in phase one and got Kalinganagar named the first Indian plant on the World Economic Forum's Lighthouse list. From there they scaled by building infrastructure first, use cases second. In April 2026 they announced a Google Cloud partnership and have already deployed three hundred agents in nine months.

## Origin
- **2013:** TV Narendran becomes MD India and SE Asia, then global CEO. Digital is one of his four parallel tracks alongside agility, safety and sustainability. He owns it personally; it is not delegated.
- **2017:** Mission 2025 set. First operational analytics pilots launched September 2017 at Kalinganagar (the new plant, deliberately chosen for cleaner instrumentation).
- **January 2018:** Three IT divisions merged into "One IT." A new Business Transformation through Digital Solutions function created, headed by **Sarajit Jha** (a TAS officer). McKinsey brought in as "Value Discovery Consultants."
- **Group CIO:** **Jayanta Banerjee**, ex-TCS Energy & Resources head with ~30 years inside the Tata group. Owns the technology stack. Two-in-a-box leadership with Jha (who owns the business P&L).

## What worked
1. **Kalinganagar superheating model** (the first real win, 2017 to 2019). 75% accuracy on molten steel temperature, $70M to $80M in value, 2 to 3 ppt EBITDA uplift. Triggered the WEF Lighthouse designation in July 2019, the first Indian plant ever.
2. **Three WEF Global Lighthouse plants:** Kalinganagar, IJmuiden Netherlands, Jamshedpur. Tata is the only steelmaker globally with three.
3. **Integrated Remote Operations Centre (iROC) Jamshedpur** with sub-centres for raw materials, maintenance, sinter and pellet. Monitors 15+ plants and mines, 250+ digital twin models.
4. **Aashiyana** (consumer steel platform, launched 2018): $100M+ incremental revenue and $30M+ EBITDA in year one. They now target ₹7,000 cr GMV from it. Proof that digital was not just a manufacturing story.
5. **Mission 2025 hit its $2B EBITDA target by FY25.** Reportedly $1.4B by 2020 alone. 600 AI tools. 11.2 PB of data. 558 active models.

## What didn't (the scars)
1. **Jamshedpur was the first attempt and had to be abandoned.** The 100-year-old flagship's instrumentation, data quality and SCADA fragmentation made models unreliable. They relocated the program to greenfield Kalinganagar. Officially: "we chose to start where the data was best." Honestly: the original plan had to be rewritten.
2. **Lights-out smart factories slipped from a 2025 goal to "the next three years."** Banerjee and Jha both publicly named this as the largest unmet ambition. The 5G-enabled fully autonomous factory has not been achieved.
3. **Operator distrust took 3 to 4 years to overcome** while the technology took 12 to 18 months to deploy. Many early models were quietly retired because operators ignored them. They had to systematically force "show your reasoning, allow override, prove accuracy over months" into every deployment.
4. **Talent attrition** forced a strategy correction. Data scientists trained at the Analytics Academy were poached by tech companies. Tata had to switch from "hire 50 PhDs" to investing in "translators" (operations engineers who learn analytics, rather than data scientists who learn steel).

## What's next (2025 to 2026)
- **Google Cloud agentic AI partnership, announced 22 April 2026.** 300+ specialised agents deployed in nine months on a low-code internal platform called **Zen AI** (Google ADK + BigQuery + Cloud Storage) plus the **Tata Steel Digital Assistant**. Named agents include **Safety EyeQ** (live video safety compliance), **Asset Sphere** (predictive maintenance), and complaint-routing/contract-analysis agents. Quantified results so far: 70% of HR helpdesk tickets resolved autonomously, 50% reduction in customer complaint turnaround.
- **DigECA**, a B2B platform for MSME steel buyers (2025). The Aashiyana playbook ported from B2C to small businesses.
- **72-hour steel delivery** is the new operational target Banerjee has been quoted on, framed as "becoming the Zepto/Blinkit of industrial steel."

## Quotable lines for the meeting
> *"The idea is to build the road before you build the car."*
> — **Jayanta Banerjee, Group CIO, Tata Steel**

This single sentence is why their program scaled where most Indian industrial AI programs stall. It is also exactly the right line for a foundry owner: it reframes "should I do AI?" as "do I have the data infrastructure to make AI worth doing?"

> *"With stronger data capture, IIoT integration, and analytics, we are moving from reactive to predictive operations."*
> — Tata Steel narrative across the 2024 to 2025 reports.

## How Tata's path differs from JSW and Adani
- **vs JSW:** Tata built the highway first, then let cars on it. JSW built cars first ("connected factories" mindset, ~100 fast use-case pilots). Both work; both took ~7 years; Tata's bet is more leveraged for an agentic future.
- **vs Adani:** Tata had no choice but to figure it out themselves; there was no Tata Group hyperscaler bench in 2018. Adani inherited a cement business and could ride a $100B Group-level data centre commitment. Tata's program is older, deeper, more battle-tested.

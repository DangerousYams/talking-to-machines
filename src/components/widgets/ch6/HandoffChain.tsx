import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface AgentOutput {
  text: string;
}

interface PresetData {
  topic: string;
  researcher: AgentOutput;
  writer: AgentOutput;
  editor: AgentOutput;
}

const presetsData: PresetData[] = [
  {
    topic: 'Climate change solutions',
    researcher: {
      text: `Key findings from 8 sources:

1. RENEWABLE ENERGY: Solar costs dropped 89% since 2010. Wind now cheapest new electricity in 2/3 of world. Battery storage costs falling 15% annually.

2. CARBON CAPTURE: Direct air capture plants operational in Iceland (Orca) and Texas. Current cost: $250-600/ton. Needs to reach $100/ton to scale.

3. POLICY WINS: EU Carbon Border Tax (2026), US Inflation Reduction Act ($369B clean energy), China's carbon market (largest globally).

4. BEHAVIORAL SHIFTS: Plant-based diets could reduce food emissions 70%. Remote work cut transport emissions 5-10% in adopting cities.

5. GAPS: Developing nations need $1T/year in climate finance (currently getting ~$100B). Heavy industry (steel, cement) still lacks viable green alternatives at scale.

Sources: IPCC AR6, IEA World Energy Outlook, Nature Climate Change, Bloomberg NEF.`,
    },
    writer: {
      text: `# Climate Solutions: What's Actually Working

The climate crisis has a strange paradox: we've never had more reasons for despair — or more reasons for hope.

## The Energy Revolution
Solar power costs have plummeted 89% since 2010, making it cheaper than coal in most of the world. Wind energy now provides the cheapest new electricity in two-thirds of countries. Meanwhile, battery storage costs are falling 15% per year, solving the "what happens when the sun doesn't shine" problem.

## Beyond Energy
The solutions extend beyond power grids. Carbon capture technology, once dismissed as science fiction, is now operational — plants in Iceland and Texas are literally pulling CO2 from the air. Plant-based diets could slash food-related emissions by 70%.

## The Policy Momentum
Governments are finally putting money behind ambition. The US Inflation Reduction Act dedicates $369 billion to clean energy. The EU's Carbon Border Tax will reshape global trade. China operates the world's largest carbon market.

## The Hard Truth
Progress is real but insufficient. Developing nations need $1 trillion annually in climate finance — they're getting a tenth of that. Heavy industries like steel and cement still lack scalable green alternatives. The race between solutions and warming continues.

The tools exist. The question is speed.`,
    },
    editor: {
      text: `## Editorial Review

**Overall:** Strong draft. Clear structure, good data integration. Tone strikes the right balance between urgency and hope.

**Strengths:**
- Opening paradox is compelling — hooks the reader immediately
- Data points are specific and sourced (89% cost drop, $369B)
- "The tools exist. The question is speed." is an excellent closing line

**Suggested Revisions:**
1. PARAGRAPH 1: "Strange paradox" is slightly redundant (paradoxes are inherently strange). Try: "The climate crisis contains a paradox..."
2. SECTION 2: "Once dismissed as science fiction" — add when this shift happened for credibility. Also note the current cost ($250-600/ton) to ground it.
3. SECTION 4: The jump from policy wins to "hard truth" is abrupt. Add a one-sentence transition.
4. MISSING: No mention of individual action vs. systemic change debate. Worth a brief nod.

**Fact-check flags:**
- Verify "2/3 of countries" claim for wind — source says "2/3 of the world" which may mean population, not countries. Clarify.

**Verdict:** One revision away from publication-ready.`,
    },
  },
  {
    topic: 'History of video games',
    researcher: {
      text: `Key findings from 10 sources:

1. ORIGINS (1950s-70s): Tennis for Two (1958), Spacewar! (1962), Pong (1972). Nolan Bushnell founded Atari — first major game company.

2. GOLDEN AGE (1978-83): Space Invaders, Pac-Man, Donkey Kong. Arcades earned $8B/year (more than Hollywood). Crash of 1983: market dropped 97% due to oversaturation.

3. CONSOLE WARS (1985-2000): Nintendo revived industry with NES. Sega Genesis vs. SNES. PlayStation entered 1994 — shifted to disc-based media. N64 introduced 3D analog control.

4. ONLINE ERA (2000-2010): Xbox Live (2002) brought online multiplayer mainstream. World of Warcraft hit 12M subscribers. Mobile gaming began with Snake (Nokia) → iPhone App Store (2008).

5. MODERN ERA (2010-now): Free-to-play model (Fortnite, $9B revenue). Indie renaissance (Minecraft, Undertale). VR attempts (Oculus 2016). Cloud gaming (Xbox Game Pass). Esports now $1.5B industry.

Sources: Computer History Museum, Smithsonian exhibit, Kotaku, IEEE Annals.`,
    },
    writer: {
      text: `# Press Start: A Brief History of Video Games

It started with a bouncing dot.

## The Spark (1950s-1970s)
In 1958, physicist William Higinbotham built "Tennis for Two" on an oscilloscope — not to launch an industry, but to make a boring lab open house less boring. Fourteen years later, Pong turned that same concept into a cultural phenomenon and Atari into the world's fastest-growing company.

## The Golden Age and the Crash
By 1982, arcades were pulling in $8 billion a year — more than Hollywood. Space Invaders, Pac-Man, and Donkey Kong became household names. Then the market collapsed. In 1983, a flood of terrible games (including the infamous E.T. cartridge) caused a 97% crash. Many declared video games a dead fad.

## The Resurrection
A Japanese playing card company disagreed. Nintendo's NES arrived in 1985 with strict quality controls and a plumber named Mario. The "console wars" followed — Sega vs. Nintendo, then Sony's PlayStation, which shifted games from cartridges to CDs and from kids' toy to mainstream entertainment.

## The Connected World
Xbox Live in 2002 proved that the future of gaming was online. World of Warcraft gathered 12 million subscribers into a virtual world. Then the iPhone arrived, and suddenly everyone with a phone was a gamer.

## The New Reality
Today, Fortnite has earned over $9 billion — and it's free to download. Minecraft, made by one person, became the best-selling game ever. Esports fills stadiums. The industry that started with a bouncing dot now generates more revenue than film and music combined.`,
    },
    editor: {
      text: `## Editorial Review

**Overall:** Excellent narrative flow. The "bouncing dot" bookend is a nice structural touch. Engaging for a teen audience without being condescending.

**Strengths:**
- "Not to launch an industry, but to make a boring lab open house less boring" — perfect tone
- E.T. reference adds texture without over-explaining
- "A Japanese playing card company disagreed" — great beat

**Suggested Revisions:**
1. SECTION 1: Mention Spacewar! (1962) — it's the missing link between Tennis for Two and Pong, and it was made by MIT students (relatable for the audience).
2. SECTION 3: "Strict quality controls" is vague. The Nintendo Seal of Quality is a concrete, visual detail — use it.
3. SECTION 5: "Made by one person" — Markus Persson (Notch). Name him. It reinforces the "one person can change everything" theme that resonates with teens.
4. MISSING: No mention of mobile gaming's explosion (Candy Crush, Pokemon Go). This is a huge gap given the target audience literally grew up on mobile games.

**Fact-check flags:**
- "More revenue than film and music combined" — this is widely cited but verify the specific year/source. 2023 data puts games at ~$184B vs. film $100B + music $28B, so it checks out.

**Verdict:** Add the mobile gaming paragraph and name-drop Notch. Then it's ready.`,
    },
  },
  {
    topic: 'How vaccines work',
    researcher: {
      text: `Key findings from 7 sources:

1. IMMUNE BASICS: Body has innate immunity (general) and adaptive immunity (specific). Adaptive immunity creates antibodies and memory cells that "remember" pathogens.

2. VACCINE MECHANISM: Introduces a harmless version of a pathogen (or piece of one). Immune system responds, creates antibodies + memory B/T cells. If real pathogen arrives later, response is faster and stronger.

3. VACCINE TYPES:
   - Live attenuated: weakened virus (MMR, chickenpox)
   - Inactivated: killed virus (flu shot, polio IPV)
   - Subunit: just a protein piece (Hepatitis B, HPV)
   - mRNA: instructions to make a spike protein (COVID-19 Pfizer/Moderna)
   - Viral vector: harmless virus carries instructions (J&J COVID, some Ebola)

4. HERD IMMUNITY: When enough people are immune (typically 80-95%), disease can't spread easily. Protects those who can't be vaccinated (infants, immunocompromised).

5. HISTORY: Edward Jenner (1796) — cowpox to prevent smallpox. Smallpox eradicated 1980. Polio nearly eradicated (99.9% reduction). mRNA tech developed over 30 years before COVID application.

Sources: CDC, WHO, Nature Reviews Immunology, Johns Hopkins Bloomberg School.`,
    },
    writer: {
      text: `# How Vaccines Work: Your Immune System's Cheat Code

Your body is already incredible at fighting disease. Vaccines just give it a head start.

## The Immune System in 30 Seconds
When a pathogen — a virus or bacteria — enters your body, your immune system launches a counterattack. It creates antibodies, specialized proteins that lock onto the invader and neutralize it. Crucially, it also creates memory cells: immune cells that remember this specific pathogen for years, sometimes for life.

The problem? That first fight takes time. Days, sometimes weeks. And for dangerous diseases, that delay can be deadly.

## The Vaccine Shortcut
A vaccine introduces your immune system to a pathogen without making you sick. It might use a weakened version of the virus, a killed version, or even just a single protein from the virus's surface. Your immune system doesn't know the difference — it builds antibodies and memory cells as if facing the real thing.

Then, when the actual pathogen shows up, your body already has the playbook. Instead of starting from scratch, it responds in hours, not days.

## Five Flavors of Vaccine
Not all vaccines work the same way. Live attenuated vaccines (like MMR) use a weakened virus. Inactivated vaccines (like the flu shot) use a killed virus. Subunit vaccines (like HPV) use just one protein. The newest approach — mRNA vaccines, used for COVID-19 — skip the virus entirely. They send your cells a set of instructions to build one harmless piece of the virus, train the immune system on it, then the instructions dissolve.

## Why It's Not Just About You
Here's where it gets bigger than individual protection. When enough people in a community are immune — typically 80-95% — diseases can't spread easily. This "herd immunity" protects the people who can't be vaccinated: newborns, people with weakened immune systems, and others for whom vaccines aren't safe.

## A 200-Year Track Record
In 1796, Edward Jenner noticed that milkmaids who caught cowpox never got smallpox. His experiment led to the first vaccine — and eventually, in 1980, to smallpox being completely eradicated from Earth. Polio has been reduced by 99.9%. The mRNA technology behind COVID vaccines was developed over 30 years of research, not rushed in months.

Vaccines don't replace your immune system. They educate it.`,
    },
    editor: {
      text: `## Editorial Review

**Overall:** Excellent explainer. Clear, accurate, and well-paced for a teen audience. The "cheat code" framing is smart.

**Strengths:**
- "Your body already has the playbook" — great analogy
- mRNA explanation is the clearest I've seen at this level: "instructions to build one harmless piece... then the instructions dissolve"
- Herd immunity section smartly reframes from "you should" to "here's why it matters for others"
- Jenner milkmaid story is compelling

**Suggested Revisions:**
1. SECTION 1: "Specialized proteins that lock onto the invader" — add "like a key fitting a lock" for a concrete visual. Teens respond well to analogies.
2. SECTION 3: "Five Flavors" is fun but might trivialize. Consider "Five Types" with a brief note about why the variety exists (different diseases require different approaches).
3. SECTION 5: "Not rushed in months" is important but reads slightly defensive. Reframe: "When COVID arrived, 30 years of mRNA research meant scientists had a head start — like having studied for a test for decades."

**Fact-check flags:**
- "80-95%" herd immunity threshold — correct range. Measles is ~95%, polio ~80%. Consider noting this varies by disease.
- Verify "memory cells... sometimes for life" — true for some vaccines (measles) but not others (flu). Add nuance.

**Verdict:** Minor revisions. One pass and this is ready for publication.`,
    },
  },
];

type AgentStatus = 'idle' | 'working' | 'done';

export default function HandoffChain() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [researcherStatus, setResearcherStatus] = useState<AgentStatus>('idle');
  const [writerStatus, setWriterStatus] = useState<AgentStatus>('idle');
  const [editorStatus, setEditorStatus] = useState<AgentStatus>('idle');
  const [researcherText, setResearcherText] = useState('');
  const [writerText, setWriterText] = useState('');
  const [editorText, setEditorText] = useState('');
  const [handoff1, setHandoff1] = useState(false);
  const [handoff2, setHandoff2] = useState(false);
  const runningRef = useRef(false);

  const preset = selectedPreset !== null ? presetsData[selectedPreset] : null;

  const reset = () => {
    runningRef.current = false;
    setIsRunning(false);
    setResearcherStatus('idle');
    setWriterStatus('idle');
    setEditorStatus('idle');
    setResearcherText('');
    setWriterText('');
    setEditorText('');
    setHandoff1(false);
    setHandoff2(false);
  };

  const typeText = (
    fullText: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    speed: number = 8,
  ): Promise<void> => {
    return new Promise((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        if (!runningRef.current) {
          clearInterval(interval);
          resolve();
          return;
        }
        // Type in chunks for speed
        const chunk = fullText.slice(i, i + 3);
        i += 3;
        setter(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(interval);
          setter(fullText);
          resolve();
        }
      }, speed);
    });
  };

  const runChain = async () => {
    if (!preset) return;
    reset();
    await new Promise((r) => setTimeout(r, 100));
    setIsRunning(true);
    runningRef.current = true;

    // Researcher phase
    setResearcherStatus('working');
    await typeText(preset.researcher.text, setResearcherText);
    if (!runningRef.current) return;
    setResearcherStatus('done');

    // Handoff 1
    await new Promise((r) => setTimeout(r, 400));
    if (!runningRef.current) return;
    setHandoff1(true);
    await new Promise((r) => setTimeout(r, 600));
    if (!runningRef.current) return;

    // Writer phase
    setWriterStatus('working');
    await typeText(preset.writer.text, setWriterText);
    if (!runningRef.current) return;
    setWriterStatus('done');

    // Handoff 2
    await new Promise((r) => setTimeout(r, 400));
    if (!runningRef.current) return;
    setHandoff2(true);
    await new Promise((r) => setTimeout(r, 600));
    if (!runningRef.current) return;

    // Editor phase
    setEditorStatus('working');
    await typeText(preset.editor.text, setEditorText);
    if (!runningRef.current) return;
    setEditorStatus('done');
    setIsRunning(false);
  };

  const statusColors: Record<AgentStatus, string> = {
    idle: '#6B7280',
    working: '#F5A623',
    done: '#16C79A',
  };

  const statusLabels: Record<AgentStatus, string> = {
    idle: 'Idle',
    working: 'Working...',
    done: 'Done',
  };

  const agents = [
    { name: 'Researcher', icon: '\uD83D\uDD0D', color: '#7B61FF', status: researcherStatus, text: researcherText },
    { name: 'Writer', icon: '\u270D\uFE0F', color: '#16C79A', status: writerStatus, text: writerText },
    { name: 'Editor', icon: '\uD83D\uDD0E', color: '#F5A623', status: editorStatus, text: editorText },
  ];

  const handoffs = [handoff1, handoff2];
  const isMobile = useIsMobile();

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7B61FF, #16C79A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              The Handoff Chain
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              Three agents, one pipeline. Watch the research flow.
            </p>
          </div>
        </div>
      </div>

      {/* Topic selection */}
      <div style={{ padding: isMobile ? '1rem' : '1.25rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', background: 'rgba(26,26,46,0.015)' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7B61FF',
          display: 'block', marginBottom: 10,
        }}>
          Choose a Topic
        </span>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const, flexWrap: 'wrap' as const, gap: 8 }}>
          {presetsData.map((p, i) => (
            <button
              key={i}
              onClick={() => { setSelectedPreset(i); reset(); }}
              style={{
                padding: isMobile ? '0.65rem 1rem' : '0.5rem 1rem', borderRadius: 8, border: '1px solid',
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 0.25s', lineHeight: 1.4,
                minHeight: isMobile ? 44 : undefined,
                background: selectedPreset === i ? '#1A1A2E' : 'transparent',
                borderColor: selectedPreset === i ? '#1A1A2E' : 'rgba(26,26,46,0.1)',
                color: selectedPreset === i ? '#FAF8F5' : '#1A1A2E',
              }}
            >
              {p.topic}
            </button>
          ))}
        </div>
        {selectedPreset !== null && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={isRunning ? reset : runChain}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.3s', minHeight: 44,
                background: isRunning ? '#6B7280' : 'linear-gradient(135deg, #7B61FF, #16C79A)',
                color: 'white',
                boxShadow: isRunning ? 'none' : '0 4px 16px rgba(123,97,255,0.2)',
              }}
            >
              {isRunning ? 'Reset' : researcherStatus === 'done' && writerStatus === 'done' && editorStatus === 'done' ? 'Run Again' : 'Run Chain'}
            </button>
          </div>
        )}
      </div>

      {/* Agent lanes */}
      {selectedPreset !== null && (
        <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
          {agents.map((agent, i) => (
            <div key={agent.name}>
              {/* Handoff arrow between lanes */}
              {i > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px 0', opacity: handoffs[i - 1] ? 1 : 0.15,
                  transition: 'opacity 0.5s',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 16px', borderRadius: 20,
                    background: handoffs[i - 1]
                      ? 'linear-gradient(135deg, rgba(123,97,255,0.08), rgba(22,199,154,0.08))'
                      : 'transparent',
                    border: handoffs[i - 1] ? '1px solid rgba(123,97,255,0.15)' : '1px solid rgba(26,26,46,0.06)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                      letterSpacing: '0.05em', color: handoffs[i - 1] ? '#7B61FF' : '#6B7280',
                    }}>
                      HANDOFF
                    </span>
                    <span style={{ fontSize: 14 }}>\u2193</span>
                  </div>
                </div>
              )}

              {/* Agent lane */}
              <div style={{
                border: '1px solid',
                borderColor: agent.status === 'working' ? `${agent.color}40`
                  : agent.status === 'done' ? 'rgba(22,199,154,0.2)'
                  : 'rgba(26,26,46,0.06)',
                borderRadius: 12, overflow: 'hidden',
                transition: 'border-color 0.5s',
                boxShadow: agent.status === 'working' ? `0 0 20px ${agent.color}10` : 'none',
              }}>
                {/* Agent header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: agent.status === 'working' ? `${agent.color}08` : 'rgba(26,26,46,0.02)',
                  borderBottom: agent.text ? '1px solid rgba(26,26,46,0.04)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `${agent.color}15`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>
                      {agent.icon}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontSize: '0.95rem',
                      fontWeight: 700, color: '#1A1A2E',
                    }}>
                      {agent.name}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                    color: statusColors[agent.status],
                  }}>
                    {agent.status === 'working' && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: agent.color, display: 'inline-block',
                        animation: 'blink 1s ease-in-out infinite',
                      }} />
                    )}
                    {agent.status === 'done' && <span>\u2713</span>}
                    {statusLabels[agent.status]}
                  </div>
                </div>

                {/* Agent output */}
                {agent.text && (
                  <div style={{
                    padding: isMobile ? '0.75rem' : '1rem', maxHeight: isMobile ? '35dvh' : '40dvh', overflowY: 'auto' as const,
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    lineHeight: 1.7, color: '#1A1A2E',
                    whiteSpace: 'pre-wrap' as const,
                  }}>
                    {agent.text}
                    {agent.status === 'working' && (
                      <span style={{ animation: 'blink 0.8s ease-in-out infinite', color: agent.color }}>|</span>
                    )}
                  </div>
                )}

                {/* Idle state */}
                {!agent.text && agent.status === 'idle' && (
                  <div style={{
                    padding: '1.5rem 1rem', textAlign: 'center' as const,
                    color: '#6B7280', fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                    fontStyle: 'italic',
                  }}>
                    Waiting for input...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {selectedPreset === null && (
        <div style={{
          padding: isMobile ? '3rem 1rem' : '4rem 2rem', textAlign: 'center' as const, color: '#6B7280',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', margin: 0 }}>
            Select a topic above to see the handoff chain in action.
          </p>
        </div>
      )}

      {/* Insight */}
      {researcherStatus === 'done' && writerStatus === 'done' && editorStatus === 'done' && (
        <div style={{
          padding: isMobile ? '1rem' : '1.25rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
          background: 'linear-gradient(135deg, rgba(123,97,255,0.04), rgba(22,199,154,0.04))',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            fontStyle: 'italic', color: '#1A1A2E', margin: 0,
          }}>
            <span style={{ fontWeight: 600, color: '#7B61FF', fontStyle: 'normal' }}>Key insight: </span>
            The handoff documents &mdash; research notes and the draft &mdash; are the critical interface.
            Each agent is a specialist. What makes the chain work isn't any single agent's skill;
            it's the quality of what gets passed between them.
          </p>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

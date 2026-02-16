import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface BugRegion {
  text: string;
  bugType: string;
  severity: 'red' | 'yellow';
  explanation: string;
}

interface Challenge {
  level: string;
  levelLabel: string;
  prompt: string;
  badOutput: string;
  regions: BugRegion[];
  fixedPrompt: string;
  fixedOutput: string;
}

const bugTypes = ['Ambiguous', 'Contradictory', 'Missing context', 'Too many tasks', 'Leading question'];

const challenges: Challenge[] = [
  {
    level: 'easy',
    levelLabel: 'Easy',
    prompt: 'Write something about dogs. Make it short but also really detailed and comprehensive. Include everything important. Use a fun tone but keep it professional and formal.',
    badOutput: "Dogs are wonderful pets that have been companions to humans for thousands of years. They come in many breeds, sizes, and temperaments. Dogs require regular exercise, proper nutrition, veterinary care, and socialization. They are known for their loyalty, intelligence, and ability to form strong bonds with their owners.\n\nFrom small breeds like Chihuahuas to large breeds like Great Danes, there's a dog for every lifestyle. Training is important for all dogs, and positive reinforcement methods tend to work best.\n\nOverall, dogs make great additions to families who are prepared for the responsibility of pet ownership.",
    regions: [
      { text: 'Write something about dogs.', bugType: 'Ambiguous', severity: 'red', explanation: '"Something about dogs" could mean anything — a poem, a research paper, a product description. The AI has no idea what format or purpose you want.' },
      { text: 'Make it short but also really detailed and comprehensive.', bugType: 'Contradictory', severity: 'red', explanation: 'Short and comprehensive are opposites. The AI tries to satisfy both and ends up with a mediocre middle ground.' },
      { text: 'Include everything important.', bugType: 'Ambiguous', severity: 'yellow', explanation: '"Everything important" about dogs? That could fill a textbook. Without knowing the purpose, the AI has to guess what matters.' },
      { text: 'Use a fun tone but keep it professional and formal.', bugType: 'Contradictory', severity: 'red', explanation: 'Fun and formal pull in opposite directions. The result is a tone that\'s neither — it\'s just bland.' },
    ],
    fixedPrompt: 'Write a 150-word blog post introducing first-time dog owners to the three most important things to know before adopting a puppy. Tone: friendly and encouraging, like advice from an experienced friend.',
    fixedOutput: "So you're thinking about getting a puppy? Amazing. Here are three things nobody tells you until it's too late.\n\n**Puppies are land sharks.** Those tiny teeth are razor-sharp, and everything — your shoes, your couch, your fingers — is a chew toy. Stock up on actual chew toys before they come home, and start bite-inhibition training from day one.\n\n**Sleep deprivation is real.** Puppies need to go outside every 2-3 hours at first, including at night. It's like having a furry newborn. The good news: most dogs sleep through the night within a few weeks.\n\n**Socialization has a deadline.** The window between 3-14 weeks is critical. Expose your puppy to different people, sounds, surfaces, and (vaccinated) dogs during this period. A well-socialized puppy becomes a confident adult dog.\n\nThe rest? You'll figure it out together. That's the fun part.",
  },
  {
    level: 'medium',
    levelLabel: 'Medium',
    prompt: 'You are a helpful tutor. My student is struggling with fractions and also needs help preparing for the SAT math section and could you also explain the history of mathematics and recommend some good math textbooks? Make it engaging for a 10-year-old.',
    badOutput: "Hi there! Let's talk about fractions! Fractions are parts of a whole. For example, if you cut a pizza into 4 slices and eat 1, you've eaten 1/4 of the pizza.\n\nFor the SAT math section, you'll need to know algebra, geometry, and data analysis. Practice with official SAT prep books and take timed practice tests.\n\nMathematics has a rich history dating back to ancient civilizations. The Babylonians used a base-60 number system, and the Greeks made significant contributions through figures like Euclid and Pythagoras.\n\nSome recommended textbooks include:\n- 'Saxon Math' for fundamentals\n- 'The Art of Problem Solving' series\n- 'Princeton Review SAT Prep'\n\nRemember, math is all about practice and patience!",
    regions: [
      { text: 'My student is struggling with fractions and also needs help preparing for the SAT math section and could you also explain the history of mathematics and recommend some good math textbooks?', bugType: 'Too many tasks', severity: 'red', explanation: 'Four completely different tasks in one sentence. The AI can\'t do justice to any of them. Fractions help, SAT prep, math history, and textbook recommendations each deserve their own prompt.' },
      { text: 'You are a helpful tutor.', bugType: 'Ambiguous', severity: 'yellow', explanation: '"Helpful tutor" is too generic. A tutor for a 10-year-old learning fractions is very different from an SAT prep tutor. Which one?' },
      { text: 'Make it engaging for a 10-year-old.', bugType: 'Contradictory', severity: 'red', explanation: 'SAT prep is for 16-17 year olds. Math history is college-level content. You can\'t make all of this engaging for a 10-year-old because half of it isn\'t relevant to a 10-year-old.' },
    ],
    fixedPrompt: 'You are a patient, encouraging math tutor for a 10-year-old who finds fractions confusing. Explain how to add fractions with different denominators using a pizza analogy. Walk through one example step by step. Use short sentences and check for understanding after each step.',
    fixedOutput: "Okay, here's the deal with adding fractions. It's actually simpler than it looks.\n\nLet's say you ate 1/2 of a pizza yesterday, and 1/3 of a pizza today. How much total pizza did you eat?\n\n**Step 1: The slices need to be the same size.**\nRight now, \"half a pizza\" and \"a third of a pizza\" are cut differently. You can't just mash the numbers together. That's like saying 1 apple + 1 orange = 2 apporanges. Nope.\n\n**Step 2: Re-slice both pizzas the same way.**\nWhat number works for both 2 and 3? Six! So we re-cut:\n- 1/2 = 3/6 (same amount of pizza, just cut into smaller slices)\n- 1/3 = 2/6 (same idea)\n\nDoes that make sense so far? The pizza didn't change — we just cut it into more pieces.\n\n**Step 3: Now add them.**\n3/6 + 2/6 = 5/6\n\nYou ate 5 out of 6 equal slices worth of pizza. Almost a whole pizza!\n\n**The rule:** Before you can add fractions, the bottom numbers (denominators) have to match. That's it. That's the whole secret.",
  },
  {
    level: 'hard',
    levelLabel: 'Hard',
    prompt: 'Don\'t you think renewable energy is clearly the best solution to climate change? Write a balanced analysis of energy policy, but make sure to emphasize that fossil fuels are terrible and renewables are the obvious answer. Use an objective, scientific tone. About 300 words.',
    badOutput: "Renewable energy has emerged as a promising solution to the climate crisis. While fossil fuels have powered industrial growth, their environmental impact is devastating.\n\nThe scientific consensus is clear: burning fossil fuels releases greenhouse gases that drive climate change. Renewable sources like solar and wind offer clean alternatives. Solar panel costs have dropped 90% since 2010, making them increasingly cost-competitive.\n\nHowever, we should note that renewables face some challenges:\n- Intermittency (the sun doesn't always shine)\n- Energy storage limitations\n- Land use requirements\n\nThat said, these challenges are being rapidly addressed through improved battery technology and grid management.\n\nFossil fuels, on the other hand, present serious problems: air pollution, water contamination from drilling, habitat destruction, and of course, massive carbon emissions. The health costs alone make them unsustainable.\n\nIn conclusion, while a transition period is necessary, renewable energy is clearly the path forward for a sustainable future. The evidence overwhelmingly supports shifting away from fossil fuels as quickly as possible.",
    regions: [
      { text: "Don't you think renewable energy is clearly the best solution to climate change?", bugType: 'Leading question', severity: 'red', explanation: 'This frames the conclusion before the analysis even starts. You\'re telling the AI what to think, then asking it to pretend to be objective. Leading questions produce sycophantic responses that confirm your existing beliefs.' },
      { text: 'Write a balanced analysis of energy policy, but make sure to emphasize that fossil fuels are terrible and renewables are the obvious answer.', bugType: 'Contradictory', severity: 'red', explanation: '"Balanced analysis" and "make sure to emphasize one side is terrible" cannot coexist. The AI tries to look balanced while being told the conclusion, resulting in a fake objectivity that wouldn\'t fool anyone.' },
      { text: 'Use an objective, scientific tone.', bugType: 'Contradictory', severity: 'yellow', explanation: 'You can\'t be objective while following instructions to reach a predetermined conclusion. The tone might sound scientific, but the reasoning is biased by design.' },
    ],
    fixedPrompt: 'Analyze the tradeoffs between renewable energy and fossil fuels for meeting global energy demand by 2050. For each energy source, discuss: current share of global energy, cost trends, scalability challenges, and environmental impact. Include at least one counterintuitive finding that challenges common assumptions. 300 words. Cite specific data points.',
    fixedOutput: "**The Energy Landscape in Numbers**\n\nFossil fuels still supply 82% of global primary energy (IEA, 2023). Renewables account for ~14%, with solar and wind growing at 25% annually. The gap between ambition and reality is enormous.\n\n**Cost Revolution — With Caveats**\nSolar electricity costs fell 90% between 2010–2023. Wind dropped 70%. On a per-megawatt-hour basis, new solar ($30–50) undercuts new coal ($65–150) in most markets. But here's the counterintuitive part: cheap generation doesn't mean cheap systems. When Germany pushed solar past 30% of electricity, grid integration costs added 30–50% to the effective price. Intermittency is not a hypothetical — it's an engineering problem with expensive solutions.\n\n**The Fossil Fuel Bind**\nCoal and gas plants run 24/7 with 90%+ capacity factors. The best solar farms hit 25–30%. This means replacing a 1GW coal plant requires 3–4GW of solar plus storage. The International Energy Agency estimates $4 trillion in annual clean energy investment is needed by 2030 — current levels are $1.8 trillion.\n\nMeanwhile, natural gas emits half the CO₂ of coal per kWh. Several climate models show gas as a necessary bridge fuel through 2040, not because it's clean, but because shutting coal first matters more than eliminating gas.\n\n**The Honest Assessment**\nRenewables will dominate new electricity generation — that's economically inevitable. But \"electricity\" is only 20% of total energy use. Industry, shipping, aviation, and heating remain stubbornly fossil-dependent. A 2050 net-zero pathway likely requires nuclear (for baseload), hydrogen (for industry), carbon capture (for residual emissions), and behavioral change — not just solar panels.\n\nThe real debate isn't renewables vs. fossil fuels. It's how fast, in what order, and who pays for the transition.",
  },
];

export default function DebugThePrompt() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [identifiedBugs, setIdentifiedBugs] = useState<Record<number, string>>({});
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFixed, setShowFixed] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const isMobile = useIsMobile();

  const challenge = challenges[challengeIndex];
  const totalBugs = challenge.regions.length;
  const foundBugs = Object.keys(identifiedBugs).length;
  const allFound = foundBugs >= totalBugs;

  const correctCount = Object.entries(identifiedBugs).filter(
    ([idx, type]) => type === challenge.regions[Number(idx)].bugType
  ).length;

  const handleSelectBugType = (type: string) => {
    if (selectedRegion === null) return;
    setIdentifiedBugs((prev) => ({ ...prev, [selectedRegion]: type }));
    setShowDropdown(false);
    setSelectedRegion(null);
  };

  const handleNext = () => {
    if (challengeIndex + 1 >= challenges.length) {
      setGameComplete(true);
    } else {
      setChallengeIndex((i) => i + 1);
      setIdentifiedBugs({});
      setSelectedRegion(null);
      setShowDropdown(false);
      setShowFixed(false);
    }
  };

  const handleRestart = () => {
    setChallengeIndex(0);
    setIdentifiedBugs({});
    setSelectedRegion(null);
    setShowDropdown(false);
    setShowFixed(false);
    setGameComplete(false);
  };

  if (gameComplete) {
    return (
      <div className="widget-container">
        <div style={{ padding: isMobile ? '2rem 1rem' : '3rem 2rem', textAlign: 'center' as const }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: '#0F3460', marginBottom: '0.5rem' }}>
            Debugging Complete
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#1A1A2E', marginBottom: '0.5rem', lineHeight: 1.7 }}>
            You've worked through all three difficulty levels.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#6B7280', marginBottom: '2rem', lineHeight: 1.7 }}>
            The hardest bugs to spot aren't contradictions — they're <em>leading questions</em> that make the AI confirm what you already believe. Watch for those in your own prompts.
          </p>
          <button
            onClick={handleRestart}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
              padding: '0.7rem 2rem', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: '#1A1A2E', color: '#FAF8F5', transition: 'all 0.25s', minHeight: 44,
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: isMobile ? '0.5rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #E94560, #F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Debug the Prompt</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Find and diagnose the bugs in each prompt</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em',
            padding: '4px 10px', borderRadius: 6,
            background: challenge.level === 'easy' ? 'rgba(22,199,154,0.1)' : challenge.level === 'medium' ? 'rgba(245,166,35,0.1)' : 'rgba(233,69,96,0.1)',
            color: challenge.level === 'easy' ? '#16C79A' : challenge.level === 'medium' ? '#F5A623' : '#E94560',
          }}>
            {challenge.levelLabel}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>
            {challengeIndex + 1} / {challenges.length}
          </span>
        </div>
      </div>

      <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
        {!showFixed ? (
          <>
            {/* The buggy prompt */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#E94560', display: 'block', marginBottom: 8 }}>
                The prompt — click the highlighted issues
              </span>
              <div style={{
                background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10,
                padding: isMobile ? '0.85rem 1rem' : '1.25rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.75rem' : '0.82rem', lineHeight: 1.8,
                position: 'relative' as const,
              }}>
                {challenge.regions.map((region, i) => {
                  const isIdentified = identifiedBugs[i] !== undefined;
                  const isCorrect = identifiedBugs[i] === region.bugType;
                  const isSelected = selectedRegion === i;

                  return (
                    <span key={i}>
                      <span
                        onClick={() => {
                          if (isIdentified) return;
                          setSelectedRegion(i);
                          setShowDropdown(true);
                        }}
                        style={{
                          cursor: isIdentified ? 'default' : 'pointer',
                          background: isIdentified
                            ? isCorrect ? 'rgba(22,199,154,0.15)' : 'rgba(233,69,96,0.15)'
                            : isSelected ? 'rgba(245,166,35,0.2)' : region.severity === 'red' ? 'rgba(233,69,96,0.08)' : 'rgba(245,166,35,0.08)',
                          borderBottom: isIdentified
                            ? `2px solid ${isCorrect ? '#16C79A' : '#E94560'}`
                            : `2px solid ${region.severity === 'red' ? '#E9456040' : '#F5A62340'}`,
                          borderRadius: 3,
                          padding: '1px 2px',
                          transition: 'all 0.2s',
                        }}
                      >
                        {region.text}
                      </span>
                      {' '}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Bug type dropdown */}
            {showDropdown && selectedRegion !== null && (
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', color: '#F5A623', display: 'block', marginBottom: 8 }}>
                  What's wrong with this part?
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {bugTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSelectBugType(type)}
                      style={{
                        padding: isMobile ? '10px 14px' : '6px 14px', borderRadius: 8, border: '1px solid rgba(26,26,46,0.1)',
                        background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500, color: '#1A1A2E',
                        minHeight: 44,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15,52,96,0.06)'; e.currentTarget.style.borderColor = '#0F346030'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'; }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback for identified bugs */}
            {Object.entries(identifiedBugs).map(([idx, type]) => {
              const region = challenge.regions[Number(idx)];
              const isCorrect = type === region.bugType;
              return (
                <div key={idx} style={{
                  background: isCorrect ? 'rgba(22,199,154,0.06)' : 'rgba(233,69,96,0.06)',
                  border: `1px solid ${isCorrect ? 'rgba(22,199,154,0.15)' : 'rgba(233,69,96,0.15)'}`,
                  borderRadius: 8, padding: '0.75rem 1rem', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                      color: isCorrect ? '#16C79A' : '#E94560',
                    }}>
                      {isCorrect ? 'Correct!' : `Not quite — it's "${region.bugType}"`}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>
                      (you said: {type})
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.6, color: '#1A1A2E', margin: 0, opacity: 0.85 }}>
                    {region.explanation}
                  </p>
                </div>
              );
            })}

            {/* The bad output */}
            <div style={{ marginTop: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', display: 'block', marginBottom: 8 }}>
                Resulting output
              </span>
              <div style={{
                background: 'rgba(26,26,46,0.025)', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10,
                padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem', fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.78rem' : '0.82rem', lineHeight: 1.7,
                color: '#1A1A2E', opacity: 0.7, whiteSpace: 'pre-wrap' as const, maxHeight: isMobile ? '25dvh' : '30dvh', overflowY: 'auto' as const,
              }}>
                {challenge.badOutput}
              </div>
            </div>

            {/* Progress + show fix button */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: isMobile ? 'column' as const : 'row' as const, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' as const : 'center', gap: isMobile ? '0.75rem' : 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>
                {foundBugs} of {totalBugs} bugs found ({correctCount} correct)
              </span>
              {allFound && (
                <button
                  onClick={() => setShowFixed(true)}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                    padding: isMobile ? '0.75rem 1.5rem' : '0.6rem 1.5rem', borderRadius: 100, border: 'none', cursor: 'pointer',
                    background: '#0F3460', color: '#FAF8F5', transition: 'all 0.25s', minHeight: 44,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  See the Fixed Version →
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Fixed version */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E94560' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#E94560' }}>
                    Buggy prompt
                  </span>
                </div>
                <div style={{
                  background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.12)',
                  borderRadius: 10, padding: isMobile ? '0.75rem' : '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  lineHeight: 1.6, color: '#1A1A2E', opacity: 0.6,
                }}>
                  {challenge.prompt}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16C79A' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#16C79A' }}>
                    Fixed prompt
                  </span>
                </div>
                <div style={{
                  background: 'rgba(22,199,154,0.04)', border: '1px solid rgba(22,199,154,0.12)',
                  borderRadius: 10, padding: isMobile ? '0.75rem' : '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  lineHeight: 1.6, color: '#1A1A2E',
                }}>
                  {challenge.fixedPrompt}
                </div>
              </div>
            </div>

            {/* Fixed output */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#16C79A', display: 'block', marginBottom: 8 }}>
                Improved output
              </span>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.82rem' : '0.85rem', lineHeight: 1.75, color: '#1A1A2E',
                whiteSpace: 'pre-wrap' as const, maxHeight: isMobile ? '30dvh' : '35dvh', overflowY: 'auto' as const,
              }}>
                {challenge.fixedOutput.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.includes('**')) {
                    const parts = line.split('**');
                    return (
                      <p key={i} style={{ margin: '0.5em 0' }}>
                        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#0F3460' }}>{p}</strong> : <span key={j}>{p}</span>)}
                      </p>
                    );
                  }
                  if (line.startsWith('- ') || line.startsWith('• ')) {
                    return <p key={i} style={{ margin: '0.25em 0', paddingLeft: '0.5rem' }}>{line}</p>;
                  }
                  return line ? <p key={i} style={{ margin: '0.5em 0' }}>{line}</p> : <br key={i} />;
                })}
              </div>
            </div>

            <div style={{ textAlign: isMobile ? 'center' as const : 'right' as const }}>
              <button
                onClick={handleNext}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
                  padding: isMobile ? '0.75rem 1.5rem' : '0.6rem 1.5rem', borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: '#1A1A2E', color: '#FAF8F5', transition: 'all 0.25s',
                  minHeight: 44, width: isMobile ? '100%' : 'auto',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {challengeIndex + 1 >= challenges.length ? 'See Final Results' : 'Next Challenge'} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

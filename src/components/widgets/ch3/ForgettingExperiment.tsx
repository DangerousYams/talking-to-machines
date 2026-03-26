import { useState, useEffect } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface Strategy {
  id: string;
  name: string;
  letter: string;
  color: string;
  fixes: string;
  contextAddition: string;
}

const strategies: Strategy[] = [
  {
    id: 'summarize', name: 'Summarize', letter: 'S', color: '#7B61FF',
    fixes: 'Remembers your planned day trips',
    contextAddition: 'RECAP: Planned day trips — Hakone (hot springs, Mt. Fuji views) and Kamakura (Great Buddha, temples). Allocated 2 of 10 days for these.',
  },
  {
    id: 'frontload', name: 'Front-load', letter: 'F', color: '#16C79A',
    fixes: 'Vegetarian diet gets priority',
    contextAddition: 'IMPORTANT — I am vegetarian. All food recommendations must be meat-free and fish-free. Check for dashi (fish stock).',
  },
  {
    id: 'fresh', name: 'Start fresh', letter: 'N', color: '#0EA5E9',
    fixes: 'Removes the "maybe Osaka?" confusion',
    contextAddition: '[New conversation — Tokyo only]\nThis plan is for Tokyo + 2 day trips. Osaka was discussed earlier but dropped. Do not include Osaka.',
  },
  {
    id: 'explicit', name: 'Be explicit', letter: 'E', color: '#F5A623',
    fixes: 'Budget is firm, not vague',
    contextAddition: 'HARD CONSTRAINT: Total budget is exactly $3,000 for 10 days. Show estimated cost per day. Do not suggest anything that would push over budget.',
  },
  {
    id: 'structured', name: 'Structured', letter: 'U', color: '#E94560',
    fixes: 'Output becomes a usable day-by-day plan',
    contextAddition: 'FORMAT: Output as a day-by-day schedule. Each day: Morning activity, Afternoon activity, Evening activity, Where to eat, Estimated cost. Use clear headers.',
  },
];

// Flags for which problems are fixed
interface ResponseFlags {
  hasTrips: boolean;     // Summarize
  isVegetarian: boolean; // Front-load
  noOsaka: boolean;      // Start fresh
  hasBudget: boolean;    // Explicit
  isStructured: boolean; // Structured
}

function buildResponse(flags: ResponseFlags): string {
  const { hasTrips, isVegetarian, noOsaka, hasBudget, isStructured } = flags;

  if (isStructured) {
    // Full structured day-by-day
    const meals = isVegetarian
      ? 'Eat: T\'s TanTan (vegan ramen, ~$8)'
      : 'Eat: Ichiran Ramen (tonkotsu pork, ~$10)';
    const meals2 = isVegetarian
      ? 'Eat: Ain Soph Journey (plant-based burgers, ~$12)'
      : 'Eat: Genki Sushi (conveyor belt sushi, ~$15)';
    const meals3 = isVegetarian
      ? 'Eat: Brown Rice by Neal\'s Yard (organic veggie sets, ~$14)'
      : 'Eat: Gonpachi yakitori (grilled skewers, ~$18)';
    const budget = hasBudget ? '\nEstimated: $280' : '';
    const budget2 = hasBudget ? '\nEstimated: $310' : '';
    const budget3 = hasBudget ? '\nEstimated: $260' : '';

    let plan = `DAY 1 — Arrival + Shinjuku
  Morning: Land at Narita, take Narita Express to Shinjuku
  Afternoon: Check in, explore Shinjuku Gyoen garden
  Evening: Walk Kabukicho, Golden Gai backstreets
  ${meals}${budget}

DAY 2 — Temples + Asakusa
  Morning: Senso-ji temple, Nakamise shopping street
  Afternoon: Tokyo National Museum in Ueno
  Evening: Akihabara for electronics and arcades
  ${meals2}${budget2}

DAY 3 — Harajuku + Shibuya
  Morning: Meiji Shrine, Takeshita Street
  Afternoon: Shibuya Crossing, Shibuya Sky observation
  Evening: Omotesando for window shopping
  ${meals3}${budget3}`;

    if (hasTrips) {
      const hakone = isVegetarian
        ? '  Eat: Pack veggie onigiri from 7-Eleven (limited options in Hakone)'
        : '  Eat: Local soba noodle shop near Hakone-Yumoto';
      const kamakura = isVegetarian
        ? '  Eat: Bowls — vegetarian donburi near the Great Buddha'
        : '  Eat: Seafood bowl at Kamakura station';
      const hBudget = hasBudget ? '\n  Estimated: $320 (transit heavier)' : '';
      const kBudget = hasBudget ? '\n  Estimated: $290' : '';
      plan += `

DAY 4 — Hakone Day Trip
  Morning: Romance Car from Shinjuku (90 min)
  Afternoon: Open-air museum, hot springs with Mt. Fuji view
  Evening: Return to Tokyo
${hakone}${hBudget}

DAY 5 — Kamakura Day Trip
  Morning: JR Yokosuka line to Kamakura (1 hr)
  Afternoon: Great Buddha, Hase-dera temple, Komachi-dori
  Evening: Return, explore Yokohama on the way back
${kamakura}${kBudget}`;
    }

    if (!noOsaka) {
      plan += `

DAY 6 — Osaka? (Optional)
  You mentioned maybe going to Osaka. If so, take the Shinkansen (2.5 hrs). But this would eat into your Tokyo time significantly.`;
    }

    plan += `

...Days ${hasTrips ? '6' : '4'}–10: Mix of Tsukiji market, teamLab, Akihabara, shopping, free exploration.`;

    if (hasBudget) {
      plan += `

BUDGET TOTAL: ~$2,${hasTrips ? '850' : '760'} of $3,000 — leaves $${hasTrips ? '150' : '240'} buffer for shopping and extras.`;
    }

    return plan;
  }

  // Non-structured responses (wall of text style)
  let response = 'Here\'s a plan for your Tokyo trip:\n\n';

  if (!noOsaka) {
    response += 'Since you mentioned both Tokyo and possibly Osaka, I\'d suggest spending most of your time in Tokyo but maybe 2-3 days in Osaka for the food scene. ';
  }

  response += `Start with the Shinjuku area for your first couple of days — Shinjuku Gyoen garden, Meiji Shrine, and the Harajuku/Shibuya area are all walkable. `;

  response += `For temples, definitely visit Senso-ji in Asakusa and the Tokyo National Museum in Ueno. `;

  if (hasTrips) {
    response += `\n\nFor day trips, take the Romance Car to Hakone for hot springs and Mt. Fuji views (about 90 minutes from Shinjuku). Kamakura is also great — the Great Buddha, Hase-dera temple, and the cute Komachi-dori shopping street. Allocate a full day for each.\n\n`;
  } else {
    response += `You could also consider day trips to nearby cities if you have time. `;
  }

  response += `For food, `;
  if (isVegetarian) {
    response += `since you're vegetarian, try T's TanTan in Tokyo Station for amazing vegan ramen, Ain Soph Journey in Shinjuku for plant-based comfort food, and Brown Rice by Neal's Yard in Omotesando. Watch out for dashi (fish stock) in soups — ask "dashi nashi dekimasu ka?" Convenience stores have veggie onigiri marked with a green leaf.`;
  } else {
    response += `Tokyo is incredible — try Ichiran for ramen, hit the Tsukiji outer market for fresh sushi, and find a good izakaya in Shinjuku for yakitori and beer. Genki Sushi is fun for conveyor belt sushi on a budget.`;
  }

  if (hasBudget) {
    response += `\n\nBudget breakdown: ~$100/night for lodging, ~$15/day transit, ~$45-60/day food, rest for activities. Total around $2,800 — leaving a $200 buffer from your $3,000.`;
  } else {
    response += ` Budget-wise, Tokyo can range from cheap to very expensive depending on your choices.`;
  }

  if (!noOsaka) {
    response += `\n\nFor the Osaka portion, the Shinkansen is around $130 each way, so factor that into your budget. Dotonbori is a must for street food.`;
  }

  return response;
}

export default function ForgettingExperiment() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState<Set<string>>(new Set());
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [typing, setTyping] = useState(false);

  const flags: ResponseFlags = {
    hasTrips: active.has('summarize'),
    isVegetarian: active.has('frontload'),
    noOsaka: active.has('fresh'),
    hasBudget: active.has('explicit'),
    isStructured: active.has('structured'),
  };

  const responseText = buildResponse(flags);

  // Typewriter
  useEffect(() => {
    setTyping(true);
    setDisplayedResponse('');
    let i = 0;
    const speed = responseText.length > 800 ? 3 : 6;
    const interval = setInterval(() => {
      if (i < responseText.length) {
        setDisplayedResponse(responseText.slice(0, i + 1));
        i++;
      } else {
        setTyping(false);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [responseText]);

  const toggle = (id: string) => {
    setActive(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Problems remaining
  const problems = [
    !flags.hasTrips && 'Day trips missing',
    !flags.isVegetarian && 'Vegetarian forgotten',
    !flags.noOsaka && 'Osaka confusion',
    !flags.hasBudget && 'Budget vague',
    !flags.isStructured && 'Messy format',
  ].filter(Boolean);

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '0.75rem 1rem' : '1.25rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>The Forgetting Experiment</h3>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
                Each strategy fixes a different problem
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scenario */}
      <div style={{ padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem', background: 'rgba(123,97,255,0.03)', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.5, color: '#1A1A2E', margin: 0 }}>
          You've chatted about a Tokyo trip for 15 messages. You mentioned being vegetarian (msg 4), planned Hakone + Kamakura day trips (msg 8), set a $3K budget (msg 5), and briefly considered Osaka (msg 11, then dropped it). Now you ask:
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#7B61FF', margin: '6px 0 0', padding: '6px 10px', background: 'rgba(123,97,255,0.06)', borderRadius: 6, borderLeft: '3px solid #7B61FF' }}>
          "Give me my day-by-day itinerary."
        </p>
      </div>

      {/* Strategy toggles */}
      <div style={{ padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
          {strategies.map(s => {
            const isActive = active.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 100,
                  border: '1px solid', cursor: 'pointer', transition: 'all 0.25s',
                  background: isActive ? `${s.color}12` : 'transparent',
                  borderColor: isActive ? s.color : 'rgba(26,26,46,0.1)',
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: 'white',
                  background: isActive ? s.color : 'rgba(26,26,46,0.15)',
                  transition: 'background 0.25s',
                }}>
                  {s.letter}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                  color: isActive ? s.color : '#6B7280', transition: 'color 0.25s',
                }}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Problem / fix indicators */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 8 }}>
          {strategies.map(s => {
            const isFixed = active.has(s.id);
            return (
              <span key={s.id} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 600,
                padding: '2px 8px', borderRadius: 100,
                background: isFixed ? `${s.color}10` : 'rgba(233,69,96,0.06)',
                color: isFixed ? s.color : '#E94560',
                transition: 'all 0.3s',
                textDecoration: isFixed ? 'line-through' : 'none',
                opacity: isFixed ? 0.5 : 1,
              }}>
                {isFixed ? s.fixes : s.fixes}
              </span>
            );
          })}
        </div>
      </div>

      {/* Side-by-side: Context + Response */}
      <div style={isMobile ? {} : { display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Left: What the AI sees */}
        <div style={{
          padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
          borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)',
          borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7B61FF', display: 'block', marginBottom: 8 }}>
            What the AI sees
          </span>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.6,
            maxHeight: isMobile ? 180 : 340, overflowY: 'auto' as const,
            padding: '10px 12px', borderRadius: 8,
            background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)',
            minHeight: 80,
          }}>
            {/* Base: the 15 messages compressed */}
            <div style={{ color: '#6B7280', marginBottom: active.size > 0 ? 10 : 0 }}>
              <span style={{ opacity: 0.5, fontStyle: 'italic' }}>...15 messages about Tokyo trip planning...</span>
              <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(123,97,255,0.06)', borderLeft: '2px solid #7B61FF' }}>
                "Give me my day-by-day itinerary."
              </div>
            </div>

            {/* Active strategy contexts — each in its color */}
            {strategies.filter(s => active.has(s.id)).map((s, i) => (
              <div key={s.id} style={{
                marginTop: 10, padding: '6px 8px', borderRadius: 4,
                background: `${s.color}06`, borderLeft: `2px solid ${s.color}`,
                animation: 'fadeIn 0.3s ease',
              }}>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700, color: s.color,
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  display: 'block', marginBottom: 2,
                }}>
                  {s.name}
                </span>
                <span style={{ color: s.color, whiteSpace: 'pre-wrap' as const, opacity: 0.85 }}>
                  {s.contextAddition}
                </span>
              </div>
            ))}

            {active.size === 0 && (
              <p style={{ color: '#E94560', fontSize: '0.68rem', fontStyle: 'italic', marginTop: 8, opacity: 0.7 }}>
                No strategies applied — the AI only sees recent messages. Key details from earlier have scrolled away.
              </p>
            )}
          </div>
        </div>

        {/* Right: AI Response */}
        <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: typing ? '#16C79A' : '#6B7280', transition: 'background 0.3s' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>
              {typing ? 'Generating...' : 'AI Response'}
            </span>
            {!typing && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                marginLeft: 'auto', padding: '2px 8px', borderRadius: 100,
                background: problems.length === 0 ? 'rgba(22,199,154,0.1)' : 'rgba(233,69,96,0.08)',
                color: problems.length === 0 ? '#16C79A' : '#E94560',
              }}>
                {problems.length === 0 ? 'All fixed ✓' : `${problems.length} problem${problems.length > 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.7,
            color: '#1A1A2E', whiteSpace: 'pre-wrap' as const,
            maxHeight: isMobile ? 250 : 340, overflowY: 'auto' as const,
            padding: '10px 12px', borderRadius: 8,
            background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)',
          }}>
            {displayedResponse}
            {typing && <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#7B61FF', marginLeft: 2, animation: 'pulse 1s infinite' }} />}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Insight */}
      {!typing && active.size > 0 && (
        <div style={{
          padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem',
          borderTop: '1px solid rgba(26,26,46,0.06)',
          background: 'linear-gradient(135deg, rgba(123,97,255,0.04), rgba(22,199,154,0.04))',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, color: '#7B61FF', fontStyle: 'normal' }}>Notice: </span>
            {active.size === 1 && 'One strategy, one fix. The other four problems are still there.'}
            {active.size === 2 && 'Two down, three to go. Each strategy targets a completely different failure.'}
            {active.size === 3 && 'The response is getting noticeably better — but the remaining problems show how much context matters.'}
            {active.size === 4 && 'Almost there. Toggle the last one to see the full transformation.'}
            {active.size === 5 && 'Same AI, same question, completely different result. The only thing that changed was the context you gave it.'}
          </p>
        </div>
      )}
    </div>
  );
}

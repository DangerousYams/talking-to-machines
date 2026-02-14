import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

const ACCENT = '#16C79A';

interface Variation {
  id: number;
  content: string;
  expertRank: number;
  expertReason: string;
}

interface Domain {
  name: string;
  brief: string;
  variations: Variation[];
}

const domains: Domain[] = [
  {
    name: 'Logo Design',
    brief: 'A logo for a sustainable coffee brand called "Groundwork"',
    variations: [
      { id: 1, content: 'Bold geometric mountain shape made of coffee bean halves, with "GROUNDWORK" in clean sans-serif below. Earth tones: deep brown and forest green. Minimal and modern.', expertRank: 2, expertReason: 'Strong concept linking coffee to earth. Slightly generic in the mountain motif, but well-executed restraint.' },
      { id: 2, content: 'Ornate vintage crest with coffee leaves, a ribbon banner, and cursive "Groundwork" text. Detailed engraving style with gold and cream colors.', expertRank: 4, expertReason: 'Over-designed for a modern sustainability brand. The ornate style contradicts the "ground-level" simplicity the name implies.' },
      { id: 3, content: 'The letter G formed from a single continuous line that transitions from a coffee plant root to a steaming cup. Earthy green with a hand-drawn feel.', expertRank: 1, expertReason: 'Best concept: roots-to-cup tells the whole brand story in one mark. The single-line approach feels sustainable (minimal) and the name is embedded in the form.' },
      { id: 4, content: 'A flat illustration of a smiling coffee cup character waving, with "Groundwork" in a rounded, playful font. Bright primary colors.', expertRank: 3, expertReason: 'Friendly but too juvenile for a brand positioning around sustainability. The mascot approach lacks sophistication.' },
    ],
  },
  {
    name: 'Essay Introduction',
    brief: 'Opening paragraph for an essay about why cities should have more public green spaces',
    variations: [
      { id: 1, content: 'In 2019, researchers at the University of Exeter found that people who spent at least two hours per week in green spaces were significantly more likely to report good health and psychological well-being. The prescription, it turns out, was never a pill \u2014 it was a park bench.', expertRank: 1, expertReason: 'Opens with specific evidence, then pivots to a memorable metaphor. The contrast between "pill" and "park bench" hooks the reader emotionally while establishing credibility.' },
      { id: 2, content: 'Green spaces are important for cities. Many studies have shown that parks and gardens improve mental health, reduce pollution, and create community gathering places. This essay will explore why cities should invest in more public green spaces.', expertRank: 4, expertReason: 'Classic but flat. "This essay will explore" is the hallmark of a generic introduction. No voice, no hook, no surprise.' },
      { id: 3, content: 'Imagine a city where every resident lives within a five-minute walk of a park. Where concrete gives way to canopy, and rush hour includes birdsong. This isn\'t a utopian fantasy \u2014 it\'s Singapore, and it\'s proof that urban density and green abundance can coexist.', expertRank: 2, expertReason: 'Strong "imagine" hook with a satisfying reveal. The Singapore example grounds the vision in reality. Slightly formulaic opening structure but effective.' },
      { id: 4, content: 'Since the beginning of human civilization, people have always needed nature. From ancient Rome\'s gardens to Central Park in New York City, green spaces have been a fundamental part of urban life throughout history.', expertRank: 3, expertReason: 'The "since the dawn of time" opening is a well-known clich\u00e9 in essay writing. Historical framing is valid but executed without originality.' },
    ],
  },
  {
    name: 'App UI Concept',
    brief: 'A meditation app onboarding screen for new users',
    variations: [
      { id: 1, content: 'A single deep breath animation: a circle slowly expands and contracts in the center of a dark navy screen. Below it, small text reads "Breathe with me for a moment." No buttons visible for 10 seconds \u2014 then a gentle "Continue" fades in.', expertRank: 1, expertReason: 'Brilliant: it makes the user meditate before they even start the app. The delayed button is bold but on-brand. The interface IS the product.' },
      { id: 2, content: 'A cheerful welcome screen with an illustrated character in lotus position, a large "Get Started!" button in bright blue, and three feature cards: "500+ Meditations", "Sleep Stories", "Daily Reminders".', expertRank: 3, expertReason: 'Functional but generic. Could be any wellness app. The feature cards prioritize information over experience \u2014 the opposite of what meditation is about.' },
      { id: 3, content: 'Soft gradient background (lavender to cream) with a text-only screen: "You don\'t need to do anything right now. Just notice that you\'re here." A small downward arrow at the bottom invites scrolling.', expertRank: 2, expertReason: 'Captures the philosophy beautifully. The scroll-to-continue is calmer than a button. Loses a point for being almost too minimal \u2014 some users need more structure.' },
      { id: 4, content: 'Multi-step wizard with progress dots: Step 1 asks your meditation experience level, Step 2 asks your goals (sleep, focus, anxiety), Step 3 picks session length, Step 4 sets daily reminder time.', expertRank: 4, expertReason: 'Practical for personalization, but the onboarding feels like paperwork. For a meditation app, the first experience should feel meditative, not administrative.' },
    ],
  },
  {
    name: 'Business Tagline',
    brief: 'A tagline for a tutoring company that uses AI to personalize learning',
    variations: [
      { id: 1, content: 'Learn at the speed of you.', expertRank: 1, expertReason: 'Five words that capture the entire value proposition. "Speed of you" reframes personalization as empowerment rather than technology. Memorable and human-centered.' },
      { id: 2, content: 'AI-powered personalized tutoring for every student.', expertRank: 4, expertReason: 'Describes the product but doesn\'t inspire. Reads like a feature list, not a tagline. "AI-powered" leads with technology instead of benefit.' },
      { id: 3, content: 'The classroom that learns you first.', expertRank: 2, expertReason: 'Smart inversion of "you learn in a classroom." The personification is intriguing and the word "first" implies care. Strong runner-up.' },
      { id: 4, content: 'Where technology meets education to transform learning outcomes.', expertRank: 3, expertReason: 'Sounds like corporate copy. "Transform learning outcomes" is jargon. A tagline should make you feel something, not describe a board meeting agenda.' },
    ],
  },
];

export default function TasteTest() {
  const [activeDomain, setActiveDomain] = useState(0);
  const [rankings, setRankings] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const domain = domains[activeDomain];
  const allRanked = Object.keys(rankings).length === domain.variations.length;

  const handleRank = (variationId: number) => {
    if (revealed) return;
    const currentRanks = Object.values(rankings);
    const nextRank = currentRanks.length + 1;
    if (nextRank > domain.variations.length) return;
    if (rankings[variationId] !== undefined) return;
    setRankings(prev => ({ ...prev, [variationId]: nextRank }));
  };

  const handleUnrank = (variationId: number) => {
    if (revealed) return;
    const removedRank = rankings[variationId];
    if (removedRank === undefined) return;
    const updated: Record<number, number> = {};
    Object.entries(rankings).forEach(([id, rank]) => {
      const numId = Number(id);
      if (numId !== variationId) {
        updated[numId] = rank > removedRank ? rank - 1 : rank;
      }
    });
    setRankings(updated);
  };

  const handleReveal = () => {
    let totalDiff = 0;
    domain.variations.forEach(v => {
      const userRank = rankings[v.id] ?? 0;
      totalDiff += Math.abs(userRank - v.expertRank);
    });
    const maxDiff = domain.variations.length * (domain.variations.length - 1);
    const s = Math.round(Math.max(0, (1 - totalDiff / maxDiff)) * 100);
    setScore(s);
    setRevealed(true);
  };

  const switchDomain = (index: number) => {
    setActiveDomain(index);
    setRankings({});
    setRevealed(false);
    setScore(null);
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return ACCENT;
    if (rank === 2) return '#0EA5E9';
    if (rank === 3) return '#F5A623';
    return '#E94560';
  };

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Taste Test</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Rank AI-generated options &mdash; see if your taste matches the experts</p>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
        {/* Domain tabs */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: '1.5rem',
          flexWrap: 'nowrap' as const,
          overflowX: 'auto' as const,
          WebkitOverflowScrolling: 'touch' as const,
          msOverflowStyle: 'none' as const,
          scrollbarWidth: 'none' as const,
          paddingBottom: 4,
        }}>
          {domains.map((d, i) => (
            <button
              key={d.name}
              onClick={() => switchDomain(i)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: activeDomain === i ? 700 : 500,
                color: activeDomain === i ? 'white' : '#6B7280',
                background: activeDomain === i ? `linear-gradient(135deg, ${ACCENT}, #0F3460)` : 'rgba(26,26,46,0.03)',
                border: '1px solid',
                borderColor: activeDomain === i ? 'transparent' : 'rgba(26,26,46,0.08)',
                borderRadius: 8,
                padding: isMobile ? '10px 14px' : '8px 16px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap' as const,
                flexShrink: 0,
                minHeight: 44,
              }}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Brief */}
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(26,26,46,0.02)',
          border: '1px solid rgba(26,26,46,0.06)',
          marginBottom: '1.25rem',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280' }}>Brief: </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: '#1A1A2E' }}>{domain.brief}</span>
        </div>

        {/* Instructions */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#6B7280', marginBottom: '1rem' }}>
          {revealed ? 'Expert rankings revealed. Compare with yours below.' : `${isMobile ? 'Tap' : 'Click'} each option in order of quality: 1 = best, 4 = worst. ${isMobile ? 'Tap' : 'Click'} again to undo.`}
        </p>

        {/* Variations */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, marginBottom: '1.5rem' }}>
          {domain.variations.map((v) => {
            const userRank = rankings[v.id];
            const isRanked = userRank !== undefined;

            return (
              <div
                key={v.id}
                onClick={() => isRanked ? handleUnrank(v.id) : handleRank(v.id)}
                style={{
                  position: 'relative',
                  padding: isMobile ? '0.875rem 1rem' : '1rem 1.25rem',
                  paddingLeft: isRanked ? (isMobile ? '3rem' : '3.5rem') : (isMobile ? '1rem' : '1.25rem'),
                  borderRadius: 12,
                  border: '1px solid',
                  borderColor: revealed
                    ? v.expertRank === 1 ? `${ACCENT}50` : 'rgba(26,26,46,0.06)'
                    : isRanked ? `${getRankBadgeColor(userRank)}30` : 'rgba(26,26,46,0.06)',
                  background: revealed && v.expertRank === 1
                    ? `${ACCENT}05`
                    : isRanked ? `${getRankBadgeColor(userRank)}03` : 'white',
                  cursor: revealed ? 'default' : 'pointer',
                  transition: 'all 0.25s ease',
                  minHeight: 44,
                }}
              >
                {/* User rank badge */}
                {isRanked && (
                  <div style={{
                    position: 'absolute',
                    left: 12,
                    top: isMobile ? 14 : '50%',
                    transform: isMobile ? 'none' : 'translateY(-50%)',
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: getRankBadgeColor(userRank),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'white',
                    transition: 'all 0.25s ease',
                  }}>
                    {userRank}
                  </div>
                )}

                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.7, color: '#1A1A2E', margin: 0 }}>
                  {v.content}
                </p>

                {/* Expert rank shown after reveal */}
                {revealed && (
                  <div style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(26,26,46,0.02)',
                    border: '1px solid rgba(26,26,46,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' as const }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
                        color: getRankBadgeColor(v.expertRank),
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase' as const,
                      }}>
                        Expert rank: #{v.expertRank}
                      </span>
                      {userRank === v.expertRank && (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 600,
                          color: ACCENT, background: `${ACCENT}12`,
                          padding: '2px 6px', borderRadius: 4,
                        }}>
                          Match!
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.6, color: '#6B7280', margin: 0 }}>{v.expertReason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reveal / Score */}
        {allRanked && !revealed && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleReveal}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'white',
                background: `linear-gradient(135deg, ${ACCENT}, #0F3460)`,
                border: 'none',
                borderRadius: 10,
                padding: isMobile ? '14px 28px' : '12px 32px',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${ACCENT}40`,
                transition: 'transform 0.2s ease',
                minHeight: 44,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Compare with Experts
            </button>
          </div>
        )}

        {revealed && (
          <>
            <div style={{
              textAlign: 'center',
              padding: '1.25rem',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${ACCENT}08, #0F346008)`,
              border: `1px solid ${ACCENT}20`,
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Taste alignment</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{score}%</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#6B7280', marginTop: 8 }}>
                {(score ?? 0) >= 80 ? "Your taste is razor-sharp. You see what the experts see." :
                 (score ?? 0) >= 50 ? "Solid instincts. Disagreements in the middle ranks are normal \u2014 taste is subjective at the margins." :
                 "Interesting \u2014 you see things differently than the panel. That's not wrong. But understanding WHY experts disagree helps sharpen your eye."}
              </p>
            </div>

            {/* Key insight */}
            <div style={{
              padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${ACCENT}06, #F5A62306)`,
              border: `1px solid ${ACCENT}15`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${ACCENT}, #F5A623)`, borderRadius: '3px 0 0 3px' }} />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: ACCENT, margin: '0 0 0.5rem' }}>Key insight</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.7, color: '#1A1A2E', margin: 0 }}>
                <strong>Taste is the skill.</strong> AI generates options. <em>You</em> choose the right one. That judgment &mdash; knowing why option A is better than option B &mdash; is irreplaceable.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button
                onClick={() => switchDomain(activeDomain)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                  color: '#6B7280', background: 'transparent', border: '1px solid rgba(26,26,46,0.12)',
                  borderRadius: 8, padding: '8px 20px', cursor: 'pointer', transition: 'all 0.2s ease',
                  letterSpacing: '0.05em', minHeight: 44,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.12)'; e.currentTarget.style.color = '#6B7280'; }}
              >
                Try again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

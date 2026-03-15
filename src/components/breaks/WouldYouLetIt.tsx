import { useState } from 'react';

type Choice = 'just-do-it' | 'ask-first' | 'never-allow' | null;

interface Scenario {
  situation: string;
  insight: string;
}

const scenarios: Scenario[] = [
  {
    situation: "Your AI agent wants to reply to a group chat message with 'sounds good, I'll be there at 7'",
    insight: "Messaging on your behalf seems harmless, but tone and context matter. What if 'sounds good' is wrong for the situation?",
  },
  {
    situation: "Your AI agent wants to submit your completed homework assignment to Google Classroom",
    insight: "The homework is done, but did you actually review it? Submitting means you're vouching for the work.",
  },
  {
    situation: "Your AI agent wants to post a photo to your Instagram story with a caption it wrote",
    insight: "Social media is your personal brand. An AI can draft, but you should own what goes out with your name on it.",
  },
];

type Profile = {
  label: string;
  description: string;
  color: string;
};

function getProfile(choices: Choice[]): Profile {
  const counts = { 'just-do-it': 0, 'ask-first': 0, 'never-allow': 0 };
  choices.forEach((c) => {
    if (c) counts[c]++;
  });

  if (counts['just-do-it'] >= 2) {
    return {
      label: 'The Delegator',
      description: 'You trust fast, but watch for edge cases.',
      color: '#16C79A',
    };
  }
  if (counts['ask-first'] >= 2) {
    return {
      label: 'The Collaborator',
      description: 'Balanced and thoughtful.',
      color: '#F5A623',
    };
  }
  if (counts['never-allow'] >= 2) {
    return {
      label: 'The Guardian',
      description: 'You keep tight control.',
      color: '#E94560',
    };
  }
  return {
    label: 'The Pragmatist',
    description: 'It depends on the stakes.',
    color: '#7B61FF',
  };
}

const choiceOptions = [
  { key: 'just-do-it' as const, label: 'Just do it', color: '#16C79A' },
  { key: 'ask-first' as const, label: 'Ask me first', color: '#F5A623' },
  { key: 'never-allow' as const, label: 'Never allow', color: '#E94560' },
];

export default function WouldYouLetIt() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([null, null, null]);
  const [showInsight, setShowInsight] = useState(false);
  const [done, setDone] = useState(false);

  const scenario = scenarios[currentIndex];

  const handleChoice = (choice: Choice) => {
    if (showInsight) return;
    const updated = [...choices];
    updated[currentIndex] = choice;
    setChoices(updated);
    setShowInsight(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= scenarios.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setShowInsight(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setChoices([null, null, null]);
    setShowInsight(false);
    setDone(false);
  };

  // Final profile screen
  if (done) {
    const profile = getProfile(choices);
    return (
      <div className="widget-container">
        <div style={{ padding: '2.5rem 2rem', textAlign: 'center' as const }}>
          {/* Profile label */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#6B7280',
              marginBottom: '0.75rem',
            }}
          >
            Your autonomy profile
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              color: profile.color,
              marginBottom: '0.5rem',
              lineHeight: 1.2,
              animation: 'wyli-popIn 0.4s ease both',
            }}
          >
            {profile.label}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              color: '#1A1A2E',
              lineHeight: 1.7,
              maxWidth: '38ch',
              margin: '0 auto 1.5rem',
            }}
          >
            {profile.description}
          </p>

          {/* Recap of choices */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 8,
              marginBottom: '1.75rem',
              maxWidth: 400,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {scenarios.map((s, i) => {
              const choice = choices[i];
              const opt = choiceOptions.find((o) => o.key === choice);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0.5rem 0.75rem',
                    borderRadius: 8,
                    background: 'rgba(26,26,46,0.025)',
                    border: '1px solid rgba(26,26,46,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: opt?.color || '#6B7280',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem',
                      color: '#6B7280',
                      flex: 1,
                      lineHeight: 1.4,
                    }}
                  >
                    {i + 1}. {s.situation.length > 60 ? s.situation.slice(0, 60) + '...' : s.situation}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: opt?.color || '#6B7280',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {opt?.label}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.6rem 1.5rem',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              background: '#1A1A2E',
              color: '#FAF8F5',
              transition: 'all 0.25s',
              minHeight: 44,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Play Again
          </button>
        </div>

        <style>{`
          @keyframes wyli-popIn { from { opacity: 0; transform: scale(0.85) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </div>
    );
  }

  // Active scenario screen
  const currentChoice = choices[currentIndex];
  const chosenOpt = choiceOptions.find((o) => o.key === currentChoice);

  return (
    <div className="widget-container">
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(26,26,46,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
                color: '#1A1A2E',
              }}
            >
              Would You Let It?
            </h3>
          </div>
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {scenarios.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background:
                  i < currentIndex
                    ? choiceOptions.find((o) => o.key === choices[i])?.color || '#6B7280'
                    : i === currentIndex
                      ? '#1A1A2E'
                      : 'rgba(26,26,46,0.12)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.5rem' }}>
        {/* Scenario number */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: '#6B7280',
            marginBottom: '0.75rem',
          }}
        >
          Scenario {currentIndex + 1} of {scenarios.length}
        </div>

        {/* Scenario card */}
        <div
          style={{
            background: 'rgba(26,26,46,0.025)',
            border: '1px solid rgba(26,26,46,0.06)',
            borderRadius: 12,
            padding: '1.5rem',
            marginBottom: '1.25rem',
            transition: 'all 0.4s ease',
            ...(showInsight
              ? {
                  borderColor: `${chosenOpt?.color || '#6B7280'}30`,
                  background: `${chosenOpt?.color || '#6B7280'}08`,
                }
              : {}),
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#7B61FF',
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#7B61FF',
                animation: !showInsight ? 'wyli-pulse 2s infinite' : 'none',
              }}
            />
            AI Agent Request
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: '#1A1A2E',
              margin: 0,
            }}
          >
            {scenario.situation}
          </p>
        </div>

        {/* Choice buttons */}
        {!showInsight && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
              marginBottom: '1rem',
            }}
          >
            {choiceOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleChoice(opt.key)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.75rem 0.5rem',
                  borderRadius: 10,
                  border: `2px solid ${opt.color}40`,
                  background: `${opt.color}08`,
                  color: opt.color,
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  minHeight: 48,
                  lineHeight: 1.3,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = opt.color;
                  e.currentTarget.style.background = `${opt.color}14`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${opt.color}40`;
                  e.currentTarget.style.background = `${opt.color}08`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Insight after choosing */}
        {showInsight && (
          <>
            {/* Selected choice badge */}
            <div
              style={{
                display: 'inline-block',
                padding: '0.35rem 0.75rem',
                borderRadius: 100,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                background: `${chosenOpt?.color || '#6B7280'}18`,
                color: chosenOpt?.color || '#6B7280',
                marginBottom: '0.75rem',
                animation: 'wyli-popIn 0.3s ease both',
              }}
            >
              You chose: {chosenOpt?.label}
            </div>

            {/* Insight box */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(123,97,255,0.04), rgba(123,97,255,0.08))',
                border: '1px solid rgba(123,97,255,0.15)',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                animation: 'wyli-slideUp 0.4s ease both 0.1s',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: '#1A1A2E',
                  margin: 0,
                }}
              >
                {scenario.insight}
              </p>
            </div>

            {/* Next button */}
            <div style={{ textAlign: 'right' as const }}>
              <button
                onClick={handleNext}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.6rem 1.5rem',
                  borderRadius: 100,
                  border: 'none',
                  cursor: 'pointer',
                  background: '#1A1A2E',
                  color: '#FAF8F5',
                  transition: 'all 0.25s',
                  minHeight: 44,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {currentIndex + 1 >= scenarios.length ? 'See Your Profile' : 'Next Scenario'} &rarr;
              </button>
            </div>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes wyli-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes wyli-slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wyli-popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

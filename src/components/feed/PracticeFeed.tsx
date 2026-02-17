import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { buildFeedQueue, appendToFeedQueue, ALL_CHALLENGES } from '../../lib/feed';
import type { Challenge, ComparisonData, ChallengeType } from '../../data/challenges';
import FeedCardDeck from './FeedCardDeck';
import FeedScroll from './FeedScroll';
import FeedCard from './FeedCard';
import FeedHeroCard from './FeedHeroCard';
import PeerComparison from './PeerComparison';

// Lazy-loaded challenge components
const CHALLENGE_COMPONENTS: Record<ChallengeType, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'prompt-forge': lazy(() => import('./challenges/PromptForge')),
  'reverse-engineer': lazy(() => import('./challenges/ReverseEngineer')),
  'taste-curator': lazy(() => import('./challenges/TasteCurator')),
  'trust-call': lazy(() => import('./challenges/TrustCall')),
  'first-principles': lazy(() => import('./challenges/FirstPrinciples')),
  'context-surgeon': lazy(() => import('./challenges/ContextSurgeon')),
  'debug-detective': lazy(() => import('./challenges/DebugDetective')),
  'tool-chain': lazy(() => import('./challenges/ToolChain')),
  'agent-architect': lazy(() => import('./challenges/AgentArchitect')),
};

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
    }}>
      <div style={{
        width: 28,
        height: 28,
        border: '3px solid rgba(123, 97, 255, 0.15)',
        borderTopColor: '#7B61FF',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function getSessionId(): string {
  if (typeof document === 'undefined') return 'ssr';
  const match = document.cookie.match(/(?:^|; )ab_session=([^;]*)/);
  if (match) return match[1];
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
  document.cookie = `ab_session=${id}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
  return id;
}

export default function PracticeFeed() {
  const isMobile = useIsMobile();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<Challenge[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonChallenge, setComparisonChallenge] = useState<Challenge | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize feed queue
  useEffect(() => {
    setQueue(buildFeedQueue(completedIds));
  }, []);

  // Set card-deck-page class on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('card-deck-page');
      return () => { document.body.classList.remove('card-deck-page'); };
    }
  }, [isMobile]);

  // Track start time per challenge
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [activeIndex]);

  // Infinite loading: append more when near end
  useEffect(() => {
    if (activeIndex >= queue.length - 2 && queue.length > 0) {
      setQueue((prev) => appendToFeedQueue(prev, completedIds));
    }
  }, [activeIndex, queue.length, completedIds]);

  const handleActiveChange = useCallback((index: number) => {
    setActiveIndex(index);
    // Close comparison when scrolling to new card
    setComparisonOpen(false);
  }, []);

  const handleSubmit = useCallback(async (challenge: Challenge, submission: Record<string, unknown>) => {
    const timeMs = Date.now() - startTimeRef.current;
    const sessionId = getSessionId();

    setCompletedIds((prev) => new Set([...prev, challenge.id]));
    setComparisonChallenge(challenge);
    setComparisonLoading(true);
    setComparisonOpen(true);

    try {
      const res = await fetch('/api/feed/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          challengeId: challenge.id,
          challengeType: challenge.type,
          conceptArea: challenge.conceptArea,
          submission,
          timeMs,
          usedAi: ['prompt-forge', 'context-surgeon'].includes(challenge.type),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComparisonData(data);
      } else {
        setComparisonData(null);
      }
    } catch {
      setComparisonData(null);
    } finally {
      setComparisonLoading(false);
    }
  }, []);

  // Build the card list: hero + challenges
  const heroCard = (
    <FeedHeroCard
      totalChallenges={ALL_CHALLENGES.length}
      completedCount={completedIds.size}
    />
  );

  const challengeCards = queue.map((challenge, i) => {
    const ChallengeComponent = CHALLENGE_COMPONENTS[challenge.type];
    const isCompleted = completedIds.has(challenge.id);
    // Account for hero card offset: card at queue index i is at children index i+1
    const isActive = activeIndex === i + 1;

    return (
      <FeedCard key={challenge.id} challenge={challenge} isCompleted={isCompleted}>
        <Suspense fallback={<LoadingFallback />}>
          <ChallengeComponent
            challenge={challenge}
            onSubmit={(sub: Record<string, unknown>) => handleSubmit(challenge, sub)}
            isMobile={isMobile}
            isActive={isActive}
          />
        </Suspense>
        {/* Inline comparison for desktop */}
        {!isMobile && isCompleted && comparisonChallenge?.id === challenge.id && (
          <PeerComparison
            isOpen={comparisonOpen}
            onClose={() => setComparisonOpen(false)}
            challenge={challenge}
            data={comparisonData}
            isLoading={comparisonLoading}
            isMobile={false}
          />
        )}
      </FeedCard>
    );
  });

  const allCards = [heroCard, ...challengeCards];

  return (
    <>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(250, 248, 245, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(26, 26, 46, 0.04)',
      }}>
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '0 16px',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a
            href="/"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: 'var(--color-subtle)',
              textDecoration: 'none',
              opacity: 0.7,
            }}
          >
            Talking to Machines
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href="/profile"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--color-subtle)',
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              Profile
            </a>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#16C79A',
            }}>
              {completedIds.size} done
            </span>
          </div>
        </div>
      </header>

      {/* Feed content */}
      <div style={{ paddingTop: isMobile ? 0 : 48 }}>
        {isMobile ? (
          <FeedCardDeck
            activeIndex={activeIndex}
            onActiveChange={handleActiveChange}
          >
            {allCards}
          </FeedCardDeck>
        ) : (
          <FeedScroll
            activeIndex={activeIndex}
            onActiveChange={handleActiveChange}
          >
            {allCards}
          </FeedScroll>
        )}
      </div>

      {/* Mobile comparison overlay */}
      {isMobile && comparisonChallenge && (
        <PeerComparison
          isOpen={comparisonOpen}
          onClose={() => setComparisonOpen(false)}
          challenge={comparisonChallenge}
          data={comparisonData}
          isLoading={comparisonLoading}
          isMobile={true}
        />
      )}
    </>
  );
}

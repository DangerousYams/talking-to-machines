import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import type { ConceptArea } from '../../data/challenges';
import { CONCEPT_AREA_LABELS, CHALLENGE_TYPE_META } from '../../data/challenges';
import { ALL_CHALLENGES } from '../../lib/feed';
import ConceptWeb from './ConceptWeb';

interface SessionProgress {
  total_completed: number;
  completed_ids: string[];
  prompt_craft: number;
  context_engineering: number;
  tool_landscape: number;
  tool_use: number;
  agent_design: number;
  coding_with_ai: number;
  critical_thinking: number;
  human_judgment: number;
}

function getSessionId(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|; )ab_session=([^;]*)/);
  return match ? match[1] : '';
}

export default function ProfileView() {
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/feed/progress?sessionId=${encodeURIComponent(sessionId)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setProgress(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute concept web data (0-1 scale)
  const conceptMax = 5; // Normalize against 5 completions per area
  const conceptData: Record<ConceptArea, number> = {
    'prompt-craft': Math.min((progress?.prompt_craft || 0) / conceptMax, 1),
    'context-engineering': Math.min((progress?.context_engineering || 0) / conceptMax, 1),
    'tool-landscape': Math.min((progress?.tool_landscape || 0) / conceptMax, 1),
    'tool-use': Math.min((progress?.tool_use || 0) / conceptMax, 1),
    'agent-design': Math.min((progress?.agent_design || 0) / conceptMax, 1),
    'coding-with-ai': Math.min((progress?.coding_with_ai || 0) / conceptMax, 1),
    'critical-thinking': Math.min((progress?.critical_thinking || 0) / conceptMax, 1),
    'human-judgment': Math.min((progress?.human_judgment || 0) / conceptMax, 1),
  };

  const completedIds = new Set(progress?.completed_ids || []);
  const completedChallenges = ALL_CHALLENGES.filter((c) => completedIds.has(c.id));
  const totalChallenges = ALL_CHALLENGES.length;
  const totalCompleted = progress?.total_completed || 0;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid rgba(123, 97, 255, 0.15)',
          borderTopColor: '#7B61FF',
          borderRadius: '50%',
          animation: 'profileSpin 0.8s linear infinite',
        }} />
        <style>{`@keyframes profileSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 640,
      margin: '0 auto',
      padding: isMobile ? '16px' : '32px 16px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? '1.8rem' : '2.4rem',
          fontWeight: 800,
          color: 'var(--color-deep)',
          marginBottom: 8,
          lineHeight: 1.1,
        }}>
          Your Practice Profile
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          color: 'var(--color-subtle)',
          lineHeight: 1.5,
        }}>
          {totalCompleted === 0
            ? 'Start practicing to build your skill profile'
            : `${totalCompleted} of ${totalChallenges} challenges completed`
          }
        </p>
      </div>

      {/* Concept Web */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(26, 26, 46, 0.06)',
        borderRadius: 16,
        padding: isMobile ? 20 : 32,
        marginBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-subtle)',
          marginBottom: 24,
        }}>
          Concept Coverage
        </h2>
        <ConceptWeb
          data={conceptData}
          size={isMobile ? 260 : 340}
          animated={true}
        />

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          marginTop: 24,
          maxWidth: 400,
        }}>
          {(Object.entries(CONCEPT_AREA_LABELS) as [ConceptArea, string][]).map(([key, label]) => {
            const count = progress?.[key.replace(/-/g, '_') as keyof SessionProgress] as number || 0;
            return (
              <span
                key={key}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  color: count > 0 ? 'var(--color-deep)' : 'var(--color-subtle)',
                  opacity: count > 0 ? 1 : 0.4,
                  background: count > 0 ? 'rgba(123, 97, 255, 0.06)' : 'rgba(26, 26, 46, 0.03)',
                  padding: '4px 8px',
                  borderRadius: 4,
                }}
              >
                {label} ({count})
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 32,
      }}>
        {[
          { label: 'Completed', value: totalCompleted, color: '#16C79A' },
          { label: 'Remaining', value: totalChallenges - totalCompleted, color: 'var(--color-subtle)' },
          { label: 'Coverage', value: `${Math.round((Object.values(conceptData).filter(v => v > 0).length / 8) * 100)}%`, color: '#7B61FF' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(26, 26, 46, 0.06)',
              borderRadius: 12,
              padding: '16px 12px',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.6rem',
              fontWeight: 800,
              color: stat.color,
              lineHeight: 1,
              marginBottom: 4,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-subtle)',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Completions */}
      {completedChallenges.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(26, 26, 46, 0.06)',
          borderRadius: 16,
          padding: isMobile ? 20 : 24,
          marginBottom: 32,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-subtle)',
            marginBottom: 16,
          }}>
            Completed Challenges
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {completedChallenges.slice(0, 20).map((challenge) => {
              const meta = CHALLENGE_TYPE_META[challenge.type];
              return (
                <div
                  key={challenge.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(26, 26, 46, 0.015)',
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-deep)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {challenge.title}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      color: 'var(--color-subtle)',
                      letterSpacing: '0.02em',
                    }}>
                      {meta.label} · {CONCEPT_AREA_LABELS[challenge.conceptArea]}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 8l3 3 5-5" stroke="#16C79A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalCompleted === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(26, 26, 46, 0.06)',
          borderRadius: 16,
          marginBottom: 32,
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎯</div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'var(--color-deep)',
            marginBottom: 8,
            lineHeight: 1.5,
          }}>
            Your profile builds as you practice
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-subtle)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}>
            Complete challenges in the feed to fill your concept web and see how you compare to others.
          </p>
          <a
            href="/feed"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: 8,
              background: 'var(--color-deep)',
              color: 'var(--color-cream)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Start Practicing
          </a>
        </div>
      )}

      {/* Back to feed */}
      <div style={{ textAlign: 'center', paddingBottom: 40 }}>
        <a
          href="/feed"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--color-subtle)',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
        >
          ← Back to The Arena
        </a>
      </div>
    </div>
  );
}

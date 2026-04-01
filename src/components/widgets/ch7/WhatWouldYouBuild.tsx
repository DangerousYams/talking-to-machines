import { useState, useMemo, useEffect } from 'react';
import { personalSoftwareGallery, domains, type PersonalSoftwareExample } from '../../../data/personal-software-gallery';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

const ACCENT = '#7B61FF';
const STORAGE_KEY = 'ttm_my_project_idea';

const feasibilityConfig: Record<string, { label: string; color: string; bg: string }> = {
  weekend: { label: 'Weekend build', color: '#16C79A', bg: 'rgba(22, 199, 154, 0.1)' },
  week: { label: 'One-week project', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.1)' },
  month: { label: 'Month-long build', color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.1)' },
};

function InspirationCard({
  example,
  isMobile,
  onTap,
}: {
  example: PersonalSoftwareExample;
  isMobile: boolean;
  onTap: () => void;
}) {
  const feasibility = feasibilityConfig[example.feasibility];

  const card = (
    <div
      onClick={onTap}
      style={{
        background: 'white',
        border: '1px solid rgba(26, 26, 46, 0.08)',
        borderRadius: 12,
        padding: isMobile ? '1rem' : '1.25rem 1.5rem',
        cursor: isMobile ? 'pointer' : 'default',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.borderColor = ACCENT + '30';
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
        }
      }}
    >
      {/* Idea name */}
      <h4
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? '0.95rem' : '1.02rem',
          fontWeight: 700,
          color: ACCENT,
          margin: '0 0 0.4rem',
          lineHeight: 1.3,
        }}
      >
        {example.idea}
      </h4>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: isMobile ? '0.82rem' : '0.85rem',
          lineHeight: 1.6,
          color: '#1A1A2E',
          margin: '0 0 0.65rem',
          opacity: 0.8,
        }}
      >
        {example.description}
      </p>

      {/* Builder line */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.78rem',
          color: '#6B7280',
          margin: '0 0 0.75rem',
          fontStyle: 'italic',
          lineHeight: 1.4,
        }}
      >
        Built by {example.builder} — {example.builderType}
      </p>

      {/* Stack icons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: '0.35rem',
          marginBottom: '0.65rem',
        }}
      >
        {example.stackIcons.map((icon) => (
          <span
            key={icon.name}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 500,
              color: '#1A1A2E',
              background: 'rgba(26, 26, 46, 0.04)',
              border: '1px solid rgba(26, 26, 46, 0.06)',
              borderRadius: 6,
              padding: '2px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap' as const,
            }}
          >
            <span style={{ fontSize: '0.72rem' }}>{icon.emoji}</span>
            {icon.name}
          </span>
        ))}
      </div>

      {/* Feasibility badge */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: feasibility.color,
          background: feasibility.bg,
          padding: '3px 10px',
          borderRadius: 20,
          display: 'inline-block',
        }}
      >
        {feasibility.label}
      </span>
    </div>
  );

  return card;
}

export default function WhatWouldYouBuild() {
  const isMobile = useIsMobile();
  const [activeDomain, setActiveDomain] = useState<string>('all');
  const [sheetExample, setSheetExample] = useState<PersonalSoftwareExample | null>(null);
  const [ideaText, setIdeaText] = useState('');
  const [saved, setSaved] = useState(false);

  // Load saved idea from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setIdeaText(stored);
        setSaved(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const filteredExamples = useMemo(() => {
    if (activeDomain === 'all') return personalSoftwareGallery;
    return personalSoftwareGallery.filter((ex) => ex.domain === activeDomain);
  }, [activeDomain]);

  const handleSave = () => {
    if (!ideaText.trim()) return;
    try {
      localStorage.setItem(STORAGE_KEY, ideaText.trim());
      setSaved(true);
    } catch {
      // localStorage unavailable
    }
  };

  const handleIdeaChange = (value: string) => {
    setIdeaText(value);
    if (saved) setSaved(false);
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div
          style={{
            padding: '0.75rem 1rem 0',
            borderBottom: '1px solid rgba(26, 26, 46, 0.06)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '0.5rem',
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#1A1A2E',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                What Would You Build?
              </h3>
            </div>
          </div>
        </div>

        {/* Domain filter pills — horizontal scroll */}
        <div
          style={{
            display: 'flex',
            gap: '0.3rem',
            padding: '8px 12px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch' as any,
            flexShrink: 0,
          }}
        >
          {domains.map((d) => {
            const isActive = d.id === activeDomain;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDomain(d.id)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 6,
                  border: `1px solid ${isActive ? ACCENT + '40' : 'rgba(26, 26, 46, 0.08)'}`,
                  background: isActive ? ACCENT : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: isActive ? 'white' : '#6B7280',
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap' as const,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: '0.72rem' }}>{d.emoji}</span>
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Cards list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 12px 8px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.25rem' }}>
            {filteredExamples.map((ex) => (
              <InspirationCard
                key={ex.id}
                example={ex}
                isMobile={true}
                onTap={() => setSheetExample(ex)}
              />
            ))}
          </div>

          {filteredExamples.length === 0 && (
            <div
              style={{
                textAlign: 'center' as const,
                padding: '2rem 1rem',
                color: '#6B7280',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
              }}
            >
              No projects in this category yet.
            </div>
          )}

          {/* Your Turn section */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              background: 'rgba(123, 97, 255, 0.03)',
              border: `1px solid ${ACCENT}18`,
              borderRadius: 12,
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#1A1A2E',
                margin: '0 0 0.35rem',
              }}
            >
              Your turn
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                color: '#6B7280',
                margin: '0 0 0.75rem',
                lineHeight: 1.5,
              }}
            >
              What problem would you solve with personal software?
            </p>
            <textarea
              value={ideaText}
              onChange={(e) => handleIdeaChange(e.target.value)}
              placeholder="I'd build an app that..."
              style={{
                width: '100%',
                minHeight: 72,
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                color: '#1A1A2E',
                background: 'white',
                border: '1px solid rgba(26, 26, 46, 0.1)',
                borderRadius: 8,
                padding: '10px 12px',
                resize: 'vertical' as const,
                outline: 'none',
                boxSizing: 'border-box' as const,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = ACCENT + '40';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}0A`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleSave}
                disabled={!ideaText.trim()}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: 8,
                  border: 'none',
                  background: ideaText.trim() ? ACCENT : 'rgba(26, 26, 46, 0.08)',
                  color: ideaText.trim() ? 'white' : '#6B7280',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: ideaText.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.04em',
                }}
              >
                Save idea
              </button>
              {saved && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: '#16C79A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16C79A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved! You'll use this in Chapter 11.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BottomSheet for card detail */}
        <BottomSheet
          isOpen={!!sheetExample}
          onClose={() => setSheetExample(null)}
          title={sheetExample?.idea || ''}
        >
          {sheetExample && (() => {
            const feasibility = feasibilityConfig[sheetExample.feasibility];
            return (
              <div>
                {/* Description */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    lineHeight: 1.7,
                    color: '#1A1A2E',
                    margin: '0 0 0.75rem',
                  }}
                >
                  {sheetExample.description}
                </p>

                {/* Builder */}
                <div
                  style={{
                    background: 'rgba(26, 26, 46, 0.02)',
                    borderRadius: 8,
                    border: '1px solid rgba(26, 26, 46, 0.06)',
                    padding: '0.65rem 0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase' as const,
                      color: ACCENT,
                      marginBottom: '0.2rem',
                    }}
                  >
                    Builder
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.82rem',
                      color: '#1A1A2E',
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {sheetExample.builder} — {sheetExample.builderType}
                  </p>
                </div>

                {/* Tech stack */}
                <div
                  style={{
                    background: 'rgba(26, 26, 46, 0.02)',
                    borderRadius: 8,
                    border: '1px solid rgba(26, 26, 46, 0.06)',
                    padding: '0.65rem 0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase' as const,
                      color: ACCENT,
                      marginBottom: '0.35rem',
                    }}
                  >
                    Tech Stack
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.35rem' }}>
                    {sheetExample.stackIcons.map((icon) => (
                      <span
                        key={icon.name}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          color: '#1A1A2E',
                          background: 'rgba(26, 26, 46, 0.04)',
                          border: '1px solid rgba(26, 26, 46, 0.06)',
                          borderRadius: 6,
                          padding: '3px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span>{icon.emoji}</span>
                        {icon.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feasibility */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase' as const,
                      color: '#6B7280',
                    }}
                  >
                    Time estimate:
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: feasibility.color,
                      background: feasibility.bg,
                      padding: '3px 10px',
                      borderRadius: 20,
                    }}
                  >
                    {feasibility.label}
                  </span>
                </div>
              </div>
            );
          })()}
        </BottomSheet>
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div className="widget-container">
      {/* Header */}
      <div
        style={{
          padding: '1.5rem 2rem 0',
          borderBottom: '1px solid rgba(26, 26, 46, 0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1A1A2E',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              What Would You Build?
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#6B7280',
                margin: 0,
                letterSpacing: '0.05em',
              }}
            >
              {personalSoftwareGallery.length} projects built by people like you
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem 2rem' }}>
        {/* Domain filter pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap' as const,
            marginBottom: '1.5rem',
          }}
        >
          {domains.map((d) => {
            const isActive = d.id === activeDomain;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDomain(d.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 8,
                  border: `1px solid ${isActive ? ACCENT + '40' : 'rgba(26, 26, 46, 0.08)'}`,
                  background: isActive ? ACCENT : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: isActive ? 'white' : '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  whiteSpace: 'nowrap' as const,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span style={{ fontSize: '0.8rem' }}>{d.emoji}</span>
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Card grid */}
        {filteredExamples.length === 0 ? (
          <div
            style={{
              textAlign: 'center' as const,
              padding: '3rem 1rem',
              color: '#6B7280',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            }}
          >
            No projects in this category yet.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {filteredExamples.map((ex) => (
              <InspirationCard
                key={ex.id}
                example={ex}
                isMobile={false}
                onTap={() => {}}
              />
            ))}
          </div>
        )}

        {/* Your Turn section */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: `rgba(123, 97, 255, 0.03)`,
            border: `1px solid ${ACCENT}18`,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem',
            }}
          >
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#1A1A2E',
                  margin: '0 0 0.3rem',
                }}
              >
                Your turn
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: '#6B7280',
                  margin: '0 0 0.85rem',
                  lineHeight: 1.5,
                }}
              >
                What problem in your life would you solve with personal software? Describe the tool you wish existed.
              </p>
              <textarea
                value={ideaText}
                onChange={(e) => handleIdeaChange(e.target.value)}
                placeholder="I'd build an app that..."
                rows={3}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                  color: '#1A1A2E',
                  background: 'white',
                  border: '1px solid rgba(26, 26, 46, 0.1)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  resize: 'vertical' as const,
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = ACCENT + '40';
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}0A`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '0.65rem',
                }}
              >
                <button
                  onClick={handleSave}
                  disabled={!ideaText.trim()}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 8,
                    border: 'none',
                    background: ideaText.trim() ? ACCENT : 'rgba(26, 26, 46, 0.08)',
                    color: ideaText.trim() ? 'white' : '#6B7280',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: ideaText.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.04em',
                  }}
                  onMouseEnter={(e) => {
                    if (ideaText.trim()) {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Save idea
                </button>
                {saved && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: '#16C79A',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16C79A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Idea saved! You'll use this in Chapter 11.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '1rem 2rem',
          borderTop: '1px solid rgba(26, 26, 46, 0.04)',
          textAlign: 'center' as const,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'rgba(26, 26, 46, 0.3)',
            letterSpacing: '0.05em',
            margin: 0,
            textWrap: 'balance' as any,
          }}
        >
          Every one of these was built by someone who started with just an idea.
        </p>
      </div>
    </div>
  );
}

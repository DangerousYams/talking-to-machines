import React, { useState, useMemo } from 'react';
import type { ChallengeComponentProps, ContextSurgeonPayload } from '../../../data/challenges';

export default function ContextSurgeon({ challenge, onSubmit, isMobile }: ChallengeComponentProps) {
  const payload = challenge.payload as ContextSurgeonPayload;
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const tokensUsed = useMemo(() => {
    let total = 0;
    for (const doc of payload.documents) {
      if (selectedDocs.has(doc.id)) total += doc.tokens;
    }
    return total;
  }, [selectedDocs, payload.documents]);

  const isOverBudget = tokensUsed > payload.budgetTokens;
  const budgetPercent = Math.min(100, (tokensUsed / payload.budgetTokens) * 100);

  const toggleDoc = (id: string) => {
    if (submitted) return;
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (isOverBudget || selectedDocs.size === 0) return;
    setSubmitted(true);

    const optimal = new Set(payload.optimalIds);
    const correctCount = [...selectedDocs].filter((id) => optimal.has(id)).length;
    const score = correctCount / optimal.size;

    onSubmit({
      selectedIds: [...selectedDocs],
      tokensUsed,
      score,
      optimalIds: payload.optimalIds,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Task */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(123, 97, 255, 0.04)',
        border: '1px solid rgba(123, 97, 255, 0.1)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {payload.task}
        </p>
      </div>

      {/* Token budget meter */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: isOverBudget ? '#E94560' : 'var(--color-subtle)',
          }}>
            {tokensUsed.toLocaleString()} / {payload.budgetTokens.toLocaleString()} tokens
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: isOverBudget ? '#E94560' : '#7B61FF',
          }}>
            {isOverBudget ? 'OVER BUDGET' : `${Math.round(budgetPercent)}%`}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: 'rgba(26, 26, 46, 0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(100, budgetPercent)}%`,
            height: '100%',
            borderRadius: 3,
            background: isOverBudget
              ? '#E94560'
              : budgetPercent > 80 ? '#F5A623' : '#7B61FF',
            transition: 'all 0.3s',
          }} />
        </div>
      </div>

      {/* Documents */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {payload.documents.map((doc) => {
          const isSelected = selectedDocs.has(doc.id);
          const isOptimal = submitted && payload.optimalIds.includes(doc.id);
          const isMissed = submitted && isOptimal && !isSelected;
          const isExtra = submitted && isSelected && !isOptimal;

          let borderColor = 'rgba(26, 26, 46, 0.06)';
          if (isSelected && !submitted) borderColor = '#7B61FF';
          if (isOptimal) borderColor = '#16C79A';
          if (isMissed) borderColor = '#F5A623';
          if (isExtra) borderColor = '#E94560';

          const relevanceColors = { high: '#16C79A', medium: '#F5A623', low: '#E94560' };

          return (
            <button
              key={doc.id}
              onClick={() => toggleDoc(doc.id)}
              disabled={submitted}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                border: `1.5px solid ${borderColor}`,
                background: isSelected && !submitted ? 'rgba(123, 97, 255, 0.04)' : '#FFFFFF',
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `1.5px solid ${isSelected ? '#7B61FF' : 'rgba(26, 26, 46, 0.15)'}`,
                background: isSelected ? '#7B61FF' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

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
                  {doc.label}
                </div>
              </div>

              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                fontWeight: 600,
                color: 'var(--color-subtle)',
                flexShrink: 0,
              }}>
                {doc.tokens} tok
              </span>

              {submitted && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  color: relevanceColors[doc.relevance],
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}>
                  {doc.relevance}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Submit */}
      {selectedDocs.size > 0 && !isOverBudget && !submitted && (
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-deep)',
            color: 'var(--color-cream)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          Pack Context & Submit
        </button>
      )}
    </div>
  );
}

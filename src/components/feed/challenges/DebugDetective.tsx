import React, { useState } from 'react';
import type { ChallengeComponentProps, DebugDetectivePayload } from '../../../data/challenges';

const BUG_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  'ambiguous': { label: 'Ambiguous', color: '#F5A623' },
  'contradictory': { label: 'Contradictory', color: '#E94560' },
  'missing-context': { label: 'Missing Context', color: '#7B61FF' },
  'too-many-tasks': { label: 'Too Many Tasks', color: '#0EA5E9' },
  'leading': { label: 'Leading Question', color: '#0F3460' },
};

export default function DebugDetective({ challenge, onSubmit }: ChallengeComponentProps) {
  const payload = challenge.payload as DebugDetectivePayload;
  const [identifiedBugs, setIdentifiedBugs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleBugSelect = (region: string, bugType: string) => {
    if (submitted) return;
    setIdentifiedBugs((prev) => ({
      ...prev,
      [region]: prev[region] === bugType ? '' : bugType,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correctCount = payload.bugs.filter(
      (bug) => identifiedBugs[bug.region] === bug.bugType
    ).length;

    onSubmit({
      identifiedBugs,
      correctCount,
      totalBugs: payload.bugs.length,
      score: correctCount / payload.bugs.length,
    });
  };

  const bugTypes = Object.keys(BUG_TYPE_LABELS);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Bad prompt */}
      <div style={{
        padding: '14px 16px',
        borderRadius: 10,
        border: '1px solid rgba(233, 69, 96, 0.15)',
        background: 'rgba(233, 69, 96, 0.02)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: '#E94560',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 6,
        }}>
          Buggy Prompt
        </span>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          color: 'var(--color-deep)',
          margin: 0,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}>
          {payload.prompt}
        </p>
      </div>

      {/* Bad output */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid rgba(26, 26, 46, 0.06)',
        background: 'rgba(250, 248, 245, 0.5)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'var(--color-subtle)',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 6,
        }}>
          Result (bad)
        </span>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--color-subtle)',
          margin: 0,
          lineHeight: 1.5,
          maxHeight: 100,
          overflowY: 'auto',
        }}>
          {payload.badOutput}
        </p>
      </div>

      {/* Bug identification */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: 'var(--color-subtle)',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        Diagnose {payload.bugs.length} bugs — select the type for each
      </p>

      {payload.bugs.map((bug, i) => {
        const selected = identifiedBugs[bug.region];
        const isCorrect = submitted && selected === bug.bugType;
        const isWrong = submitted && selected && selected !== bug.bugType;

        return (
          <div
            key={bug.region}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${isCorrect ? '#16C79A' : isWrong ? '#E94560' : 'rgba(26, 26, 46, 0.06)'}`,
              background: isCorrect ? 'rgba(22, 199, 154, 0.04)' : isWrong ? 'rgba(233, 69, 96, 0.02)' : '#FFFFFF',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--color-deep)',
              margin: '0 0 8px',
              lineHeight: 1.4,
              fontStyle: 'italic',
            }}>
              "{bug.region}"
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {bugTypes.map((type) => {
                const cfg = BUG_TYPE_LABELS[type];
                const isActive = selected === type;
                const isAnswer = submitted && type === bug.bugType;

                return (
                  <button
                    key={type}
                    onClick={() => handleBugSelect(bug.region, type)}
                    disabled={submitted}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: `1px solid ${isAnswer ? '#16C79A' : isActive ? cfg.color : 'rgba(26, 26, 46, 0.08)'}`,
                      background: isAnswer ? 'rgba(22, 199, 154, 0.1)' : isActive ? `${cfg.color}10` : 'transparent',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      color: isAnswer ? '#16C79A' : isActive ? cfg.color : 'var(--color-subtle)',
                      cursor: submitted ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Submit */}
      {Object.values(identifiedBugs).filter(Boolean).length > 0 && !submitted && (
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
          Submit Diagnosis
        </button>
      )}

      {/* Explanation */}
      {submitted && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(123, 97, 255, 0.04)',
          border: '1px solid rgba(123, 97, 255, 0.1)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: '#7B61FF',
            display: 'block',
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>
            Fixed prompt
          </span>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--color-deep)',
            margin: '0 0 8px',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}>
            {payload.fixedPrompt}
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-subtle)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {payload.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

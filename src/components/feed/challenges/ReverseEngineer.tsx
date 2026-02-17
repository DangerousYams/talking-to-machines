import React, { useState, useRef, useEffect } from 'react';
import type { ChallengeComponentProps, ReverseEngineerPayload } from '../../../data/challenges';

export default function ReverseEngineer({ challenge, onSubmit, isMobile }: ChallengeComponentProps) {
  const payload = challenge.payload as ReverseEngineerPayload;
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [outputOverflows, setOutputOverflows] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outputRef.current;
    if (el) setOutputOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [payload.output]);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setRevealed(true);
    onSubmit({
      selectedIndex: selected,
      isCorrect: selected === payload.correctIndex,
    });
  };

  const isCorrect = selected === payload.correctIndex;
  const showOutputFull = outputExpanded || revealed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* AI output to reverse-engineer */}
      <div style={{ position: 'relative' }}>
        <div
          ref={outputRef}
          style={{
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid rgba(26, 26, 46, 0.08)',
            background: '#FFFFFF',
            fontFamily: payload.outputType === 'code' ? 'var(--font-mono)' : 'var(--font-body)',
            fontSize: payload.outputType === 'code' ? '0.8rem' : '0.9rem',
            color: 'var(--color-deep)',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            maxHeight: showOutputFull ? 'none' : (isMobile ? 120 : 160),
            overflowY: 'hidden',
            transition: 'max-height 0.2s ease',
          }}
        >
          {payload.output}
        </div>
        {!showOutputFull && outputOverflows && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background: 'linear-gradient(transparent, #FFFFFF)',
            borderRadius: '0 0 10px 10px',
            pointerEvents: 'none',
          }} />
        )}
        {outputOverflows && !revealed && (
          <span
            role="button"
            tabIndex={0}
            onClick={() => setOutputExpanded((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOutputExpanded((v) => !v);
              }
            }}
            style={{
              display: 'inline-block',
              marginTop: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--color-subtle)',
              cursor: 'pointer',
              userSelect: 'none',
              letterSpacing: '0.02em',
            }}
          >
            {outputExpanded ? '▾ Show less' : '▸ Show full output'}
          </span>
        )}
      </div>

      {/* Prompt options */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        color: 'var(--color-subtle)',
        textTransform: 'uppercase',
        marginBottom: -4,
      }}>
        Which prompt created this?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {payload.options.map((option, i) => {
          const isSelected = selected === i;
          const isAnswer = revealed && i === payload.correctIndex;
          const isWrong = revealed && isSelected && !isCorrect;
          const showFull = isSelected || revealed;

          let borderColor = 'rgba(26, 26, 46, 0.08)';
          let bgColor = '#FFFFFF';
          if (isSelected && !revealed) {
            borderColor = '#7B61FF';
            bgColor = 'rgba(123, 97, 255, 0.04)';
          }
          if (isAnswer) {
            borderColor = '#16C79A';
            bgColor = 'rgba(22, 199, 154, 0.06)';
          }
          if (isWrong) {
            borderColor = '#E94560';
            bgColor = 'rgba(233, 69, 96, 0.04)';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1.5px solid ${borderColor}`,
                background: bgColor,
                cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: isAnswer ? '#16C79A' : isWrong ? '#E94560' : 'var(--color-subtle)',
                flexShrink: 0,
                lineHeight: 1.5,
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--color-deep)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical' as any,
                WebkitLineClamp: showFull ? 'unset' : 2,
                overflow: showFull ? 'visible' : 'hidden',
              }}>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submit */}
      {selected !== null && !revealed && (
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
          Lock Answer
        </button>
      )}

      {/* Explanation */}
      {revealed && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: isCorrect ? 'rgba(22, 199, 154, 0.06)' : 'rgba(233, 69, 96, 0.04)',
          border: `1px solid ${isCorrect ? 'rgba(22, 199, 154, 0.15)' : 'rgba(233, 69, 96, 0.1)'}`,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: isCorrect ? '#16C79A' : '#E94560',
            display: 'block',
            marginBottom: 6,
          }}>
            {isCorrect ? 'Correct!' : 'Not quite'}
          </span>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--color-deep)',
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

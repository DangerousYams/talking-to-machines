import { useEffect, useMemo, useState } from 'react';
import {
  ascent1Cards,
  conceptSlides,
  levels,
  levelById,
  placementQuiz,
  placeFromScore,
  type LevelId,
} from '../../data/ladder';
import { loadProgress, saveProgress, resetProgress, type LadderProgress } from './progress';
import ConceptSlide from './ConceptSlide';
import LoopTrainer from './LoopTrainer';
import Sorter from './Sorter';
import MapPicker from './MapPicker';
import Checkpoint from './Checkpoint';

type Screen =
  | { kind: 'welcome' }
  | { kind: 'quiz' }
  | { kind: 'quiz-result'; level: LevelId }
  | { kind: 'map' }
  | { kind: 'card'; index: number };

export default function LadderApp() {
  const [progress, setProgress] = useState<LadderProgress | null>(null);
  const [screen, setScreen] = useState<Screen>({ kind: 'welcome' });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    if (p.placedLevel) setScreen({ kind: 'map' });
  }, []);

  const update = (fn: (p: LadderProgress) => LadderProgress) => {
    setProgress((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveProgress(next);
      return next;
    });
  };

  if (!progress) return <div className="ld-app" />;

  const doneCount = ascent1Cards.filter((c) => progress.cards[c.id]?.done).length;

  function completeCard(cardId: string, score?: number, total?: number) {
    update((p) => ({
      ...p,
      cards: { ...p.cards, [cardId]: { done: true, score, total, at: Date.now() } },
    }));
  }

  function advanceFrom(index: number) {
    if (index + 1 < ascent1Cards.length) {
      setScreen({ kind: 'card', index: index + 1 });
    } else {
      setScreen({ kind: 'map' });
    }
  }

  // ────────────────────────────────────────────────────────────
  return (
    <div className="ld-app">
      <header className="ld-top">
        <button className="ld-brand" onClick={() => setScreen(progress.placedLevel ? { kind: 'map' } : { kind: 'welcome' })}>
          Talking to <span className="ld-brand-accent">Machines</span> · The Ladder
        </button>
        <div className="ld-top-meta">
          {screen.kind === 'card' && (
            <div className="ld-dots">
              {ascent1Cards.map((c, i) => (
                <span
                  key={c.id}
                  className={`ld-dot${progress.cards[c.id]?.done ? ' done' : ''}${screen.index === i ? ' now' : ''}`}
                />
              ))}
            </div>
          )}
          {screen.kind === 'quiz' && <span>placement</span>}
        </div>
      </header>

      <main className="ld-screen">
        {screen.kind === 'welcome' && (
          <Welcome
            onStart={() => setScreen({ kind: 'quiz' })}
            onSkip={() => {
              update((p) => ({ ...p, placedLevel: 'quoter', quizTotal: null }));
              setScreen({ kind: 'map' });
            }}
          />
        )}

        {screen.kind === 'quiz' && (
          <Quiz
            onDone={(total) => {
              const level = placeFromScore(total);
              update((p) => ({ ...p, placedLevel: level, quizTotal: total }));
              setScreen({ kind: 'quiz-result', level });
            }}
          />
        )}

        {screen.kind === 'quiz-result' && (
          <QuizResult level={screen.level} onContinue={() => setScreen({ kind: 'map' })} />
        )}

        {screen.kind === 'map' && (
          <LadderMap
            progress={progress}
            doneCount={doneCount}
            onOpenCard={(i) => setScreen({ kind: 'card', index: i })}
            onContinue={() => {
              const nextIdx = ascent1Cards.findIndex((c) => !progress.cards[c.id]?.done);
              setScreen({ kind: 'card', index: nextIdx === -1 ? 0 : nextIdx });
            }}
            onReset={() => {
              const p = resetProgress();
              setProgress(p);
              setScreen({ kind: 'welcome' });
            }}
          />
        )}

        {screen.kind === 'card' && (() => {
          const card = ascent1Cards[screen.index];
          switch (card.kind) {
            case 'concept':
              return (
                <ConceptSlide
                  key={card.id}
                  slide={conceptSlides[card.conceptId!]}
                  onComplete={() => { completeCard(card.id); advanceFrom(screen.index); }}
                />
              );
            case 'loop':
              return (
                <LoopTrainer
                  key={card.id}
                  onComplete={(score, total) => { completeCard(card.id, score, total); advanceFrom(screen.index); }}
                />
              );
            case 'sorter':
              return (
                <Sorter
                  key={card.id}
                  onComplete={(score, total) => { completeCard(card.id, score, total); advanceFrom(screen.index); }}
                />
              );
            case 'picker':
              return (
                <MapPicker
                  key={card.id}
                  onComplete={(score, total) => { completeCard(card.id, score, total); advanceFrom(screen.index); }}
                />
              );
            case 'checkpoint':
              return (
                <Checkpoint
                  key={card.id}
                  onComplete={(passed, score, total) => {
                    if (passed) {
                      update((p) => ({
                        ...p,
                        cards: { ...p.cards, [card.id]: { done: true, score, total, at: Date.now() } },
                        earnedLevels: p.earnedLevels.includes('curator') ? p.earnedLevels : [...p.earnedLevels, 'curator'],
                      }));
                    }
                    setScreen({ kind: 'map' });
                  }}
                />
              );
          }
        })()}
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function Welcome({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="ld-card ld-center">
      <p className="ld-eyebrow">Talking to Machines presents</p>
      <h1 className="ld-title" style={{ fontSize: 'clamp(2.4rem, 8vw, 4.2rem)' }}>
        Stop quoting machines.<br />
        <span style={{ color: '#E94560' }}>Start talking to them.</span>
      </h1>
      <p className="ld-sub">
        Four levels of AI Thinking. You climb by doing, and every rung is earned, never read.
      </p>
      <p className="ld-footnote" style={{ marginTop: 0 }}>
        Quoter → Curator → Author → Orchestrator
      </p>
      <div className="ld-actions">
        <button className="ld-btn accent" onClick={onStart}>Find my level →</button>
        <button className="ld-btn ghost" onClick={onSkip}>Skip, start at the bottom</button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function Quiz({ onDone }: { onDone: (total: number) => void }) {
  const [qi, setQi] = useState(0);
  const [total, setTotal] = useState(0);
  const q = placementQuiz[qi];

  function answer(points: number) {
    const t = total + points;
    if (qi + 1 >= placementQuiz.length) {
      onDone(t);
    } else {
      setTotal(t);
      setQi(qi + 1);
    }
  }

  return (
    <div className="ld-card" key={qi}>
      <p className="ld-eyebrow">Placement · {qi + 1} of {placementQuiz.length}</p>
      <h1 className="ld-title" style={{ fontSize: 'clamp(1.7rem, 5vw, 2.6rem)' }}>{q.question}</h1>
      <div className="ld-opts">
        {q.options.map((o) => (
          <button key={o.label} className="ld-opt" onClick={() => answer(o.points)}>
            {o.label}
          </button>
        ))}
      </div>
      <p className="ld-footnote">No wrong answers here. Honest beats impressive.</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function QuizResult({ level, onContinue }: { level: LevelId; onContinue: () => void }) {
  const l = levelById(level);
  const lines: Record<LevelId, string> = {
    quoter: "Everyone starts here. The first ascent is built exactly for you.",
    curator: 'You already choose your tools. The climb to Author is where it gets interesting.',
    author: 'You push back and make it yours. Ascents 2 and 3 are being built for you right now.',
    orchestrator: '',
  };
  return (
    <div className="ld-card ld-center">
      <p className="ld-eyebrow">Your placement</p>
      <h1 className="ld-title">
        You're starting as a <span style={{ color: l.color }}>{l.name}</span>.
      </h1>
      <p className="ld-sub">{l.line}</p>
      <p className="ld-sub" style={{ marginTop: '-0.75rem' }}>{lines[level]}</p>
      <div className="ld-actions">
        <button className="ld-btn" onClick={onContinue}>See the ladder →</button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
function LadderMap({
  progress, doneCount, onOpenCard, onContinue, onReset,
}: {
  progress: LadderProgress;
  doneCount: number;
  onOpenCard: (index: number) => void;
  onContinue: () => void;
  onReset: () => void;
}) {
  const placed = progress.placedLevel ?? 'quoter';
  const hasCurator = progress.earnedLevels.includes('curator');
  const youAre: LevelId = hasCurator ? 'curator' : placed;
  const allDone = doneCount === ascent1Cards.length;

  // Top of the ladder renders first
  const rungs = useMemo(() => [...levels].reverse(), []);

  return (
    <div className="ld-card">
      <p className="ld-eyebrow">The four levels of AI Thinking</p>
      <h1 className="ld-title" style={{ fontSize: 'clamp(1.9rem, 5.5vw, 2.8rem)' }}>The ladder.</h1>

      <div className="ld-rungs">
        {rungs.map((l) => {
          const isYou = l.id === youAre;
          const earned = progress.earnedLevels.includes(l.id);
          return (
            <div
              key={l.id}
              className={`ld-rung${isYou ? ' here' : ''}${earned ? ' earned' : ''}`}
              style={{ '--rung': l.color } as React.CSSProperties}
            >
              <span className="r-num">LEVEL {l.num}</span>
              <span className="r-name">{l.name}</span>
              <span className="r-line">{l.line}</span>
              {isYou && <span className="r-badge you">You are here</span>}
              {earned && !isYou && <span className="r-badge stamp">Earned</span>}
              {earned && isYou && <span className="r-badge stamp">Stamped</span>}
            </div>
          );
        })}
      </div>

      <p className="ld-eyebrow">Ascent 1 · Quoter → Curator · {doneCount}/{ascent1Cards.length}</p>
      <div className="ld-checklist">
        {ascent1Cards.map((c, i) => {
          const res = progress.cards[c.id];
          return (
            <button key={c.id} className={`ld-check${res?.done ? ' done' : ''}`} onClick={() => onOpenCard(i)}>
              <span className="ck-mark">{res?.done ? '✓' : ''}</span>
              <span>
                <span className="ck-title">{c.mapTitle}</span>
                <span className="ck-hint">{c.mapHint}</span>
              </span>
              {res?.score !== undefined && res?.total !== undefined && (
                <span className="ck-score">{res.score}/{res.total}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="ld-actions">
        {!allDone && (
          <button className="ld-btn accent" onClick={onContinue}>
            {doneCount === 0 ? 'Start the climb →' : 'Continue the climb →'}
          </button>
        )}
        {hasCurator && (
          <span className="ld-streak">Ascent 2 · Curator → Author · coming soon</span>
        )}
        <button className="ld-btn ghost" onClick={onReset} style={{ marginLeft: 'auto' }}>Start over</button>
      </div>
    </div>
  );
}

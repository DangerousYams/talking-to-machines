import { useState } from 'react';
import { sorterTasks, kdsMeta, type KDS } from '../../data/ladder';

interface Props {
  onComplete: (score: number, total: number) => void;
}

const BUCKETS: KDS[] = ['know', 'do', 'show'];

/** One task at a time, three buckets. Instant verdict, running streak. */
export default function Sorter({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<KDS | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const task = sorterTasks[round];
  const isRight = picked !== null && picked === task.answer;

  function choose(b: KDS) {
    if (picked) return;
    setPicked(b);
    if (b === task.answer) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((bs) => Math.max(bs, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }

  function next() {
    if (round + 1 >= sorterTasks.length) {
      setFinished(true);
    } else {
      setRound((r) => r + 1);
      setPicked(null);
    }
  }

  if (finished) {
    const grade =
      score >= 11 ? 'You see the buckets now.' :
      score >= 8 ? 'Solid. The edges get easier with reps.' :
      'The buckets take practice. Run it again any time.';
    return (
      <div className="ld-card ld-center">
        <p className="ld-eyebrow">The Sorter · Result</p>
        <h1 className="ld-title">{score} <span style={{ color: '#6B7280' }}>/ {sorterTasks.length}</span></h1>
        <p className="ld-sub">{grade} Best streak: {bestStreak}.</p>
        <p className="ld-footnote">Tag the task first, and the right tool becomes obvious.</p>
        <div className="ld-actions">
          <button className="ld-btn" onClick={() => onComplete(score, sorterTasks.length)}>Continue →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-card" key={round}>
      <p className="ld-eyebrow">The Sorter · {round + 1} of {sorterTasks.length}</p>
      <h1 className="ld-title" style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)' }}>Which bucket?</h1>
      <div className="ld-plate">{task.task}</div>

      <div className="ld-buckets">
        {BUCKETS.map((b) => (
          <button
            key={b}
            className={`ld-bucket${picked === b ? ' chosen' : ''}`}
            style={{ '--bk': kdsMeta[b].color } as React.CSSProperties}
            onClick={() => choose(b)}
            disabled={picked !== null}
          >
            {kdsMeta[b].label}
          </button>
        ))}
      </div>

      {picked && (
        <div className={`ld-verdict ${isRight ? 'ok' : 'no'}`}>
          <span className="v-head">{isRight ? 'Right' : `It's ${kdsMeta[task.answer].label}`}</span>
          {task.why}
        </div>
      )}

      <div className="ld-actions">
        {picked && (
          <button className="ld-btn" onClick={next}>
            {round + 1 >= sorterTasks.length ? 'See my score →' : 'Next →'}
          </button>
        )}
        <span className="ld-streak">score {score} · streak {streak}</span>
      </div>
    </div>
  );
}

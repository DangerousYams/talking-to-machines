import { useState } from 'react';
import { mapRounds, kdsMeta } from '../../data/ladder';

interface Props {
  onComplete: (score: number, total: number) => void;
}

/** Which AI for this task — one scenario at a time, opinionated verdicts. */
export default function MapPicker({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const r = mapRounds[round];
  const correctIdx = r.options.findIndex((o) => o.correct);
  const gotIt = picked !== null && picked === correctIdx;

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === correctIdx) setScore((s) => s + 1);
  }

  function next() {
    if (round + 1 >= mapRounds.length) {
      setFinished(true);
    } else {
      setRound((x) => x + 1);
      setPicked(null);
    }
  }

  if (finished) {
    const grade =
      score >= 7 ? 'You know the map.' :
      score >= 5 ? 'Good instincts. The map changes; the habit of choosing stays.' :
      'The map is learnable. The habit is the point: choose before you prompt.';
    return (
      <div className="ld-card ld-center">
        <p className="ld-eyebrow">The Map Picker · Result</p>
        <h1 className="ld-title">{score} <span style={{ color: '#6B7280' }}>/ {mapRounds.length}</span></h1>
        <p className="ld-sub">{grade}</p>
        <p className="ld-footnote">Habit 04 · Pick the right AI for the task. When in doubt, ask AI which AI.</p>
        <div className="ld-actions">
          <button className="ld-btn" onClick={() => onComplete(score, mapRounds.length)}>Continue →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-card" key={round}>
      <p className="ld-eyebrow">The Map Picker · {round + 1} of {mapRounds.length}</p>
      <span className="ld-kds-pill" style={{ '--pk': kdsMeta[r.kds].color } as React.CSSProperties}>
        a {kdsMeta[r.kds].label} task
      </span>
      <div className="ld-plate">{r.scenario}</div>

      <div className="ld-opts" style={{ marginTop: '1.5rem' }}>
        {r.options.map((opt, i) => {
          let cls = 'ld-opt';
          if (picked !== null) {
            if (i === correctIdx) cls += ' right';
            else if (i === picked) cls += ' wrong';
            else cls += ' dim';
          }
          return (
            <button key={opt.name} className={cls} onClick={() => choose(i)} disabled={picked !== null}>
              <strong>{opt.name}</strong>
              {picked !== null && <span className="ld-opt-verdict">{opt.verdict}</span>}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className={`ld-verdict ${gotIt ? 'ok' : 'no'}`}>
          <span className="v-head">{gotIt ? 'Right call' : 'Not this time'}</span>
          {r.lesson}
        </div>
      )}

      <div className="ld-actions">
        {picked !== null && (
          <button className="ld-btn" onClick={next}>
            {round + 1 >= mapRounds.length ? 'See my score →' : 'Next →'}
          </button>
        )}
        <span className="ld-streak">score {score}</span>
      </div>
    </div>
  );
}

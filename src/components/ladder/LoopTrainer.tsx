import { useRef, useState } from 'react';
import { streamChat, type ChatMessage } from '../../lib/claude';
import {
  loopStarters,
  loopSystemPrompt,
  passTwoMoves,
  passThreeMoves,
  type LoopMove,
} from '../../data/ladder';

interface Props {
  onComplete: (score: number, total: number) => void;
}

type Stage = 'pick' | 'prompt' | 'streaming' | 'scored' | 'result';

/** Strip the trailing "SCORE: NN" line (and any partial prefix of it) for display. */
function displayText(buffer: string): string {
  let out = buffer.replace(/\n?\s*SCORE:\s*\d*\s*$/i, '');
  // Hold back a trailing partial like "\nSCO" while streaming
  const tail = out.slice(-8);
  const m = tail.match(/\n\s*S(C(O(R(E(:)?)?)?)?)?$/i);
  if (m) out = out.slice(0, out.length - m[0].length);
  return out;
}

function extractScore(buffer: string): number | null {
  const m = buffer.match(/SCORE:\s*(\d{1,3})/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? Math.min(99, Math.max(0, n)) : null;
}

/** The Loop Trainer: one real task, three passes, a visible quality climb. */
export default function LoopTrainer({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('pick');
  const [goal, setGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [firstPrompt, setFirstPrompt] = useState('');
  const [pass, setPass] = useState(1); // 1..3
  const [buffer, setBuffer] = useState('');
  const [scores, setScores] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  function startWithGoal(g: string) {
    setGoal(g);
    setStage('prompt');
  }

  function run(userMessage: string) {
    setError(null);
    setBuffer('');
    setStage('streaming');
    messagesRef.current = [...messagesRef.current, { role: 'user', content: userMessage }];
    let acc = '';
    abortRef.current = streamChat({
      messages: messagesRef.current,
      systemPrompt: loopSystemPrompt(goal),
      maxTokens: 700,
      source: 'ladder',
      skipPersona: true,
      onChunk: (text) => {
        acc += text;
        setBuffer(acc);
      },
      onDone: () => {
        messagesRef.current = [...messagesRef.current, { role: 'assistant', content: acc }];
        const score = extractScore(acc) ?? 50;
        setScores((s) => [...s, score]);
        setStage('scored');
      },
      onError: (msg) => {
        // Roll back the failed user turn so a retry doesn't double it
        messagesRef.current = messagesRef.current.slice(0, -1);
        setError(msg);
        setStage(pass === 1 ? 'prompt' : 'scored');
      },
    });
  }

  function runMove(move: LoopMove) {
    setPass((p) => p + 1);
    run(move.message);
  }

  const latestScore = scores[scores.length - 1] ?? 0;
  const moves = pass === 1 ? passTwoMoves : passThreeMoves;

  // ── Stage: pick a task ──
  if (stage === 'pick') {
    return (
      <div className="ld-card">
        <p className="ld-eyebrow">The Loop Trainer · Exercise</p>
        <h1 className="ld-title">One task. <span style={{ color: '#E94560' }}>Three passes.</span></h1>
        <p className="ld-sub">First answers are floors, not ceilings. Pick something real and watch the loop raise it.</p>
        <div className="ld-opts">
          {loopStarters.map((s) => (
            <button key={s.id} className="ld-opt" onClick={() => startWithGoal(s.goal)}>
              <strong>{s.label}</strong>
            </button>
          ))}
        </div>
        <div className="ld-actions" style={{ alignItems: 'stretch', flexDirection: 'column' }}>
          <input
            className="ld-input"
            placeholder="…or type your own task"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && customGoal.trim().length > 8) startWithGoal(customGoal.trim()); }}
          />
          {customGoal.trim().length > 8 && (
            <button className="ld-btn" onClick={() => startWithGoal(customGoal.trim())}>Use my task →</button>
          )}
        </div>
      </div>
    );
  }

  // ── Stage: write the first prompt ──
  if (stage === 'prompt') {
    return (
      <div className="ld-card">
        <p className="ld-eyebrow">Pass 1 of 3 · Just ask</p>
        <h1 className="ld-title" style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)' }}>
          Ask for it the way you normally would.
        </h1>
        <p className="ld-sub">No tricks yet. Your everyday ask, so we have a floor to raise.</p>
        <textarea
          className="ld-input"
          rows={3}
          placeholder="e.g. write an email to my landlord about the broken heater"
          value={firstPrompt}
          onChange={(e) => setFirstPrompt(e.target.value)}
        />
        {error && <div className="ld-error">{error}</div>}
        <div className="ld-actions">
          <button
            className="ld-btn accent"
            disabled={firstPrompt.trim().length < 8}
            onClick={() => run(firstPrompt.trim())}
          >
            Run pass 1 →
          </button>
        </div>
      </div>
    );
  }

  // ── Stage: result screen after 3 passes ──
  if (stage === 'result') {
    const climb = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;
    return (
      <div className="ld-card ld-center">
        <p className="ld-eyebrow">The Loop Trainer · Result</p>
        <h1 className="ld-title">
          +{Math.max(0, climb)} <span style={{ color: '#6B7280', fontSize: '0.6em' }}>quality points</span>
        </h1>
        <p className="ld-sub">Same AI. Same task. The only thing that changed was you not settling.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '0 auto 0.5rem', maxWidth: 420 }}>
          {scores.map((s, i) => (
            <div className="ld-meter-row" key={i}>
              <span className="ld-streak" style={{ minWidth: '3.6rem', textAlign: 'left' }}>pass {i + 1}</span>
              <div className="ld-meter"><div className="ld-meter-fill" style={{ width: `${s}%` }} /></div>
              <span className="ld-score-num">{s}</span>
            </div>
          ))}
        </div>
        <p className="ld-footnote">Habit 09 · Iteration is everything. Three to five passes. Every time.</p>
        <div className="ld-actions">
          <button className="ld-btn" onClick={() => onComplete(latestScore, 100)}>Continue →</button>
        </div>
      </div>
    );
  }

  // ── Stages: streaming + scored (shared layout) ──
  const done = stage === 'scored';
  return (
    <div className="ld-card">
      <p className="ld-eyebrow">Pass {pass} of 3 {done ? '· scored' : '· running'}</p>

      <div className={`ld-output${buffer ? '' : ' thinking'}`}>
        {buffer ? displayText(buffer) : 'Thinking…'}
      </div>

      {done && (
        <>
          <div className="ld-meter-row" style={{ marginTop: '1rem' }}>
            <div className="ld-meter"><div className="ld-meter-fill" style={{ width: `${latestScore}%` }} /></div>
            <span className="ld-score-num">{latestScore}</span>
          </div>
          {scores.length >= 2 && (
            <p className="ld-streak" style={{ marginTop: '0.3rem' }}>
              {latestScore > scores[scores.length - 2]
                ? `up ${latestScore - scores[scores.length - 2]} from pass ${scores.length - 1}`
                : 'no climb that pass. It happens. Pick the other move next time'}
            </p>
          )}
        </>
      )}

      {error && <div className="ld-error">{error}</div>}

      {done && pass < 3 && (
        <>
          <p className="ld-sub" style={{ margin: '1.5rem 0 0' }}>
            {pass === 1 ? "Decent. And it's the quick win. Don't take it." : 'One more pass. Make it yours.'}
          </p>
          <div className="ld-moves">
            {moves.map((m) => (
              <button key={m.id} className="ld-move" onClick={() => runMove(m)}>
                <span className="m-label">{m.label}</span>
                <span className="m-habit">{m.habit}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {done && pass >= 3 && (
        <div className="ld-actions">
          <button className="ld-btn" onClick={() => setStage('result')}>See the climb →</button>
        </div>
      )}
    </div>
  );
}

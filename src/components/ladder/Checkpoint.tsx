import { useState } from 'react';
import { streamChat } from '../../lib/claude';
import {
  checkpointScenarios,
  checkpointGradeSystemPrompt,
  kdsMeta,
  type KDS,
} from '../../data/ladder';

interface Props {
  onComplete: (passed: boolean, score: number, total: number) => void;
}

type Stage = 'intro' | 'route' | 'plan' | 'grading' | 'verdict';

interface Grade {
  score: number;
  strengths: string;
  improve: string;
}

const KDS_KEYS: KDS[] = ['know', 'do', 'show'];
const PART_A_PASS = 8; // of 12
const PART_B_PASS = 3; // of 5

function parseGrade(raw: string): Grade | null {
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const obj = JSON.parse(m[0]);
    if (typeof obj.score !== 'number') return null;
    return {
      score: Math.max(0, Math.min(5, Math.round(obj.score))),
      strengths: String(obj.strengths || ''),
      improve: String(obj.improve || ''),
    };
  } catch {
    return null;
  }
}

/** Checkpoint 1: route six tasks, then plan one of your own. Pass = Curator. */
export default function Checkpoint({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('intro');
  const [idx, setIdx] = useState(0);
  const [toolPick, setToolPick] = useState<number | null>(null);
  const [kdsPick, setKdsPick] = useState<KDS | null>(null);
  const [routeScore, setRouteScore] = useState(0);
  const [plan, setPlan] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sc = checkpointScenarios[idx];
  const revealed = toolPick !== null && kdsPick !== null;
  const toolRight = toolPick === sc?.correctTool;
  const kdsRight = kdsPick === sc?.correctKds;

  function pickTool(i: number) {
    if (toolPick !== null) return;
    setToolPick(i);
    if (i === sc.correctTool) setRouteScore((s) => s + 1);
  }

  function pickKds(k: KDS) {
    if (kdsPick !== null || toolPick === null) return;
    setKdsPick(k);
    if (k === sc.correctKds) setRouteScore((s) => s + 1);
  }

  function nextScenario() {
    if (idx + 1 >= checkpointScenarios.length) {
      setStage('plan');
    } else {
      setIdx((i) => i + 1);
      setToolPick(null);
      setKdsPick(null);
    }
  }

  function submitPlan() {
    setError(null);
    setStage('grading');
    let acc = '';
    streamChat({
      messages: [{ role: 'user', content: plan.trim() }],
      systemPrompt: checkpointGradeSystemPrompt,
      maxTokens: 300,
      source: 'ladder',
      skipPersona: true,
      onChunk: (t) => { acc += t; },
      onDone: () => {
        const g = parseGrade(acc);
        if (!g) {
          setError('The grader gave a garbled answer. Try submitting again.');
          setStage('plan');
          return;
        }
        setGrade(g);
        setStage('verdict');
      },
      onError: (msg) => {
        setError(msg);
        setStage('plan');
      },
    });
  }

  // ── Intro ──
  if (stage === 'intro') {
    return (
      <div className="ld-card">
        <p className="ld-eyebrow">Checkpoint · Quoter → Curator</p>
        <h1 className="ld-title">Earn the <span style={{ color: '#F5A623' }}>Curator</span> stamp.</h1>
        <p className="ld-sub">Two parts. No retakes needed, retry as often as you like.</p>
        <div className="ld-opts">
          <div className="ld-opt" style={{ cursor: 'default' }}>
            <strong>Part 1 · Route six tasks</strong>
            <span className="ld-opt-verdict">Pick the right tool and the right bucket for each. {PART_A_PASS} of 12 points to pass.</span>
          </div>
          <div className="ld-opt" style={{ cursor: 'default' }}>
            <strong>Part 2 · Plan one of your own</strong>
            <span className="ld-opt-verdict">A real task from your week, run through the Loop on paper. The AI grades it on a 5-point rubric. {PART_B_PASS} to pass.</span>
          </div>
        </div>
        <div className="ld-actions">
          <button className="ld-btn accent" onClick={() => setStage('route')}>Start →</button>
        </div>
      </div>
    );
  }

  // ── Part A: routing ──
  if (stage === 'route') {
    return (
      <div className="ld-card" key={idx}>
        <p className="ld-eyebrow">Checkpoint · Part 1 · {idx + 1} of {checkpointScenarios.length}</p>
        <div className="ld-plate">{sc.scenario}</div>

        <p className="ld-sub" style={{ margin: '1.25rem 0 0.5rem' }}>Which tool?</p>
        <div className="ld-opts">
          {sc.toolOptions.map((t, i) => {
            let cls = 'ld-opt';
            if (toolPick !== null) {
              if (i === sc.correctTool) cls += ' right';
              else if (i === toolPick) cls += ' wrong';
              else cls += ' dim';
            }
            return (
              <button key={t} className={cls} onClick={() => pickTool(i)} disabled={toolPick !== null}>
                <strong>{t}</strong>
              </button>
            );
          })}
        </div>

        {toolPick !== null && (
          <>
            <p className="ld-sub" style={{ margin: '1.25rem 0 0.5rem' }}>Which bucket?</p>
            <div className="ld-buckets" style={{ marginTop: 0 }}>
              {KDS_KEYS.map((k) => {
                const chosen = kdsPick === k;
                const showRight = kdsPick !== null && k === sc.correctKds;
                return (
                  <button
                    key={k}
                    className={`ld-bucket${chosen || showRight ? ' chosen' : ''}`}
                    style={{ '--bk': kdsMeta[k].color, opacity: kdsPick !== null && !chosen && !showRight ? 0.4 : 1 } as React.CSSProperties}
                    onClick={() => pickKds(k)}
                    disabled={kdsPick !== null}
                  >
                    {kdsMeta[k].label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {revealed && (
          <div className={`ld-verdict ${toolRight && kdsRight ? 'ok' : 'no'}`}>
            <span className="v-head">
              {toolRight && kdsRight ? '2 points' : toolRight || kdsRight ? '1 point' : '0 points'}
            </span>
            {sc.note}
          </div>
        )}

        <div className="ld-actions">
          {revealed && (
            <button className="ld-btn" onClick={nextScenario}>
              {idx + 1 >= checkpointScenarios.length ? 'Part 2 →' : 'Next →'}
            </button>
          )}
          <span className="ld-streak">{routeScore} / 12 points</span>
        </div>
      </div>
    );
  }

  // ── Part B: the plan ──
  if (stage === 'plan' || stage === 'grading') {
    const grading = stage === 'grading';
    return (
      <div className="ld-card">
        <p className="ld-eyebrow">Checkpoint · Part 2 · Your real task</p>
        <h1 className="ld-title" style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)' }}>
          Plan one task through the Loop.
        </h1>
        <p className="ld-sub">
          Name a real task from your week. Which AI would you choose, and what are your three passes?
          Mention how you'll evaluate and how you'll make it sound like you.
        </p>
        <textarea
          className="ld-input"
          rows={6}
          placeholder={'e.g. My weekly status email. I\'d use Claude. Pass 1: draft from my bullet points. Pass 2: ask what it held back and cross-check in Gemini. Pass 3: cut it in half and make it sound like me, with last week\'s email as a good example.'}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          disabled={grading}
        />
        {error && <div className="ld-error">{error}</div>}
        <div className="ld-actions">
          <button className="ld-btn accent" disabled={plan.trim().length < 60 || grading} onClick={submitPlan}>
            {grading ? 'Grading…' : 'Grade my plan →'}
          </button>
          {plan.trim().length < 60 && !grading && (
            <span className="ld-streak">a real plan needs a few sentences</span>
          )}
        </div>
      </div>
    );
  }

  // ── Verdict ──
  const passed = routeScore >= PART_A_PASS && (grade?.score ?? 0) >= PART_B_PASS;
  const totalScore = routeScore + (grade?.score ?? 0);

  return (
    <div className="ld-card ld-center">
      <p className="ld-eyebrow">Checkpoint · Verdict</p>
      {passed ? (
        <>
          <div className="ld-stamp" style={{ '--stamp': '#F5A623' } as React.CSSProperties}>
            <div>
              <div className="s-name">Curator</div>
              <div className="s-sub">Level 2 · earned</div>
            </div>
          </div>
          <h1 className="ld-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)' }}>You choose before you prompt now.</h1>
        </>
      ) : (
        <h1 className="ld-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)' }}>Not yet. And that's fine.</h1>
      )}

      <p className="ld-sub">
        Routing: {routeScore}/12 {routeScore >= PART_A_PASS ? '✓' : `(need ${PART_A_PASS})`} · Plan: {grade?.score ?? 0}/5 {(grade?.score ?? 0) >= PART_B_PASS ? '✓' : `(need ${PART_B_PASS})`}
      </p>

      {grade && (
        <div className="ld-opts" style={{ textAlign: 'left', maxWidth: 560, margin: '0 auto' }}>
          <div className="ld-verdict ok" style={{ marginTop: 0 }}>
            <span className="v-head">What's strong</span>{grade.strengths}
          </div>
          <div className={`ld-verdict ${passed ? 'ok' : 'no'}`} style={{ marginTop: 0 }}>
            <span className="v-head">Sharpen this</span>{grade.improve}
          </div>
        </div>
      )}

      <div className="ld-actions">
        {passed ? (
          <button className="ld-btn" onClick={() => onComplete(true, totalScore, 17)}>Back to the ladder →</button>
        ) : (
          <>
            <button className="ld-btn accent" onClick={() => { setStage('plan'); setGrade(null); }}>Rewrite my plan</button>
            <button
              className="ld-btn ghost"
              onClick={() => {
                setStage('intro'); setIdx(0); setToolPick(null); setKdsPick(null);
                setRouteScore(0); setGrade(null); setPlan('');
              }}
            >
              Retake it all
            </button>
            <button className="ld-btn ghost" onClick={() => onComplete(false, totalScore, 17)}>Later</button>
          </>
        )}
      </div>
    </div>
  );
}

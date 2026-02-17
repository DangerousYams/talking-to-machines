import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * SocraticTree
 * ------------
 * A branching question-tree SVG visualization for Chapter 2.
 * Shows how a single vague goal branches into clarifying questions,
 * answers, and finally a rich, assembled result. Loops with fade.
 *
 * Accent: navy #0F3460 (Chapter 2)
 */

interface TreeNode {
  id: string;
  text: string;
  type: 'goal' | 'question' | 'answer' | 'result';
  x: number;
  y: number;
  parentId?: string;
}

const NAVY = '#0F3460';
const TEAL = '#16C79A';
const DEEP = '#1A1A2E';
const SUBTLE = '#6B7280';

// Layout constants — desktop
const SVG_WIDTH_DESKTOP = 520;
const SVG_HEIGHT_DESKTOP = 480;
const GOAL_Y_DESKTOP = 40;
const QUESTION_Y_DESKTOP = 140;
const ANSWER_Y_DESKTOP = 250;
const RESULT_Y_DESKTOP = 390;

// Layout constants — mobile (portrait, narrower + taller)
const SVG_WIDTH_MOBILE = 400;
const SVG_HEIGHT_MOBILE = 700;
const GOAL_Y_MOBILE = 50;
const QUESTION_Y_MOBILE = 190;
const ANSWER_Y_MOBILE = 400;
const RESULT_Y_MOBILE = 600;

const NODE_RX = 10;
const NODE_HEIGHT = 36;

// Question nodes — desktop (4 across)
const QUESTIONS_DESKTOP = [
  { id: 'q1', text: 'How many guests?', x: 60 },
  { id: 'q2', text: 'Indoor or outdoor?', x: 200 },
  { id: 'q3', text: 'Budget?', x: 340 },
  { id: 'q4', text: 'Theme?', x: 460 },
];

const ANSWERS_DESKTOP = [
  { id: 'a1', text: '12 people', parentId: 'q1', x: 60 },
  { id: 'a2', text: 'Outdoor', parentId: 'q2', x: 200 },
  { id: 'a3', text: '$200', parentId: 'q3', x: 340 },
  { id: 'a4', text: 'Retro arcade', parentId: 'q4', x: 460 },
];

// Question nodes — mobile (2x2 grid layout)
const QUESTIONS_MOBILE = [
  { id: 'q1', text: 'How many guests?', x: 110 },
  { id: 'q2', text: 'Indoor or outdoor?', x: 295 },
  { id: 'q3', text: 'Budget?', x: 110 },
  { id: 'q4', text: 'Theme?', x: 295 },
];

const ANSWERS_MOBILE = [
  { id: 'a1', text: '12 people', parentId: 'q1', x: 110 },
  { id: 'a2', text: 'Outdoor', parentId: 'q2', x: 295 },
  { id: 'a3', text: '$200', parentId: 'q3', x: 110 },
  { id: 'a4', text: 'Retro arcade', parentId: 'q4', x: 295 },
];

function getLayout(mobile: boolean) {
  const SVG_WIDTH = mobile ? SVG_WIDTH_MOBILE : SVG_WIDTH_DESKTOP;
  const SVG_HEIGHT = mobile ? SVG_HEIGHT_MOBILE : SVG_HEIGHT_DESKTOP;
  const GOAL_Y = mobile ? GOAL_Y_MOBILE : GOAL_Y_DESKTOP;
  const QUESTION_Y = mobile ? QUESTION_Y_MOBILE : QUESTION_Y_DESKTOP;
  const ANSWER_Y = mobile ? ANSWER_Y_MOBILE : ANSWER_Y_DESKTOP;
  const RESULT_Y = mobile ? RESULT_Y_MOBILE : RESULT_Y_DESKTOP;
  const QUESTIONS = mobile ? QUESTIONS_MOBILE : QUESTIONS_DESKTOP;
  const ANSWERS = mobile ? ANSWERS_MOBILE : ANSWERS_DESKTOP;
  // On mobile, rows 1 and 3 are at QUESTION_Y, rows 2 and 4 are offset
  const QUESTION_Y2 = mobile ? QUESTION_Y + 80 : QUESTION_Y;
  const ANSWER_Y2 = mobile ? ANSWER_Y + 80 : ANSWER_Y;

  const GOAL_NODE: TreeNode = {
    id: 'goal',
    text: 'Plan a party',
    type: 'goal',
    x: SVG_WIDTH / 2,
    y: GOAL_Y,
  };

  const RESULT_NODE: TreeNode = {
    id: 'result',
    text: 'Plan an outdoor retro arcade party for 12 people, $200 budget',
    type: 'result',
    x: SVG_WIDTH / 2,
    y: RESULT_Y,
  };

  // Helper to get the Y position for a question/answer by index (for 2x2 grid on mobile)
  const questionYForIndex = (i: number) => (mobile && i >= 2) ? QUESTION_Y2 : QUESTION_Y;
  const answerYForIndex = (i: number) => (mobile && i >= 2) ? ANSWER_Y2 : ANSWER_Y;

  return {
    SVG_WIDTH, SVG_HEIGHT, GOAL_Y, QUESTION_Y, ANSWER_Y, RESULT_Y,
    QUESTION_Y2, ANSWER_Y2,
    QUESTIONS, ANSWERS, GOAL_NODE, RESULT_NODE,
    questionYForIndex, answerYForIndex,
  };
}

// Timing
const INITIAL_DELAY = 800;
const QUESTION_STAGGER = 600;
const ANSWER_DELAY = 800; // after last question
const ANSWER_STAGGER = 500;
const RESULT_DELAY = 900; // after last answer
const GLOW_DURATION = 1500;
const HOLD_DURATION = 3000;
const FADE_DURATION = 800;

export default function SocraticTree() {
  const isMobile = useIsMobile();
  const [visibleQuestions, setVisibleQuestions] = useState(0);
  const [visibleAnswers, setVisibleAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const [masterOpacity, setMasterOpacity] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const layout = getLayout(isMobile);
  const {
    SVG_WIDTH, SVG_HEIGHT, GOAL_Y, QUESTION_Y, ANSWER_Y, RESULT_Y,
    QUESTIONS, ANSWERS, GOAL_NODE, RESULT_NODE,
    questionYForIndex, answerYForIndex,
  } = layout;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const addTimer = (fn: () => void, delay: number) => {
    const t = setTimeout(() => {
      if (mountedRef.current) fn();
    }, delay);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion) {
      setVisibleQuestions(QUESTIONS.length);
      setVisibleAnswers(ANSWERS.length);
      setShowResult(true);
      setGlowing(false);
      setMasterOpacity(1);
      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;
      clearTimers();

      // Reset state
      setVisibleQuestions(0);
      setVisibleAnswers(0);
      setShowResult(false);
      setGlowing(false);
      setMasterOpacity(1);

      let elapsed = INITIAL_DELAY;

      // Reveal questions one by one
      QUESTIONS.forEach((_, i) => {
        addTimer(() => setVisibleQuestions(i + 1), elapsed + i * QUESTION_STAGGER);
      });
      elapsed += QUESTIONS.length * QUESTION_STAGGER;

      // Reveal answers one by one
      elapsed += ANSWER_DELAY;
      ANSWERS.forEach((_, i) => {
        addTimer(() => setVisibleAnswers(i + 1), elapsed + i * ANSWER_STAGGER);
      });
      elapsed += ANSWERS.length * ANSWER_STAGGER;

      // Show result
      elapsed += RESULT_DELAY;
      addTimer(() => {
        setShowResult(true);
        // Start glow
        addTimer(() => setGlowing(true), 200);
        // Stop glow
        addTimer(() => setGlowing(false), 200 + GLOW_DURATION);
      }, elapsed);

      // Hold, then fade out and restart
      elapsed += HOLD_DURATION + GLOW_DURATION;
      addTimer(() => {
        setMasterOpacity(0);
        addTimer(() => runCycle(), FADE_DURATION + 400);
      }, elapsed);
    };

    runCycle();

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [reducedMotion]);

  // Bezier path from parent to child
  const makeCurvedPath = (x1: number, y1: number, x2: number, y2: number): string => {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  // Measure text width roughly (for node sizing)
  const estimateTextWidth = (text: string, fontSize: number): number => {
    return text.length * fontSize * 0.52 + 24;
  };

  const transition = reducedMotion ? 'none' : `opacity 0.5s ease, transform 0.5s ease`;
  const masterTransition = reducedMotion ? 'none' : `opacity ${FADE_DURATION}ms ease`;

  const containerStyle: React.CSSProperties = isMobile
    ? {
        flex: 1,
        width: '100%',
        margin: '0 auto',
        background: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        maxWidth: 560,
        margin: '0 auto',
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid rgba(26, 26, 46, 0.06)',
        boxShadow: '0 4px 32px rgba(26, 26, 46, 0.06), 0 1px 4px rgba(0,0,0,0.02)',
        padding: '24px 16px',
        overflow: 'hidden',
      };

  return (
    <div style={containerStyle}>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: isMobile ? '100%' : 'auto',
          display: 'block',
          opacity: masterOpacity,
          transition: masterTransition,
        }}
        role="img"
        aria-label="Socratic questioning tree: a vague goal branches into clarifying questions, answers, and a rich result"
      >
        <defs>
          {/* Glow filter for result node */}
          <filter id="resultGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor={NAVY} floodOpacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Connection lines: Goal to Questions --- */}
        {QUESTIONS.map((q, i) => {
          const visible = i < visibleQuestions;
          const qY = questionYForIndex(i);
          return (
            <path
              key={`line-goal-${q.id}`}
              d={makeCurvedPath(GOAL_NODE.x, GOAL_Y + NODE_HEIGHT / 2 + 4, q.x, qY - NODE_HEIGHT / 2 - 2)}
              fill="none"
              stroke={NAVY}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              style={{
                opacity: visible ? 0.2 : 0,
                transition,
              }}
            />
          );
        })}

        {/* --- Connection lines: Questions to Answers --- */}
        {ANSWERS.map((a, i) => {
          const visible = i < visibleAnswers;
          const qY = questionYForIndex(i);
          const aY = answerYForIndex(i);
          return (
            <path
              key={`line-q-${a.id}`}
              d={makeCurvedPath(QUESTIONS[i].x, qY + NODE_HEIGHT / 2 + 2, a.x, aY - NODE_HEIGHT / 2 - 2)}
              fill="none"
              stroke={TEAL}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              style={{
                opacity: visible ? 0.25 : 0,
                transition,
              }}
            />
          );
        })}

        {/* --- Connection lines: Answers to Result --- */}
        {ANSWERS.map((a, i) => {
          const visible = showResult;
          const aY = answerYForIndex(i);
          return (
            <path
              key={`line-a-${a.id}`}
              d={makeCurvedPath(a.x, aY + NODE_HEIGHT / 2 + 2, RESULT_NODE.x, RESULT_Y - NODE_HEIGHT / 2 - 2)}
              fill="none"
              stroke={NAVY}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              style={{
                opacity: visible ? 0.15 : 0,
                transition: reducedMotion ? 'none' : `opacity 0.6s ease ${i * 80}ms`,
              }}
            />
          );
        })}

        {/* --- Goal node --- */}
        {(() => {
          const w = estimateTextWidth(GOAL_NODE.text, 15);
          const h = NODE_HEIGHT;
          const rx = GOAL_NODE.x - w / 2;
          const ry = GOAL_Y - h / 2;

          return (
            <g>
              {/* Shadow */}
              <rect
                x={rx + 1}
                y={ry + 2}
                width={w}
                height={h}
                rx={NODE_RX}
                fill="rgba(15, 52, 96, 0.06)"
              />
              {/* Border */}
              <rect
                x={rx}
                y={ry}
                width={w}
                height={h}
                rx={NODE_RX}
                fill="#FFFFFF"
                stroke={NAVY}
                strokeWidth={2}
              />
              {/* Text */}
              <text
                x={GOAL_NODE.x}
                y={GOAL_Y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 15,
                  fontWeight: 700,
                  fill: NAVY,
                }}
              >
                {GOAL_NODE.text}
              </text>
              {/* Small label above */}
              <text
                x={GOAL_NODE.x}
                y={GOAL_Y - h / 2 - 8}
                textAnchor="middle"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  fill: SUBTLE,
                  textTransform: 'uppercase' as never,
                }}
              >
                VAGUE GOAL
              </text>
            </g>
          );
        })()}

        {/* --- Question nodes --- */}
        {QUESTIONS.map((q, i) => {
          const visible = i < visibleQuestions;
          const w = estimateTextWidth(q.text, 11);
          const h = NODE_HEIGHT;
          const qY = questionYForIndex(i);
          const rx = q.x - w / 2;
          const ry = qY - h / 2;

          return (
            <g
              key={q.id}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(-8px)',
                transition: reducedMotion ? 'none' : `opacity 0.5s ease, transform 0.5s ease`,
              }}
            >
              {/* Shadow */}
              <rect
                x={rx + 1}
                y={ry + 2}
                width={w}
                height={h}
                rx={NODE_RX}
                fill="rgba(15, 52, 96, 0.04)"
              />
              {/* Node body */}
              <rect
                x={rx}
                y={ry}
                width={w}
                height={h}
                rx={NODE_RX}
                fill="#FFFFFF"
                stroke={NAVY}
                strokeWidth={1.5}
              />
              {/* Question mark icon circle */}
              <circle
                cx={rx + 14}
                cy={qY}
                r={8}
                fill={NAVY}
                opacity={0.08}
              />
              <text
                x={rx + 14}
                y={qY + 1}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 10,
                  fontWeight: 700,
                  fill: NAVY,
                  opacity: 0.5,
                }}
              >
                ?
              </text>
              {/* Text */}
              <text
                x={q.x + 6}
                y={qY + 1}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: 11,
                  fontWeight: 500,
                  fill: DEEP,
                }}
              >
                {q.text}
              </text>
            </g>
          );
        })}

        {/* Clarifying questions label */}
        <text
          x={SVG_WIDTH / 2}
          y={questionYForIndex(0) - NODE_HEIGHT / 2 - 12}
          textAnchor="middle"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.08em',
            fill: SUBTLE,
            opacity: visibleQuestions > 0 ? 0.7 : 0,
            transition,
            textTransform: 'uppercase' as never,
          }}
        >
          CLARIFYING QUESTIONS
        </text>

        {/* --- Answer nodes --- */}
        {ANSWERS.map((a, i) => {
          const visible = i < visibleAnswers;
          const w = estimateTextWidth(a.text, 11);
          const h = NODE_HEIGHT;
          const aY = answerYForIndex(i);
          const rx = a.x - w / 2;
          const ry = aY - h / 2;

          return (
            <g
              key={a.id}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(-8px)',
                transition: reducedMotion ? 'none' : `opacity 0.5s ease, transform 0.5s ease`,
              }}
            >
              {/* Shadow */}
              <rect
                x={rx + 1}
                y={ry + 2}
                width={w}
                height={h}
                rx={NODE_RX}
                fill="rgba(22, 199, 154, 0.06)"
              />
              {/* Node body - teal fill */}
              <rect
                x={rx}
                y={ry}
                width={w}
                height={h}
                rx={NODE_RX}
                fill={TEAL}
              />
              {/* Subtle top highlight */}
              <rect
                x={rx + 6}
                y={ry + 3}
                width={w - 12}
                height={1.5}
                rx={0.75}
                fill="rgba(255,255,255,0.25)"
              />
              {/* Text */}
              <text
                x={a.x}
                y={aY + 1}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  fill: '#FFFFFF',
                }}
              >
                {a.text}
              </text>
            </g>
          );
        })}

        {/* Answers label */}
        <text
          x={SVG_WIDTH / 2}
          y={answerYForIndex(0) - NODE_HEIGHT / 2 - 12}
          textAnchor="middle"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.08em',
            fill: SUBTLE,
            opacity: visibleAnswers > 0 ? 0.7 : 0,
            transition,
            textTransform: 'uppercase' as never,
          }}
        >
          ANSWERS
        </text>

        {/* --- Converge arrow indicator --- */}
        {showResult && (
          <g
            style={{
              opacity: showResult ? 0.2 : 0,
              transition: reducedMotion ? 'none' : 'opacity 0.5s ease',
            }}
          >
            {/* Small downward chevron above result */}
            <path
              d={`M ${SVG_WIDTH / 2 - 8} ${RESULT_Y - NODE_HEIGHT / 2 - 22} L ${SVG_WIDTH / 2} ${RESULT_Y - NODE_HEIGHT / 2 - 14} L ${SVG_WIDTH / 2 + 8} ${RESULT_Y - NODE_HEIGHT / 2 - 22}`}
              fill="none"
              stroke={NAVY}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* --- Result node --- */}
        {(() => {
          const fontSize = 11;
          const text = RESULT_NODE.text;
          // Break text into two lines if long
          const maxCharsPerLine = 38;
          let lines: string[];
          if (text.length > maxCharsPerLine) {
            const mid = text.lastIndexOf(' ', maxCharsPerLine);
            lines = [text.slice(0, mid), text.slice(mid + 1)];
          } else {
            lines = [text];
          }
          const lineHeight = 16;
          const h = NODE_HEIGHT + (lines.length - 1) * lineHeight + 8;
          const w = Math.max(...lines.map(l => estimateTextWidth(l, fontSize)), 200);
          const rx = RESULT_NODE.x - w / 2;
          const ry = RESULT_Y - h / 2;

          return (
            <g
              style={{
                opacity: showResult ? 1 : 0,
                transform: showResult ? 'translateY(0)' : 'translateY(10px)',
                transition: reducedMotion ? 'none' : 'opacity 0.6s ease, transform 0.6s ease',
              }}
              filter={glowing ? 'url(#resultGlow)' : undefined}
            >
              {/* Shadow */}
              <rect
                x={rx + 2}
                y={ry + 3}
                width={w}
                height={h}
                rx={NODE_RX}
                fill="rgba(15, 52, 96, 0.08)"
              />
              {/* Node body - navy fill */}
              <rect
                x={rx}
                y={ry}
                width={w}
                height={h}
                rx={NODE_RX}
                fill={NAVY}
              />
              {/* Subtle top highlight */}
              <rect
                x={rx + 8}
                y={ry + 4}
                width={w - 16}
                height={1.5}
                rx={0.75}
                fill="rgba(255,255,255,0.15)"
              />
              {/* Text lines */}
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={RESULT_NODE.x}
                  y={RESULT_Y - ((lines.length - 1) * lineHeight) / 2 + li * lineHeight + 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize,
                    fontWeight: 600,
                    fill: '#FFFFFF',
                  }}
                >
                  {line}
                </text>
              ))}
              {/* Label below */}
              <text
                x={RESULT_NODE.x}
                y={ry + h + 16}
                textAnchor="middle"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  fill: SUBTLE,
                  opacity: 0.7,
                  textTransform: 'uppercase' as never,
                }}
              >
                RICH, SPECIFIC RESULT
              </text>
            </g>
          );
        })()}

        {/* --- Decorative: small "Socratic Method" label top-right --- */}
        <text
          x={SVG_WIDTH - 12}
          y={14}
          textAnchor="end"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.1em',
            fill: NAVY,
            opacity: 0.2,
            textTransform: 'uppercase' as never,
          }}
        >
          SOCRATIC METHOD
        </text>
      </svg>
    </div>
  );
}

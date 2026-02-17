import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';
import { dvhValue } from '../../../lib/css-compat';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface SimulationStep {
  type: 'thinking' | 'file' | 'command' | 'output' | 'success';
  text: string;
  delay: number;
}

const presets: Record<string, { label: string; description: string; files: FileNode[]; steps: SimulationStep[] }> = {
  countdown: {
    label: 'Create a React countdown timer',
    description: 'Build a reusable countdown component with start/pause controls',
    files: [
      { name: 'my-project', type: 'folder', children: [
        { name: 'src', type: 'folder', children: [
          { name: 'components', type: 'folder', children: [
            { name: 'CountdownTimer.tsx', type: 'file' },
            { name: 'CountdownTimer.css', type: 'file' },
          ]},
          { name: 'App.tsx', type: 'file' },
        ]},
        { name: 'package.json', type: 'file' },
      ]},
    ],
    steps: [
      { type: 'thinking', text: 'Reading project structure and understanding the codebase...', delay: 1200 },
      { type: 'thinking', text: 'Planning: Create a CountdownTimer component with useState and useEffect hooks, start/pause/reset controls, and formatted time display.', delay: 1800 },
      { type: 'file', text: `// src/components/CountdownTimer.tsx
import { useState, useEffect, useCallback } from 'react';
import './CountdownTimer.css';

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
}

export default function CountdownTimer({
  initialSeconds,
  onComplete,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, seconds, onComplete]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="countdown">
      <div className="countdown-display">
        {String(minutes).padStart(2, '0')}:
        {String(secs).padStart(2, '0')}
      </div>
      <div className="countdown-controls">
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => {
          setIsRunning(false);
          setSeconds(initialSeconds);
        }}>
          Reset
        </button>
      </div>
    </div>
  );
}`, delay: 3500 },
      { type: 'command', text: '$ npx tsc --noEmit', delay: 800 },
      { type: 'output', text: 'No type errors found.', delay: 600 },
      { type: 'command', text: '$ npm run dev', delay: 800 },
      { type: 'output', text: 'VITE v5.4.1  ready in 284ms\n  Local: http://localhost:5173/', delay: 600 },
      { type: 'success', text: 'CountdownTimer component created with start, pause, and reset controls. Ready at localhost:5173.', delay: 500 },
    ],
  },
  bug: {
    label: 'Fix the login bug',
    description: 'Diagnose and fix a broken authentication flow',
    files: [
      { name: 'my-project', type: 'folder', children: [
        { name: 'src', type: 'folder', children: [
          { name: 'auth', type: 'folder', children: [
            { name: 'login.ts', type: 'file' },
            { name: 'session.ts', type: 'file' },
          ]},
          { name: 'App.tsx', type: 'file' },
        ]},
        { name: 'package.json', type: 'file' },
      ]},
    ],
    steps: [
      { type: 'thinking', text: 'Reading src/auth/login.ts and src/auth/session.ts...', delay: 1200 },
      { type: 'thinking', text: 'Found the bug: the login handler awaits fetchUser() but never checks for a null response before setting the session token. When the API returns 401, the code crashes.', delay: 2000 },
      { type: 'file', text: `// src/auth/login.ts (patched)
export async function handleLogin(
  email: string,
  password: string,
) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  // FIX: check status before parsing body
  if (!res.ok) {
    const error = await res.json();
    throw new AuthError(
      error.message ?? 'Login failed',
      res.status,
    );
  }

  const { user, token } = await res.json();

  // FIX: validate user object exists
  if (!user || !token) {
    throw new AuthError(
      'Invalid server response',
      500,
    );
  }

  setSession(token, user);
  return user;
}`, delay: 3000 },
      { type: 'command', text: '$ npm run test -- --grep "login"', delay: 800 },
      { type: 'output', text: ' PASS  src/auth/__tests__/login.test.ts\n  handleLogin\n    \u2713 succeeds with valid credentials (12ms)\n    \u2713 throws on 401 response (8ms)\n    \u2713 throws on malformed response (5ms)\n\nTests:  3 passed, 3 total', delay: 1200 },
      { type: 'success', text: 'Bug fixed: Added null check and proper error handling for failed API responses. All 3 tests passing.', delay: 500 },
    ],
  },
  darkmode: {
    label: 'Add dark mode to the app',
    description: 'Implement a system-aware dark mode toggle with persistence',
    files: [
      { name: 'my-project', type: 'folder', children: [
        { name: 'src', type: 'folder', children: [
          { name: 'hooks', type: 'folder', children: [
            { name: 'useDarkMode.ts', type: 'file' },
          ]},
          { name: 'components', type: 'folder', children: [
            { name: 'ThemeToggle.tsx', type: 'file' },
          ]},
          { name: 'styles', type: 'folder', children: [
            { name: 'theme.css', type: 'file' },
          ]},
          { name: 'App.tsx', type: 'file' },
        ]},
        { name: 'package.json', type: 'file' },
      ]},
    ],
    steps: [
      { type: 'thinking', text: 'Reading existing styles and component structure...', delay: 1200 },
      { type: 'thinking', text: 'Plan: 1) Create a useDarkMode hook with localStorage persistence, 2) Add CSS custom properties for dark theme, 3) Build a toggle button component.', delay: 1800 },
      { type: 'file', text: `// src/hooks/useDarkMode.ts
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return [isDark, setIsDark] as const;
}`, delay: 2500 },
      { type: 'file', text: `/* src/styles/theme.css */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #1a1a2e;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

:root.dark {
  --bg-primary: #1a1a2e;
  --bg-secondary: #0f1729;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --border-color: #334155;
}`, delay: 2000 },
      { type: 'command', text: '$ npx tsc --noEmit', delay: 800 },
      { type: 'output', text: 'No type errors found.', delay: 600 },
      { type: 'command', text: '$ npm run dev', delay: 800 },
      { type: 'output', text: 'VITE v5.4.1  ready in 312ms\n  Local: http://localhost:5173/', delay: 600 },
      { type: 'success', text: 'Dark mode added with system preference detection, localStorage persistence, and smooth CSS transitions.', delay: 500 },
    ],
  },
};

function FileTree({ nodes, depth = 0, highlightFiles, revealedCount }: { nodes: FileNode[]; depth?: number; highlightFiles: Set<string>; revealedCount: number }) {
  return (
    <div>
      {nodes.map((node, i) => {
        const isHighlighted = highlightFiles.has(node.name) && revealedCount > 0;
        return (
          <div key={node.name + i}>
            <div style={{
              paddingLeft: depth * 14,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              lineHeight: '1.8',
              color: isHighlighted ? '#16C79A' : '#94a3b8',
              transition: 'color 0.4s ease',
            }}>
              <span style={{ opacity: 0.5, marginRight: 6 }}>
                {node.type === 'folder' ? '\u25BC' : '\u00A0\u00A0'}
              </span>
              {node.name}
            </div>
            {node.children && <FileTree nodes={node.children} depth={depth + 1} highlightFiles={highlightFiles} revealedCount={revealedCount} />}
          </div>
        );
      })}
    </div>
  );
}

export default function TerminalPlayground() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [typingIndex, setTypingIndex] = useState<number>(-1);
  const [typedText, setTypedText] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const preset = selectedPreset ? presets[selectedPreset] : null;

  const highlightFiles = new Set<string>();
  if (preset) {
    const fileSteps = preset.steps.filter(s => s.type === 'file');
    const completedFileSteps = preset.steps.slice(0, visibleSteps).filter(s => s.type === 'file');
    completedFileSteps.forEach((step) => {
      const match = step.text.match(/\/\/\s*src\/[\w/]*\/([\w.]+)/);
      if (match) highlightFiles.add(match[1]);
    });
  }

  useEffect(() => {
    if (!preset || !isRunning) return;
    if (visibleSteps >= preset.steps.length) {
      setIsRunning(false);
      return;
    }

    const currentStep = preset.steps[visibleSteps];

    if (currentStep.type === 'file') {
      // Typewriter effect for file content
      setTypingIndex(visibleSteps);
      setTypedText('');
      let charIndex = 0;
      const text = currentStep.text;
      const speed = Math.max(4, Math.min(12, currentStep.delay / text.length));

      const interval = setInterval(() => {
        if (charIndex < text.length) {
          const chunkSize = Math.min(3, text.length - charIndex);
          setTypedText(text.slice(0, charIndex + chunkSize));
          charIndex += chunkSize;
        } else {
          clearInterval(interval);
          setTypingIndex(-1);
          setTimeout(() => setVisibleSteps(v => v + 1), 300);
        }
      }, speed);

      return () => clearInterval(interval);
    } else {
      const timer = setTimeout(() => {
        setVisibleSteps(v => v + 1);
      }, currentStep.delay);
      return () => clearTimeout(timer);
    }
  }, [visibleSteps, isRunning, preset]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleSteps, typedText]);

  const startSimulation = (key: string) => {
    setSelectedPreset(key);
    setVisibleSteps(0);
    setTypingIndex(-1);
    setTypedText('');
    setTimeout(() => setIsRunning(true), 300);
  };

  const reset = () => {
    setSelectedPreset(null);
    setVisibleSteps(0);
    setIsRunning(false);
    setTypingIndex(-1);
    setTypedText('');
  };

  const renderStep = (step: SimulationStep, index: number) => {
    const isCurrentlyTyping = typingIndex === index;

    switch (step.type) {
      case 'thinking':
        return (
          <div key={index} style={{ color: '#6b7280', fontStyle: 'italic', marginBottom: 8 }}>
            <span style={{ color: '#7B61FF', marginRight: 8 }}>{'>'}</span>
            {step.text}
          </div>
        );
      case 'file':
        return (
          <div key={index} style={{ marginBottom: 8 }}>
            <div style={{ color: '#7B61FF', fontSize: '0.75rem', marginBottom: 4, letterSpacing: '0.05em' }}>
              WRITE
            </div>
            <div style={{
              background: 'rgba(123, 97, 255, 0.06)',
              border: '1px solid rgba(123, 97, 255, 0.15)',
              borderRadius: 6,
              padding: isMobile ? '8px 10px' : '10px 14px',
              fontSize: '0.75rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              color: '#e2e8f0',
            }}>
              {isCurrentlyTyping ? typedText : step.text}
              {isCurrentlyTyping && (
                <span style={{
                  display: 'inline-block',
                  width: 2,
                  height: '1em',
                  background: '#7B61FF',
                  marginLeft: 1,
                  animation: 'blink 1s infinite',
                  verticalAlign: 'text-bottom',
                }} />
              )}
            </div>
          </div>
        );
      case 'command':
        return (
          <div key={index} style={{ color: '#16C79A', marginBottom: 4, marginTop: 8 }}>
            {step.text}
          </div>
        );
      case 'output':
        return (
          <div key={index} style={{ color: '#94a3b8', marginBottom: 8, whiteSpace: 'pre-wrap' }}>
            {step.text}
          </div>
        );
      case 'success':
        return (
          <div key={index} style={{
            color: '#16C79A',
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(22, 199, 154, 0.08)',
            border: '1px solid rgba(22, 199, 154, 0.2)',
            borderRadius: 6,
          }}>
            <span style={{ marginRight: 8 }}>OK</span>
            {step.text}
          </div>
        );
      default:
        return null;
    }
  };

  const [filesSheetOpen, setFilesSheetOpen] = useState(false);

  return (
    <div className="widget-container" style={isMobile ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}>
      {/* Header */}
      <div style={{ padding: isMobile ? '0.75rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: isMobile ? '0.75rem' : '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Terminal Playground</h3>
            {!isMobile && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Watch Claude Code think, write, and run</p>}
          </div>
        </div>
      </div>

      {/* Task picker or terminal */}
      {!selectedPreset ? (
        <div style={isMobile ? { flex: 1, minHeight: 0, overflowY: 'auto', padding: '0.75rem 1rem' } : { padding: '2rem' }}>
          {!isMobile && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: '#1A1A2E',
              marginBottom: '1.5rem',
              lineHeight: 1.7,
              maxWidth: '50ch',
            }}>
              Pick a task and watch how Claude Code breaks it down, writes the code, and verifies it works.
            </p>
          )}
          {/* Mobile: compact chip-style task picker */}
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(presets).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => startSimulation(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    background: 'rgba(123, 97, 255, 0.04)',
                    border: '1px solid rgba(123, 97, 255, 0.12)',
                    borderRadius: 10, cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: 'rgba(123,97,255,0.1)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: '#7B61FF',
                  }}>
                    {'\u25B6'}
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#7B61FF', display: 'block' }}>
                      {p.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#6B7280' }}>
                      {p.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(presets).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => startSimulation(key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '14px 18px',
                    background: 'rgba(123, 97, 255, 0.04)',
                    border: '1px solid rgba(123, 97, 255, 0.12)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    textAlign: 'left',
                    minHeight: 44,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(123, 97, 255, 0.35)';
                    e.currentTarget.style.background = 'rgba(123, 97, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(123, 97, 255, 0.12)';
                    e.currentTarget.style.background = 'rgba(123, 97, 255, 0.04)';
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#7B61FF',
                    marginBottom: 4,
                  }}>
                    {p.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    color: '#6B7280',
                    lineHeight: 1.5,
                  }}>
                    {p.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : isMobile ? (
        /* MOBILE: full-card terminal, no file tree sidebar */
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#1A1A2E' }}>
          {/* Terminal title bar with Files button */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6b7280', marginLeft: 6, flex: 1,
            }}>
              ~/my-project
            </span>
            <button
              onClick={() => setFilesSheetOpen(true)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                color: '#7B61FF', background: 'rgba(123,97,255,0.12)',
                border: '1px solid rgba(123,97,255,0.2)', borderRadius: 5,
                padding: '3px 8px', cursor: 'pointer',
              }}
            >
              Files
            </button>
          </div>

          {/* Terminal output */}
          <div
            ref={terminalRef}
            style={{
              flex: 1, minHeight: 0, overflowY: 'auto',
              padding: '8px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              lineHeight: 1.65,
            }}
          >
            <div style={{ color: '#6b7280', marginBottom: 8 }}>
              <span style={{ color: '#16C79A' }}>~/my-project $</span>{' '}
              <span style={{ color: '#e2e8f0' }}>claude "{preset!.label.toLowerCase()}"</span>
            </div>

            {preset!.steps.slice(0, typingIndex >= 0 ? visibleSteps + 1 : visibleSteps).map((step, i) =>
              renderStep(step, i)
            )}

            {isRunning && typingIndex === -1 && visibleSteps < preset!.steps.length && (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                <span className="thinking-dots">
                  <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0s' }}>.</span>
                  <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0.2s' }}>.</span>
                  <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0.4s' }}>.</span>
                </span>
              </div>
            )}
          </div>

          {/* Reset button */}
          {!isRunning && visibleSteps >= (preset?.steps.length || 0) && (
            <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <button
                onClick={reset}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  color: '#7B61FF', background: 'rgba(123, 97, 255, 0.1)',
                  border: '1px solid rgba(123, 97, 255, 0.25)',
                  borderRadius: 6, padding: '6px 14px', minHeight: 40,
                  cursor: 'pointer', width: '100%',
                }}
              >
                Try another task
              </button>
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP: grid layout with file tree sidebar */
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', flex: 1, minHeight: 0 }}>
          {/* File tree sidebar */}
          <div style={{
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: '#141425',
            padding: '14px 12px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6b7280',
              marginBottom: 10,
            }}>
              FILES
            </div>
            <FileTree
              nodes={preset!.files}
              highlightFiles={highlightFiles}
              revealedCount={visibleSteps}
            />
          </div>

          {/* Terminal */}
          <div style={{ background: '#1A1A2E', display: 'flex', flexDirection: 'column' }}>
            {/* Terminal title bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#6b7280',
                marginLeft: 8,
              }}>
                ~/my-project
              </span>
            </div>

            {/* Terminal output */}
            <div
              ref={terminalRef}
              style={{
                flex: 1,
                padding: '14px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                lineHeight: 1.65,
                overflowY: 'auto',
                maxHeight: dvhValue(40),
              }}
            >
              <div style={{ color: '#6b7280', marginBottom: 12 }}>
                <span style={{ color: '#16C79A' }}>~/my-project $</span>{' '}
                <span style={{ color: '#e2e8f0' }}>claude "{preset!.label.toLowerCase()}"</span>
              </div>

              {preset!.steps.slice(0, typingIndex >= 0 ? visibleSteps + 1 : visibleSteps).map((step, i) =>
                renderStep(step, i)
              )}

              {isRunning && typingIndex === -1 && visibleSteps < preset!.steps.length && (
                <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  <span className="thinking-dots">
                    <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0s' }}>.</span>
                    <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0.2s' }}>.</span>
                    <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0.4s' }}>.</span>
                  </span>
                </div>
              )}
            </div>

            {/* Reset button */}
            {!isRunning && visibleSteps >= (preset?.steps.length || 0) && (
              <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={reset}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#7B61FF',
                    background: 'rgba(123, 97, 255, 0.1)',
                    border: '1px solid rgba(123, 97, 255, 0.25)',
                    borderRadius: 6,
                    padding: '6px 14px',
                    minHeight: 44,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(123, 97, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(123, 97, 255, 0.1)';
                  }}
                >
                  Try another task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile BottomSheet for file tree */}
      {isMobile && (
        <BottomSheet
          isOpen={filesSheetOpen}
          onClose={() => setFilesSheetOpen(false)}
          title="Project Files"
        >
          {preset && (
            <div style={{ background: '#141425', borderRadius: 8, padding: '12px' }}>
              <FileTree
                nodes={preset.files}
                highlightFiles={highlightFiles}
                revealedCount={visibleSteps}
              />
            </div>
          )}
        </BottomSheet>
      )}

      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes dotPulse {
          0%, 20% { opacity: 0.2; }
          50% { opacity: 1; }
          80%, 100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

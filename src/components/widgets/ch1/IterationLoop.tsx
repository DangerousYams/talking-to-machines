import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

interface Frame {
  label: string;
  prompt: string;
  response: string;
  quality: number;
  insight: string;
}

const frames: Frame[] = [
  {
    label: 'Attempt 1',
    prompt: 'Write me a cover letter for a game studio internship',
    response: "Dear Hiring Manager,\n\nI am writing to express my interest in the internship position at your game studio. I am a hardworking and passionate individual who loves video games. I have experience with various programming languages and I am a quick learner.\n\nI believe I would be a great fit for your team. I am excited about the opportunity to contribute to your projects.\n\nThank you for your consideration.\n\nSincerely,\nStudent",
    quality: 15,
    insight: 'Generic, forgettable, could be about any job at any company.',
  },
  {
    label: 'Attempt 2',
    prompt: 'Write a cover letter for a summer internship at Riot Games. I\'m a high school junior who codes in Python and has built a few small games in Pygame.',
    response: "Dear Riot Games Hiring Team,\n\nI'm a high school junior applying for your summer internship program. I've been coding in Python for two years and have built several small games using Pygame, including a top-down dungeon crawler and a tower defense game.\n\nI'm passionate about game development and have been playing League of Legends since season 8. I understand the importance of game balance and player experience.\n\nI would love the opportunity to learn from your team and contribute to the development process.\n\nBest regards,\nStudent",
    quality: 40,
    insight: 'Better \u2014 mentions the company and actual skills. But still reads like a template.',
  },
  {
    label: 'Attempt 3',
    prompt: 'Write a cover letter for Riot Games\' summer internship. I\'m a junior in high school, I code in Python/Pygame, and I built a dungeon crawler that 50 classmates playtested. Focus on what I learned from watching people play my game, not just what I built. Keep it under 200 words. Tone: confident but not arrogant.',
    response: "Dear Riot Games team,\n\nWhen I watched 50 classmates playtest my Pygame dungeon crawler, I learned something no tutorial teaches: the gap between what you design and what players actually do.\n\nPlayers ignored my carefully crafted tutorial. They found exploits I never imagined. One student softlocked the game in a way I spent three days fixing. Each session taught me more about player behavior than a month of solo development.\n\nI'm a high school junior who's been building games in Python for two years. But the skill I'm proudest of isn't coding \u2014 it's learning to watch someone struggle with my UI and resist the urge to explain, because if I have to explain it, I need to redesign it.\n\nI want to bring that observer's mindset to Riot's internship program. I know I have everything to learn about professional game development. But I also know I'll show up ready to watch, listen, and iterate.\n\n\u2014 Student",
    quality: 70,
    insight: 'Now we\'re talking. Specific story, real insight, shows personality. But the closing is still generic.',
  },
  {
    label: 'Attempt 4',
    prompt: 'The cover letter is good, but the closing paragraph is weak. Rewrite just the last paragraph to connect my playtesting experience to a specific Riot value or project. Also, the line "everything to learn" undersells me \u2014 replace it with something that shows humility without self-deprecation.',
    response: "I want to bring that observer's mindset to Riot's internship program \u2014 specifically to the team working on player onboarding. Watching new players bounce off my dungeon crawler taught me that the first 60 seconds decide everything, and I know that challenge scales enormously when millions of players are involved.\n\nI won't pretend I know how to ship features at Riot's scale. But I've proven I can build, test, break, and rebuild \u2014 and I pay attention to the moments that matter most.\n\n\u2014 Student",
    quality: 88,
    insight: 'Targeted. The critique-and-refine step transformed a generic closer into something memorable. This is what iteration looks like.',
  },
  {
    label: 'Final Version',
    prompt: 'This is great. One last pass: make the opening line more hooky \u2014 something that makes a recruiter stop scrolling. And cut "Dear Riot Games team" \u2014 start with the story directly.',
    response: "Fifty classmates broke my game in ways I never imagined \u2014 and it was the best education I've ever had.\n\nWhen I playtested my Pygame dungeon crawler, players ignored my tutorial, found exploits I'd missed, and one student softlocked the game in a way I spent three days fixing. Each session taught me more about player behavior than a month of solo development.\n\nI'm a high school junior who's been building games in Python for two years. But the skill I'm proudest of isn't coding \u2014 it's learning to watch someone struggle with my UI and resist the urge to explain, because if I have to explain it, I need to redesign it.\n\nI want to bring that observer's mindset to Riot's player onboarding team. Watching new players bounce off my dungeon crawler taught me that the first 60 seconds decide everything \u2014 and I know that challenge scales enormously at Riot.\n\nI won't pretend I know how to ship features at your scale. But I've proven I can build, test, break, and rebuild \u2014 and I pay attention to the moments that matter most.\n\n\u2014 Student",
    quality: 97,
    insight: 'Five iterations. Same task. Radically different result. The AI didn\'t get smarter \u2014 the prompter did.',
  },
];

export default function IterationLoop() {
  const isMobile = useIsMobile();
  const [activeFrame, setActiveFrame] = useState(0);
  const [mobileTab, setMobileTab] = useState<'prompt' | 'response'>('prompt');
  const [sheetOpen, setSheetOpen] = useState(false);
  const frame = frames[activeFrame];

  return (
    <div className="widget-container" style={isMobile ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}>
      {/* Header */}
      {isMobile ? (
        <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #F5A623, #E94560)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3, flex: 1 }}>The Iteration Loop</h3>
        </div>
      ) : (
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #F5A623, #E94560)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>The Iteration Loop</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Same task, 5 rounds. Watch each version improve.</p>
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        /* --- MOBILE LAYOUT --- */
        <>
          {/* Frame selector: dot/pill pills */}
          <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(26,26,46,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              {frames.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFrame(i)}
                  style={{
                    flex: 1, height: 30, borderRadius: 6, border: '1px solid', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: i === activeFrame ? 700 : 500,
                    background: i === activeFrame ? '#1A1A2E' : i < activeFrame ? 'rgba(22,199,154,0.08)' : 'transparent',
                    borderColor: i === activeFrame ? '#1A1A2E' : i < activeFrame ? 'rgba(22,199,154,0.2)' : 'rgba(26,26,46,0.08)',
                    color: i === activeFrame ? '#FAF8F5' : i < activeFrame ? '#16C79A' : '#6B7280',
                    padding: 0,
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {/* Quality meter - thin */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280', fontWeight: 600, flexShrink: 0 }}>QUALITY</span>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  width: `${frame.quality}%`,
                  background: `linear-gradient(90deg, #F5A623, ${frame.quality > 80 ? '#16C79A' : frame.quality > 50 ? '#0EA5E9' : '#E94560'})`,
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, minWidth: 30, textAlign: 'right' as const,
                color: frame.quality > 80 ? '#16C79A' : frame.quality > 50 ? '#0EA5E9' : '#E94560',
              }}>
                {frame.quality}%
              </span>
            </div>
          </div>

          {/* Prompt/Response toggle tabs */}
          <div style={{ display: 'flex', gap: 0, flexShrink: 0, borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
            <button
              onClick={() => setMobileTab('prompt')}
              style={{
                flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em',
                background: 'transparent',
                color: mobileTab === 'prompt' ? '#F5A623' : '#6B7280',
                borderBottom: mobileTab === 'prompt' ? '2px solid #F5A623' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              PROMPT
            </button>
            <button
              onClick={() => setMobileTab('response')}
              style={{
                flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em',
                background: 'transparent',
                color: mobileTab === 'response' ? '#0EA5E9' : '#6B7280',
                borderBottom: mobileTab === 'response' ? '2px solid #0EA5E9' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              RESPONSE
            </button>
          </div>

          {/* Content area */}
          <div
            onClick={() => setSheetOpen(true)}
            style={{
              flex: 1, overflow: 'hidden', padding: '0.5rem 0.75rem', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              fontFamily: mobileTab === 'prompt' ? 'var(--font-mono)' : 'var(--font-body)',
              fontSize: '0.78rem', lineHeight: 1.65, color: '#1A1A2E',
              whiteSpace: 'pre-wrap' as const,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical' as any,
              flex: 1,
            }}>
              {mobileTab === 'prompt' ? frame.prompt : frame.response}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#6B7280', marginTop: 4, flexShrink: 0 }}>
              Tap to read full text
            </span>
          </div>

          {/* Insight bar */}
          <div style={{
            padding: '0.4rem 0.75rem', borderTop: '1px solid rgba(26,26,46,0.06)',
            background: 'linear-gradient(135deg, rgba(245,166,35,0.04), rgba(233,69,96,0.04))',
            flexShrink: 0,
          }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0,
              overflow: 'hidden', whiteSpace: 'nowrap' as const, textOverflow: 'ellipsis',
            }}>
              <span style={{ fontWeight: 600, color: '#E94560', fontStyle: 'normal' }}>Insight: </span>
              {frame.insight}
            </p>
          </div>

          {/* Prev/Next nav */}
          <div style={{ display: 'flex', gap: 8, padding: '0.4rem 0.75rem', flexShrink: 0, borderTop: '1px solid rgba(26,26,46,0.06)' }}>
            <button
              onClick={() => setActiveFrame(Math.max(0, activeFrame - 1))}
              disabled={activeFrame === 0}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid rgba(26,26,46,0.1)',
                cursor: activeFrame === 0 ? 'default' : 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                background: 'transparent', color: activeFrame === 0 ? '#B0B0B0' : '#1A1A2E',
                minHeight: 36,
              }}
            >
              &larr; Prev
            </button>
            <button
              onClick={() => setActiveFrame(Math.min(frames.length - 1, activeFrame + 1))}
              disabled={activeFrame === frames.length - 1}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                cursor: activeFrame === frames.length - 1 ? 'default' : 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                background: activeFrame === frames.length - 1 ? 'rgba(26,26,46,0.06)' : '#1A1A2E',
                color: activeFrame === frames.length - 1 ? '#B0B0B0' : '#FAF8F5',
                minHeight: 36,
              }}
            >
              Next &rarr;
            </button>
          </div>

          {/* BottomSheet for full text */}
          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title={mobileTab === 'prompt' ? 'Prompt' : 'Response'}
          >
            <div style={{
              fontFamily: mobileTab === 'prompt' ? 'var(--font-mono)' : 'var(--font-body)',
              fontSize: '0.85rem', lineHeight: 1.7, color: '#1A1A2E',
              whiteSpace: 'pre-wrap' as const,
            }}>
              {mobileTab === 'prompt' ? frame.prompt : frame.response}
            </div>
          </BottomSheet>
        </>
      ) : (
        /* --- DESKTOP LAYOUT (unchanged) --- */
        <>
          {/* Timeline navigation */}
          <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', background: 'rgba(26,26,46,0.015)' }}>
            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              {frames.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFrame(i)}
                  style={{
                    flex: 1, height: 32, borderRadius: 8, border: '1px solid', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: i === activeFrame ? 700 : 500,
                    background: i === activeFrame ? '#1A1A2E' : i < activeFrame ? 'rgba(22,199,154,0.08)' : 'transparent',
                    borderColor: i === activeFrame ? '#1A1A2E' : i < activeFrame ? 'rgba(22,199,154,0.2)' : 'rgba(26,26,46,0.08)',
                    color: i === activeFrame ? '#FAF8F5' : i < activeFrame ? '#16C79A' : '#6B7280',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quality meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em', flexShrink: 0 }}>QUALITY</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  width: `${frame.quality}%`,
                  background: `linear-gradient(90deg, #F5A623, ${frame.quality > 80 ? '#16C79A' : frame.quality > 50 ? '#0EA5E9' : '#E94560'})`,
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, minWidth: 36, textAlign: 'right' as const,
                color: frame.quality > 80 ? '#16C79A' : frame.quality > 50 ? '#0EA5E9' : '#E94560',
              }}>
                {frame.quality}%
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 360 }}>
            {/* Left: Prompt */}
            <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid rgba(26,26,46,0.06)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#F5A623', display: 'block', marginBottom: 10 }}>
                Prompt
              </span>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.7, color: '#1A1A2E',
                background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10, padding: '1.25rem 1.5rem',
              }}>
                {frame.prompt}
              </div>
            </div>

            {/* Right: Response */}
            <div style={{ padding: '1.5rem 2rem', background: 'rgba(26,26,46,0.015)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0EA5E9', display: 'block', marginBottom: 10 }}>
                Response
              </span>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.7, color: '#1A1A2E',
                whiteSpace: 'pre-wrap' as const, maxHeight: '40dvh', overflowY: 'auto' as const,
              }}>
                {frame.response}
              </div>
            </div>
          </div>

          {/* Insight bar */}
          <div style={{
            padding: '1rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
            background: 'linear-gradient(135deg, rgba(245,166,35,0.04), rgba(233,69,96,0.04))',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0 }}>
              <span style={{ fontWeight: 600, color: '#E94560', fontStyle: 'normal' }}>Insight: </span>
              {frame.insight}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

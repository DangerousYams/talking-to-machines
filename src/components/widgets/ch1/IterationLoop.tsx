import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

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
    insight: 'Better — mentions the company and actual skills. But still reads like a template.',
  },
  {
    label: 'Attempt 3',
    prompt: 'Write a cover letter for Riot Games\' summer internship. I\'m a junior in high school, I code in Python/Pygame, and I built a dungeon crawler that 50 classmates playtested. Focus on what I learned from watching people play my game, not just what I built. Keep it under 200 words. Tone: confident but not arrogant.',
    response: "Dear Riot Games team,\n\nWhen I watched 50 classmates playtest my Pygame dungeon crawler, I learned something no tutorial teaches: the gap between what you design and what players actually do.\n\nPlayers ignored my carefully crafted tutorial. They found exploits I never imagined. One student softlocked the game in a way I spent three days fixing. Each session taught me more about player behavior than a month of solo development.\n\nI'm a high school junior who's been building games in Python for two years. But the skill I'm proudest of isn't coding — it's learning to watch someone struggle with my UI and resist the urge to explain, because if I have to explain it, I need to redesign it.\n\nI want to bring that observer's mindset to Riot's internship program. I know I have everything to learn about professional game development. But I also know I'll show up ready to watch, listen, and iterate.\n\n— Student",
    quality: 70,
    insight: 'Now we\'re talking. Specific story, real insight, shows personality. But the closing is still generic.',
  },
  {
    label: 'Attempt 4',
    prompt: 'The cover letter is good, but the closing paragraph is weak. Rewrite just the last paragraph to connect my playtesting experience to a specific Riot value or project. Also, the line "everything to learn" undersells me — replace it with something that shows humility without self-deprecation.',
    response: "I want to bring that observer's mindset to Riot's internship program — specifically to the team working on player onboarding. Watching new players bounce off my dungeon crawler taught me that the first 60 seconds decide everything, and I know that challenge scales enormously when millions of players are involved.\n\nI won't pretend I know how to ship features at Riot's scale. But I've proven I can build, test, break, and rebuild — and I pay attention to the moments that matter most.\n\n— Student",
    quality: 88,
    insight: 'Targeted. The critique-and-refine step transformed a generic closer into something memorable. This is what iteration looks like.',
  },
  {
    label: 'Final Version',
    prompt: 'This is great. One last pass: make the opening line more hooky — something that makes a recruiter stop scrolling. And cut "Dear Riot Games team" — start with the story directly.',
    response: "Fifty classmates broke my game in ways I never imagined — and it was the best education I've ever had.\n\nWhen I playtested my Pygame dungeon crawler, players ignored my tutorial, found exploits I'd missed, and one student softlocked the game in a way I spent three days fixing. Each session taught me more about player behavior than a month of solo development.\n\nI'm a high school junior who's been building games in Python for two years. But the skill I'm proudest of isn't coding — it's learning to watch someone struggle with my UI and resist the urge to explain, because if I have to explain it, I need to redesign it.\n\nI want to bring that observer's mindset to Riot's player onboarding team. Watching new players bounce off my dungeon crawler taught me that the first 60 seconds decide everything — and I know that challenge scales enormously at Riot.\n\nI won't pretend I know how to ship features at your scale. But I've proven I can build, test, break, and rebuild — and I pay attention to the moments that matter most.\n\n— Student",
    quality: 97,
    insight: 'Five iterations. Same task. Radically different result. The AI didn\'t get smarter — the prompter did.',
  },
];

export default function IterationLoop() {
  const isMobile = useIsMobile();
  const [activeFrame, setActiveFrame] = useState(0);
  const frame = frames[activeFrame];

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #F5A623, #E94560)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>The Iteration Loop</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Same task, 5 rounds. Watch each version improve.</p>
          </div>
        </div>
      </div>

      {/* Timeline navigation */}
      <div style={{ padding: isMobile ? '1rem' : '1.25rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', background: 'rgba(26,26,46,0.015)' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch' as any, paddingBottom: isMobile ? 4 : 0 }}>
          {frames.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveFrame(i)}
              style={{
                flex: isMobile ? '0 0 auto' : 1, minWidth: isMobile ? 80 : 'auto', height: isMobile ? 40 : 32, borderRadius: 8, border: '1px solid', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: i === activeFrame ? 700 : 500,
                padding: isMobile ? '0 10px' : 0,
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em', flexShrink: 0 }}>QUALITY</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: isMobile ? 'auto' : 360 }}>
        {/* Left: Prompt */}
        <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem', borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)', borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#F5A623', display: 'block', marginBottom: 10 }}>
            Prompt
          </span>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.78rem' : '0.82rem', lineHeight: 1.7, color: '#1A1A2E',
            background: '#FEFDFB', border: '1px solid rgba(26,26,46,0.06)', borderRadius: 10, padding: isMobile ? '1rem' : '1.25rem 1.5rem',
          }}>
            {frame.prompt}
          </div>
        </div>

        {/* Right: Response */}
        <div style={{ padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem', background: 'rgba(26,26,46,0.015)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#0EA5E9', display: 'block', marginBottom: 10 }}>
            Response
          </span>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.8rem' : '0.85rem', lineHeight: 1.7, color: '#1A1A2E',
            whiteSpace: 'pre-wrap' as const, maxHeight: isMobile ? 240 : 280, overflowY: 'auto' as const,
            WebkitOverflowScrolling: 'touch' as any,
          }}>
            {frame.response}
          </div>
        </div>
      </div>

      {/* Insight bar */}
      <div style={{
        padding: isMobile ? '1rem' : '1rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
        background: 'linear-gradient(135deg, rgba(245,166,35,0.04), rgba(233,69,96,0.04))',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0 }}>
          <span style={{ fontWeight: 600, color: '#E94560', fontStyle: 'normal' }}>Insight: </span>
          {frame.insight}
        </p>
      </div>
    </div>
  );
}

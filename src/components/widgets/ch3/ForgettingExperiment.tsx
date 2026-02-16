import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const standardConvo: ChatMessage[] = [
  { role: 'user', text: "I'm planning a trip and need help organizing everything." },
  { role: 'assistant', text: "I'd love to help you plan your trip! Where are you thinking of going?" },
  { role: 'user', text: "Tokyo! I've always wanted to go." },
  { role: 'assistant', text: "Tokyo is an amazing choice! When are you planning to go, and for how long?" },
  { role: 'user', text: "July, for about 10 days. My budget is around $3,000 not counting flights." },
  { role: 'assistant', text: "$3,000 for 10 days in Tokyo is workable! That's about $300/day for lodging, food, activities, and transit. Want me to break that down?" },
  { role: 'user', text: "Yes please. Oh also, I'm vegetarian -- that's important for restaurant planning." },
  { role: 'assistant', text: "Good to know! Tokyo actually has a great vegetarian scene. Let me start with accommodation options in your budget range..." },
  { role: 'user', text: "I'm really interested in visiting temples and historical sites." },
  { role: 'assistant', text: "Perfect! Senso-ji in Asakusa, Meiji Shrine, and the temples in Kamakura are must-sees. I'd suggest dedicating 2-3 days to temple visits." },
  { role: 'user', text: "What about the Tsukiji fish market? Is it worth going?" },
  { role: 'assistant', text: "The outer market at Tsukiji is still active and worth a morning visit! Great street food and atmosphere. The inner wholesale market moved to Toyosu." },
  { role: 'user', text: "Should I get a Japan Rail Pass?" },
  { role: 'assistant', text: "For 10 days mostly in Tokyo, a JR Pass might not be worth it unless you plan day trips. A Suica/Pasmo IC card is better for city transit." },
  { role: 'user', text: "Good call. What about day trips from Tokyo?" },
  { role: 'assistant', text: "Kamakura, Nikko, and Hakone are all great day trips. Hakone has hot springs with views of Mt. Fuji. Nikko has stunning shrine complexes." },
  { role: 'user', text: "I'm leaning toward Hakone and Kamakura. Let's plan those." },
  { role: 'assistant', text: "Great picks! For Kamakura, take the JR Yokosuka line (1 hour). Visit the Great Buddha, Hase-dera temple, then walk the Komachi-dori shopping street." },
  { role: 'user', text: "This is coming together. Can you also recommend restaurants?" },
  { role: 'assistant', text: "Of course! For great dining, try Shinjuku and Shibuya areas. There are izakayas, ramen shops, and sushi spots throughout. I'll make a list of top-rated places." },
  { role: 'user', text: "Wait -- what dietary restrictions did I mention earlier? Can you remind me?" },
  { role: 'assistant', text: "Hmm, I don't think you mentioned any specific dietary restrictions. Did you have something in mind? Let me know and I can adjust the restaurant recommendations accordingly!" },
];

const summaryConvo: ChatMessage[] = [
  { role: 'user', text: "I'm planning a trip and need help organizing everything." },
  { role: 'assistant', text: "I'd love to help you plan your trip! Where are you thinking of going?" },
  { role: 'user', text: "Tokyo! I've always wanted to go." },
  { role: 'assistant', text: "Tokyo is an amazing choice! When are you planning to go, and for how long?" },
  { role: 'user', text: "July, for about 10 days. My budget is around $3,000 not counting flights." },
  { role: 'assistant', text: "$3,000 for 10 days in Tokyo is workable! That's about $300/day for lodging, food, activities, and transit. Want me to break that down?" },
  { role: 'user', text: "Yes please. Oh also, I'm vegetarian -- that's important for restaurant planning." },
  { role: 'assistant', text: "Good to know! Tokyo actually has a great vegetarian scene. Let me start with accommodation options in your budget range..." },
  { role: 'user', text: "I'm really interested in visiting temples and historical sites." },
  { role: 'assistant', text: "Perfect! Here is a quick recap of our plan so far before we dive deeper:\n\n--- CONTEXT SUMMARY ---\nDestination: Tokyo, Japan\nDates: July, 10 days\nBudget: $3,000 (excl. flights)\nDietary: Vegetarian\nInterests: Temples & historical sites\nBudget breakdown: ~$300/day\n---\n\nNow, for temples: Senso-ji in Asakusa, Meiji Shrine, and the temples in Kamakura are must-sees." },
  { role: 'user', text: "What about the Tsukiji fish market? Is it worth going?" },
  { role: 'assistant', text: "The outer market at Tsukiji is still active and worth a morning visit! Great street food and atmosphere. The inner wholesale market moved to Toyosu." },
  { role: 'user', text: "Should I get a Japan Rail Pass?" },
  { role: 'assistant', text: "For 10 days mostly in Tokyo, a JR Pass might not be worth it unless you plan day trips. A Suica/Pasmo IC card is better for city transit." },
  { role: 'user', text: "Good call. What about day trips from Tokyo?" },
  { role: 'assistant', text: "Kamakura, Nikko, and Hakone are all great day trips. Hakone has hot springs with views of Mt. Fuji. Nikko has stunning shrine complexes." },
  { role: 'user', text: "I'm leaning toward Hakone and Kamakura. Let's plan those." },
  { role: 'assistant', text: "Great picks! For Kamakura, take the JR Yokosuka line (1 hour). Visit the Great Buddha, Hase-dera temple, then walk the Komachi-dori shopping street." },
  { role: 'user', text: "This is coming together. Can you also recommend restaurants?" },
  { role: 'assistant', text: "Of course! Since you're vegetarian (from our summary), I'll focus on veggie-friendly spots. Try T's TanTan in Tokyo Station for vegan ramen, Ain Soph for plant-based burgers, and Sougo in Roppongi for vegetarian kaiseki." },
  { role: 'user', text: "Wait -- what dietary restrictions did I mention earlier? Can you remind me?" },
  { role: 'assistant', text: "You mentioned you're vegetarian! I have that noted in our context summary from earlier. That's been guiding all my restaurant recommendations -- like T's TanTan for vegan ramen and Ain Soph for plant-based options." },
];

export default function ForgettingExperiment() {
  const [step, setStep] = useState(0);
  const isMobile = useIsMobile();
  const maxStep = standardConvo.length - 1;

  const isLastMessage = step === maxStep;
  const isForgettingMoment = step >= maxStep;

  const standardVisible = standardConvo.slice(0, step + 1);
  const summaryVisible = summaryConvo.slice(0, Math.min(step + 1, summaryConvo.length));

  return (
    <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #E94560)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 2v10l4.5 4.5" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>The Forgetting Experiment</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Same conversation, two approaches. Click through to see what happens.</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: isMobile ? '0.75rem 1rem' : '0.75rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', background: 'rgba(26,26,46,0.015)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em', flexShrink: 0 }}>
            MESSAGE {step + 1} / {maxStep + 1}
          </span>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(26,26,46,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, transition: 'width 0.4s ease',
              width: `${((step + 1) / (maxStep + 1)) * 100}%`,
              background: isForgettingMoment ? 'linear-gradient(90deg, #7B61FF, #E94560)' : '#7B61FF',
            }} />
          </div>
        </div>
      </div>

      {/* Split-screen chats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', flex: 1, minHeight: 0 }}>
        {/* Left: Standard Chat */}
        <div style={{ borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)', borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: isMobile ? '10px 1rem' : '10px 1.25rem', borderBottom: '1px solid rgba(26,26,46,0.06)', background: 'rgba(233,69,96,0.03)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#E94560' }}>
              Standard Chat
            </span>
          </div>
          <div style={{ flex: 1, padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem', overflowY: 'auto' as const, maxHeight: isMobile ? '30dvh' : '35dvh' }}>
            {standardVisible.map((msg, i) => {
              const isFailure = isForgettingMoment && i === standardVisible.length - 1 && msg.role === 'assistant';
              return (
                <div key={i} style={{
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '85%', padding: '8px 12px', borderRadius: 10,
                    background: msg.role === 'user' ? 'rgba(26,26,46,0.06)' : isFailure ? 'rgba(233,69,96,0.08)' : 'rgba(123,97,255,0.06)',
                    border: isFailure ? '1px solid rgba(233,69,96,0.2)' : '1px solid transparent',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.5, margin: 0,
                      color: isFailure ? '#E94560' : '#1A1A2E',
                    }}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: With Summary */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: isMobile ? '10px 1rem' : '10px 1.25rem', borderBottom: '1px solid rgba(26,26,46,0.06)', background: 'rgba(22,199,154,0.03)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#16C79A' }}>
              With Context Summary
            </span>
          </div>
          <div style={{ flex: 1, padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem', overflowY: 'auto' as const, maxHeight: isMobile ? '30dvh' : '35dvh' }}>
            {summaryVisible.map((msg, i) => {
              const isSuccess = isForgettingMoment && i === summaryVisible.length - 1 && msg.role === 'assistant';
              const isSummary = msg.text.includes('CONTEXT SUMMARY');
              return (
                <div key={i} style={{
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '85%', padding: '8px 12px', borderRadius: 10,
                    background: msg.role === 'user'
                      ? 'rgba(26,26,46,0.06)'
                      : isSummary
                        ? 'rgba(123,97,255,0.08)'
                        : isSuccess
                          ? 'rgba(22,199,154,0.08)'
                          : 'rgba(123,97,255,0.06)',
                    border: isSummary
                      ? '1px solid rgba(123,97,255,0.2)'
                      : isSuccess
                        ? '1px solid rgba(22,199,154,0.2)'
                        : '1px solid transparent',
                  }}>
                    {isSummary && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#7B61FF', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
                        CONTEXT SUMMARY INJECTED
                      </span>
                    )}
                    <p style={{
                      fontFamily: isSummary ? 'var(--font-mono)' : 'var(--font-body)',
                      fontSize: isSummary ? '0.75rem' : '0.78rem',
                      lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' as const,
                      color: isSuccess ? '#16C79A' : '#1A1A2E',
                      fontWeight: isSuccess ? 600 : 400,
                    }}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation + Insight */}
      <div style={{
        padding: isMobile ? '0.75rem 1rem' : '1rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: isMobile ? 12 : 16,
        background: isForgettingMoment
          ? 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(123,97,255,0.04))'
          : 'rgba(26,26,46,0.015)',
      }}>
        <div style={{ flex: 1 }}>
          {isForgettingMoment ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.8rem' : '0.85rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0 }}>
              <span style={{ fontWeight: 600, color: '#E94560', fontStyle: 'normal' }}>Look at the difference. </span>
              The standard chat forgot the vegetarian detail. The summary version remembered because someone explicitly restated it mid-conversation. One line of recap prevented the failure.
            </p>
          ) : (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.78rem' : '0.82rem', color: '#6B7280', margin: 0 }}>
              Click through the conversation. Watch what happens when we ask about dietary restrictions...
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              padding: isMobile ? '12px 16px' : '8px 16px', borderRadius: 8, border: '1px solid rgba(26,26,46,0.1)',
              background: step === 0 ? 'transparent' : '#FEFDFB', cursor: step === 0 ? 'default' : 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
              color: step === 0 ? '#6B728050' : '#6B7280', transition: 'all 0.2s',
              minHeight: 44, flex: isMobile ? 1 : 'none',
            }}
          >
            Back
          </button>
          <button
            onClick={() => setStep(s => Math.min(maxStep, s + 1))}
            disabled={step === maxStep}
            style={{
              padding: isMobile ? '12px 16px' : '8px 16px', borderRadius: 8, border: 'none',
              background: step === maxStep ? 'rgba(26,26,46,0.08)' : '#7B61FF',
              cursor: step === maxStep ? 'default' : 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
              color: step === maxStep ? '#6B7280' : 'white', transition: 'all 0.2s',
              minHeight: 44, flex: isMobile ? 1 : 'none',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

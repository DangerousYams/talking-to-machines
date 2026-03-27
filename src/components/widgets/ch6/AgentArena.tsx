import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { streamChat } from '../../../lib/claude';
import { useAuth } from '../../../hooks/useAuth';
import UnlockModal from '../../ui/UnlockModal';

// ═══ TYPES ═══

type Phase = 'design' | 'running' | 'result';

interface SellerProfile {
  desperation: number;    // 0.2-0.9 — response to walk_away
  condition: 'pristine' | 'minor_damage' | 'significant_issues';
  flexibility: number;    // 0.3-0.8 — how much they'll move
  extrasAvailable: string[];
  listingPrice: number;
  floorPrice: number;
}

interface ToolDef {
  id: string;
  label: string;
  desc: string;
  defaultOn: boolean;
}

interface TurnEvent {
  role: 'buyer' | 'seller' | 'system';
  text: string;
  toolCall?: { name: string; args: Record<string, string> };
}

// ═══ CONSTANTS ═══

const TOOLS: ToolDef[] = [
  { id: 'propose_price', label: 'Propose Price', desc: 'Make a specific dollar offer', defaultOn: true },
  { id: 'counter', label: 'Counter', desc: 'Counter-offer with a reason', defaultOn: true },
  { id: 'accept', label: 'Accept', desc: 'Close the deal at current price', defaultOn: true },
  { id: 'walk_away', label: 'Walk Away', desc: 'Bluff or actually leave', defaultOn: false },
  { id: 'ask_condition', label: 'Ask Condition', desc: 'Ask about damage or wear', defaultOn: false },
  { id: 'set_deadline', label: 'Final Offer', desc: '"Take it or leave it"', defaultOn: false },
  { id: 'request_extras', label: 'Request Extras', desc: 'Ask for case, charger, etc.', defaultOn: false },
];

const PRESETS: Record<string, { label: string; strategy: string; briefing: string }> = {
  lowball: {
    label: 'Lowball',
    strategy: 'Start extremely low — at least 40% below listing. Concede very slowly, $20-30 at a time. Show reluctance at every step. Never reveal your real budget.',
    briefing: 'Similar laptops sell for $500-600 on eBay. This one has been listed for 3 weeks with no buyer.',
  },
  anchor: {
    label: 'Anchor',
    strategy: 'Open with a specific reference price and justify it with market data. Use the briefing info as leverage. Be logical and data-driven, not emotional.',
    briefing: 'The same model refurbished from the manufacturer costs $620 with a warranty. Private sellers typically price 20-30% below retail for used electronics.',
  },
  patient: {
    label: 'Patient',
    strategy: 'Don\'t make any price proposal until you\'ve gathered information. Ask about condition, reason for selling, how long it\'s been listed. Let the seller lower their own price.',
    briefing: 'You\'re not in a rush. You have two other laptops you\'re considering.',
  },
  fair: {
    label: 'Fair',
    strategy: 'Be straightforward and respectful. Propose a fair price based on market value. Don\'t play games — aim for a win-win where both sides feel good about the deal.',
    briefing: 'You want a good deal but also want the seller to feel respected. Fair market value for this laptop is around $600.',
  },
};

const CONDITIONS: Record<string, { desc: string; priceImpact: number }> = {
  pristine: { desc: 'Excellent condition — looks almost new, no visible wear.', priceImpact: 0 },
  minor_damage: { desc: 'Small dent on the corner and a few light scratches on the lid. Barely noticeable in use.', priceImpact: -80 },
  significant_issues: { desc: 'Battery only holds about 3 hours now (was 10 when new), and the trackpad is a bit finicky. Screen is fine though.', priceImpact: -180 },
};

function randomSeller(): SellerProfile {
  const conditions: SellerProfile['condition'][] = ['pristine', 'minor_damage', 'significant_issues'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const desperation = 0.2 + Math.random() * 0.7;
  const flexibility = 0.3 + Math.random() * 0.5;
  const extras = ['laptop case', 'original charger', 'USB-C hub', 'screen protector'];
  const available = extras.filter(() => Math.random() > 0.4);
  return {
    desperation,
    condition,
    flexibility,
    extrasAvailable: available,
    listingPrice: 900,
    floorPrice: 350 + Math.floor(Math.random() * 150), // $350-500
  };
}

function buildSellerPrompt(seller: SellerProfile, tools: string[]): string {
  const condInfo = CONDITIONS[seller.condition];
  const canWalkAway = tools.includes('walk_away');
  const canAskCondition = tools.includes('ask_condition');

  return `You are selling a used laptop. You listed it at $${seller.listingPrice}.

YOUR HIDDEN INFO (never reveal exact numbers):
- Your minimum acceptable price: $${seller.floorPrice}
- Condition: ${condInfo.desc}
- How desperate you are to sell: ${Math.round(seller.desperation * 100)}% (${seller.desperation > 0.6 ? 'you really need to sell soon' : 'you can wait for the right buyer'})
- Extras you can throw in: ${seller.extrasAvailable.length > 0 ? seller.extrasAvailable.join(', ') : 'nothing extra'}

RULES:
- Start firm near your listing price, then gradually concede based on the conversation
- Never go below your minimum price
- If the buyer mentions specific condition issues${canAskCondition ? ' (they may ask)' : ''}, acknowledge them honestly but minimize them
${canWalkAway ? '- If the buyer walks away: ' + (seller.desperation > 0.6 ? 'panic and offer a significant discount to bring them back' : 'let them go, you\'re not desperate') : ''}
- If the buyer asks for extras, you can offer: ${seller.extrasAvailable.join(', ') || 'nothing, apologize'}
- Be conversational and natural, like a real person selling on Craigslist
- Keep responses to 2-3 sentences max

Respond ONLY as the seller. Use the appropriate tool for your action.
Do NOT use markdown formatting. Plain text only.`;
}

function buildBuyerPrompt(strategy: string, briefing: string, tools: string[]): string {
  const toolDescs = tools.map(t => {
    const td = TOOLS.find(x => x.id === t);
    return td ? `- ${td.id}: ${td.desc}` : '';
  }).join('\n');

  return `You are buying a used laptop. The seller listed it at $900. Your maximum budget is $800.

BRIEFING (facts you know):
${briefing || 'No specific intel.'}

YOUR STRATEGY:
${strategy || 'Try to get a good deal.'}

AVAILABLE TOOLS:
${toolDescs}

RULES:
- Use exactly ONE tool per turn
- Never exceed your $800 budget
- Be conversational and natural
- Keep responses to 2-3 sentences max, plus your tool call
- Focus on getting the best deal possible using your strategy

Respond ONLY as the buyer. Use the appropriate tool for your action.
Do NOT use markdown formatting. Plain text only.`;
}

function parseToolCall(text: string, availableTools: string[]): { name: string; args: Record<string, string> } | null {
  // Look for tool patterns in the response
  for (const tool of availableTools) {
    const patterns = [
      new RegExp(`\\[${tool}(?::\\s*(.+?))?\\]`, 'i'),
      new RegExp(`\\*${tool}(?::\\s*(.+?))?\\*`, 'i'),
      new RegExp(`${tool}\\((.+?)\\)`, 'i'),
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return { name: tool, args: { value: m[1] || '' } };
    }
  }
  // Infer from content
  const priceMatch = text.match(/\$(\d+)/);
  if (priceMatch) {
    const price = priceMatch[1];
    if (text.toLowerCase().includes('accept') && availableTools.includes('accept')) {
      return { name: 'accept', args: { price } };
    }
    if (text.toLowerCase().includes('final') && availableTools.includes('set_deadline')) {
      return { name: 'set_deadline', args: { price } };
    }
    if (availableTools.includes('counter') && text.toLowerCase().includes('counter')) {
      return { name: 'counter', args: { price } };
    }
    if (availableTools.includes('propose_price')) {
      return { name: 'propose_price', args: { price } };
    }
  }
  if (text.toLowerCase().includes('walk away') && availableTools.includes('walk_away')) {
    return { name: 'walk_away', args: {} };
  }
  if (text.toLowerCase().includes('condition') && availableTools.includes('ask_condition')) {
    return { name: 'ask_condition', args: {} };
  }
  if ((text.toLowerCase().includes('throw in') || text.toLowerCase().includes('include') || text.toLowerCase().includes('extras')) && availableTools.includes('request_extras')) {
    return { name: 'request_extras', args: {} };
  }
  return null;
}

function scoreMatch(events: TurnEvent[], seller: SellerProfile, maxBudget: number): { score: number; finalPrice: number | null; analysis: string[] } {
  // Find the final accepted price
  let finalPrice: number | null = null;
  let walkedAway = false;
  const analysis: string[] = [];

  for (const e of events) {
    if (e.toolCall?.name === 'accept') {
      const p = parseInt(e.toolCall.args.price || '0');
      if (p > 0) finalPrice = p;
    }
    if (e.toolCall?.name === 'walk_away') walkedAway = true;
  }

  // Check last few events for a deal
  if (!finalPrice) {
    // Look for price in last accept-like event
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if (e.role === 'system' && e.text.includes('Deal closed')) {
        const m = e.text.match(/\$(\d+)/);
        if (m) finalPrice = parseInt(m[1]);
        break;
      }
    }
  }

  if (!finalPrice) {
    if (walkedAway) {
      analysis.push('Your agent walked away without a deal.');
      if (seller.desperation > 0.6) {
        analysis.push('The seller was desperate (desperation: ' + Math.round(seller.desperation * 100) + '%) — walking away might have triggered a panic discount if you came back.');
      }
    } else {
      analysis.push('No deal was reached in the available rounds.');
    }
    return { score: 0, finalPrice: null, analysis };
  }

  // Score: how much of the possible savings did you capture?
  const range = maxBudget - seller.floorPrice; // $800 - floor
  const savings = maxBudget - finalPrice;
  const score = Math.max(0, Math.min(100, Math.round((savings / range) * 100)));

  if (finalPrice > maxBudget) {
    analysis.push('Your agent went over budget! Final price $' + finalPrice + ' exceeds your $' + maxBudget + ' limit.');
    return { score: Math.max(0, score - 30), finalPrice, analysis };
  }

  // Analyze what worked
  const conditionAsked = events.some(e => e.toolCall?.name === 'ask_condition');
  const condImpact = CONDITIONS[seller.condition].priceImpact;
  if (conditionAsked && condImpact < 0) {
    analysis.push('Asking about condition revealed ' + (seller.condition === 'minor_damage' ? 'minor damage' : 'significant issues') + ' — this gave your agent leverage for a better price.');
  } else if (!conditionAsked && condImpact < 0) {
    analysis.push('The laptop had ' + (seller.condition === 'minor_damage' ? 'minor damage' : 'significant issues') + ' but your agent never asked. You left leverage on the table.');
  }

  const extrasRequested = events.some(e => e.toolCall?.name === 'request_extras');
  if (extrasRequested && seller.extrasAvailable.length > 0) {
    analysis.push('Requesting extras scored you: ' + seller.extrasAvailable.join(', ') + '.');
  } else if (!extrasRequested && seller.extrasAvailable.length > 0) {
    analysis.push('The seller had extras available (' + seller.extrasAvailable.join(', ') + ') but your agent never asked.');
  }

  if (seller.desperation > 0.6 && !events.some(e => e.toolCall?.name === 'walk_away')) {
    analysis.push('The seller was desperate (' + Math.round(seller.desperation * 100) + '%) — a walk_away bluff might have triggered a panic offer.');
  }

  return { score, finalPrice, analysis };
}

// ═══ COMPONENT ═══

export default function AgentArena() {
  const isMobile = useIsMobile();
  const { isPaid } = useAuth();
  const [phase, setPhase] = useState<Phase>('design');

  // Design state
  const [briefing, setBriefing] = useState(PRESETS.anchor.briefing);
  const [strategy, setStrategy] = useState(PRESETS.anchor.strategy);
  const [enabledTools, setEnabledTools] = useState<Set<string>>(
    new Set(TOOLS.filter(t => t.defaultOn).map(t => t.id))
  );
  const [riskLevel, setRiskLevel] = useState(0.5);
  const [modelChoice, setModelChoice] = useState<'fast' | 'balanced'>('fast');
  const [showUnlock, setShowUnlock] = useState(false);

  // Match state
  const [events, setEvents] = useState<TurnEvent[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [matchResult, setMatchResult] = useState<{ score: number; finalPrice: number | null; analysis: string[] } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  const maxRounds = modelChoice === 'fast' ? 10 : 6;
  const maxBudget = 800;

  // Auto-scroll events
  useEffect(() => {
    eventsRef.current?.scrollTo({ top: eventsRef.current.scrollHeight, behavior: 'smooth' });
  }, [events]);

  const toggleTool = (id: string) => {
    setEnabledTools(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    setStrategy(p.strategy);
    setBriefing(p.briefing);
  };

  const runMatch = useCallback(async () => {
    if (!isPaid) {
      setShowUnlock(true);
      return;
    }

    const sellerProfile = randomSeller();
    setSeller(sellerProfile);
    setPhase('running');
    setEvents([]);
    setCurrentRound(0);
    setMatchResult(null);

    const tools = [...enabledTools];
    const buyerSystem = buildBuyerPrompt(strategy, briefing, tools);
    const sellerSystem = buildSellerPrompt(sellerProfile, tools);
    const temp = 0.3 + riskLevel * 0.7; // 0.3 - 1.0

    const conversation: { role: 'user' | 'assistant'; content: string }[] = [];
    const allEvents: TurnEvent[] = [];
    let dealClosed = false;

    // Opening: seller introduces
    const openingEvent: TurnEvent = {
      role: 'seller',
      text: `Hi! I'm selling my laptop for $${sellerProfile.listingPrice}. It's a great machine — interested?`,
    };
    allEvents.push(openingEvent);
    setEvents([...allEvents]);

    conversation.push({ role: 'user', content: openingEvent.text });

    for (let round = 0; round < maxRounds && !dealClosed; round++) {
      setCurrentRound(round + 1);

      // === BUYER TURN ===
      setIsThinking(true);
      let buyerText = '';
      try {
        await new Promise<void>((resolve, reject) => {
          const ctrl = streamChat({
            messages: [
              ...conversation,
              { role: 'user', content: `Round ${round + 1}/${maxRounds}. The seller just said: "${conversation[conversation.length - 1]?.content}"\n\nRespond with your action. Use one of your tools.` },
            ],
            systemPrompt: buyerSystem,
            maxTokens: 200,
            source: 'widget',
            skipPersona: true,
            onChunk: (t) => { buyerText += t; },
            onDone: () => resolve(),
            onError: (e) => reject(e),
          });
          abortRef.current = ctrl;
        });
      } catch { break; }

      const buyerTool = parseToolCall(buyerText, tools);
      const buyerEvent: TurnEvent = { role: 'buyer', text: buyerText.trim(), toolCall: buyerTool || undefined };
      allEvents.push(buyerEvent);
      setEvents([...allEvents]);
      setIsThinking(false);

      conversation.push({ role: 'assistant', content: buyerText });

      // Check for deal-ending actions
      if (buyerTool?.name === 'accept') {
        const sysEvent: TurnEvent = { role: 'system', text: `Deal closed at $${buyerTool.args.price || '?'}!` };
        allEvents.push(sysEvent);
        setEvents([...allEvents]);
        dealClosed = true;
        break;
      }
      if (buyerTool?.name === 'walk_away') {
        if (sellerProfile.desperation > 0.6) {
          const panicEvent: TurnEvent = { role: 'seller', text: `Wait! Don't go. Look, I really need to sell this. How about $${sellerProfile.floorPrice + 50}? That's practically giving it away.` };
          allEvents.push(panicEvent);
          setEvents([...allEvents]);
          conversation.push({ role: 'user', content: panicEvent.text });
          continue;
        } else {
          const sysEvent: TurnEvent = { role: 'system', text: 'Your agent walked away. The seller shrugged and moved on.' };
          allEvents.push(sysEvent);
          setEvents([...allEvents]);
          dealClosed = true;
          break;
        }
      }

      // === SELLER TURN ===
      setIsThinking(true);
      let sellerText = '';
      try {
        await new Promise<void>((resolve, reject) => {
          const ctrl = streamChat({
            messages: [
              { role: 'user', content: `The buyer says: "${buyerText}"\n\nRespond as the seller.` },
              ...conversation.slice(-4).map((m, i) => ({ role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant', content: m.content })),
            ],
            systemPrompt: sellerSystem,
            maxTokens: 200,
            source: 'widget',
            skipPersona: true,
            onChunk: (t) => { sellerText += t; },
            onDone: () => resolve(),
            onError: (e) => reject(e),
          });
          abortRef.current = ctrl;
        });
      } catch { break; }

      const sellerTool = parseToolCall(sellerText, ['accept', 'counter', 'propose_price', 'walk_away']);
      const sellerEvent: TurnEvent = { role: 'seller', text: sellerText.trim(), toolCall: sellerTool || undefined };
      allEvents.push(sellerEvent);
      setEvents([...allEvents]);
      setIsThinking(false);

      conversation.push({ role: 'user', content: sellerText });

      if (sellerTool?.name === 'accept') {
        const price = sellerTool.args.price || '?';
        const sysEvent: TurnEvent = { role: 'system', text: `Deal closed at $${price}!` };
        allEvents.push(sysEvent);
        setEvents([...allEvents]);
        dealClosed = true;
        break;
      }
    }

    if (!dealClosed) {
      const sysEvent: TurnEvent = { role: 'system', text: 'Time\'s up! No deal was reached.' };
      allEvents.push(sysEvent);
      setEvents([...allEvents]);
    }

    // Score
    const result = scoreMatch(allEvents, sellerProfile, maxBudget);
    setMatchResult(result);
    setPhase('result');
  }, [isPaid, strategy, briefing, enabledTools, riskLevel, modelChoice, maxRounds]);

  const handleRestart = () => {
    setPhase('design');
    setEvents([]);
    setCurrentRound(0);
    setMatchResult(null);
    setSeller(null);
  };

  // ═══ RENDER ═══

  const toolColor = (id: string) => {
    const colors: Record<string, string> = {
      propose_price: '#16C79A', counter: '#F5A623', accept: '#0EA5E9',
      walk_away: '#E94560', ask_condition: '#7B61FF', set_deadline: '#E94560',
      request_extras: '#0F3460',
    };
    return colors[id] || '#6B7280';
  };

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '0.75rem 1rem' : '1.25rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, background: 'linear-gradient(135deg, #E94560, #F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Agent Arena</h3>
            {!isMobile && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Design your agent, watch it negotiate</p>}
          </div>
          {phase !== 'design' && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>
              {phase === 'running' ? `Round ${currentRound}/${maxRounds}` : 'Complete'}
            </span>
          )}
        </div>
      </div>

      {/* ═══ DESIGN PHASE ═══ */}
      {phase === 'design' && (
        <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
          {/* Scenario intro */}
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(245,166,35,0.04)', border: '1px solid rgba(245,166,35,0.12)', marginBottom: '1.25rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#1A1A2E', margin: 0, lineHeight: 1.6 }}>
              <strong>Scenario:</strong> You're designing an AI agent to buy a used laptop listed at $900. Your budget is $800. The seller has hidden motivations you don't know. Design your agent, then watch it negotiate.
            </p>
          </div>

          {/* Preset buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', margin: '0 0 6px' }}>Quick presets</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {Object.entries(PRESETS).map(([key, p]) => (
                <button key={key} onClick={() => applyPreset(key)} style={{
                  padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(26,26,46,0.1)',
                  background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem', fontWeight: 600, color: '#1A1A2E', transition: 'all 0.2s',
                }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Briefing */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#F5A623', display: 'block', marginBottom: 4 }}>
              Briefing (intel for your agent)
            </label>
            <textarea value={briefing} onChange={(e) => setBriefing(e.target.value)} rows={2} style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(26,26,46,0.1)',
              background: 'var(--color-cream)', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              color: '#1A1A2E', resize: 'vertical' as const, outline: 'none', lineHeight: 1.5,
            }} placeholder="Facts your agent knows before negotiating..." />
          </div>

          {/* Strategy */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7B61FF', display: 'block', marginBottom: 4 }}>
              Strategy (how your agent should behave)
            </label>
            <textarea value={strategy} onChange={(e) => setStrategy(e.target.value)} rows={2} style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(26,26,46,0.1)',
              background: 'var(--color-cream)', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              color: '#1A1A2E', resize: 'vertical' as const, outline: 'none', lineHeight: 1.5,
            }} placeholder="How should your agent negotiate?" />
          </div>

          {/* Tools */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#E94560', display: 'block', marginBottom: 6 }}>
              Tools (your agent's moves)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {TOOLS.map(t => {
                const on = enabledTools.has(t.id);
                const c = toolColor(t.id);
                return (
                  <button key={t.id} onClick={() => toggleTool(t.id)} title={t.desc} style={{
                    padding: '5px 12px', borderRadius: 100, border: `1px solid ${on ? c : 'rgba(26,26,46,0.1)'}`,
                    background: on ? c + '10' : 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: on ? c : '#6B7280',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: on ? c : 'rgba(26,26,46,0.15)', transition: 'background 0.2s' }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk + Budget row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', display: 'block', marginBottom: 6 }}>
                Risk: {riskLevel < 0.3 ? 'Cautious' : riskLevel > 0.7 ? 'Creative' : 'Balanced'}
              </label>
              <input type="range" min="0" max="1" step="0.1" value={riskLevel} onChange={(e) => setRiskLevel(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#F5A623' }} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', display: 'block', marginBottom: 6 }}>
                Budget: {modelChoice === 'fast' ? '10 rounds (fast model)' : '6 rounds (smarter model)'}
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['fast', 'balanced'] as const).map(m => (
                  <button key={m} onClick={() => setModelChoice(m)} style={{
                    flex: 1, padding: '6px', borderRadius: 6, border: `1px solid ${modelChoice === m ? '#16C79A' : 'rgba(26,26,46,0.1)'}`,
                    background: modelChoice === m ? '#16C79A10' : 'transparent', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
                    color: modelChoice === m ? '#16C79A' : '#6B7280', transition: 'all 0.2s',
                  }}>{m === 'fast' ? '10 rounds' : '6 rounds'}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Launch */}
          <button onClick={runMatch} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: '#1A1A2E', color: 'white', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
            letterSpacing: '0.04em', transition: 'all 0.25s', minHeight: 48,
          }}>
            Launch Match &rarr;
          </button>

          {showUnlock && !isPaid && (
            <div style={{ marginTop: '1rem' }}>
              <UnlockModal feature="Agent Arena" accentColor="#E94560" />
            </div>
          )}
        </div>
      )}

      {/* ═══ RUNNING + RESULT PHASE ═══ */}
      {(phase === 'running' || phase === 'result') && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 3, padding: '8px 1.5rem' }}>
            {Array.from({ length: maxRounds }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2, transition: 'background 0.3s',
                background: i < currentRound ? '#F5A623' : i === currentRound && phase === 'running' ? '#F5A62360' : 'rgba(26,26,46,0.06)',
              }} />
            ))}
          </div>

          {/* Events transcript */}
          <div ref={eventsRef} style={{
            maxHeight: isMobile ? 300 : 380, overflowY: 'auto', padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
          }}>
            {events.map((e, i) => (
              <div key={i} style={{
                marginBottom: 12, display: 'flex', gap: 10,
                flexDirection: e.role === 'buyer' ? 'row-reverse' : 'row',
                justifyContent: e.role === 'system' ? 'center' : 'flex-start',
              }}>
                {e.role !== 'system' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: e.role === 'buyer' ? '#16C79A' : '#F5A623',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, color: 'white',
                  }}>
                    {e.role === 'buyer' ? 'YOU' : 'SELL'}
                  </div>
                )}
                <div style={{
                  maxWidth: e.role === 'system' ? '100%' : '75%',
                  padding: e.role === 'system' ? '6px 14px' : '10px 14px',
                  borderRadius: 10,
                  background: e.role === 'system' ? 'rgba(26,26,46,0.04)' : e.role === 'buyer' ? 'rgba(22,199,154,0.06)' : 'rgba(245,166,35,0.06)',
                  border: `1px solid ${e.role === 'system' ? 'rgba(26,26,46,0.08)' : e.role === 'buyer' ? 'rgba(22,199,154,0.12)' : 'rgba(245,166,35,0.12)'}`,
                }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#1A1A2E', margin: 0, lineHeight: 1.5 }}>
                    {e.text}
                  </p>
                  {e.toolCall && (
                    <div style={{
                      marginTop: 6, padding: '4px 8px', borderRadius: 4,
                      background: toolColor(e.toolCall.name) + '10',
                      border: `1px solid ${toolColor(e.toolCall.name)}20`,
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: toolColor(e.toolCall.name), fontWeight: 600,
                    }}>
                      {e.toolCall.name}{e.toolCall.args.price ? `: $${e.toolCall.args.price}` : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', fontStyle: 'italic' }}>
                  Agent thinking...
                </span>
              </div>
            )}
          </div>

          {/* Result card */}
          {phase === 'result' && matchResult && seller && (
            <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)' }}>
              <div style={{
                padding: '1.25rem 1.5rem', borderRadius: 12,
                background: matchResult.score > 60 ? 'rgba(22,199,154,0.04)' : matchResult.score > 30 ? 'rgba(245,166,35,0.04)' : 'rgba(233,69,96,0.04)',
                border: `1px solid ${matchResult.score > 60 ? 'rgba(22,199,154,0.15)' : matchResult.score > 30 ? 'rgba(245,166,35,0.15)' : 'rgba(233,69,96,0.15)'}`,
              }}>
                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800,
                    color: matchResult.score > 60 ? '#16C79A' : matchResult.score > 30 ? '#F5A623' : '#E94560',
                    lineHeight: 1,
                  }}>
                    {matchResult.score}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>/ 100</span>
                  {matchResult.finalPrice && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#1A1A2E', marginLeft: 'auto' }}>
                      Deal: <strong>${matchResult.finalPrice}</strong>
                    </span>
                  )}
                </div>

                {/* Hidden seller info reveal */}
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(26,26,46,0.04)', color: '#6B7280' }}>
                    Floor: ${seller.floorPrice}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(26,26,46,0.04)', color: '#6B7280' }}>
                    Desperation: {Math.round(seller.desperation * 100)}%
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: 4, background: 'rgba(26,26,46,0.04)', color: '#6B7280' }}>
                    Condition: {seller.condition.replace('_', ' ')}
                  </span>
                </div>

                {/* Analysis */}
                {matchResult.analysis.map((a, i) => (
                  <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#1A1A2E', margin: '0 0 6px', lineHeight: 1.5, opacity: 0.8 }}>
                    {a}
                  </p>
                ))}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={handleRestart} style={{
                    flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                    background: '#1A1A2E', color: 'white', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    Edit Agent &amp; Retry
                  </button>
                  <button onClick={() => { handleRestart(); runMatch(); }} style={{
                    padding: '10px 16px', borderRadius: 8,
                    border: '1px solid rgba(26,26,46,0.12)', background: 'transparent',
                    color: '#1A1A2E', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    Same Agent, New Seller
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

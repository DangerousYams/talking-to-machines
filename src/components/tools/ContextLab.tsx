import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

/*
 * ContextLab, the standalone Cultivated AI context-window simulator.
 *
 * No real AI calls. A simulated chat fills a scaled-down context window so a
 * workshop room can watch tokens pile up, old messages fall out, and
 * compaction buy the chat a second life. A live cost meter prices every turn
 * against real model rates, because every turn re-sends the whole window.
 *
 * The scripted demo ends with a recall test: the assistant either remembers
 * the price decided early in the chat, or admits it can no longer see it,
 * depending on whether that message survived in the window.
 */

// ---------- Palette ----------
const DEEP = '#1A1A2E';
const CREAM = '#F8F6F3';
const SUBTLE = '#6B7280';
const PURPLE = '#7B61FF';
const AMBER = '#F5A623';
const RED = '#E94560';
const TEAL = '#16C79A';
const NAVY = '#0F3460';
const SKY = '#0EA5E9';
const INK = 'rgba(26,26,46,0.1)';

// ---------- Models (approximate list prices, August 2026) ----------
interface ModelInfo {
  id: string;
  name: string;
  short: string;
  maker: string;
  inPrice: number;   // $ per million input tokens
  outPrice: number;  // $ per million output tokens
  window: number;    // real context window, tokens
  color: string;
}

const MODELS: ModelInfo[] = [
  { id: 'haiku',  name: 'Claude Haiku 4.5', short: 'Haiku',   maker: 'Anthropic', inPrice: 1,  outPrice: 5,  window: 200_000,   color: TEAL },
  { id: 'sonnet', name: 'Claude Sonnet 5',  short: 'Sonnet',  maker: 'Anthropic', inPrice: 3,  outPrice: 15, window: 200_000,   color: PURPLE },
  { id: 'opus',   name: 'Claude Opus 5',    short: 'Opus',    maker: 'Anthropic', inPrice: 5,  outPrice: 25, window: 200_000,   color: RED },
  { id: 'gpt',    name: 'GPT-5.6 Terra',    short: 'GPT-5.6', maker: 'OpenAI',    inPrice: 2,  outPrice: 12, window: 1_000_000, color: NAVY },
  { id: 'gemini', name: 'Gemini 3.1 Pro',   short: 'Gemini',  maker: 'Google',    inPrice: 2,  outPrice: 12, window: 2_000_000, color: SKY },
];

const INR_PER_USD = 88; // approximate

const WINDOW_OPTIONS = [2000, 5000, 10000];

const SYSTEM_PROMPT_DEFAULT =
  'You are a marketing assistant for an artisanal bakery brand sold on quick-commerce apps. Be concrete, use plain language, and keep Indian audiences in mind.';

// ---------- Types ----------
type BlockKind = 'user' | 'assistant' | 'summary';

interface Block {
  id: number;
  kind: BlockKind;
  text: string;
  tokens: number;
  coveredIds?: number[]; // for summaries: ids of the messages folded in
  recall?: 'hit' | 'miss'; // marks the recall-test answer
}

interface LedgerEntry { inTokens: number; outTokens: number; }

// ---------- Token + text helpers ----------
const estimateTokens = (text: string) => Math.max(1, Math.ceil(text.length / 4));

// Deterministic filler so simulated replies land near a target token count.
// The cycle starts at a point derived from the base text, so consecutive
// replies do not all trail off with the same sentences.
const FILLER = [
  'Happy to tweak the tone if this reads too formal for the brand.',
  'I kept the wording tight so it scans on a phone screen.',
  'Tell me which direction feels closest and I will build it out.',
  'I can draft two more variations on request.',
  'This assumes the launch lands inside the festive window.',
  'If the numbers change, send the update and I will rework it.',
  'The flavour names can carry more Diwali warmth if you want.',
  'I checked it against the platform copy limits.',
  'One more pass could make the opening line land harder.',
  'Say the word and I will localise this for Hindi listings.',
];

function padToTokens(base: string, target: number): string {
  let text = base;
  let i = base.length % FILLER.length;
  while (estimateTokens(text) < target) {
    text += ' ' + FILLER[i % FILLER.length];
    i++;
  }
  return text;
}

const GENERIC_REPLIES = [
  'Here is a first pass. The structure leads with the benefit, then the detail.',
  'Good direction. I drafted it in a warm, direct voice, no filler.',
  'Done. I kept the strongest line first and trimmed the rest.',
  'Here you go. I flagged one assumption you may want to confirm.',
  'Drafted. I leaned premium rather than playful, based on the brand so far.',
  'Here is a tighter version, with one bolder alternative at the end.',
];

// ---------- The scripted demo ----------
// Each step: what "you" send, and how the assistant answers.
// The price turn is the recall target; step 15 branches on whether it survived.
interface ScriptStep {
  user: string;
  reply: string;
  replyTokens: number;
  isPriceTurn?: boolean;
  isRecallTest?: boolean;
}

// The big paste is all data, never tone filler, so it reads like a real export
// at any truncation point.
const SALES_DUMP =
  'Pasting last month\'s city-wise sales export. Mumbai: 4,120 units, repeat rate 31%, average order value Rs 612, peak slot 6 to 9 pm. Delhi NCR: 3,660 units, repeat 26%, AOV Rs 588, peak slot 7 to 10 pm. Bengaluru: 3,905 units, repeat 34%, AOV Rs 641, peak slot 5 to 8 pm. Pune: 1,480 units, repeat 29%, AOV Rs 570. Hyderabad: 1,240 units, repeat 27%, AOV Rs 559. Ahmedabad: 980 units, repeat 24%, AOV Rs 542. Chennai: 860 units, repeat 25%, AOV Rs 538. Kolkata: 720 units, repeat 22%, AOV Rs 525. Top SKUs by volume: chocolate chip dozen 28%, almond biscotti 19%, festive assorted 17%, oat jaggery 11%, coconut macaroon 9%, long tail for the rest. Platform split: Blinkit 44% of volume, Zepto 31%, Instamart 25%. Weekend orders spike 2.1x over the weekday baseline. Gift-note attach rate 12% overall, 19% on festive assorted. Coupon DIWA10 drove 8% of October orders. Ratings hold at 4.6 across platforms, delivery complaints under 1%, the one recurring negative is broken cookies in transit, 3% of reviews. Repeat buyers reorder on a 23-day median cycle. Cart abandonment on gift SKUs runs 9% higher than singles, mostly at the delivery-slot screen. Out-of-stock hours cost roughly 6% of potential weekend volume in Mumbai and Bengaluru. New customer share is 38% and holding. Social referral traffic doubled after the October reel series. Packaging feedback: buyers keep the ribbon box, 214 mentions. Competitor watch: two bakery brands launched festive boxes last week at Rs 449 and Rs 549. Supply notes: almond costs up 7% quarter on quarter, cashew stable, butter contracts locked till January. Kitchen capacity: 9,000 boxes a week across both units, expandable to 12,000 with weekend shifts. Delivery packaging cost per order Rs 11. Returns are negligible, under 0.4%. Customer service tickets: 61 last month, half about delivery slots, none about taste. Email list: 18,400 subscribers, 31% open rate. WhatsApp broadcast list: 6,200 opted in. Festive calendar: Dhanteras falls on a Friday this year, and the two weekends before Diwali are the peak gifting days on every platform. Last year the festive assorted box sold out four days early and we lost the final weekend.';

const DEMO_SCRIPT: ScriptStep[] = [
  {
    user: 'I run a bakery brand. Help me plan a Diwali gift box for quick commerce.',
    reply: padToTokens('Great brief. A festive gift box works well on quick commerce because gifting is impulse-friendly. Let us decide contents, name, price, and listing, in that order.', 85),
    replyTokens: 85,
  },
  {
    user: 'Give me five name ideas. Warm, premium, Indian.',
    reply: padToTokens('Five directions: The Festive Dozen. Diya & Dough. The Baker\'s Thali. Golden Hour Box. Shubh Bites.', 70),
    replyTokens: 70,
  },
  {
    user: 'We will go with "The Festive Dozen". Twelve pieces, four flavours.',
    reply: padToTokens('Locked: The Festive Dozen, twelve pieces across four flavours. Three of each keeps the box balanced and the line simple to pack.', 60),
    replyTokens: 60,
  },
  {
    user: 'What should it cost? Cookies cost us Rs 14 a piece, box Rs 38, ribbon Rs 6.',
    reply: padToTokens('Your cost lands near Rs 212 per box. For festive gifting on quick commerce, price at Rs 499. It clears platform commission with healthy margin and sits under the Rs 500 gifting threshold shoppers filter by.', 110),
    replyTokens: 110,
    isPriceTurn: true,
  },
  {
    user: 'Write the packaging copy. Two lines, nothing cliched.',
    reply: padToTokens('Line one: Twelve small reasons the house smells like Diwali. Line two: Baked this week, shared this evening.', 65),
    replyTokens: 65,
  },
  {
    user: SALES_DUMP,
    reply: padToTokens('Read it. Three signals stand out: Bengaluru repeats best at 34%, weekends spike 2.1x so launch on a Friday, and the 12% gift-note attach rate says gifting demand already exists in your data.', 220),
    replyTokens: 220,
  },
  {
    user: 'Which three cities should get launch stock first?',
    reply: padToTokens('Mumbai for volume, Bengaluru for repeat rate, Delhi NCR for reach. Pune becomes the fast-follow once the first weekend sells through.', 120),
    replyTokens: 120,
  },
  {
    user: 'Draft the Blinkit listing: title, a 40-word description, five bullets.',
    reply: padToTokens('Title: The Festive Dozen · 12 Artisanal Cookies Gift Box. Description: Twelve small-batch cookies in four flavours, packed in a festive keepsake box. Baked this week. Bullets: four flavours, three each. Keepsake box with ribbon. No preservatives. Gift note included. Delivered in minutes.', 260),
    replyTokens: 260,
  },
  {
    user: 'Now a WhatsApp message for our retail partners.',
    reply: padToTokens('Namaste! This Diwali we are launching The Festive Dozen, a twelve-cookie gift box. Early stock is limited. Reply BOX and we will reserve your first case with a launch margin.', 160),
    replyTokens: 160,
  },
  {
    user: 'Make the listing description punchier.',
    reply: padToTokens('Punchier: Twelve small-batch cookies. Four flavours. One festive box that does the gifting for you. Baked this week, at your door in minutes.', 150),
    replyTokens: 150,
  },
  {
    user: 'Give me three Instagram captions for launch day.',
    reply: padToTokens('One: The box the family fights over, politely. Two: Twelve cookies. Zero leftovers. Happy Diwali. Three: We baked. You gift. Everyone wins.', 180),
    replyTokens: 180,
  },
  {
    user: 'Shorter. One line each.',
    reply: padToTokens('One: Politely fought over. Two: Twelve in, none left. Three: We baked, you gift.', 70),
    replyTokens: 70,
  },
  {
    user: 'Do we need allergen labels for the almond and cashew flavours?',
    reply: padToTokens('Yes. FSSAI labelling requires tree nuts to be declared. Add a contains line on the back panel and mirror it in the listing bullets so platform compliance passes first time.', 130),
    replyTokens: 130,
  },
  {
    user: 'Write the allergen line for the box.',
    reply: padToTokens('Contains tree nuts (almond, cashew), wheat, milk, and egg. Made in a facility that handles peanuts.', 60),
    replyTokens: 60,
  },
  {
    user: 'Quick check: what price did we settle on for the gift box?',
    reply: '', // branches at runtime
    replyTokens: 0,
    isRecallTest: true,
  },
];

const RECALL_HIT =
  'Rs 499 for the twelve-piece box. It clears your Rs 212 cost with comfortable room for platform commission, and it stays under the Rs 500 gifting filter shoppers use on quick commerce. If you ever want a premium tier, a Rs 749 double-decker box is the natural next step.';
const RECALL_MISS =
  'I do not actually see a final price in the part of our conversation I can still read. The early messages, where we discussed costs and pricing, have fallen out of my window, so answering from what remains would be a guess. Could you remind me what we decided, and I will carry it forward from here?';

// ---------- Money formatting ----------
function fmtUsd(v: number): string {
  if (v === 0) return '$0.00';
  if (v < 0.01) return '$' + v.toFixed(4);
  return '$' + v.toFixed(2);
}
function fmtInr(v: number): string {
  const r = v * INR_PER_USD;
  if (r === 0) return 'Rs 0.00';
  if (r < 0.1) return 'Rs ' + r.toFixed(3);
  return 'Rs ' + r.toFixed(2);
}
function fmtTok(n: number): string {
  return n.toLocaleString('en-IN');
}
function fmtWindow(n: number): string {
  return n >= 1_000_000 ? `${n / 1_000_000}M` : `${Math.round(n / 1000)}k`;
}

// ---------- Component ----------
export default function ContextLab() {
  const isMobile = useIsMobile();

  const [modelId, setModelId] = useState('sonnet');
  const [demoWindow, setDemoWindow] = useState(2000);
  const [currency, setCurrency] = useState<'usd' | 'inr'>('inr');
  const [sysPrompt, setSysPrompt] = useState(SYSTEM_PROMPT_DEFAULT);
  const [sysOpen, setSysOpen] = useState(false);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const [autoCompact, setAutoCompact] = useState(false);
  const [lastEvent, setLastEvent] = useState<'none' | 'dropped' | 'compacted' | 'recall-hit' | 'recall-miss'>('none');

  const [playing, setPlaying] = useState(false);
  const scriptIdx = useRef(0);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);
  const genericIdx = useRef(0);

  // Synchronous mirror of `blocks` so timer callbacks and the skip loop never
  // act on a stale snapshot, and state updaters stay pure.
  const blocksRef = useRef<Block[]>([]);
  const commitBlocks = (next: Block[]) => {
    blocksRef.current = next;
    setBlocks(next);
  };

  const transcriptRef = useRef<HTMLDivElement>(null);

  const model = MODELS.find((m) => m.id === modelId)!;
  const sysTokens = estimateTokens(sysPrompt);

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById('ctx-lab-styles')) return;
    const el = document.createElement('style');
    el.id = 'ctx-lab-styles';
    el.textContent = `
      @keyframes ctx-block-in { from { opacity: 0; transform: translateY(8px) scaleY(0.7); } to { opacity: 1; transform: translateY(0) scaleY(1); } }
      @keyframes ctx-summary-pop { 0% { opacity: 0; transform: scale(0.92); } 60% { transform: scale(1.03); } 100% { opacity: 1; transform: scale(1); } }
      @keyframes ctx-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes ctx-blink { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.1; } }
      .ctx-quiet:hover:not(:disabled) { color: #1A1A2E; }
      @media (prefers-reduced-motion: reduce) {
        .ctx-anim { animation: none !important; }
      }
    `;
    document.head.appendChild(el);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks, typing]);

  useEffect(() => () => { if (playTimer.current) clearTimeout(playTimer.current); }, []);

  // ---------- Window math ----------
  // Walk from the newest block back, filling the window after the pinned
  // system prompt. Everything that does not fit has fallen out.
  const { liveIds, liveTokens, droppedCount } = useMemo(() => {
    const live = new Set<number>();
    let acc = sysTokens;
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      if (acc + b.tokens <= demoWindow) {
        acc += b.tokens;
        live.add(b.id);
      } else {
        break; // once one fails to fit, everything older is out too
      }
    }
    return {
      liveIds: live,
      liveTokens: acc,
      droppedCount: blocks.filter((b) => !live.has(b.id)).length,
    };
  }, [blocks, sysTokens, demoWindow]);

  const fillPct = Math.min(100, Math.round((liveTokens / demoWindow) * 100));
  const meterColor = fillPct >= 92 ? RED : fillPct >= 65 ? AMBER : TEAL;

  const liveBlocks = blocks.filter((b) => liveIds.has(b.id));

  // ---------- Cost math ----------
  const sessionCost = useCallback((m: ModelInfo) =>
    ledger.reduce((s, e) => s + (e.inTokens * m.inPrice + e.outTokens * m.outPrice) / 1_000_000, 0),
  [ledger]);

  const lastTurn = ledger[ledger.length - 1] ?? null;
  const lastTurnCost = lastTurn
    ? (lastTurn.inTokens * model.inPrice + lastTurn.outTokens * model.outPrice) / 1_000_000
    : 0;

  const money = currency === 'usd' ? fmtUsd : fmtInr;

  // ---------- Recall check ----------
  const priceSurvives = useCallback((current: Block[], live: Set<number>): boolean => {
    for (const b of current) {
      if (b.kind === 'assistant' && b.text.includes('Rs 499') && b.recall === undefined) {
        if (live.has(b.id)) return true;
      }
      if (b.kind === 'summary' && live.has(b.id) && b.text.includes('Rs 499')) return true;
    }
    return false;
  }, []);

  // ---------- Compaction ----------
  const compact = useCallback((current: Block[]): Block[] => {
    // Fold everything still in the window except the last four blocks into
    // one summary. Messages already fallen out cannot be recovered.
    const live = new Set<number>();
    let acc = sysTokens;
    for (let i = current.length - 1; i >= 0; i--) {
      if (acc + current[i].tokens <= demoWindow) { acc += current[i].tokens; live.add(current[i].id); }
      else break;
    }
    const liveArr = current.filter((b) => live.has(b.id));
    if (liveArr.length <= 6) return current;
    const keep = new Set(liveArr.slice(-4).map((b) => b.id));
    const folded = liveArr.filter((b) => !keep.has(b.id));
    const foldedTokens = folded.reduce((s, b) => s + b.tokens, 0);
    const coveredIds = folded.flatMap((b) => (b.kind === 'summary' ? b.coveredIds ?? [] : [b.id]));
    const hasPrice = folded.some((b) => b.text.includes('Rs 499'));
    const summaryText =
      `Summary of ${coveredIds.length} earlier messages: planning a Diwali gift box, The Festive Dozen, twelve cookies in four flavours` +
      (hasPrice ? ', priced at Rs 499' : '') +
      '. Launch cities picked, Blinkit listing and partner messages drafted, allergen labelling settled. Exact wording of those messages dropped.';
    const summaryTokens = Math.max(40, Math.min(160, Math.round(foldedTokens * 0.12)));
    const summary: Block = {
      id: nextId.current++,
      kind: 'summary',
      text: summaryText,
      tokens: summaryTokens,
      coveredIds,
    };
    const firstFoldedIdx = current.findIndex((b) => b.id === folded[0].id);
    const out = current.filter((b) => !folded.some((f) => f.id === b.id));
    out.splice(firstFoldedIdx, 0, summary);
    return out;
  }, [sysTokens, demoWindow]);

  const handleCompact = () => {
    const next = compact(blocksRef.current);
    if (next !== blocksRef.current) {
      setLastEvent('compacted');
      commitBlocks(next);
    }
  };

  // ---------- Sending ----------
  // Computes the whole turn synchronously from blocksRef, so autoplay timers
  // and the skip loop always build on the latest state.
  const appendTurn = useCallback((userText: string, replyText: string, replyTokens: number, recall?: 'hit' | 'miss') => {
    const userBlock: Block = { id: nextId.current++, kind: 'user', text: userText, tokens: estimateTokens(userText) };
    let next = [...blocksRef.current, userBlock];

    // Input cost: everything currently in the window, including the new message
    let acc = sysTokens;
    for (let i = next.length - 1; i >= 0; i--) {
      if (acc + next[i].tokens <= demoWindow) acc += next[i].tokens;
      else break;
    }
    setLedger((l) => [...l, { inTokens: acc, outTokens: replyTokens }]);

    const assistantBlock: Block = {
      id: nextId.current++,
      kind: 'assistant',
      text: replyText,
      tokens: replyTokens,
      recall,
    };
    next = [...next, assistantBlock];

    // Auto-compact after the turn if the window is nearly full
    if (autoCompact) {
      let accNow = sysTokens;
      for (let i = next.length - 1; i >= 0; i--) {
        if (accNow + next[i].tokens <= demoWindow) accNow += next[i].tokens;
        else break;
      }
      if (accNow / demoWindow > 0.85) {
        const compacted = compact(next);
        if (compacted !== next) {
          setLastEvent('compacted');
          commitBlocks(compacted);
          return;
        }
      }
    }
    commitBlocks(next);
  }, [sysTokens, demoWindow, autoCompact, compact]);

  const runStep = useCallback((step: ScriptStep) => {
    if (step.isRecallTest) {
      // Decide the answer from what the model can still see, with the new
      // user message already occupying part of the window.
      const userBlock: Block = { id: nextId.current++, kind: 'user', text: step.user, tokens: estimateTokens(step.user) };
      const withUser = [...blocksRef.current, userBlock];
      const live = new Set<number>();
      let acc = sysTokens;
      for (let i = withUser.length - 1; i >= 0; i--) {
        if (acc + withUser[i].tokens <= demoWindow) { acc += withUser[i].tokens; live.add(withUser[i].id); }
        else break;
      }
      const hit = priceSurvives(withUser, live);
      const replyText = hit ? RECALL_HIT : RECALL_MISS;
      const replyTokens = estimateTokens(replyText);
      setLedger((l) => [...l, { inTokens: acc, outTokens: replyTokens }]);
      setLastEvent(hit ? 'recall-hit' : 'recall-miss');
      const assistantBlock: Block = {
        id: nextId.current++, kind: 'assistant', text: replyText, tokens: replyTokens,
        recall: hit ? 'hit' : 'miss',
      };
      commitBlocks([...withUser, assistantBlock]);
    } else {
      appendTurn(step.user, step.reply, step.replyTokens);
    }
  }, [appendTurn, priceSurvives, sysTokens, demoWindow]);

  const playingRef = useRef(false);

  const playNext = useCallback(() => {
    if (scriptIdx.current >= DEMO_SCRIPT.length) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    const step = DEMO_SCRIPT[scriptIdx.current];
    scriptIdx.current += 1;
    setTyping(true);
    playTimer.current = setTimeout(() => {
      setTyping(false);
      runStep(step);
      playTimer.current = setTimeout(() => {
        if (playingRef.current) playNext();
      }, 650);
    }, 500);
  }, [runStep]);

  const handlePlay = () => {
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      if (playTimer.current) clearTimeout(playTimer.current);
      setTyping(false);
      return;
    }
    playingRef.current = true;
    setPlaying(true);
    playNext();
  };

  const handleSkip = () => {
    playingRef.current = false;
    setPlaying(false);
    if (playTimer.current) clearTimeout(playTimer.current);
    setTyping(false);
    while (scriptIdx.current < DEMO_SCRIPT.length) {
      const step = DEMO_SCRIPT[scriptIdx.current];
      scriptIdx.current += 1;
      runStep(step);
    }
  };

  const handleReset = () => {
    playingRef.current = false;
    setPlaying(false);
    if (playTimer.current) clearTimeout(playTimer.current);
    setTyping(false);
    scriptIdx.current = 0;
    genericIdx.current = 0;
    commitBlocks([]);
    setLedger([]);
    setLastEvent('none');
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    const base = GENERIC_REPLIES[genericIdx.current % GENERIC_REPLIES.length];
    genericIdx.current += 1;
    const target = Math.min(220, Math.max(30, Math.round(estimateTokens(trimmed) * 1.8)));
    const reply = padToTokens(base, target);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      appendTurn(trimmed, reply, estimateTokens(reply));
    }, 450);
  };

  // Track drops for the insight bar
  const prevDropped = useRef(0);
  useEffect(() => {
    if (droppedCount > prevDropped.current && lastEvent !== 'recall-hit' && lastEvent !== 'recall-miss') {
      setLastEvent('dropped');
    }
    prevDropped.current = droppedCount;
  }, [droppedCount, lastEvent]);

  // ---------- Insight copy ----------
  const insight = (() => {
    if (lastEvent === 'recall-miss')
      return { color: RED, label: 'The forgetting, live', text: 'You asked about the price. That message fell out of the window, so the model honestly cannot see it. Reset, switch on auto-compact, and play again: the summary carries the price through.' };
    if (lastEvent === 'recall-hit')
      return { color: TEAL, label: 'It remembered', text: 'The price survived, either the message is still in the window or a summary carried it. This is why compacting early beats compacting late.' };
    if (lastEvent === 'compacted')
      return { color: AMBER, label: 'Compaction', text: 'Older messages became one short summary. The window has room again, but only what the summary mentions survives. Claude and ChatGPT do this quietly in long chats.' };
    if (lastEvent === 'dropped')
      return { color: RED, label: 'Messages falling out', text: `The oldest ${droppedCount} message${droppedCount === 1 ? '' : 's'} no longer fit. The model is not being forgetful; they are simply not in the window it reads.` };
    if (fillPct > 60)
      return { color: AMBER, label: 'Filling up', text: 'Every new message re-sends everything in the window. Watch the cost per turn climb as the chat grows.' };
    return { color: PURPLE, label: 'Tokens pile up', text: 'Every message joins the window, and the whole window is re-sent with every turn. The bill panel prices that at real rates.' };
  })();

  // ---------- Render pieces ----------
  const blockColor = (b: Block) =>
    b.kind === 'user' ? NAVY : b.kind === 'summary' ? AMBER : PURPLE;

  const renderGlass = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PURPLE }}>
          The window
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: SUBTLE }}>
          {fmtTok(liveTokens)} / {fmtTok(demoWindow)} tok
        </span>
      </div>

      {/* Glass container */}
      <div style={{
        flex: 1, minHeight: isMobile ? 240 : 0, display: 'flex', flexDirection: 'column',
        border: `2px solid ${INK}`, borderRadius: 14, overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(123,97,255,0.03), rgba(26,26,46,0.02))',
      }}>
        {/* System prompt, pinned */}
        <button
          onClick={() => setSysOpen((o) => !o)}
          style={{
            display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
            padding: '8px 12px', background: 'rgba(123,97,255,0.12)',
            borderBottom: '1px solid rgba(123,97,255,0.2)', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            flexShrink: 0,
          }}
          aria-expanded={sysOpen}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', fontWeight: 700, color: PURPLE, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              System · pinned {sysOpen ? '▾' : '▸'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: PURPLE, opacity: 0.7 }}>{sysTokens} tok</span>
          </div>
          {!sysOpen && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: PURPLE, margin: '2px 0 0', opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sysPrompt}
            </p>
          )}
        </button>
        {sysOpen && (
          <textarea
            value={sysPrompt}
            onChange={(e) => setSysPrompt(e.target.value)}
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: 'none',
              borderBottom: '1px solid rgba(123,97,255,0.2)', outline: 'none', resize: 'none',
              background: 'rgba(123,97,255,0.06)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
              lineHeight: 1.5, color: DEEP, flexShrink: 0,
            }}
            aria-label="System prompt"
          />
        )}

        {/* Dropped chip */}
        {droppedCount > 0 && (
          <div style={{ padding: '4px 12px', background: 'rgba(233,69,96,0.06)', borderBottom: '1px dashed rgba(233,69,96,0.25)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: RED, fontWeight: 600 }}>
              ↑ {droppedCount} message{droppedCount === 1 ? '' : 's'} fell out
            </span>
          </div>
        )}

        {/* Live blocks, proportional heights */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 6, gap: 3, overflow: 'hidden' }}>
          {liveBlocks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', opacity: 0.35 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: SUBTLE, margin: 0 }}>
                Empty. Send something, or press Play.
              </p>
            </div>
          )}
          {liveBlocks.map((b) => {
            const c = blockColor(b);
            return (
              <div
                key={b.id}
                className="ctx-anim"
                title={`${b.tokens} tokens`}
                style={{
                  flexGrow: b.tokens, flexBasis: 0, minHeight: 15, overflow: 'hidden',
                  borderRadius: 6, padding: '2px 8px',
                  background: `${c}${b.kind === 'summary' ? '2A' : '14'}`,
                  borderLeft: `3px solid ${c}`,
                  animation: b.kind === 'summary' ? 'ctx-summary-pop 0.45s ease-out' : 'ctx-block-in 0.35s ease-out',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: DEEP, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.kind === 'summary' ? '⧉ ' : ''}{b.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fill meter */}
      <div style={{ marginTop: 10 }}>
        <div style={{ height: 8, borderRadius: 100, background: 'rgba(26,26,46,0.07)', overflow: 'hidden' }}>
          <div style={{ width: `${fillPct}%`, height: '100%', borderRadius: 100, background: meterColor, transition: 'width 0.4s ease, background 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: meterColor, fontWeight: 700 }}>{fillPct}% full</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: SUBTLE }}>
            real {model.short}: {fmtWindow(model.window)} tok · {Math.round(model.window / demoWindow)}× this demo
          </span>
        </div>
      </div>
    </div>
  );

  const renderCostPanel = () => (
    <div style={{
      marginTop: 14, padding: '12px 14px', borderRadius: 12,
      background: 'white', border: `1.5px solid ${INK}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: SUBTLE }}>
          The bill
        </span>
        <button
          onClick={() => setCurrency((c) => (c === 'usd' ? 'inr' : 'usd'))}
          style={{
            padding: '3px 10px', borderRadius: 100, border: `1px solid ${INK}`, background: CREAM,
            fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: DEEP, cursor: 'pointer',
          }}
        >
          {currency === 'usd' ? '$ → Rs' : 'Rs → $'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 800, color: model.color, lineHeight: 1 }}>
          {money(sessionCost(model))}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: SUBTLE }}>
          whole chat · {ledger.length} turn{ledger.length === 1 ? '' : 's'} · {model.name}
        </span>
      </div>
      {lastTurn && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: SUBTLE, marginTop: 5 }}>
          last turn {money(lastTurnCost)} · {fmtTok(lastTurn.inTokens)} in / {fmtTok(lastTurn.outTokens)} out
        </div>
      )}

      {/* Same chat, five bills */}
      {ledger.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${INK}` }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: SUBTLE, marginBottom: 6 }}>same chat on every model</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MODELS.map((m) => {
              const cost = sessionCost(m);
              const max = Math.max(...MODELS.map((x) => sessionCost(x)), 0.000001);
              const isSel = m.id === modelId;
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: isSel ? DEEP : SUBTLE, fontWeight: isSel ? 700 : 400, width: 62, flexShrink: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {m.short}
                  </span>
                  <div style={{ flex: 1, height: 5, borderRadius: 100, background: 'rgba(26,26,46,0.05)', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(3, (cost / max) * 100)}%`, height: '100%', borderRadius: 100, background: m.color, opacity: isSel ? 1 : 0.45, transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: isSel ? DEEP : SUBTLE, fontWeight: isSel ? 700 : 400, width: 72, textAlign: 'right', flexShrink: 0 }}>
                    {money(cost)}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontStyle: 'italic', color: SUBTLE, marginTop: 8 }}>
            Every turn re-sends the whole window. Long chats get pricier per message.
          </div>
        </div>
      )}
    </div>
  );

  const renderTranscript = () => (
    <div ref={transcriptRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 2px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {blocks.length === 0 && (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: SUBTLE, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
            Press <strong style={{ fontStyle: 'normal' }}>Play the demo</strong> to watch a bakery brand plan a Diwali launch, or type anything below.<br />
            No real AI, only real math.
          </p>
        </div>
      )}
      {blocks.map((b) => {
        const dropped = !liveIds.has(b.id);
        const c = blockColor(b);
        const isRecall = b.recall !== undefined;
        return (
          <div
            key={b.id}
            className="ctx-anim"
            style={{
              alignSelf: b.kind === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              padding: '8px 12px', borderRadius: 12,
              borderBottomRightRadius: b.kind === 'user' ? 4 : 12,
              borderBottomLeftRadius: b.kind === 'user' ? 12 : 4,
              background: dropped ? 'rgba(26,26,46,0.035)' : `${c}${b.kind === 'summary' ? '1E' : '0E'}`,
              border: isRecall
                ? `1.5px solid ${b.recall === 'hit' ? TEAL : RED}`
                : b.kind === 'summary'
                  ? `1px dashed ${AMBER}66`
                  : 'none',
              opacity: dropped ? 0.45 : 1,
              animation: 'ctx-fade-in 0.3s ease-out',
              transition: 'opacity 0.4s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: dropped ? SUBTLE : c }}>
                {b.kind === 'user' ? 'you' : b.kind === 'summary' ? '⧉ summary' : 'assistant'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: SUBTLE }}>{b.tokens} tok</span>
              {dropped && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, color: RED }}>OUT OF WINDOW</span>
              )}
              {isRecall && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, color: b.recall === 'hit' ? TEAL : RED }}>
                  {b.recall === 'hit' ? 'REMEMBERED' : 'FORGOT'}
                </span>
              )}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.55,
              color: dropped ? SUBTLE : DEEP, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {b.text}
            </p>
          </div>
        );
      })}
      {typing && (
        <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, background: `${PURPLE}0E`, display: 'flex', gap: 5 }}>
          {[0, 0.15, 0.3].map((d) => (
            <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: PURPLE, animation: `ctx-blink 1s ease-in-out ${d}s infinite` }} />
          ))}
        </div>
      )}
    </div>
  );

  const canCompact = liveBlocks.length > 6;

  const quietBtn = (label: string, onClick: () => void, disabled?: boolean) => (
    <button
      className="ctx-quiet"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 2px', border: 'none', background: 'none',
        fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 600,
        color: SUBTLE, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'color 0.15s',
      }}
    >
      {label}
    </button>
  );

  const controlBtn = (label: string, onClick: () => void, opts?: { primary?: boolean; disabled?: boolean; color?: string }) => (
    <button
      onClick={onClick}
      disabled={opts?.disabled}
      style={{
        padding: '8px 14px', borderRadius: 100,
        border: opts?.primary ? 'none' : `1.5px solid ${INK}`,
        background: opts?.primary ? (opts.color ?? PURPLE) : 'white',
        color: opts?.primary ? 'white' : opts?.disabled ? SUBTLE : DEEP,
        fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700,
        cursor: opts?.disabled ? 'not-allowed' : 'pointer',
        opacity: opts?.disabled ? 0.45 : 1,
        boxShadow: opts?.primary ? `0 6px 16px ${(opts.color ?? PURPLE)}35` : 'none',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );

  // ---------- Layout ----------
  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: isMobile ? '0 1.1rem' : '0 2rem', width: '100%', boxSizing: 'border-box' }}>

      {/* Top bar: models + window size, two segmented controls */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div style={{
          display: 'inline-flex', maxWidth: '100%', overflowX: 'auto',
          border: `1.5px solid ${INK}`, borderRadius: 100, background: 'white',
        }}>
          {MODELS.map((m, i) => {
            const sel = m.id === modelId;
            return (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                title={`${m.name} · $${m.inPrice} in / $${m.outPrice} out per million tokens`}
                style={{
                  padding: '7px 13px', border: 'none',
                  borderLeft: i === 0 ? 'none' : `1px solid ${INK}`,
                  borderRadius: i === 0 ? '100px 0 0 100px' : i === MODELS.length - 1 ? '0 100px 100px 0' : 0,
                  background: sel ? `${m.color}14` : 'transparent',
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: sel ? 700 : 600,
                  color: sel ? m.color : SUBTLE, cursor: 'pointer', transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                aria-pressed={sel}
              >
                {m.name.replace('Claude ', '')}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: SUBTLE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>demo window</span>
          <div style={{ display: 'inline-flex', border: `1.5px solid ${INK}`, borderRadius: 100, background: 'white' }}>
            {WINDOW_OPTIONS.map((w, i) => (
              <button
                key={w}
                onClick={() => setDemoWindow(w)}
                style={{
                  padding: '6px 11px', border: 'none',
                  borderLeft: i === 0 ? 'none' : `1px solid ${INK}`,
                  borderRadius: i === 0 ? '100px 0 0 100px' : i === WINDOW_OPTIONS.length - 1 ? '0 100px 100px 0' : 0,
                  background: demoWindow === w ? `${PURPLE}14` : 'transparent',
                  fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700,
                  color: demoWindow === w ? PURPLE : SUBTLE, cursor: 'pointer',
                }}
                aria-pressed={demoWindow === w}
              >
                {fmtTok(w)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div style={{
        background: 'white', border: '1px solid rgba(26,26,46,0.08)', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(26,26,46,0.06)', overflow: 'hidden',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px',
      }}>
        {/* Left: chat */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          height: isMobile ? 420 : 560,
          padding: isMobile ? '1rem' : '1.25rem 1.5rem',
          borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)',
          borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none',
          minWidth: 0,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            {controlBtn(playing ? 'Pause' : blocks.length === 0 ? '▶ Play the demo' : '▶ Continue demo', handlePlay, { primary: true, disabled: scriptIdx.current >= DEMO_SCRIPT.length && !playing })}
            <button
              onClick={() => setAutoCompact((a) => !a)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 2px',
                border: 'none', background: 'none', cursor: 'pointer',
              }}
              aria-pressed={autoCompact}
            >
              <span style={{
                width: 30, height: 18, borderRadius: 100, flexShrink: 0,
                background: autoCompact ? AMBER : 'rgba(26,26,46,0.18)',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <span style={{
                  position: 'absolute', top: 2, left: autoCompact ? 14 : 2,
                  width: 14, height: 14, borderRadius: '50%', background: 'white',
                  boxShadow: '0 1px 3px rgba(26,26,46,0.3)', transition: 'left 0.2s',
                }} />
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 600, color: autoCompact ? '#B47708' : SUBTLE }}>
                auto-compact
              </span>
            </button>
            <span style={{ flex: 1 }} />
            {scriptIdx.current > 0 && scriptIdx.current < DEMO_SCRIPT.length && quietBtn('Skip to end', handleSkip)}
            {quietBtn('Compact now', handleCompact, !canCompact)}
            {blocks.length > 0 && quietBtn('Reset', handleReset)}
          </div>

          {renderTranscript()}

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type anything, the reply is simulated..."
              style={{
                flex: 1, minWidth: 0, padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${INK}`, background: CREAM,
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: DEEP, outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                padding: '11px 18px', borderRadius: 10, border: 'none',
                background: input.trim() ? PURPLE : 'rgba(26,26,46,0.08)',
                color: input.trim() ? 'white' : SUBTLE,
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
                cursor: input.trim() ? 'pointer' : 'default', letterSpacing: '0.03em',
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Right: window + bill */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: isMobile ? '1rem' : '1.25rem 1.5rem', height: isMobile ? 'auto' : 560, boxSizing: 'border-box', minWidth: 0, background: 'rgba(248,246,243,0.5)' }}>
          {renderGlass()}
          {renderCostPanel()}
        </div>
      </div>

      {/* Insight bar, the narrator; silent until there is something to narrate */}
      {blocks.length > 0 && (
        <div style={{
          marginTop: 14, padding: '12px 16px', borderRadius: 12,
          background: `${insight.color}0C`, border: `1px solid ${insight.color}30`,
          animation: 'ctx-fade-in 0.3s ease-out',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: DEEP, margin: 0, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: insight.color }}>{insight.label}: </span>
            {insight.text}
          </p>
        </div>
      )}

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: SUBTLE, textAlign: 'center', marginTop: 14, letterSpacing: '0.03em' }}>
        prices are approximate list rates, August 2026 · Rs at {INR_PER_USD}/$ · token counts estimated
      </p>
    </div>
  );
}

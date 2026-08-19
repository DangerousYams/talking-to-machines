import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { streamChat } from '../../lib/claude';
import { getToolClientId } from '../../lib/tool-client';

/*
 * DeslopLab, the standalone Cultivated AI de-slop workshop tool.
 *
 * Three beats, ten minutes in a room:
 *   01 Spot : click the AI tells hiding in a slop sample
 *   02 Ban  : the tells you found become rules; paste your own voice
 *   03 Test : run the slop through your prompt, before / after, live
 *
 * The rewrite reuses the open prompt-builder route (source: 'builder'),
 * so it draws on the same free per-device daily allowance and needs no
 * server changes. The finished prompt persists in localStorage.
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
const INK = 'rgba(26,26,46,0.1)';

const STORAGE_KEY = 'cai-deslop-v1';

// ---------- Rules ----------
interface Rule {
  id: string;
  label: string;
  line: string; // the sentence that goes into the system prompt
}

const RULES: Rule[] = [
  { id: 'emdash', label: 'No em-dashes', line: 'Never use an em-dash. Use a comma, a colon, or two sentences.' },
  { id: 'tricolon', label: 'No three-item rhythm', line: 'Do not decorate with lists of three ("X, Y, and Z" for rhythm).' },
  { id: 'notjust', label: 'No "not just X, it\'s Y"', line: 'Never write "it\'s not just X, it\'s Y" or any not-only-but-also pattern.' },
  { id: 'hype', label: 'No hype words', line: 'Banned words: elevate, unveil, thrilled, delight, crafted, seamless, vibrant, indulge.' },
  { id: 'emoji', label: 'No emoji confetti', line: 'No emoji, unless my own writing samples use them.' },
  { id: 'closer', label: 'No sales closer', line: 'No "Don\'t miss out", no summary closers, no call-to-action line unless I ask for one.' },
  { id: 'corporate', label: 'No corporate padding', line: 'No "Dear Valued Customer", "rest assured", "top priority", "we strive". Write like one person talking to another.' },
  { id: 'short', label: 'Short sentences', line: 'Short sentences. Plain words. One idea per sentence.' },
];

// ---------- Slop samples ----------
interface Segment {
  text: string;
  tell?: { name: string; rule: string; why: string };
}

interface Sample {
  id: string;
  label: string;
  segments: Segment[];
}

const SAMPLES: Sample[] = [
  {
    id: 'caption',
    label: 'Instagram caption',
    segments: [
      { text: '✨ Diwali just got sweeter! ', tell: { name: 'Emoji confetti', rule: 'emoji', why: 'Sprinkled emoji and an exclamation before anything is said.' } },
      { text: 'We’re absolutely thrilled to unveil ', tell: { name: 'Breathless hype', rule: 'hype', why: '"Thrilled to unveil" is machine enthusiasm. Nobody talks like this at the counter.' } },
      { text: 'our Festive Dozen' },
      { text: ' — ', tell: { name: 'The em-dash', rule: 'emdash', why: 'The single most reliable AI tell. One dash is a suspect; three is a confession.' } },
      { text: 'twelve cookies crafted with love, passion, and the finest ingredients. ', tell: { name: 'Three-item rhythm', rule: 'tricolon', why: 'The tidy "X, Y, and Z" cadence. AI reaches for three every time.' } },
      { text: 'It’s not just a gift box, it’s an experience. ', tell: { name: '"Not just X, it’s Y"', rule: 'notjust', why: 'The most famous AI sentence shape of all.' } },
      { text: 'Whether you’re celebrating with family, sharing with friends, or treating yourself, we’ve got you covered. ', tell: { name: 'Stock filler', rule: 'corporate', why: 'The "whether A, B, or C" sweep plus "we’ve got you covered". Pure padding.' } },
      { text: 'Don’t miss out — order now and elevate your festivities! 🪔', tell: { name: 'The sales closer', rule: 'closer', why: '"Don’t miss out", another em-dash, and "elevate". Three tells in one line.' } },
    ],
  },
  {
    id: 'email',
    label: 'Customer email',
    segments: [
      { text: 'Dear Valued Customer, ', tell: { name: 'Corporate opener', rule: 'corporate', why: 'No human being calls another human being a Valued Customer.' } },
      { text: 'we sincerely apologize for the inconvenience caused. ', tell: { name: 'Apology boilerplate', rule: 'corporate', why: 'An apology template, not an apology.' } },
      { text: 'Customer satisfaction is our top priority, ', tell: { name: 'Priority boilerplate', rule: 'corporate', why: 'Every company that says this is reading from the same card.' } },
      { text: 'and we strive to deliver excellence in every box. ', tell: { name: 'Strive & excellence', rule: 'hype', why: '"Strive" and "excellence" carry no information at all.' } },
      { text: 'Rest assured, our dedicated team is working tirelessly to resolve it. ', tell: { name: 'Working tirelessly', rule: 'hype', why: '"Rest assured" plus a tireless dedicated team. Nobody believes either.' } },
      { text: 'We truly appreciate your patience, understanding, and continued support. ', tell: { name: 'Three-item rhythm', rule: 'tricolon', why: 'The "X, Y, and Z" cadence again, this time in a suit.' } },
      { text: 'Thank you for choosing us', tell: { name: 'The grand closer', rule: 'closer', why: 'The wrap-up nobody asked for.' } },
      { text: ' — ', tell: { name: 'The em-dash', rule: 'emdash', why: 'There it is again.' } },
      { text: 'we look forward to serving you better!', tell: { name: 'Serving you better', rule: 'corporate', why: 'A promise so generic it promises nothing.' } },
    ],
  },
];

const sampleText = (s: Sample) => s.segments.map((seg) => seg.text).join('');

// ---------- Prompt composition ----------
function composePrompt(ruleIds: Set<string>, voice: string): string {
  const lines = RULES.filter((r) => ruleIds.has(r.id)).map((r) => `- ${r.line}`);
  let out = 'You are my writing filter. Everything you write must sound like me, not like AI.\n\nRules:\n' + lines.join('\n');
  const v = voice.trim();
  if (v) {
    out += '\n\nHow I actually write. Match this voice:\n"""\n' + v + '\n"""';
  }
  out += '\n\nWhen I give you a draft, rewrite it in my voice. Keep every fact. Cut everything that smells like a machine.';
  return out;
}

// ---------- Component ----------
type Step = 0 | 1 | 2;
const STEP_META = [
  { n: '01', title: 'Spot the tells' },
  { n: '02', title: 'Ban them' },
  { n: '03', title: 'Test it' },
];

export default function DeslopLab() {
  const isMobile = useIsMobile();

  const [step, setStep] = useState<Step>(0);
  const [sampleId, setSampleId] = useState('caption');
  const [found, setFound] = useState<Set<number>>(new Set());
  const [lastHit, setLastHit] = useState<{ name: string; why: string } | null>(null);
  const [missFlash, setMissFlash] = useState(false);

  const [rules, setRules] = useState<Set<string>>(new Set(['short']));
  const [voice, setVoice] = useState('');

  const [result, setResult] = useState('');
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [quotaLeft, setQuotaLeft] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const sample = SAMPLES.find((s) => s.id === sampleId)!;
  const tellCount = sample.segments.filter((s) => s.tell).length;
  const prompt = composePrompt(rules, voice);

  // Restore a previously built prompt
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.rules)) setRules(new Set(saved.rules));
      if (typeof saved.voice === 'string') setVoice(saved.voice);
    } catch {}
  }, []);

  // Persist as they build
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rules: [...rules], voice }));
    } catch {}
  }, [rules, voice]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const handleSegmentClick = (idx: number) => {
    const seg = sample.segments[idx];
    if (seg.tell) {
      // Re-clicking a found tell re-shows its explanation
      setFound((prev) => (prev.has(idx) ? prev : new Set(prev).add(idx)));
      setLastHit({ name: seg.tell.name, why: seg.tell.why });
      setMissFlash(false);
      // A found tell pre-ticks its matching rule for step 2
      setRules((prev) => new Set(prev).add(seg.tell!.rule));
    } else {
      setLastHit(null);
      setMissFlash(true);
    }
  };

  const handleSampleSwitch = (id: string) => {
    if (id === sampleId) return;
    setSampleId(id);
    setFound(new Set());
    setLastHit(null);
    setMissFlash(false);
    setResult('');
    setRunError(null);
  };

  const toggleRule = (id: string) => {
    setRules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRun = () => {
    if (running) return;
    controllerRef.current?.abort();
    setRunning(true);
    setRunError(null);
    setResult('');
    let accumulated = '';
    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: `Rewrite this in my voice, following your rules strictly. Keep the facts, cut the slop:\n\n${sampleText(sample)}` }],
      systemPrompt: prompt,
      source: 'builder',
      maxTokens: 600,
      skipPersona: true,
      clientId: getToolClientId(),
      onChunk: (text) => { accumulated += text; setResult(accumulated); },
      onDone: () => { setRunning(false); controllerRef.current = null; },
      onError: (err) => {
        setRunning(false);
        controllerRef.current = null;
        setRunError(err);
      },
      onQuotaUpdate: (remaining) => setQuotaLeft(remaining),
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  // ---------- Shared bits ----------
  const monoLabel = (text: string, color: string = SUBTLE) => (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color }}>
      {text}
    </span>
  );

  const bigBtn = (label: string, onClick: () => void, opts?: { primary?: boolean; disabled?: boolean; color?: string }) => (
    <button
      onClick={onClick}
      disabled={opts?.disabled}
      style={{
        padding: '10px 20px', borderRadius: 100,
        border: opts?.primary ? 'none' : `1.5px solid ${INK}`,
        background: opts?.primary ? (opts.color ?? PURPLE) : 'white',
        color: opts?.primary ? 'white' : DEEP,
        fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 700,
        cursor: opts?.disabled ? 'not-allowed' : 'pointer',
        opacity: opts?.disabled ? 0.45 : 1,
        boxShadow: opts?.primary ? `0 6px 16px ${(opts.color ?? PURPLE)}35` : 'none',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );

  const stepper = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? 6 : 10, marginBottom: 22, flexWrap: 'wrap' }}>
      {STEP_META.map((s, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
            <button
              onClick={() => { if (i <= step) setStep(i as Step); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 100, border: 'none',
                background: active ? `${PURPLE}14` : 'transparent',
                cursor: i <= step ? 'pointer' : 'default',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700,
                color: active ? PURPLE : done ? TEAL : SUBTLE,
              }}>{done ? '✓' : s.n}</span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: active ? 700 : 600,
                color: active ? DEEP : SUBTLE,
              }}>{s.title}</span>
            </button>
            {i < STEP_META.length - 1 && <span style={{ color: SUBTLE, opacity: 0.4 }}>→</span>}
          </div>
        );
      })}
    </div>
  );

  // ---------- Step 1 · Spot ----------
  const renderSampleText = (interactive: boolean) => (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '1.02rem' : '1.15rem', lineHeight: 1.9, color: DEEP, margin: 0 }}>
      {sample.segments.map((seg, i) => {
        const isFound = found.has(i);
        if (!interactive) {
          return (
            <span key={i} style={seg.tell && isFound ? { background: `${RED}1A`, borderBottom: `2px solid ${RED}66`, borderRadius: 3, padding: '1px 2px' } : undefined}>
              {seg.text}
            </span>
          );
        }
        return (
          <span
            key={i}
            onClick={() => handleSegmentClick(i)}
            title={isFound && seg.tell ? seg.tell.name : 'Suspicious? Click it.'}
            style={{
              cursor: 'pointer',
              borderRadius: 3,
              padding: '1px 2px',
              background: isFound ? `${RED}1A` : 'transparent',
              borderBottom: isFound ? `2px solid ${RED}66` : '2px solid transparent',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            {seg.text}
          </span>
        );
      })}
    </p>
  );

  const foundTells = sample.segments.filter((s, i) => s.tell && found.has(i)).length;

  const stepSpot = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'inline-flex', border: `1.5px solid ${INK}`, borderRadius: 100, background: 'white' }}>
          {SAMPLES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleSampleSwitch(s.id)}
              style={{
                padding: '7px 14px', border: 'none',
                borderLeft: i === 0 ? 'none' : `1px solid ${INK}`,
                borderRadius: i === 0 ? '100px 0 0 100px' : '0 100px 100px 0',
                background: sampleId === s.id ? `${PURPLE}14` : 'transparent',
                fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: sampleId === s.id ? 700 : 600,
                color: sampleId === s.id ? PURPLE : SUBTLE, cursor: 'pointer',
              }}
              aria-pressed={sampleId === s.id}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: foundTells === tellCount ? TEAL : SUBTLE }}>
          {foundTells} / {tellCount} tells found
        </span>
      </div>

      <div style={{ background: 'white', border: `1.5px solid ${INK}`, borderRadius: 14, padding: isMobile ? '1.25rem' : '1.75rem 2rem' }}>
        <div style={{ marginBottom: 10 }}>{monoLabel('AI wrote this · click everything that smells like a machine', PURPLE)}</div>
        {renderSampleText(true)}
      </div>

      {/* Feedback line */}
      <div style={{ minHeight: 52, marginTop: 12 }}>
        {lastHit && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: `${RED}0C`, border: `1px solid ${RED}30` }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: RED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{lastHit.name} · </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: DEEP }}>{lastHit.why}</span>
          </div>
        )}
        {!lastHit && missFlash && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(26,26,46,0.04)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: SUBTLE, fontStyle: 'italic' }}>That part reads fine. Keep hunting.</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
        {bigBtn(foundTells === 0 ? 'Find at least one first' : 'Next: ban them →', () => setStep(1), { primary: true, disabled: foundTells === 0 })}
      </div>
    </div>
  );

  // ---------- Step 2 · Ban ----------
  const stepBan = (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>
      <div>
        <div style={{ background: 'white', border: `1.5px solid ${INK}`, borderRadius: 14, padding: '1.25rem 1.4rem' }}>
          <div style={{ marginBottom: 12 }}>{monoLabel('Your ban list · the tells you found are already ticked', PURPLE)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {RULES.map((r) => {
              const on = rules.has(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRule(r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    padding: '8px 10px', borderRadius: 8, border: 'none',
                    background: on ? `${TEAL}0E` : 'transparent', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  aria-pressed={on}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${on ? TEAL : 'rgba(26,26,46,0.25)'}`,
                    background: on ? TEAL : 'transparent',
                    color: 'white', fontSize: '0.7rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{on ? '✓' : ''}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', fontWeight: 600, color: on ? DEEP : SUBTLE }}>
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'white', border: `1.5px solid ${INK}`, borderRadius: 14, padding: '1.25rem 1.4rem', marginTop: 14 }}>
          <div style={{ marginBottom: 8 }}>{monoLabel('Your voice · the secret ingredient', AMBER)}</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: SUBTLE, margin: '0 0 10px', lineHeight: 1.5 }}>
            Paste two or three sentences you actually wrote. A WhatsApp message counts. Real sentences, not how you think you should sound.
          </p>
          <textarea
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            rows={4}
            placeholder={'e.g. "Bhai stock aa gaya. Festive boxes Friday se live. Pehle Mumbai, baaki next week."'}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 12px',
              border: `1px solid ${INK}`, borderRadius: 10, outline: 'none', resize: 'vertical',
              background: CREAM, fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              lineHeight: 1.55, color: DEEP,
            }}
            aria-label="Your writing samples"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: DEEP, borderRadius: 14, padding: '1.25rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            {monoLabel('Your de-slop prompt · updates as you tick', '#B8A9FF')}
            <button
              onClick={handleCopy}
              style={{
                padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)',
                background: copied ? TEAL : 'rgba(255,255,255,0.06)', color: 'white',
                fontFamily: 'var(--font-mono)', fontSize: '0.64rem', fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <pre style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.74rem', lineHeight: 1.65,
            color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            margin: 0, flex: 1, overflowY: 'auto', maxHeight: isMobile ? 300 : 430,
          }}>{prompt}</pre>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          {bigBtn('Next: test it →', () => setStep(2), { primary: true })}
        </div>
      </div>
    </div>
  );

  // ---------- Step 3 · Test ----------
  const stepTest = (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>
        <div style={{ background: 'white', border: `1.5px solid ${INK}`, borderRadius: 14, padding: '1.25rem 1.4rem' }}>
          <div style={{ marginBottom: 10 }}>{monoLabel('Before · the slop', RED)}</div>
          {renderSampleText(false)}
        </div>
        <div style={{ background: 'white', border: `1.5px solid ${running || result ? TEAL : INK}`, borderRadius: 14, padding: '1.25rem 1.4rem', transition: 'border-color 0.3s' }}>
          <div style={{ marginBottom: 10 }}>{monoLabel('After · your voice', TEAL)}</div>
          {!result && !running && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: SUBTLE, fontStyle: 'italic', margin: 0 }}>
              Press Run and watch the same message come back without the machine smell.
            </p>
          )}
          {(result || running) && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '1.02rem' : '1.15rem', lineHeight: 1.9, color: DEEP, margin: 0, whiteSpace: 'pre-wrap' }}>
              {result}{running && <span style={{ opacity: 0.4 }}>▋</span>}
            </p>
          )}
        </div>
      </div>

      {runError && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: `${AMBER}12`, border: `1px solid ${AMBER}40` }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: DEEP }}>
            {runError} Your prompt still works: copy it and test it in your own Claude or ChatGPT.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {bigBtn(running ? 'Rewriting…' : result ? 'Run it again' : '▶ Run the rewrite', handleRun, { primary: true, color: TEAL, disabled: running })}
          {quotaLeft !== null && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: SUBTLE }}>
              {quotaLeft} rewrites left today
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          style={{
            padding: '10px 20px', borderRadius: 100, border: `1.5px solid ${copied ? TEAL : INK}`,
            background: 'white', color: copied ? TEAL : DEEP,
            fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? 'Copied ✓' : 'Copy my prompt'}
        </button>
      </div>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: SUBTLE, fontStyle: 'italic', marginTop: 18, lineHeight: 1.6 }}>
        This prompt is yours. Paste it as the first message of any chat, or into the tool's custom instructions, and nothing you ship sounds like a machine again.
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '0 1.1rem' : '0 2rem', width: '100%', boxSizing: 'border-box' }}>
      {stepper}
      {step === 0 && stepSpot}
      {step === 1 && stepBan}
      {step === 2 && stepTest}
    </div>
  );
}

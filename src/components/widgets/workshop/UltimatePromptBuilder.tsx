import { useState, useEffect, useRef, useMemo, Component, type ReactNode, type ErrorInfo } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { streamChat } from '../../../lib/claude';
import { useTranslation } from '../../../i18n/useTranslation';

type TFn = (key: string, fallback?: string) => string;

/*
 * UltimatePromptBuilder — The Workshop hero widget.
 *
 * A 4-step wizard for building a prompt worth saving:
 *   01 Starter   — pick a recipe or go blank
 *   02 Fill      — replace [placeholders] or write your draft
 *   03 Moves     — toggle techniques (role, examples, deslop…); AI live-rewrites your prompt
 *   04 Save      — title it, save to localStorage library, copy it out
 *
 * The library persists in localStorage. Users can re-open any saved prompt.
 */

// ---------- Types ----------
type Step = 'starter' | 'fill' | 'moves' | 'save';
type BlockId = 'role' | 'examples' | 'socratic' | 'reasoning' | 'negative' | 'deslop';

interface Block {
  id: BlockId;
  label: string;
  chapterLabel: string;
  color: string;
  insertion: string;       // Used only when the prompt is blank (no merge needed)
  mergeDirective: string;  // Instruction to the merge editor when blending into a non-empty prompt
  tooltip: string;         // User-facing copy shown on hover
}

interface Recipe {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  color: string;
  starterPrompt: string;
}



interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  createdAt: number;
  updatedAt: number;
  starterRecipeId: string | null;
}

// ---------- Constants ----------
const TEAL = '#16C79A';
const DEEP = '#1A1A2E';
const CREAM = '#F8F6F3';
const SUBTLE = '#6B7280';
const INK = 'rgba(26,26,46,0.1)';
const BLANK_RECIPE_ID = 'blank';
const LIBRARY_KEY = 'ttm-workshop-library';

// Factories below take the t() function so titles/labels/tooltips/prompts
// can be translated. Internal fields (ids, colors, merge directives sent to
// the AI, quick-action intents) stay in English since they are not
// user-visible text and the AI handles mixed-language inputs fine.

function getSteps(t: TFn): Array<{ id: Step; label: string; kicker: string }> {
  return [
    { id: 'starter',  label: t('stepLabelStarter',  'Starter'),     kicker: '01' },
    { id: 'fill',     label: t('stepLabelFill',     'Fill it in'),  kicker: '02' },
    { id: 'moves',    label: t('stepLabelMoves',    'Apply moves'), kicker: '03' },
    { id: 'save',     label: t('stepLabelSave',     'Save'),        kicker: '04' },
  ];
}

function getBlocks(t: TFn): Block[] {
  return [
    {
      id: 'role',
      label: t('blockRoleLabel', 'Role'),
      chapterLabel: 'Ch1',
      color: '#E94560',
      insertion: '\n\nYou are a [describe the role you want the AI to take on, for example "senior editor at The New Yorker"].',
      mergeDirective: 'Add a sentence assigning the AI a specific expert persona that fits the task. Read the rest of the prompt carefully and pick the most useful role (for example, if the prompt is about writing a professional email to a boss, a good role is "corporate communications expert"; for a coding task, "senior software engineer"; for a research task, "research analyst"). Write it as "You are a [your chosen specific role]." Do NOT leave a placeholder in brackets. Pick the role yourself based on context. Match the language of the user\'s original prompt.',
      tooltip: t('blockRoleTooltip', 'Give the AI an identity. A building block from Ch1.'),
    },
    {
      id: 'examples',
      label: t('blockExamplesLabel', 'Examples'),
      chapterLabel: 'Ch2',
      color: '#0F3460',
      insertion: '\n\nHere is an example of the quality I want:\n[paste 1 or 2 examples here]',
      mergeDirective: 'Write 1 or 2 concrete sample outputs yourself that demonstrate the exact format, tone, and quality the user wants for this task, then embed them inline in the prompt as a reference. Read the rest of the prompt carefully and generate examples that fit. For instance, if the prompt is about writing an email, write 1 or 2 brief sample emails. If it is a social post, write 1 or 2 short sample posts. If it is a report outline, sketch a sample outline. Introduce them naturally, something like: "Here is the style and quality I want. Example 1: [the actual example you wrote]. Example 2: [the actual example you wrote]. Please match this style." Do NOT leave bracketed placeholders for the user to fill in. Write the examples yourself. Keep them short and realistic. Match the language of the user\'s original prompt.',
      tooltip: t('blockExamplesTooltip', 'Show the quality you want with real samples. Few-shot prompting from Ch2.'),
    },
    {
      id: 'socratic',
      label: t('blockSocraticLabel', 'Ask First'),
      chapterLabel: 'Ch2',
      color: '#0F3460',
      insertion: '\n\nBefore you answer, ask me 3 clarifying questions, one at a time. For each question, give me multiple-choice options (A, B, C, D) plus an "Other" option where I can type my own answer. Don\'t start until you understand what I actually need.',
      mergeDirective: 'Add a sentence telling the AI to ask 3 specific clarifying questions before answering, one at a time. For each question, it should offer multiple-choice options (A, B, C, D) that cover the most likely answers, plus an "Other (describe)" option so the user can type their own answer if none of the choices fit. It should not start the real task until it understands what the user actually needs. Phrase it directly to the AI. Do NOT leave any placeholders. Match the language of the user\'s original prompt.',
      tooltip: t('blockSocraticTooltip', 'Have the AI interview you before it starts. From Ch2.'),
    },
    {
      id: 'reasoning',
      label: t('blockReasoningLabel', 'Think Step by Step'),
      chapterLabel: 'New',
      color: TEAL,
      insertion: '\n\nThink through this step by step before answering. Show your reasoning.',
      mergeDirective: 'Add a sentence telling the AI to think through the problem step by step before answering and to show its reasoning. Phrase it directly to the AI. Do NOT leave any placeholders. Match the language of the user\'s original prompt.',
      tooltip: t('blockReasoningTooltip', 'Chain of thought. Forces deliberate reasoning.'),
    },
    {
      id: 'negative',
      label: t('blockNegativeLabel', 'Don\'t Do This'),
      chapterLabel: 'New',
      color: '#E94560',
      insertion: '\n\nDo NOT [describe what you want the AI to avoid].',
      mergeDirective: 'Read the prompt carefully and add 2 to 3 specific "Do NOT" constraints that prevent the most common failure modes for this type of task. Each constraint should be concrete and actionable, not generic advice. For example: for a report, "Do not pad sections with generic introductions or conclusions"; for a story, "Do not open with a weather description or use purple prose"; for an email, "Do not use filler like \'I hope this finds you well\'"; for brainstorming, "Do not play it safe or repeat obvious ideas." Pick the constraints yourself based on the prompt content. Do NOT leave any placeholders. Match the language of the user\'s original prompt.',
      tooltip: t('blockNegativeTooltip', 'Tell the AI what to avoid. Constraints by exclusion.'),
    },
    {
      id: 'deslop',
      label: t('blockDeslopLabel', 'Deslop'),
      chapterLabel: 'New',
      color: '#7B61FF',
      insertion: '\n\nWrite like a human. No filler, no em dashes, no AI-isms. Be direct.',
      mergeDirective: 'Add a constraint to my prompt telling the AI to write like a human, not a chatbot. Specifically: no em dashes, no filler openers (like "Here\'s the thing:", "Let\'s dive in", "Let\'s unpack this"), no sycophancy ("Great question!", "Absolutely!", "Certainly!"), no throat-clearing ("It\'s worth noting that", "Importantly", "Interestingly"), no grandiose language ("revolutionary", "game-changer", "unprecedented", "delve", "landscape", "tapestry", "leverage"), no self-answered rhetorical questions ("The result? Devastating."), no bold-first bullet lists, no generic conclusions ("The future looks bright", "Only time will tell"), and no synonym cycling. Write directly, vary sentence lengths, and use plain language. Keep the constraint concise, not a laundry list. Match the language of the user\'s original prompt.',
      tooltip: t('blockDeslopTooltip', 'Strip AI-isms: no filler, no em dashes, no sycophancy. Write like a human.'),
    },
  ];
}

function getRecipes(t: TFn): Recipe[] {
  return [
    {
      id: 'write-report', number: 1,
      title: t('recipe1Title', 'Write a report'),
      subtitle: t('recipe1Subtitle', 'Structure and draft longform.'),
      color: '#0F3460',
      starterPrompt: t('recipe1Prompt', 'I need to write a report about [topic] for [audience]. Length: [length, e.g. 500 words, 2 pages, 10 slides]. Help me structure it and draft each section.'),
    },
    {
      id: 'research-topic', number: 2,
      title: t('recipe2Title', 'Research a topic'),
      subtitle: t('recipe2Subtitle', 'Real homework with sources.'),
      color: '#7B61FF',
      starterPrompt: t('recipe2Prompt', "Research [topic] for me. I'm trying to [goal, e.g. make a decision, learn the basics, compare options]. Find independent sources, compare perspectives, and summarize the key takeaways."),
    },
    {
      id: 'brainstorm-ideas', number: 3,
      title: t('recipe3Title', 'Brainstorm ideas'),
      subtitle: t('recipe3Subtitle', 'Wide range, not just the safe ones.'),
      color: '#F5A623',
      starterPrompt: t('recipe3Prompt', "Help me brainstorm ideas for [what I'm making]. Constraints: [constraints, e.g. budget, tone, time]. Give me a wide range of directions, from safe to unexpected, with a short note on why each one is interesting."),
    },
    {
      id: 'plan-project', number: 4,
      title: t('recipe4Title', 'Plan a project'),
      subtitle: t('recipe4Subtitle', 'Scope it, sequence it.'),
      color: TEAL,
      starterPrompt: t('recipe4Prompt', 'I want to build [project]. Help me plan it. Break it into phases with milestones. I have [time available, e.g. 2 weeks, a month, ongoing] and my experience level is [experience level, e.g. beginner, intermediate, experienced].'),
    },
    {
      id: 'build-website', number: 5,
      title: t('recipe5Title', 'Build a website or app'),
      subtitle: t('recipe5Subtitle', 'From idea to first version.'),
      color: '#0EA5E9',
      starterPrompt: t('recipe5Prompt', 'I want to build [website or app]. The audience is [who it is for]. The core feature is [the one thing it must do well]. Help me plan the pages, pick a tech stack, and outline the first version to ship.'),
    },
    {
      id: 'write-email', number: 6,
      title: t('recipe6Title', 'Write an email'),
      subtitle: t('recipe6Subtitle', 'Get the tone right.'),
      color: '#E94560',
      starterPrompt: t('recipe6Prompt', 'Help me write an email to [recipient] about [subject]. The outcome I want is [desired outcome]. Tone: [tone, e.g. warm but professional].'),
    },
    {
      id: 'summarize-content', number: 7,
      title: t('recipe7Title', 'Summarize this'),
      subtitle: t('recipe7Subtitle', 'Key points and surprises.'),
      color: '#0F3460',
      starterPrompt: t('recipe7Prompt', 'Summarize this for me:\n\n[paste the content]\n\nI want to [purpose, e.g. decide whether to read it, brief my team, understand the main argument]. Give me the key points, the most surprising parts, and anything worth following up on.'),
    },
    {
      id: 'make-decision', number: 8,
      title: t('recipe8Title', 'Make a decision'),
      subtitle: t('recipe8Subtitle', 'Weigh the tradeoffs.'),
      color: TEAL,
      starterPrompt: t('recipe8Prompt', "I'm deciding between [option A] and [option B]. My situation: [context]. What matters most: [priorities, e.g. cost, time, quality]. Help me weigh the tradeoffs and make a clear recommendation."),
    },
    {
      id: 'prepare-conversation', number: 9,
      title: t('recipe9Title', 'Prepare for a conversation'),
      subtitle: t('recipe9Subtitle', 'Rehearse before the real one.'),
      color: '#F5A623',
      starterPrompt: t('recipe9Prompt', 'I have a [type, e.g. interview, pitch, difficult conversation] coming up with [who it is with]. The goal is [what I want to walk away with]. Help me prepare. What questions might come up? What should I practice saying?'),
    },
    {
      id: 'write-story', number: 10,
      title: t('recipe10Title', 'Write a story'),
      subtitle: t('recipe10Subtitle', 'A hook, then build.'),
      color: '#7B61FF',
      starterPrompt: t('recipe10Prompt', 'Help me write a story. Genre: [genre, e.g. mystery, sci-fi, romance]. Core idea: [what it is about]. Main character: [character]. Start with an opening that hooks the reader, then we will build from there.'),
    },
    {
      id: 'plan-trip-event', number: 11,
      title: t('recipe11Title', 'Plan a trip or event'),
      subtitle: t('recipe11Subtitle', 'A day-by-day plan.'),
      color: '#F5A623',
      starterPrompt: t('recipe11Prompt', 'Help me plan [trip or event, e.g. a weekend in Lisbon, a 30th birthday party]. When: [dates]. Budget: [budget]. People: [who is involved]. Notes: [anything else]. Give me a day-by-day plan I can actually use.'),
    },
    {
      id: 'write-social-post', number: 12,
      title: t('recipe12Title', 'Write a social post'),
      subtitle: t('recipe12Subtitle', 'Short, scroll-stopping.'),
      color: '#E94560',
      starterPrompt: t('recipe12Prompt', 'Write a [platform, e.g. LinkedIn, Twitter, Instagram] post about [topic]. The angle: [what I want to highlight]. My voice: [tone, e.g. thoughtful, playful, direct]. Keep it short and scroll-stopping.'),
    },
    {
      id: 'analyze-data', number: 13,
      title: t('recipe13Title', 'Analyze my data'),
      subtitle: t('recipe13Subtitle', 'Patterns and next questions.'),
      color: '#0F3460',
      starterPrompt: t('recipe13Prompt', "Here's some data:\n\n[paste or describe your data]\n\nI'm trying to figure out: [the question]. What patterns, trends, or outliers do you see? What would you investigate next?"),
    },
  ];
}


// ---------- System prompts ----------
const MERGE_SYSTEM_PROMPT = `You are a prompt editor helping a user refine their prompt inside an interactive widget. They will give you their current prompt and an instruction describing how to modify it. Your job is to rewrite the prompt to match the instruction while preserving the user's original topic, tone, and specific details.

Return ONLY the rewritten prompt text. No preamble. No commentary. No surrounding quotes. Just the final prompt, exactly as it should appear in the text box.

CRITICAL VOICE RULE — the rewritten text must still read as a direct request from the user to an AI assistant. It is something the user will paste into Claude or ChatGPT to get an answer. That means:
- Use first person for the user ("I want", "Help me", "I need", "Here is my...").
- When addressing the AI, address it directly in second person ("You are...", "Before you answer...", "Think step by step...").
- Never turn the prompt into third-person procedural instructions, a research plan, a coaching guide, or a set of steps someone else would follow. The reader of this prompt is the AI, not the user, and not a research assistant.
- The final output must be pastable into a chat box and immediately get a real answer, not a plan describing how someone should tackle the task.

Other rules:
- Preserve any placeholders already in the user's existing prompt (like [topic], [your goal], [paste your work]). Those are spots the user will fill in manually. Do not rewrite or replace them.
- However, when the instruction tells you to add new content and pick a specific value yourself (for example, "assign the AI a specific expert role, do not leave a placeholder"), you must make a concrete choice based on the rest of the prompt. Do not invent new bracketed placeholders unless the instruction explicitly says to leave one for the user to fill.
- Do not add markdown formatting, headers, or bullet lists unless the original prompt already used them.
- When the instruction asks you to add a technique, blend the new sentence or section into the prompt naturally, keeping the original request intact.
- Avoid em-dashes. Use commas, colons, or short sentences.
- Don't change the user's subject matter or specifics.`;


// ---------- Helpers ----------
// Word-level LCS diff. Returns chunks marked new (added in newStr) or unchanged.
function wordDiff(oldStr: string, newStr: string): Array<{ text: string; isNew: boolean }> {
  if (!oldStr || oldStr === newStr) return [{ text: newStr, isNew: false }];
  const tokens = (s: string) => s.split(/(\s+)/).filter(t => t.length > 0);
  const a = tokens(oldStr);
  const b = tokens(newStr);
  const m = a.length;
  const n = b.length;
  if (m * n > 200000) return [{ text: newStr, isNew: false }];
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const chunks: Array<{ text: string; isNew: boolean }> = [];
  let i = m, j = n;
  while (j > 0) {
    if (i > 0 && a[i - 1] === b[j - 1]) {
      chunks.unshift({ text: b[j - 1], isNew: false });
      i--; j--;
    } else if (i > 0 && dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      chunks.unshift({ text: b[j - 1], isNew: true });
      j--;
    }
  }
  const merged: typeof chunks = [];
  for (const c of chunks) {
    const last = merged[merged.length - 1];
    if (last && last.isNew === c.isNew) last.text += c.text;
    else merged.push({ ...c });
  }
  return merged;
}

// Renders prompt text with [placeholder] highlights (teal) and optional
// word-level diff highlights (amber) when a diffFrom previous text is provided.
function highlightPlaceholders(text: string, diffFrom?: string | null): ReactNode {
  if (!text) return null;
  const diffChunks = diffFrom && diffFrom !== text
    ? wordDiff(diffFrom, text)
    : [{ text, isNew: false }];
  const nodes: ReactNode[] = [];
  let key = 0;
  for (const chunk of diffChunks) {
    const parts = chunk.text.split(/(\[[^\]\n]+\])/g);
    for (const part of parts) {
      if (part.length === 0) continue;
      if (/^\[[^\]\n]+\]$/.test(part)) {
        nodes.push(
          <mark key={key++} style={{
            background: `${TEAL}33`,
            color: 'inherit',
            padding: 0,
            borderRadius: 2,
            boxShadow: `0 0 0 1px ${TEAL}66`,
          }}>{part}</mark>
        );
      } else if (chunk.isNew) {
        nodes.push(
          <mark key={key++} style={{
            background: '#F5A62338',
            color: 'inherit',
            padding: 0,
            borderRadius: 2,
          }}>{part}</mark>
        );
      } else {
        nodes.push(<span key={key++}>{part}</span>);
      }
    }
  }
  return nodes;
}

function extractPlaceholders(text: string): string[] {
  const matches = text.matchAll(/\[([^\]\n]+)\]/g);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      out.push(m[1]);
    }
  }
  return out;
}

function fillPlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(/\[([^\]\n]+)\]/g, (full, key) => {
    const v = values[key];
    return v && v.trim() ? v.trim() : full;
  });
}

function parsePlaceholderLabel(content: string): { label: string; hint?: string } {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const match = content.match(/^(.*?)(?:,\s*)(?:for example|e\.g\.|such as)\s+(.+)$/i);
  if (match) return { label: cap(match[1].trim()), hint: `e.g. ${match[2].trim()}` };
  return { label: cap(content.trim()) };
}


function loadLibrary(): SavedPrompt[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function persistLibrary(library: SavedPrompt[]): void {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(library)); } catch {}
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(ts).toLocaleDateString();
}

// Translates raw API error strings from streamChat into friendly, actionable
// messages for the widget. Returns { title, body } — render both.
function friendlyAIError(err: string, t: TFn): { title: string; body: string } {
  if (err.includes('Daily AI limit') || err.includes('limit reached')) {
    return {
      title: t('errorLimitTitle', 'Daily AI limit reached'),
      body: t('errorLimitBody', 'Your interactions reset at midnight UTC. You can still edit your prompt by hand, save it to your library, and copy it to use in Claude or ChatGPT.'),
    };
  }
  if (err === 'Unlock required') {
    return {
      title: t('errorUnlockTitle', 'Full access required'),
      body: t('errorUnlockBody', 'Unlock the course to use the AI moves and the prompt coach. You can still edit and save your prompt manually.'),
    };
  }
  if (err.toLowerCase().includes('connection') || err.toLowerCase().includes('network') || err.toLowerCase().includes('failed to fetch')) {
    return {
      title: t('errorConnectionTitle', 'Connection lost'),
      body: t('errorConnectionBody', 'The request could not reach the AI. Check your internet and try again.'),
    };
  }
  return {
    title: t('errorGenericTitle', 'Something went wrong'),
    body: err,
  };
}

// ---------- Error boundary ----------
class WorkshopErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Workshop] Widget render error:', error);
    console.error('[Workshop] Component stack:', info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', border: '2px solid #E94560', borderRadius: 12, background: '#E9456008', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: DEEP }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#E94560', marginBottom: 12 }}>
            Workshop widget failed to render
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(26,26,46,0.04)', color: DEEP, padding: '12px 14px', borderRadius: 8, margin: 0, fontSize: '0.78rem', boxShadow: 'none' }}>
            {this.state.error.message || String(this.state.error)}
            {this.state.error.stack ? '\n\n' + this.state.error.stack.split('\n').slice(0, 6).join('\n') : ''}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------- Default export ----------
export default function UltimatePromptBuilder() {
  return (
    <WorkshopErrorBoundary>
      <UltimatePromptBuilderInner />
    </WorkshopErrorBoundary>
  );
}

// ---------- Inner component ----------
function UltimatePromptBuilderInner() {
  const isMobile = useIsMobile();
  const t = useTranslation('ultimatePromptBuilder');

  // Translated lookups — rebuilt only when the t function identity changes
  // (which in practice is once per mount, since useTranslation memoizes by
  // namespace). These replace the old module-level STEPS/BLOCKS/RECIPES/QUICK_ACTIONS.
  const STEPS = useMemo(() => getSteps(t), [t]);
  const BLOCKS = useMemo(() => getBlocks(t), [t]);
  const RECIPES = useMemo(() => getRecipes(t), [t]);

  // Step + selection
  const [step, setStep] = useState<Step>('starter');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>('');

  // Step 2
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  // Step 3
  const [activeBlocks, setActiveBlocks] = useState<Set<BlockId>>(new Set());
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const mergeControllerRef = useRef<AbortController | null>(null);
  const mergeBaseRef = useRef<string>('');

  // Version history + diff highlighting
  const [versions, setVersions] = useState<Array<{ id: string; prompt: string; createdAt: number; source: 'start' | 'merge' }>>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [diffFromPrompt, setDiffFromPrompt] = useState<string | null>(null);

  // Step 5
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [justSavedAt, setJustSavedAt] = useState<number | null>(null);
  const [justCopiedAt, setJustCopiedAt] = useState<number | null>(null);

  // Library
  const [library, setLibrary] = useState<SavedPrompt[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const libraryHydratedRef = useRef(false);

  // --- Effects ---
  useEffect(() => {
    setLibrary(loadLibrary());
    libraryHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!libraryHydratedRef.current) return;
    persistLibrary(library);
  }, [library]);

  useEffect(() => () => { mergeControllerRef.current?.abort(); }, []);

  useEffect(() => {
    if (document.getElementById('workshop-anim-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'workshop-anim-styles';
    styleEl.textContent = `
      @keyframes workshop-blink { 0%, 100% { opacity: 0.5; } 50% { opacity: 0; } }
      @keyframes workshop-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
        40% { transform: translateY(-4px); opacity: 0.8; }
      }
      @keyframes workshop-fade-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleEl);
  }, []);

  // Re-sync highlight overlay after prompt content changes (e.g. merge, revert,
  // manual edit) in case the textarea's scrollTop shifted without firing scroll.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const raf = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLTextAreaElement>('textarea[data-workshop-canvas]').forEach((ta) => {
        const parent = ta.parentElement;
        if (!parent) return;
        const inner = parent.querySelector<HTMLDivElement>('[data-overlay-inner]');
        if (inner) inner.style.transform = `translateY(${-ta.scrollTop}px)`;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [promptText, step]);

  // --- Derived ---
  const selectedRecipe = useMemo(() => {
    if (!selectedRecipeId || selectedRecipeId === BLANK_RECIPE_ID) return null;
    return RECIPES.find(r => r.id === selectedRecipeId) ?? null;
  }, [selectedRecipeId]);

  const placeholders = useMemo(() => {
    if (selectedRecipeId === BLANK_RECIPE_ID) return [];
    return extractPlaceholders(promptText);
  }, [promptText, selectedRecipeId]);

  const filledPreview = useMemo(() => {
    if (placeholders.length === 0) return promptText;
    return fillPlaceholders(promptText, placeholderValues);
  }, [promptText, placeholders.length, placeholderValues]);

  const stepIdx = STEPS.findIndex(s => s.id === step);
  const canAdvance = useMemo(() => {
    if (step === 'starter') return selectedRecipeId !== null;
    if (step === 'fill') return promptText.trim().length > 0;
    if (step === 'moves') return promptText.trim().length > 0;
    return false;
  }, [step, selectedRecipeId, promptText]);

  // --- Handlers ---
  const handleSelectStarter = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setPlaceholderValues({});
    setDiffFromPrompt(null);
    let initialPrompt = '';
    if (recipeId !== BLANK_RECIPE_ID) {
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (recipe) initialPrompt = recipe.starterPrompt;
    }
    setPromptText(initialPrompt);
    if (initialPrompt) {
      const id = generateId();
      setVersions([{ id, prompt: initialPrompt, createdAt: Date.now(), source: 'start' }]);
      setActiveVersionId(id);
    } else {
      setVersions([]);
      setActiveVersionId(null);
    }
    setActiveBlocks(new Set());
    setEditingId(null);
    setSaveTitle('');
  };

  const handleNext = () => {
    if (!canAdvance) return;
    if (step === 'starter') { setStep('fill'); return; }
    if (step === 'fill') {
      if (placeholders.length > 0) {
        setDiffFromPrompt(promptText);
        setPromptText(filledPreview);
        pushVersion(filledPreview, 'start');
      } else if (selectedRecipeId === BLANK_RECIPE_ID && promptText.trim() && versions.length === 0) {
        pushVersion(promptText, 'start');
      }
      setPlaceholderValues({});
      setStep('moves');
      return;
    }
    if (step === 'moves') {
      setStep('save');
      if (!saveTitle.trim()) {
        const title = selectedRecipe
          ? `${selectedRecipe.title} ${new Date().toLocaleDateString()}`
          : `Custom prompt ${new Date().toLocaleDateString()}`;
        setSaveTitle(title);
      }
      return;
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1].id);
  };

  const handleJumpToStep = (target: Step) => {
    const targetIdx = STEPS.findIndex(s => s.id === target);
    if (targetIdx >= 0 && targetIdx <= stepIdx) setStep(target);
  };

  const handleSetPlaceholderValue = (key: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }));
  };

  const pushVersion = (newPrompt: string, source: 'start' | 'merge') => {
    const id = generateId();
    const entry = { id, prompt: newPrompt, createdAt: Date.now(), source };
    setVersions(prev => {
      const latest = prev[prev.length - 1];
      if (latest && latest.prompt === newPrompt) return prev;
      return [...prev, entry];
    });
    setActiveVersionId(id);
  };

  const handleRevertToVersion = (id: string) => {
    const version = versions.find(v => v.id === id);
    if (!version) return;
    const idx = versions.findIndex(v => v.id === id);
    const prev = idx > 0 ? versions[idx - 1].prompt : null;
    setPromptText(version.prompt);
    setDiffFromPrompt(prev);
    setActiveVersionId(id);
  };

  const performMerge = (
    intent: string,
    source: 'merge' = 'merge',
    onErrorRevert?: () => void,
  ) => {
    mergeControllerRef.current?.abort();
    const baseText = promptText;
    mergeBaseRef.current = baseText;
    setIsMerging(true);
    setMergeError(null);
    let accumulated = '';
    const userMessage = `Here is my current prompt:\n\n${baseText}\n\nInstruction: ${intent}\n\nRewrite it now.`;
    mergeControllerRef.current = streamChat({
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt: MERGE_SYSTEM_PROMPT,
      source: 'workshop',
      maxTokens: 1200,
      skipPersona: true,
      onChunk: (text) => { accumulated += text; setPromptText(accumulated); },
      onDone: () => {
        setIsMerging(false);
        mergeControllerRef.current = null;
        // If the stream finished with no content (e.g. instant quota short-circuit),
        // treat it as an error rather than a successful empty rewrite.
        if (!accumulated.trim()) {
          setPromptText(mergeBaseRef.current);
          return;
        }
        setDiffFromPrompt(baseText);
        pushVersion(accumulated, source);
      },
      onError: (err) => {
        console.error('[Workshop] Merge error:', err);
        setIsMerging(false);
        mergeControllerRef.current = null;
        setPromptText(mergeBaseRef.current);
        setMergeError(err);
        onErrorRevert?.();
      },
    });
  };


  const handleManualPromptEdit = (value: string) => {
    setPromptText(value);
    if (diffFromPrompt !== null) setDiffFromPrompt(null);
    if (activeVersionId !== null) setActiveVersionId(null);
  };

  // Keeps the placeholder/diff highlight overlay scrolled in sync with the
  // textarea content. The overlay is a clipped outer div + transformed inner.
  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const parent = e.currentTarget.parentElement;
    if (!parent) return;
    const inner = parent.querySelector<HTMLDivElement>('[data-overlay-inner]');
    if (inner) {
      inner.style.transform = `translateY(${-e.currentTarget.scrollTop}px)`;
    }
  };


  const handleToggleBlock = (id: BlockId) => {
    if (isMerging) return;
    const block = BLOCKS.find(b => b.id === id);
    if (!block) return;
    const willActivate = !activeBlocks.has(id);
    setActiveBlocks(prev => {
      const next = new Set(prev);
      if (willActivate) next.add(id); else next.delete(id);
      return next;
    });
    if (!promptText.trim()) {
      if (willActivate) setPromptText(prev => prev + block.insertion);
      return;
    }
    const intent = willActivate
      ? `${block.mergeDirective}\n\nBlend the new sentence or section into my prompt naturally, keeping the rest of my prompt intact. Do not restructure it into a plan or a list of steps. The final text must still read as a direct request from me to an AI that I can paste into ChatGPT or Claude to get a real answer.`
      : `Remove the "${block.label}" technique from my prompt (the part about: ${block.tooltip}). Keep everything else exactly as it is, and make sure the prompt still reads as a direct request from me to an AI.`;
    // On merge error, revert the visual toggle so the block state matches the
    // prompt state (since the prompt was rolled back to its pre-merge text).
    const revertToggle = () => {
      setActiveBlocks(prev => {
        const next = new Set(prev);
        if (willActivate) next.delete(id); else next.add(id);
        return next;
      });
    };
    performMerge(intent, 'merge', revertToggle);
  };


  const handleSave = () => {
    const title = saveTitle.trim();
    if (!title || !promptText.trim()) return;
    const now = Date.now();
    if (editingId) {
      setLibrary(prev => prev.map(p =>
        p.id === editingId ? { ...p, title, prompt: promptText, updatedAt: now } : p
      ));
    } else {
      const entry: SavedPrompt = {
        id: generateId(),
        title,
        prompt: promptText,
        createdAt: now,
        updatedAt: now,
        starterRecipeId: selectedRecipeId,
      };
      setLibrary(prev => [entry, ...prev]);
      setEditingId(entry.id);
    }
    setJustSavedAt(Date.now());
    window.setTimeout(() => setJustSavedAt(null), 2500);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setJustCopiedAt(Date.now());
      window.setTimeout(() => setJustCopiedAt(null), 1800);
    } catch (err) {
      console.error('[Workshop] Copy failed:', err);
    }
  };

  const handleOpenSaved = (id: string) => {
    const saved = library.find(p => p.id === id);
    if (!saved) return;
    mergeControllerRef.current?.abort();
    setEditingId(saved.id);
    setSelectedRecipeId(saved.starterRecipeId ?? BLANK_RECIPE_ID);
    setPromptText(saved.prompt);
    setPlaceholderValues({});
    setActiveBlocks(new Set());
    setSaveTitle(saved.title);
    setDiffFromPrompt(null);
    const vid = generateId();
    setVersions([{ id: vid, prompt: saved.prompt, createdAt: Date.now(), source: 'start' }]);
    setActiveVersionId(vid);
    setShowLibrary(false);
    setStep('moves');
  };

  const handleDeleteSaved = (id: string) => {
    setLibrary(prev => prev.filter(p => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleStartOver = () => {
    mergeControllerRef.current?.abort();
    setStep('starter');
    setSelectedRecipeId(null);
    setPlaceholderValues({});
    setPromptText('');
    setActiveBlocks(new Set());
    setSaveTitle('');
    setEditingId(null);
    setJustSavedAt(null);
    setJustCopiedAt(null);
    setVersions([]);
    setActiveVersionId(null);
    setDiffFromPrompt(null);
  };

  // --- Render helpers ---
  const renderStepper = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 4 : 8, flexWrap: 'wrap', marginBottom: 24 }}>
      {STEPS.map((s, i) => {
        const isActive = s.id === step;
        const isDone = i < stepIdx;
        const isClickable = isDone;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
            <button
              onClick={() => isClickable && handleJumpToStep(s.id)}
              disabled={!isClickable}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: isMobile ? '6px 10px' : '8px 14px',
                borderRadius: 100,
                border: isActive ? `1.5px solid ${TEAL}` : `1.5px solid ${isDone ? TEAL + '55' : INK}`,
                background: isActive ? `${TEAL}12` : isDone ? `${TEAL}06` : 'white',
                color: isActive || isDone ? DEEP : SUBTLE,
                fontFamily: 'var(--font-body)',
                fontSize: isMobile ? '0.72rem' : '0.8rem',
                fontWeight: isActive ? 700 : 600,
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.2s',
                opacity: isActive || isDone ? 1 : 0.6,
              }}
              aria-current={isActive ? 'step' : undefined}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, borderRadius: '50%',
                background: isActive || isDone ? TEAL : 'transparent',
                border: isActive || isDone ? 'none' : `1px solid ${SUBTLE}`,
                color: isActive || isDone ? 'white' : SUBTLE,
                fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
              }}>
                {isDone ? '✓' : s.kicker}
              </span>
              {!isMobile && s.label}
            </button>
            {i < STEPS.length - 1 && (
              <span style={{ width: isMobile ? 6 : 14, height: 1, background: i < stepIdx ? TEAL + '55' : INK }} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderLibraryButton = () => (
    <button
      onClick={() => setShowLibrary(true)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 100,
        border: `1.5px solid ${INK}`, background: 'white', color: DEEP,
        fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = TEAL; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = INK; }}
    >
      <span style={{ fontSize: '0.85rem' }}>📚</span>
      {t('libraryOpenButton', 'Your library')}
      {library.length > 0 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 18, height: 18, padding: '0 5px', borderRadius: 100,
          background: TEAL, color: 'white',
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700,
        }}>
          {library.length}
        </span>
      )}
    </button>
  );

  // Step 1 — Starter
  const renderStep1 = () => {
    const allCards = [
      { id: BLANK_RECIPE_ID, number: null as number | null, title: t('blankTitle', 'Blank'), subtitle: t('blankSubtitle', 'Start from scratch.'), color: SUBTLE, isBlank: true },
      ...RECIPES.map(r => ({ id: r.id, number: r.number as number | null, title: r.title, subtitle: r.subtitle, color: r.color, isBlank: false })),
    ];
    return (
      <div style={{ animation: 'workshop-fade-in 0.35s ease-out' }}>
        <StepHeading kicker={t('step1Kicker', 'Step 1')} title={t('step1Title', 'Pick a starter')} subtitle={t('step1Subtitle', 'Thirteen starters for the most common AI tasks, plus a blank canvas if you want to write your own.')} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
          {allCards.map(card => {
            const isSelected = selectedRecipeId === card.id;
            return (
              <button
                key={card.id}
                onClick={() => handleSelectStarter(card.id)}
                style={{
                  display: 'block', textAlign: 'left',
                  padding: '14px 16px', borderRadius: 12,
                  border: isSelected
                    ? `2px solid ${card.color}`
                    : card.isBlank ? '2px dashed rgba(26,26,46,0.2)' : `1.5px solid ${INK}`,
                  background: isSelected ? `${card.color}10` : 'white',
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'inherit', minHeight: 78,
                }}
                aria-pressed={isSelected}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  {card.number !== null && (
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800,
                      color: card.color, opacity: 0.55, minWidth: 18,
                    }}>
                      {card.number}
                    </span>
                  )}
                  {card.isBlank && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 18, height: 18, borderRadius: '50%',
                      border: `1.5px dashed ${SUBTLE}`, color: SUBTLE, fontSize: '0.8rem',
                    }}>+</span>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700,
                    color: DEEP, lineHeight: 1.25,
                  }}>
                    {card.title}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                  color: SUBTLE, fontStyle: 'italic', lineHeight: 1.4,
                  paddingLeft: 28,
                }}>
                  {card.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Step 2 — Fill
  const renderStep2 = () => {
    if (selectedRecipeId === BLANK_RECIPE_ID) {
      return (
        <div style={{ animation: 'workshop-fade-in 0.35s ease-out' }}>
          <StepHeading kicker={t('step2Kicker', 'Step 2')} title={t('step2BlankTitle', 'Write your draft')} subtitle={t('step2BlankSubtitle', "Don't worry about getting it perfect. You'll refine it in the next steps.")} />
          <textarea
            value={promptText}
            onChange={(e) => handleManualPromptEdit(e.target.value)}
            placeholder={t('step2BlankTextareaPlaceholder', 'What do you want the AI to do? Type it out in plain English.')}
            rows={8}
            style={{
              width: '100%', padding: '16px 18px', marginTop: 20,
              borderRadius: 12, border: `1.5px solid ${INK}`, background: CREAM,
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.65,
              color: DEEP, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: 8, fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: SUBTLE, fontStyle: 'italic' }}>
            {t('step2BlankHint', 'Even one sentence is enough to start. The AI will help you expand it.')}
          </div>
        </div>
      );
    }

    if (placeholders.length === 0) {
      return (
        <div style={{ animation: 'workshop-fade-in 0.35s ease-out' }}>
          <StepHeading kicker={t('step2Kicker', 'Step 2')} title={t('step2NothingTitle', 'Your starter')} subtitle={t('step2NothingSubtitle', 'Nothing to fill in here. Review it and move on.')} />
          <div style={{
            marginTop: 20, padding: '16px 18px', background: CREAM,
            borderRadius: 12, border: `1.5px solid ${INK}`,
            fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.65,
            color: DEEP, whiteSpace: 'pre-wrap',
          }}>
            {promptText}
          </div>
        </div>
      );
    }

    const count = placeholders.length;
    const fillSubtitle = (count === 1
      ? t('step2FillSubtitleSingular', 'Your starter has {count} blank to fill in.')
      : t('step2FillSubtitlePlural', 'Your starter has {count} blanks to fill in.')
    ).replace('{count}', String(count));

    return (
      <div style={{ animation: 'workshop-fade-in 0.35s ease-out' }}>
        <StepHeading
          kicker={t('step2Kicker', 'Step 2')}
          title={t('step2FillTitle', 'Fill in the blanks')}
          subtitle={fillSubtitle}
        />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginTop: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {placeholders.map(ph => {
              const parsed = parsePlaceholderLabel(ph);
              const value = placeholderValues[ph] ?? '';
              return (
                <div key={ph}>
                  <label style={{
                    display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                    fontWeight: 700, color: DEEP, marginBottom: 6,
                  }}>
                    {parsed.label}
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => handleSetPlaceholderValue(ph, e.target.value)}
                    placeholder={parsed.hint ?? t('step2FieldPlaceholder', 'Your {label}…').replace('{label}', parsed.label)}
                    rows={2}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      border: `1.5px solid ${INK}`, background: 'white',
                      fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.5,
                      color: DEEP, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = TEAL; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = INK; }}
                  />
                </div>
              );
            })}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.1em', color: SUBTLE, textTransform: 'uppercase', marginBottom: 8,
            }}>
              {t('step2LivePreview', 'Live preview')}
            </div>
            <div style={{
              padding: '14px 16px', background: CREAM, borderRadius: 12,
              border: `1.5px solid ${INK}`,
              fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.65,
              color: DEEP, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              maxHeight: 360, overflowY: 'auto',
            }}>
              {highlightPlaceholders(filledPreview)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Version pills — shown above the prompt canvas in Steps 3 and 4.
  const renderVersionPills = () => {
    if (versions.length === 0) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
          letterSpacing: '0.1em', color: SUBTLE, textTransform: 'uppercase', marginRight: 4,
        }}>
          {t('versionsLabel', 'Versions')}
        </span>
        {versions.map((v, i) => {
          const isActive = activeVersionId === v.id;
          const sourceLabel = v.source === 'start'
            ? t('versionSourceStart', 'Starting point')
            : t('versionSourceMerge', 'Move applied');
          return (
            <button
              key={v.id}
              onClick={() => handleRevertToVersion(v.id)}
              title={`${sourceLabel} · ${new Date(v.createdAt).toLocaleTimeString()}`}
              style={{
                padding: '3px 10px',
                borderRadius: 100,
                border: `1px solid ${isActive ? TEAL : INK}`,
                background: isActive ? `${TEAL}15` : 'white',
                color: isActive ? TEAL : DEEP,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.66rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              aria-current={isActive ? 'true' : undefined}
            >
              v{i + 1}
            </button>
          );
        })}
        {activeVersionId === null && versions.length > 0 && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: SUBTLE, fontStyle: 'italic', marginLeft: 4,
          }}>
            {t('versionModified', 'modified')}
          </span>
        )}
      </div>
    );
  };

  // Step 3 — Moves
  const renderStep3 = () => (
    <div style={{ animation: 'workshop-fade-in 0.35s ease-out' }}>
      <StepHeading kicker={t('step3Kicker', 'Step 3')} title={t('step3Title', 'Apply the moves')} subtitle={t('step3Subtitle', 'Toggle techniques you learned in Chapters 1 through 3. The AI rewrites your prompt live.')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
        {renderVersionPills()}
        {mergeError && (
          <AIErrorBanner error={mergeError} onDismiss={() => setMergeError(null)} t={t} />
        )}
        <div style={{
          position: 'relative', background: CREAM, borderRadius: 12,
          border: `1.5px solid ${isMerging ? TEAL + '55' : INK}`,
          transition: 'border-color 0.2s',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            overflow: 'hidden', pointerEvents: 'none', borderRadius: 12,
          }}>
            <div data-overlay-inner="true" style={{
              padding: '14px 16px',
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.65,
              color: 'transparent', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              boxSizing: 'border-box', width: '100%', willChange: 'transform',
            }}>
              {highlightPlaceholders(promptText, diffFromPrompt)}
              {promptText.endsWith('\n') ? '\u00A0' : ''}
            </div>
          </div>
          <textarea
            value={promptText}
            onChange={(e) => handleManualPromptEdit(e.target.value)}
            onScroll={handleTextareaScroll}
            data-workshop-canvas="true"
            disabled={isMerging}
            rows={9}
            style={{
              position: 'relative', display: 'block', width: '100%',
              padding: '14px 16px', background: 'transparent',
              border: 'none', outline: 'none',
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.65,
              color: DEEP, resize: 'vertical', boxSizing: 'border-box',
              borderRadius: 12, cursor: isMerging ? 'not-allowed' : 'text',
            }}
            aria-label="Your prompt"
          />
          {isMerging && (
            <div style={{
              position: 'absolute', top: 10, right: 12,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px 4px 8px', borderRadius: 100,
              background: TEAL, color: 'white',
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              boxShadow: `0 2px 10px ${TEAL}55`, pointerEvents: 'none',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: 'white',
                animation: 'workshop-blink 0.9s step-end infinite',
              }} />
              {t('rewritingBadge', 'Rewriting')}
            </div>
          )}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: SUBTLE,
            marginBottom: 10, opacity: 0.7,
          }}>
            {t('stackYourMoves', 'Stack your moves')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BLOCKS.map(block => {
              const isActive = activeBlocks.has(block.id);
              return (
                <button
                  key={block.id}
                  onClick={() => handleToggleBlock(block.id)}
                  disabled={isMerging}
                  title={block.tooltip}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 100,
                    border: `1.5px solid ${isActive ? block.color : 'rgba(26,26,46,0.15)'}`,
                    background: isActive ? `${block.color}12` : 'white',
                    fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                    color: isActive ? block.color : DEEP,
                    cursor: isMerging ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isMerging ? 0.5 : 1,
                  }}
                  aria-pressed={isActive}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: block.color, opacity: isActive ? 1 : 0.3,
                    transition: 'opacity 0.2s',
                  }} />
                  {block.label}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    opacity: 0.55, marginLeft: 2,
                  }}>
                    {block.chapterLabel}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{
            marginTop: 12, fontFamily: 'var(--font-body)', fontSize: '0.75rem',
            color: SUBTLE, fontStyle: 'italic',
          }}>
            {t('movesHint', 'Each toggle asks the AI to weave the technique in. Your specifics stay intact.')}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4 — Save
  const renderStep5 = () => (
    <div style={{ animation: 'workshop-fade-in 0.35s ease-out' }}>
      <StepHeading kicker={t('step4SaveKicker', 'Step 4')} title={t('step5Title', 'Save your prompt')} subtitle={t('step5Subtitle', 'Give it a title and save it to your local library. Copy it out to use anywhere.')} />
      <div style={{ maxWidth: 640, margin: '24px auto 0' }}>
        <label style={{
          display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
          fontWeight: 700, color: DEEP, marginBottom: 6,
        }}>
          {t('savePromptTitleLabel', 'Title')}
        </label>
        <input
          type="text"
          value={saveTitle}
          onChange={(e) => setSaveTitle(e.target.value)}
          placeholder={t('savePromptTitlePlaceholder', 'Give your prompt a memorable name')}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: `1.5px solid ${INK}`,
            fontFamily: 'var(--font-body)', fontSize: '0.95rem',
            color: DEEP, outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = TEAL; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = INK; }}
        />

        <div style={{
          marginTop: 16, fontFamily: 'var(--font-body)', fontSize: '0.78rem',
          fontWeight: 700, color: DEEP, marginBottom: 6,
        }}>
          {t('saveFinalPromptLabel', 'Final prompt')}
        </div>
        <div style={{
          padding: '16px 18px', background: CREAM, borderRadius: 12,
          border: `1.5px solid ${INK}`,
          fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.65,
          color: DEEP, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          maxHeight: 320, overflowY: 'auto',
        }}>
          {promptText}
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            disabled={!saveTitle.trim() || !promptText.trim()}
            style={{
              flex: '1 1 200px', padding: '14px 24px', borderRadius: 100, border: 'none',
              background: !saveTitle.trim() ? 'rgba(26,26,46,0.1)' : TEAL,
              color: !saveTitle.trim() ? SUBTLE : 'white',
              fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700,
              cursor: !saveTitle.trim() ? 'not-allowed' : 'pointer',
              boxShadow: !saveTitle.trim() ? 'none' : `0 8px 24px ${TEAL}30`,
              transition: 'all 0.2s',
            }}
          >
            {justSavedAt ? t('saveButtonSaved', '✓ Saved') : editingId ? t('saveButtonUpdate', 'Update in library') : t('saveButton', 'Save to library')}
          </button>
          <button
            onClick={handleCopyPrompt}
            style={{
              flex: '1 1 140px', padding: '14px 24px', borderRadius: 100,
              border: `1.5px solid ${INK}`, background: 'white', color: DEEP,
              fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = TEAL; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = INK; }}
          >
            {justCopiedAt ? t('copyButtonCopied', '✓ Copied') : t('copyButton', 'Copy prompt')}
          </button>
        </div>

        <div style={{
          marginTop: 28, padding: '20px 24px', borderRadius: 12,
          background: `${TEAL}08`, border: `1px solid ${TEAL}30`,
          fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.6, color: DEEP,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('whereToRunTitle', 'Where to run it')}</div>
          {t('whereToRunBody', 'Paste this prompt into Claude, ChatGPT, or any chat AI you use. Your saved prompts live in "Your library" at the top, ready to come back to.')}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            onClick={handleStartOver}
            style={{
              background: 'transparent', border: 'none', color: SUBTLE,
              fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            {t('buildAnother', 'Build another prompt from scratch')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => {
    const isFirst = stepIdx === 0;
    const isLast = step === 'save';
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 28, paddingTop: 20, borderTop: `1px solid ${INK}`,
      }}>
        <button
          onClick={handleBack}
          disabled={isFirst}
          style={{
            padding: '10px 18px', borderRadius: 100,
            border: `1.5px solid ${INK}`, background: 'transparent',
            color: isFirst ? SUBTLE : DEEP,
            fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600,
            cursor: isFirst ? 'not-allowed' : 'pointer',
            opacity: isFirst ? 0.4 : 1, transition: 'all 0.2s',
          }}
        >
          {t('navBack', '← Back')}
        </button>
        {!isLast && (
          <button
            onClick={handleNext}
            disabled={!canAdvance || isMerging}
            style={{
              padding: '12px 24px', borderRadius: 100, border: 'none',
              background: canAdvance && !isMerging ? TEAL : 'rgba(26,26,46,0.1)',
              color: canAdvance && !isMerging ? 'white' : SUBTLE,
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700,
              cursor: canAdvance && !isMerging ? 'pointer' : 'not-allowed',
              boxShadow: canAdvance && !isMerging ? `0 6px 18px ${TEAL}30` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {step === 'moves' ? t('navFinishSave', 'Finish & save →') : t('navNext', 'Next →')}
          </button>
        )}
      </div>
    );
  };

  const renderLibraryDrawer = () => {
    if (!showLibrary) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('libraryDialogAriaLabel', 'Your library')}
        onClick={() => setShowLibrary(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,26,46,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '16px' : '40px', zIndex: 9999,
          animation: 'workshop-fade-in 0.2s ease-out',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white', borderRadius: 16,
            padding: isMobile ? '20px' : '32px',
            maxWidth: 720, width: '100%', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 30px 80px rgba(26,26,46,0.3)',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase', marginBottom: 4,
              }}>
                {t('libraryKicker', 'Saved locally')}
              </div>
              <h3 style={{
                margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.4rem',
                fontWeight: 800, color: DEEP, letterSpacing: '-0.02em',
              }}>
                {t('libraryTitleWithCount', 'Your library ({count})').replace('{count}', String(library.length))}
              </h3>
            </div>
            <button
              onClick={() => setShowLibrary(false)}
              style={{
                width: 36, height: 36, display: 'flex',
                alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                border: `1.5px solid ${INK}`, background: 'white', color: DEEP,
                fontSize: '1.1rem', cursor: 'pointer',
              }}
              aria-label={t('libraryCloseAria', 'Close library')}
            >
              ×
            </button>
          </div>

          {library.length === 0 ? (
            <div style={{
              padding: '40px 20px', textAlign: 'center', color: SUBTLE,
              fontFamily: 'var(--font-body)', fontSize: '0.95rem',
              fontStyle: 'italic', lineHeight: 1.6,
              border: `1.5px dashed ${INK}`, borderRadius: 12,
              background: 'rgba(22,199,154,0.02)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.5 }}>📚</div>
              {t('libraryEmptyTitle', 'Your library is empty.')}<br />
              {t('libraryEmptyBody', 'Build a prompt in the workshop and save it to see it here.')}
            </div>
          ) : (
            <div style={{
              flex: 1, overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4,
            }}>
              {library.map(item => (
                <div key={item.id} style={{
                  padding: '14px 16px', borderRadius: 12,
                  border: `1.5px solid ${editingId === item.id ? TEAL + '55' : INK}`,
                  background: editingId === item.id ? `${TEAL}06` : 'white',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', gap: 12, marginBottom: 8,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700,
                        color: DEEP, marginBottom: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.title}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.66rem',
                        color: SUBTLE, letterSpacing: '0.04em',
                      }}>
                        {t('libraryUpdatedPrefix', 'Updated')} {formatRelativeDate(item.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '10px 12px', background: CREAM, borderRadius: 8,
                    fontFamily: 'var(--font-mono)', fontSize: '0.74rem',
                    lineHeight: 1.55, color: DEEP, maxHeight: 70, overflow: 'hidden',
                    marginBottom: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {item.prompt.length > 180 ? item.prompt.slice(0, 180) + '…' : item.prompt}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenSaved(item.id)}
                      style={{
                        padding: '7px 14px', borderRadius: 100, border: 'none',
                        background: TEAL, color: 'white',
                        fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t('libraryOpen', 'Open & refine')}
                    </button>
                    <button
                      onClick={async () => { try { await navigator.clipboard.writeText(item.prompt); } catch {} }}
                      style={{
                        padding: '7px 14px', borderRadius: 100,
                        border: `1.5px solid ${INK}`, background: 'white', color: DEEP,
                        fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t('libraryCopy', 'Copy')}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t('libraryDeleteConfirm', 'Delete "{title}"? This cannot be undone.').replace('{title}', item.title))) {
                          handleDeleteSaved(item.id);
                        }
                      }}
                      style={{
                        padding: '7px 14px', borderRadius: 100,
                        border: '1.5px solid rgba(233,69,96,0.25)',
                        background: 'transparent', color: '#E94560',
                        fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 600,
                        cursor: 'pointer', marginLeft: 'auto',
                      }}
                    >
                      {t('libraryDelete', 'Delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Main render ---
  return (
    <div style={{
      maxWidth: 1100, margin: '0 auto',
      padding: isMobile ? '0 1.25rem' : '0 2rem',
      width: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        {renderLibraryButton()}
      </div>

      <div style={{
        background: 'white',
        border: '1px solid rgba(26,26,46,0.08)',
        borderRadius: 16,
        padding: isMobile ? '1.5rem 1.25rem' : '2rem 2.25rem',
        boxShadow: '0 20px 60px rgba(26,26,46,0.06)',
      }}>
        {renderStepper()}
        {step === 'starter' && renderStep1()}
        {step === 'fill' && renderStep2()}
        {step === 'moves' && renderStep3()}
        {step === 'save' && renderStep5()}
        {renderNavigation()}
      </div>

      {renderLibraryDrawer()}
    </div>
  );
}

// ---------- Sub-components ----------
function AIErrorBanner({ error, onDismiss, t }: { error: string; onDismiss?: () => void; t: TFn }) {
  const friendly = friendlyAIError(error, t);
  const isLimit = error.includes('Daily AI limit') || error.includes('limit reached');
  const accent = isLimit ? '#F5A623' : '#E94560';
  return (
    <div
      role="alert"
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '12px 14px',
        background: `${accent}0F`,
        border: `1px solid ${accent}35`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 10,
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.82rem', fontWeight: 700, color: DEEP, marginBottom: 3,
        }}>
          {friendly.title}
        </div>
        <div style={{
          fontSize: '0.78rem', color: SUBTLE, lineHeight: 1.55,
        }}>
          {friendly.body}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('errorDismiss', 'Dismiss')}
          style={{
            width: 22, height: 22, borderRadius: '50%',
            border: 'none', background: 'rgba(26,26,46,0.05)',
            color: SUBTLE, fontSize: '0.7rem',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1,
          }}
        >
          &#x2715;
        </button>
      )}
    </div>
  );
}

function StepHeading({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700,
        letterSpacing: '0.12em', color: TEAL, textTransform: 'uppercase', marginBottom: 6,
      }}>
        {kicker}
      </div>
      <h3 style={{
        margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: '1.6rem',
        fontWeight: 800, color: DEEP, letterSpacing: '-0.02em',
      }}>
        {title}
      </h3>
      <p style={{
        margin: '0 auto', fontFamily: 'var(--font-body)', fontSize: '0.95rem',
        color: SUBTLE, lineHeight: 1.55, maxWidth: 520,
      }}>
        {subtitle}
      </p>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span style={{
      width: 6, height: 6, borderRadius: '50%',
      background: SUBTLE, opacity: 0.5,
      animation: `workshop-bounce 1.2s ease-in-out ${delay}s infinite`,
    }} />
  );
}

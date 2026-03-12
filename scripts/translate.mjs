#!/usr/bin/env node
/**
 * Translation Pipeline for Talking to Machines
 *
 * Translates all chapter .astro files into 18 languages using Claude.
 *
 * Usage:
 *   node scripts/translate.mjs                    # Translate all chapters × all languages
 *   node scripts/translate.mjs hi es fr            # Only these languages
 *   node scripts/translate.mjs --chapters ch1 ch2  # Only these chapters
 *   node scripts/translate.mjs hi --chapters ch1   # Specific language + chapter
 *   node scripts/translate.mjs --force             # Overwrite existing translations
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Load .env ──
const envFile = path.join(ROOT, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const client = new Anthropic();

// ── Language definitions ──
const LANGUAGES = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

const ALL_CHAPTERS = ['ch1','ch2','ch3','ch4','ch5','ch6','ch7','ch8','ch9','ch10','ch11'];
const CONCURRENCY = 1; // Rate limit: 8K output tokens/min — sequential is safest
const MAX_RETRIES = 3;
const MIN_DELAY_MS = 30_000; // 30s gap between requests to respect rate limits

// ── Read chapter metadata for context ──
const chaptersTs = readFileSync(path.join(ROOT, 'src/data/chapters.ts'), 'utf8');

// ── Language-specific quality rules (from QA audit) ──
function buildLanguageRules(lang) {
  const rules = {
    hi: `HINDI-SPECIFIC:
• ALWAYS use "तुम/तुम्हारे/तुम्हारी/तुम्हें" (informal). NEVER use "आप/आपके/आपकी/आपको" (formal). This is for teenagers — keep it casual across ALL chapters consistently.
• NATURAL CODE-MIXING: Hindi teens naturally mix English words. Use English for tech terms (prompt, tool, AI, context window, building blocks, iteration, etc.) and words commonly said in English (highlight reel, practice, boring, smart, replace). Do NOT use overly Sanskritized Hindi.
• BAD (over-Sanskritized): अस्पष्ट, संवाद, स्वतंत्रता, अपरिवर्तनीय, बुनियादी तत्व, कार्रवाई, मानसिकता
• GOOD (natural code-mix): vague, communication, autonomy, irreplaceable, building blocks, action, mindset
• Avoid the mistake of using Hindi grammar as mere glue for English words. Sentences should have genuine Hindi verbs and connectors with English nouns/terms. The sweet spot: "तुम highlight reel देख रहे हो, practice sessions नहीं।"
• "AI" is grammatically masculine in Hindi (AI ने किया, AI है). Be consistent.
• For "replace" use "जगह लेना" not "बदलना" (बदलना means "change", not "replace").`,
    es: `SPANISH-SPECIFIC:
• ALWAYS use inverted punctuation: ¿ before questions and ¡ before exclamations. This is mandatory for proper Spanish. Example: "¿Qué pasó?" not "Que pasó?"
• Use SPANISH capitalization for headings: only capitalize the first word and proper nouns. NOT English-style Title Case. Example: "Los cinco bloques de construcción" NOT "Los Cinco Bloques de Construcción."
• Use "tú" (informal) consistently. Never "usted."
• "AP English" does not exist in Spanish-speaking countries. Adapt to "redacción avanzada" or equivalent local reference.
• Use "Punto clave" or "Idea clave" for insight labels, not "Insight clave."
• For "highlight reel" use "los mejores momentos" not "lo mejor."`,
    ar: `ARABIC-SPECIFIC:
• ALWAYS use "الذكاء الاصطناعي" for "AI/artificial intelligence." NEVER write "الذكي الاصطناعي" — that is grammatically incorrect (adjective instead of noun).
• For CSS layout properties like padding-left, left, margin-left: change to padding-right, right, margin-right since Arabic is RTL. Or better, use logical properties: padding-inline-start, inset-inline-start, margin-inline-start.
• Use Modern Standard Arabic (MSA) with a conversational register — not stiff classical Arabic.
• Keep tool/product names in English: ChatGPT, Claude, Midjourney, etc.
• For "pipelines" use "سلاسل العمل" (workflow chains), not "خطوط الإنتاج" (production lines).`,
    ta: `TAMIL-SPECIFIC:
• Use informal "நீ" throughout, not formal "நீங்கள்."
• Code-switching with English is natural for Tamil teens, but ensure Tamil provides the sentence structure, not just grammatical suffixes on English words. BAD: "Meetings schedule பண்ணுறது? Basically solved." GOOD: "Meetings schedule பண்றது AI-க்கு easy — ஏற்கனவே solve ஆயிடுச்சு."
• CAREFUL with Tamil character encoding: never combine vowel marks incorrectly (e.g., "ாெ" is invalid — use "ொ" or the correct combined form).
• For "autonomy" use "autonomy" in English or "தன்னாட்சி", NOT "சுயாட்சி" (which has political connotations in Tamil).
• When adding Tamil suffixes to English words, use standard patterns: "arguments-உடன்" not "arguments-ட்டுடன்".`,
    bn: `BENGALI-SPECIFIC:
• Use informal "তুমি" throughout, not formal "আপনি" (except in quoted AI responses where the AI speaks formally).
• Bengali numerals (১, ২, ৩, etc.) are preferred over Arabic numerals (1, 2, 3) in running text.
• Code-mixing is natural but ensure Bengali carries the sentence meaning. Don't let Bengali become just grammatical glue.
• When attaching Bengali suffixes to English words, ensure correct spacing: "প্রোদের" (pros'), not "প্রো দের".
• "স্মৃতিভ্রষ্ট" (amnesiac) and similar literary Bengali words work well for vivid descriptions — keep the Bengali lively.`,
    pt: `PORTUGUESE-SPECIFIC:
• Use BRAZILIAN Portuguese, not European Portuguese. Use "você" consistently.
• Use "Ideia-chave" or "Ponto fundamental" for insight labels, not "Insight fundamental."
• Keep technical loanwords natural: "framework" is fine in Brazilian tech discourse, but for 14-year-olds, prefer "estrutura" where possible.
• Keep tool/product names in English.
• Use "IA" (Inteligência Artificial) not "AI" throughout.`,
    fr: `FRENCH-SPECIFIC:
• Use "tu" (informal) throughout, never "vous."
• "Prompt" can stay in English — it's standard in French tech discourse.
• Adapt culturally: "AP English" → "cours d'anglais avancé" or similar. No US-specific references.
• Use "Idée clé" or "Point clé" for insight labels.
• French punctuation rules: space before : ; ? ! (thin non-breaking space in HTML: &#8239; or just a regular space is acceptable).`,
    id: `INDONESIAN-SPECIFIC:
• Use informal/casual register ("kamu" not "Anda") for teen audience.
• Indonesian naturally borrows English tech terms. Keep AI, prompt, tool, etc. in English.
• Use "Poin penting" or "Insight utama" for insight labels.`,
    te: `TELUGU-SPECIFIC:
• Use informal "నీవు/నువ్వు" not formal "మీరు."
• Code-mixing with English is natural for Telugu teens in tech contexts.
• Use Telugu script numbers where appropriate in running text.`,
    mr: `MARATHI-SPECIFIC:
• Use informal "तू/तुझा" register for teen audience, not "आपण/तुमचा" (formal).
• Similar code-mixing principles as Hindi — Marathi teens mix English naturally.
• Use "AI" as masculine grammatically.`,
    kn: `KANNADA-SPECIFIC:
• Use informal "ನೀನು" register for teen audience, not formal "ನೀವು."
• Code-mixing with English is natural for Bangalore teens.`,
    gu: `GUJARATI-SPECIFIC:
• Use informal "તું/તારું" register for teen audience, not "તમે/તમારું" (formal).
• Code-mixing with English is natural for Gujarati teens in tech contexts.`,
    ja: `JAPANESE-SPECIFIC:
• Use casual/plain form (だ/である) not polite form (です/ます) for the narrative voice. This is a magazine-style feature, not a textbook.
• Keep katakana for borrowed tech terms: プロンプト, ツール, エージェント, etc.
• AI terms: use English with katakana where standard (e.g., "コンテキストウィンドウ" for context window).`,
    ko: `KOREAN-SPECIFIC:
• Use informal 반말 (해체) register, like talking to a friend: "~해", "~야", "~거든". NOT formal 합쇼체 or polite 해요체.
• Keep English tech terms in their original form or use established Korean equivalents.`,
    de: `GERMAN-SPECIFIC:
• Use informal "du" throughout, never "Sie."
• German compound nouns are fine but keep them readable. Use English tech terms where standard.
• Use German-style heading capitalization (capitalize nouns, not all words).`,
    zh: `CHINESE-SPECIFIC:
• Use simplified Chinese (简体中文).
• Casual, conversational register. Use "你" not "您."
• Keep English names for tools and products. Use established Chinese terms for AI concepts where they exist (人工智能, 提示词, 上下文窗口, etc.)`,
    tr: `TURKISH-SPECIFIC:
• Use informal "sen" register throughout, never "siz."
• Turkish agglutination: ensure suffixes on English loanwords follow vowel harmony where applicable.
• Keep tool/product names in English.`,
    vi: `VIETNAMESE-SPECIFIC:
• Use informal register: "bạn" or "cậu" for addressing the reader, not formal "quý vị."
• Vietnamese uses Latin script, so English tech terms blend naturally. Keep them in English.
• Use Vietnamese diacritics correctly throughout.`,
  };
  return rules[lang.code] || `No specific rules for ${lang.name}. Follow the general guidelines closely.`;
}

// ── System prompt builder ──
function buildSystemPrompt(lang) {
  return `You are a world-class translator specializing in educational content for teenagers (14-18 years old). You are translating an interactive web course about AI from English to ${lang.name} (${lang.nativeName}).

YOUR TASK: Translate the Astro web page file below. Output the COMPLETE translated .astro file.

═══ WHAT TO TRANSLATE ═══
• All human-readable text: paragraphs, headings, labels, button text, quotes, insight boxes
• String literals in JavaScript arrays/objects that contain DISPLAY TEXT (e.g., text in .map() arrays like { word: 'Prompt.', desc: 'Write your best first attempt.' })
• The chapter title in the <h1> tag
• The chapter subtitle/hook text
• Alt text, aria-labels, title attributes
• Text inside pull-quote divs, insight-box divs
• "Chapter One", "Chapter Two" etc. labels
• "Key insight" labels

═══ WHAT TO KEEP IN ENGLISH (DO NOT TRANSLATE) ═══
• ALL HTML tags, CSS classes, inline style properties and values
• ALL JavaScript/TypeScript code logic, variable names, function names
• ALL component names: FadeInBlock, AccentBar, BeatSection, PromptMakeover, etc.
• ALL Astro directives: client:visible, client:load, export const prerender, etc.
• ALL URLs, file paths, href values
• The five building block LETTERS: R, T, F, C, E (but translate their names: Role, Task, etc.)
• Brand names: ChatGPT, Claude, Netflix, Siri, etc.
• CSS color values, dimensions, all style="" content
• Code examples shown to users (keep in English)
• Component prop names (beatId, accentColor, etc.)
• id="" attribute values

═══ IMPORT PATH ADJUSTMENT ═══
CRITICAL: Because translated files live in src/pages/${lang.code}/ (one directory deeper), ALL import paths starting with '../' MUST become '../../':
  '../layouts/ChapterLayout.astro' → '../../layouts/ChapterLayout.astro'
  '../components/scroll/FadeInBlock' → '../../components/scroll/FadeInBlock'
  '../data/chapters' → '../../data/chapters'
  '../styles/global.css' → '../../styles/global.css'
Do this for EVERY import in the frontmatter section.

═══ LOCALE SUPPORT ═══
Add locale="${lang.code}" to the <ChapterLayout> opening tag:
  <ChapterLayout chapter={chapter}> → <ChapterLayout chapter={chapter} locale="${lang.code}">

═══ TRANSLATION QUALITY GUIDELINES ═══
• Use natural, conversational ${lang.name} appropriate for a smart 15-year-old
• Translate IDIOMATICALLY, not literally. "The gap between what AI can do and what most people get it to do" should feel natural in ${lang.name}, not like a word-for-word translation
• Keep sentences short and punchy — match the rhythm of the original
• Use "you" (informal/familiar form in ${lang.name}) — this is a conversation, not a lecture
• For AI/technical terms: use the English term on first mention with a brief ${lang.name} note in parentheses if needed, then use whichever form reads more naturally
• Humor and personality should feel native to ${lang.name}, not translated
• "Drop cap" CSS class should stay — it works with any script
• Preserve emphasis: <strong>, <em> tags should wrap the translated equivalent

═══ LANGUAGE-SPECIFIC RULES ═══
${buildLanguageRules(lang)}
═══ OUTPUT FORMAT ═══
Return ONLY the complete .astro file content. No markdown fences (\`\`\`). No explanations. No commentary before or after. Start directly with --- (the frontmatter delimiter).`;
}

// ── Pre-process: adjust import paths mechanically ──
function adjustImportPaths(source) {
  // In the frontmatter (between --- delimiters), change '../ to '../../
  const parts = source.split('---');
  if (parts.length < 3) return source;

  let frontmatter = parts[1];
  // Adjust relative import paths
  frontmatter = frontmatter.replace(/from\s+['"]\.\.\//g, "from '../../");
  frontmatter = frontmatter.replace(/import\s+['"]\.\.\//g, "import '../../");

  parts[1] = frontmatter;
  return parts.join('---');
}

// ── Core translation function ──
async function translateChapter(chapterSlug, lang, force = false) {
  const outDir = path.join(ROOT, 'src/pages', lang.code);
  const outFile = path.join(outDir, `${chapterSlug}.astro`);

  if (!force && existsSync(outFile)) {
    return { status: 'skipped', slug: chapterSlug, lang: lang.code };
  }

  const source = readFileSync(path.join(ROOT, 'src/pages', `${chapterSlug}.astro`), 'utf8');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 12000,
    system: buildSystemPrompt(lang),
    messages: [{
      role: 'user',
      content: `Here is the chapter metadata from chapters.ts for reference (so you can translate titles, hooks, beat titles, and beat tldrs accurately):\n\n${chaptersTs}\n\n═══ FILE TO TRANSLATE: src/pages/${chapterSlug}.astro ═══\n\n${source}`
    }],
  });

  let result = response.content[0].text;

  // Clean up any accidental markdown fences
  result = result.replace(/^```[\w]*\n?/, '').replace(/\n?```\s*$/, '');

  // Safety check: ensure import paths were adjusted
  if (result.includes("from '../") && !result.includes("from '../../")) {
    result = adjustImportPaths(result);
  }

  // Ensure locale prop is on ChapterLayout
  if (!result.includes(`locale=`)) {
    result = result.replace(
      /<ChapterLayout\s+chapter=\{chapter\}/,
      `<ChapterLayout chapter={chapter} locale="${lang.code}"`
    );
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, result, 'utf8');

  const tokens = response.usage;
  return {
    status: 'translated',
    slug: chapterSlug,
    lang: lang.code,
    inputTokens: tokens.input_tokens,
    outputTokens: tokens.output_tokens,
  };
}

// ── Retry wrapper ──
async function translateWithRetry(chapterSlug, lang, force, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await translateChapter(chapterSlug, lang, force);
    } catch (err) {
      const isRateLimit = err?.status === 429;
      const isOverloaded = err?.status === 529;
      const isRetryable = isRateLimit || isOverloaded || err?.status >= 500;

      if (isRetryable && attempt < retries) {
        const delay = isRateLimit ? 60000 : Math.pow(2, attempt) * 2000;
        console.log(`  ⟳ ${lang.code}/${chapterSlug} — ${err.status || 'error'}, retrying in ${delay/1000}s (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return {
        status: 'failed',
        slug: chapterSlug,
        lang: lang.code,
        error: `${err.status || ''} ${err.message || err}`.trim(),
      };
    }
  }
}

// ── Sequential execution with rate-limit pacing ──
async function runPool(tasks, concurrency) {
  const results = [];

  if (concurrency <= 1) {
    // Sequential mode with pacing — safest for low rate limits
    let lastRequestEnd = 0;
    for (const taskFn of tasks) {
      // Enforce minimum delay between requests
      const now = Date.now();
      const elapsed = now - lastRequestEnd;
      if (lastRequestEnd > 0 && elapsed < MIN_DELAY_MS) {
        const wait = MIN_DELAY_MS - elapsed;
        process.stdout.write(`  ⏳ Rate-limit pause ${Math.round(wait/1000)}s…\n`);
        await new Promise(r => setTimeout(r, wait));
      }
      const result = await taskFn();
      results.push(result);
      lastRequestEnd = Date.now();
    }
    return results;
  }

  // Concurrent mode (for higher-tier API accounts)
  const executing = new Set();
  for (const taskFn of tasks) {
    const p = taskFn().then(r => {
      executing.delete(p);
      return r;
    });
    executing.add(p);
    results.push(p);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// ── CLI parsing ──
function parseArgs(argv) {
  const args = argv.slice(2);
  const langs = [];
  const chapters = [];
  let force = false;
  let parsingChapters = false;

  for (const arg of args) {
    if (arg === '--force') { force = true; continue; }
    if (arg === '--chapters') { parsingChapters = true; continue; }
    if (parsingChapters) {
      if (arg.startsWith('--')) { parsingChapters = false; }
      else { chapters.push(arg); continue; }
    }
    if (LANGUAGES.some(l => l.code === arg)) {
      langs.push(arg);
    }
  }

  return {
    langs: langs.length > 0 ? LANGUAGES.filter(l => langs.includes(l.code)) : LANGUAGES,
    chapters: chapters.length > 0 ? chapters : ALL_CHAPTERS,
    force,
  };
}

// ── Main ──
async function main() {
  const { langs, chapters, force } = parseArgs(process.argv);
  const totalTasks = langs.length * chapters.length;

  console.log(`\n🌐 Translating ${chapters.length} chapter(s) × ${langs.length} language(s) = ${totalTasks} files`);
  console.log(`   Languages: ${langs.map(l => l.code).join(', ')}`);
  console.log(`   Chapters:  ${chapters.join(', ')}`);
  console.log(`   Force:     ${force}\n`);

  let completed = 0;
  const startTime = Date.now();

  const tasks = [];
  for (const lang of langs) {
    for (const ch of chapters) {
      tasks.push(async () => {
        const label = `${lang.code}/${ch}`;
        process.stdout.write(`  → ${label}…\n`);
        const result = await translateWithRetry(ch, lang, force);
        completed++;
        const pct = Math.round((completed / totalTasks) * 100);
        if (result.status === 'translated') {
          console.log(`  ✓ ${label} (${result.inputTokens}→${result.outputTokens} tok) [${pct}%]`);
        } else if (result.status === 'skipped') {
          console.log(`  · ${label} exists [${pct}%]`);
        } else {
          console.log(`  ✗ ${label} FAILED: ${result.error} [${pct}%]`);
        }
        return result;
      });
    }
  }

  const results = await runPool(tasks, CONCURRENCY);

  const translated = results.filter(r => r.status === 'translated');
  const skipped = results.filter(r => r.status === 'skipped');
  const failed = results.filter(r => r.status === 'failed');
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalInput = translated.reduce((s, r) => s + (r.inputTokens || 0), 0);
  const totalOutput = translated.reduce((s, r) => s + (r.outputTokens || 0), 0);

  console.log(`\n═══ RESULTS ═══`);
  console.log(`  Translated: ${translated.length}`);
  console.log(`  Skipped:    ${skipped.length}`);
  console.log(`  Failed:     ${failed.length}`);
  console.log(`  Time:       ${elapsed}s`);
  console.log(`  Tokens:     ${totalInput.toLocaleString()} in → ${totalOutput.toLocaleString()} out`);

  if (failed.length > 0) {
    console.log(`\n  Failed translations:`);
    for (const f of failed) {
      console.log(`    ✗ ${f.lang}/${f.slug}: ${f.error}`);
    }
    console.log(`\n  Re-run failed: node scripts/translate.mjs ${[...new Set(failed.map(f => f.lang))].join(' ')} --chapters ${[...new Set(failed.map(f => f.slug))].join(' ')} --force`);
  }

  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

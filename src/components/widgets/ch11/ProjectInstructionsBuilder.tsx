import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { useAuth } from '../../../hooks/useAuth';
import { streamChat } from '../../../lib/claude';
import UnlockModal from '../../ui/UnlockModal';
import { useTranslation, getLocale } from '../../../i18n/useTranslation';
import { languages } from '../../../data/languages';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ToolId = 'claude' | 'cursor' | 'copilot' | 'antigravity';
type Phase = 'input' | 'generating' | 'editor';

interface Section {
  id: string;
  label: string;
  chapterRef: string;
  chapterColor: string;
  placeholder: string;
  content: string;
  isAugmenting: boolean;
  wasAugmented: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ACCENT = '#16C79A';

const TOOLS: { id: ToolId; name: string; filename: string; desc: string }[] = [
  { id: 'claude', name: 'Claude Code', filename: 'CLAUDE.md', desc: 'Claude Code reads it automatically every conversation.' },
  { id: 'cursor', name: 'Cursor', filename: '.cursorrules', desc: 'Cursor loads these rules as context for every AI interaction.' },
  { id: 'copilot', name: 'GitHub Copilot', filename: '.github/copilot-instructions.md', desc: 'Copilot uses these instructions for code suggestions and chat.' },
  { id: 'antigravity', name: 'Antigravity', filename: '.antigravityrules', desc: 'Antigravity reads these rules for all AI-assisted coding.' },
];

const FILENAME_MAP: Record<ToolId, string> = {
  claude: 'CLAUDE.md',
  cursor: '.cursorrules',
  copilot: 'copilot-instructions.md',
  antigravity: '.antigravityrules',
};

const SECTION_DEFS: Omit<Section, 'content' | 'isAugmenting' | 'wasAugmented'>[] = [
  { id: 'overview', label: 'Project Overview', chapterRef: 'Ch 7', chapterColor: '#7B61FF', placeholder: 'What the project does and who it\'s for...' },
  { id: 'stack', label: 'Stack & Setup', chapterRef: 'Ch 8', chapterColor: '#0F3460', placeholder: 'Technologies, frameworks, and setup notes...' },
  { id: 'role', label: 'AI Role', chapterRef: 'Ch 1-2', chapterColor: '#E94560', placeholder: 'How the AI should behave on this project...' },
  { id: 'references', label: 'Style & References', chapterRef: 'Ch 10', chapterColor: '#16C79A', placeholder: 'Design references, quality bar, visual style...' },
  { id: 'workflow', label: 'Build Workflow', chapterRef: 'Ch 9', chapterColor: '#E94560', placeholder: 'How a productive build session should flow...' },
  { id: 'rules', label: 'Rules & Guardrails', chapterRef: 'Ch 9', chapterColor: '#F5A623', placeholder: 'What the AI should never do...' },
  { id: 'human', label: 'Human Decisions', chapterRef: 'Ch 10', chapterColor: '#16C79A', placeholder: 'Decisions that stay with you, the human...' },
];

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------
const GENERATE_PROMPT = `You are an expert at writing project instruction files (like CLAUDE.md or .cursorrules) for AI coding tools. Given a one-line project description, generate a comprehensive instruction file broken into 7 sections.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "overview": "2-4 sentences: what this project is, who it's for, core goals",
  "stack": "Bullet points: suggested technologies, frameworks, and setup. Choose appropriate modern tools for the project type. Include language, framework, styling, database if needed, and deployment.",
  "role": "2-3 sentences: how the AI should behave — what kind of collaborator it should be, tone, priorities",
  "references": "Bullet points: design style suggestions, reference sites/apps to emulate, quality standards. Be specific — name real sites or styles.",
  "workflow": "Numbered steps: how a productive build session should flow. Include specify, generate, verify steps. Include acceptance criteria patterns.",
  "rules": "Bullet points: things the AI must never do, quality rules, forbidden patterns. Be specific and practical.",
  "human": "Bullet points: decisions that should always be made by the human, not the AI. Things like scope, design direction, user experience calls."
}

Rules:
- Be specific and actionable, not generic
- Suggest a real, practical stack appropriate for the project
- The references section should name real websites or apps as design inspiration
- The workflow should reflect iterative building (not waterfall)
- Rules should include at least one testing/verification requirement
- Keep each section concise but useful — quality over length
- Do NOT use markdown formatting inside the JSON values (no #, **, etc.) — just plain text with \\n for newlines
- ONLY output the JSON object, nothing else`;

const BASE_AUGMENT_PROMPT_PREFIX = `You are improving one section of a project instruction file (like CLAUDE.md). The user will provide the current content of the`;

function makeAugmentPrompt(sectionId: string, sectionLabel: string): string {
  return `You are improving one section of a project instruction file (like CLAUDE.md). The user will provide the current content of the "${sectionLabel}" section and optionally some guidance on how to improve it.

Your job: rewrite and improve the section. Make it more specific, more actionable, and more useful. Add detail where it's thin. Remove anything generic.

Rules:
- Return ONLY the improved section content as plain text
- Use \\n for newlines, bullet points with "- " prefix for lists, numbered lists with "1. " prefix
- Do NOT use markdown headers (#) — the section header is handled separately
- Do NOT wrap in quotes or code blocks
- Keep the same approximate length or slightly longer — don't pad with fluff
- Be specific: name real tools, real patterns, real constraints
- ONLY output the improved section text, nothing else`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProjectInstructionsBuilder() {
  const isMobile = useIsMobile();
  const { isPaid } = useAuth();
  const t = useTranslation('projectInstructionsBuilder');
  const locale = getLocale();
  const languageName = languages.find(l => l.code === locale)?.name || 'English';

  const [phase, setPhase] = useState<Phase>('input');
  const [selectedTool, setSelectedTool] = useState<ToolId>('claude');
  const [projectIdea, setProjectIdea] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [augmentInput, setAugmentInput] = useState<Record<string, string>>({});

  const controllerRef = useRef<AbortController | null>(null);

  // Load saved idea from ch7's WhatWouldYouBuild widget
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ttm_my_project_idea');
      if (saved && !projectIdea) setProjectIdea(saved);
    } catch { /* ignore */ }
  }, []);

  // ─── Generate all sections from one-liner ───
  const handleGenerate = useCallback(() => {
    if (!projectIdea.trim() || !isPaid) return;
    setPhase('generating');
    setError('');

    let accumulated = '';

    controllerRef.current = streamChat({
      messages: [{ role: 'user', content: `Project: ${projectIdea.trim()}` }],
      systemPrompt: GENERATE_PROMPT,
      maxTokens: 2048,
      source: 'project-builder',
      skipPersona: true,
      onChunk: (text) => { accumulated += text; },
      onDone: () => {
        try {
          const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('No JSON found');
          const parsed = JSON.parse(jsonMatch[0]);
          const newSections: Section[] = SECTION_DEFS.map((def) => ({
            ...def,
            content: (parsed[def.id] || def.placeholder).replace(/\\n/g, '\n'),
            isAugmenting: false,
            wasAugmented: false,
          }));
          setSections(newSections);
          setPhase('editor');
          setExpandedSection('overview');
        } catch (e) {
          setError('Failed to parse response. Try again.');
          setPhase('input');
        }
      },
      onError: (err) => {
        setError(err);
        setPhase('input');
      },
    });
  }, [projectIdea, isPaid]);

  // ─── Augment a single section ───
  const handleAugment = useCallback((sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const guidance = augmentInput[sectionId]?.trim();

    setSections((prev) => prev.map((s) =>
      s.id === sectionId ? { ...s, isAugmenting: true } : s
    ));

    let accumulated = '';
    const userContent = guidance
      ? `Current content:\n${section.content}\n\nImprovement guidance: ${guidance}`
      : `Current content:\n${section.content}\n\nPlease improve this section — make it more specific and actionable.`;

    streamChat({
      messages: [{ role: 'user', content: userContent }],
      systemPrompt: makeAugmentPrompt(section.id, section.label),
      maxTokens: 1024,
      source: 'project-builder',
      skipPersona: true,
      onChunk: (text) => { accumulated += text; },
      onDone: () => {
        const cleaned = accumulated.replace(/^["'`\s]+|["'`\s]+$/g, '').replace(/\\n/g, '\n');
        setSections((prev) => prev.map((s) =>
          s.id === sectionId ? { ...s, content: cleaned, isAugmenting: false, wasAugmented: true } : s
        ));
        setAugmentInput((prev) => ({ ...prev, [sectionId]: '' }));
      },
      onError: () => {
        setSections((prev) => prev.map((s) =>
          s.id === sectionId ? { ...s, isAugmenting: false } : s
        ));
      },
    });
  }, [sections, augmentInput]);

  // ─── Build final markdown ───
  const buildMarkdown = useCallback((): string => {
    const lines: string[] = [];
    const overviewSection = sections.find((s) => s.id === 'overview');
    const firstLine = overviewSection?.content.split('\n')[0] || projectIdea;
    lines.push(`# ${projectIdea}`);
    lines.push('');
    lines.push(overviewSection?.content || '');
    lines.push('');

    const sectionHeaders: Record<string, string> = {
      stack: '## Stack & Setup',
      role: '## AI Role',
      references: '## Style & References',
      workflow: '## Build Workflow',
      rules: '## Rules & Guardrails',
      human: '## Human Decisions',
    };

    for (const s of sections) {
      if (s.id === 'overview') continue;
      lines.push(sectionHeaders[s.id] || `## ${s.label}`);
      lines.push('');
      lines.push(s.content);
      lines.push('');
    }
    return lines.join('\n').trim();
  }, [sections, projectIdea]);

  // ─── Copy / Download ───
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(buildMarkdown()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [buildMarkdown]);

  const handleDownload = useCallback(() => {
    const filename = FILENAME_MAP[selectedTool];
    const blob = new Blob([buildMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildMarkdown, selectedTool]);

  // ─── Reset ───
  const handleReset = useCallback(() => {
    controllerRef.current?.abort();
    setPhase('input');
    setSections([]);
    setError('');
    setExpandedSection(null);
    setAugmentInput({});
  }, []);

  const pad = isMobile ? '0.75rem' : '1.5rem 2rem';

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="widget-container">
      <style>{`
        @keyframes pib-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes pib-spin { to { transform: rotate(360deg); } }
        @keyframes pib-slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 800px; } }
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{ padding: isMobile ? '0.5rem 0.75rem' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: isMobile ? '0.5rem' : '1.25rem' }}>
          <div style={{
            width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>
              {t('title', 'Project Instructions Builder')}
            </h3>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
                {t('subtitle', 'Describe your project. Get a ready-to-use instruction file.')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ PHASE: INPUT ═══ */}
      {phase === 'input' && (
        <div style={{ padding: pad }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.75, color: '#1A1A2E', margin: '0 0 1rem' }}>
            {t('describeProject', "Describe your project in one line. We'll generate a complete instruction file with all the right sections \u2014 then you can edit and improve each one.")}
          </p>

          {/* Project idea input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', display: 'block', marginBottom: 6 }}>
              {t('yourProject', 'Your project')}
            </label>
            <textarea
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              placeholder="A flashcard app that quizzes me on my class notes using spaced repetition..."
              rows={isMobile ? 2 : 2}
              style={{
                width: '100%', padding: '0.75rem 1rem', fontFamily: 'var(--font-body)',
                fontSize: '0.95rem', lineHeight: 1.6, background: '#FEFDFB',
                border: `1.5px solid rgba(26,26,46,0.1)`, borderRadius: 10,
                resize: 'none' as const, outline: 'none', color: '#1A1A2E',
                boxSizing: 'border-box' as const,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = `${ACCENT}60`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'; }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
              }}
            />
          </div>

          {/* Tool selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', display: 'block', marginBottom: 6 }}>
              {t('generateFor', 'Generate for')}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 100, border: '1px solid',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                    fontWeight: 600, letterSpacing: '0.03em', transition: 'all 0.2s',
                    background: selectedTool === tool.id ? `${ACCENT}12` : 'transparent',
                    borderColor: selectedTool === tool.id ? `${ACCENT}40` : 'rgba(26,26,46,0.1)',
                    color: selectedTool === tool.id ? ACCENT : '#6B7280',
                  }}
                >
                  {tool.filename}
                </button>
              ))}
            </div>
          </div>

          {/* Section preview */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', marginBottom: 8 }}>
              {t('sectionsWeGenerate', "Sections we'll generate")}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {SECTION_DEFS.map((def) => (
                <span
                  key={def.id}
                  style={{
                    padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.03em',
                    color: def.chapterColor, background: `${def.chapterColor}10`,
                    border: `1px solid ${def.chapterColor}20`,
                  }}
                >
                  {def.label}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', marginBottom: '1rem' }}>{error}</p>
          )}

          {!isPaid ? (
            <UnlockModal feature="Project Instructions Builder" accentColor={ACCENT} />
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!projectIdea.trim()}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 10, border: 'none',
                cursor: projectIdea.trim() ? 'pointer' : 'default',
                fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                fontWeight: 600, letterSpacing: '0.04em',
                background: projectIdea.trim() ? ACCENT : 'rgba(26,26,46,0.08)',
                color: projectIdea.trim() ? 'white' : '#6B7280',
                transition: 'all 0.25s',
              }}
            >
              {t('generateButton', 'Generate My Instruction File')}
            </button>
          )}
        </div>
      )}

      {/* ═══ PHASE: GENERATING ═══ */}
      {phase === 'generating' && (
        <div style={{ padding: pad, textAlign: 'center' as const, minHeight: 200, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div style={{
            width: 36, height: 36, border: `3px solid ${ACCENT}20`, borderTop: `3px solid ${ACCENT}`,
            borderRadius: '50%', animation: 'pib-spin 0.8s linear infinite',
          }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#1A1A2E', margin: 0, lineHeight: 1.6 }}>
            {t('generating', 'Generating your instruction file...')}
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#6B7280', margin: 0, maxWidth: 320, textWrap: 'balance' as any }}>
            {t('building7Sections', 'Building 7 sections from your project description')}
          </p>
        </div>
      )}

      {/* ═══ PHASE: EDITOR ═══ */}
      {phase === 'editor' && (
        <div>
          {/* Project name bar */}
          <div style={{
            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 2rem',
            borderBottom: '1px solid rgba(26,26,46,0.06)',
            background: 'rgba(26,26,46,0.015)',
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', letterSpacing: '0.06em' }}>
              {FILENAME_MAP[selectedTool]}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#1A1A2E', fontStyle: 'italic' }}>
              — {projectIdea.length > 60 ? projectIdea.slice(0, 60) + '...' : projectIdea}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(26,26,46,0.1)',
                  background: 'transparent', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                  color: copied ? ACCENT : '#6B7280', transition: 'all 0.2s',
                }}
              >
                {copied ? t('copiedBtn', 'Copied!') : t('copyAll', 'Copy all')}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none',
                  background: ACCENT, color: 'white', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                }}
              >
                {t('download', 'Download')}
              </button>
            </div>
          </div>

          {/* Section cards */}
          <div style={{ padding: isMobile ? '0.5rem' : '1rem 1.5rem' }}>
            {sections.map((section) => {
              const isExpanded = expandedSection === section.id;
              return (
                <div
                  key={section.id}
                  style={{
                    marginBottom: 8, borderRadius: 10, overflow: 'hidden',
                    border: `1px solid ${isExpanded ? `${section.chapterColor}30` : 'rgba(26,26,46,0.06)'}`,
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Section header — always visible */}
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    style={{
                      width: '100%', padding: isMobile ? '0.6rem 0.75rem' : '0.75rem 1.25rem',
                      display: 'flex', alignItems: 'center', gap: 8,
                      border: 'none', cursor: 'pointer', textAlign: 'left' as const,
                      background: isExpanded ? `${section.chapterColor}06` : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    {/* Chapter badge */}
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700,
                      color: section.chapterColor, background: `${section.chapterColor}15`,
                      padding: '2px 6px', borderRadius: 100, letterSpacing: '0.05em', flexShrink: 0,
                    }}>
                      {section.chapterRef}
                    </span>
                    {/* Label */}
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
                      color: '#1A1A2E', flex: 1,
                    }}>
                      {section.label}
                    </span>
                    {/* Augmented badge */}
                    {section.wasAugmented && (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 600,
                        color: ACCENT, background: `${ACCENT}10`, padding: '2px 6px',
                        borderRadius: 100, letterSpacing: '0.04em',
                      }}>
                        {t('improved', 'improved')}
                      </span>
                    )}
                    {/* Augmenting spinner */}
                    {section.isAugmenting && (
                      <div style={{
                        width: 14, height: 14, border: `2px solid ${section.chapterColor}30`,
                        borderTop: `2px solid ${section.chapterColor}`,
                        borderRadius: '50%', animation: 'pib-spin 0.8s linear infinite', flexShrink: 0,
                      }} />
                    )}
                    {/* Expand chevron */}
                    <svg
                      width="14" height="14" viewBox="0 0 16 16" fill="none"
                      style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: isMobile ? '0 0.75rem 0.75rem' : '0 1.25rem 1.25rem' }}>
                      {/* Editable textarea */}
                      <textarea
                        value={section.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSections((prev) => prev.map((s) =>
                            s.id === section.id ? { ...s, content: val } : s
                          ));
                        }}
                        rows={Math.max(3, section.content.split('\n').length + 1)}
                        style={{
                          width: '100%', padding: '0.75rem', fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem', lineHeight: 1.7, background: '#FEFDFB',
                          border: '1px solid rgba(26,26,46,0.08)', borderRadius: 8,
                          resize: 'vertical' as const, outline: 'none', color: '#1A1A2E',
                          boxSizing: 'border-box' as const, marginBottom: '0.5rem',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = `${section.chapterColor}40`; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)'; }}
                      />

                      {/* Augment controls */}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={augmentInput[section.id] || ''}
                            onChange={(e) => setAugmentInput((prev) => ({ ...prev, [section.id]: e.target.value }))}
                            placeholder="Tell AI how to improve this section..."
                            style={{
                              width: '100%', padding: '6px 10px', fontFamily: 'var(--font-body)',
                              fontSize: '0.78rem', background: 'transparent',
                              border: '1px solid rgba(26,26,46,0.08)', borderRadius: 6,
                              outline: 'none', color: '#1A1A2E', boxSizing: 'border-box' as const,
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && augmentInput[section.id]?.trim()) { e.preventDefault(); handleAugment(section.id); }
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleAugment(section.id)}
                          disabled={section.isAugmenting || !augmentInput[section.id]?.trim()}
                          style={{
                            padding: '6px 14px', borderRadius: 6,
                            cursor: (section.isAugmenting || !augmentInput[section.id]?.trim()) ? 'default' : 'pointer',
                            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                            background: (section.isAugmenting || !augmentInput[section.id]?.trim()) ? 'rgba(26,26,46,0.04)' : `${section.chapterColor}12`,
                            color: (section.isAugmenting || !augmentInput[section.id]?.trim()) ? '#6B728060' : section.chapterColor,
                            transition: 'all 0.2s', flexShrink: 0, letterSpacing: '0.03em',
                            border: `1px solid ${(section.isAugmenting || !augmentInput[section.id]?.trim()) ? 'rgba(26,26,46,0.06)' : `${section.chapterColor}25`}`,
                          }}
                        >
                          {section.isAugmenting ? t('improving', 'Improving...') : t('improveWithAi', 'Improve with AI')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div style={{
            padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 2rem',
            borderTop: '1px solid rgba(26,26,46,0.06)',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <button
              onClick={handleReset}
              style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid rgba(26,26,46,0.1)', background: 'transparent',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                color: '#6B7280',
              }}
            >
              {t('startOver', 'Start Over')}
            </button>
            <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#6B7280', textAlign: 'right' as const }}>
              {t('dropFileHint', 'Drop this file in your project root')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

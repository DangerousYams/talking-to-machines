import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';
import { dvhValue } from '../../../lib/css-compat';

interface LogEntry {
  step: number;
  action: string;
  tool: string;
  result: string;
  isError: boolean;
}

interface DiagnosisOption {
  label: string;
  correct: boolean;
}

interface GuardrailOption {
  label: string;
  correct: boolean;
}

interface Scenario {
  id: string;
  title: string;
  icon: string;
  goal: string;
  log: LogEntry[];
  diagnosisOptions: DiagnosisOption[];
  diagnosisExplanation: string;
  guardrailOptions: GuardrailOption[];
  guardrailExplanation: string;
  fixedLog: LogEntry[];
}

const scenarios: Scenario[] = [
  {
    id: 'infinite-loop',
    title: 'The Infinite Loop',
    icon: '\uD83D\uDD04',
    goal: 'Research renewable energy trends and write a summary report.',
    log: [
      { step: 1, action: 'Search "renewable energy trends 2025"', tool: '\uD83D\uDD0D Search', result: 'Found 8 articles on solar, wind, and battery storage trends.', isError: false },
      { step: 2, action: 'Search "solar energy market growth"', tool: '\uD83D\uDD0D Search', result: 'Found 5 more articles. Solar capacity growing 25% YoY.', isError: false },
      { step: 3, action: 'Search "wind energy cost reduction data"', tool: '\uD83D\uDD0D Search', result: 'Found 6 reports on offshore wind cost trends.', isError: false },
      { step: 4, action: 'Search "battery storage technology advances"', tool: '\uD83D\uDD0D Search', result: 'Found 4 papers on solid-state batteries.', isError: false },
      { step: 5, action: 'Search "renewable energy policy changes"', tool: '\uD83D\uDD0D Search', result: 'Found 7 articles on new government incentives.', isError: true },
      { step: 6, action: 'Search "renewable energy investment 2025"', tool: '\uD83D\uDD0D Search', result: 'Found 3 more investment reports... still searching...', isError: true },
      { step: 7, action: 'Search "green hydrogen production"', tool: '\uD83D\uDD0D Search', result: 'STUCK: Agent continues researching. Never starts writing.', isError: true },
    ],
    diagnosisOptions: [
      { label: 'The search tool is broken and returning bad results', correct: false },
      { label: 'The agent has no stopping condition \u2014 it keeps researching forever', correct: true },
      { label: 'The agent doesn\'t have access to a writing tool', correct: false },
      { label: 'The search results are too vague to use', correct: false },
    ],
    diagnosisExplanation: 'The agent has no condition that tells it "you have enough information \u2014 move on to writing." Without a maximum number of research steps or a completeness check, it just keeps searching.',
    guardrailOptions: [
      { label: 'Max iterations \u2014 limit research to 3 searches before moving on', correct: true },
      { label: 'Tool validation \u2014 check if search results are real', correct: false },
      { label: 'Confirmation step \u2014 ask the user before each search', correct: false },
      { label: 'Output verification \u2014 check if the report is factual', correct: false },
    ],
    guardrailExplanation: 'Setting a max iteration limit (e.g., 3 searches) forces the agent to transition from researching to writing. The agent can always note "areas for further research" instead of endlessly searching.',
    fixedLog: [
      { step: 1, action: 'Search "renewable energy trends 2025"', tool: '\uD83D\uDD0D Search', result: 'Found 8 articles on solar, wind, and battery storage trends.', isError: false },
      { step: 2, action: 'Search "solar and wind cost data"', tool: '\uD83D\uDD0D Search', result: 'Found cost reduction data for both sectors.', isError: false },
      { step: 3, action: 'Search "energy storage breakthroughs"', tool: '\uD83D\uDD0D Search', result: 'Found 4 papers on battery advances. [Max searches reached \u2014 moving to write]', isError: false },
      { step: 4, action: 'Write summary report from gathered sources', tool: '\u270D\uFE0F Write', result: 'Report complete: "Renewable Energy Trends" \u2014 3 sections, 450 words, cited sources.', isError: false },
    ],
  },
  {
    id: 'wrong-tool',
    title: 'The Wrong Tool',
    icon: '\uD83D\uDD27',
    goal: 'Read the project README file and summarize its key points.',
    log: [
      { step: 1, action: 'Thinking: I need to read the README.md file', tool: '\uD83E\uDDE0 Think', result: 'Plan: Search for the README file content.', isError: false },
      { step: 2, action: 'Search "README.md project documentation"', tool: '\uD83D\uDD0D Search', result: 'Found generic guides about writing README files on dev.to and GitHub docs.', isError: true },
      { step: 3, action: 'Search "README.md content this project"', tool: '\uD83D\uDD0D Search', result: 'Found unrelated README files from random GitHub repositories.', isError: true },
      { step: 4, action: 'Search "site:localhost README"', tool: '\uD83D\uDD0D Search', result: 'ERROR: Cannot search localhost. No results found.', isError: true },
      { step: 5, action: 'Failed: Cannot locate the project README file', tool: '\u274C Error', result: 'Agent gave up. Could not find the local file using web search.', isError: true },
    ],
    diagnosisOptions: [
      { label: 'The README file doesn\'t exist', correct: false },
      { label: 'The agent used web search for a local file \u2014 wrong tool entirely', correct: true },
      { label: 'The search engine is blocking the request', correct: false },
      { label: 'The agent needs more search attempts', correct: false },
    ],
    diagnosisExplanation: 'The agent tried to use web search to find a file on the local filesystem. It needed a "File Read" tool instead. This is a tool selection error \u2014 the agent picked the wrong tool for the job.',
    guardrailOptions: [
      { label: 'Max iterations \u2014 limit to 3 search attempts', correct: false },
      { label: 'Tool validation \u2014 check if the selected tool matches the task type', correct: true },
      { label: 'Confirmation step \u2014 ask the user which tool to use', correct: false },
      { label: 'Output verification \u2014 check if the summary is accurate', correct: false },
    ],
    guardrailExplanation: 'Tool validation checks whether the chosen tool is appropriate for the task. A rule like "for local files, use File Read, not Web Search" prevents this mismatch. Smart agents match task types to tool capabilities.',
    fixedLog: [
      { step: 1, action: 'Thinking: I need to read a local file \u2014 README.md', tool: '\uD83E\uDDE0 Think', result: 'Plan: Use File Read tool (not web search) for local files.', isError: false },
      { step: 2, action: 'Tool check: "Read README.md" \u2192 File Read tool \u2713', tool: '\u2705 Validate', result: 'Tool validated: File Read is correct for local filesystem access.', isError: false },
      { step: 3, action: 'Read file: ./README.md', tool: '\uD83D\uDCC4 File Read', result: 'Successfully read README.md (1,240 tokens). Contains: project overview, setup instructions, API docs.', isError: false },
      { step: 4, action: 'Write summary of README key points', tool: '\u270D\uFE0F Write', result: 'Summary complete: 3 key points \u2014 project purpose, how to install, API endpoints.', isError: false },
    ],
  },
  {
    id: 'hallucinated-action',
    title: 'The Hallucinated Action',
    icon: '\uD83D\uDC7B',
    goal: 'Check the current weather in Tokyo and format a travel advisory.',
    log: [
      { step: 1, action: 'Thinking: I need current weather data for Tokyo', tool: '\uD83E\uDDE0 Think', result: 'Plan: Call the weather API to get current conditions.', isError: false },
      { step: 2, action: 'API Call: GET https://api.weather.global/v2/tokyo/current', tool: '\uD83D\uDD27 API', result: 'ERROR 404: Endpoint not found. This API does not exist.', isError: true },
      { step: 3, action: 'API Call: GET https://weather-service.io/api/realtime?city=tokyo', tool: '\uD83D\uDD27 API', result: 'ERROR: DNS resolution failed. Domain does not exist.', isError: true },
      { step: 4, action: 'Generating weather report anyway...', tool: '\u270D\uFE0F Write', result: '"Tokyo: 72\u00B0F, partly cloudy, humidity 65%." \u26A0\uFE0F WARNING: This data is fabricated.', isError: true },
    ],
    diagnosisOptions: [
      { label: 'The weather API is temporarily down', correct: false },
      { label: 'Tokyo doesn\'t have weather data available', correct: false },
      { label: 'The agent invented fake API endpoints and then fabricated data', correct: true },
      { label: 'The API key was missing from the request', correct: false },
    ],
    diagnosisExplanation: 'The agent "hallucinated" API endpoints that don\'t exist (api.weather.global, weather-service.io). When those failed, it fabricated weather data instead of admitting it couldn\'t complete the task. Double hallucination: fake tools + fake data.',
    guardrailOptions: [
      { label: 'Max iterations \u2014 stop after 2 API failures', correct: false },
      { label: 'Tool validation \u2014 only allow calls to pre-registered, verified APIs', correct: false },
      { label: 'Confirmation step \u2014 ask the user before every API call', correct: false },
      { label: 'Output verification \u2014 verify API endpoints exist before calling and flag fabricated data', correct: true },
    ],
    guardrailExplanation: 'Output verification has two parts here: (1) validate that an API endpoint is in the agent\'s known tool registry before calling it, and (2) never present data unless it came from a verified source. If the agent can\'t get real data, it should say so.',
    fixedLog: [
      { step: 1, action: 'Thinking: I need current weather data for Tokyo', tool: '\uD83E\uDDE0 Think', result: 'Plan: Check available tools for weather data.', isError: false },
      { step: 2, action: 'Tool registry check: weather APIs available?', tool: '\u2705 Validate', result: 'Available: OpenWeatherMap API (registered). No other weather APIs in registry.', isError: false },
      { step: 3, action: 'API Call: GET openweathermap.org/data/2.5/weather?q=Tokyo', tool: '\uD83D\uDD27 API', result: 'Success: Tokyo \u2014 68\u00B0F, overcast, humidity 72%, wind 8mph NE.', isError: false },
      { step: 4, action: 'Write travel advisory from verified data', tool: '\u270D\uFE0F Write', result: 'Advisory complete: "Pack layers and an umbrella. Overcast conditions expected. Source: OpenWeatherMap."', isError: false },
    ],
  },
];

type Phase = 'diagnose' | 'guardrail' | 'fixed';

export default function FailureModesLab() {
  const [activeTab, setActiveTab] = useState(0);
  const [phase, setPhase] = useState<Phase>('diagnose');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<number | null>(null);
  const [selectedGuardrail, setSelectedGuardrail] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  const scenario = scenarios[activeTab];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = scenarios.length * 2;

  const switchTab = (index: number) => {
    setActiveTab(index);
    setPhase('diagnose');
    setSelectedDiagnosis(null);
    setSelectedGuardrail(null);
    setShowExplanation(false);
  };

  const submitDiagnosis = (index: number) => {
    setSelectedDiagnosis(index);
    const isCorrect = scenario.diagnosisOptions[index].correct;
    if (isCorrect) {
      setScores((prev) => ({ ...prev, [`${scenario.id}-diag`]: 1 }));
    }
    setShowExplanation(true);
  };

  const proceedToGuardrail = () => {
    setPhase('guardrail');
    setSelectedGuardrail(null);
    setShowExplanation(false);
  };

  const submitGuardrail = (index: number) => {
    setSelectedGuardrail(index);
    const isCorrect = scenario.guardrailOptions[index].correct;
    if (isCorrect) {
      setScores((prev) => ({ ...prev, [`${scenario.id}-guard`]: 1 }));
    }
    setShowExplanation(true);
  };

  const proceedToFixed = () => {
    setPhase('fixed');
    setShowExplanation(false);
  };

  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState<'log' | 'fixed'>('log');

  // On mobile, show truncated log (last 3 entries); full log in BottomSheet
  const logEntries = phase === 'fixed' ? scenario.fixedLog : scenario.log;
  const mobileVisibleLog = isMobile ? logEntries.slice(-3) : logEntries;

  const renderLogEntry = (entry: LogEntry, i: number) => (
    <div key={i} style={{
      padding: isMobile ? '0.4rem 0.5rem' : '0.5rem 0.75rem', marginBottom: 4, borderRadius: 6,
      background: entry.isError ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.03)',
      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>Step {entry.step}</span>
        <span style={{
          fontSize: '0.75rem', padding: '1px 6px', borderRadius: 4,
          background: entry.isError ? 'rgba(233,69,96,0.2)' : 'rgba(123,97,255,0.15)',
          color: entry.isError ? '#E94560' : '#7B61FF',
        }}>
          {entry.tool}
        </span>
      </div>
      <div style={{ color: entry.isError ? '#E94560' : '#e2e8f0' }}>
        {entry.action}
      </div>
      <div style={{ color: entry.isError ? 'rgba(233,69,96,0.7)' : 'rgba(226,232,240,0.5)', fontSize: '0.75rem', marginTop: 2 }}>
        {'\u2192'} {entry.result}
      </div>
    </div>
  );

  return (
    <div className="widget-container" style={isMobile ? { display: 'flex', flexDirection: 'column', height: '100%' } : undefined}>
      {/* Header */}
      <div style={{ padding: isMobile ? '0.75rem 1rem' : '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #E94560, #F5A623)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              Failure Modes Lab
            </h3>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
                Diagnose buggy agents. Apply the right fix.
              </p>
            )}
          </div>
          {totalScore > 0 && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
              color: '#16C79A', padding: '4px 10px', borderRadius: 8,
              background: 'rgba(22,199,154,0.08)',
            }}>
              {totalScore}/{maxScore}
            </div>
          )}
        </div>
      </div>

      {/* Scenario tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(26,26,46,0.06)',
        background: 'rgba(26,26,46,0.015)', flexShrink: 0,
        overflowX: isMobile ? 'auto' as const : undefined,
        WebkitOverflowScrolling: 'touch' as any,
      }}>
        {scenarios.map((s, i) => {
          const completed = scores[`${s.id}-diag`] !== undefined && scores[`${s.id}-guard`] !== undefined;
          return (
            <button
              key={s.id}
              onClick={() => switchTab(i)}
              style={{
                flex: isMobile ? 'none' : 1, padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.75rem' : '0.82rem', fontWeight: 600,
                transition: 'all 0.25s', position: 'relative',
                background: activeTab === i ? 'white' : 'transparent',
                color: activeTab === i ? '#1A1A2E' : '#6B7280',
                borderBottom: activeTab === i ? '2px solid #E94560' : '2px solid transparent',
                whiteSpace: isMobile ? 'nowrap' as const : undefined,
                minHeight: isMobile ? 36 : 44,
              }}
            >
              <span>{s.icon} {isMobile ? s.title.split(' ').slice(-1)[0] : s.title}</span>
              {completed && (
                <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#16C79A' }}>{'\u2713'}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scenario content */}
      <div style={isMobile ? { flex: 1, minHeight: 0, overflowY: 'auto', padding: '0.75rem 1rem' } : { padding: '1.5rem 2rem' }}>
        {/* Goal */}
        <div style={{
          padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', borderRadius: isMobile ? 8 : 10,
          background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.12)',
          marginBottom: isMobile ? 12 : 20,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#E94560',
            display: 'inline', marginRight: 6,
          }}>
            Goal:
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.82rem' : '0.9rem', color: '#1A1A2E' }}>
            {scenario.goal}
          </span>
        </div>

        {/* Execution log */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 6 : 10 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: phase === 'fixed' ? '#16C79A' : '#6B7280',
          }}>
            {phase === 'fixed' ? 'Fixed Log' : 'Execution Log'}
          </span>
          {isMobile && logEntries.length > 3 && (
            <button
              onClick={() => { setSheetContent(phase === 'fixed' ? 'fixed' : 'log'); setSheetOpen(true); }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                color: '#7B61FF', background: 'rgba(123,97,255,0.08)',
                border: '1px solid rgba(123,97,255,0.15)', borderRadius: 6,
                padding: '3px 8px', cursor: 'pointer',
              }}
            >
              View all {logEntries.length} steps
            </button>
          )}
        </div>

        <div style={{
          background: '#1A1A2E', borderRadius: isMobile ? 8 : 10, padding: isMobile ? '0.5rem' : '1rem',
          marginBottom: isMobile ? 12 : 20,
          maxHeight: isMobile ? undefined : dvhValue(40), overflowY: isMobile ? 'hidden' as const : 'auto' as const,
        }}>
          {(isMobile ? mobileVisibleLog : logEntries).map((entry, i) => renderLogEntry(entry, i))}
        </div>

        {/* Phase: Diagnose */}
        {phase === 'diagnose' && (
          <div>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 700,
              color: '#1A1A2E', marginBottom: isMobile ? 8 : 12,
            }}>
              What went wrong?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: isMobile ? 6 : 8 }}>
              {scenario.diagnosisOptions.map((option, i) => {
                const isSelected = selectedDiagnosis === i;
                const isCorrect = option.correct;
                const showResult = selectedDiagnosis !== null;

                return (
                  <button
                    key={i}
                    onClick={() => selectedDiagnosis === null && submitDiagnosis(i)}
                    disabled={selectedDiagnosis !== null}
                    style={{
                      padding: isMobile ? '0.6rem 0.75rem' : '0.75rem 1rem', borderRadius: 8, border: '1px solid',
                      textAlign: 'left' as const, cursor: selectedDiagnosis === null ? 'pointer' : 'default',
                      fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.8rem' : '0.85rem', lineHeight: 1.5,
                      minHeight: isMobile ? 40 : 44,
                      transition: 'all 0.3s',
                      background: showResult && isSelected && isCorrect ? 'rgba(22,199,154,0.06)'
                        : showResult && isSelected && !isCorrect ? 'rgba(233,69,96,0.06)'
                        : showResult && isCorrect ? 'rgba(22,199,154,0.04)'
                        : 'white',
                      borderColor: showResult && isSelected && isCorrect ? '#16C79A'
                        : showResult && isSelected && !isCorrect ? '#E94560'
                        : showResult && isCorrect ? 'rgba(22,199,154,0.3)'
                        : 'rgba(26,26,46,0.1)',
                      color: '#1A1A2E',
                      opacity: showResult && !isSelected && !isCorrect ? 0.5 : 1,
                    }}
                  >
                    {showResult && isCorrect && <span style={{ marginRight: 6 }}>{'\u2713'}</span>}
                    {showResult && isSelected && !isCorrect && <span style={{ marginRight: 6 }}>{'\u2717'}</span>}
                    {option.label}
                  </button>
                );
              })}
            </div>
            {showExplanation && (
              <div style={{
                marginTop: isMobile ? 10 : 16, padding: isMobile ? '0.75rem' : '1rem 1.25rem', borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(245,166,35,0.04))',
                border: '1px solid rgba(233,69,96,0.12)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.7,
                  color: '#1A1A2E', margin: '0 0 12px',
                }}>
                  {scenario.diagnosisExplanation}
                </p>
                <button
                  onClick={proceedToGuardrail}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none',
                    fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', background: '#E94560', color: 'white',
                    minHeight: 44,
                  }}
                >
                  Next: Apply a Fix {'\u2192'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phase: Guardrail */}
        {phase === 'guardrail' && (
          <div>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 700,
              color: '#1A1A2E', marginBottom: isMobile ? 8 : 12,
            }}>
              Which guardrail would fix this?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: isMobile ? 6 : 8 }}>
              {scenario.guardrailOptions.map((option, i) => {
                const isSelected = selectedGuardrail === i;
                const isCorrect = option.correct;
                const showResult = selectedGuardrail !== null;

                return (
                  <button
                    key={i}
                    onClick={() => selectedGuardrail === null && submitGuardrail(i)}
                    disabled={selectedGuardrail !== null}
                    style={{
                      padding: isMobile ? '0.6rem 0.75rem' : '0.75rem 1rem', borderRadius: 8, border: '1px solid',
                      textAlign: 'left' as const, cursor: selectedGuardrail === null ? 'pointer' : 'default',
                      fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.8rem' : '0.85rem', lineHeight: 1.5,
                      minHeight: isMobile ? 40 : 44,
                      transition: 'all 0.3s',
                      background: showResult && isSelected && isCorrect ? 'rgba(22,199,154,0.06)'
                        : showResult && isSelected && !isCorrect ? 'rgba(233,69,96,0.06)'
                        : showResult && isCorrect ? 'rgba(22,199,154,0.04)'
                        : 'white',
                      borderColor: showResult && isSelected && isCorrect ? '#16C79A'
                        : showResult && isSelected && !isCorrect ? '#E94560'
                        : showResult && isCorrect ? 'rgba(22,199,154,0.3)'
                        : 'rgba(26,26,46,0.1)',
                      color: '#1A1A2E',
                      opacity: showResult && !isSelected && !isCorrect ? 0.5 : 1,
                    }}
                  >
                    {showResult && isCorrect && <span style={{ marginRight: 6 }}>{'\u2713'}</span>}
                    {showResult && isSelected && !isCorrect && <span style={{ marginRight: 6 }}>{'\u2717'}</span>}
                    {option.label}
                  </button>
                );
              })}
            </div>
            {showExplanation && (
              <div style={{
                marginTop: isMobile ? 10 : 16, padding: isMobile ? '0.75rem' : '1rem 1.25rem', borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(123,97,255,0.04))',
                border: '1px solid rgba(22,199,154,0.15)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.7,
                  color: '#1A1A2E', margin: '0 0 12px',
                }}>
                  {scenario.guardrailExplanation}
                </p>
                <button
                  onClick={() => { proceedToFixed(); if (isMobile) { setSheetContent('fixed'); setSheetOpen(true); } }}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none',
                    fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', background: '#16C79A', color: 'white',
                    minHeight: 44,
                  }}
                >
                  See the Fixed Agent {'\u2192'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phase: Fixed */}
        {phase === 'fixed' && (
          <div style={{
            padding: isMobile ? '0.75rem' : '1rem 1.25rem', borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(123,97,255,0.04))',
            border: '1px solid rgba(22,199,154,0.15)',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic',
              lineHeight: 1.7, color: '#1A1A2E', margin: 0,
            }}>
              <span style={{ fontWeight: 600, color: '#16C79A', fontStyle: 'normal' }}>Fixed. </span>
              {isMobile
                ? 'The agent completes the task successfully with the guardrail.'
                : <>With the guardrail in place, the agent completes the task successfully.
                  Real agents need error handling designed in from the start &mdash; the happy path is never the only path.</>
              }
            </p>
          </div>
        )}
      </div>

      {/* Mobile BottomSheet for full execution log */}
      {isMobile && (
        <BottomSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={sheetContent === 'fixed' ? 'Fixed Execution Log' : 'Full Execution Log'}
        >
          <div style={{
            background: '#1A1A2E', borderRadius: 8, padding: '0.75rem',
          }}>
            {(sheetContent === 'fixed' ? scenario.fixedLog : scenario.log).map((entry, i) => renderLogEntry(entry, i))}
          </div>
          {sheetContent === 'fixed' && (
            <div style={{
              marginTop: 12, padding: '0.75rem', borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(22,199,154,0.04), rgba(123,97,255,0.04))',
              border: '1px solid rgba(22,199,154,0.15)',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic',
                lineHeight: 1.7, color: '#1A1A2E', margin: 0,
              }}>
                <span style={{ fontWeight: 600, color: '#16C79A', fontStyle: 'normal' }}>Fixed. </span>
                With the guardrail in place, the agent completes the task successfully.
                Real agents need error handling designed in from the start -- the happy path is never the only path.
              </p>
            </div>
          )}
        </BottomSheet>
      )}
    </div>
  );
}

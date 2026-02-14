import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface ToolExample {
  thinking: string;
  call: string;
  result: string;
  answer: string;
}

interface Tool {
  name: string;
  icon: JSX.Element;
  inputs: string;
  outputs: string;
  description: string;
  color: string;
  example: ToolExample;
}

const tools: Tool[] = [
  {
    name: 'Web Search',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    inputs: 'Search query (text)',
    outputs: 'Web results with titles, URLs, snippets',
    description: 'Fetches live information from the internet when the AI needs current data it wasn\'t trained on.',
    color: '#0EA5E9',
    example: {
      thinking: 'The user is asking about recent Mars rover findings. My training data might be outdated, so I should search for the latest information.',
      call: '{\n  "tool": "web_search",\n  "query": "latest Mars rover Perseverance findings 2025"\n}',
      result: '[\n  { "title": "Perseverance Rover Discovers New Organic Compounds",\n    "url": "nasa.gov/mars/perseverance-organics",\n    "snippet": "NASA\'s rover identified complex organic molecules in Jezero Crater sediments..." },\n  { "title": "Mars Sample Return Update",\n    "url": "space.com/mars-sample-return",\n    "snippet": "The mission timeline has been revised to prioritize..." }\n]',
      answer: 'Based on the latest reports, Perseverance has discovered complex organic molecules in Jezero Crater...',
    },
  },
  {
    name: 'Code Execution',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    inputs: 'Code (Python, JS, etc.)',
    outputs: 'Execution output, errors, generated files',
    description: 'Runs actual code in a sandboxed environment. Essential for math, data analysis, and testing.',
    color: '#7B61FF',
    example: {
      thinking: 'The user wants to know the standard deviation of this dataset. I should write Python code to calculate it precisely rather than estimating.',
      call: '{\n  "tool": "code_execution",\n  "language": "python",\n  "code": "import statistics\\ndata = [23, 45, 12, 67, 34, 89, 56]\\nprint(f\\"Mean: {statistics.mean(data):.2f}\\")\\nprint(f\\"Std Dev: {statistics.stdev(data):.2f}\\")" \n}',
      result: 'Mean: 46.57\nStd Dev: 26.19',
      answer: 'The dataset has a mean of 46.57 and a standard deviation of 26.19, indicating high variability in the values.',
    },
  },
  {
    name: 'File Read/Write',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    inputs: 'File path, content (for writing)',
    outputs: 'File contents (for reading), confirmation (for writing)',
    description: 'Reads existing files for context or creates/edits files. The backbone of coding agents.',
    color: '#16C79A',
    example: {
      thinking: 'The user wants me to update their README. Let me first read the current file to understand its structure, then write the updated version.',
      call: '{\n  "tool": "file_read",\n  "path": "README.md"\n}',
      result: '# My Project\\nA simple todo app.\\n\\n## Getting Started\\nRun `npm install`...',
      answer: 'I\'ve read your README. Now let me update it with the new API documentation section you requested...',
    },
  },
  {
    name: 'API Calls',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    inputs: 'URL, method, headers, body',
    outputs: 'API response (JSON, text, etc.)',
    description: 'Makes HTTP requests to external APIs. Connects the AI to any web service or data source.',
    color: '#E94560',
    example: {
      thinking: 'The user wants current weather data for Tokyo. I\'ll call the weather API to get real-time information.',
      call: '{\n  "tool": "api_call",\n  "method": "GET",\n  "url": "https://api.weather.com/v1/tokyo",\n  "headers": { "Authorization": "Bearer ..." }\n}',
      result: '{\n  "city": "Tokyo",\n  "temp_c": 22,\n  "condition": "Partly Cloudy",\n  "humidity": 65\n}',
      answer: 'It\'s currently 22 degrees C in Tokyo with partly cloudy skies and 65% humidity.',
    },
  },
  {
    name: 'Image Generation',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    inputs: 'Text description (prompt)',
    outputs: 'Generated image (PNG/JPG)',
    description: 'Creates images from text descriptions. Turns the AI into a visual creator, not just a writer.',
    color: '#F5A623',
    example: {
      thinking: 'The user wants a logo concept for their coffee shop. I\'ll generate an image with their specifications.',
      call: '{\n  "tool": "image_generation",\n  "prompt": "Minimal logo for a coffee shop called Ember, warm earth tones, single coffee cup with rising steam forming the letter E, clean vector style"\n}',
      result: '[Image generated: ember_logo_v1.png — 1024x1024]',
      answer: 'Here\'s a logo concept for Ember. The steam rising from the cup forms a subtle E. Want me to try variations with different styles?',
    },
  },
  {
    name: 'Calculator',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/>
      </svg>
    ),
    inputs: 'Mathematical expression',
    outputs: 'Precise numerical result',
    description: 'Performs exact arithmetic. AI language models are notoriously bad at math on their own -- this fixes that.',
    color: '#0F3460',
    example: {
      thinking: 'The user needs compound interest calculated. I shouldn\'t try to do this in my head -- I\'ll use the calculator for precision.',
      call: '{\n  "tool": "calculator",\n  "expression": "5000 * (1 + 0.065/12)^(12*10)"\n}',
      result: '9560.92',
      answer: 'With $5,000 invested at 6.5% APR compounded monthly for 10 years, you\'d have $9,560.92. Nearly doubling your money.',
    },
  },
  {
    name: 'Database Query',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    inputs: 'SQL query or natural language question',
    outputs: 'Query results (rows/columns)',
    description: 'Queries structured databases. Lets AI answer questions about your actual data, not guesses.',
    color: '#16C79A',
    example: {
      thinking: 'The user wants to know their top-selling products this quarter. I\'ll write a SQL query against their database.',
      call: '{\n  "tool": "database_query",\n  "sql": "SELECT product_name, SUM(quantity) as total_sold, SUM(revenue) as total_revenue FROM orders WHERE order_date >= \'2025-01-01\' GROUP BY product_name ORDER BY total_revenue DESC LIMIT 5"\n}',
      result: '| product_name    | total_sold | total_revenue |\n|-----------------|------------|---------------|\n| Pro Headphones  | 1,247      | $124,700      |\n| Wireless Buds   | 2,891      | $86,730       |\n| Studio Monitor  | 342        | $68,400       |',
      answer: 'Your top seller by revenue is the Pro Headphones at $124,700. But by volume, Wireless Buds are leading with 2,891 units.',
    },
  },
];

export default function ToolCatalog() {
  const isMobile = useIsMobile();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleCardClick = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      setActiveStep(0);
    } else {
      setExpandedIndex(index);
      setActiveStep(0);
    }
  };

  const steps = ['Thinking', 'Tool Call', 'Result', 'Answer'];

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{
        padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem',
        borderBottom: '1px solid rgba(26,26,46,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #F5A623, #F5A62380)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              Tool Catalog
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
              Click a tool to see the AI use it
            </p>
          </div>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>
          {tools.length} tools
        </span>
      </div>

      {/* Tool Grid */}
      <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.75rem',
        }}>
          {tools.map((tool, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div key={tool.name} style={{ gridColumn: isExpanded ? '1 / -1' : undefined }}>
                {/* Card */}
                <button
                  onClick={() => handleCardClick(i)}
                  style={{
                    width: '100%',
                    textAlign: 'left' as const,
                    padding: isMobile ? '1rem' : '1.25rem 1.25rem',
                    borderRadius: 12,
                    border: `1px solid ${isExpanded ? tool.color + '40' : 'rgba(26,26,46,0.06)'}`,
                    background: isExpanded ? tool.color + '06' : 'rgba(26,26,46,0.015)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative' as const,
                    overflow: 'hidden' as const,
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.borderColor = tool.color + '30';
                      e.currentTarget.style.boxShadow = `0 0 0 1px ${tool.color}10, 0 4px 16px ${tool.color}08`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.borderColor = 'rgba(26,26,46,0.06)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Top accent line */}
                  <div style={{
                    position: 'absolute' as const,
                    top: 0, left: '1.5rem', right: '1.5rem', height: 2,
                    background: tool.color,
                    borderRadius: 1,
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `linear-gradient(135deg, ${tool.color}18, ${tool.color}08)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: tool.color, flexShrink: 0,
                    }}>
                      {tool.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <h4 style={{
                          fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700,
                          color: tool.color, margin: 0,
                        }}>
                          {tool.name}
                        </h4>
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tool.color}
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease', opacity: 0.5, flexShrink: 0,
                          }}
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.55,
                        color: '#1A1A2E', opacity: 0.65, margin: '0 0 8px',
                      }}>
                        {tool.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' as const }}>
                        <div>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                            color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                          }}>
                            Accepts
                          </span>
                          <p style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                            color: '#1A1A2E', margin: '2px 0 0', opacity: 0.7,
                          }}>
                            {tool.inputs}
                          </p>
                        </div>
                        <div>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                            color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                          }}>
                            Returns
                          </span>
                          <p style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                            color: '#1A1A2E', margin: '2px 0 0', opacity: 0.7,
                          }}>
                            {tool.outputs}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Example */}
                {isExpanded && (
                  <div style={{
                    marginTop: '0.75rem',
                    background: 'rgba(26,26,46,0.02)',
                    border: `1px solid ${tool.color}20`,
                    borderRadius: 12,
                    padding: isMobile ? '1rem' : '1.5rem',
                    animation: 'fadeInDown 0.3s ease',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                      color: tool.color, marginBottom: '1rem',
                    }}>
                      Live Example
                    </p>

                    {/* Step indicators */}
                    <div style={{
                      display: 'flex', gap: '0.5rem', marginBottom: '1.25rem',
                      flexWrap: isMobile ? 'nowrap' as const : 'wrap' as const,
                      overflowX: isMobile ? 'auto' as const : 'visible' as const,
                      WebkitOverflowScrolling: 'touch' as const,
                      paddingBottom: isMobile ? '0.25rem' : 0,
                    }}>
                      {steps.map((step, si) => (
                        <button
                          key={step}
                          onClick={(e) => { e.stopPropagation(); setActiveStep(si); }}
                          style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600,
                            padding: isMobile ? '0.5rem 0.85rem' : '0.35rem 0.75rem', borderRadius: 100,
                            border: 'none', cursor: 'pointer',
                            background: activeStep === si ? tool.color : 'rgba(26,26,46,0.05)',
                            color: activeStep === si ? 'white' : '#6B7280',
                            transition: 'all 0.25s',
                            flexShrink: 0,
                            whiteSpace: 'nowrap' as const,
                            minHeight: isMobile ? 44 : 'auto',
                          }}
                        >
                          {si + 1}. {step}
                        </button>
                      ))}
                    </div>

                    {/* Step content */}
                    <div style={{
                      background: activeStep === 1 || activeStep === 2
                        ? 'linear-gradient(145deg, #1A1A2E 0%, #0F3460 100%)'
                        : 'var(--color-warm-white, #FEFDFB)',
                      border: activeStep === 1 || activeStep === 2
                        ? 'none'
                        : '1px solid rgba(26,26,46,0.06)',
                      borderRadius: 10,
                      padding: isMobile ? '1rem' : '1.25rem 1.5rem',
                      minHeight: 80,
                    }}>
                      {activeStep === 0 && (
                        <div>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                          }}>
                            <div style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: tool.color, opacity: 0.6,
                              animation: 'pulse 2s infinite',
                            }} />
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                              color: tool.color, letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                            }}>
                              AI Thinking
                            </span>
                          </div>
                          <p style={{
                            fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
                            color: '#1A1A2E', fontStyle: 'italic' as const, margin: 0, opacity: 0.8,
                          }}>
                            "{tool.example.thinking}"
                          </p>
                        </div>
                      )}

                      {activeStep === 1 && (
                        <div>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                            color: tool.color, letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                            display: 'block', marginBottom: 8,
                          }}>
                            Tool Call
                          </span>
                          <pre style={{
                            fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.65rem' : '0.75rem', lineHeight: 1.6,
                            color: '#e2e8f0', margin: 0, whiteSpace: 'pre-wrap' as const,
                            wordBreak: 'break-word' as const,
                            background: 'transparent', padding: 0, boxShadow: 'none',
                          }}>
                            {tool.example.call}
                          </pre>
                        </div>
                      )}

                      {activeStep === 2 && (
                        <div>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                            color: '#16C79A', letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                            display: 'block', marginBottom: 8,
                          }}>
                            Tool Result
                          </span>
                          <pre style={{
                            fontFamily: 'var(--font-mono)', fontSize: isMobile ? '0.65rem' : '0.75rem', lineHeight: 1.6,
                            color: '#e2e8f0', margin: 0, whiteSpace: 'pre-wrap' as const,
                            wordBreak: 'break-word' as const,
                            background: 'transparent', padding: 0, boxShadow: 'none',
                          }}>
                            {tool.example.result}
                          </pre>
                        </div>
                      )}

                      {activeStep === 3 && (
                        <div>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 600,
                            color: '#16C79A', letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                            display: 'block', marginBottom: 8,
                          }}>
                            AI Response
                          </span>
                          <p style={{
                            fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.65,
                            color: '#1A1A2E', margin: 0,
                          }}>
                            {tool.example.answer}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Flow diagram */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' as const,
                    }}>
                      {steps.map((step, si) => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: si <= activeStep ? tool.color : 'rgba(26,26,46,0.1)',
                            transition: 'background 0.3s ease',
                          }} />
                          {si < steps.length - 1 && (
                            <div style={{
                              width: 20, height: 1,
                              background: si < activeStep ? tool.color + '60' : 'rgba(26,26,46,0.08)',
                              transition: 'background 0.3s ease',
                            }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

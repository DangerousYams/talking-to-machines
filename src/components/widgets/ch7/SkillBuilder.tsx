import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface SkillTemplate {
  name: string;
  definition: string;
  testTask: string;
  testResult: string;
  validation: { trigger: boolean; steps: boolean; examples: boolean };
}

const templates: SkillTemplate[] = [
  {
    name: 'React Component Generator',
    definition: `# React Component Generator

When asked to create a React component:

1. Create the component file in src/components/
2. Use TypeScript with proper prop types
3. Include a default export
4. Add JSDoc comments for each prop
5. Create a basic test file in __tests__/

Example trigger: "Create a UserProfile component"

Example output structure:
\`\`\`
src/components/UserProfile.tsx
src/components/__tests__/UserProfile.test.tsx
\`\`\``,
    testTask: 'Create a UserProfile component that shows an avatar, name, and bio',
    testResult: `> Reading CLAUDE.md... found "React Component Generator" skill
> Skill matched on trigger: "Create a ... component"

Step 1: Create src/components/UserProfile.tsx
  - TypeScript with Props interface
  - Props: avatar (string), name (string), bio (string)
  - Default export

Step 2: Add JSDoc comments
  - @param avatar - URL of the user's profile image
  - @param name - Display name of the user
  - @param bio - Short biography text

Step 3: Create src/components/__tests__/UserProfile.test.tsx
  - Test: renders name correctly
  - Test: renders avatar with correct src
  - Test: renders bio text

Result: 2 files created, all types valid, 3 tests passing.`,
    validation: { trigger: true, steps: true, examples: true },
  },
  {
    name: 'Test Writer',
    definition: `# Test Writer

When asked to write tests for a file:

1. Read the source file to understand exports and logic
2. Create a test file adjacent in __tests__/ directory
3. Use describe/it blocks with clear names
4. Cover: happy path, edge cases, error handling
5. Mock external dependencies

Naming convention: [FileName].test.ts

Example trigger: "Write tests for utils/formatDate.ts"

Example test structure:
\`\`\`
describe('formatDate', () => {
  it('formats ISO date to readable string', ...)
  it('handles invalid date input', ...)
  it('respects locale parameter', ...)
})
\`\`\``,
    testTask: 'Write tests for utils/formatDate.ts',
    testResult: `> Reading CLAUDE.md... found "Test Writer" skill
> Skill matched on trigger: "Write tests for ..."

Step 1: Read utils/formatDate.ts
  - Exports: formatDate(date, locale?, options?)
  - Uses Intl.DateTimeFormat internally
  - Throws on invalid date input

Step 2: Create utils/__tests__/formatDate.test.ts
  - describe('formatDate') block

Step 3: Write test cases
  - Happy path: formatDate('2025-01-15') => 'January 15, 2025'
  - Edge case: formatDate('') => throws InvalidDateError
  - Edge case: formatDate(null) => throws InvalidDateError
  - Locale: formatDate('2025-01-15', 'fr-FR') => '15 janvier 2025'
  - Options: formatDate('2025-01-15', 'en-US', { short: true }) => 'Jan 15'

Step 4: Mock dependencies
  - No external deps to mock in this case

Result: 1 file created, 5 tests, all passing.`,
    validation: { trigger: true, steps: true, examples: true },
  },
  {
    name: 'Documentation Generator',
    definition: `# Documentation Generator

When asked to document a module or API:

1. Read all exported functions/types in the file
2. Generate a markdown doc in docs/ directory
3. Include: purpose, parameters, return types, usage examples
4. Add a table of contents if more than 3 sections
5. Link to related modules when referenced

Format: docs/[module-name].md

Example trigger: "Document the auth module"

Example section:
\`\`\`markdown
## authenticate(email, password)
Validates credentials and returns a session token.

| Param    | Type   | Required | Description      |
|----------|--------|----------|------------------|
| email    | string | yes      | User email       |
| password | string | yes      | User password    |

Returns: Promise<Session>
\`\`\``,
    testTask: 'Document the auth module',
    testResult: `> Reading CLAUDE.md... found "Documentation Generator" skill
> Skill matched on trigger: "Document the ..."

Step 1: Read src/auth/index.ts
  - Exports: authenticate, refreshToken, logout, Session type
  - References: src/auth/session.ts, src/auth/errors.ts

Step 2: Create docs/auth.md

Step 3: Generate documentation
  - Table of contents (4 sections > threshold of 3)
  - ## authenticate(email, password)
    - Param table, return type, usage example
  - ## refreshToken(token)
    - Param table, return type, usage example
  - ## logout()
    - Description, side effects
  - ## Session (type)
    - Property table

Step 4: Add cross-references
  - Link to docs/errors.md for AuthError type
  - Link to docs/session.md for session management

Result: docs/auth.md created, 4 sections, fully documented.`,
    validation: { trigger: true, steps: true, examples: true },
  },
];

export default function SkillBuilder() {
  const [activeTab, setActiveTab] = useState(0);
  const [editedDefinition, setEditedDefinition] = useState(templates[0].definition);
  const [hasEdited, setHasEdited] = useState(false);
  const isMobile = useIsMobile();

  const current = templates[activeTab];

  const switchTab = (index: number) => {
    setActiveTab(index);
    setEditedDefinition(templates[index].definition);
    setHasEdited(false);
  };

  const handleEdit = (value: string) => {
    setEditedDefinition(value);
    setHasEdited(true);
  };

  // Simple validation based on content
  const checkValidation = () => {
    const text = editedDefinition.toLowerCase();
    return {
      trigger: text.includes('when') || text.includes('trigger') || text.includes('asked'),
      steps: (text.match(/^\d+\./gm) || []).length >= 2 || (text.match(/^-/gm) || []).length >= 2,
      examples: text.includes('example') || text.includes('```'),
    };
  };

  const validation = hasEdited ? checkValidation() : current.validation;

  return (
    <div className="widget-container">
      {/* Header */}
      <div style={{ padding: isMobile ? '1.25rem 1rem 0' : '1.5rem 2rem 0', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #7B61FF80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0, lineHeight: 1.3 }}>Skill Builder</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Write reusable instructions for Claude Code</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: -1, overflowX: isMobile ? 'auto' as const : undefined, WebkitOverflowScrolling: 'touch' as any }}>
          {templates.map((t, i) => (
            <button
              key={t.name}
              onClick={() => switchTab(i)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: isMobile ? '0.65rem' : '0.7rem',
                whiteSpace: isMobile ? 'nowrap' as const : undefined,
                fontWeight: activeTab === i ? 600 : 400,
                color: activeTab === i ? '#7B61FF' : '#6B7280',
                background: activeTab === i ? 'var(--color-warm-white, #FEFDFB)' : 'transparent',
                border: activeTab === i ? '1px solid rgba(26,26,46,0.06)' : '1px solid transparent',
                borderBottom: activeTab === i ? '1px solid var(--color-warm-white, #FEFDFB)' : '1px solid transparent',
                borderRadius: '6px 6px 0 0',
                padding: '8px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Two-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: isMobile ? undefined : 420 }}>
        {/* Left: CLAUDE.md Editor */}
        <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', borderRight: isMobile ? 'none' : '1px solid rgba(26,26,46,0.06)', borderBottom: isMobile ? '1px solid rgba(26,26,46,0.06)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#7B61FF',
            }}>
              CLAUDE.md
            </span>
            {hasEdited && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: '#F5A623',
                background: 'rgba(245, 166, 35, 0.1)',
                padding: '1px 6px',
                borderRadius: 4,
              }}>
                edited
              </span>
            )}
          </div>
          <textarea
            value={editedDefinition}
            onChange={(e) => handleEdit(e.target.value)}
            style={{
              width: '100%',
              height: isMobile ? 220 : 310,
              fontFamily: 'var(--font-mono)',
              fontSize: isMobile ? '0.72rem' : '0.76rem',
              lineHeight: 1.65,
              color: '#1A1A2E',
              background: '#FEFDFB',
              border: '1px solid rgba(26,26,46,0.08)',
              borderRadius: 8,
              padding: '14px 16px',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(123, 97, 255, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123, 97, 255, 0.06)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,26,46,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {/* Validation checklist */}
          <div style={{ marginTop: 12 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginBottom: 6,
              display: 'block',
            }}>
              Validation
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { key: 'trigger' as const, label: 'Has clear trigger' },
                { key: 'steps' as const, label: 'Steps are specific' },
                { key: 'examples' as const, label: 'Includes examples' },
              ].map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: validation[item.key] ? 'rgba(22, 199, 154, 0.12)' : 'rgba(26,26,46,0.04)',
                    border: `1px solid ${validation[item.key] ? 'rgba(22, 199, 154, 0.3)' : 'rgba(26,26,46,0.08)'}`,
                    transition: 'all 0.3s ease',
                  }}>
                    {validation[item.key] && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16C79A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: validation[item.key] ? '#16C79A' : '#6B7280',
                    transition: 'color 0.3s ease',
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Test scenario */}
        <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', background: 'rgba(26,26,46,0.015)' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#6B7280',
            marginBottom: 10,
            display: 'block',
          }}>
            Test Scenario
          </span>

          {/* Test task */}
          <div style={{
            background: 'rgba(123, 97, 255, 0.04)',
            border: '1px solid rgba(123, 97, 255, 0.12)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 14,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: '#7B61FF',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 4,
            }}>
              User Request
            </span>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: '#1A1A2E',
              margin: 0,
              lineHeight: 1.5,
            }}>
              "{current.testTask}"
            </p>
          </div>

          {/* Simulated result */}
          <div style={{
            background: '#1A1A2E',
            borderRadius: 8,
            padding: isMobile ? '10px 12px' : '14px 16px',
            maxHeight: isMobile ? 260 : 340,
            overflowY: 'auto',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: isMobile ? '0.65rem' : '0.72rem',
              lineHeight: 1.7,
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap',
            }}>
              {current.testResult.split('\n').map((line, i) => {
                if (line.startsWith('>')) {
                  return <div key={i} style={{ color: '#6b7280', fontStyle: 'italic', marginBottom: 2 }}>{line}</div>;
                }
                if (line.startsWith('Step')) {
                  return <div key={i} style={{ color: '#7B61FF', marginTop: 6 }}>{line}</div>;
                }
                if (line.startsWith('Result:')) {
                  return (
                    <div key={i} style={{
                      color: '#16C79A',
                      marginTop: 8,
                      padding: '6px 10px',
                      background: 'rgba(22, 199, 154, 0.08)',
                      borderRadius: 4,
                    }}>
                      {line}
                    </div>
                  );
                }
                if (line.startsWith('  -')) {
                  return <div key={i} style={{ color: '#94a3b8', paddingLeft: 8 }}>{line}</div>;
                }
                return <div key={i} style={{ color: '#94a3b8' }}>{line}</div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

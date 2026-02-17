import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import BottomSheet from '../../cards/BottomSheet';

interface Message {
  id: number;
  text: string;
  tokens: number;
  role: 'user' | 'system';
}

const SYSTEM_PROMPT = 'You are a helpful, harmless, and honest assistant.';
const SYSTEM_TOKENS = Math.ceil(SYSTEM_PROMPT.length / 4);
const MAX_VISIBLE = 7;

const COLORS = [
  '#E94560', '#0F3460', '#16C79A', '#F5A623',
  '#0EA5E9', '#E94560', '#0F3460', '#16C79A',
  '#F5A623', '#0EA5E9',
];

export default function ContextWindowViz() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [nextId, setNextId] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Mobile-only state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState<'history' | 'detail'>('history');
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  const estimateTokens = (text: string) => Math.max(1, Math.ceil(text.length / 4));

  const visibleMessages = messages.slice(-MAX_VISIBLE);
  const droppedCount = Math.max(0, messages.length - MAX_VISIBLE);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const tokens = estimateTokens(trimmed);
    setMessages(prev => [...prev, { id: nextId, text: trimmed, tokens, role: 'user' }]);
    setNextId(prev => prev + 1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const totalVisibleTokens = SYSTEM_TOKENS + visibleMessages.reduce((s, m) => s + m.tokens, 0);

  // ==================== MOBILE LAYOUT ====================
  if (isMobile) {
    return (
      <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Compact header */}
        <div style={{ padding: '10px 1rem', borderBottom: '1px solid rgba(26,26,46,0.06)', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #7B61FF, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
              <line x1="2" y1="9" x2="22" y2="9" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>The Context Window</h3>
          </div>
          {/* Token counter badge */}
          <div style={{ flexShrink: 0, padding: '3px 8px', borderRadius: 100, background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.15)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: '#7B61FF' }}>
              {totalVisibleTokens} tok
            </span>
          </div>
        </div>

        {/* Context window visualization -- fills ~60% */}
        <div style={{ flex: 3, minHeight: 0, padding: '8px 12px', display: 'flex', flexDirection: 'column' }}>
          {/* The glass container */}
          <div ref={containerRef} style={{
            width: '100%', flex: 1, minHeight: 0, position: 'relative',
            border: '2px solid rgba(26,26,46,0.12)', borderRadius: 12,
            background: 'linear-gradient(180deg, rgba(123,97,255,0.02) 0%, rgba(26,26,46,0.02) 100%)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* System prompt - pinned at top */}
            <div style={{
              padding: '6px 10px', background: 'rgba(123,97,255,0.1)',
              borderBottom: '1px solid rgba(123,97,255,0.15)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: '#7B61FF', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>System</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#7B61FF', opacity: 0.7 }}>{SYSTEM_TOKENS} tok</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#7B61FF', margin: 0, opacity: 0.8, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                {SYSTEM_PROMPT}
              </p>
            </div>

            {/* Dropped messages indicator */}
            {droppedCount > 0 && (
              <div style={{
                padding: '4px 10px', background: 'rgba(26,26,46,0.03)',
                borderBottom: '1px dashed rgba(26,26,46,0.08)', textAlign: 'center' as const, flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', fontStyle: 'italic' }}>
                  {droppedCount} message{droppedCount > 1 ? 's' : ''} dropped
                </span>
              </div>
            )}

            {/* Visible message blocks */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '4px 6px' }}>
              {visibleMessages.length === 0 && (
                <div style={{ textAlign: 'center' as const, padding: '1rem 0.5rem', opacity: 0.3 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Empty -- type below</p>
                </div>
              )}
              {visibleMessages.map((msg) => {
                const colorIndex = (messages.indexOf(msg)) % COLORS.length;
                const color = COLORS[colorIndex];
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMsg(msg);
                      setSheetContent('detail');
                      setSheetOpen(true);
                    }}
                    style={{
                      padding: '5px 8px', marginBottom: 3, borderRadius: 6,
                      background: `${color}10`, borderLeft: `3px solid ${color}`,
                      transition: 'all 0.3s ease', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#1A1A2E',
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                        flex: 1, lineHeight: 1.3,
                      }}>
                        {msg.text}
                      </p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6B7280', flexShrink: 0, marginLeft: 6 }}>
                        {msg.tokens}t
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* History button (if messages exist) */}
        {messages.length > 0 && (
          <div style={{ padding: '0 12px', flexShrink: 0 }}>
            <button
              onClick={() => { setSheetContent('history'); setSheetOpen(true); }}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: '1px solid rgba(123,97,255,0.15)', background: 'rgba(123,97,255,0.04)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                fontWeight: 600, color: '#7B61FF', letterSpacing: '0.03em',
              }}
            >
              View all messages ({messages.length}) {droppedCount > 0 ? `-- ${droppedCount} forgotten` : ''}
            </button>
          </div>
        )}

        {/* Compact insight */}
        <div style={{ padding: '8px 12px', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontStyle: 'italic', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
            <span style={{ fontWeight: 600, color: '#7B61FF', fontStyle: 'normal' }}>Insight: </span>
            {droppedCount > 0
              ? `${droppedCount} message${droppedCount > 1 ? 's' : ''} forgotten. Tap a block for details.`
              : 'System prompt stays pinned. Other messages compete for space.'}
          </p>
        </div>

        {/* Input at bottom */}
        <div style={{ padding: '8px 12px 12px', borderTop: '1px solid rgba(26,26,46,0.06)', background: 'rgba(26,26,46,0.015)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 10,
                border: '1px solid rgba(26,26,46,0.1)', background: '#FEFDFB',
                fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#1A1A2E',
                outline: 'none', minHeight: 44,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                padding: '12px 20px', borderRadius: 10, border: 'none',
                background: input.trim() ? '#7B61FF' : 'rgba(26,26,46,0.08)',
                color: input.trim() ? 'white' : '#6B7280',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                letterSpacing: '0.03em', minHeight: 44,
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* BottomSheet */}
        <BottomSheet
          isOpen={sheetOpen}
          onClose={() => { setSheetOpen(false); setSelectedMsg(null); }}
          title={sheetContent === 'detail' ? 'Message Detail' : 'All Messages'}
        >
          {sheetContent === 'detail' && selectedMsg && (
            <div>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(123,97,255,0.05)', border: '1px solid rgba(123,97,255,0.1)', marginBottom: 12 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, color: '#1A1A2E' }}>
                  {selectedMsg.text}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#7B61FF', fontWeight: 600 }}>
                  {selectedMsg.tokens} tokens
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>
                  Message #{selectedMsg.id}
                </span>
                {messages.indexOf(selectedMsg) < droppedCount && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#E94560', fontWeight: 600 }}>
                    FORGOTTEN
                  </span>
                )}
              </div>
            </div>
          )}
          {sheetContent === 'history' && (
            <div>
              {messages.map((msg, i) => {
                const isDropped = i < droppedCount;
                const color = COLORS[i % COLORS.length];
                return (
                  <div
                    key={msg.id}
                    style={{
                      padding: '10px 12px', marginBottom: 8, borderRadius: 8,
                      background: isDropped ? 'rgba(26,26,46,0.03)' : 'rgba(123,97,255,0.04)',
                      opacity: isDropped ? 0.5 : 1,
                      borderLeft: `3px solid ${isDropped ? 'rgba(26,26,46,0.15)' : color}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: isDropped ? '#6B7280' : '#1A1A2E', margin: 0, lineHeight: 1.5, flex: 1 }}>
                        {msg.text}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>{msg.tokens} tok</span>
                        {isDropped && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#E94560', fontWeight: 600 }}>GONE</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#6B7280', fontStyle: 'italic', textAlign: 'center' as const }}>
                  No messages yet. Start typing above.
                </p>
              )}
            </div>
          )}
        </BottomSheet>
      </div>
    );
  }

  // ==================== DESKTOP LAYOUT (unchanged) ====================
  return (
    <div className="widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(26,26,46,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7B61FF, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
              <line x1="2" y1="9" x2="22" y2="9" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>The Context Window</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>Type messages and watch the window fill up</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', flex: 1, minHeight: 0 }}>
        {/* Left: The visual container */}
        <div style={{ padding: '1.5rem', borderRight: '1px solid rgba(26,26,46,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#7B61FF', marginBottom: 12 }}>
            Context Window
          </span>

          {/* The glass container */}
          <div ref={containerRef} style={{
            width: '100%', maxWidth: 220, flex: 1,
            minHeight: 0, position: 'relative',
            border: '2px solid rgba(26,26,46,0.12)', borderRadius: 12,
            background: 'linear-gradient(180deg, rgba(123,97,255,0.02) 0%, rgba(26,26,46,0.02) 100%)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* System prompt - pinned at top */}
            <div style={{
              padding: '8px 12px', background: 'rgba(123,97,255,0.1)',
              borderBottom: '1px solid rgba(123,97,255,0.15)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: '#7B61FF', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>System</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#7B61FF', opacity: 0.7 }}>{SYSTEM_TOKENS} tok</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#7B61FF', margin: 0, opacity: 0.8, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                {SYSTEM_PROMPT}
              </p>
            </div>

            {/* Bracket label */}
            <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateX(100%) translateY(-50%)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 1, height: 60, background: 'rgba(123,97,255,0.3)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: -3, width: 7, height: 1, background: 'rgba(123,97,255,0.3)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: -3, width: 7, height: 1, background: 'rgba(123,97,255,0.3)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#7B61FF', opacity: 0.6, writingMode: 'vertical-rl' as const, textOrientation: 'mixed' as const, letterSpacing: '0.05em' }}>
                AI SEES THIS
              </span>
            </div>

            {/* Dropped messages indicator */}
            {droppedCount > 0 && (
              <div style={{
                padding: '6px 12px', background: 'rgba(26,26,46,0.03)',
                borderBottom: '1px dashed rgba(26,26,46,0.08)', textAlign: 'center' as const,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic' }}>
                  {droppedCount} message{droppedCount > 1 ? 's' : ''} dropped
                </span>
              </div>
            )}

            {/* Visible message blocks */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '6px' }}>
              {visibleMessages.length === 0 && (
                <div style={{ textAlign: 'center' as const, padding: '2rem 1rem', opacity: 0.3 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Empty — type a message below</p>
                </div>
              )}
              {visibleMessages.map((msg, i) => {
                const colorIndex = (messages.indexOf(msg)) % COLORS.length;
                const color = COLORS[colorIndex];
                return (
                  <div
                    key={msg.id}
                    style={{
                      padding: '6px 10px', marginBottom: 4, borderRadius: 6,
                      background: `${color}10`, borderLeft: `3px solid ${color}`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#1A1A2E',
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                        maxWidth: 130, lineHeight: 1.4,
                      }}>
                        {msg.text}
                      </p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280', flexShrink: 0, marginLeft: 6 }}>
                        {msg.tokens}t
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Token counter */}
          <div style={{ marginTop: 12, textAlign: 'center' as const }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280' }}>
              Visible: <strong style={{ color: '#7B61FF' }}>{totalVisibleTokens}</strong> tokens
            </span>
            {messages.length > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6B7280', display: 'block', marginTop: 2 }}>
                Total sent: {SYSTEM_TOKENS + messages.reduce((s, m) => s + m.tokens, 0)} tokens
              </span>
            )}
          </div>
        </div>

        {/* Right: Chat input and message list */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Messages log */}
          <div style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto' as const, maxHeight: '35dvh' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6B7280', display: 'block', marginBottom: 12 }}>
              Your Messages
            </span>
            {messages.length === 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#6B7280', fontStyle: 'italic', margin: 0 }}>
                Start typing messages below. Watch the context window fill up on the left. After {MAX_VISIBLE} messages, the oldest ones will start to disappear -- that is the AI "forgetting."
              </p>
            )}
            {messages.map((msg, i) => {
              const isDropped = i < droppedCount;
              return (
                <div
                  key={msg.id}
                  style={{
                    padding: '8px 12px', marginBottom: 6, borderRadius: 8,
                    background: isDropped ? 'rgba(26,26,46,0.03)' : 'rgba(123,97,255,0.04)',
                    opacity: isDropped ? 0.4 : 1,
                    transition: 'opacity 0.3s ease',
                    borderLeft: isDropped ? '2px solid rgba(26,26,46,0.1)' : `2px solid ${COLORS[i % COLORS.length]}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: isDropped ? '#6B7280' : '#1A1A2E', margin: 0, lineHeight: 1.5 }}>
                      {msg.text}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#6B7280' }}>{msg.tokens} tok</span>
                      {isDropped && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#E94560', fontWeight: 600 }}>GONE</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(26,26,46,0.06)', background: 'rgba(26,26,46,0.015)' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  border: '1px solid rgba(26,26,46,0.1)', background: '#FEFDFB',
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#1A1A2E',
                  outline: 'none', minHeight: 44,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: input.trim() ? '#7B61FF' : 'rgba(26,26,46,0.08)',
                  color: input.trim() ? 'white' : '#6B7280',
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                  cursor: input.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.03em', minHeight: 44,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insight bar */}
      <div style={{
        padding: '1rem 2rem', borderTop: '1px solid rgba(26,26,46,0.06)',
        background: 'linear-gradient(135deg, rgba(123,97,255,0.04), rgba(14,165,233,0.04))',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic', color: '#1A1A2E', margin: 0 }}>
          <span style={{ fontWeight: 600, color: '#7B61FF', fontStyle: 'normal' }}>Key insight: </span>
          {droppedCount > 0
            ? `The AI has "forgotten" ${droppedCount} of your messages. It is not being forgetful -- those messages simply are not in the window anymore. This is why long conversations can lose coherence.`
            : 'The system prompt stays pinned at the top. Everything else competes for space. Once the window fills up, early messages vanish from the AI\'s view.'}
        </p>
      </div>
    </div>
  );
}

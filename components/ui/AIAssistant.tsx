'use client';
import { useState } from 'react';

const suggestions = [
  'Office wear', 'Round face', 'Under ₹3,000', 'Blue-light glasses',
  'Lightweight frames', 'Cat-eye', 'Kids glasses', 'Premium sunglasses',
];

const mockResponses: Record<string, string> = {
  'Office wear': 'I found 6 professional frames perfect for office settings — clean rectangles and refined metals.',
  'Round face': 'For round faces, angular frames like rectangles or cat-eye shapes work beautifully. Here are my top 5.',
  'Under ₹3,000': 'Great choice — 8 stylish frames under ₹3,000 with full prescription support.',
  'Blue-light glasses': 'I found 5 blue-light frames with premium filtering. Perfect for long screen sessions.',
  'Lightweight frames': 'Our 4 lightest frames (under 15g) — you\'ll barely know you\'re wearing them.',
  'Cat-eye': '5 cat-eye styles in our collection. A timeless, flattering choice for most faces.',
  'Kids glasses': '4 durable kids\' frames with flexible TR90 — built for active young lives.',
  'Premium sunglasses': 'Our 5 most premium sunglasses with UV400 and polarized lenses.',
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I\'m your StyleMe assistant. What kind of glasses are you looking for?' },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    const response = mockResponses[text] || `I found some great options for "${text}". Let me show you the best matches from our collection.`;
    setMessages((m) => [
      ...m,
      { role: 'user', text },
      { role: 'ai', text: response },
    ]);
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '5rem', right: '1.5rem',
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--color-forest)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(32,56,46,0.35)', zIndex: 100,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
        title="AI Shopping Assistant"
      >
        <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="ai-chat-panel" style={{
          position: 'fixed', bottom: '9rem', right: '1.5rem',
          width: '340px', maxHeight: '460px',
          background: 'white', borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', zIndex: 100,
          border: '1px solid rgba(0,0,0,0.08)',
        }}>
          {/* Header */}
          <div style={{ background: 'var(--color-forest)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>StyleMe AI</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>Shopping Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '0.625rem 0.875rem',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: m.role === 'user' ? 'var(--color-forest)' : 'var(--color-sand)',
                  color: m.role === 'user' ? 'white' : 'var(--color-espresso)',
                  fontSize: '0.85rem', lineHeight: 1.5,
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Suggestions */}
            {messages.length === 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: '50px',
                      border: '1px solid rgba(32,56,46,0.2)',
                      background: 'transparent', cursor: 'pointer',
                      fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--color-forest)';
                      (e.currentTarget as HTMLElement).style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-forest)';
                    }}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              style={{
                flex: 1, padding: '0.6rem 0.875rem',
                border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '50px',
                fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              onClick={() => send(input)}
              style={{
                background: 'var(--color-forest)', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

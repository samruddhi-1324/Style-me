'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { AiService } from '@/lib/services/aiService';
import { Product } from '@/lib/types/product';

const suggestions = [
  'Office wear', 'Round face', 'Under ₹3,000', 'Blue-light glasses',
  'Lightweight frames', 'Cat-eye', 'Kids glasses', 'Premium sunglasses',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  recommendedProducts?: Product[];
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      text: "Hi! I'm your StyleMe AI assistant. What style, face shape, or price range are you looking for today?",
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await AiService.generateAssistantResponse(textToSend);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.text,
        recommendedProducts: response.recommendedProducts,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'ai', text: 'I am sorry, something went wrong. Please try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open AI Shopping Assistant"
        aria-expanded={open}
        style={{
          position: 'fixed', bottom: '5rem', right: '1.5rem',
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--color-forest)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(32,56,46,0.35)', zIndex: 100,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        title="AI Shopping Assistant"
      >
        <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </button>

      {/* Chat panel modal */}
      {open && (
        <div
          role="dialog"
          aria-label="AI Shopping Assistant Panel"
          style={{
            position: 'fixed', bottom: '9rem', right: '1.5rem',
            width: '360px', maxWidth: 'calc(100vw - 3rem)', height: '480px',
            background: 'white', borderRadius: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.18)', zIndex: 101,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem', background: 'var(--color-forest)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                }}
              >
                ✨
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>StyleMe AI Assistant</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Styling & Fit Expert</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          </div>

          {/* Messages body */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '0.75rem 1rem',
                  borderRadius: m.role === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                  background: m.role === 'user' ? 'var(--color-forest)' : '#F3F4F6',
                  color: m.role === 'user' ? 'white' : '#111827',
                  fontSize: '0.85rem',
                  lineHeight: 1.45,
                }}
              >
                <div>{m.text}</div>
                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {m.recommendedProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          background: 'white', padding: '0.4rem 0.6rem', borderRadius: '0.5rem',
                          border: '1px solid #E5E7EB', textDecoration: 'none', color: '#111827',
                          fontSize: '0.78rem', fontWeight: 500,
                        }}
                      >
                        <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </span>
                        <span style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '0.5rem 0.8rem', background: '#F3F4F6', borderRadius: '1rem', fontSize: '0.78rem', color: '#6B7280' }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div
            style={{
              padding: '0.5rem 0.75rem', display: 'flex', gap: '0.4rem',
              overflowX: 'auto', borderTop: '1px solid #F3F4F6', background: '#FAFAFA',
            }}
          >
            {suggestions.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                style={{
                  whiteSpace: 'nowrap', padding: '0.3rem 0.6rem', borderRadius: '1rem',
                  border: '1px solid #E5E7EB', background: 'white', fontSize: '0.72rem',
                  cursor: 'pointer', color: '#374151',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid #E5E7EB', background: 'white' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about frames, fit, style..."
              aria-label="Message assistant"
              style={{
                flex: 1, padding: '0.5rem 0.8rem', borderRadius: '0.5rem',
                border: '1px solid #D1D5DB', fontSize: '0.82rem', outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              style={{
                padding: '0.5rem 0.9rem', borderRadius: '0.5rem',
                background: 'var(--color-forest)', color: 'white', border: 'none',
                fontWeight: 600, fontSize: '0.82rem', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.6 : 1,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

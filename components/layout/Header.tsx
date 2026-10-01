'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { gsap } from 'gsap';

const navLinks = [
  { label: 'Eyeglasses', href: '/shop?category=Eyeglasses' },
  { label: 'Sunglasses', href: '/shop?category=Sunglasses' },
  { label: 'Collections', href: '/collections' },
  { label: 'Try-On', href: '/try-on' },
  { label: 'Style Finder', href: '/style-finder' },
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartCount = useStore((s) => s.cartCount());
  const wishlist = useStore((s) => s.wishlist);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Search history state
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('styleme_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      /* ignore */
    }
  }, []);

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('styleme_recent_searches', JSON.stringify(updated));
    } catch (e) {
      /* ignore */
    }
  };

  // Natural Language Search Parser (Phase 17)
  const parseNLQuery = (query: string) => {
    const q = query.toLowerCase();
    const parsed: { price?: number; shape?: string; color?: string; category?: string; lens?: string } = {};

    // Price
    const priceMatch = q.match(/under\s*₹?\s*(\d+)|below\s*₹?\s*(\d+)|<\s*₹?\s*(\d+)/i);
    if (priceMatch) {
      const p = Number(priceMatch[1] || priceMatch[2] || priceMatch[3]);
      if (p) parsed.price = p;
    }

    // Shape
    if (q.includes('round')) parsed.shape = 'Round';
    else if (q.includes('square')) parsed.shape = 'Square';
    else if (q.includes('cat-eye') || q.includes('cateye')) parsed.shape = 'Cat-Eye';
    else if (q.includes('oval')) parsed.shape = 'Oval';
    else if (q.includes('aviator')) parsed.shape = 'Aviator';
    else if (q.includes('rectangle') || q.includes('rectangular')) parsed.shape = 'Rectangle';

    // Color
    if (q.includes('black')) parsed.color = 'Black';
    else if (q.includes('brown') || q.includes('tortoise')) parsed.color = 'Brown';
    else if (q.includes('gold')) parsed.color = 'Gold';
    else if (q.includes('silver')) parsed.color = 'Silver';
    else if (q.includes('blue')) parsed.color = 'Blue';
    else if (q.includes('clear') || q.includes('transparent')) parsed.color = 'Transparent';

    // Category / Lens
    if (q.includes('blue light') || q.includes('bluelight') || q.includes('computer')) parsed.category = 'Blue-light';
    else if (q.includes('sun') || q.includes('sunglasses')) parsed.category = 'Sunglasses';
    else if (q.includes('kid') || q.includes('kids')) parsed.category = 'Kids';
    else if (q.includes('eyeglasses') || q.includes('frame')) parsed.category = 'Eyeglasses';

    return parsed;
  };

  const parsedQuery = searchQuery.length > 2 ? parseNLQuery(searchQuery) : null;
  const hasParsedCriteria = parsedQuery && (parsedQuery.price || parsedQuery.shape || parsedQuery.color || parsedQuery.category);

  const executeSearch = (term: string) => {
    addRecentSearch(term);
    const parsed = parseNLQuery(term);
    const params = new URLSearchParams();
    params.set('q', term);
    if (parsed.price) params.set('maxPrice', String(parsed.price));
    if (parsed.shape) params.set('shape', parsed.shape);
    if (parsed.color) params.set('color', parsed.color);
    if (parsed.category) params.set('category', parsed.category);
    setSearchOpen(false);
    window.location.href = `/shop?${params.toString()}`;
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        Free shipping above ₹999 &nbsp;·&nbsp; Easy returns &nbsp;·&nbsp; Prescription-ready frames
      </div>

      {/* Header */}
      <header
        ref={headerRef}
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(248,245,239,0.97)' : 'rgba(248,245,239,0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
          transition: 'all 0.35s ease',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '62px', gap: '1rem' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.55rem', fontWeight: 600, color: 'var(--color-plum)', letterSpacing: '-0.01em' }}>
              Style<span style={{ color: 'var(--color-terracotta)' }}>Me</span>
            </span>
            <span style={{ fontSize: '0.52rem', letterSpacing: '0.22em', color: 'var(--color-sage)', fontWeight: 600, textTransform: 'uppercase' }}>EYEWEAR</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: '1.5rem', flex: 1, justifyContent: 'center' }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-espresso)',
                  letterSpacing: '0.02em', transition: 'color 0.2s',
                  padding: '0.25rem 0', borderBottom: '1.5px solid transparent',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--color-terracotta)';
                  (e.target as HTMLElement).style.borderBottomColor = 'var(--color-terracotta)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--color-espresso)';
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Utility Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginLeft: 'auto' }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', padding: '0.4rem', display: 'flex', alignItems: 'center' }}
              aria-label="Search"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </button>

            {/* Account — desktop only */}
            <Link href="/account" style={{ color: 'var(--color-espresso)', padding: '0.4rem', display: 'flex', alignItems: 'center' }} aria-label="Account" className="desktop-nav">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </Link>

            {/* Wishlist — desktop only */}
            <Link href="/wishlist" style={{ position: 'relative', color: 'var(--color-espresso)', padding: '0.4rem', display: 'flex', alignItems: 'center' }} aria-label="Wishlist" className="desktop-nav">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" />
              </svg>
              {mounted && wishlist.length > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-coral)', color: 'white', width: '15px', height: '15px', borderRadius: '50%', fontSize: '0.58rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', padding: '0.4rem', display: 'flex', alignItems: 'center' }}
              aria-label="Cart"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" />
              </svg>
              {mounted && cartCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-coral)', color: 'white', width: '15px', height: '15px', borderRadius: '50%', fontSize: '0.58rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-espresso)', padding: '0.4rem', display: 'flex', alignItems: 'center' }}
              className="mobile-menu-btn"
              aria-label="Menu"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                {menuOpen
                  ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  : <><line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" /><line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" /><line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" /></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Search Overlay (Phases 17 & 22) */}
        {searchOpen && (
          <div style={{
            borderTop: '1px solid rgba(0,0,0,0.06)', padding: '1.25rem 1rem 1.75rem',
            background: 'rgba(248,245,239,0.98)', backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          }}>
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <input
                  ref={searchInputRef}
                  autoFocus
                  type="text"
                  placeholder='Try natural search: "black round glasses under ₹3000"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '3rem', paddingRight: '2.5rem', height: '48px', fontSize: '0.95rem' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) executeSearch(searchQuery);
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                />
                <svg width="18" height="18" fill="none" stroke="var(--color-sage)" strokeWidth="1.8" viewBox="0 0 24 24"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '1rem' }}
                  >✕</button>
                )}
              </div>

              {/* Natural Language Interpreted Filters Badge (Phase 17) */}
              {hasParsedCriteria && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(32,56,46,0.06), rgba(198,106,85,0.06))',
                  border: '1px solid rgba(32,56,46,0.15)',
                  borderRadius: 'var(--radius-md)', padding: '0.6rem 0.875rem',
                  marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    ✨ Interpreted Filters:
                  </span>
                  {parsedQuery?.category && <span className="badge badge-sage">Category: {parsedQuery.category}</span>}
                  {parsedQuery?.shape && <span className="badge badge-sage">Shape: {parsedQuery.shape}</span>}
                  {parsedQuery?.color && <span className="badge badge-sage">Color: {parsedQuery.color}</span>}
                  {parsedQuery?.price && <span className="badge badge-sage">Max Price: ₹{parsedQuery.price.toLocaleString('en-IN')}</span>}
                </div>
              )}

              {/* Search Suggestions & History (Phase 22) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', paddingTop: '0.5rem' }}>
                {/* Popular searches */}
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '0.6rem' }}>
                    Popular Searches
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {[
                      'Round glasses',
                      'Black frames',
                      'Blue light',
                      'Sunglasses',
                      'Frames under ₹3000',
                      'Cat-Eye',
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { setSearchQuery(tag); executeSearch(tag); }}
                        style={{
                          background: 'white', border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: '50px', padding: '0.35rem 0.75rem', fontSize: '0.78rem',
                          color: 'var(--color-espresso)', cursor: 'pointer', transition: 'all 0.2s',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-forest)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-forest)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-espresso)'; }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-sage)' }}>
                        Recent Searches
                      </p>
                      <button
                        onClick={() => { setRecentSearches([]); localStorage.removeItem('styleme_recent_searches'); }}
                        style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: 'var(--color-muted)', cursor: 'pointer' }}
                      >Clear</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => { setSearchQuery(term); executeSearch(term); }}
                          style={{
                            textAlign: 'left', background: 'none', border: 'none',
                            padding: '0.3rem 0', fontSize: '0.82rem', color: 'var(--color-plum)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                          }}
                        >
                          <span style={{ color: 'var(--color-muted)' }}>🕒</span> {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile drawer menu */}
        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(248,245,239,0.98)', backdropFilter: 'blur(20px)',
              zIndex: 200, padding: '1.5rem 1.5rem',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.55rem', fontWeight: 600, color: 'var(--color-plum)' }}>
                Style<span style={{ color: 'var(--color-terracotta)' }}>Me</span>
              </span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-espresso)' }}>✕</button>
            </div>

            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', padding: '1.1rem 0',
                  fontSize: '1.3rem', fontWeight: 500,
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  color: 'var(--color-espresso)',
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >{link.label}</Link>
            ))}

            <Link href="/shop?category=Blue-light" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '1.1rem 0', fontSize: '1.3rem', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'var(--color-espresso)', fontFamily: "'Cormorant Garamond', serif" }}>Blue-light</Link>
            <Link href="/shop?category=Kids" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '1.1rem 0', fontSize: '1.3rem', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'var(--color-espresso)', fontFamily: "'Cormorant Garamond', serif" }}>Kids</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '1.1rem 0', fontSize: '1.3rem', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'var(--color-espresso)', fontFamily: "'Cormorant Garamond', serif" }}>About</Link>

            <div style={{ display: 'flex', gap: '0.875rem', marginTop: '2rem' }}>
              <Link href="/account" className="btn-outline" onClick={() => setMenuOpen(false)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}>
                👤 Account
              </Link>
              <Link href="/wishlist" className="btn-secondary" onClick={() => setMenuOpen(false)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}>
                ❤️ Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ''}
              </Link>
            </div>

            {/* Promo card */}
            <div style={{ marginTop: '2rem', background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ fontWeight: 700, color: 'var(--color-plum)', marginBottom: '0.4rem' }}>✨ New: StyleFinder™</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-sage)', marginBottom: '0.875rem' }}>Answer 4 questions, find your perfect frame.</p>
              <Link href="/style-finder" className="btn-primary" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.8rem', padding: '0.6rem 1.25rem' }}>
                Take the quiz →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}


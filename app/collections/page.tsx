'use client';
import Link from 'next/link';
import { categories } from '@/data/products';

const collections = [
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    subtitle: 'Fresh from the studio',
    description: 'The newest additions to our collection — styles crafted for those who set trends, not follow them.',
    href: '/shop?sort=newest',
    accent: 'var(--color-terracotta)',
    bg: 'linear-gradient(135deg, #F5E8E0 0%, #EDD5C8 100%)',
    frameColor: '#C66A55',
    badge: 'Just In',
  },
  {
    id: 'bestsellers',
    title: 'Bestsellers',
    subtitle: 'Loved by thousands',
    description: 'Our most-ordered frames — trusted by customers across India for their timeless style and perfect fit.',
    href: '/shop?sort=popular',
    accent: 'var(--color-forest)',
    bg: 'linear-gradient(135deg, #E0EBE4 0%, #CDE0D4 100%)',
    frameColor: '#20382E',
    badge: '⭐ Top Rated',
  },
  {
    id: 'limited',
    title: 'Limited Edition',
    subtitle: 'Rare. Refined. Yours.',
    description: 'Exclusive designs in limited runs. Once they\'re gone, they\'re gone. Own something truly unique.',
    href: '/shop',
    accent: 'var(--color-plum)',
    bg: 'linear-gradient(135deg, #EDE0F5 0%, #DDD0EE 100%)',
    frameColor: '#4D1F5E',
    badge: '✦ Exclusive',
  },
  {
    id: 'summer',
    title: 'Summer Edit',
    subtitle: 'Sun-ready frames',
    description: 'Lightweight, UV-protective sunglasses and transition lenses built for India\'s brightest days.',
    href: '/shop?category=Sunglasses',
    accent: '#C8A200',
    bg: 'linear-gradient(135deg, #FFF3D0 0%, #FFE8A0 100%)',
    frameColor: '#C8A200',
    badge: '☀️ Seasonal',
  },
];

const collectionHighlights = [
  {
    id: 'eyeglasses',
    name: 'Eyeglasses',
    tagline: 'Prescription-perfect clarity',
    count: 40,
    href: '/shop?category=Eyeglasses',
    color: 'var(--color-espresso)',
    bg: 'var(--color-cream)',
  },
  {
    id: 'sunglasses',
    name: 'Sunglasses',
    tagline: 'UV protection, styled right',
    count: 24,
    href: '/shop?category=Sunglasses',
    color: '#1A3250',
    bg: '#E8F0FA',
  },
  {
    id: 'blue-light',
    name: 'Blue-light',
    tagline: 'Screens on, strain off',
    count: 20,
    href: '/shop?category=Blue-light',
    color: '#1E3A6B',
    bg: '#E8ECFA',
  },
  {
    id: 'kids',
    name: 'Kids',
    tagline: 'Built for growing eyes',
    count: 16,
    href: '/shop?category=Kids',
    color: '#5E3020',
    bg: '#FAF0E8',
  },
];

function FrameSVG({ color, shape = 'rectangle' }: { color: string; shape?: string }) {
  if (shape === 'round') {
    return (
      <svg width="120" height="56" viewBox="0 0 120 56" fill="none">
        <ellipse cx="32" cy="28" rx="24" ry="22" stroke={color} strokeWidth="3.5" fill="rgba(255,255,255,0.45)" />
        <ellipse cx="88" cy="28" rx="24" ry="22" stroke={color} strokeWidth="3.5" fill="rgba(255,255,255,0.45)" />
        <path d="M56 28 Q60 22 64 28" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <line x1="0" y1="28" x2="8" y2="28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="112" y1="28" x2="120" y2="28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="140" height="56" viewBox="0 0 140 56" fill="none">
      <rect x="6" y="12" width="50" height="32" rx="7" stroke={color} strokeWidth="3.5" fill="rgba(255,255,255,0.45)" />
      <rect x="84" y="12" width="50" height="32" rx="7" stroke={color} strokeWidth="3.5" fill="rgba(255,255,255,0.45)" />
      <path d="M56 28 Q70 20 84 28" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <line x1="0" y1="28" x2="6" y2="28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="134" y1="28" x2="140" y2="28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function CollectionsPage() {
  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, var(--color-plum) 0%, #1A0F1E 100%)',
        padding: '6rem 0 5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(198,106,85,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(113,130,118,0.1)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>StyleMe Eyewear</p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'white', lineHeight: 1.1, marginBottom: '1.25rem' }}>
            Our Collections
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.15rem', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Curated eyewear for every face, every mood, every moment.
          </p>
          <Link href="/shop" className="btn-primary">Browse All Frames →</Link>
        </div>
      </div>

      {/* Category grid */}
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Shop by Category</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '2.5rem' }}>Find the perfect frame for every need.</p>

        <div className="collections-cat-grid grid-4" style={{ gap: '1.25rem' }}>
          {collectionHighlights.map((cat) => (
            <Link key={cat.id} href={cat.href} style={{
              background: cat.bg,
              borderRadius: 'var(--radius-xl)',
              padding: '2rem 1.5rem',
              textDecoration: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <FrameSVG color={cat.color} shape={cat.id === 'kids' ? 'round' : 'rectangle'} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontFamily: "'Cormorant Garamond', serif", color: cat.color, marginBottom: '0.4rem' }}>{cat.name}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)', marginBottom: '0.875rem', lineHeight: 1.5 }}>{cat.tagline}</p>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cat.color, background: 'rgba(0,0,0,0.06)', padding: '0.25rem 0.75rem', borderRadius: '50px' }}>
                {cat.count}+ styles
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature collections */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Featured Collections</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '2.5rem' }}>Thoughtfully curated for every kind of style seeker.</p>

        <div className="collections-feat-grid grid-2" style={{ gap: '1.5rem' }}>
          {collections.map((col, i) => (
            <Link
              key={col.id}
              href={col.href}
              style={{
                background: col.bg,
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                textDecoration: 'none',
                display: 'flex', flexDirection: 'column',
                border: '1px solid rgba(0,0,0,0.05)',
                minHeight: '260px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.35s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 64px rgba(0,0,0,0.12)`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              {/* Badge */}
              <span style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                background: col.accent, color: 'white',
                padding: '0.3rem 0.75rem', borderRadius: '50px',
              }}>{col.badge}</span>

              {/* Frame illustration */}
              <div style={{ marginBottom: 'auto', paddingBottom: '1.5rem' }}>
                <FrameSVG color={col.frameColor} shape={i % 2 === 1 ? 'round' : 'rectangle'} />
              </div>

              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: col.accent, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{col.subtitle}</p>
                <h3 style={{ fontSize: '1.75rem', color: 'var(--color-espresso)', marginBottom: '0.625rem', lineHeight: 1.2 }}>{col.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-sage)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{col.description}</p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  fontSize: '0.85rem', fontWeight: 700, color: col.accent,
                }}>
                  Shop now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Style Finder CTA */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-forest), #1A3025)', padding: '4rem 0', marginBottom: '0' }}>
        <div className="container collections-cta-grid grid-2" style={{ gap: '3rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>AI-Powered</p>
            <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '2.25rem', lineHeight: 1.2 }}>
              Not sure where to start?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1rem' }}>
              Our StyleFinder quiz analyzes your face shape, style preferences and lifestyle to recommend frames you'll genuinely love.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/style-finder" className="btn-primary">Take the Quiz →</Link>
              <Link href="/try-on" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600 }}>
                Or try frames on →
              </Link>
            </div>
          </div>
          <div className="collections-cta-frames" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['var(--color-terracotta)', 'var(--color-sage)', '#8B5E3C', '#4A7C59'].map((color, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)',
                padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)',
                transform: i % 2 === 1 ? 'translateY(12px)' : 'none',
              }}>
                <FrameSVG color={color} shape={i % 2 === 0 ? 'rectangle' : 'round'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

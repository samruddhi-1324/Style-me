'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from '@/components/product/ProductCard';
import { products, categories } from '@/data/products';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const trustItems = [
  { icon: '📋', label: 'Prescription-ready', desc: 'All frames support prescriptions' },
  { icon: '🔒', label: 'Secure checkout', desc: 'Encrypted payments' },
  { icon: '↩️', label: 'Easy returns', desc: '10-day return policy' },
  { icon: '✅', label: 'Quality checked', desc: 'Every frame inspected' },
  { icon: '💡', label: 'Transparent pricing', desc: 'No hidden charges' },
];

const howItWorks = [
  { step: '01', title: 'Choose a frame', desc: 'Browse 100+ frames by style, fit, material and price.' },
  { step: '02', title: 'Check the fit', desc: 'See exact measurements and how they suit your face shape.' },
  { step: '03', title: 'Configure your lenses', desc: 'Pick lens type, index, coatings and enter your prescription.' },
  { step: '04', title: 'Get your pair', desc: 'Delivered to your door in 3–5 business days.' },
];

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(headingRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(subRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
      .fromTo(ctaRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.4')
      .fromTo(floatRef.current, { scale: 0.8, opacity: 0, x: 60 }, { scale: 1, opacity: 1, x: 0, duration: 1 }, '-=0.8')
      .fromTo(card1Ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
      .fromTo(card2Ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3');

    // Category scroll animations
    gsap.utils.toArray<HTMLElement>('.cat-card').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: i * 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        }
      );
    });

    gsap.utils.toArray<HTMLElement>('.product-card-anim').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: i * 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%' }
        }
      );
    });

    gsap.utils.toArray<HTMLElement>('.diff-card').forEach((el) => {
      gsap.fromTo(el,
        { y: 50, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8,
          scrollTrigger: { trigger: el, start: 'top 85%' }
        }
      );
    });

    gsap.utils.toArray<HTMLElement>('.step-card').forEach((el, i) => {
      gsap.fromTo(el,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: i * 0.15,
          scrollTrigger: { trigger: el, start: 'top 88%' }
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight: '92vh',
        background: 'linear-gradient(145deg, var(--color-ivory) 0%, var(--color-cream) 60%, var(--color-sand) 100%)',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
        paddingTop: '3rem', paddingBottom: '3rem',
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198,106,85,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(113,130,118,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          {/* Left */}
          <div className="hero-content">
            <span className="tag" style={{ display: 'block', marginBottom: '1rem' }}>
              ✦ India's premium eyewear store
            </span>

            <h1 ref={headingRef} style={{ marginBottom: '1.5rem', lineHeight: 1.1 }}>
              See the<br />
              <em style={{ color: 'var(--color-terracotta)', fontStyle: 'italic' }}>better</em> you.
            </h1>

            <p ref={subRef} style={{
              fontSize: '1.1rem', color: 'var(--color-sage)', lineHeight: 1.8,
              maxWidth: '420px', marginBottom: '2.5rem',
            }}>
              Find frames that match your style, understand your fit, preview lens thickness and build your perfect pair.
            </p>

            <div ref={ctaRef} className="hero-cta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/try-on" className="btn-primary" style={{ fontSize: '0.95rem', padding: '1rem 2.25rem' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" /><path d="M20 12c0 0-3.6 6-8 6s-8-6-8-6 3.6-6 8-6 8 6 8 6z" />
                </svg>
                Try on virtually
              </Link>
              <Link href="/shop" className="btn-outline" style={{ fontSize: '0.95rem', padding: '1rem 2.25rem' }}>
                Shop frames →
              </Link>
            </div>

            {/* Micro stats */}
            <div className="hero-badges" style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem' }}>
              {[['100+', 'Frames'], ['₹999+', 'Free shipping'], ['10-day', 'Returns']].map(([val, lab]) => (
                <div key={lab}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>{val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-sage)', letterSpacing: '0.04em' }}>{lab}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating elements */}
          <div ref={floatRef} className="hero-visual" style={{ position: 'relative', height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Main hero visual */}
            <div style={{
              width: '380px', height: '380px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-sand) 0%, var(--color-cream) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.1)',
            }}>
              {/* 3D floating glasses */}
              <div className="float-animation" style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
              }}>
                <svg width="260" height="130" viewBox="0 0 260 130" fill="none" style={{ filter: 'drop-shadow(0 20px 30px rgba(36,21,38,0.15))' }}>
                  <rect x="20" y="30" width="95" height="65" rx="12" fill="rgba(255,255,255,0.7)" stroke="#8B5E3C" strokeWidth="7" />
                  <rect x="145" y="30" width="95" height="65" rx="12" fill="rgba(255,255,255,0.7)" stroke="#8B5E3C" strokeWidth="7" />
                  <path d="M115 62 Q130 55 145 62" stroke="#8B5E3C" strokeWidth="6" strokeLinecap="round" fill="none" />
                  <path d="M20 55 Q10 50 5 57" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
                  <path d="M240 55 Q250 50 255 57" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
                  {/* Lens tint */}
                  <rect x="20" y="30" width="95" height="65" rx="12" fill="rgba(139,94,60,0.06)" />
                  <rect x="145" y="30" width="95" height="65" rx="12" fill="rgba(139,94,60,0.06)" />
                </svg>
              </div>
            </div>

            {/* Floating card 1 — Fit in mm */}
            <div ref={card1Ref} className="float-reverse" style={{
              position: 'absolute', top: '10%', left: '-10%',
              background: 'white', borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.25rem',
              boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.06)',
              minWidth: '170px',
            }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-sage)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                📐 Fit in millimetres
              </p>
              {[['Frame Width', '142 mm'], ['Lens Height', '48 mm'], ['Bridge', '20 mm']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{k}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-plum)' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.75rem', background: 'rgba(113,130,118,0.12)', borderRadius: '50px', display: 'inline-block' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-forest)' }}>✓ Good Fit</span>
              </div>
            </div>

            {/* Floating card 2 — Lens thickness */}
            <div ref={card2Ref} className="float-animation-slow" style={{
              position: 'absolute', bottom: '10%', right: '-8%',
              background: 'white', borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.25rem',
              boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.06)',
              minWidth: '160px',
            }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-sage)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                🔬 Lens thickness
              </p>
              {['1.50', '1.60', '1.67'].map((idx, i) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <div style={{
                    height: '6px', width: `${30 - i * 6}px`,
                    background: i === 1 ? 'var(--color-forest)' : 'var(--color-sand)',
                    borderRadius: '3px',
                  }} />
                  <span style={{ fontSize: '0.72rem', color: i === 1 ? 'var(--color-forest)' : 'var(--color-muted)', fontWeight: i === 1 ? 700 : 400 }}>{idx}</span>
                </div>
              ))}
            </div>

            {/* Decorative dot cluster */}
            <div style={{ position: 'absolute', top: '5%', right: '5%' }}>
              {[...Array(9)].map((_, i) => (
                <div key={i} style={{
                  display: 'inline-block', width: '6px', height: '6px',
                  borderRadius: '50%', background: 'var(--color-sage)',
                  margin: '3px',
                  opacity: 0.3 + (i % 3) * 0.2,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Responsive mobile override */}
        <style>{`
          @media (max-width: 768px) {
            section { padding-top: 2rem !important; }
            section > div.container { grid-template-columns: 1fr !important; gap: 2rem !important; }
            section > div.container > div:last-child { height: 280px !important; }
          }
        `}</style>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ background: 'var(--color-plum)', padding: '1.25rem 0', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {trustItems.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.85)' }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.label}</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="tag">Browse by category</span>
            <h2 style={{ marginTop: '0.5rem' }}>Find your frame</h2>
          </div>
          <div className="cat-grid grid-4" style={{ gap: '1.5rem' }}>
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.name}`}
                className="cat-card shine-effect"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: i === 0 ? 'linear-gradient(145deg, #EDE5D9, #DCC5BE)' :
                    i === 1 ? 'linear-gradient(145deg, #D4DDD7, #C8D5CB)' :
                    i === 2 ? 'linear-gradient(145deg, #D9CDE4, #CBBFD8)' :
                    'linear-gradient(145deg, #E8DDD5, #DDD3CA)',
                  display: 'block',
                  transition: 'all 0.35s ease',
                  border: '1px solid rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Category frame illustration */}
                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <CategorySVG category={cat.name} />
                </div>
                <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.3rem', fontWeight: 600,
                    color: 'var(--color-plum)', marginBottom: '0.25rem',
                  }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-sage)', marginBottom: '0.75rem' }}>{cat.description}</p>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-terracotta)' }}>
                    Shop now →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED FRAMES ── */}
      <section className="section" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="tag">Handpicked for you</span>
              <h2 style={{ marginTop: '0.5rem' }}>Frames worth noticing</h2>
            </div>
            <Link href="/shop" className="btn-outline">View all →</Link>
          </div>
          <div className="grid-4" style={{ gap: '1.5rem' }}>
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card-anim">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFFERENTIATORS ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="tag">Why StyleMe is different</span>
            <h2 style={{ marginTop: '0.5rem' }}>Fashion on the surface,<br />precision underneath.</h2>
          </div>
          <div className="grid-3" style={{ gap: '2rem' }}>

            {/* Fit in MM */}
            <div className="diff-card card" style={{ padding: '2rem', borderTop: '3px solid var(--color-sage)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(113,130,118,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>📐</div>
                <div>
                  <h4>Fit in Millimetres</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-sage)' }}>Get the perfect fit, with precise measurements for your face.</p>
                </div>
              </div>
              <div style={{ background: 'var(--color-ivory)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }}>
                {[['Frame Width', '142 mm'], ['Lens Height', '48 mm'], ['Bridge Width', '20 mm'], ['Temple Length', '145 mm']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{k}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-plum)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '80px', height: '8px', background: 'var(--color-sand)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', background: 'var(--color-sage)', borderRadius: '4px' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-forest)' }}>✓ Good Fit</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                Approx. 2 mm wider than your recommended fit.
              </p>
            </div>

            {/* Lens Thickness */}
            <div className="diff-card card" style={{ padding: '2rem', borderTop: '3px solid var(--color-terracotta)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(198,106,85,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🔬</div>
                <div>
                  <h4>Lens Thickness Preview</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-sage)' }}>See how thick your lenses will be, per lens index.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { idx: '1.50', label: 'Standard', mm: 6.8, w: 80 },
                  { idx: '1.56', label: 'Thin', mm: 5.9, w: 68 },
                  { idx: '1.60', label: 'Thin+', mm: 5.2, w: 58, active: true },
                  { idx: '1.67', label: 'High Index', mm: 4.4, w: 46 },
                  { idx: '1.74', label: 'Ultra Thin', mm: 3.9, w: 38 },
                ].map(({ idx, label, mm, w, active }) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: active ? 'var(--color-plum)' : 'var(--color-muted)', width: '36px' }}>{idx}</span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--color-sand)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${w}%`, height: '100%', background: active ? 'var(--color-terracotta)' : 'var(--color-sage)', borderRadius: '4px', transition: 'width 0.5s ease', opacity: active ? 1 : 0.5 }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', width: '38px' }}>{mm}mm</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>Estimated for demonstration purposes.</p>
            </div>

            {/* Transparent Pricing */}
            <div className="diff-card card" style={{ padding: '2rem', borderTop: '3px solid var(--color-plum)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(36,21,38,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>💡</div>
                <div>
                  <h4>Transparent Pricing</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-sage)' }}>Know exactly what you're paying for.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { label: 'Frame', amount: '₹2,999' },
                  { label: 'Single Vision Lens', amount: '₹1,500' },
                  { label: 'Anti-glare coating', amount: 'Free' },
                  { label: 'Blue-light filter', amount: '₹1,000' },
                ].map(({ label, amount }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-espresso)' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: amount === 'Free' ? 'var(--color-forest)' : 'var(--color-espresso)' }}>{amount}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid var(--color-plum)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-plum)' }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>₹5,499</span>
                </div>
                <div style={{ background: 'rgba(113,130,118,0.1)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 600, textAlign: 'center' }}>
                    🚚 Free shipping included
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-plum) 0%, #3D1F42 50%, var(--color-terracotta) 100%)',
        padding: '4rem 0',
      }}>
        <div className="container grid-2" style={{ gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
              Limited offer
            </span>
            <h2 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '0.5rem' }}>
              Get 10% Off
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', marginBottom: '2rem' }}>
              Your first order — use code <strong style={{ color: 'white' }}>STYLEME10</strong>
            </p>
            <Link href="/shop" className="btn-primary" style={{ background: 'white', color: 'var(--color-plum)' }}>
              Shop now →
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="float-animation" style={{
              perspective: '800px',
            }}>
              <svg width="220" height="110" viewBox="0 0 220 110" fill="none" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}>
                <rect x="14" y="22" width="80" height="55" rx="14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="5" />
                <rect x="126" y="22" width="80" height="55" rx="14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="5" />
                <path d="M94 49 Q110 42 126 49" stroke="rgba(255,255,255,0.5)" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M14 45 Q6 42 2 48" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
                <path d="M206 45 Q214 42 218 48" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="tag">Simple process</span>
            <h2 style={{ marginTop: '0.5rem' }}>How it works</h2>
          </div>
          <div className="grid-4" style={{ gap: '2rem', position: 'relative' }}>
            {/* Connector line */}
            <div className="desktop-only" style={{
              position: 'absolute', top: '32px', left: '12.5%', right: '12.5%',
              height: '1px', background: 'linear-gradient(90deg, var(--color-sage), var(--color-terracotta))',
              opacity: 0.3, zIndex: 0,
            }} />

            {howItWorks.map((step) => (
              <div key={step.step} className="step-card" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '64px', height: '64px',
                  background: 'white', borderRadius: '50%',
                  border: '2px solid var(--color-sage)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.25rem', fontWeight: 600,
                  color: 'var(--color-plum)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                  {step.step}
                </div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-plum)', fontFamily: 'Inter, sans-serif', fontSize: '1rem' }}>{step.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-sage)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/shop" className="btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}>
              Start shopping →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CategorySVG({ category }: { category: string }) {
  const colors: Record<string, string> = {
    'Eyeglasses': '#8B5E3C',
    'Sunglasses': '#292626',
    'Blue-light': '#5B7FA6',
    'Kids': '#C66A55',
  };
  const c = colors[category] || '#8B5E3C';

  if (category === 'Sunglasses') {
    return (
      <svg width="140" height="70" viewBox="0 0 140 70" fill="none" className="float-animation-slow">
        <path d="M8 20 Q10 14 16 14 L52 14 Q58 14 57 25 Q57 46 35 46 Q16 46 8 32 Z" fill={`${c}20`} stroke={c} strokeWidth="4" />
        <path d="M132 20 Q130 14 124 14 L88 14 Q82 14 83 25 Q83 46 105 46 Q124 46 132 32 Z" fill={`${c}20`} stroke={c} strokeWidth="4" />
        <path d="M57 20 Q70 14 83 20" stroke={c} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M8 26 Q4 23 2 27" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <path d="M132 26 Q136 23 138 27" stroke={c} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === 'Blue-light') {
    return (
      <svg width="140" height="70" viewBox="0 0 140 70" fill="none" className="float-animation-slow">
        <rect x="10" y="18" width="52" height="34" rx="8" fill={`${c}15`} stroke={c} strokeWidth="4" />
        <rect x="78" y="18" width="52" height="34" rx="8" fill={`${c}15`} stroke={c} strokeWidth="4" />
        <path d="M62 35 Q70 30 78 35" stroke={c} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M10 30 Q5 27 2 32" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <path d="M130 30 Q135 27 138 32" stroke={c} strokeWidth="3" strokeLinecap="round" />
        {/* Glow effect */}
        <rect x="10" y="18" width="52" height="34" rx="8" fill="rgba(91,127,166,0.12)" />
      </svg>
    );
  }

  if (category === 'Kids') {
    return (
      <svg width="130" height="65" viewBox="0 0 130 65" fill="none" className="float-animation-slow">
        <rect x="8" y="16" width="46" height="30" rx="10" fill={`${c}20`} stroke={c} strokeWidth="4" />
        <rect x="76" y="16" width="46" height="30" rx="10" fill={`${c}20`} stroke={c} strokeWidth="4" />
        <path d="M54 30 Q65 25 76 30" stroke={c} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M8 26 Q3 23 1 28" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <path d="M122 26 Q127 23 129 28" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="20" r="4" fill={c} opacity="0.2" />
        <circle cx="100" cy="20" r="4" fill={c} opacity="0.2" />
      </svg>
    );
  }

  return (
    <svg width="150" height="75" viewBox="0 0 150 75" fill="none" className="float-animation-slow">
      <rect x="10" y="18" width="55" height="38" rx="8" fill={`${c}15`} stroke={c} strokeWidth="4.5" />
      <rect x="85" y="18" width="55" height="38" rx="8" fill={`${c}15`} stroke={c} strokeWidth="4.5" />
      <path d="M65 37 Q75 31 85 37" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M10 30 Q5 27 2 32" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M140 30 Q145 27 148 32" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

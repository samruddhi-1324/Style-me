'use client';
import Link from 'next/link';

const timeline = [
  { year: '2018', title: 'The Beginning', desc: 'Founded in Pune by two optometrists frustrated by opaque pricing and one-size-fits-all glasses shopping.' },
  { year: '2020', title: 'First 10,000 Customers', desc: 'Launched prescription-ready frames with home try-on. Grew to 10,000 satisfied customers across India.' },
  { year: '2022', title: 'AI Try-On Launch', desc: 'Launched our virtual try-on technology, letting customers see frames on their own face from anywhere.' },
  { year: '2024', title: 'StyleFinder™', desc: 'Introduced our AI face shape analysis and style quiz, making personalized recommendations accessible to all.' },
  { year: '2026', title: 'Premium & Growing', desc: 'Now serving 500,000+ customers with 200+ frame styles, transparent pricing, and next-day delivery.' },
];

const values = [
  { icon: '🔍', title: 'Radical Transparency', desc: 'Every price, every component, every trade-off — visible to you before you pay. No surprises, ever.' },
  { icon: '🏺', title: 'Craft Over Speed', desc: 'Our frames are made with premium acetate, titanium and memory metals. Each pair is inspected before shipping.' },
  { icon: '🤖', title: 'Tech for Humans', desc: 'AI that recommends, not manipulates. Virtual try-on to genuinely help — not just a gimmick.' },
  { icon: '🌱', title: 'Sustainable Choices', desc: 'Eco-friendly acetate from plant-based materials. Packaging that\'s 100% recyclable. Business that doesn\'t cost the Earth.' },
];

const team = [
  { name: 'Priya Mehta', role: 'Co-founder & CEO', avatar: 'P', bg: 'linear-gradient(135deg, #DCC5BE, #C8A882)' },
  { name: 'Arjun Kapoor', role: 'Co-founder & CTO', avatar: 'A', bg: 'linear-gradient(135deg, #CDE0D4, #A8C4B2)' },
  { name: 'Anika Singh', role: 'Head of Design', avatar: 'A', bg: 'linear-gradient(135deg, #D9CDE4, #C4B0D8)' },
  { name: 'Rohan Desai', role: 'Chief Optometrist', avatar: 'R', bg: 'linear-gradient(135deg, #E8F0FA, #B0C4D8)' },
];

const stats = [
  { value: '500K+', label: 'Happy Customers' },
  { value: '200+', label: 'Frame Styles' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '1-Day', label: 'Avg. Dispatch' },
];

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, var(--color-plum) 0%, #1A0F1E 50%, #20382E 100%)',
        padding: '7rem 0 6rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.05 }}>
          <svg width="800" height="300" viewBox="0 0 800 300" fill="none">
            <rect x="50" y="60" width="280" height="160" rx="40" stroke="white" strokeWidth="16" fill="none" />
            <rect x="470" y="60" width="280" height="160" rx="40" stroke="white" strokeWidth="16" fill="none" />
            <path d="M330 140 Q400 100 470 140" stroke="white" strokeWidth="14" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Our Story</p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'white', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            We believe everyone<br />deserves perfect vision — and<br />beautiful style.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
            StyleMe was born from a simple frustration: glasses shopping was opaque, uncomfortable, and overpriced. We set out to change that — one perfectly fitted pair at a time.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'var(--color-cream)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '2.5rem 0' }}>
        <div className="container about-stats-grid grid-4" style={{ gap: '0' }}>
          {stats.map((stat, i) => (
            <div key={stat.label} style={{
              textAlign: 'center', padding: '1.5rem',
              borderRight: i < stats.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
            }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.75rem', fontWeight: 700, color: 'var(--color-plum)', lineHeight: 1, marginBottom: '0.5rem' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-sage)', fontWeight: 600 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="container" style={{ padding: '5rem 0' }}>
        <div className="about-mission-grid grid-2" style={{ gap: '5rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--color-terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>Our Mission</p>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              See the world clearly, in a frame that&apos;s truly yours.
            </h2>
            <p style={{ color: 'var(--color-sage)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              We started StyleMe because the traditional optical industry was broken. Inflated markups, confusing jargon, and a complete lack of transparency had left millions of Indians paying too much for glasses that didn&apos;t fit.
            </p>
            <p style={{ color: 'var(--color-sage)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '2rem' }}>
              We built StyleMe with radical transparency as our north star — every component of every pair priced and explained, so you can make an informed choice. No pressure. No hidden fees.
            </p>
            <Link href="/shop" className="btn-primary">Explore our frames →</Link>
          </div>
          {/* Visual illustration */}
          <div className="about-mission-tiles grid-2" style={{ gap: '1.25rem' }}>
            {[
              { bg: 'var(--color-cream)', label: 'Acetate frames', color: '#8B5E3C' },
              { bg: '#E8F0FA', label: 'Titanium frames', color: '#2A5F8A' },
              { bg: '#E8ECFA', label: 'Blue-light lenses', color: '#3A4A9E' },
              { bg: 'rgba(217,205,228,0.5)', label: 'Kids collection', color: '#6B3A8A' },
            ].map(({ bg, label, color }) => (
              <div key={label} style={{
                background: bg, borderRadius: 'var(--radius-lg)', padding: '1.75rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem',
                border: '1px solid rgba(0,0,0,0.05)',
              }}>
                <svg width="80" height="42" viewBox="0 0 80 42" fill="none">
                  <rect x="3" y="7" width="28" height="26" rx="5" stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.5)" />
                  <rect x="49" y="7" width="28" height="26" rx="5" stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.5)" />
                  <path d="M31 20 Q40 14 49 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-espresso)', textAlign: 'center' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ background: 'var(--color-cream)', padding: '5rem 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>What we stand for</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '3rem' }}>The values that guide every decision at StyleMe.</p>
          <div className="about-values-grid grid-4" style={{ gap: '1.5rem' }}>
            {values.map((v) => (
              <div key={v.title} style={{
                background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.25s',
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
              >
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{v.icon}</div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--color-plum)', marginBottom: '0.75rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-sage)', lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="container" style={{ padding: '5rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Our Journey</h2>
        <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '3.5rem' }}>From a small Pune garage to 500,000 happy customers.</p>
        <div className="about-timeline-center" style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(0,0,0,0.08)', transform: 'translateX(-50%)' }} />
          {timeline.map((item, i) => (
            <div key={item.year} style={{
              display: 'flex', gap: '2rem', marginBottom: '2.5rem',
              flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
              alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-terracotta)', textTransform: 'uppercase' }}>{item.year}</span>
                <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--color-plum)', margin: '0.25rem 0 0.5rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-sage)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
              <div className="about-timeline-dot" style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--color-plum)', border: '3px solid var(--color-cream)',
                boxShadow: '0 0 0 2px var(--color-plum)',
                marginTop: '1.25rem', zIndex: 1,
              }} />
              <div style={{ flex: 1 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={{ background: 'var(--color-cream)', padding: '5rem 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>The Team</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '3rem' }}>Passionate people building the future of eyewear.</p>
          <div className="about-team-flex" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            {team.map((member) => (
              <div key={member.name} style={{ textAlign: 'center', width: '180px' }}>
                <div style={{
                  width: '96px', height: '96px', borderRadius: '50%',
                  background: member.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem', fontWeight: 700,
                  fontFamily: "'Cormorant Garamond', serif",
                  color: 'var(--color-espresso)',
                  border: '3px solid rgba(0,0,0,0.06)',
                }}>
                  {member.avatar}
                </div>
                <p style={{ fontWeight: 700, color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>{member.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'var(--color-forest)', padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '2.5rem' }}>Ready to find your perfect pair?</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>Join 500,000+ customers who see the world more clearly.</p>
          <div className="about-cta-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/shop" className="btn-primary">Shop Frames →</Link>
            <Link href="/style-finder" className="btn-outline" style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Take the Style Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

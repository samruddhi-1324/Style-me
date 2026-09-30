'use client';
import Link from 'next/link';

const footerLinks = {
  Shop: [
    { label: 'Eyeglasses', href: '/shop?category=Eyeglasses' },
    { label: 'Sunglasses', href: '/shop?category=Sunglasses' },
    { label: 'Collections', href: '/collections' },
    { label: 'Kids', href: '/shop?category=Kids' },
    { label: 'Blue-light', href: '/shop?category=Blue-light' },
  ],
  Discover: [
    { label: 'Style Finder', href: '/style-finder' },
    { label: 'Virtual Try-On', href: '/try-on' },
    { label: 'Lens Configurator', href: '/lens-configurator' },
    { label: 'About StyleMe', href: '/about' },
    { label: 'Our Story', href: '/about' },
  ],
  Help: [
    { label: 'Contact Us', href: '#' },
    { label: 'Shipping', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Warranty', href: '#' },
    { label: 'FAQs', href: '#' },
  ],
  Account: [
    { label: 'My Account', href: '/account' },
    { label: 'Orders', href: '/account' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Cart', href: '/cart' },
    { label: 'Saved Prescriptions', href: '/account' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-plum)', color: 'rgba(255,255,255,0.85)', paddingTop: '2.5rem', paddingBottom: '1.25rem', marginTop: '3rem' }}>
      <div className="container">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div className="footer-brand">
            <Link href="/" style={{ display: 'block', marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 600, color: 'white', lineHeight: 1 }}>
                Style<span style={{ color: 'var(--color-terracotta)' }}>Me</span>
              </div>
              <div style={{ fontSize: '0.52rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.15rem' }}>EYEWEAR</div>
            </Link>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '1rem' }}>
              See how your glasses will look, fit and feel — in millimetres and rupees — before you pay.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {['instagram', 'facebook', 'twitter', 'youtube'].map((s) => (
                <a key={s} href="#" style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem',
                  transition: 'all 0.2s', fontWeight: 700,
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-terracotta)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-terracotta)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  {s[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
                {section}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} style={{
                      fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)',
                      transition: 'color 0.2s',
                    }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'white'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'}
                    >{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', fontFamily: 'Inter, sans-serif' }}>
              Stay in touch
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>Get exclusive offers and updates.</p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="email"
                placeholder="Your email address"
                style={{
                  flex: 1, padding: '0.5rem 0.75rem',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '50px', color: 'white', fontSize: '0.8rem',
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                }}
              />
              <button style={{
                background: 'var(--color-terracotta)', border: 'none', borderRadius: '50px',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}>
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>© 2026 StyleMe Eyewear. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {['Privacy', 'Terms', 'Refund Policy'].map((item) => (
              <a key={item} href="#" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}
              >{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

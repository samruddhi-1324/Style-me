'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';

const navItems = [
  {
    label: 'Home', href: '/',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>,
  },
  {
    label: 'Shop', href: '/shop',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>,
  },
  {
    label: 'Try On', href: '/try-on',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M20 12c0 0-3.6 6-8 6s-8-6-8-6 3.6-6 8-6 8 6 8 6z" /></svg>,
    special: true,
  },
  {
    label: 'Wishlist', href: '/wishlist',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
  },
  {
    label: 'Cart', href: '/cart',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" /></svg>,
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const cartCount = useStore((s) => s.cartCount());

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(248,245,239,0.95)', backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(0,0,0,0.08)',
      display: 'none', alignItems: 'center', justifyContent: 'space-around',
      padding: '0.6rem 0 calc(0.6rem + env(safe-area-inset-bottom))',
      zIndex: 200,
    }} className="mobile-bottom-nav">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              position: 'relative',
              ...(item.special ? {
                background: 'var(--color-terracotta)', color: 'white',
                width: '52px', height: '52px', borderRadius: '50%',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(198,106,85,0.4)',
                marginBottom: '0.5rem',
              } : {
                color: active ? 'var(--color-terracotta)' : 'var(--color-sage)',
                padding: '0.25rem 0.5rem',
              }),
            }}
          >
            {item.icon}
            {!item.special && (
              <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.04em' }}>{item.label}</span>
            )}
            {item.label === 'Cart' && cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                background: 'var(--color-coral)', color: 'white',
                width: '16px', height: '16px', borderRadius: '50%',
                fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </Link>
        );
      })}

      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: flex !important; }
          body { padding-bottom: 70px; }
        }
      `}</style>
    </nav>
  );
}

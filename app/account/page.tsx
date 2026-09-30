'use client';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { products } from '@/data/products';

const mockOrders = [
  { id: 'SM20260912', date: 'Sep 12, 2026', items: ['Willow Tortoise', 'Focus Pro'], total: 7499, status: 'Delivered' },
  { id: 'SM20260804', date: 'Aug 04, 2026', items: ['Sunrise Rose'], total: 5399, status: 'Delivered' },
  { id: 'SM20260628', date: 'Jun 28, 2026', items: ['Cobalt Shield'], total: 4499, status: 'Delivered' },
];

const mockPrescriptions = [
  { name: 'My Prescription – Sep 2026', date: 'Sep 10, 2026', preview: 'R: -2.00 / L: -1.75' },
  { name: 'Old Prescription – Jan 2026', date: 'Jan 15, 2026', preview: 'R: -1.75 / L: -1.50' },
];

export default function AccountPage() {
  const { wishlist } = useStore();
  const wishlisted = products.filter((p) => wishlist.includes(p.id)).slice(0, 4);

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-plum), #3D1F42)', padding: '3rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: 'white',
            fontFamily: "'Cormorant Garamond', serif",
          }}>S</div>
          <div>
            <h2 style={{ color: 'white', fontSize: '1.75rem', marginBottom: '0.25rem' }}>Samruddhi Patil</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>samruddhi@styleme.in</p>
            <span className="badge" style={{ background: 'rgba(198,106,85,0.3)', color: 'var(--color-terracotta)', border: '1px solid rgba(198,106,85,0.4)' }}>
              ✦ StyleMe Premium Member
            </span>
          </div>
          <div className="account-stats" style={{ marginLeft: 'auto', display: 'flex', gap: '2rem' }}>
            {[['3', 'Orders'], [`${wishlist.length}`, 'Saved'], ['2', 'Prescriptions']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container account-layout" style={{ paddingTop: '2.5rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '3rem', alignItems: 'flex-start' }}>

        {/* Sidebar nav */}
        <nav className="account-sidebar" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
          {[
            ['👤', 'Profile'],
            ['📦', 'Orders'],
            ['📋', 'Prescriptions'],
            ['❤️', 'Wishlist'],
            ['📍', 'Addresses'],
            ['⚙️', 'Preferences'],
          ].map(([icon, label]) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 0.875rem', borderRadius: '10px', cursor: 'pointer',
              color: label === 'Orders' ? 'var(--color-forest)' : 'var(--color-espresso)',
              background: label === 'Orders' ? 'rgba(32,56,46,0.08)' : 'transparent',
              fontWeight: label === 'Orders' ? 700 : 400,
              fontSize: '0.875rem', transition: 'all 0.2s', marginBottom: '0.25rem',
            }}>
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </nav>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Orders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-plum)' }}>Recent Orders</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {mockOrders.map((order) => (
                <div key={order.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '36px', background: 'var(--color-cream)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
                      <rect x="2" y="4" width="13" height="11" rx="3" stroke="var(--color-espresso)" strokeWidth="2" fill="rgba(255,255,255,0.5)" />
                      <rect x="21" y="4" width="13" height="11" rx="3" stroke="var(--color-espresso)" strokeWidth="2" fill="rgba(255,255,255,0.5)" />
                      <path d="M15 9.5 Q18 7.5 21 9.5" stroke="var(--color-espresso)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-espresso)', fontFamily: 'monospace' }}>{order.id}</span>
                      <span className="badge badge-sage" style={{ fontSize: '0.65rem' }}>✓ {order.status}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                      {order.items.join(', ')} · {order.date}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>₹{order.total.toLocaleString('en-IN')}</p>
                    <button style={{ fontSize: '0.75rem', color: 'var(--color-terracotta)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Reorder →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions */}
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-plum)', marginBottom: '1.25rem' }}>Saved Prescriptions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {mockPrescriptions.map((rx) => (
                <div key={rx.name} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', background: 'rgba(217,205,228,0.4)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📋</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>{rx.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>{rx.preview} · Added {rx.date}</p>
                  </div>
                  <button style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50px', padding: '0.35rem 0.875rem', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--color-espresso)', fontFamily: 'Inter, sans-serif' }}>
                    Use this
                  </button>
                </div>
              ))}
              <button className="btn-outline" style={{ alignSelf: 'flex-start' }}>+ Add prescription</button>
            </div>
          </div>

          {/* Wishlist preview */}
          {wishlisted.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-plum)' }}>Saved Frames</h3>
                <Link href="/wishlist" style={{ fontSize: '0.85rem', color: 'var(--color-terracotta)', fontWeight: 600 }}>View all →</Link>
              </div>
              <div className="account-wishlist-grid grid-4" style={{ gap: '1rem' }}>
                {wishlisted.map((p) => (
                  <Link key={p.id} href={`/product/${p.id}`} style={{
                    background: 'white', borderRadius: 'var(--radius-md)', padding: '1rem',
                    border: '1px solid rgba(0,0,0,0.06)', textDecoration: 'none', textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                  >
                    <div style={{ background: 'var(--color-cream)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px' }}>
                      <svg width="60" height="32" viewBox="0 0 60 32" fill="none">
                        <rect x="2" y="6" width="22" height="18" rx="4" stroke={p.colors[0]} strokeWidth="2.5" fill="rgba(255,255,255,0.5)" />
                        <rect x="36" y="6" width="22" height="18" rx="4" stroke={p.colors[0]} strokeWidth="2.5" fill="rgba(255,255,255,0.5)" />
                        <path d="M24 15 Q30 11 36 15" stroke={p.colors[0]} strokeWidth="2" strokeLinecap="round" fill="none" />
                      </svg>
                    </div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>{p.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-terracotta)', fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

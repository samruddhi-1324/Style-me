'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { gsap } from 'gsap';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal } = useStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cartOpen) {
      gsap.fromTo(drawerRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [cartOpen]);

  if (!cartOpen) return null;

  const total = cartTotal();

  return (
    <>
      <div className="overlay" onClick={() => setCartOpen(false)} style={{ zIndex: 150 }} />
      <div ref={drawerRef} style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px',
        background: 'var(--color-ivory)', zIndex: 200,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--color-plum)' }}>
              Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem' }}>
            <svg width="20" height="20" fill="none" stroke="var(--color-espresso)" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👓</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--color-plum)', marginBottom: '0.5rem' }}>
                Your perfect pair is waiting.
              </h3>
              <p style={{ color: 'var(--color-sage)', marginBottom: '2rem' }}>Your cart is empty</p>
              <Link href="/shop" className="btn-primary" onClick={() => setCartOpen(false)}>Shop Eyewear →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div key={item.id} style={{
                  background: 'white', borderRadius: 'var(--radius-md)',
                  padding: '1rem', display: 'flex', gap: '0.875rem',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}>
                  {/* Frame visual */}
                  <div style={{
                    width: '80px', height: '60px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--color-cream) 0%, var(--color-sand) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
                      <rect x="4" y="6" width="22" height="14" rx="3" stroke="var(--color-espresso)" strokeWidth="2" fill="rgba(255,255,255,0.6)" />
                      <rect x="34" y="6" width="22" height="14" rx="3" stroke="var(--color-espresso)" strokeWidth="2" fill="rgba(255,255,255,0.6)" />
                      <path d="M26 13 Q30 11 34 13" stroke="var(--color-espresso)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '0.15rem' }}>{item.productName}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-sage)' }}>
                          {item.size} · {item.lensIndex} · {item.lensType}
                        </p>
                        {item.prescription && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: 'var(--color-forest)', fontWeight: 600, marginTop: '0.25rem' }}>
                            ✓ Prescription {item.prescription}
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
                        <svg width="14" height="14" fill="none" stroke="var(--color-muted)" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50px', padding: '0.2rem 0.5rem' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--color-espresso)' }}>−</button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--color-espresso)' }}>+</button>
                      </div>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-plum)' }}>
                        ₹{(item.totalPrice * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.08)', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-sage)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-sage)' }}>Shipping</span>
              <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{total >= 999 ? 'Free' : '₹99'}</span>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-plum)' }}>
                ₹{(total >= 999 ? total : total + 99).toLocaleString('en-IN')}
              </span>
            </div>
            <Link
              href="/checkout"
              className="btn-primary"
              onClick={() => setCartOpen(false)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Proceed to Checkout →
            </Link>
            <button
              onClick={() => setCartOpen(false)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.75rem', color: 'var(--color-sage)', fontSize: '0.85rem' }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

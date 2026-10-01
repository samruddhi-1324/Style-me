'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { products } from '@/data/products';
import { PRODUCT_IMAGES } from '@/components/product/ProductImage';

const suggestedIds = ['frame-002', 'frame-003', 'frame-009', 'frame-013'];

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();
  const total = cartTotal();
  const shipping = total >= 999 ? 0 : 99;
  const suggestedProducts = products.filter((p) => suggestedIds.includes(p.id));

  if (cart.length === 0) {
    return (
      <div style={{ background: 'var(--color-ivory)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>👓</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", marginBottom: '0.5rem', color: 'var(--color-plum)', fontSize: '2rem' }}>
            Your perfect pair is waiting.
          </h2>
          <p style={{ color: 'var(--color-sage)', marginBottom: '2rem' }}>Your cart is empty — start browsing our collection.</p>
          <Link href="/shop" className="btn-primary" style={{ fontSize: '1rem' }}>Shop Eyewear →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ background: 'var(--color-cream)', padding: '2.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>Review Your Cart</h1>
          <p style={{ color: 'var(--color-sage)' }}>{cart.reduce((s, i) => s + i.quantity, 0)} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="container cart-layout" style={{ paddingTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'flex-start' }}>

        {/* Cart items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.map((item) => (
            <div key={item.id} className="cart-item-grid" style={{
              background: 'white', borderRadius: 'var(--radius-lg)',
              padding: '1.5rem', display: 'grid', gridTemplateColumns: '100px 1fr auto',
              gap: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', alignItems: 'center',
            }}>
              {/* Frame visual */}
              <div style={{
                background: 'linear-gradient(135deg, var(--color-cream), var(--color-sand))',
                borderRadius: 'var(--radius-md)', aspectRatio: '5/3',
                overflow: 'hidden', position: 'relative',
              }}>
                {PRODUCT_IMAGES[item.productId] ? (
                  <Image
                    src={PRODUCT_IMAGES[item.productId]}
                    alt={item.productName}
                    fill
                    sizes="100px"
                    style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="80" height="44" viewBox="0 0 80 44" fill="none">
                      <rect x="4" y="10" width="30" height="22" rx="5" stroke="var(--color-espresso)" strokeWidth="3" fill="rgba(255,255,255,0.6)" />
                      <rect x="46" y="10" width="30" height="22" rx="5" stroke="var(--color-espresso)" strokeWidth="3" fill="rgba(255,255,255,0.6)" />
                      <path d="M34 21 Q40 17 46 21" stroke="var(--color-espresso)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-espresso)', marginBottom: '0.25rem' }}>{item.productName}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-sage)', marginBottom: '0.4rem' }}>
                  {item.color} · {item.size} · {item.lensIndex} · {item.lensType}
                </p>
                {item.coatings.length > 0 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                    Coatings: {item.coatings.join(', ')}
                  </p>
                )}
                {item.prescription && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 700,
                    background: 'rgba(32,56,46,0.08)', padding: '0.25rem 0.625rem', borderRadius: '50px',
                  }}>
                    ✓ Prescription {item.prescription}
                  </span>
                )}
                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '50px', overflow: 'hidden' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ width: '34px', height: '34px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >−</button>
                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ width: '34px', height: '34px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >+</button>
                  </div>
                  {/* Mobile inline price */}
                  <div className="cart-price-inline" style={{ display: 'none', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>
                      ₹{(item.totalPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-muted)', padding: '0.25rem' }}
                      title="Remove"
                    >🗑</button>
                  </div>
                </div>
              </div>

              {/* Price + remove */}
              <div className="cart-price-col" style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif", marginBottom: '0.5rem' }}>
                  ₹{(item.totalPrice * item.quantity).toLocaleString('en-IN')}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.875rem' }}>
                  ₹{item.totalPrice.toLocaleString('en-IN')} each
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50px', padding: '0.35rem 0.875rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#C44D40'; (e.currentTarget as HTMLElement).style.color = '#C44D40'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}

          <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-sage)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            ← Continue Shopping
          </Link>

          {/* Suggested frames */}
          <div className="cart-suggested" style={{ marginTop: '2rem' }}>
            <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-plum)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              You may also like
            </h4>
            <div className="grid-4" style={{ gap: '0.875rem' }}>
              {suggestedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} style={{
                  background: 'white', borderRadius: 'var(--radius-md)', padding: '1rem',
                  border: '1px solid rgba(0,0,0,0.06)', textDecoration: 'none', textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                >
                  <div style={{ background: 'var(--color-cream)', borderRadius: '8px', marginBottom: '0.5rem', overflow: 'hidden', position: 'relative', height: '56px' }}>
                    {PRODUCT_IMAGES[p.id] ? (
                      <Image
                        src={PRODUCT_IMAGES[p.id]}
                        alt={p.name}
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
                          <rect x="2" y="5" width="22" height="18" rx="4" stroke={p.colors[0]} strokeWidth="2.5" fill="rgba(255,255,255,0.5)" />
                          <rect x="36" y="5" width="22" height="18" rx="4" stroke={p.colors[0]} strokeWidth="2.5" fill="rgba(255,255,255,0.5)" />
                          <path d="M24 14 Q30 10 36 14" stroke={p.colors[0]} strokeWidth="2" strokeLinecap="round" fill="none" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '0.15rem' }}>{p.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-terracotta)', fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-plum)' }}>Price Breakdown</h3>

            {cart.map((item) => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-espresso)' }}>Frame Price</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>₹{item.framePrice.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-espresso)' }}>Lens Price</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>₹{item.lensTypePrice.toLocaleString('en-IN')}</span>
                </div>
                {item.lensIndexPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-espresso)' }}>Lens Upgrade</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>₹{item.lensIndexPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {item.coatingsPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-espresso)' }}>Coatings</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>₹{item.coatingsPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-espresso)' }}>Prescription processing</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-forest)' }}>Free</span>
                </div>
              </div>
            ))}

            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--color-forest)' : 'var(--color-espresso)' }}>
                {shipping === 0 ? 'Free' : `₹${shipping}`}
              </span>
            </div>
            {total > 0 && (
              <div style={{ background: 'rgba(113,130,118,0.08)', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                  🎉 You saved ₹{Math.round(cart.reduce((s, i) => s + i.framePrice * 0.2, 0))} with offers
                </p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingTop: '0.75rem', borderTop: '2px solid var(--color-plum)' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-plum)' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>
                ₹{(total + shipping).toLocaleString('en-IN')}
              </span>
            </div>
            <Link href="/checkout" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', display: 'flex' }}>
              Proceed to Checkout →
            </Link>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.25rem' }}>
              {[['🔒', 'Secure'], ['↩️', 'Returns'], ['🚚', 'Fast delivery']].map(([icon, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem' }}>{icon}</div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

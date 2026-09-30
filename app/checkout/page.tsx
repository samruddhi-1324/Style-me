'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';

const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala', 'Andhra Pradesh'];

export default function CheckoutPage() {
  const { cart, cartTotal } = useStore();
  const [address, setAddress] = useState({ name: 'Samruddhi Patil', phone: '', address: '125, Green Park, Pune', city: 'Pune', state: 'Maharashtra', pin: '411036' });
  const [shipping, setShipping] = useState('standard');
  const [payment, setPayment] = useState('upi');
  const [success, setSuccess] = useState(false);
  const [orderId] = useState(`SM${Date.now().toString().slice(-8)}`);

  const total = cartTotal();
  const shippingCost = shipping === 'express' ? 99 : (total >= 999 ? 0 : 99);
  const grandTotal = total + shippingCost;

  const handleOrder = () => setSuccess(true);

  if (cart.length === 0 && !success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ivory)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
          <Link href="/shop" className="btn-primary">Shop Eyewear →</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '520px' }}>
          {/* Success animation */}
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-forest), var(--color-sage))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 20px 60px rgba(32,56,46,0.25)',
          }}>
            <svg width="48" height="48" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--color-plum)' }}>
            Order Placed!
          </h1>
          <p style={{ color: 'var(--color-sage)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
            Your perfect pair is on its way 🎉
          </p>

          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem', textAlign: 'left', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>ORDER ID</p>
                <p style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-plum)', fontSize: '1.1rem' }}>{orderId}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>ESTIMATED DELIVERY</p>
                <p style={{ fontWeight: 700, color: 'var(--color-forest)' }}>3–5 Business Days</p>
              </div>
            </div>
            <div className="divider" />
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.productName}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>{item.lensType} · {item.lensIndex}</p>
                </div>
                <p style={{ fontWeight: 700 }}>₹{(item.totalPrice * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-plum)' }}>Total Paid</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(113,130,118,0.08)', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-forest)' }}>
                📦 Delivering to: <strong>{address.address}, {address.city}, {address.state} — {address.pin}</strong>
              </p>
            </div>
          </div>

          {/* Delivery steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            {[
              { icon: '✅', label: 'Processing', time: '1-2 days' },
              { icon: '⚒️', label: 'Making', time: '2-4 days' },
              { icon: '🚚', label: 'Dispatched', time: '1-2 days' },
              { icon: '🏠', label: 'Delivered', time: '3-5 days' },
            ].map(({ icon, label, time }, i) => (
              <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? 'var(--color-forest)' : 'var(--color-muted)' }}>{label}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>{time}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/shop" className="btn-primary">Continue Shopping →</Link>
            <Link href="/account" className="btn-outline">View Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ background: 'var(--color-cream)', padding: '2.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>Checkout</h1>
          <p style={{ color: 'var(--color-sage)' }}>Almost there — complete your order below.</p>
        </div>
      </div>

      <div className="container checkout-layout" style={{ paddingTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'flex-start' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Prescription */}
          <Section title="Prescription">
            {cart.some((i) => i.prescription) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', background: 'rgba(32,56,46,0.06)', borderRadius: 'var(--radius-md)' }}>
                <svg width="20" height="20" fill="none" stroke="var(--color-forest)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--color-forest)', fontSize: '0.875rem' }}>Prescription ready</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>Your prescription has been saved with this order.</p>
                </div>
                <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-terracotta)', fontFamily: 'Inter, sans-serif' }}>Edit</button>
              </div>
            ) : (
              <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>No prescription — non-prescription lenses or send later option selected.</p>
            )}
          </Section>

          {/* Address */}
          <Section title="Shipping Address">
            <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>FULL NAME</label>
                <input className="input-field" value={address.name} onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>PHONE</label>
                <input className="input-field" placeholder="+91 98765 43210" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>ADDRESS</label>
                <input className="input-field" value={address.address} onChange={(e) => setAddress((a) => ({ ...a, address: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>CITY</label>
                <input className="input-field" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>STATE</label>
                <select className="input-field" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>PIN CODE</label>
                <input className="input-field" value={address.pin} maxLength={6} onChange={(e) => setAddress((a) => ({ ...a, pin: e.target.value }))} />
              </div>
            </div>
          </Section>

          {/* Shipping method */}
          <Section title="Shipping Method">
            {[
              { id: 'standard', label: 'Standard Delivery', desc: '3–5 business days', price: total >= 999 ? 'Free' : '₹99' },
              { id: 'express', label: 'Express Delivery', desc: '1–2 business days', price: '₹99' },
            ].map((opt) => (
              <button key={opt.id} onClick={() => setShipping(opt.id)} style={{
                width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left',
                border: `2px solid ${shipping === opt.id ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                background: shipping === opt.id ? 'rgba(32,56,46,0.05)' : 'white',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'Inter, sans-serif', marginBottom: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: `2px solid ${shipping === opt.id ? 'var(--color-forest)' : 'rgba(0,0,0,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {shipping === opt.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-forest)' }} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-espresso)', marginBottom: '0.15rem' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>{opt.desc}</p>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: opt.price === 'Free' ? 'var(--color-forest)' : 'var(--color-espresso)' }}>{opt.price}</span>
              </button>
            ))}
          </Section>

          {/* Payment */}
          <Section title="Payment Method">
            {[
              { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, etc.' },
              { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
              { id: 'netbanking', label: 'Net Banking', desc: '' },
              { id: 'wallet', label: 'Wallet', desc: 'Paytm, Amazon Pay' },
              { id: 'cod', label: 'Cash on Delivery', desc: 'Available in select areas' },
            ].map((opt) => (
              <button key={opt.id} onClick={() => setPayment(opt.id)} style={{
                width: '100%', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', textAlign: 'left',
                border: `2px solid ${payment === opt.id ? 'var(--color-forest)' : 'rgba(0,0,0,0.08)'}`,
                background: payment === opt.id ? 'rgba(32,56,46,0.05)' : 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem',
                fontFamily: 'Inter, sans-serif', marginBottom: '0.5rem',
              }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${payment === opt.id ? 'var(--color-forest)' : 'rgba(0,0,0,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {payment === opt.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-forest)' }} />}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-espresso)' }}>{opt.label}</p>
                  {opt.desc && <p style={{ fontSize: '0.75rem', color: 'var(--color-sage)' }}>{opt.desc}</p>}
                </div>
              </button>
            ))}
          </Section>
        </div>

        {/* RIGHT — Order summary */}
        <div className="checkout-summary" style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-plum)' }}>
              Order Summary
            </h3>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.productName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>₹{(item.totalPrice * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--color-sage)', fontSize: '0.875rem' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-sage)', fontSize: '0.875rem' }}>Shipping</span>
              <span style={{ fontWeight: 600, color: shippingCost === 0 ? 'var(--color-forest)' : 'inherit' }}>
                {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
              </span>
            </div>
            <div style={{ paddingTop: '0.875rem', borderTop: '2px solid var(--color-plum)', display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-plum)' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={handleOrder} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '1rem' }}>
              Place Order →
            </button>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textAlign: 'center', marginTop: '0.875rem' }}>
              🔒 All payments are encrypted and secure
            </p>
          </div>

          {/* Shipping address preview */}
          <div style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Delivering to</p>
            <p style={{ fontWeight: 600, color: 'var(--color-plum)', marginBottom: '0.2rem' }}>{address.name}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              {address.address}<br />{address.city}, {address.state} — {address.pin}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-plum)', marginBottom: '1.25rem', letterSpacing: '0.02em' }}>{title}</h3>
      {children}
    </div>
  );
}

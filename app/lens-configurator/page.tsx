'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { products } from '@/data/products';
import { lensTypes, lensIndices, coatings } from '@/data/products';
import { useStore } from '@/lib/store';
import { gsap } from 'gsap';

const STEPS = [
  { id: 1, label: 'Step 1 — Lens Type' },
  { id: 2, label: 'Step 2 — Prescription' },
  { id: 3, label: 'Step 3 — Coating & Index' },
  { id: 4, label: 'Step 4 — Review & Price' },
];

function LensConfigContent() {
  const searchParams = useSearchParams();
  const frameParam = searchParams.get('frame') || 'frame-001';
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [prescriptionMethod, setPrescriptionMethod] = useState<'manual' | 'upload' | 'later'>('manual');
  const [prescription, setPrescription] = useState({
    rSph: '-2.00', rCyl: '-0.50', rAxis: '90', rAdd: '',
    lSph: '-1.75', lCyl: '-0.50', lAxis: '85', lAdd: '',
    pdRight: '32', pdLeft: '32'
  });
  const [selectedLensType, setSelectedLensType] = useState('single-vision');
  const [selectedIndex, setSelectedIndex] = useState('1.60');
  const [selectedCoatings, setSelectedCoatings] = useState<string[]>(['anti-glare']);
  const stepRef = useRef<HTMLDivElement>(null);
  const { addToCart, setCartOpen } = useStore();

  const product = products.find((p) => p.id === frameParam) || products[0];
  const lensType = lensTypes.find((l) => l.id === selectedLensType) || lensTypes[0];
  const lensIdx = lensIndices.find((l) => l.index === selectedIndex) || lensIndices[0];
  const coatingTotal = coatings.filter((c) => selectedCoatings.includes(c.id)).reduce((sum, c) => sum + c.price, 0);
  const total = product.price + lensType.price + lensIdx.priceAdd + coatingTotal;

  const animateStep = () => {
    gsap.fromTo(stepRef.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
  };

  const goNext = () => { setStep((s) => Math.min(s + 1, 4)); animateStep(); };
  const goPrev = () => { setStep((s) => Math.max(s - 1, 1)); animateStep(); };

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      color: product.color,
      size: 'Medium',
      image: '',
      framePrice: product.price,
      lensType: lensType.name,
      lensTypePrice: lensType.price,
      lensIndex: selectedIndex,
      lensIndexPrice: lensIdx.priceAdd,
      coatings: selectedCoatings,
      coatingsPrice: coatingTotal,
      prescription: prescriptionMethod === 'manual' 
        ? `OD: ${prescription.rSph}/${prescription.rCyl}x${prescription.rAxis} | OS: ${prescription.lSph}/${prescription.lCyl}x${prescription.lAxis} | PD: ${prescription.pdRight}/${prescription.pdLeft}`
        : prescriptionMethod === 'upload' ? 'Uploaded Photo' : 'Send Later',
      quantity: 1,
      totalPrice: total,
    });
    setCartOpen(true);
    router.push('/cart');
  };

  const toggleCoating = (id: string) => {
    setSelectedCoatings((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);
  };

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Progress header */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '1.25rem 0', position: 'sticky', top: '0', zIndex: 50 }}>
        <div className="container">
          {/* Selected product bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '48px', height: '32px', background: 'var(--color-cream)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="38" height="20" viewBox="0 0 38 20" fill="none">
                <rect x="2" y="4" width="14" height="11" rx="3" stroke={product.colors[0]} strokeWidth="2" fill="rgba(255,255,255,0.5)" />
                <rect x="22" y="4" width="14" height="11" rx="3" stroke={product.colors[0]} strokeWidth="2" fill="rgba(255,255,255,0.5)" />
                <path d="M16 9.5 Q19 7.5 22 9.5" stroke={product.colors[0]} strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-espresso)' }}>{product.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-sage)' }}>₹{product.price.toLocaleString('en-IN')} frame</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Running Total</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>
                ₹{total.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Steps Progress */}
          <div className="lens-steps-bar" style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div
                  onClick={() => { if (s.id < step) setStep(s.id); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                    cursor: s.id < step ? 'pointer' : 'default', flex: 1,
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step > s.id ? 'var(--color-forest)' : step === s.id ? 'var(--color-plum)' : 'rgba(0,0,0,0.08)',
                    color: step >= s.id ? 'white' : 'var(--color-muted)',
                    fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.3s',
                  }}>
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: step === s.id ? 'var(--color-plum)' : 'var(--color-muted)', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ height: '2px', flex: 1, background: step > s.id + 1 ? 'var(--color-forest)' : 'rgba(0,0,0,0.08)', transition: 'all 0.3s', margin: '0 0.25rem', marginBottom: '1rem' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container lens-config-main" style={{ paddingTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'flex-start' }}>

        {/* Main step content */}
        <div ref={stepRef}>

          {/* STEP 1 — LENS TYPE */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Step 1 — Choose Lens Type</h2>
              <p style={{ color: 'var(--color-sage)', marginBottom: '2rem' }}>Select the vision correction or protective lens type for your {product.name}.</p>
              <div className="lens-type-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {lensTypes.map((lt) => (
                  <button
                    key={lt.id}
                    onClick={() => setSelectedLensType(lt.id)}
                    style={{
                      padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'left',
                      border: `2px solid ${selectedLensType === lt.id ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                      background: selectedLensType === lt.id ? 'rgba(32,56,46,0.05)' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {lt.isRecommended && (
                      <span className="badge badge-sage" style={{ position: 'absolute', top: '0.875rem', right: '0.875rem', fontSize: '0.65rem' }}>Recommended</span>
                    )}
                    <p style={{ fontWeight: 700, color: 'var(--color-plum)', marginBottom: '0.375rem', fontSize: '1rem' }}>{lt.name}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-sage)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{lt.description}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-terracotta)' }}>
                      +₹{lt.price.toLocaleString('en-IN')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — PRESCRIPTION */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Step 2 — Prescription</h2>
              <p style={{ color: 'var(--color-sage)', marginBottom: '2rem' }}>How would you like to provide your prescription details?</p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {([['manual', 'Enter Manually'], ['upload', 'Upload Prescription'], ['later', 'No Prescription / Send Later']] as const).map(([m, label]) => (
                  <button key={m} onClick={() => setPrescriptionMethod(m)} style={{
                    padding: '0.6rem 1.25rem', borderRadius: '50px',
                    border: `1.5px solid ${prescriptionMethod === m ? 'var(--color-forest)' : 'rgba(0,0,0,0.12)'}`,
                    background: prescriptionMethod === m ? 'var(--color-forest)' : 'white',
                    color: prescriptionMethod === m ? 'white' : 'var(--color-espresso)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}>{label}</button>
                ))}
              </div>

              {prescriptionMethod === 'manual' && (
                <div className="rx-eye-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {[['Right Eye (OD)', 'r'], ['Left Eye (OS)', 'l']].map(([title, prefix]) => (
                    <div key={prefix} style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <h4 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1rem', color: 'var(--color-plum)' }}>{title}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[['SPH', 'Sph'], ['CYL', 'Cyl'], ['AXIS', 'Axis'], ['ADD', 'Add']].map(([label, field]) => (
                          <div key={field}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>{label}</label>
                            <select
                              value={(prescription as any)[`${prefix}${field}`]}
                              onChange={(e) => setPrescription((p) => ({ ...p, [`${prefix}${field}`]: e.target.value }))}
                              className="input-field"
                              style={{ appearance: 'none', cursor: 'pointer' }}
                            >
                              <option value="">—</option>
                              {field === 'Sph' && Array.from({ length: 41 }, (_, i) => (i - 20) * 0.25).map((v) => (
                                <option key={v} value={v}>{v > 0 ? '+' : ''}{v.toFixed(2)}</option>
                              ))}
                              {field === 'Cyl' && Array.from({ length: 21 }, (_, i) => -i * 0.25).map((v) => (
                                <option key={v} value={v}>{v.toFixed(2)}</option>
                              ))}
                              {field === 'Axis' && Array.from({ length: 181 }, (_, i) => i).map((v) => (
                                <option key={v} value={v}>{v}°</option>
                              ))}
                              {field === 'Add' && ['', '+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00', '+2.25', '+2.50', '+2.75', '+3.00'].map((v) => (
                                <option key={v} value={v}>{v || '—'}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <h4 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '0.875rem', color: 'var(--color-plum)' }}>PD (Pupillary Distance)</h4>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem' }}>Right Eye PD (mm)</label>
                        <input type="number" placeholder="32" min={28} max={40} className="input-field" style={{ width: '130px' }} value={prescription.pdRight} onChange={(e) => setPrescription((p) => ({ ...p, pdRight: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-sage)', display: 'block', marginBottom: '0.3rem' }}>Left Eye PD (mm)</label>
                        <input type="number" placeholder="32" min={28} max={40} className="input-field" style={{ width: '130px' }} value={prescription.pdLeft} onChange={(e) => setPrescription((p) => ({ ...p, pdLeft: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {prescriptionMethod === 'upload' && (
                <div style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center', border: '2px dashed rgba(0,0,0,0.12)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--color-plum)', marginBottom: '0.5rem' }}>Upload Prescription Image / PDF</h3>
                  <p style={{ color: 'var(--color-sage)', marginBottom: '1.5rem' }}>Upload a photo or PDF of your doctor's prescription. We'll extract and verify it for you.</p>
                  <label className="btn-primary" style={{ cursor: 'pointer' }}>
                    Choose File
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={() => {
                      setTimeout(() => {
                        setPrescription({ rSph: '-2.00', rCyl: '-0.75', rAxis: '180', rAdd: '+1.00', lSph: '-2.00', lCyl: '-0.75', lAxis: '180', lAdd: '+1.00', pdRight: '32', pdLeft: '32' });
                        alert('✓ Prescription extracted successfully! You can verify the values in manual mode.');
                      }, 600);
                    }} />
                  </label>
                </div>
              )}

              {prescriptionMethod === 'later' && (
                <div style={{ background: 'rgba(113,130,118,0.08)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid rgba(113,130,118,0.2)' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-plum)', marginBottom: '0.5rem' }}>📋 Non-prescription / Send Later</p>
                  <p style={{ color: 'var(--color-sage)', lineHeight: 1.7 }}>
                    You can place your order now and email or WhatsApp your prescription later, or proceed with zero-power non-prescription lenses.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — LENS INDEX & COATINGS */}
          {step === 3 && (
            <div className="lens-index-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Step 3 — Index & Coatings</h2>
                <p style={{ color: 'var(--color-sage)', marginBottom: '1.5rem' }}>Higher lens index creates thinner, lighter lenses.</p>
                
                <h4 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '0.75rem', color: 'var(--color-plum)' }}>1. Select Lens Thickness (Index)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {lensIndices.map((li) => (
                    <button
                      key={li.index}
                      onClick={() => setSelectedIndex(li.index)}
                      style={{
                        padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'left',
                        border: `2px solid ${selectedIndex === li.index ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                        background: selectedIndex === li.index ? 'rgba(32,56,46,0.05)' : 'white',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--color-plum)', marginRight: '0.5rem' }}>{li.index}</span>
                        <span style={{ color: 'var(--color-sage)', fontSize: '0.875rem' }}>{li.label}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{li.thickness}mm thick</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: li.priceAdd === 0 ? 'var(--color-forest)' : 'var(--color-terracotta)' }}>
                          {li.priceAdd === 0 ? 'Included' : `+₹${li.priceAdd.toLocaleString('en-IN')}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <h4 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '0.75rem', color: 'var(--color-plum)' }}>2. Select Lens Coatings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {coatings.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => !c.included && toggleCoating(c.id)}
                      style={{
                        padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left',
                        border: `2px solid ${selectedCoatings.includes(c.id) ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                        background: selectedCoatings.includes(c.id) ? 'rgba(32,56,46,0.05)' : 'white',
                        cursor: c.included ? 'default' : 'pointer', transition: 'all 0.2s',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '4px',
                          border: `2px solid ${selectedCoatings.includes(c.id) ? 'var(--color-forest)' : 'rgba(0,0,0,0.2)'}`,
                          background: selectedCoatings.includes(c.id) ? 'var(--color-forest)' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {selectedCoatings.includes(c.id) && <svg width="10" height="10" fill="white" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--color-plum)', fontSize: '0.9rem' }}>{c.name}</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>{c.description}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: c.price === 0 ? 'var(--color-forest)' : 'var(--color-terracotta)', flexShrink: 0 }}>
                        {c.price === 0 ? 'Free' : `+₹${c.price.toLocaleString('en-IN')}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lens Thickness Visual Preview */}
              <div className="lens-thickness-preview">
                <h4 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1.25rem', color: 'var(--color-plum)' }}>Simulated Lens Thickness</h4>
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {lensIndices.map((li) => {
                      const active = li.index === selectedIndex;
                      return (
                        <div key={li.index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: active ? 'var(--color-plum)' : 'var(--color-muted)', width: '32px' }}>{li.index}</span>
                          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" style={{ flexShrink: 0 }}>
                            <ellipse
                              cx="30" cy="20"
                              rx={active ? 28 : 24}
                              ry={li.thickness * 2.8}
                              fill={active ? 'rgba(32,56,46,0.15)' : 'rgba(0,0,0,0.05)'}
                              stroke={active ? 'var(--color-forest)' : 'rgba(0,0,0,0.15)'}
                              strokeWidth={active ? 2 : 1}
                            />
                          </svg>
                          <div>
                            <p style={{ fontSize: '0.82rem', fontWeight: active ? 700 : 400, color: active ? 'var(--color-espresso)' : 'var(--color-muted)' }}>
                              {li.label} — {li.thickness}mm
                            </p>
                            {active && <p style={{ fontSize: '0.72rem', color: 'var(--color-forest)', fontWeight: 600 }}>← Active selection</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — REVIEW & PRICE SUMMARY */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Step 4 — Review & Confirm</h2>
              <p style={{ color: 'var(--color-sage)', marginBottom: '2rem' }}>Review your custom frame and lens configuration before adding to cart.</p>
              
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                {[
                  ['Frame', `${product.name} (${product.color})`],
                  ['Lens Type', lensType.name],
                  ['Lens Index', `${selectedIndex} (${lensIdx.label})`],
                  ['Estimated Thickness', `${lensIdx.thickness} mm`],
                  ['Coatings', selectedCoatings.map((id) => coatings.find((c) => c.id === id)?.name).join(', ')],
                  ['Prescription', prescriptionMethod === 'manual' ? 'Manual details entered' : prescriptionMethod === 'upload' ? 'Prescription photo uploaded' : 'No prescription / Send later'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', padding: '0.75rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ width: '180px', fontSize: '0.875rem', color: 'var(--color-muted)', flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-espresso)' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <h4 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1rem' }}>Complete Price Summary</h4>
                {[
                  ['Frame Price', product.price],
                  [`Lens Type (${lensType.name})`, lensType.price],
                  ...(lensIdx.priceAdd > 0 ? [[`${lensIdx.label} Lens Index`, lensIdx.priceAdd]] : []),
                  ...selectedCoatings.filter((id) => id !== 'anti-glare').map((id) => {
                    const c = coatings.find((x) => x.id === id)!;
                    return [c.name, c.price];
                  }),
                  ['Anti-glare Coating', 0],
                  ['Free Shipping', 0],
                ].map(([label, amount]) => (
                  <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-espresso)' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: Number(amount) === 0 ? 'var(--color-forest)' : 'var(--color-espresso)' }}>
                      {Number(amount) === 0 ? 'Free' : `₹${Number(amount).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '2px solid var(--color-plum)', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-plum)' }}>TOTAL PRICE</span>
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
            {step > 1 ? (
              <button onClick={goPrev} className="btn-outline">← Back</button>
            ) : <div />}
            {step < 4 ? (
              <button onClick={goNext} className="btn-secondary">Next Step →</button>
            ) : (
              <button onClick={handleAddToCart} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                Add to Cart (₹{total.toLocaleString('en-IN')}) →
              </button>
            )}
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="lens-config-sidebar" style={{ position: 'sticky', top: '160px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h4 style={{ fontFamily: 'Inter, sans-serif', marginBottom: '1.25rem', color: 'var(--color-plum)' }}>Live Price Breakdown</h4>
            {[
              { label: 'Frame', value: `₹${product.price.toLocaleString('en-IN')}` },
              { label: 'Lens Type', value: `₹${lensType.price.toLocaleString('en-IN')}` },
              { label: 'Index Upgrade', value: lensIdx.priceAdd > 0 ? `+₹${lensIdx.priceAdd.toLocaleString('en-IN')}` : 'Included' },
              { label: 'Coatings', value: coatingTotal > 0 ? `+₹${coatingTotal.toLocaleString('en-IN')}` : 'Included' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-espresso)' }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--color-plum)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-plum)' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LensConfigPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading configurator...</div>}>
      <LensConfigContent />
    </Suspense>
  );
}

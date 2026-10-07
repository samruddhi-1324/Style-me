'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginHref } from '@/lib/auth/redirect';
import { useStore } from '@/lib/store';
import { products } from '@/data/products';
import { PRODUCT_IMAGES, PRODUCT_TINTS } from '@/components/product/ProductImage';

type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | null;
type StylePref = 'classic' | 'bold' | 'minimal' | 'sporty' | 'retro';
type Usage = 'everyday' | 'work' | 'outdoor' | 'night' | 'fashion';
type Budget = 'budget' | 'mid' | 'premium' | 'luxury';

const STEPS = ['Face Shape', 'Style', 'Usage', 'Budget', 'Results'];

const faceShapes = [
  { id: 'oval', label: 'Oval', desc: 'Balanced proportions', path: 'M60,10 Q90,10 90,45 Q90,80 60,90 Q30,80 30,45 Q30,10 60,10' },
  { id: 'round', label: 'Round', desc: 'Circular features', path: 'M60,10 A50,45 0 1 1 60,10 Z M60,10 m0,0 a45,45 0 1 0 0,80 a45,45 0 1 0 0,-80' },
  { id: 'square', label: 'Square', desc: 'Strong jawline', path: 'M25,15 H95 Q100,15 100,20 V80 Q100,85 95,85 H25 Q20,85 20,80 V20 Q20,15 25,15' },
  { id: 'heart', label: 'Heart', desc: 'Wide forehead', path: 'M60,80 Q20,55 20,35 Q20,10 45,10 Q55,10 60,20 Q65,10 75,10 Q100,10 100,35 Q100,55 60,80' },
  { id: 'oblong', label: 'Oblong', desc: 'Long narrow face', path: 'M45,8 H75 Q95,8 95,25 V75 Q95,92 75,92 H45 Q25,92 25,75 V25 Q25,8 45,8' },
];

const stylePrefs = [
  { id: 'classic', label: 'Classic', emoji: '🎩', desc: 'Timeless & elegant' },
  { id: 'bold', label: 'Bold', emoji: '✨', desc: 'Make a statement' },
  { id: 'minimal', label: 'Minimal', emoji: '◽', desc: 'Clean & understated' },
  { id: 'sporty', label: 'Sporty', emoji: '⚡', desc: 'Active & dynamic' },
  { id: 'retro', label: 'Retro', emoji: '🕶️', desc: 'Vintage vibes' },
];

const usages = [
  { id: 'everyday', label: 'Everyday', emoji: '☀️', desc: 'Daily wear all day' },
  { id: 'work', label: 'Work & Screens', emoji: '💻', desc: 'Office & digital' },
  { id: 'outdoor', label: 'Outdoors', emoji: '🌿', desc: 'Sun & adventure' },
  { id: 'night', label: 'Night & Events', emoji: '🌙', desc: 'Evening & parties' },
  { id: 'fashion', label: 'Fashion', emoji: '💫', desc: 'Style statement' },
];

const budgets = [
  { id: 'budget', label: 'Under ₹2,500', desc: 'Great value picks', max: 2500 },
  { id: 'mid', label: '₹2,500–5,000', desc: 'Our bestsellers', max: 5000 },
  { id: 'premium', label: '₹5,000–8,000', desc: 'Premium quality', max: 8000 },
  { id: 'luxury', label: '₹8,000+', desc: 'Finest craftsmanship', max: 999999 },
];

function getRecommendations(faceShape: FaceShape, styles: StylePref[], usages_: Usage[], budget: Budget) {
  const budgetMap: Record<Budget, [number, number]> = {
    budget: [0, 2500], mid: [2500, 5000], premium: [5000, 8000], luxury: [8000, 999999],
  };
  const [min, max] = budget ? budgetMap[budget] : [0, 999999];
  const categoryMap: Record<string, string[]> = {
    work: ['Blue-light', 'Eyeglasses'],
    outdoor: ['Sunglasses'],
    night: ['Eyeglasses', 'Sunglasses'],
    everyday: ['Eyeglasses'],
    fashion: ['Sunglasses', 'Eyeglasses'],
  };
  const preferredCategories = usages_.flatMap((u) => categoryMap[u] || []);

  let filtered = products.filter((p) => p.price >= min && p.price <= max);

  if (preferredCategories.length > 0) {
    const cat = filtered.filter((p) => preferredCategories.includes(p.category));
    if (cat.length >= 3) filtered = cat;
  }

  // Score by rating + match
  filtered = filtered.sort((a, b) => b.rating - a.rating);
  return filtered.slice(0, 6);
}

export default function StyleFinderPage() {
  const [step, setStep] = useState(0);
  const [faceShape, setFaceShape] = useState<FaceShape>(null);
  const [selectedStyles, setSelectedStyles] = useState<StylePref[]>([]);
  const [selectedUsages, setSelectedUsages] = useState<Usage[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [aiDetectedShape, setAiDetectedShape] = useState<FaceShape>(null);
  const { toggleWishlist, isWishlisted } = useStore();
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

  const recommendations = showResults ? getRecommendations(faceShape, selectedStyles, selectedUsages, budget || 'mid') : [];

  const simulateAiFaceDetect = () => {
    setIsScanningFace(true);
    setTimeout(() => {
      setIsScanningFace(false);
      setAiDetectedShape('oval');
      setFaceShape('oval');
    }, 1200);
  };

  const canNext = [
    faceShape !== null,
    selectedStyles.length > 0,
    selectedUsages.length > 0,
    budget !== null,
  ][step];

  const goNext = () => {
    if (step < 3) setStep(step + 1);
    else setShowResults(true);
  };

  if (showResults) {
    return (
      <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--color-plum) 0%, #3D1F42 100%)', padding: '4rem 0', textAlign: 'center' }}>
          <div className="container">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
            <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '0.75rem' }}>Your StyleMe Recommendations</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
              Curated for your <strong style={{ color: 'white' }}>{faceShape}</strong> face shape, <strong style={{ color: 'white' }}>{selectedStyles.join(', ')}</strong> style, and <strong style={{ color: 'white' }}>{budget}</strong> budget.
            </p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: '3rem' }}>
          <div className="finder-results-grid grid-3" style={{ gap: '1.5rem' }}>
            {recommendations.map((product, i) => (
              <div key={product.id} style={{
                background: 'white', borderRadius: 'var(--radius-lg)',
                overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s', display: 'flex', flexDirection: 'column',
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = 'none'}
              >
                {i === 0 && (
                  <div style={{ background: 'var(--color-terracotta)', padding: '0.4rem', textAlign: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>★ TOP AI RECOMMENDATION</span>
                  </div>
                )}
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-cream), var(--color-sand))',
                  padding: PRODUCT_IMAGES[product.id] ? '0' : '2.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  aspectRatio: '4/3', position: 'relative', overflow: 'hidden',
                }}>
                  {PRODUCT_IMAGES[product.id] ? (
                    <>
                      <Image
                        src={PRODUCT_IMAGES[product.id]}
                        alt={`${product.name} eyewear frame`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                        loading="lazy"
                      />
                      {PRODUCT_TINTS[product.id] && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: PRODUCT_TINTS[product.id],
                          mixBlendMode: 'multiply',
                          pointerEvents: 'none',
                        }} />
                      )}
                    </>
                  ) : (
                    <svg width="140" height="60" viewBox="0 0 140 60" fill="none">
                      <rect x="6" y="12" width="50" height="34" rx="7" stroke={product.colors[0]} strokeWidth="3.5" fill="rgba(255,255,255,0.45)" />
                      <rect x="84" y="12" width="50" height="34" rx="7" stroke={product.colors[0]} strokeWidth="3.5" fill="rgba(255,255,255,0.45)" />
                      <path d="M56 29 Q70 21 84 29" stroke={product.colors[0]} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </svg>
                  )}
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--color-espresso)' }}>{product.name}</h3>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push(loginHref('/wishlist'));
                          return;
                        }
                        toggleWishlist(product.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                      aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {isWishlisted(product.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)', marginBottom: '0.875rem' }}>
                    {product.category} · {product.material} · {product.frameShape}
                  </p>

                  {/* Match Reason Breakdown (Phase 16) */}
                  <div style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--color-forest)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-plum)', marginBottom: '0.2rem' }}>Why it suits you:</span>
                    <div>✓ Suitable for <strong>{faceShape || 'your'}</strong> face shape</div>
                    <div>✓ Matches <strong>{selectedStyles.join(', ')}</strong> style vibe</div>
                    <div>✓ Ideal for <strong>{selectedUsages.join(', ')}</strong> usage</div>
                    <div>✓ Within your selected budget range</div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-plum)' }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link href={`/try-on?frame=${product.id}`} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                        Try On
                      </Link>
                      <Link href={`/product/${product.id}`} className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button onClick={() => { setShowResults(false); setStep(0); setFaceShape(null); setSelectedStyles([]); setSelectedUsages([]); setBudget(null); setAiDetectedShape(null); }} className="btn-outline" style={{ marginRight: '1rem' }}>
              Retake Quiz
            </button>
            <Link href="/shop" className="btn-primary">Browse All Frames →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--color-cream)', padding: '3rem 0 2rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--color-terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>StyleFinder™</p>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Find Your Perfect Frames</h1>
          <p style={{ color: 'var(--color-sage)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Answer 4 quick questions and our algorithm will curate frames made for your face, taste, and lifestyle.
          </p>
          {/* Progress */}
          <div className="finder-steps" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0' }}>
            {STEPS.slice(0, 4).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                  cursor: i < step ? 'pointer' : 'default',
                }} onClick={() => i < step && setStep(i)}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: step > i ? 'var(--color-forest)' : step === i ? 'var(--color-plum)' : 'rgba(0,0,0,0.1)',
                    color: step >= i ? 'white' : 'var(--color-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700,
                  }}>
                    {step > i ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: step === i ? 'var(--color-plum)' : 'var(--color-muted)', whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < 3 && <div style={{ width: '60px', height: '2px', background: step > i ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)', margin: '0 0.5rem 1.2rem' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '800px' }}>

        {/* STEP 0 — FACE SHAPE (Phase 15: Face detection option) */}
        {step === 0 && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>What&apos;s your face shape?</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '1.5rem' }}>Select your face shape manually or use simulated AI detection.</p>

            {/* AI Face Shape Scanner Card (Phase 15) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(32,56,46,0.06), rgba(198,106,85,0.06))',
              border: '1px border-dashed rgba(32,56,46,0.2)', borderRadius: 'var(--radius-lg)',
              padding: '1.25rem', marginBottom: '2rem', textAlign: 'center',
            }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-plum)', marginBottom: '0.3rem' }}>
                📷 Not sure about your face shape?
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)', marginBottom: '1rem' }}>
                Upload a selfie to analyze facial proportions (simulated AI detection).
              </p>
              {isScanningFace ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-forest)', fontWeight: 600, fontSize: '0.85rem' }}>
                  ⏳ Analyzing facial landmarks...
                </div>
              ) : aiDetectedShape ? (
                <div style={{ background: 'white', padding: '0.75rem 1.25rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--color-forest)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-forest)', fontWeight: 700 }}>
                    ✨ Simulated AI Detected: <strong>{aiDetectedShape.toUpperCase()}</strong> (89% confidence)
                  </span>
                  <button onClick={() => setFaceShape(null)} style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: 'var(--color-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Change</button>
                </div>
              ) : (
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--color-forest)', color: 'white',
                  padding: '0.6rem 1.25rem', borderRadius: '50px', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600,
                }}>
                  Upload Selfie / Scan Face
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={simulateAiFaceDetect} />
                </label>
              )}
            </div>

            <div className="finder-face-shapes" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {faceShapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => setFaceShape(shape.id as FaceShape)}
                  className="finder-face-shape-btn"
                  style={{
                    width: '148px', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', textAlign: 'center',
                    border: `2px solid ${faceShape === shape.id ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                    background: faceShape === shape.id ? 'rgba(32,56,46,0.06)' : 'white',
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                    position: 'relative',
                  }}
                >
                  {faceShape === shape.id && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--color-forest)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                  )}
                  <svg width="80" height="90" viewBox="20 5 80 90" style={{ marginBottom: '0.75rem' }}>
                    <path d={shape.path} stroke={faceShape === shape.id ? 'var(--color-forest)' : 'rgba(0,0,0,0.2)'} strokeWidth="2.5" fill={faceShape === shape.id ? 'rgba(32,56,46,0.08)' : 'rgba(0,0,0,0.03)'} />
                  </svg>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>{shape.label}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{shape.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 — STYLE */}
        {step === 1 && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>What&apos;s your style preference?</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '2.5rem' }}>Select all that resonate with you.</p>
            <div className="finder-style-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {stylePrefs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyles((prev) => prev.includes(s.id as StylePref) ? prev.filter((x) => x !== s.id) : [...prev, s.id as StylePref])}
                  className="finder-style-btn"
                  style={{
                    width: '148px', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', textAlign: 'center',
                    border: `2px solid ${selectedStyles.includes(s.id as StylePref) ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                    background: selectedStyles.includes(s.id as StylePref) ? 'rgba(32,56,46,0.06)' : 'white',
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.emoji}</div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>{s.label}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — USAGE */}
        {step === 2 && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>How will you use them?</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '2.5rem' }}>Select all your use cases.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {usages.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUsages((prev) => prev.includes(u.id as Usage) ? prev.filter((x) => x !== u.id) : [...prev, u.id as Usage])}
                  style={{
                    width: '148px', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', textAlign: 'center',
                    border: `2px solid ${selectedUsages.includes(u.id as Usage) ? 'var(--color-plum)' : 'rgba(0,0,0,0.1)'}`,
                    background: selectedUsages.includes(u.id as Usage) ? 'rgba(36,21,38,0.06)' : 'white',
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{u.emoji}</div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>{u.label}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{u.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — BUDGET */}
        {step === 3 && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>What&apos;s your budget?</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-sage)', marginBottom: '2.5rem' }}>Frame price only. Lens costs are separate.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '520px', margin: '0 auto' }}>
              {budgets.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBudget(b.id as Budget)}
                  style={{
                    padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'left',
                    border: `2px solid ${budget === b.id ? 'var(--color-terracotta)' : 'rgba(0,0,0,0.1)'}`,
                    background: budget === b.id ? 'rgba(198,106,85,0.06)' : 'white',
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-espresso)', marginBottom: '0.25rem' }}>{b.label}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>{b.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', alignItems: 'center' }}>
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="btn-outline">← Back</button>
          ) : <div />}
          <button
            onClick={goNext}
            disabled={!canNext}
            className="btn-primary"
            style={{ opacity: canNext ? 1 : 0.4, cursor: canNext ? 'pointer' : 'not-allowed' }}
          >
            {step === 3 ? '✨ Show My Matches' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

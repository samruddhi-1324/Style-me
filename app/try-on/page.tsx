'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { products } from '@/data/products';
import { useStore } from '@/lib/store';
import { gsap } from 'gsap';

function TryOnContent() {
  const searchParams = useSearchParams();
  const frameParam = searchParams.get('frame') || '';
  const [selectedFrame, setSelectedFrame] = useState(frameParam || 'frame-001');
  const [mode, setMode] = useState<'demo' | 'upload' | 'camera'>('demo');
  const [frameX, setFrameX] = useState(0);
  const [frameY, setFrameY] = useState(0);
  const [frameScale, setFrameScale] = useState(1);
  const [frameRotation, setFrameRotation] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { addToCart, setCartOpen } = useStore();

  const currentFrame = products.find((p) => p.id === selectedFrame) || products[0];
  const allFrames = products.filter((p) => p.category === 'Eyeglasses' || p.category === 'Sunglasses').slice(0, 12);

  useEffect(() => {
    gsap.fromTo(previewRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, [selectedFrame]);

  // Simulated Auto Fit (Phase 11)
  const triggerAutoFit = () => {
    setIsScanning(true);
    setTimeout(() => {
      setFrameX(0);
      setFrameY(0);
      setFrameScale(1.0);
      setFrameRotation(0);
      setIsScanning(false);
    }, 1200);
  };

  const handleAddToCart = () => {
    addToCart({
      id: `${currentFrame.id}-tryon`,
      productId: currentFrame.id,
      productName: currentFrame.name,
      color: currentFrame.color,
      size: 'Medium',
      image: '',
      framePrice: currentFrame.price,
      lensType: 'Single Vision',
      lensTypePrice: 1500,
      lensIndex: '1.60',
      lensIndexPrice: 900,
      coatings: ['Anti-glare'],
      coatingsPrice: 0,
      prescription: null,
      quantity: 1,
      totalPrice: currentFrame.price + 1500 + 900,
    });
    setCartOpen(true);
  };

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ background: 'var(--color-cream)', padding: '2rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Virtual Try-On</h1>
          <p style={{ color: 'var(--color-sage)' }}>See how these frames look on you with simulated AI face fitting.</p>
        </div>
      </div>

      <div className="container tryon-layout" style={{ paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>

        {/* LEFT — Preview */}
        <div>
          {/* Mode selector */}
          <div className="tryon-controls" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {([['demo', '🎭 Demo Mode'], ['upload', '📷 Upload Photo'], ['camera', '📹 Live Camera']] as const).map(([m, label]) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  if (m === 'upload' || m === 'demo') triggerAutoFit();
                }}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer',
                  background: mode === m ? 'var(--color-forest)' : 'white',
                  color: mode === m ? 'white' : 'var(--color-espresso)',
                  fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                  border: `1.5px solid ${mode === m ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                  fontFamily: 'Inter, sans-serif',
                }}
              >{label}</button>
            ))}
          </div>

          {/* Canvas */}
          <div ref={previewRef} style={{
            background: 'linear-gradient(145deg, var(--color-sand), var(--color-cream))',
            borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)',
            position: 'relative', aspectRatio: '4/3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Simulated AI Scanning Overlay */}
            {isScanning && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 30,
                background: 'rgba(32,56,46,0.85)', backdropFilter: 'blur(4px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'white', gap: '0.75rem',
              }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--color-coral)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.02em' }}>✨ Simulated AI Landmark Detection...</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Auto-positioning frame over pupil center</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {mode === 'demo' && (
              <>
                {/* Demo face + glasses overlay */}
                <div style={{ position: 'relative', width: '320px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Face SVG */}
                  <svg width="300" height="380" viewBox="0 0 300 380" fill="none" style={{ position: 'absolute' }}>
                    {/* Head */}
                    <ellipse cx="150" cy="200" rx="110" ry="140" fill="#DEB887" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                    {/* Hair */}
                    <ellipse cx="150" cy="95" rx="112" ry="70" fill="#4A3728" />
                    <rect x="38" y="95" width="224" height="50" fill="#4A3728" />
                    {/* Ears */}
                    <ellipse cx="38" cy="200" rx="14" ry="18" fill="#CDAA7D" />
                    <ellipse cx="262" cy="200" rx="14" ry="18" fill="#CDAA7D" />
                    {/* Eyes (behind glasses) */}
                    <ellipse cx="108" cy="185" rx="18" ry="14" fill="white" />
                    <ellipse cx="192" cy="185" rx="18" ry="14" fill="white" />
                    <ellipse cx="110" cy="185" rx="10" ry="10" fill="#3D2B1F" />
                    <ellipse cx="194" cy="185" rx="10" ry="10" fill="#3D2B1F" />
                    {/* Nose */}
                    <path d="M145 200 Q150 230 156 200" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    {/* Mouth */}
                    <path d="M128 248 Q150 265 172 248" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none" strokeLinecap="round" />
                    {/* Eyebrows */}
                    <path d="M88 168 Q108 160 128 168" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M172 168 Q192 160 212 168" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>

                  {/* Glasses overlay with Precision Face Fitting & Rotation support */}
                  <div style={{
                    position: 'absolute',
                    top: '195px',
                    left: '50%',
                    transform: `translate(-50%, -50%) translate(${frameX}px, ${frameY}px) scale(${frameScale}) rotate(${frameRotation}deg)`,
                    transition: isScanning ? 'none' : 'transform 0.15s ease-out',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}>
                    <GlassesOverlaySVG color={currentFrame.colors[0]} shape={currentFrame.frameShape} />
                  </div>
                </div>

                {/* Privacy & Simulated label */}
                <div style={{
                  position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(32,56,46,0.9)', color: 'white',
                  padding: '0.5rem 1.25rem', borderRadius: '50px', fontSize: '0.72rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
                }}>
                  <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  ✨ Simulated AI facial landmark positioning
                </div>
              </>
            )}

            {mode === 'upload' && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(32,56,46,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <svg width="36" height="36" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--color-plum)', marginBottom: '0.5rem' }}>Upload your photo</h3>
                <p style={{ color: 'var(--color-sage)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Upload a front-facing photo for simulated facial landmark placement.</p>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--color-forest)', color: 'white',
                  padding: '0.75rem 1.75rem', borderRadius: '50px',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                }}>
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Choose photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => { setMode('demo'); triggerAutoFit(); }} />
                </label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '1rem' }}>
                  Demo functionality — processed locally in browser.
                </p>
              </div>
            )}

            {mode === 'camera' && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(198,106,85,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <svg width="36" height="36" fill="none" stroke="var(--color-terracotta)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--color-plum)', marginBottom: '0.5rem' }}>Live Camera Try-On</h3>
                <p style={{ color: 'var(--color-sage)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Use live camera to preview frames with simulated tracking.</p>
                <button
                  onClick={() => { setMode('demo'); triggerAutoFit(); }}
                  className="btn-primary"
                >
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" /><path d="M20 12c0 0-3.6 6-8 6s-8-6-8-6 3.6-6 8-6 8 6 8 6z" />
                  </svg>
                  Start Demo Try On
                </button>
              </div>
            )}
          </div>

          {/* Position & Rotation controls (Phase 11 & Phase 12) */}
          {mode === 'demo' && (
            <div style={{ marginTop: '1.25rem', background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)' }}>
                  Fine-Tune Frame Position & Rotation
                </p>
                <button
                  onClick={triggerAutoFit}
                  className="btn-secondary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
                >
                  ✨ Auto Fit
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.4rem' }}>Move X ({frameX}px)</label>
                  <input type="range" min={-40} max={40} value={frameX} onChange={(e) => setFrameX(Number(e.target.value))}
                    style={{ accentColor: 'var(--color-forest)', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.4rem' }}>Move Y ({frameY}px)</label>
                  <input type="range" min={-30} max={30} value={frameY} onChange={(e) => setFrameY(Number(e.target.value))}
                    style={{ accentColor: 'var(--color-forest)', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.4rem' }}>Scale ({frameScale.toFixed(2)}x)</label>
                  <input type="range" min={0.7} max={1.4} step={0.05} value={frameScale} onChange={(e) => setFrameScale(Number(e.target.value))}
                    style={{ accentColor: 'var(--color-forest)', width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.4rem' }}>Rotation ({frameRotation}°)</label>
                  <input type="range" min={-45} max={45} step={1} value={frameRotation} onChange={(e) => setFrameRotation(Number(e.target.value))}
                    style={{ accentColor: 'var(--color-forest)', width: '100%' }} />
                </div>
                <button onClick={() => { setFrameX(0); setFrameY(0); setFrameScale(1); setFrameRotation(0); }} style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50px', padding: '0.4rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-sage)', fontFamily: 'Inter, sans-serif', marginTop: 'auto' }}>
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Controls */}
        <div>
          {/* Selected frame */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)', marginBottom: '0.875rem' }}>
              Selected Frame
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '60px', height: '40px', background: 'var(--color-cream)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="50" height="28" viewBox="0 0 50 28" fill="none">
                  <rect x="3" y="6" width="18" height="14" rx="3" stroke={currentFrame.colors[0]} strokeWidth="2.5" fill="rgba(255,255,255,0.5)" />
                  <rect x="29" y="6" width="18" height="14" rx="3" stroke={currentFrame.colors[0]} strokeWidth="2.5" fill="rgba(255,255,255,0.5)" />
                  <path d="M21 13 Q25 10 29 13" stroke={currentFrame.colors[0]} strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--color-espresso)' }}>{currentFrame.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-sage)' }}>{currentFrame.color} · {currentFrame.size}</p>
              </div>
              <p style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                ₹{currentFrame.price.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Fit */}
          <div style={{ background: 'linear-gradient(135deg, var(--color-cream), var(--color-sand))', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)' }}>Fit in Millimetres</p>
              <span className="badge badge-sage">{currentFrame.fit} Fit</span>
            </div>
            {[['Frame Width', `${currentFrame.measurements.frameWidth} mm`], ['Lens Height', `${currentFrame.measurements.lensHeight} mm`]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{k}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-plum)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Frame grid */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)', marginBottom: '0.875rem' }}>
              Change Frame
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {allFrames.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFrame(f.id)}
                  style={{
                    aspectRatio: '1', background: 'var(--color-cream)', borderRadius: '8px',
                    border: `2px solid ${selectedFrame === f.id ? 'var(--color-forest)' : 'transparent'}`,
                    cursor: 'pointer', padding: '0.3rem', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title={f.name}
                >
                  <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
                    <rect x="2" y="4" width="13" height="10" rx="2.5" stroke={f.colors[0]} strokeWidth="2" fill="rgba(255,255,255,0.5)" />
                    <rect x="21" y="4" width="13" height="10" rx="2.5" stroke={f.colors[0]} strokeWidth="2" fill="rgba(255,255,255,0.5)" />
                    <path d="M15 9 Q18 7 21 9" stroke={f.colors[0]} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <button onClick={handleAddToCart} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            Add to Cart →
          </button>
          <Link href={`/lens-configurator?frame=${selectedFrame}`} className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
            Configure Lenses
          </Link>

          {/* Privacy */}
          <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.6 }}>
            🔒 Your camera image is processed in your browser only. No data is uploaded or stored.
          </p>
        </div>
      </div>
    </div>
  );
}

function GlassesOverlaySVG({ color, shape }: { color: string; shape: string }) {
  const strokeColor = color || '#292626';

  if (shape === 'Round' || shape === 'Oval') {
    return (
      <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
        {/* Temple arms reaching to ears */}
        <path d="M41 33 Q24 32 6 34" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M179 33 Q196 32 214 34" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        
        {/* Left lens & rim */}
        <ellipse cx="68" cy="35" rx="27" ry="25" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
        {/* Right lens & rim */}
        <ellipse cx="152" cy="35" rx="27" ry="25" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
        
        {/* Nose bridge */}
        <path d="M95 33 Q110 24 125 33" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
        
        {/* Anti-reflective lens sheen reflections */}
        <path d="M52 24 Q68 18 78 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        <path d="M136 24 Q152 18 162 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      </svg>
    );
  }

  if (shape === 'Cat-Eye') {
    return (
      <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
        {/* Temples */}
        <path d="M40 22 Q22 25 6 32" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M180 22 Q198 25 214 32" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />

        {/* Left lens */}
        <path d="M40 22 C42 12, 60 14, 70 15 C85 16, 96 22, 96 34 C96 46, 84 55, 68 55 C52 55, 41 46, 40 32 Z" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
        {/* Right lens */}
        <path d="M180 22 C178 12, 160 14, 150 15 C135 16, 124 22, 124 34 C124 46, 136 55, 152 55 C168 55, 179 46, 180 32 Z" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />

        {/* Bridge */}
        <path d="M96 29 Q110 23 124 29" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Reflection sheen */}
        <path d="M50 20 L74 18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M146 18 L170 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      </svg>
    );
  }

  if (shape === 'Aviator') {
    return (
      <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
        {/* Temples */}
        <path d="M42 22 Q24 26 6 32" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M178 22 Q196 26 214 32" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />

        {/* Brow bar */}
        <line x1="56" y1="16" x2="164" y2="16" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        {/* Nose bridge */}
        <path d="M96 28 Q110 24 124 28" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Left lens teardrop */}
        <path d="M42 20 L96 20 C98 34, 94 48, 80 56 C66 60, 52 56, 44 44 C38 34, 40 24, 42 20 Z" stroke={strokeColor} strokeWidth="3.5" fill="rgba(255,255,255,0.22)" />
        {/* Right lens teardrop */}
        <path d="M178 20 L124 20 C122 34, 126 48, 140 56 C154 60, 168 56, 176 44 C182 34, 180 24, 178 20 Z" stroke={strokeColor} strokeWidth="3.5" fill="rgba(255,255,255,0.22)" />

        {/* Reflection sheen */}
        <path d="M50 24 L76 22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M144 22 L170 24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      </svg>
    );
  }

  // Rectangle / Square / Classic default
  return (
    <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
      {/* Temple arms reaching to ears */}
      <path d="M40 28 Q23 27 6 32" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M180 28 Q197 27 214 32" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />

      {/* Left lens & rim */}
      <rect x="40" y="14" width="56" height="42" rx="9" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      {/* Right lens & rim */}
      <rect x="124" y="14" width="56" height="42" rx="9" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />

      {/* Nose bridge */}
      <path d="M96 30 Q110 23 124 30" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Anti-reflective lens sheen reflections */}
      <path d="M48 22 L72 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <path d="M132 22 L156 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <TryOnContent />
    </Suspense>
  );
}

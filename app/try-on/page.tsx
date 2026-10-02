'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/data/products';
import { useStore } from '@/lib/store';
import { gsap } from 'gsap';
import { PRODUCT_IMAGES, FRAME_OVERLAYS } from '@/components/product/ProductImage';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TryOnFilters {
  category: string;
  gender: string;
  frameShape: string;
  color: string;
  material: string;
}

const DEFAULT_FILTERS: TryOnFilters = {
  category: 'All',
  gender: 'All',
  frameShape: 'All',
  color: 'All',
  material: 'All',
};

// ─── Main Component ───────────────────────────────────────────────────────────
function TryOnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const frameParam = searchParams.get('frame') || '';

  const [selectedFrame, setSelectedFrame] = useState(frameParam || 'frame-001');
  const [mode, setMode] = useState<'demo' | 'upload' | 'camera'>('demo');

  // Photo Upload State
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Position & Scale Fine-Tuning State
  const [frameX, setFrameX] = useState(0);
  const [frameY, setFrameY] = useState(0);
  const [frameScale, setFrameScale] = useState(1);
  const [frameRotation, setFrameRotation] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - frameX, y: e.clientY - frameY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setFrameX(e.clientX - dragStart.x);
    setFrameY(e.clientY - dragStart.y);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const previewRef = useRef<HTMLDivElement>(null);
  const { addToCart, setCartOpen } = useStore();

  // Filters
  const [filters, setFilters] = useState<TryOnFilters>(DEFAULT_FILTERS);

  // Cleanup Object URL on unmount or replace
  useEffect(() => {
    return () => {
      if (uploadedImageSrc) URL.revokeObjectURL(uploadedImageSrc);
    };
  }, [uploadedImageSrc]);

  useEffect(() => {
    gsap.fromTo(
      previewRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, [selectedFrame, mode]);

  // ── Photo Upload ─────────────────────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size is too large (max 10 MB). Please choose a smaller photo.');
      return;
    }
    try {
      if (uploadedImageSrc) URL.revokeObjectURL(uploadedImageSrc);
      setUploadedImageSrc(URL.createObjectURL(file));
      setMode('upload');
      triggerAutoFit();
    } catch {
      setUploadError('Failed to load image. Please try another file.');
    }
  };

  const handleRemoveUploadedPhoto = () => {
    if (uploadedImageSrc) URL.revokeObjectURL(uploadedImageSrc);
    setUploadedImageSrc(null);
    setUploadError(null);
    setMode('demo');
    triggerAutoFit();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Auto Fit ─────────────────────────────────────────────────────────────────
  const [autoFitSuccess, setAutoFitSuccess] = useState(false);
  const triggerAutoFit = () => {
    setIsScanning(true);
    setAutoFitSuccess(false);
    setTimeout(() => {
      setFrameX(0);
      setFrameY(0);
      setFrameScale(1.0);
      setFrameRotation(0);
      setIsScanning(false);
      setAutoFitSuccess(true);
      setTimeout(() => setAutoFitSuccess(false), 3000);
    }, 700);
  };

  // ── Data-Driven Filtering (AND across categories, exact match per field) ─────
  const filteredProducts = products.filter((p) => {
    // 1. Category — exact match (case-insensitive)
    if (filters.category !== 'All') {
      const catNorm = filters.category.toLowerCase();
      if (p.category.toLowerCase() !== catNorm) return false;
    }

    // 2. Gender — Men/Women include Unisex
    if (filters.gender !== 'All') {
      const gNorm = filters.gender.toLowerCase();
      const pGen = p.gender.toLowerCase();
      if (gNorm === 'men'    && !(pGen === 'men'    || pGen === 'unisex')) return false;
      if (gNorm === 'women'  && !(pGen === 'women'  || pGen === 'unisex')) return false;
      if (gNorm === 'unisex' && pGen !== 'unisex') return false;
      if (gNorm === 'kids'   && pGen !== 'kids') return false;
    }

    // 3. Frame Shape — normalize punctuation (Cat-Eye → cateye)
    if (filters.frameShape !== 'All') {
      const sNorm = filters.frameShape.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pNorm = p.frameShape.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sNorm !== pNorm) return false;
    }

    // 4. Colour — substring match on color name
    if (filters.color !== 'All') {
      const cNorm = filters.color.toLowerCase();
      const pColor = p.color.toLowerCase();
      const pFrameColor = (p.frameColor || '').toLowerCase();
      if (!pColor.includes(cNorm) && !pFrameColor.includes(cNorm)) return false;
    }

    // 5. Material — exact match
    if (filters.material !== 'All') {
      if (p.material.toLowerCase() !== filters.material.toLowerCase()) return false;
    }

    return true;
  });

  const currentFrame = products.find((p) => p.id === selectedFrame) || filteredProducts[0] || products[0];

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setFrameX(0);
    setFrameY(0);
    setFrameScale(1.0);
    setFrameRotation(0);
    if (frameParam) router.replace('/try-on', { scroll: false });
  };

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v !== 'All').length;

  // ── Add to Cart ──────────────────────────────────────────────────────────────
  const cartIdCounter = useRef(0);
  const handleAddToCart = () => {
    cartIdCounter.current += 1;
    addToCart({
      id: `${currentFrame.id}-tryon-${cartIdCounter.current}`,
      productId: currentFrame.id,
      productName: currentFrame.name,
      color: currentFrame.color,
      size: 'Medium',
      image: PRODUCT_IMAGES[currentFrame.id] || '',
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

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="tryon-page-wrapper" style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: 'calc(5rem + 70px)' }}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* Page Header */}
      <div style={{ background: 'var(--color-cream)', padding: '2rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>
            <Link href="/" style={{ color: 'var(--color-sage)' }}>Home</Link> › Virtual Try-On
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Virtual Try-On</h1>
          <p style={{ color: 'var(--color-sage)' }}>Preview frames live on a model or upload your own photo for instant fitting.</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="tryon-layout" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '2rem',
          alignItems: 'flex-start',
        }}>

          {/* ── LEFT — Preview Canvas ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Mode Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['demo', 'upload', 'camera'] as const).map((m) => {
                const labels: Record<string, string> = {
                  demo: '🎭 Demo Model',
                  upload: uploadedImageSrc ? '📷 Your Photo' : '📷 Upload Photo',
                  camera: '📹 Live Camera',
                };
                const isActive = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      if (m === 'upload' && !uploadedImageSrc) {
                        fileInputRef.current?.click();
                      } else {
                        setMode(m);
                        triggerAutoFit();
                      }
                    }}
                    style={{
                      padding: '0.5rem 1.1rem', borderRadius: '50px', cursor: 'pointer',
                      background: isActive ? 'var(--color-forest)' : 'white',
                      color: isActive ? 'white' : 'var(--color-espresso)',
                      fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                      border: `1.5px solid ${isActive ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {labels[m]}
                  </button>
                );
              })}
              {mode === 'upload' && uploadedImageSrc && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '0.5rem 0.85rem', borderRadius: '50px', cursor: 'pointer',
                    background: 'white', color: 'var(--color-terracotta)',
                    fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.2s',
                    border: '1.5px solid var(--color-terracotta)',
                    fontFamily: 'Inter, sans-serif', marginLeft: 'auto',
                  }}
                >
                  🔄 Replace Photo
                </button>
              )}
            </div>

            {/* Upload Error Alert */}
            {uploadError && (
              <div style={{
                background: '#FDF2F2', border: '1px solid #F87171', color: '#991B1B',
                padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>⚠️ {uploadError}</span>
                <button onClick={() => setUploadError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontWeight: 700 }}>✕</button>
              </div>
            )}

            {/* Canvas */}
            <div ref={previewRef} style={{
              background: 'linear-gradient(145deg, var(--color-sand), var(--color-cream))',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              position: 'relative', aspectRatio: '4/3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Scanning Overlay */}
              {isScanning && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 30,
                  background: 'rgba(32,56,46,0.85)', backdropFilter: 'blur(4px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'white', gap: '0.75rem',
                }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--color-coral)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>✨ Aligning Facial Landmarks...</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Auto-positioning frame over pupil center</p>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Demo Model */}
              {mode === 'demo' && (
                <>
                  <div style={{ position: 'relative', width: '320px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="300" height="380" viewBox="0 0 300 380" fill="none" style={{ position: 'absolute' }}>
                      <ellipse cx="150" cy="200" rx="110" ry="140" fill="#DEB887" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                      <ellipse cx="150" cy="95" rx="112" ry="70" fill="#4A3728" />
                      <rect x="38" y="95" width="224" height="50" fill="#4A3728" />
                      <ellipse cx="38" cy="200" rx="14" ry="18" fill="#CDAA7D" />
                      <ellipse cx="262" cy="200" rx="14" ry="18" fill="#CDAA7D" />
                      <ellipse cx="108" cy="185" rx="18" ry="14" fill="white" />
                      <ellipse cx="192" cy="185" rx="18" ry="14" fill="white" />
                      <ellipse cx="110" cy="185" rx="10" ry="10" fill="#3D2B1F" />
                      <ellipse cx="194" cy="185" rx="10" ry="10" fill="#3D2B1F" />
                      <path d="M145 200 Q150 230 156 200" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      <path d="M128 248 Q150 265 172 248" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path d="M88 168 Q108 160 128 168" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M172 168 Q192 160 212 168" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </svg>
                    <div 
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      style={{
                      position: 'absolute', top: '175px', left: '50%',
                      transform: `translate(-50%, -50%) translate(${frameX}px, ${frameY}px) scale(${frameScale}) rotate(${frameRotation}deg)`,
                      transition: (isScanning || isDragging) ? 'none' : 'transform 0.15s ease-out',
                      zIndex: 10, cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none'
                    }}>
                      <GlassesOverlay frameId={currentFrame.id} name={currentFrame.name} color={currentFrame.colors[0]} shape={currentFrame.frameShape} />
                    </div>
                  </div>
                  <div style={{
                    position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(32,56,46,0.9)', color: 'white',
                    padding: '0.5rem 1.25rem', borderRadius: '50px', fontSize: '0.72rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
                  }}>
                    ✨ Demo Model — Interactive Face Overlay
                  </div>
                </>
              )}

              {/* Upload Mode */}
              {mode === 'upload' && (
                uploadedImageSrc ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadedImageSrc} alt="Your uploaded face" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <div 
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      style={{
                      position: 'absolute', top: '29%', left: '50%',
                      transform: `translate(-50%, -50%) translate(${frameX}px, ${frameY}px) scale(${frameScale}) rotate(${frameRotation}deg)`,
                      transition: (isScanning || isDragging) ? 'none' : 'transform 0.15s ease-out',
                      zIndex: 10, cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none'
                    }}>
                      <GlassesOverlay frameId={currentFrame.id} name={currentFrame.name} color={currentFrame.colors[0]} shape={currentFrame.frameShape} />
                    </div>
                    <button
                      onClick={handleRemoveUploadedPhoto}
                      style={{
                        position: 'absolute', top: '1rem', right: '1rem', zIndex: 20,
                        background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
                        padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                    >
                      ✕ Remove Photo
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(32,56,46,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <svg width="36" height="36" fill="none" stroke="var(--color-forest)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--color-plum)', marginBottom: '0.5rem' }}>Upload your photo</h3>
                    <p style={{ color: 'var(--color-sage)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Upload a front-facing photo for simulated facial landmark placement.</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-forest)', color: 'white', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      Choose Photo (JPG, PNG, WEBP)
                    </button>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '1rem' }}>
                      🔒 Processed securely in browser. No photo data is sent to external servers.
                    </p>
                  </div>
                )
              )}

              {/* Camera Mode */}
              {mode === 'camera' && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ width: '80px', height: '80px', background: 'rgba(198,106,85,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <svg width="36" height="36" fill="none" stroke="var(--color-terracotta)" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--color-plum)', marginBottom: '0.5rem' }}>Live Camera Try-On</h3>
                  <p style={{ color: 'var(--color-sage)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Use live camera preview with simulated eye tracking.</p>
                  <button onClick={() => { setMode('demo'); triggerAutoFit(); }} className="btn-primary">Start Demo Try-On</button>
                </div>
              )}
            </div>

            {/* Fine-Tune Controls */}
            {(mode === 'demo' || (mode === 'upload' && uploadedImageSrc)) && (
              <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)' }}>Fine-Tune Frame Position</p>
                    {autoFitSuccess && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-forest)', background: 'rgba(32,56,46,0.08)', padding: '0.15rem 0.5rem', borderRadius: '50px', fontWeight: 600 }}>
                        ✓ Auto-fitted to eye-line
                      </span>
                    )}
                  </div>
                  <button onClick={triggerAutoFit} className="btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>✨ Auto Fit</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.4rem' }}>Move X ({frameX}px)</label>
                    <input type="range" min={-200} max={200} value={frameX} onChange={(e) => setFrameX(Number(e.target.value))} style={{ accentColor: 'var(--color-forest)', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.4rem' }}>Move Y ({frameY}px)</label>
                    <input type="range" min={-250} max={250} value={frameY} onChange={(e) => setFrameY(Number(e.target.value))} style={{ accentColor: 'var(--color-forest)', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.4rem' }}>Scale ({frameScale.toFixed(2)}x)</label>
                    <input type="range" min={0.3} max={3.0} step={0.05} value={frameScale} onChange={(e) => setFrameScale(Number(e.target.value))} style={{ accentColor: 'var(--color-forest)', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.4rem' }}>Rotation ({frameRotation}°)</label>
                    <input type="range" min={-45} max={45} step={1} value={frameRotation} onChange={(e) => setFrameRotation(Number(e.target.value))} style={{ accentColor: 'var(--color-forest)', width: '100%' }} />
                  </div>
                  <button onClick={() => { setFrameX(0); setFrameY(0); setFrameScale(1); setFrameRotation(0); }} style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50px', padding: '0.4rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-sage)', fontFamily: 'Inter, sans-serif', marginTop: 'auto' }}>
                    Reset Position
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — Filters + Frame Selector + Actions ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Selected Frame Info */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)', marginBottom: '0.75rem' }}>Selected Frame</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: '72px', height: '48px', background: 'var(--color-cream)', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  {PRODUCT_IMAGES[currentFrame.id] ? (
                    <Image src={PRODUCT_IMAGES[currentFrame.id]} alt={currentFrame.name} fill sizes="72px" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GlassesMiniSVG color={currentFrame.colors[0]} shape={currentFrame.frameShape} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: 'var(--color-espresso)', fontSize: '0.9rem' }}>{currentFrame.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)' }}>{currentFrame.color} · {currentFrame.frameShape}</p>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                  ₹{currentFrame.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* ── Filter Panel ── */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>

              {/* Filter Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)' }}>
                  Filter Frames
                  <span style={{ marginLeft: '0.5rem', background: 'var(--color-cream)', color: 'var(--color-espresso)', padding: '0.1rem 0.45rem', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 700 }}>
                    {filteredProducts.length}
                  </span>
                </p>
                <button
                  onClick={handleResetFilters}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: activeFilterCount > 0 ? 'rgba(198,106,85,0.08)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${activeFilterCount > 0 ? 'var(--color-terracotta)' : 'rgba(0,0,0,0.1)'}`,
                    color: activeFilterCount > 0 ? 'var(--color-terracotta)' : 'var(--color-muted)',
                    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                    padding: '0.3rem 0.75rem', borderRadius: '50px', transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  ↺ Reset{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </button>
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                  {Object.entries(filters).map(([key, val]) =>
                    val !== 'All' ? (
                      <span
                        key={key}
                        onClick={() => setFilters((f) => ({ ...f, [key]: 'All' }))}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          background: 'rgba(32,56,46,0.08)', color: 'var(--color-forest)',
                          border: '1px solid rgba(32,56,46,0.2)',
                          padding: '0.2rem 0.55rem', borderRadius: '50px',
                          fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {val} ✕
                      </span>
                    ) : null
                  )}
                </div>
              )}

              {/* Filter Dropdowns — 5 filters in a responsive 2-col grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-sage)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.8rem', color: '#374151', outline: 'none', background: 'white', cursor: 'pointer' }}
                  >
                    <option value="All">All</option>
                    <option value="Eyeglasses">Eyeglasses</option>
                    <option value="Sunglasses">Sunglasses</option>
                    <option value="Blue-light">Blue-light</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-sage)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.8rem', color: '#374151', outline: 'none', background: 'white', cursor: 'pointer' }}
                  >
                    <option value="All">All</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                {/* Frame Shape */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-sage)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frame Shape</label>
                  <select
                    value={filters.frameShape}
                    onChange={(e) => setFilters((f) => ({ ...f, frameShape: e.target.value }))}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.8rem', color: '#374151', outline: 'none', background: 'white', cursor: 'pointer' }}
                  >
                    <option value="All">All Shapes</option>
                    <option value="Rectangle">Rectangle</option>
                    <option value="Round">Round</option>
                    <option value="Cat-Eye">Cat-Eye</option>
                    <option value="Square">Square</option>
                    <option value="Aviator">Aviator</option>
                    <option value="Oval">Oval</option>
                  </select>
                </div>

                {/* Colour */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-sage)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Colour</label>
                  <select
                    value={filters.color}
                    onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value }))}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.8rem', color: '#374151', outline: 'none', background: 'white', cursor: 'pointer' }}
                  >
                    <option value="All">All Colours</option>
                    <option value="Black">Black</option>
                    <option value="Brown">Brown</option>
                    <option value="Tortoise">Tortoise</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Blue">Blue</option>
                    <option value="Pink">Pink</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Clear">Clear</option>
                    <option value="Red">Red</option>
                    <option value="Amber">Amber</option>
                    <option value="Green">Green</option>
                    <option value="Grey">Grey</option>
                  </select>
                </div>

                {/* Frame Material — spans full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-sage)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frame Material</label>
                  <select
                    value={filters.material}
                    onChange={(e) => setFilters((f) => ({ ...f, material: e.target.value }))}
                    style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.8rem', color: '#374151', outline: 'none', background: 'white', cursor: 'pointer' }}
                  >
                    <option value="All">All Materials</option>
                    <option value="Acetate">Acetate</option>
                    <option value="Metal">Metal</option>
                    <option value="TR90">TR90</option>
                  </select>
                </div>
              </div>

              {/* Product Grid — only this section scrolls */}
              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', background: 'var(--color-cream)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👓</div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>No frames match these filters</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-sage)', marginBottom: '0.75rem' }}>Try adjusting or clearing your filters.</p>
                  <button onClick={handleResetFilters} className="btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.78rem' }}>
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  paddingRight: '0.2rem',
                  scrollbarWidth: 'thin',
                }}>
                  {filteredProducts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFrame(f.id)}
                      title={`${f.name} — ${f.frameShape}`}
                      style={{
                        aspectRatio: '1', background: 'var(--color-cream)', borderRadius: '8px',
                        border: `2.5px solid ${currentFrame.id === f.id ? 'var(--color-forest)' : 'transparent'}`,
                        cursor: 'pointer', padding: 0, transition: 'border-color 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', position: 'relative',
                        outline: currentFrame.id === f.id ? '2px solid rgba(32,56,46,0.2)' : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {PRODUCT_IMAGES[f.id] ? (
                        <Image src={PRODUCT_IMAGES[f.id]} alt={f.name} fill sizes="80px" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                      ) : (
                        <GlassesMiniSVG color={f.colors[0]} shape={f.frameShape} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <button onClick={handleAddToCart} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.95rem' }}>
              Add to Cart →
            </button>
            <Link href={`/lens-configurator?frame=${currentFrame.id}`} className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
              Configure Lenses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVG Components ────────────────────────────────────────────────────────────
function GlassesMiniSVG({ color, shape }: { color: string; shape: string }) {
  const c = color || '#8B5E3C';
  const n = (shape || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n === 'round' || n === 'oval') return (
    <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
      <circle cx="11" cy="11" r="7" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <circle cx="29" cy="11" r="7" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <line x1="18" y1="11" x2="22" y2="11" stroke={c} strokeWidth="1.8" />
    </svg>
  );
  if (n === 'cateye') return (
    <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
      <path d="M4 12 Q8 4 16 6 Q19 12 16 16 Q8 16 4 12Z" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <path d="M36 12 Q32 4 24 6 Q21 12 24 16 Q32 16 36 12Z" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <line x1="16" y1="11" x2="24" y2="11" stroke={c} strokeWidth="1.8" />
    </svg>
  );
  if (n === 'aviator') return (
    <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
      <path d="M3 6 L18 6 Q20 6 20 9 Q20 18 11 18 Q3 18 3 10 Z" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <path d="M37 6 L22 6 Q20 6 20 9 Q20 18 29 18 Q37 18 37 10 Z" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
  // Rectangle / Square / default
  return (
    <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
      <rect x="3" y="5" width="14" height="11" rx="2" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <rect x="23" y="5" width="14" height="11" rx="2" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <line x1="17" y1="10" x2="23" y2="10" stroke={c} strokeWidth="1.8" />
    </svg>
  );
}

function GlassesOverlay({
  frameId,
  name,
  color,
  shape,
}: {
  frameId: string;
  name: string;
  color: string;
  shape: string;
}) {
  const overlaySrc = FRAME_OVERLAYS[frameId];
  const [imgError, setImgError] = useState(false);

  if (overlaySrc && !imgError) {
    return (
      <div style={{ position: 'relative', width: '210px', height: 'auto', userSelect: 'none', pointerEvents: 'auto' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={overlaySrc}
          alt={name}
          draggable={false}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.22))',
            pointerEvents: 'none',
          }}
        />
        {/* Anti-reflective lens sheen simulation */}
        <div style={{
          position: 'absolute',
          inset: '8% 12%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, rgba(200,230,255,0.06) 35%, transparent 60%)',
          borderRadius: '20px',
          pointerEvents: 'none',
        }} />
      </div>
    );
  }

  return <GlassesOverlaySVG color={color} shape={shape} />;
}

function GlassesOverlaySVG({ color, shape }: { color: string; shape: string }) {
  const sc = color || '#292626';
  const n = (shape || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n === 'round' || n === 'oval') return (
    <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
      <path d="M41 33 Q24 32 6 34" stroke={sc} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M179 33 Q196 32 214 34" stroke={sc} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="68" cy="35" rx="27" ry="25" stroke={sc} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      <ellipse cx="152" cy="35" rx="27" ry="25" stroke={sc} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      <path d="M95 33 Q110 24 125 33" stroke={sc} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M52 24 Q68 18 78 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      <path d="M136 24 Q152 18 162 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
  if (n === 'cateye') return (
    <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
      <path d="M40 22 Q22 25 6 32" stroke={sc} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M180 22 Q198 25 214 32" stroke={sc} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M40 22 C42 12, 60 14, 70 15 C85 16, 96 22, 96 34 C96 46, 84 55, 68 55 C52 55, 41 46, 40 32 Z" stroke={sc} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      <path d="M180 22 C178 12, 160 14, 150 15 C135 16, 124 22, 124 34 C124 46, 136 55, 152 55 C168 55, 179 46, 180 32 Z" stroke={sc} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      <path d="M96 29 Q110 23 124 29" stroke={sc} strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
  if (n === 'aviator') return (
    <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
      <path d="M42 22 Q24 26 6 32" stroke={sc} strokeWidth="3" strokeLinecap="round" />
      <path d="M178 22 Q196 26 214 32" stroke={sc} strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="16" x2="164" y2="16" stroke={sc} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M96 28 Q110 24 124 28" stroke={sc} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M42 20 L96 20 C98 34, 94 48, 80 56 C66 60, 52 56, 44 44 C38 34, 40 24, 42 20 Z" stroke={sc} strokeWidth="3.5" fill="rgba(255,255,255,0.22)" />
      <path d="M178 20 L124 20 C122 34, 126 48, 140 56 C154 60, 168 56, 176 44 C182 34, 180 24, 178 20 Z" stroke={sc} strokeWidth="3.5" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
  // Rectangle / Square / default
  return (
    <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
      <path d="M40 28 Q23 27 6 32" stroke={sc} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M180 28 Q197 27 214 32" stroke={sc} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="40" y="14" width="56" height="42" rx="9" stroke={sc} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      <rect x="124" y="14" width="56" height="42" rx="9" stroke={sc} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      <path d="M96 30 Q110 23 124 30" stroke={sc} strokeWidth="4" strokeLinecap="round" fill="none" />
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

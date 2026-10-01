'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { products, Product } from '@/data/products';
import { useStore } from '@/lib/store';
import { gsap } from 'gsap';
import { PRODUCT_IMAGES, PRODUCT_TINTS } from '@/components/product/ProductImage';

const FILTER_OPTIONS = {
  category: ['All', 'Eyeglasses', 'Sunglasses', 'Blue-light', 'Kids'],
  gender: ['All', 'Men', 'Women', 'Unisex', 'Kids'],
  frameShape: ['All', 'Rectangle', 'Round', 'Cat-Eye', 'Square', 'Aviator', 'Oval'],
  color: ['All', 'Black', 'Brown', 'Gold', 'Silver', 'Blue', 'Transparent', 'Green', 'Pink', 'Rose Gold', 'Tortoise'],
  material: ['All', 'Acetate', 'Metal', 'TR90'],
};

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
  const previewRef = useRef<HTMLDivElement>(null);
  const { addToCart, setCartOpen } = useStore();

  // Try-On Filters State
  const [filters, setFilters] = useState({
    category: 'All',
    gender: 'All',
    frameShape: 'All',
    color: 'All',
    material: 'All',
  });

  // Cleanup Object URL on unmount or replace
  useEffect(() => {
    return () => {
      if (uploadedImageSrc) {
        URL.revokeObjectURL(uploadedImageSrc);
      }
    };
  }, [uploadedImageSrc]);

  useEffect(() => {
    gsap.fromTo(
      previewRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, [selectedFrame, mode]);

  // Handle Client Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // 1. Format Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // 2. Size Validation (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size is too large (max 10MB). Please choose a smaller photo.');
      return;
    }

    try {
      if (uploadedImageSrc) {
        URL.revokeObjectURL(uploadedImageSrc);
      }
      const objectUrl = URL.createObjectURL(file);
      setUploadedImageSrc(objectUrl);
      setMode('upload');
      triggerAutoFit();
    } catch (err) {
      setUploadError('Failed to load image. Please try another file.');
    }
  };

  const handleRemoveUploadedPhoto = () => {
    if (uploadedImageSrc) {
      URL.revokeObjectURL(uploadedImageSrc);
    }
    setUploadedImageSrc(null);
    setUploadError(null);
    setMode('demo');
    triggerAutoFit();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Simulated Auto Fit
  const triggerAutoFit = () => {
    setIsScanning(true);
    setTimeout(() => {
      setFrameX(0);
      setFrameY(0);
      setFrameScale(1.0);
      setFrameRotation(0);
      setIsScanning(false);
    }, 1000);
  };

  // Canonical Data-Driven Filtering Logic for Try-On Carousel
  const filteredProducts = products.filter((p) => {
    // 1. Category
    if (filters.category !== 'All') {
      const catLower = filters.category.toLowerCase();
      const pCatLower = p.category.toLowerCase();
      if (pCatLower !== catLower && !(catLower === 'kids' && p.gender.toLowerCase() === 'kids')) {
        return false;
      }
    }

    // 2. Gender
    if (filters.gender !== 'All') {
      const gNorm = filters.gender.toLowerCase();
      const pGen = p.gender.toLowerCase();
      const pCat = p.category.toLowerCase();
      if (gNorm === 'men' && !(pGen === 'men' || pGen === 'unisex')) return false;
      if (gNorm === 'women' && !(pGen === 'women' || pGen === 'unisex')) return false;
      if (gNorm === 'unisex' && pGen !== 'unisex') return false;
      if (gNorm === 'kids' && !(pGen === 'kids' || pCat === 'kids')) return false;
    }

    // 3. Frame Shape
    if (filters.frameShape !== 'All') {
      const sNorm = filters.frameShape.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pNorm = p.frameShape.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sNorm !== pNorm) return false;
    }

    // 4. Color
    if (filters.color !== 'All') {
      const cNorm = filters.color.toLowerCase();
      const pColor = p.color.toLowerCase();
      const pFrameColor = (p.frameColor || '').toLowerCase();
      if (!pColor.includes(cNorm) && !pFrameColor.includes(cNorm)) return false;
    }

    // 5. Material
    if (filters.material !== 'All') {
      if (p.material.toLowerCase() !== filters.material.toLowerCase()) return false;
    }

    return true;
  });

  const currentFrame = products.find((p) => p.id === selectedFrame) || filteredProducts[0] || products[0];

  // Complete Filter Reset
  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      gender: 'All',
      frameShape: 'All',
      color: 'All',
      material: 'All',
    });
    setFrameX(0);
    setFrameY(0);
    setFrameScale(1.0);
    setFrameRotation(0);
    if (frameParam) {
      router.replace('/try-on', { scroll: false });
    }
  };

  const activeFilterCount =
    (filters.category !== 'All' ? 1 : 0) +
    (filters.gender !== 'All' ? 1 : 0) +
    (filters.frameShape !== 'All' ? 1 : 0) +
    (filters.color !== 'All' ? 1 : 0) +
    (filters.material !== 'All' ? 1 : 0);

  const handleAddToCart = () => {
    addToCart({
      id: `${currentFrame.id}-tryon`,
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

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* Header */}
      <div style={{ background: 'var(--color-cream)', padding: '2rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Virtual Try-On</h1>
          <p style={{ color: 'var(--color-sage)' }}>Preview frames live on a model or upload your own photo for instant fitting.</p>
        </div>
      </div>

      <div className="container tryon-layout" style={{ paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>

        {/* LEFT — Canvas Preview */}
        <div>
          {/* Mode Selector */}
          <div className="tryon-controls" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setMode('demo');
                triggerAutoFit();
              }}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: '50px', cursor: 'pointer',
                background: mode === 'demo' ? 'var(--color-forest)' : 'white',
                color: mode === 'demo' ? 'white' : 'var(--color-espresso)',
                fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                border: `1.5px solid ${mode === 'demo' ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              🎭 Demo Model
            </button>

            <button
              onClick={() => {
                if (uploadedImageSrc) {
                  setMode('upload');
                } else {
                  fileInputRef.current?.click();
                }
              }}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: '50px', cursor: 'pointer',
                background: mode === 'upload' ? 'var(--color-forest)' : 'white',
                color: mode === 'upload' ? 'white' : 'var(--color-espresso)',
                fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                border: `1.5px solid ${mode === 'upload' ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              📷 {uploadedImageSrc ? 'Your Uploaded Photo' : 'Upload Photo'}
            </button>

            <button
              onClick={() => {
                setMode('camera');
                triggerAutoFit();
              }}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: '50px', cursor: 'pointer',
                background: mode === 'camera' ? 'var(--color-forest)' : 'white',
                color: mode === 'camera' ? 'white' : 'var(--color-espresso)',
                fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                border: `1.5px solid ${mode === 'camera' ? 'var(--color-forest)' : 'rgba(0,0,0,0.1)'}`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              📹 Live Camera
            </button>

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
              marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                <p style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.02em' }}>✨ Aligning Facial Landmarks...</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Auto-positioning frame over pupil center</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Mode 1: Demo Model */}
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

                  <div style={{
                    position: 'absolute', top: '195px', left: '50%',
                    transform: `translate(-50%, -50%) translate(${frameX}px, ${frameY}px) scale(${frameScale}) rotate(${frameRotation}deg)`,
                    transition: isScanning ? 'none' : 'transform 0.15s ease-out',
                    zIndex: 10, pointerEvents: 'none',
                  }}>
                    <GlassesOverlaySVG color={currentFrame.colors[0]} shape={currentFrame.frameShape} />
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

            {/* Mode 2: User Photo Upload */}
            {mode === 'upload' && (
              uploadedImageSrc ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img
                    src={uploadedImageSrc}
                    alt="Your uploaded face"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />

                  {/* Eyewear Overlay over User Photo */}
                  <div style={{
                    position: 'absolute', top: '48%', left: '50%',
                    transform: `translate(-50%, -50%) translate(${frameX}px, ${frameY}px) scale(${frameScale}) rotate(${frameRotation}deg)`,
                    transition: isScanning ? 'none' : 'transform 0.15s ease-out',
                    zIndex: 10, pointerEvents: 'none',
                  }}>
                    <GlassesOverlaySVG color={currentFrame.colors[0]} shape={currentFrame.frameShape} />
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
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      background: 'var(--color-forest)', color: 'white', border: 'none',
                      padding: '0.75rem 1.75rem', borderRadius: '50px',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Choose Photo (JPG, PNG, WEBP)
                  </button>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '1rem' }}>
                    🔒 Processed securely in browser. No photo data is sent to external servers.
                  </p>
                </div>
              )
            )}

            {/* Mode 3: Live Camera */}
            {mode === 'camera' && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(198,106,85,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <svg width="36" height="36" fill="none" stroke="var(--color-terracotta)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--color-plum)', marginBottom: '0.5rem' }}>Live Camera Try-On</h3>
                <p style={{ color: 'var(--color-sage)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Use live camera preview with simulated eye tracking.</p>
                <button
                  onClick={() => { setMode('demo'); triggerAutoFit(); }}
                  className="btn-primary"
                >
                  Start Demo Try-On
                </button>
              </div>
            )}
          </div>

          {/* Position & Scale Fine-Tuning Controls */}
          {(mode === 'demo' || (mode === 'upload' && uploadedImageSrc)) && (
            <div style={{ marginTop: '1.25rem', background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)' }}>
                  Fine-Tune Frame Position & Fit
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
                  Reset Position
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Selected Frame & Try-On Filters */}
        <div>
          {/* Selected frame info */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)', marginBottom: '0.875rem' }}>
              Selected Frame
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '72px', height: '48px', background: 'var(--color-cream)', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                {PRODUCT_IMAGES[currentFrame.id] ? (
                  <Image
                    src={PRODUCT_IMAGES[currentFrame.id]}
                    alt={currentFrame.name}
                    fill
                    sizes="72px"
                    style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GlassesMiniSVG color={currentFrame.colors[0]} shape={currentFrame.frameShape} />
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--color-espresso)' }}>{currentFrame.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-sage)' }}>{currentFrame.color} · {currentFrame.frameShape}</p>
              </div>
              <p style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                ₹{currentFrame.price.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Try-On Product Filters */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage)' }}>
                Filter Frames ({filteredProducts.length})
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    background: 'none', border: 'none', color: 'var(--color-terracotta)',
                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Clear Filters ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.78rem', color: '#374151', outline: 'none' }}
              >
                <option value="All">All Categories</option>
                <option value="Eyeglasses">Eyeglasses</option>
                <option value="Sunglasses">Sunglasses</option>
                <option value="Blue-light">Blue-light</option>
                <option value="Kids">Kids</option>
              </select>

              <select
                value={filters.gender}
                onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.78rem', color: '#374151', outline: 'none' }}
              >
                <option value="All">All Genders</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Kids">Kids</option>
              </select>

              <select
                value={filters.frameShape}
                onChange={(e) => setFilters((f) => ({ ...f, frameShape: e.target.value }))}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.78rem', color: '#374151', outline: 'none' }}
              >
                <option value="All">All Shapes</option>
                <option value="Rectangle">Rectangle</option>
                <option value="Round">Round</option>
                <option value="Cat-Eye">Cat-Eye</option>
                <option value="Square">Square</option>
                <option value="Aviator">Aviator</option>
                <option value="Oval">Oval</option>
              </select>

              <select
                value={filters.color}
                onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value }))}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.78rem', color: '#374151', outline: 'none' }}
              >
                <option value="All">All Colors</option>
                <option value="Black">Black</option>
                <option value="Brown">Brown</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Blue">Blue</option>
                <option value="Transparent">Transparent</option>
                <option value="Pink">Pink</option>
                <option value="Tortoise">Tortoise</option>
              </select>
            </div>

            {/* Frame Grid Carousel */}
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', background: 'var(--color-cream)', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>No frames match filters</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-sage)', marginBottom: '0.75rem' }}>Try clearing active filters.</p>
                <button onClick={handleResetFilters} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                {filteredProducts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFrame(f.id)}
                    style={{
                      aspectRatio: '1', background: 'var(--color-cream)', borderRadius: '8px',
                      border: `2px solid ${currentFrame.id === f.id ? 'var(--color-forest)' : 'transparent'}`,
                      cursor: 'pointer', padding: 0, transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', position: 'relative',
                    }}
                    title={`${f.name} (${f.frameShape})`}
                  >
                    {PRODUCT_IMAGES[f.id] ? (
                      <Image
                        src={PRODUCT_IMAGES[f.id]}
                        alt={f.name}
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                      />
                    ) : (
                      <GlassesMiniSVG color={f.colors[0]} shape={f.frameShape} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add to cart */}
          <button onClick={handleAddToCart} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            Add to Cart →
          </button>
          <Link href={`/lens-configurator?frame=${currentFrame.id}`} className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
            Configure Lenses
          </Link>
        </div>
      </div>
    </div>
  );
}

function GlassesMiniSVG({ color, shape }: { color: string; shape: string }) {
  const c = color || '#8B5E3C';
  const normShape = (shape || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normShape === 'round' || normShape === 'oval') {
    return (
      <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
        <circle cx="11" cy="11" r="7" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
        <circle cx="29" cy="11" r="7" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
        <line x1="18" y1="11" x2="22" y2="11" stroke={c} strokeWidth="1.8" />
      </svg>
    );
  }

  if (normShape === 'cateye') {
    return (
      <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
        <path d="M4 12 Q8 4 16 6 Q19 12 16 16 Q8 16 4 12Z" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
        <path d="M36 12 Q32 4 24 6 Q21 12 24 16 Q32 16 36 12Z" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
        <line x1="16" y1="11" x2="24" y2="11" stroke={c} strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
      <rect x="3" y="5" width="14" height="11" rx="2" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <rect x="23" y="5" width="14" height="11" rx="2" stroke={c} strokeWidth="1.8" fill="rgba(255,255,255,0.5)" />
      <line x1="17" y1="10" x2="23" y2="10" stroke={c} strokeWidth="1.8" />
    </svg>
  );
}

function GlassesOverlaySVG({ color, shape }: { color: string; shape: string }) {
  const strokeColor = color || '#292626';
  const normShape = (shape || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normShape === 'round' || normShape === 'oval') {
    return (
      <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
        <path d="M41 33 Q24 32 6 34" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M179 33 Q196 32 214 34" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="68" cy="35" rx="27" ry="25" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
        <ellipse cx="152" cy="35" rx="27" ry="25" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
        <path d="M95 33 Q110 24 125 33" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M52 24 Q68 18 78 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        <path d="M136 24 Q152 18 162 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
      </svg>
    );
  }

  if (normShape === 'cateye') {
    return (
      <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
        <path d="M40 22 Q22 25 6 32" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M180 22 Q198 25 214 32" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M40 22 C42 12, 60 14, 70 15 C85 16, 96 22, 96 34 C96 46, 84 55, 68 55 C52 55, 41 46, 40 32 Z" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
        <path d="M180 22 C178 12, 160 14, 150 15 C135 16, 124 22, 124 34 C124 46, 136 55, 152 55 C168 55, 179 46, 180 32 Z" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
        <path d="M96 29 Q110 23 124 29" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M50 20 L74 18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M146 18 L170 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      </svg>
    );
  }

  if (normShape === 'aviator') {
    return (
      <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
        <path d="M42 22 Q24 26 6 32" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M178 22 Q196 26 214 32" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="56" y1="16" x2="164" y2="16" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M96 28 Q110 24 124 28" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M42 20 L96 20 C98 34, 94 48, 80 56 C66 60, 52 56, 44 44 C38 34, 40 24, 42 20 Z" stroke={strokeColor} strokeWidth="3.5" fill="rgba(255,255,255,0.22)" />
        <path d="M178 20 L124 20 C122 34, 126 48, 140 56 C154 60, 168 56, 176 44 C182 34, 180 24, 178 20 Z" stroke={strokeColor} strokeWidth="3.5" fill="rgba(255,255,255,0.22)" />
        <path d="M50 24 L76 22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M144 22 L170 24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      </svg>
    );
  }

  // Rectangle / Square
  return (
    <svg width="220" height="70" viewBox="0 0 220 70" fill="none">
      <path d="M40 28 Q23 27 6 32" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M180 28 Q197 27 214 32" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="40" y="14" width="56" height="42" rx="9" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      <rect x="124" y="14" width="56" height="42" rx="9" stroke={strokeColor} strokeWidth="4.5" fill="rgba(255,255,255,0.22)" />
      <path d="M96 30 Q110 23 124 30" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
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

'use client';
import { useEffect, useRef, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/data/products';
import { useStore } from '@/lib/store';
import { loginHref } from '@/lib/auth/redirect';
import { gsap } from 'gsap';
import { PRODUCT_IMAGES, PRODUCT_TINTS } from '@/components/product/ProductImage';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

interface Props { params: Promise<{ id: string }> }

export default function ProductDetailPage({ params }: Props) {
  const router = useRouter();
  const [productId, setProductId] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [activeTab, setActiveTab] = useState('details');
  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const { toggleWishlist, isWishlisted } = useStore();
  const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

  useEffect(() => {
    params.then((p) => setProductId(p.id));
  }, [params]);

  const product = products.find((p) => p.id === productId);

  useEffect(() => {
    if (!product) return;
    gsap.fromTo(galleryRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    gsap.fromTo(infoRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.15 });
  }, [product]);

  if (productId && !product) return notFound();
  if (!productId) return <ProductSkeleton />;

  const discount = Math.round((1 - product!.price / product!.originalPrice) * 100);
  const wishlisted = isWishlisted(product!.id);

  const reviews = [
    { name: 'Priya S.', rating: 5, date: 'Aug 2026', text: 'Absolutely love these frames. The fit is perfect and they\'re so lightweight!' },
    { name: 'Arjun M.', rating: 4, date: 'Jul 2026', text: 'Great quality for the price. Would have liked one more color option.' },
    { name: 'Kavya R.', rating: 5, date: 'Jun 2026', text: 'The lens configurator made the whole process so easy. Fast delivery too!' },
  ];

  return (
    <div style={{ background: 'var(--color-ivory)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <ProductJsonLd product={product!} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: product!.category, url: `/shop?category=${product!.category}` },
          { name: product!.name, url: `/product/${product!.id}` },
        ]}
      />
      {/* Breadcrumb */}
      <div className="container" style={{ padding: '1.5rem 2rem 0' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
          <Link href="/" style={{ color: 'var(--color-sage)' }}>Home</Link>
          {' › '}
          <Link href={`/shop?category=${product!.category}`} style={{ color: 'var(--color-sage)' }}>{product!.category}</Link>
          {' › '}
          <span>{product!.name}</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container product-detail-grid" style={{ paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '4rem', alignItems: 'flex-start' }}>

        {/* LEFT — Gallery */}
        <div ref={galleryRef}>
          {/* Main image */}
          <div style={{
            background: 'linear-gradient(145deg, var(--color-cream), var(--color-sand))',
            borderRadius: 'var(--radius-xl)', aspectRatio: '4/3',
            marginBottom: '1rem', position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            {PRODUCT_IMAGES[product!.id] ? (
              <>
                <Image
                  src={PRODUCT_IMAGES[product!.id]}
                  alt={`${product!.name} eyewear frame`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  priority
                />
                {PRODUCT_TINTS[product!.id] && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: PRODUCT_TINTS[product!.id],
                    mixBlendMode: 'multiply',
                    pointerEvents: 'none',
                  }} />
                )}
              </>
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ProductSVGLarge color={product!.colors[selectedColor]} shape={product!.frameShape} />
              </div>
            )}
            {product!.isNew && (
              <span className="badge badge-sage" style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 2 }}>New Arrival</span>
            )}
            {/* 360 hint */}
            <div style={{
              position: 'absolute', bottom: '1.25rem', right: '1.25rem', zIndex: 2,
              background: 'rgba(255,255,255,0.9)', borderRadius: '50px',
              padding: '0.4rem 0.875rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-espresso)',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" strokeLinecap="round" />
              </svg>
              360° View
            </div>
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                style={{
                  flex: 1, aspectRatio: '1',
                  background: 'linear-gradient(145deg, var(--color-cream), var(--color-sand))',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedImage === i ? 'var(--color-forest)' : 'rgba(0,0,0,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'border-color 0.2s', overflow: 'hidden',
                  position: 'relative', padding: 0,
                }}
              >
                {PRODUCT_IMAGES[product!.id] ? (
                  <Image
                    src={PRODUCT_IMAGES[product!.id]}
                    alt={`${product!.name} view ${i + 1}`}
                    fill
                    sizes="120px"
                    style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  />
                ) : (
                  <ProductSVGThumb color={product!.colors[selectedColor]} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Product info */}
        <div ref={infoRef}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
            {product!.badges.slice(0, 2).map((b) => (
              <span key={b} className={`badge ${b.includes('AI') ? 'badge-lilac' : 'badge-sage'}`}>{b.includes('AI') ? '✦ ' : ''}{b}</span>
            ))}
          </div>

          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>{product!.name}</h1>
          <p style={{ color: 'var(--color-sage)', marginBottom: '0.875rem', fontStyle: 'italic' }}>
            {product!.material} · {product!.frameShape} · {product!.category}
          </p>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="stars">{Array(Math.floor(product!.rating)).fill('★').join('')}</span>
            <span style={{ fontWeight: 700 }}>{product!.rating}</span>
            <span style={{ color: 'var(--color-muted)' }}>({product!.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>
              ₹{product!.price.toLocaleString('en-IN')}
            </span>
            <span className="price-original" style={{ fontSize: '1rem' }}>₹{product!.originalPrice.toLocaleString('en-IN')}</span>
            <span className="badge badge-coral">{discount}% OFF</span>
          </div>

          {/* Colors */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-espresso)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Color — {product!.color}
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {product!.colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: c,
                    border: selectedColor === i ? '3px solid var(--color-forest)' : '2px solid rgba(0,0,0,0.12)',
                    cursor: 'pointer', transition: 'transform 0.15s',
                    transform: selectedColor === i ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: selectedColor === i ? '0 0 0 2px white inset' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-espresso)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Frame Size
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Small', 'Medium', 'Large'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: '50px',
                    border: `1.5px solid ${selectedSize === s ? 'var(--color-forest)' : 'rgba(0,0,0,0.12)'}`,
                    background: selectedSize === s ? 'rgba(32,56,46,0.08)' : 'white',
                    color: selectedSize === s ? 'var(--color-forest)' : 'var(--color-espresso)',
                    fontSize: '0.875rem', fontWeight: selectedSize === s ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Fit in MM */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-cream), var(--color-sand))',
            borderRadius: 'var(--radius-md)', padding: '1.25rem',
            marginBottom: '1.5rem', border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-espresso)' }}>
                📐 Fit in Millimetres
              </p>
              <span className="badge badge-sage">
                {product!.fit === 'Good' ? '✓ ' : product!.fit === 'Snug' ? '↔ ' : '↔ '}{product!.fit} Fit
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                ['Frame Width', `${product!.measurements.frameWidth} mm`],
                ['Lens Height', `${product!.measurements.lensHeight} mm`],
                ['Bridge Width', `${product!.measurements.bridgeWidth} mm`],
                ['Temple Length', `${product!.measurements.templeLength} mm`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{k}</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-plum)' }}>{v}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-sage)', marginTop: '0.75rem' }}>{product!.fitNote}</p>
          </div>

          {/* Phase 18: Why this frame might suit you */}
          <div style={{
            background: 'rgba(217,205,228,0.25)',
            borderRadius: 'var(--radius-md)', padding: '1.25rem',
            marginBottom: '1.5rem', border: '1px solid rgba(217,205,228,0.6)',
          }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-plum)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ✨ Why this frame might suit you
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--color-espresso)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>✓</span>
                <span>Suitable for {product!.faceShapes ? product!.faceShapes.join(', ') : 'Oval, Heart & Round'} face shapes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>✓</span>
                <span>{product!.material} construction — {product!.weight || '16g'} lightweight comfort</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>✓</span>
                <span>Supports prescription range {product!.prescriptionRange || '-8.00 to +6.00'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>✓</span>
                <span>Popular choice — rated {product!.rating}★ by {product!.reviewCount} buyers</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: product!.inStock ? 'var(--color-forest)' : '#C44D40' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: product!.inStock ? 'var(--color-forest)' : '#C44D40' }}>
              {product!.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginLeft: '0.5rem' }}>· Free delivery · 3–5 days</span>
          </div>

          {/* CTAs */}
          <div className="product-info-actions" style={{ display: 'flex', gap: '0.875rem', marginBottom: '1rem' }}>
            <Link
              href={`/try-on?frame=${product!.id}`}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '0.95rem',
                background: 'var(--color-terracotta)', borderRadius: '50px',
                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#a85642'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-terracotta)'}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" /><path d="M20 12c0 0-3.6 6-8 6s-8-6-8-6 3.6-6 8-6 8 6 8 6z" />
              </svg>
              Try On
            </Link>
            <Link
              href={`/lens-configurator?frame=${product!.id}`}
              style={{
                flex: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '0.95rem',
                background: 'var(--color-forest)', borderRadius: '50px',
                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#162a21'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-forest)'}
            >
              Select Lenses →
            </Link>
          </div>

          {/* Wishlist */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                router.push(loginHref('/wishlist'));
                return;
              }
              toggleWishlist(product!.id);
            }}
            style={{
              width: '100%', padding: '0.75rem',
              background: 'none',
              border: `1.5px solid ${wishlisted ? 'var(--color-coral)' : 'rgba(0,0,0,0.12)'}`,
              borderRadius: '50px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              color: wishlisted ? 'var(--color-coral)' : 'var(--color-sage)',
              fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <svg width="16" height="16" fill={wishlisted ? 'var(--color-coral)' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </button>

          {/* Trust */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {[['🚚', 'Free shipping'], ['↩️', '7-day returns'], ['✅', '100% authentic']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-sage)' }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="product-tabs-scroll" style={{ display: 'flex', borderBottom: '2px solid rgba(0,0,0,0.08)', marginBottom: '2rem', gap: '0' }}>
          {[
            { id: 'details', label: 'Product Details' },
            { id: 'reviews', label: `Reviews (${product!.reviewCount})` },
            { id: 'delivery', label: 'Delivery & Returns' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.875rem 1.75rem', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                color: activeTab === tab.id ? 'var(--color-plum)' : 'var(--color-sage)',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--color-plum)' : 'transparent'}`,
                marginBottom: '-2px', transition: 'all 0.2s',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ color: 'var(--color-espresso)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{product!.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  ['Material', product!.material],
                  ['Frame Shape', product!.frameShape],
                  ['Gender', product!.gender],
                  ['Weight', product!.weight],
                  ['Prescription Range', product!.prescriptionRange],
                  ['Warranty', product!.warranty],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ width: '160px', fontSize: '0.875rem', color: 'var(--color-muted)', flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-espresso)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Frame Measurements</h4>
              <div style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                {[
                  ['Frame Width', `${product!.measurements.frameWidth} mm`],
                  ['Lens Height', `${product!.measurements.lensHeight} mm`],
                  ['Bridge Width', `${product!.measurements.bridgeWidth} mm`],
                  ['Temple Length', `${product!.measurements.templeLength} mm`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>{k}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-plum)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', background: 'var(--color-cream)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-plum)', fontFamily: "'Cormorant Garamond', serif" }}>{product!.rating}</div>
                <div className="stars" style={{ fontSize: '1.1rem' }}>{'★'.repeat(Math.floor(product!.rating))}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-sage)', marginTop: '0.25rem' }}>{product!.reviewCount} reviews</div>
              </div>
            </div>
            {reviews.map((r, i) => (
              <div key={i} style={{ padding: '1.25rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-espresso)', fontSize: '0.85rem' }}>
                      {r.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</p>
                      <span className="stars" style={{ fontSize: '0.75rem' }}>{'★'.repeat(r.rating)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{r.date}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-espresso)', lineHeight: 1.7 }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'delivery' && (
          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { title: '🚚 Standard Delivery', desc: 'Free on orders above ₹999. Delivered in 3–5 business days.', highlight: 'FREE' },
              { title: '⚡ Express Delivery', desc: 'Priority processing and delivery in 1–2 business days.', highlight: '₹99' },
              { title: '↩️ Easy Returns', desc: '10-day hassle-free return policy. Just raise a request.', highlight: '10 days' },
              { title: '🛡️ Warranty', desc: `${product!.warranty} manufacturing warranty on all frames.`, highlight: product!.warranty },
            ].map(({ title, desc, highlight }) => (
              <div key={title} style={{ display: 'flex', gap: '1rem', padding: '1.25rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{title}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-sage)' }}>{desc}</p>
                </div>
                <span className="badge badge-sage">{highlight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductSVGLarge({ color, shape }: { color: string; shape: string }) {
  return (
    <div className="float-animation-slow">
      <svg width="280" height="140" viewBox="0 0 280 140" fill="none" style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.12))' }}>
        {shape === 'Round' || shape === 'Oval'
          ? <>
            <ellipse cx="78" cy="70" rx="56" ry="48" stroke={color} strokeWidth="8" fill="rgba(255,255,255,0.6)" />
            <ellipse cx="202" cy="70" rx="56" ry="48" stroke={color} strokeWidth="8" fill="rgba(255,255,255,0.6)" />
            <path d="M134 70 Q140 62 146 70" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M22 60 Q12 55 6 63" stroke={color} strokeWidth="6" strokeLinecap="round" />
            <path d="M258 60 Q268 55 274 63" stroke={color} strokeWidth="6" strokeLinecap="round" />
          </>
          : shape === 'Cat-eye'
          ? <>
            <path d="M22 76 Q28 30 78 34 Q104 34 134 66 Q104 100 80 96 Q38 94 22 76Z" stroke={color} strokeWidth="7" fill="rgba(255,255,255,0.6)" />
            <path d="M258 76 Q252 30 202 34 Q176 34 146 66 Q176 100 200 96 Q242 94 258 76Z" stroke={color} strokeWidth="7" fill="rgba(255,255,255,0.6)" />
            <path d="M134 68 Q140 60 146 68" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M22 72 Q12 68 6 74" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
            <path d="M258 72 Q268 68 274 74" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
          </>
          : <>
            <rect x="20" y="36" width="110" height="70" rx="12" stroke={color} strokeWidth="8" fill="rgba(255,255,255,0.6)" />
            <rect x="150" y="36" width="110" height="70" rx="12" stroke={color} strokeWidth="8" fill="rgba(255,255,255,0.6)" />
            <path d="M130 70 Q140 62 150 70" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M20 60 Q10 56 5 63" stroke={color} strokeWidth="6" strokeLinecap="round" />
            <path d="M260 60 Q270 56 275 63" stroke={color} strokeWidth="6" strokeLinecap="round" />
          </>
        }
      </svg>
    </div>
  );
}

function ProductSVGThumb({ color }: { color: string }) {
  return (
    <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
      <rect x="6" y="10" width="28" height="20" rx="4" stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.6)" />
      <rect x="46" y="10" width="28" height="20" rx="4" stroke={color} strokeWidth="2.5" fill="rgba(255,255,255,0.6)" />
      <path d="M34 20 Q40 17 46 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ProductSkeleton() {
  return (
    <div className="container" style={{ paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '4rem' }}>
      <div>
        <div className="skeleton" style={{ aspectRatio: '4/3', borderRadius: 'var(--radius-xl)', marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ flex: 1, aspectRatio: '1', borderRadius: 'var(--radius-md)' }} />)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ height: '2rem', width: '60%', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '3rem', width: '80%', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '1.5rem', width: '40%', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: '48px', borderRadius: '50px' }} />
      </div>
    </div>
  );
}

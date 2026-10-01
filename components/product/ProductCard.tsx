'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/data/products';
import { useStore } from '@/lib/store';
import { PRODUCT_IMAGES, PRODUCT_TINTS } from '@/components/product/ProductImage';

interface ProductCardProps {
  product: Product;
  showTryOn?: boolean;
}

export default function ProductCard({ product, showTryOn = true }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const { toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const imgSrc = PRODUCT_IMAGES[product.id];
  const tint = PRODUCT_TINTS[product.id];
  const activeColorHex = product.colors[selectedColorIdx] || product.colors[0];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Image */}
      <Link href={`/product/${product.id}`} style={{ display: 'block', position: 'relative' }}>
        <div style={{
          background: 'linear-gradient(135deg, #F8F5EF 0%, #EDE5D9 100%)',
          aspectRatio: '4/3',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Real product image or SVG fallback */}
          {imgSrc && !imgError ? (
            <>
              <Image
                src={imgSrc}
                alt={`${product.name} eyewear frame`}
                fill
                sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                loading="lazy"
                onError={() => setImgError(true)}
              />
              {/* Color tint overlay for visual differentiation */}
              {tint && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: tint,
                  mixBlendMode: 'multiply',
                  pointerEvents: 'none',
                }} />
              )}
            </>
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #F2E8DE 0%, #EDE5D9 100%)',
            }}>
              <GlassesSVG color={activeColorHex} shape={product.frameShape} />
            </div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', zIndex: 2 }}>
            {product.isNew && (
              <span className="badge badge-sage" style={{ fontSize: '0.65rem' }}>New</span>
            )}
            {(product.isAiPick || product.badges.includes('AI Recommended')) && (
              <span className="badge badge-lilac" style={{ fontSize: '0.65rem' }}>✦ AI Pick</span>
            )}
          </div>

          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(36,21,38,0.04)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
            zIndex: 1,
          }} />
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={() => toggleWishlist(product.id)}
        style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10,
          background: 'white', border: 'none', borderRadius: '50%',
          width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all 0.2s',
          transform: wishlisted ? 'scale(1.1)' : 'scale(1)',
        }}
        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg width="16" height="16" fill={wishlisted ? '#D95C4F' : 'none'} stroke={wishlisted ? '#D95C4F' : '#8E8580'} strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      {/* Info Container */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link href={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            fontWeight: 600, color: 'var(--color-espresso)', marginBottom: '0.2rem',
            lineHeight: '1.3', height: '2.5rem', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{product.name}</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-sage)', marginBottom: '0.4rem' }}>
            {product.color} · {product.material}
          </p>
        </Link>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <span className="stars" style={{ fontSize: '0.75rem' }}>{'★'.repeat(Math.floor(product.rating))}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-espresso)' }}>{product.rating}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span className="price-current">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          <span className="price-discount">{discount}% OFF</span>
        </div>

        {/* Color swatches */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
          {product.colors.slice(0, 5).map((c, i) => (
            <button
              key={i}
              onClick={() => setSelectedColorIdx(i)}
              style={{
                width: '18px', height: '18px', borderRadius: '50%', padding: 0,
                background: c, border: selectedColorIdx === i ? '2px solid var(--color-forest)' : '1.5px solid rgba(0,0,0,0.15)',
                cursor: 'pointer', transition: 'transform 0.15s',
                transform: selectedColorIdx === i ? 'scale(1.2)' : 'scale(1)',
              }}
              title={`Color ${i + 1}`}
            />
          ))}
        </div>

        {/* CTAs pinned to bottom */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          {showTryOn && (
            <Link href={`/try-on?frame=${product.id}`} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.35rem', padding: '0.6rem 0.5rem',
              background: 'rgba(198,106,85,0.1)', border: '1px solid rgba(198,106,85,0.3)',
              borderRadius: '50px', fontSize: '0.78rem', fontWeight: 600,
              color: 'var(--color-terracotta)', cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'nowrap', textDecoration: 'none',
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-terracotta)';
                (e.currentTarget as HTMLElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(198,106,85,0.1)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-terracotta)';
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" /><path d="M20 12c0 0-3.6 6-8 6s-8-6-8-6 3.6-6 8-6 8 6 8 6z" />
              </svg>
              Try On
            </Link>
          )}
          <Link href={`/lens-configurator?frame=${product.id}`} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.35rem', padding: '0.6rem 0.5rem',
            background: 'var(--color-forest)', border: 'none',
            borderRadius: '50px', fontSize: '0.78rem', fontWeight: 600,
            color: 'white', cursor: 'pointer', transition: 'all 0.2s',
            whiteSpace: 'nowrap', textDecoration: 'none',
          }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#162a21'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-forest)'}
          >
            Select Lenses
          </Link>
        </div>
      </div>
    </div>
  );
}

function GlassesSVG({ color, shape }: { color: string; shape: string }) {
  const c = color || '#8B5E3C';
  const normShape = (shape || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normShape === 'round') {
    return (
      <svg width="170" height="85" viewBox="0 0 170 85" fill="none" className="float-animation-slow">
        <ellipse cx="48" cy="42.5" rx="30" ry="27" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <ellipse cx="122" cy="42.5" rx="30" ry="27" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M78 42.5 Q85 38.5 92 42.5" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M18 38 Q12 35 6 39" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M152 38 Q158 35 164 39" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M30 28 L50 20" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M104 28 L124 20" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (normShape === 'square') {
    return (
      <svg width="175" height="85" viewBox="0 0 175 85" fill="none" className="float-animation-slow">
        <rect x="14" y="18" width="62" height="48" rx="8" stroke={c} strokeWidth="4.8" fill="rgba(255,255,255,0.6)" />
        <rect x="99" y="18" width="62" height="48" rx="8" stroke={c} strokeWidth="4.8" fill="rgba(255,255,255,0.6)" />
        <path d="M76 40 Q87.5 36 99 40" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M14 32 Q9 29 5 33" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M161 32 Q166 29 170 33" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M22 24 L48 22" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M107 24 L133 22" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (normShape === 'cateye') {
    return (
      <svg width="175" height="85" viewBox="0 0 175 85" fill="none" className="float-animation-slow">
        <path d="M14 46 Q22 18 52 22 Q64 22 76 40 Q64 58 48 56 Q24 54 14 46Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M161 46 Q153 18 123 22 Q111 22 99 40 Q111 58 127 56 Q151 54 161 46Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M76 41 Q87.5 37 99 41" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M14 42 Q9 39 5 42" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M161 42 Q166 39 170 42" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M26 30 L46 24" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M111 30 L131 24" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (normShape === 'aviator') {
    return (
      <svg width="175" height="85" viewBox="0 0 175 85" fill="none" className="float-animation-slow">
        <path d="M14 26 Q15 20 22 20 L72 20 Q78 20 78 34 Q78 56 46 56 Q20 56 14 40 Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M161 26 Q160 20 153 20 L103 20 Q97 20 97 34 Q97 56 129 56 Q155 56 161 40 Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M78 26 Q87.5 22 97 26" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M78 33 Q87.5 29 97 33" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M14 30 Q9 28 5 32" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M161 30 Q166 28 170 32" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M24 28 L48 26" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M109 28 L133 26" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (normShape === 'oval') {
    return (
      <svg width="175" height="85" viewBox="0 0 175 85" fill="none" className="float-animation-slow">
        <ellipse cx="46" cy="42.5" rx="32" ry="22" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <ellipse cx="129" cy="42.5" rx="32" ry="22" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M78 42.5 Q87.5 38.5 97 42.5" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M14 38 Q9 35 5 39" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M161 38 Q166 35 170 39" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M24 32 L46 26" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M107 32 L129 26" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Default Rectangle
  return (
    <svg width="175" height="85" viewBox="0 0 175 85" fill="none" className="float-animation-slow">
      <rect x="14" y="24" width="62" height="37" rx="5" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
      <rect x="99" y="24" width="62" height="37" rx="5" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
      <path d="M76 42 Q87.5 38 99 42" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M14 36 Q9 33 5 37" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M161 36 Q166 33 170 37" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M22 30 L45 27" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M107 30 L130 27" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

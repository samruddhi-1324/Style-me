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

  if (shape === 'Round' || shape === 'Oval') {
    return (
      <svg width="160" height="80" viewBox="0 0 160 80" fill="none" className="float-animation-slow">
        <ellipse cx="45" cy="40" rx="32" ry="28" stroke={c} strokeWidth="5" fill="rgba(255,255,255,0.5)" />
        <ellipse cx="115" cy="40" rx="32" ry="28" stroke={c} strokeWidth="5" fill="rgba(255,255,255,0.5)" />
        <path d="M77 40 Q80 36 83 40" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M13 35 Q8 32 4 36" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M147 35 Q152 32 156 36" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (shape === 'Cat-eye') {
    return (
      <svg width="160" height="80" viewBox="0 0 160 80" fill="none" className="float-animation-slow">
        <path d="M13 44 Q20 16 48 20 Q60 20 77 38 Q60 56 45 54 Q22 52 13 44Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.5)" />
        <path d="M147 44 Q140 16 112 20 Q100 20 83 38 Q100 56 115 54 Q138 52 147 44Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.5)" />
        <path d="M77 39 Q80 35 83 39" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M13 40 Q8 37 4 40" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M147 40 Q152 37 156 40" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (shape === 'Aviator') {
    return (
      <svg width="160" height="80" viewBox="0 0 160 80" fill="none" className="float-animation-slow">
        <path d="M13 24 Q14 18 20 18 L70 18 Q78 18 77 32 Q77 54 45 54 Q20 54 13 38 Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.5)" />
        <path d="M147 24 Q146 18 140 18 L90 18 Q82 18 83 32 Q83 54 115 54 Q140 54 147 38 Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.5)" />
        <path d="M77 24 Q80 20 83 24" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M13 28 Q8 26 4 30" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M147 28 Q152 26 156 30" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="170" height="80" viewBox="0 0 170 80" fill="none" className="float-animation-slow">
      <rect x="14" y="20" width="62" height="40" rx="6" stroke={c} strokeWidth="5" fill="rgba(255,255,255,0.5)" />
      <rect x="94" y="20" width="62" height="40" rx="6" stroke={c} strokeWidth="5" fill="rgba(255,255,255,0.5)" />
      <path d="M76 40 Q80 36 94 40" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M14 35 Q9 32 5 36" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M156 35 Q161 32 165 36" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

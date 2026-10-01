'use client';
import Image from 'next/image';
import { useState } from 'react';

/** Map of product IDs → public image paths */
export const PRODUCT_IMAGES: Record<string, string> = {
  // Real generated photos
  'frame-018': '/assets/products/eyeglasses/sunrise-rose.jpg',   // Sunrise Rose
  'frame-002': '/assets/products/eyeglasses/raven-black.jpg',    // Raven Black
  'frame-004': '/assets/products/eyeglasses/maple-brown.jpg',    // Maple Brown
  'frame-008': '/assets/products/eyeglasses/blush-pink.jpg',     // Blush Pink
  'frame-006': '/assets/products/eyeglasses/crystal-clear.jpg',  // Crystal Clear

  // Reuse closest visual match for remaining frames
  'frame-001': '/assets/products/eyeglasses/maple-brown.jpg',    // Willow Tortoise → tortoiseshell
  'frame-003': '/assets/products/eyeglasses/raven-black.jpg',    // Azure Blue → rectangular (reuse black, tinted)
  'frame-005': '/assets/products/eyeglasses/blush-pink.jpg',     // Olive Green → cat-eye shape match
  'frame-007': '/assets/products/eyeglasses/raven-black.jpg',    // Graphite Grey → rectangular metal
  'frame-019': '/assets/products/eyeglasses/maple-brown.jpg',    // Heritage Round → warm acetate
  'frame-020': '/assets/products/eyeglasses/raven-black.jpg',    // Minimal Wire → thin frame
  'frame-023': '/assets/products/eyeglasses/crystal-clear.jpg',  // Pebble Oval → transparent oval

  // Sunglasses (use closest real images)
  'frame-009': '/assets/products/eyeglasses/raven-black.jpg',    // Cobalt Shield
  'frame-010': '/assets/products/eyeglasses/maple-brown.jpg',    // Desert Sand
  'frame-011': '/assets/products/eyeglasses/raven-black.jpg',    // Noir Oversize
  'frame-012': '/assets/products/eyeglasses/blush-pink.jpg',     // Terracotta Cat
  'frame-021': '/assets/products/eyeglasses/raven-black.jpg',    // Bold Square

  // Blue-light
  'frame-013': '/assets/products/eyeglasses/raven-black.jpg',    // Focus Pro
  'frame-014': '/assets/products/eyeglasses/raven-black.jpg',    // Scholar Thin
  'frame-015': '/assets/products/eyeglasses/maple-brown.jpg',    // Night Owl
  'frame-022': '/assets/products/eyeglasses/maple-brown.jpg',    // Forest Green

  // Kids
  'frame-016': '/assets/products/eyeglasses/raven-black.jpg',    // Sparky
  'frame-017': '/assets/products/eyeglasses/raven-black.jpg',    // Mini Scholar
  'frame-024': '/assets/products/eyeglasses/crystal-clear.jpg',  // Tiny Tot
};

/** Per-product color tint overlay to visually differentiate reused base images */
export const PRODUCT_TINTS: Record<string, string> = {
  'frame-003': 'rgba(91,127,166,0.22)',   // Azure Blue
  'frame-005': 'rgba(74,124,89,0.22)',    // Olive Green
  'frame-007': 'rgba(107,107,107,0.20)',  // Graphite Grey
  'frame-009': 'rgba(91,127,166,0.30)',   // Cobalt Shield
  'frame-010': 'rgba(200,168,130,0.18)',  // Desert Sand
  'frame-012': 'rgba(198,106,85,0.28)',   // Terracotta Cat
  'frame-013': 'rgba(41,38,38,0.12)',     // Focus Pro
  'frame-014': 'rgba(200,168,130,0.20)',  // Scholar Thin
  'frame-015': 'rgba(200,168,130,0.22)',  // Night Owl
  'frame-016': 'rgba(196,77,64,0.22)',    // Sparky
  'frame-017': 'rgba(91,127,166,0.25)',   // Mini Scholar
  'frame-019': 'rgba(200,168,130,0.18)',  // Heritage Round
  'frame-020': 'rgba(168,168,168,0.20)',  // Minimal Wire
  'frame-021': 'rgba(41,38,38,0.18)',     // Bold Square
  'frame-022': 'rgba(74,124,89,0.25)',    // Forest Green
  'frame-023': 'rgba(107,107,107,0.15)',  // Pebble Oval
  'frame-024': 'rgba(155,124,182,0.22)',  // Tiny Tot
};

interface ProductImageProps {
  productId: string;
  productName: string;
  frameColor?: string;
  frameShape?: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ProductImage({
  productId,
  productName,
  frameColor,
  frameShape,
  priority = false,
  fill = false,
  className,
  style,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);
  const src = PRODUCT_IMAGES[productId];
  const tint = PRODUCT_TINTS[productId];

  if (!src || imgError) {
    // Polished SVG fallback
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #F2E8DE 0%, #EDE5D9 100%)',
        ...style,
      }} className={className}>
        <FallbackFrameSVG color={frameColor || '#8B5E3C'} shape={frameShape || 'Rectangle'} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }} className={className}>
      <Image
        src={src}
        alt={`${productName} eyewear frame`}
        fill={fill || true}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        priority={priority}
        onError={() => setImgError(true)}
      />
      {/* Color tint overlay for visual differentiation */}
      {tint && (
        <div style={{
          position: 'absolute', inset: 0,
          background: tint,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }} />
      )}
    </div>
  );
}

/** Clean SVG fallback glasses */
function FallbackFrameSVG({ color, shape }: { color: string; shape: string }) {
  const c = color;

  if (shape === 'Round' || shape === 'Oval') {
    return (
      <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
        <ellipse cx="45" cy="40" rx="32" ry="28" stroke={c} strokeWidth="5" fill="rgba(255,255,255,0.5)" />
        <ellipse cx="115" cy="40" rx="32" ry="28" stroke={c} strokeWidth="5" fill="rgba(255,255,255,0.5)" />
        <path d="M77 40 Q80 36 83 40" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M13 35 Q8 32 4 36" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M147 35 Q152 32 156 36" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M30 30 Q45 24 55 28" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
        <path d="M100 30 Q115 24 125 28" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (shape === 'Cat-eye') {
    return (
      <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
        <path d="M13 44 Q20 16 48 20 Q60 20 77 38 Q60 56 45 54 Q22 52 13 44Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.5)" />
        <path d="M147 44 Q140 16 112 20 Q100 20 83 38 Q100 56 115 54 Q138 52 147 44Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.5)" />
        <path d="M77 39 Q80 35 83 39" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M13 40 Q8 37 4 40" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M147 40 Q152 37 156 40" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M20 32 Q35 24 48 26" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
        <path d="M112 26 Q125 24 140 32" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (shape === 'Aviator') {
    return (
      <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
        <path d="M13 24 Q14 18 20 18 L70 18 Q78 18 77 32 Q77 54 45 54 Q20 54 13 38 Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.5)" />
        <path d="M147 24 Q146 18 140 18 L90 18 Q82 18 83 32 Q83 54 115 54 Q140 54 147 38 Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.5)" />
        <path d="M77 24 Q80 20 83 24" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M13 28 Q8 26 4 30" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M147 28 Q152 26 156 30" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="13" y1="18" x2="77" y2="18" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="83" y1="18" x2="147" y2="18" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  // Rectangle / Square default
  return (
    <svg width="170" height="80" viewBox="0 0 170 80" fill="none">
      <rect x="14" y="20" width="62" height="40" rx="6" stroke={c} strokeWidth="5" fill="rgba(255,255,255,0.5)" />
      <rect x="94" y="20" width="62" height="40" rx="6" stroke={c} strokeWidth="5" fill="rgba(255,255,255,0.5)" />
      <path d="M76 40 Q80 36 94 40" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M14 35 Q9 32 5 36" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M156 35 Q161 32 165 36" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M22 28 Q40 23 52 26" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <path d="M102 26 Q120 23 138 28" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

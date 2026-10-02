'use client';
import Image from 'next/image';
import { useState } from 'react';

/** Map of product IDs → public image paths, grouped by frame shape */
export const PRODUCT_IMAGES: Record<string, string> = {
  // ── Eyeglasses ──────────────────────────────────────────────────────────────
  'frame-001': '/assets/products/eyeglasses/willow-tortoise.jpg',   // Willow Tortoise  (Rectangle, Tortoise)
  'frame-002': '/assets/products/eyeglasses/raven-black.jpg',       // Raven Black      (Round, Black)
  'frame-003': '/assets/products/eyeglasses/azure-blue.jpg',        // Azure Blue       (Rectangle, Blue)
  'frame-004': '/assets/products/eyeglasses/maple-brown.jpg',       // Maple Brown      (Aviator, Brown)
  'frame-005': '/assets/products/eyeglasses/olive-green.jpg',       // Olive Green      (Cat-Eye, Green)
  'frame-006': '/assets/products/eyeglasses/crystal-clear.jpg',     // Crystal Clear    (Round, Clear)
  'frame-007': '/assets/products/eyeglasses/graphite-grey.jpg',     // Graphite Grey    (Rectangle, Grey)
  'frame-008': '/assets/products/eyeglasses/blush-pink.jpg',        // Blush Pink       (Cat-Eye, Pink)
  'frame-018': '/assets/products/eyeglasses/sunrise-rose.jpg',      // Sunrise Rose     (Cat-Eye, Rose Gold)
  'frame-019': '/assets/products/eyeglasses/heritage-honey.jpg',    // Heritage Round   (Round, Honey)
  'frame-020': '/assets/products/eyeglasses/minimal-silver.jpg',    // Minimal Wire     (Rectangle, Silver)
  'frame-023': '/assets/products/eyeglasses/pebble-grey.jpg',       // Pebble Oval      (Oval, Grey)

  // ── Sunglasses ──────────────────────────────────────────────────────────────
  'frame-009': '/assets/products/sunglasses/square-frames.jpg',     // Cobalt Shield    (Square, Blue)
  'frame-010': '/assets/products/sunglasses/aviator-frames.jpg',    // Desert Sand      (Aviator, Sand)
  'frame-011': '/assets/products/sunglasses/noir-black.jpg',        // Noir Oversize    (Cat-Eye, Black)
  'frame-012': '/assets/products/sunglasses/terracotta-cat.jpg',    // Terracotta Round (Round, Terracotta)
  'frame-021': '/assets/products/sunglasses/square-frames.jpg',     // Bold Rectangle   (Rectangle, Black)
  'frame-025': '/assets/products/sunglasses/terracotta-cat.jpg',    // Amber Luxe Oval  (Oval, Amber)
  'frame-026': '/assets/products/sunglasses/square-frames.jpg',     // Steel Matrix     (Square, Silver)

  // ── Blue-light ──────────────────────────────────────────────────────────────
  'frame-013': '/assets/products/bluelight/bluelight-frames.jpg',   // Focus Pro        (Rectangle, Black)
  'frame-014': '/assets/products/bluelight/scholar-gold.jpg',       // Scholar Thin     (Rectangle, Gold)
  'frame-015': '/assets/products/bluelight/night-owl-amber.jpg',    // Night Owl        (Round, Amber)
  'frame-022': '/assets/products/bluelight/forest-green.jpg',       // Forest Green     (Rectangle, Green)

  // ── Kids ────────────────────────────────────────────────────────────────────
  'frame-016': '/assets/products/kids/kids-frames.jpg',             // Sparky           (Rectangle, Red)
  'frame-017': '/assets/products/kids/mini-scholar-blue.jpg',       // Mini Scholar     (Rectangle, Blue)
  'frame-024': '/assets/products/kids/tiny-tot-purple.jpg',         // Tiny Tot         (Round, Purple)
};

/** Transparent PNG overlays for Virtual Try-On mapped 1:1 to every product ID */
export const FRAME_OVERLAYS: Record<string, string> = {
  'frame-001': '/assets/frames/frame-001.png',
  'frame-002': '/assets/frames/frame-002.png',
  'frame-003': '/assets/frames/frame-003.png',
  'frame-004': '/assets/frames/frame-004.png',
  'frame-005': '/assets/frames/frame-005.png',
  'frame-006': '/assets/frames/frame-006.png',
  'frame-007': '/assets/frames/frame-007.png',
  'frame-008': '/assets/frames/frame-008.png',
  'frame-009': '/assets/frames/frame-009.png',
  'frame-010': '/assets/frames/frame-010.png',
  'frame-011': '/assets/frames/frame-011.png',
  'frame-012': '/assets/frames/frame-012.png',
  'frame-013': '/assets/frames/frame-013.png',
  'frame-014': '/assets/frames/frame-014.png',
  'frame-015': '/assets/frames/frame-015.png',
  'frame-016': '/assets/frames/frame-016.png',
  'frame-017': '/assets/frames/frame-017.png',
  'frame-018': '/assets/frames/frame-018.png',
  'frame-019': '/assets/frames/frame-019.png',
  'frame-020': '/assets/frames/frame-020.png',
  'frame-021': '/assets/frames/frame-021.png',
  'frame-022': '/assets/frames/frame-022.png',
  'frame-023': '/assets/frames/frame-023.png',
  'frame-024': '/assets/frames/frame-024.png',
  'frame-025': '/assets/frames/frame-012.png',
  'frame-026': '/assets/frames/frame-009.png',
};


/** Per-product color tint overlay to visually differentiate reused base images */
export const PRODUCT_TINTS: Record<string, string> = {
  'frame-015': 'rgba(200,168,130,0.22)',  // Night Owl
  'frame-019': 'rgba(200,168,130,0.18)',  // Heritage Round
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
        alt={productName}
        fill={fill}
        width={!fill ? 300 : undefined}
        height={!fill ? 225 : undefined}
        priority={priority}
        style={{ objectFit: 'cover', objectPosition: 'center top' }}
        onError={() => setImgError(true)}
      />
      {tint && (
        <div style={{
          position: 'absolute', inset: 0,
          background: tint,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

function FallbackFrameSVG({ color, shape }: { color: string; shape: string }) {
  const c = color || '#8B5E3C';
  const normShape = (shape || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normShape === 'round') {
    return (
      <svg width="170" height="85" viewBox="0 0 170 85" fill="none">
        <ellipse cx="48" cy="42.5" rx="30" ry="27" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <ellipse cx="122" cy="42.5" rx="30" ry="27" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M78 42.5 Q85 38.5 92 42.5" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M18 38 Q12 35 6 39" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M152 38 Q158 35 164 39" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (normShape === 'rectangle') {
    return (
      <svg width="175" height="85" viewBox="0 0 175 85" fill="none">
        <rect x="14" y="24" width="62" height="37" rx="5" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <rect x="99" y="24" width="62" height="37" rx="5" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M76 42 Q87.5 38 99 42" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M14 36 Q9 33 5 37" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M161 36 Q166 33 170 37" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (normShape === 'square') {
    return (
      <svg width="175" height="85" viewBox="0 0 175 85" fill="none">
        <rect x="14" y="18" width="62" height="48" rx="8" stroke={c} strokeWidth="4.8" fill="rgba(255,255,255,0.6)" />
        <rect x="99" y="18" width="62" height="48" rx="8" stroke={c} strokeWidth="4.8" fill="rgba(255,255,255,0.6)" />
        <path d="M76 40 Q87.5 36 99 40" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M14 32 Q9 29 5 33" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M161 32 Q166 29 170 33" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (normShape === 'cateye') {
    return (
      <svg width="175" height="85" viewBox="0 0 175 85" fill="none">
        <path d="M14 46 Q22 18 52 22 Q64 22 76 40 Q64 58 48 56 Q24 54 14 46Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M161 46 Q153 18 123 22 Q111 22 99 40 Q111 58 127 56 Q151 54 161 46Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M76 41 Q87.5 37 99 41" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M14 42 Q9 39 5 42" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M161 42 Q166 39 170 42" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (normShape === 'aviator') {
    return (
      <svg width="175" height="85" viewBox="0 0 175 85" fill="none">
        <path d="M14 26 Q15 20 22 20 L72 20 Q78 20 78 34 Q78 56 46 56 Q20 56 14 40 Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M161 26 Q160 20 153 20 L103 20 Q97 20 97 34 Q97 56 129 56 Q155 56 161 40 Z" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
        <path d="M78 26 Q87.5 22 97 26" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M78 33 Q87.5 29 97 33" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M14 30 Q9 28 5 32" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M161 30 Q166 28 170 32" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="175" height="85" viewBox="0 0 175 85" fill="none">
      <rect x="14" y="24" width="62" height="37" rx="5" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
      <rect x="99" y="24" width="62" height="37" rx="5" stroke={c} strokeWidth="4.5" fill="rgba(255,255,255,0.6)" />
      <path d="M76 42 Q87.5 38 99 42" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M14 36 Q9 33 5 37" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M161 36 Q166 33 170 37" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

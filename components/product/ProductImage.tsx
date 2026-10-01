'use client';
import Image from 'next/image';
import { useState } from 'react';

/** Map of product IDs → public photo image paths ONLY when photo matches frame shape */
export const PRODUCT_IMAGES: Record<string, string> = {
  // Real generated photos matching exact frame shape
  'frame-002': '/assets/products/eyeglasses/raven-black.jpg',    // Raven Black (Round)
  'frame-004': '/assets/products/eyeglasses/maple-brown.jpg',    // Maple Brown (Aviator)
  'frame-006': '/assets/products/eyeglasses/crystal-clear.jpg',  // Crystal Clear (Round)
  'frame-008': '/assets/products/eyeglasses/blush-pink.jpg',     // Blush Pink (Cat-Eye)
  'frame-018': '/assets/products/eyeglasses/sunrise-rose.jpg',   // Sunrise Rose (Cat-Eye)
  'frame-015': '/assets/products/eyeglasses/raven-black.jpg',    // Night Owl (Round)
  'frame-019': '/assets/products/eyeglasses/crystal-clear.jpg',  // Heritage Round (Round)
  'frame-024': '/assets/products/eyeglasses/crystal-clear.jpg',  // Tiny Tot (Round)
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

# StyleMe Eyewear - Agent Context (Repo Memory)

> **Last Updated:** 2026-09-30 (Session 7)

## Project

Premium eyewear e-commerce prototype. Next.js 16 + TypeScript + Tailwind CSS + GSAP + Zustand.
All data is mock (from `data/products.ts`). No real backend.

**Live URLs:**
- Production: https://style-me-virid.vercel.app
- Local dev: http://localhost:3000
- GitHub: https://github.com/samruddhi-1324/Style-me

---

## Architecture

- **App Router** with 12 pages:
  - `/` — Homepage (GSAP hero & scroll triggers)
  - `/shop` — Catalog with mobile filter drawer & query param filters
  - `/product/[id]` — Detail page with gallery, specs, fit guide
  - `/try-on` — Virtual Try-on SVG overlay + camera + upload
  - `/lens-configurator` — 5-step Rx & lens configuration wizard
  - `/cart` — Shopping cart with quantity & price summary
  - `/checkout` — Shipping, payment, order success
  - `/account` — User profile, order history, saved prescriptions
  - `/wishlist` — Saved frames grid
  - `/collections` — Category grid & featured collections
  - `/style-finder` — 4-step AI quiz with face shape analysis
  - `/about` — Brand story, mission, timeline & team

- **Layouts**: Header with mobile drawer, Footer, MobileNav bottom bar (< 768px), CartDrawer, AIAssistant.

---

## State Management

- **Zustand** store in `lib/store.ts` — persisted to `localStorage`
- Cart: `cart[]`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `cartTotal()`, `setCartOpen()`
- Wishlist: `wishlist[]`, `toggleWishlist()`, `isWishlisted()`
- Auth: `user`, `isLoggedIn`, `login()`, `logout()`

---

## CSS & Styling Strategy

`app/globals.css` contains:
1. **Design tokens** — `--color-ivory`, `--color-plum`, `--color-terracotta`, `--color-sage`, `--color-forest`, etc.
2. **Utility classes** — `.grid-2`, `.grid-3`, `.grid-4`, `.cat-grid`, `.btn-primary`, `.btn-outline`, `.badge`, `.tag`, `.card`, `.skeleton`, `.input-field`
3. **Page-specific responsive classes** — each page component uses `className` on layout containers; the CSS uses `!important` to override inline `style` props at mobile breakpoints.

**Critical: How responsive layout works:**
- Pages set `style={{ display: 'grid', gridTemplateColumns: '...' }}` for desktop
- The same element also has a `className` (e.g. `className="cart-layout"`)
- In `globals.css @media (max-width: 768px)`, `.cart-layout { grid-template-columns: 1fr !important; }` overrides the inline style
- This pattern is used for ALL multi-column layouts across all pages

**CSS Classes Quick Reference:**

| Class | Mobile Behavior |
|-------|----------------|
| `.hero-grid` | 2-col → 1-col, `.hero-visual` hidden |
| `.cat-grid` | 4-col → 2-col |
| `.grid-2` | 2-col → 1-col |
| `.grid-3` | 3-col → 2-col |
| `.grid-4` | 4-col → 2-col |
| `.product-detail-grid` | 2-col → 1-col |
| `.product-info-actions` | Row → Column |
| `.cart-layout` | 2-col → 1-col |
| `.cart-item-grid` | 3-col → 2-col (100px + 1fr) |
| `.cart-price-col` | Visible → Hidden |
| `.cart-price-inline` | Hidden → Visible (shows price inline) |
| `.checkout-layout` | 2-col → 1-col |
| `.checkout-summary` | Last → First (order: -1) |
| `.address-grid` | 2-col → 1-col |
| `.lens-config-main` | 2-col → 1-col |
| `.tryon-layout` | 2-col → 1-col |
| `.account-layout` | 2-col → 1-col, sidebar hidden |
| `.finder-results-grid` | 3-col → 2-col |
| `.collections-cat-grid` | 4-col → 2-col |
| `.footer-grid` | 4-col → 2-col |

---

## Build & Deploy

```powershell
# Dev server
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run dev

# Production build check (must pass before pushing)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run build

# Push to GitHub → triggers Vercel auto-deploy
git add -A; git commit -m "message"; git push origin main
```

**Note on PowerShell:** Always prepend `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass;` before npm/git commands — execution policy is restricted on this machine.

---

## Data Shape (Key Types)

```typescript
// Product (from data/products.ts)
{
  id: string;           // e.g. 'frame-001'
  name: string;
  category: 'Eyeglasses' | 'Sunglasses' | 'Blue-light' | 'Kids';
  price: number;        // INR
  originalPrice: number;
  colors: string[];     // CSS color values
  color: string;        // primary color name
  frameShape: 'Round' | 'Oval' | 'Rectangle' | 'Cat-eye' | 'Aviator';
  material: string;
  measurements: { frameWidth, lensHeight, bridgeWidth, templeLength };
  fit: 'Good' | 'Snug' | 'Roomy';
  fitNote: string;
  isFeatured: boolean;
  isNew: boolean;
  inStock: boolean;
  badges: string[];
  rating: number;
  reviewCount: number;
  faceShapes?: string[];
  weight?: string;
  prescriptionRange?: string;
  warranty?: string;
  gender: string;
  description: string;
}

// CartItem (from lib/store.ts)
{
  id: string;
  productId: string;
  productName: string;
  color: string;
  size: string;
  framePrice: number;
  lensType: string;
  lensTypePrice: number;
  lensIndex: string;
  lensIndexPrice: number;
  coatings: string[];
  coatingsPrice: number;
  prescription: string | null;
  quantity: number;
  totalPrice: number;
}
```

---

## Session 7 Fixes (2026-09-30) — What Changed

1. **`app/globals.css`**:
   - Added `.tag` class (terracotta pill-shaped eyebrow label)
   - Added `.badge-coral` class (was undefined, used on product detail discount badge)
   - Added `.cat-grid` utility class (4-col, collapses to 2-col on mobile)
   - Added `.cat-grid` to mobile media query

2. **`app/cart/page.tsx`**:
   - Added `.cart-price-inline` div inside cart item info section
   - Shows item price + remove button on mobile (replaces the hidden `.cart-price-col`)

3. **Build**: Verified `npm run build` passes (14 routes, 0 errors, 0 TypeScript errors)

4. **Git commit**: `316e0fb` — pushed to `main`, Vercel auto-deployed

---

## Known Limitations (Intentional — Frontend Prototype)

- No real backend
- No real payment gateway
- No AI face detection (Try-On uses demo avatar + SVG overlay)
- Order history is hardcoded mock data
- Prescription upload is UI-only

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

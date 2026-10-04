# StyleMe Eyewear — Agent Context (Repo Memory)

> **Last Updated:** 2026-10-04 (Sessions 14–15)
> **Status:** 🟢 Frontend 100% Complete — All filters working, Virtual Try-On 1:1 mapping fixed, latest commit `48bda98` on `main`.

---

## Project

Premium eyewear e-commerce prototype. Next.js 16 + TypeScript + Vanilla CSS (design tokens) + GSAP + Zustand.
All data is mock (from `data/products.ts`). No real backend.

**Repo:** https://github.com/samruddhi-1324/Style-me
**Local Dev:** http://localhost:3000
**Vercel Production:** Check Vercel Dashboard — old preview URL `style-m2d9gjsx1-samruddhi16.vercel.app` is now login-gated. Find the current production URL in the Vercel project dashboard.

---

## Architecture

- **Next.js 16 App Router** with 14 routes:
  - `/` — Homepage (GSAP hero + scroll triggers, category grid)
  - `/shop` — Catalog with smart filter drawer + color synonym matching + query param sync
  - `/product/[id]` — Detail page with gallery, specs, fit guide, try-on CTA
  - `/try-on` — Virtual Try-On: transparent PNG overlay engine, photo upload, eye-line calibration
  - `/lens-configurator` — 5-step Rx & lens wizard
  - `/cart` — Cart with quantity, price summary, slide-over drawer
  - `/checkout` — Shipping, payment, order success
  - `/account` — Profile, order history, saved prescriptions
  - `/wishlist` — Saved frames grid
  - `/collections` — Category grid & featured collections
  - `/style-finder` — 4-step AI quiz + face shape analysis
  - `/about` — Brand story, mission, timeline, team
  - `/_not-found` — 404
  - `/product/[id]` (dynamic) — Server-rendered on demand

- **Layouts**: Header (mobile full-screen drawer), Footer, MobileNav (fixed bottom tab bar <768px), CartDrawer (slide-in), AIAssistant (mobile chat panel).

---

## State Management

- **Zustand** store in `lib/store.ts` — persisted to `localStorage`
- Cart: `cart[]`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `cartTotal()`, `setCartOpen()`
- Wishlist: `wishlist[]`, `toggleWishlist()`, `isWishlisted()`
- Auth: `user`, `isLoggedIn`, `login()`, `logout()`

---

## Product Data (`data/products.ts`)

26 products total across 4 categories:
- **Eyeglasses** (12): frame-001 to frame-008, frame-018 to frame-020, frame-023
- **Sunglasses** (7): frame-009 to frame-012, frame-021, frame-025, frame-026
- **Blue-light** (4): frame-013 to frame-015, frame-022
- **Kids** (3): frame-016, frame-017, frame-024

### Filter Coverage Matrix

**Eyeglasses:**
| Shape | Material | Key Colors |
|---|---|---|
| Rectangle | Acetate | Tortoise, Blue, Grey |
| Round | TR90, Acetate | Black, Clear, Honey |
| Cat-Eye | Acetate | Green, Pink, Rose Gold |
| Square | Metal | Silver |
| Aviator | Acetate | Brown |
| Oval | TR90 | Grey |

**Sunglasses:**
| Shape | Material | Key Colors |
|---|---|---|
| Square | Acetate, Metal | Blue, Silver |
| Aviator | Metal | Gold |
| Cat-Eye | Acetate | Black |
| Round | TR90 | Terracotta |
| Rectangle | Acetate | Black |
| Oval | Metal | Amber |

---

## Image Asset Architecture

### Product Thumbnails (`public/assets/products/`)
```
eyeglasses/  → willow-tortoise.jpg, raven-black.jpg, azure-blue.jpg, maple-brown.jpg,
               olive-green.jpg, crystal-clear.jpg, graphite-grey.jpg, blush-pink.jpg,
               sunrise-rose.jpg, heritage-honey.jpg, minimal-silver.jpg, pebble-grey.jpg
sunglasses/  → square-frames.jpg, aviator-frames.jpg, noir-black.jpg, terracotta-cat.jpg
bluelight/   → bluelight-frames.jpg, scholar-gold.jpg, night-owl-amber.jpg, forest-green.jpg
kids/        → kids-frames.jpg, mini-scholar-blue.jpg, tiny-tot-purple.jpg
```

### Try-On Overlays (`public/assets/frames/`)
- `frame-001.png` to `frame-024.png` — Transparent PNG overlays, cleaned with ellipse-masked lens cutouts
- `frame-025` and `frame-026` reuse `frame-012.png` and `frame-009.png` respectively

### Image Mapping (`components/product/ProductImage.tsx`)
- `PRODUCT_IMAGES` — maps product ID → thumbnail JPG path (26 entries)
- `FRAME_OVERLAYS` — maps product ID → transparent PNG overlay path (26 entries)
- `PRODUCT_TINTS` — optional color overlay tint for shared base images

---

## Virtual Try-On Architecture (`app/try-on/page.tsx`)

### Single Source of Truth
```typescript
const [selectedFrame, setSelectedFrame] = useState<string>('frame-001');
const currentFrame = products.find(p => p.id === selectedFrame) || products[0];
```
- Grid thumbnail click: `onClick={() => setSelectedFrame(f.id)}` — ID-based, never array-index
- Overlay: `FRAME_OVERLAYS[currentFrame.id]`

### Photo Upload State
- `uploadedImageSrc` — object URL (created, cleaned up on unmount/replace)
- File: JPG/PNG/WEBP, max 10MB validation
- Portrait overlay positioned at `top: 29%`, width `210px` for eye-line alignment

### Position Controls
- `frameX` / `frameY` — Move sliders (-200px to +200px / -250px to +250px)
- `frameScale` — Scale slider (0.3x to 3.0x)
- `frameRotation` — Rotation slider (-45° to +45°)
- Drag-to-move via pointer events (`onPointerDown/Move/Up`)
- `triggerAutoFit()` — resets all transforms to defaults
- `isScanning` — shows animated overlay during Auto Fit

### Filter Predicate (5 AND conditions)
1. Category — exact match (case-insensitive)
2. Gender — Men includes Unisex, Women includes Unisex
3. Frame Shape — normalized punctuation comparison
4. Colour — substring + color family synonym matching
5. Material — exact match (case-insensitive)

---

## Filter Logic (`app/shop/page.tsx`)

10-condition AND predicate:
1. Category (exact, case-insensitive)
2. Gender (Men+Unisex, Women+Unisex, Unisex, Kids)
3. Frame Shape (normalized: remove non-alpha chars)
4. Material (exact)
5. Size (exact)
6. Price Range (min/max)
7. Face Shape (substring in faceShapes[], fitNote, description)
8. Frame Color — **smart synonym matching**:
   - Black → {black, noir, graphite, raven, matte black}
   - Brown → {brown, tortoise, honey, amber, sand, maple}
   - Pink → {pink, blush, rose}
   - Gold / Rose Gold → {gold, sand, honey, rose}
   - Silver / Grey → {silver, grey, graphite}
   - Blue → {blue, cobalt, azure}
   - Green → {green, olive, forest}
   - Clear / Transparent → {clear, transparent}
9. Lens Type (badge/description/category substring)
10. Search Query (name, category, color, material, shape, gender)

Same synonym logic applied to Virtual Try-On (`app/try-on/page.tsx`) color filter.

---

## CSS & Styling Strategy

`app/globals.css` contains:
1. **Design tokens** — `--color-ivory`, `--color-plum`, `--color-terracotta`, `--color-sage`, `--color-forest`, `--color-espresso`, `--color-cream`, `--color-sand`, `--color-coral`, `--color-muted`
2. **Utility classes** — `.grid-2/3/4`, `.cat-grid`, `.btn-primary`, `.btn-outline`, `.badge`, `.tag`, `.card`, `.input-field`
3. **Page-specific responsive classes** — `.tryon-layout`, `.product-detail-grid`, `.cart-layout`, `.checkout-layout`, `.account-layout`, `.lens-config-main`, `.finder-results-grid`
4. **Breakpoints**: `max-width: 768px` (mobile), `769–1024px` (tablet), `min-width: 769px` (desktop)
5. **MobileNav offset**: `.tryon-page-wrapper { padding-bottom: calc(5rem + 70px) }` prevents overlap

---

## Known Limitations

- No real backend — all data is mock
- Cart, wishlist, auth persisted to `localStorage` only (no API)
- Payment flow is simulated (no real payment gateway)
- Prescription upload is UI-only (no file storage)
- Virtual Try-On uses calibrated preset positioning (`top: 29%`) — NOT real facial landmark detection
- Camera in Try-On is browser webcam only (no AI face detection / MediaPipe)
- Order history in Account is hardcoded mock data
- frame-025 and frame-026 reuse existing transparent overlay PNGs

---

## Dev Commands

```powershell
# Start dev server
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; cd "d:\Style me\styleme"; npm run dev

# Production build check
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; cd "d:\Style me\styleme"; npm run build

# Commit & push (triggers Vercel auto-deploy)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; cd "d:\Style me\styleme"; git add -A; git commit -m "message"; git push origin main
```

---

## Possible Next Session Tasks

If the user wants to continue, these are the remaining optional enhancements:
1. **Generate individual transparent overlay PNGs for frame-025 and frame-026** instead of reusing existing assets
2. **Fix Vercel production URL** — check Vercel Dashboard and get the correct live URL
3. **Backend integration** — connect cart, wishlist, orders to a real database (Supabase/Firebase)
4. **Real face detection** — integrate MediaPipe FaceMesh for actual pupillary distance & eye-line detection in Virtual Try-On
5. **Prescription upload** — connect to a storage backend (Cloudinary/S3)
6. **Payment integration** — Razorpay or Stripe for real checkout flow
7. **Search functionality** — full-text search across product name, color, shape, description
8. **Product reviews** — add review submission form and backend storage

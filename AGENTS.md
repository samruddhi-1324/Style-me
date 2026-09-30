# StyleMe Eyewear - Agent Context

## Project
Premium eyewear e-commerce prototype. Next.js 16 + TypeScript + Tailwind CSS + GSAP + Zustand.
All data is mock (from `data/products.ts`). No real backend.

## Architecture
- **App Router** with 12 pages:
  - `/` (Homepage — GSAP hero & scroll triggers)
  - `/shop` (Catalog with mobile filter drawer & query param filters)
  - `/product/[id]` (Detail page with gallery, specs, fit guide)
  - `/try-on` (Virtual Try-on SVG overlay + camera + upload)
  - `/lens-configurator` (5-step Rx & lens configuration wizard)
  - `/cart` (Shopping cart with quantity & price summary)
  - `/checkout` (Shipping address form, shipping method, payment, order success)
  - `/account` (User profile, order history, saved prescriptions)
  - `/wishlist` (Saved frames grid)
  - `/collections` (Category grid & featured collections)
  - `/style-finder` (4-step AI quiz with face shape analysis)
  - `/about` (Brand story, mission, timeline & team)
- **Layouts**: Header with mobile drawer, Footer, MobileNav bottom bar (< 768px), CartDrawer, AIAssistant.

## Status
- **Mobile Responsiveness**: 🟢 100% Complete & Verified. All 12 pages use responsive CSS classes and media queries in `globals.css`.
- **Next.js Production Build**: 🟢 Verified (`npm run build` passes with zero errors).

## CSS & Styling Strategy
- `app/globals.css` contains all design tokens (`--color-*`), utility classes (`.grid-2`, `.grid-3`, `.grid-4`, `.desktop-only`, `.mobile-only`), and page-specific `@media (max-width: 768px)` override classes (`.hero-grid`, `.product-detail-grid`, `.cart-layout`, `.checkout-layout`, `.lens-config-main`, `.account-layout`, `.finder-results-grid`, etc.).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

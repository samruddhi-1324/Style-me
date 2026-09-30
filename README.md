# StyleMe Eyewear

A modern, high-aesthetic e-commerce frontend for prescription eyeglasses, sunglasses, and blue-light eyewear. Features interactive Virtual Try-On, AI-driven StyleFinder recommendations, a 4-step Lens Configurator wizard, and client-side shopping cart and checkout flows.

## Features

- **Eyeglasses Shopping:** Curated catalog with millimetre-accurate fit measurements and frame specifications.
- **Sunglasses & Collections:** Seasonal edits, new arrivals, bestsellers, and category highlights.
- **Multi-Criteria Product Filtering:** Filter dynamically by Category, Gender, Frame Material, Frame Shape, Face Shape (*Oval, Round, Square, Heart, Oblong*), Frame Color, Lens Type, and Price Range.
- **Product Sorting & Pagination:** Sort by Popularity, Price (Low/High), Rating, Newest, and Discount with real-time product count and "Load More" pagination.
- **Product Details (PDP):** Rich product presentation with millimetre dimension diagrams, customer reviews, AI fit suitability badges ("Why this frame might suit you"), and color variant swatches.
- **Virtual Try-On Demo:** Browser-based simulated facial landmark detection, centering frames over pupil centers with Move X, Move Y, Scale, and -45° to +45° **Rotation** controls + **Auto Fit**.
- **AI StyleFinder™:** 4-step interactive quiz (Face Shape, Style Preference, Usage, Budget) with optional selfie face-scanning simulation and matched-reason recommendation cards.
- **4-Step Lens Configurator:** Step-by-step custom lens builder: Lens Type (Single Vision, Blue Light, Anti-Glare, Photochromic, Progressive), Prescription entry (manual/photo/send-later), Coating & Index selection, and live price summary.
- **Wishlist & Cart:** Client-side state persistence via Zustand and `localStorage`, with drawer modal and full cart view.
- **Checkout Prototype:** Clean 5-step mock checkout (Address, Delivery, Demo Payment, Review, Order Confirmation with Order ID).
- **Responsive Navigation:** Clean desktop top navigation and fixed mobile bottom navigation bar with active tab indicators and zero content overlap.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI & Logic:** React 19, TypeScript
- **Styling:** Vanilla CSS design tokens + Tailwind CSS v4
- **State Management:** Zustand (with `localStorage` persistence)
- **Animation:** GSAP (GreenSock Animation Platform)
- **Fonts:** Google Fonts (*Cormorant Garamond* display serif & *Inter* sans-serif)

## Local Development

### 1. Installation

Ensure Node.js (version 18 or higher) is installed. Clone the repository and install dependencies:

```bash
npm install
```

### 2. Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

Validate and build the production bundle:

```bash
npm run build
```

### 4. Start Production Server

Run the production build locally:

```bash
npm run start
```

## Deployment

This frontend is designed for seamless deployment on **Vercel**:

1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import the `styleme` repository.
4. Framework Preset will automatically be detected as **Next.js**.
5. Build Command: `npm run build`
6. Output Directory: Next.js default (`.next`)
7. Click **"Deploy"**.

## Environment Variables

This is a self-contained frontend application with mock product data and client-side state.
**No private API keys or backend environment variables are required.**

An example file is provided at `.env.example`:
```bash
NEXT_PUBLIC_SITE_URL=https://styleme-eyewear.vercel.app
```

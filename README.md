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

The storefront is deployed on **Vercel**. The Spring Boot API can be hosted on **Render** using the root `render.yaml` blueprint and `backend/Dockerfile`.

Before connecting the Render service to Supabase, review pending Flyway migrations. The first production startup runs Flyway and may modify the database; do not start it until the pending migration has been reviewed and approved.

Configure these frontend environment variables in Vercel after the backend is deployed:

```text
NEXT_PUBLIC_API_URL=https://<render-service-host>
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_CSRF_ENABLED=true
```

Set the Google OAuth authorized redirect URI to:

```text
https://<render-service-host>/login/oauth2/code/google
```

Set backend secrets and the Supabase JDBC URL in the Render service environment, not in source control. The Render free plan can spin down when idle.

## Environment Variables

The local frontend settings are in `.env.local` (ignored by Git). The public API URL points to the local Spring Boot backend.

Google OAuth client credentials and database passwords must stay in the backend's private `.env` file. Never add secrets to frontend environment variables or any variable prefixed with `NEXT_PUBLIC_`.

Start the frontend from this directory with `npm run dev`. In a second terminal, start the backend from the sibling `backend` directory with `mvn spring-boot:run`. The backend defaults to the H2 `local` profile and reads OAuth values from `backend/.env`; this local profile does not run Flyway migrations.

Put these keys in `backend/.env` with your own Google OAuth values:

```text
GOOGLE_OAUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:3000
```

The frontend `.env.local` is already configured for localhost and must contain no secrets. If `backend/.env` sets `SPRING_PROFILES_ACTIVE=local-postgres`, remove or comment out that setting for the safe H2 local test; the PostgreSQL profile may run database migrations.

For local Google OAuth, configure the Google OAuth client with this authorized redirect URI:

```text
http://localhost:8080/login/oauth2/code/google
```

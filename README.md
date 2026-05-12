# PasaMeme Frontend

React + Vite PWA frontend for authentication, dashboard, wallet, and live coin streams.

## Prerequisites

- Node.js 18+
- npm 9+
- Backend running on `http://localhost:5001`

## Setup

1. Install dependencies:
   - `npm install`
2. Create env file:
   - Copy `.env.example` to `.env`
3. Start dev server:
   - `npm run dev`

## Build & Validation

- Build: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`

## Environment Variables

- `VITE_API_URL` (e.g. `http://localhost:5001/api`)
- `VITE_WS_BINANCE_URL` (default Binance BTC stream)
- `VITE_ENV` (`development` or `production`)
- `VITE_ENABLE_TV_DEV` (`true` to force TradingView in local dev)

## PWA Notes

- Service worker is disabled in dev to avoid Workbox noise.
- Service worker is enabled in production builds.
- If old cache appears, hard refresh and unregister old service worker in browser Application tab.

## Realtime Data

- Dashboard BTC price: Binance WebSocket stream.
- Coin list: multi-symbol Binance ticker stream.

## Mobile Responsiveness Test Matrix

- Viewports: 360x800, 390x844, 768x1024, 1024x1366, 1280+
- Critical screens: Login, Register, Dashboard, Wallet, Coin list
- Validate: no horizontal scroll, touch targets, fixed headers/footers, chart and trade panel visibility

## Cross Browser Checklist

- Chrome (latest)
- Edge (latest)
- Firefox (latest)
- Safari/iOS (latest)

Validate login, logout, routing, realtime updates, PWA install prompt and offline shell.

## Monitoring (Recommended)

- Error tracking: Sentry (`@sentry/react`)
- Analytics: Google Analytics 4 (`gtag`)
- Performance: Lighthouse CI + Web Vitals tracking

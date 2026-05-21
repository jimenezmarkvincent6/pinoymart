# PinoyMart UAE — Smart WhatsApp Grocery Ordering Platform

Modern mobile-first grocery web app for Filipino grocery stores in the UAE.
Customers browse online, add to cart, then complete checkout via a **prefilled
WhatsApp message** — no complex checkout, no payment integration headaches.

> Built as a portfolio piece and a real, ship-able product foundation.

---

## Phase 1 (this build)

- Modern Filipino-warm UI (amber + red on warm neutrals)
- Mobile-first responsive layout with bottom-tab nav
- 35+ sample products across 9 grocery categories
- Homepage: hero, perk strip, category tiles, featured, promos, "Just in"
- Catalog: search, sort, category filter, promo toggle
- Product detail with quantity stepper + related items
- Cart with quantity controls, persistence (localStorage via Zustand)
- **WhatsApp checkout**: form → preview message → opens `wa.me` link
- Admin dashboard UI (stats, recent orders, top products, low stock)

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config) |
| UI primitives | shadcn-style local components |
| Icons | lucide-react |
| State | Zustand (persisted cart) |
| Forms | React Hook Form + Zod |
| Backend *(Phase 2)* | Supabase (Auth · Postgres · Storage) |
| Hosting | Vercel (frontend) + Supabase Cloud (backend) |

## Project structure

```
src/
├── app/
│   ├── (shop)/                  customer-facing pages
│   │   ├── layout.tsx           header + footer + mobile nav
│   │   ├── page.tsx             homepage
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── products-view.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── cart/
│   │       ├── page.tsx
│   │       └── cart-view.tsx
│   ├── admin/                   admin console (mocked, Phase 2 wires auth)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css              theme tokens + base
│   └── layout.tsx               root layout + metadata
├── components/
│   ├── ui/                      Button, Card, Badge, Input, …
│   ├── shop/                    Header, Footer, ProductCard, HeroBanner, …
│   └── admin/                   StatCard
├── data/                        sample products & categories
├── lib/                         constants, format, whatsapp builder, utils
├── store/                       Zustand cart store
└── types/                       shared TS types
```

## Getting started

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

To change the destination WhatsApp number, edit `whatsappNumber` in
`src/lib/constants.ts` (use E.164 digits only, e.g. `971501234567`).

## How the WhatsApp checkout works

1. Customer fills cart and opens **/cart**.
2. They enter name, UAE contact, and delivery location.
3. On submit, the app:
   - generates a formatted order summary,
   - shows a preview modal,
   - opens `https://wa.me/<number>?text=<encoded message>` in WhatsApp.
4. The store receives a ready-to-act-on message — no custom backend required.

See `src/lib/whatsapp.ts` for the message template.

## Phase 2 (next)

- Supabase Auth (admin login only first)
- Product CRUD with Supabase Postgres
- Image uploads to Supabase Storage
- Real orders table + admin order management
- Soft loyalty: customer accounts (optional)

## License

Private portfolio project.

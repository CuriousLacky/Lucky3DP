# LUCKY 3DP — Photos and Curious Prompt AI

Premium A4 color printed posters, custom photo printing, and an Instagram-like AI prompt sharing platform.

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in real values
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

## Deploy to Netlify

```bash
git add . && git commit -m "deploy" && git push
```

Netlify auto-detects `netlify.toml`. Set env vars in dashboard. See `DEPLOYMENT.md` for full guide.

---

## Pricing

| Product | Qty | Price |
|---|---|---|
| Pre-available Poster (Pinterest) | 1 | ₹149 |
| Pre-available Poster Pack | 7 | ₹249 |
| Custom Photo Print | 4 | ₹170 |
| Custom Photo Print | 7 | ₹289 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand (localStorage persist) |
| Database | MongoDB Atlas + Prisma |
| Payments | Razorpay |
| File Storage | Cloudinary (Free Plan) |
| Courier | Delhivery API |
| Ads | Adsterra (5-sec gateway) |
| Analytics | Google Analytics 4 |
| Hosting | Netlify |
| WhatsApp | Direct wa.me links |

---

## Routes

| Route | Description |
|---|---|
| `/` | Homepage — hero slider, featured posters, how it works |
| `/posters` | Poster catalog (filter/search) + custom photo upload |
| `/curious-ai` | Instagram-like AI prompt feed + post creation |
| `/cart` | Shopping cart with pack deal detection |
| `/checkout` | Shipping form + Razorpay payment |
| `/order-confirmation/[id]` | Order success with WhatsApp share |

## API Routes (13)

| Route | Purpose |
|---|---|
| `POST /api/orders/create` | Create order + Razorpay order |
| `POST /api/orders/verify` | Verify payment signature |
| `GET /api/pin-lookup` | India Post city/state lookup |
| `POST /api/shipping/create-shipment` | Create Delhivery shipment |
| `GET /api/shipping/track/[waybill]` | Track shipment |
| `GET /api/shipping/check-pincode/[pin]` | Delhivery serviceability |
| `GET/POST /api/admin/create-shipment` | Admin shipment management |
| `GET/POST /api/curious/posts` | List/create prompt posts |
| `POST /api/curious/posts/[id]/like` | Toggle like |
| `POST /api/curious/posts/[id]/copy` | Track prompt copies |
| `POST /api/curious/upload` | Cloudinary upload for posts |
| `POST /api/notifications/whatsapp` | WhatsApp notification (placeholder) |
| `POST /api/prompts/log` | Analytics logging |

## Theme

- Dark base: `#0D1117`
- Gold accent: `#D4A853`
- Cyan accent: `#38BDF8`
- Fonts: Sora (headings) + DM Sans (body)
- Light mode toggle available

---

© 2024 LUCKY 3DP — Made with ☕ in Gwalior

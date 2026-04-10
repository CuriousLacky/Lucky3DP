# LUCKY 3DP — Netlify Deployment Guide

## Quick Deploy

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Lucky 3DP — full build"
git remote add origin https://github.com/YOUR_USERNAME/lucky3dp.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** → choose your `lucky3dp` repo
4. Netlify auto-detects `netlify.toml` — settings will be pre-filled:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Click **"Deploy site"**

---

## Environment Variables

Go to **Site settings → Environment variables** and add ALL of these:

### MongoDB (Required)
| Variable | Example Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/lucky3dp?retryWrites=true&w=majority` |

### Razorpay (Required)
| Variable | Example Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxxxxxx` (use test key first!) |
| `RAZORPAY_KEY_SECRET` | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxxxxxx` (same as above) |

### Cloudinary (Required)
| Variable | Example Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | `000000000000000` |
| `CLOUDINARY_API_SECRET` | `xxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloud-name` (same as above) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `lucky3dp_unsigned` |

### Delhivery (Required for shipping)
| Variable | Example Value |
|---|---|
| `DELHIVERY_API_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `DELHIVERY_BASE_URL` | `https://track.delhivery.com/api` |

### WhatsApp & Ads
| Variable | Example Value |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `+919584604150` |
| `NEXT_PUBLIC_ADSTERRA_SCRIPT_URL` | `https://your-adsterra-script-url.js` |

### Auth
| Variable | Example Value |
|---|---|
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-site.netlify.app` (update after deploy) |

> **Important**: After your first deploy, update `NEXTAUTH_URL` to your actual Netlify URL.

---

## Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) → sign up (free plan)
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. Settings → **Upload** → **Upload presets** → **Add upload preset**:
   - Preset name: `lucky3dp_unsigned`
   - Signing mode: **Unsigned**
   - Folder: `lucky3dp`
   - Click **Save**
4. To connect Cloudinary to your GitHub profile:
   - Install the [Cloudinary GitHub App](https://github.com/apps/cloudinary)
   - Or add your Cloudinary cloud name to your GitHub repo description

---

## Database Setup (MongoDB Atlas)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create free cluster
2. Create database user with read/write access
3. Network Access → **Allow access from anywhere** (`0.0.0.0/0`) for Netlify
4. Get connection string → paste as `MONGODB_URI`
5. After deploy, run the seed:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

---

## Razorpay Setup

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Settings → **API Keys** → **Generate Test Key**
3. Copy Key ID and Secret → add to Netlify env vars
4. **Test mode first!** Use test keys until full flow verified
5. For production: generate Live keys and replace

Test card numbers:
- Success: `4111 1111 1111 1111` (any expiry, any CVV)
- Failure: `4000 0000 0000 0002`

---

## Custom Domain

### If you have a domain:

1. Netlify → **Site settings** → **Domain management** → **Add custom domain**
2. Enter your domain (e.g., `lucky3dp.com`)
3. Add these DNS records at your registrar:

   | Type | Name | Value |
   |---|---|---|
   | `CNAME` | `www` | `your-site.netlify.app` |
   | `A` | `@` | `75.2.60.5` |

   Or use Netlify DNS (recommended):
   - Change nameservers to Netlify's (shown in dashboard)

4. Enable **HTTPS** → Netlify auto-provisions Let's Encrypt SSL
5. Update `NEXTAUTH_URL` env var to `https://lucky3dp.com`

### If you don't have a domain:
Your site will be live at `https://your-site-name.netlify.app` — works perfectly.

---

## Post-Deployment Checklist

Run through each item after your first deploy:

### Critical Path
- [ ] Homepage loads with splash animation
- [ ] All 3 hero slides work (Posters, Curious AI, AgamiTech)
- [ ] Poster catalog renders with filters and search
- [ ] Add to cart works + cart count badge updates in navbar

### Payments
- [ ] Checkout form validates (PIN lookup, city/state auto-fill)
- [ ] PIN serviceability check shows green/red indicator
- [ ] Razorpay modal opens in **test mode**
- [ ] Use test card `4111 1111 1111 1111` to complete payment
- [ ] Order confirmation page shows with correct order number
- [ ] Order saved in MongoDB with status PAID

### Uploads & Media
- [ ] Custom photo upload works (drag & drop + click)
- [ ] Upload progress bars display correctly
- [ ] Photos appear in Cloudinary dashboard under `lucky3dp/` folder
- [ ] Curious AI post creation uploads before/after photos

### Curious AI
- [ ] Ad gateway shows 5-second countdown
- [ ] Posts can be created (type, prompt, before/after photos)
- [ ] Like, share, copy prompt buttons work
- [ ] Platform redirect (Gemini/ChatGPT/Perplexity) auto-copies prompt
- [ ] Post feed loads with infinite scroll

### Shipping
- [ ] Delhivery PIN check returns serviceability status
- [ ] Admin endpoint `GET /api/admin/create-shipment` lists paid orders
- [ ] Shipment creation returns waybill number

### WhatsApp
- [ ] Navbar contact button opens WhatsApp with pre-filled message
- [ ] Floating WhatsApp widget appears (bottom-right) after 2s
- [ ] Order confirmation "Share on WhatsApp" sends correct order details
- [ ] Links work on mobile (opens WhatsApp app)

### Ads
- [ ] Adsterra script loads in ad gateway modal (set `NEXT_PUBLIC_ADSTERRA_SCRIPT_URL`)
- [ ] If no script URL set, fallback placeholder shows

### Theme & Polish
- [ ] Dark mode is default
- [ ] Light mode toggle works (sun/moon in navbar)
- [ ] Page transitions animate between routes
- [ ] Skeleton loaders show during data fetches

### Mobile
- [ ] Responsive on iPhone/Android (test at 375px width)
- [ ] Mobile hamburger menu opens/closes
- [ ] Floating create post button visible on Curious AI (mobile)
- [ ] Touch-friendly before/after slider on posts

---

## Going Live Checklist

When ready to accept real payments:

1. **Razorpay**: Switch from test to live keys
2. **MongoDB**: Ensure indexes are created (`npx prisma db push`)
3. **Cloudinary**: Check storage usage on free plan (25GB)
4. **Delhivery**: Verify pickup location is configured in their dashboard
5. **Domain**: Set up custom domain + SSL
6. **Adsterra**: Paste real script URL into env var
7. **WhatsApp**: Verify number receives messages correctly
8. **Remove** any test orders from MongoDB

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails with Prisma | Add `npx prisma generate` to build: change command to `npx prisma generate && npm run build` |
| Cloudinary upload 401 | Check upload preset is set to "Unsigned" |
| Razorpay modal doesn't open | Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set (must start with `NEXT_PUBLIC_`) |
| MongoDB connection timeout | Whitelist `0.0.0.0/0` in Atlas Network Access |
| Delhivery API 403 | Verify token and base URL are correct |
| Images not loading | Add Cloudinary domain to `next.config.js` → `images.domains` |
| CSS flashes on load | Normal with SSR — splash screen masks this |

---

## Build Command Override

If Prisma fails during build, update `netlify.toml`:

```toml
[build]
  command = "npx prisma generate && npm run build"
```

Or in Netlify dashboard: **Site settings → Build & deploy → Build command**

---

© 2024 LUCKY 3DP — Built with Next.js 14, Tailwind CSS, Prisma, MongoDB

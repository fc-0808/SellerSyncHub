# SellerSyncHub

**The Ultimate Order Management Hub for Multi-Shop Sellers.**

Sync orders, track strict shipping deadlines, and manage fulfillment across 20+ storefronts — all from a single, powerful command center.

> The term "Etsy" is a trademark of Etsy, Inc. This application uses the Etsy API but is not endorsed or certified by Etsy, Inc.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.x (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Database | Supabase (PostgreSQL) |
| Runtime | React 19 |
| Dev server | Turbopack (via `next dev`) |

---

## Project Structure

```
app/
  layout.tsx              # Root layout — Navbar, Footer, global metadata
  page.tsx                # Landing page (Hero → Features → Pricing → Waitlist)
  globals.css             # Tailwind v4 entry + keyframe animations
  privacy/page.tsx        # Privacy Policy route
  terms/page.tsx          # Terms of Service route
  api/waitlist/route.ts   # POST handler — saves emails to Supabase
  robots.ts               # /robots.txt generator
  sitemap.ts              # /sitemap.xml generator

components/
  marketing/
    Navbar.tsx            # Sticky responsive nav with scroll detection
    Hero.tsx              # Dark hero section with gradient + stats bar
    WaitlistForm.tsx      # Client-side form with loading/success/error states
    Features.tsx          # 3-up feature cards + secondary feature strip
    Pricing.tsx           # 3-tier pricing (Coming Soon)
    WaitlistSection.tsx   # CTA section before footer
    Footer.tsx            # Dark footer with legal links + trademark disclaimer

lib/
  supabase.ts             # Server-side Supabase client factory

supabase/
  migrations/
    001_create_waitlist.sql   # Run this once to create the waitlist table
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Full URL of your deployment (e.g. `https://sellersynchub.com`) | Recommended |
| `SUPABASE_URL` | Your Supabase project URL | Yes (for waitlist) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes (for waitlist) |

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` is used exclusively in the server-side Route Handler (`app/api/waitlist/route.ts`). It is never exposed to the browser. Never prefix it with `NEXT_PUBLIC_`.

### 3. Set up the Supabase waitlist table

Run the migration in your Supabase project:

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Paste and run the contents of `supabase/migrations/001_create_waitlist.sql`

Or via Supabase CLI:

```bash
supabase db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Turbopack is enabled by default in Next.js 16. No extra flags needed.

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add the three environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SITE_URL` → your production URL
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy — Vercel auto-detects Next.js

The API Route Handler at `/api/waitlist` runs as a **Vercel Edge/Serverless Function** — no additional configuration required.

---

## Waitlist API

**`POST /api/waitlist`**

```json
// Request body
{ "email": "seller@example.com" }

// 201 — success
{ "message": "You're on the list! We'll be in touch soon." }

// 200 — already registered
{ "message": "You're already on the waitlist — we'll be in touch!" }

// 400 — validation error
{ "error": "Please enter a valid email address." }
```

Duplicate emails return `200` (not an error) to avoid leaking which addresses are registered.

---

## Callback URLs (Etsy API App)

Register these in your [Etsy Developer App settings](https://www.etsy.com/developers/your-apps):

| Environment | Callback URL |
|-------------|-------------|
| Local dev | `http://localhost:3000/api/oauth/callback` |
| Production | `https://sellersynchub.com/api/oauth/callback` |

---

## Legal

- [Privacy Policy](/privacy) — covers OAuth 2.0 data collection, retention, and security
- [Terms of Service](/terms) — covers acceptable use, API integrations, and liability
- Support: [hi@sellersynchub.com](mailto:hi@sellersynchub.com)

---

## License

Private and proprietary. All rights reserved.

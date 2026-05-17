# SellerSyncHub

**The Ultimate Order Management Hub for Multi-Shop Sellers.**

Sync orders, track strict shipping deadlines, and manage fulfillment across 20+ storefronts — all from a single, powerful command center.

> The term 'Etsy' is a trademark of Etsy, Inc. This Application uses Etsy's API, but is not endorsed or certified by Etsy.

---

## Etsy commercial API access — what this repo implements

These items align with Etsy’s [API Terms of Use](https://www.etsy.com/legal/api/) and typical **Request commercial access** review expectations:

| Requirement | Where it lives |
|-------------|----------------|
| Prominent Etsy trademark notice (exact wording from API Terms §1) | `lib/legal/constants.ts` → `EtsyTrademarkNotice` in footer, legal pages, `/integrations/etsy` |
| Monitored seller support contact | `hi@sellersynchub.com` in footer, legal pages, integration page |
| Privacy policy + enforceable **Seller Application Terms** (click-through + warranty disclaimer) | `/privacy`, `/application-terms`; waitlist requires checkbox acceptance + server-side consent timestamps |
| OAuth 2.0 Authorization Code + **PKCE**; registered callback URL | `GET /api/oauth/authorize`, `GET /api/oauth/callback` — register `https://<your-domain>/api/oauth/callback` (and dev URL) in Etsy Developer Portal |
| No scraping; minimum scopes (configurable) | Documented on `/integrations/etsy`; default scopes in `lib/oauth/etsy-oauth-server.ts` |
| Data display / caching awareness | New §4 in `/privacy` (listing vs other content freshness vs Etsy) |

When you submit **Application Purpose** in the Etsy developer UI, you can link reviewers to: your production home page, `/privacy`, `/terms`, `/application-terms`, and `/integrations/etsy`.

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
  layout.tsx                    # Root layout — Navbar, Footer, global metadata
  page.tsx                      # Landing page
  globals.css
  privacy/page.tsx
  terms/page.tsx
  application-terms/page.tsx    # Seller-facing Application Terms (Etsy §3)
  integrations/etsy/page.tsx    # OAuth entry point + compliance summary
  changelog/page.tsx
  roadmap/page.tsx
  api/waitlist/route.ts
  api/oauth/authorize/route.ts  # Starts Etsy OAuth + PKCE
  api/oauth/callback/route.ts   # Etsy redirect URI (must match portal)
  robots.ts
  sitemap.ts

components/
  compliance/EtsyTrademarkNotice.tsx
  marketing/…

lib/
  legal/constants.ts            # Policy versions + Etsy notice string
  oauth/etsy-pkce.ts
  oauth/etsy-oauth-server.ts
  supabase.ts

supabase/migrations/
  001_create_waitlist.sql
  002_waitlist_consents.sql     # Safe if you already ran 001 (IF NOT EXISTS)
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
cp .env.local.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Full URL of your deployment (e.g. `https://sellersynchub.com`) | Recommended |
| `SUPABASE_URL` | Your Supabase project URL | Yes (for waitlist) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes (for waitlist) |
| `ETSY_API_KEYSTRING` | Etsy app API keystring (`client_id` in OAuth) | Yes for `/api/oauth/*` |
| `ETSY_API_SHARED_SECRET` | Etsy app shared secret (`x-api-key: keystring:secret`) | Yes for `/api/oauth/*` |
| `ETSY_OAUTH_REDIRECT_URI` | Full callback URL if it cannot be `${origin}/api/oauth/callback` | Optional |
| `ETSY_OAUTH_SCOPES` | Space-separated scopes (defaults in code) | Optional |

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` and `ETSY_*` secrets are used only in Route Handlers. Never prefix them with `NEXT_PUBLIC_`.

### 3. Set up the Supabase waitlist table

Run **both** migrations in order in your Supabase project:

1. Open your [Supabase Dashboard](https://app.supabase.com) → **SQL Editor**
2. Run `supabase/migrations/001_create_waitlist.sql`
3. Run `supabase/migrations/002_waitlist_consents.sql` (no-op if `001` already includes consent columns from a fresh checkout)

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
3. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SITE_URL` → your production URL
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ETSY_API_KEYSTRING` and `ETSY_API_SHARED_SECRET` (for OAuth routes)
4. Deploy — Vercel auto-detects Next.js

The API Route Handler at `/api/waitlist` runs as a **Vercel Edge/Serverless Function** — no additional configuration required.

---

## Waitlist API

**`POST /api/waitlist`**

```json
// Request body (boolean literals required)
{
  "email": "seller@example.com",
  "accept_privacy": true,
  "accept_application_terms": true
}

// 201 — success
{ "message": "You're on the list! We'll be in touch soon." }

// 200 — already registered
{ "message": "You're already on the waitlist — we'll be in touch!" }

// 400 — missing consents or invalid email
{ "error": "You must accept the Privacy Policy and Seller Application Terms to join the waitlist." }
```

Duplicate emails return `200` (not an error) to avoid leaking which addresses are registered.

---

## Callback URLs (Etsy API App)

Register these in your [Etsy Developer App settings](https://www.etsy.com/developers/your-apps) (case-sensitive, **no trailing slash**):

| Environment | Callback URL |
|-------------|-------------|
| Local dev | `http://localhost:3000/api/oauth/callback` |
| Production | `https://sellersynchub.com/api/oauth/callback` |

They must match what `GET /api/oauth/authorize` uses: by default `{origin}/api/oauth/callback` where `origin` is `http://localhost:3000` locally and `https://sellersynchub.com` in production (`NEXT_PUBLIC_SITE_URL` on Vercel should be your live site URL).

### Personal Access keys (local + Vercel)

1. Copy `.env.local.example` → **`.env`** in the project root (never commit `.env`; it is gitignored). Optional overrides can go in `.env.local`.
2. Set `ETSY_API_KEYSTRING` and `ETSY_API_SHARED_SECRET` from the Etsy developer table for your app (`sellersynchub`).
3. Add the same two variables in **Vercel → Environment Variables** for Preview/Production so `/api/oauth/*` works when deployed.

If you use a **Vercel preview URL** (`*.vercel.app`), add that exact callback URL in Etsy **or** only test OAuth on your custom domain / localhost — Etsy rejects `redirect_uri` values that are not registered.

---

## Legal

- [Privacy Policy](/privacy)
- [Terms of Service](/terms)
- [Seller Application Terms](/application-terms) — Etsy API §3 Application Terms + warranty disclaimer
- [Etsy integration](/integrations/etsy) — OAuth, scopes, trademark notice
- Support: [hi@sellersynchub.com](mailto:hi@sellersynchub.com)

---

## License

Private and proprietary. All rights reserved.

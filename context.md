# sure-watch: AI-Powered Diet Tracking

A brutalist, client-side diet tracking PWA built with Next.js 14 + React 18, deployed to Cloudflare Pages with encrypted API key storage in D1.

## Overview

**Purpose:** Track daily meals, macros (kcal, protein, carbs, fat), and get AI suggestions.

**Stack:**
- Frontend: Next.js 14 (static export), React 18, TypeScript 5, Tailwind CSS 3
- Backend: Cloudflare Pages Functions, D1 database
- Deployment: Cloudflare Pages (foodplay.pages.dev)

**Design:** Stark, brutalist UI. Paper (#F5F5F0), Ink (#0A0A0A), Accent (#FF4500). Space Mono headings, Inter body.

## Architecture

### Client

**Core state management:** `src/hooks/useDietStore.ts`
- Manages meals and targets
- Persists to localStorage as `sw_meals_YYYY-MM-DD` and `sw_targets`
- Calculates totals (kcal, protein, carbs, fat)

**Key components:**
- `src/app/page.tsx` — Main page. Shows date, total kcal (large headline), macro bars, meal list
- `src/components/AddMealForm.tsx` — Add meal form. Manual 5-field entry (name, kcal, protein, carbs, fat)
- `src/components/TargetsPanel.tsx` — Collapsible targets editor (kcal, protein, carbs, fat)
- `src/components/SettingsPanel.tsx` — **NEW.** Collapsible API key manager. Encrypted key stored in D1

**API client layer:** `src/lib/api.ts`
- Typed fetch wrappers for all endpoints
- `saveApiKey()`, `checkApiKey()`, `deleteApiKey()` — key CRUD
- `analyzeFood()`, `analyzeFoodImage()` — Claude text/vision analysis
- `suggestMeals()` — meal suggestions based on remaining budget
- `lookupBarcode()` — OpenFoodFacts barcode lookup
- 15s timeout via `AbortController`
- `ApiError` custom error class

**Device identity:** `src/lib/deviceId.ts`
- Generates UUID v4 on first visit
- Stores in localStorage as `sw_device_id`
- No user auth — single-device app

### Server (Cloudflare Pages Functions)

**D1 database:** `sure-watch-db`
- Table: `api_keys` (device_id PRIMARY KEY, encrypted_key, iv, timestamps)
- Migration: `migrations/0001_create_api_keys.sql`

**Encryption:** `functions/lib/crypto.ts`
- AES-256-GCM via Web Crypto API
- `encrypt(plaintext, encryptionKeyBase64)` → `{ ciphertext, iv }` (both base64)
- `decrypt(ciphertext, iv, encryptionKeyBase64)` → plaintext
- IV generated fresh per encryption (12 random bytes)

**Key lookup helper:** `functions/lib/getKey.ts`
- `getDecryptedKey(db, deviceId, encryptionKey)` → plaintext API key or null
- Shared by all Claude-calling endpoints

**Endpoints:**

| Path | Method | Purpose |
|------|--------|---------|
| `/api/api-key` | GET | Check if key exists: `?deviceId=xxx` → `{ exists, updatedAt }` |
| `/api/api-key` | PUT | Save key: `{ deviceId, apiKey }` → `{ success: true }` |
| `/api/api-key` | DELETE | Remove key: `{ deviceId }` → `{ success: true }` |
| `/api/analyze-food` | POST | Text/photo → macros. `{ deviceId, description }` or `{ deviceId, imageBase64, mimeType }` |
| `/api/suggest-meals` | POST | Meal suggestions. `{ deviceId, remaining: { kcal, protein, carbs, fat } }` |
| `/api/barcode` | GET | Barcode lookup. `?code=xxx` → nutrition data |

**Environment:**
- `DB: D1Database` — D1 binding (configured in wrangler.toml)
- `ENCRYPTION_KEY: string` — Cloudflare Pages secret (base64-encoded 32 bytes). Generated once, never in code.

### Security model

- **API key:** User enters in Settings panel (password input). Encrypted with AES-256-GCM before leaving the client. Stored encrypted in D1. Server decrypts only when making Claude API calls.
- **Device identity:** UUID in localStorage. Not a secret — just a lookup key. Without `ENCRYPTION_KEY`, encrypted key is useless.
- **Encryption key:** Stored as Cloudflare Pages secret. Never exposed. Rotates only manually (requires re-encryption of all keys).

## Key files

```
sure-watch/
├── migrations/
│   └── 0001_create_api_keys.sql          # D1 schema
├── functions/
│   ├── lib/
│   │   ├── types.ts                      # Env interface
│   │   ├── crypto.ts                     # AES-256-GCM encrypt/decrypt
│   │   └── getKey.ts                     # D1 lookup + decrypt helper
│   ├── api/
│   │   ├── api-key.ts                    # Key CRUD endpoint
│   │   ├── analyze-food.ts               # (planned) Claude food analysis proxy
│   │   ├── suggest-meals.ts              # (planned) Claude suggestions proxy
│   │   └── barcode.ts                    # (planned) OpenFoodFacts lookup
│   ├── tsconfig.json                     # Separate TS config for Workers
│   └── [any file here → /api/{file}.ts]
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (PWA metadata)
│   │   └── page.tsx                      # Home page
│   ├── components/
│   │   ├── AddMealForm.tsx               # Add meal form
│   │   ├── TargetsPanel.tsx              # Targets editor
│   │   ├── SettingsPanel.tsx             # API key manager (NEW)
│   │   ├── MacroBar.tsx                  # Progress bar
│   │   ├── MealRow.tsx                   # Single meal entry
│   │   └── (planned) ReviewPanel, PhotoCapture, BarcodeScanner, SuggestMeals
│   ├── hooks/
│   │   └── useDietStore.ts               # State management
│   ├── lib/
│   │   ├── api.ts                        # Client API wrappers (NEW)
│   │   ├── deviceId.ts                   # UUID generation (NEW)
│   │   └── (planned) image-utils.ts
│   └── globals.css
├── public/
│   ├── manifest.json                     # PWA manifest
│   ├── apple-touch-icon.png
│   └── icons (192px, 512px)
├── .github/
│   └── workflows/
│       └── deploy.yml                    # CI/CD: build → apply D1 migrations → deploy to Cloudflare
├── wrangler.toml                         # Cloudflare config (D1 binding)
├── tsconfig.json                         # Next.js TS config (excludes functions/)
├── next.config.js                        # Static export, PWA
├── tailwind.config.ts                    # Styles
├── package.json
└── context.md                            # This file
```

## Development

### Local setup

```bash
npm install
npm run build          # Static export → out/
npm run dev            # Next.js dev server (port 3000)
```

### Local Cloudflare testing

```bash
npm run build
npx wrangler pages dev out  # Dev server: static files + functions (port 8788)
```

Open http://localhost:8788. Functions at http://localhost:8788/api/*.

### D1 local testing

```bash
# Apply migration to local D1
npx wrangler d1 migrations apply sure-watch-db --local

# Query local D1 (inside a function)
const row = await context.env.DB.prepare("SELECT * FROM api_keys WHERE device_id = ?").bind(id).first();
```

## Deployment

**Trigger:** Push to `main` → GitHub Actions workflow runs

**Steps:**
1. Checkout, install, build
2. Apply D1 migrations to remote database
3. Deploy static files + functions to Cloudflare Pages

**Access:** https://foodplay.pages.dev

**Secrets (GitHub):**
- `CLOUDFLARE_API_TOKEN` — API auth
- `CLOUDFLARE_ACCOUNT_ID` — Account ID

**Secrets (Cloudflare Pages):**
- `ENCRYPTION_KEY` — Base64-encoded 32-byte AES key

## Next steps (planned)

### Phase 2: Food analysis endpoints
- `POST /api/analyze-food` — Claude Sonnet 3.5 via raw fetch
- `POST /api/suggest-meals` — Claude suggestions
- `GET /api/barcode` — OpenFoodFacts fallback

### Phase 3: Food analysis UI
- `src/components/ReviewPanel.tsx` — Edit API results before confirming
- `src/components/PhotoCapture.tsx` — Camera input with thumbnail
- `src/components/BarcodeScanner.tsx` — html5-qrcode integration
- `src/lib/image-utils.ts` — Image compression to ~200KB JPEG
- Refactor `AddMealForm.tsx` with state machine: IDLE → ANALYZING → REVIEW → confirm

### Phase 4: Meal suggestions UI
- `src/components/SuggestMeals.tsx` — Collapsible suggestions panel
- Show remaining budget after each meal logged

## Debugging

**Key logs:**
- Browser DevTools → Application → localStorage: `sw_device_id`, `sw_meals_*`, `sw_targets`
- Wrangler: `npx wrangler pages dev out` with debug output
- D1: `npx wrangler d1 execute sure-watch-db --remote "SELECT COUNT(*) FROM api_keys"`

**Common issues:**
- **Settings panel doesn't show:** Check `checkApiKey()` error in console
- **Key won't save:** Verify `ENCRYPTION_KEY` secret is set on Cloudflare Pages
- **D1 queries fail locally:** Run migration with `--local` flag first
- **Build fails:** Ensure `functions/` is excluded from Next.js `tsconfig.json`

## References

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-exports)
- [Anthropic API](https://docs.anthropic.com)
- [OpenFoodFacts API](https://world.openfoodfacts.org/api/v2)

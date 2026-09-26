# Works Lab Tracker — Setup Guide (step by step)

You need three things: a Firebase project (login + quota), a Google Cloud OAuth client (permission to write the user's Sheet), and a GitHub repo (hosting). ~45 minutes.

---

## Part A — Firebase (Auth + Firestore)

1. Go to https://console.firebase.google.com → **Add project** → name it `workslab-tracker` → disable Analytics → Create.
2. Left menu **Build → Authentication → Get started → Sign-in method → Google → Enable**. Set support email → Save.
3. Still in Authentication → **Settings → Authorized domains → Add domain**: `tracker.workslab.in`. (`localhost` is already there.)
4. **Build → Firestore Database → Create database → Start in production mode** → location `asia-south1 (Mumbai)` → Enable.
5. Firestore → **Rules** tab → replace everything with the contents of `firestore.rules` from this repo → **Publish**.
6. Project settings (gear icon) → **General → Your apps → Web (</>)** → nickname `tracker` → Register. Copy `apiKey`, `authDomain`, `projectId`, `appId` into `.env` (see `.env.example`).

## Part B — Google Cloud Console (Sheets & Drive API + OAuth Client ID)

Firebase already created a Google Cloud project with the same name. Open https://console.cloud.google.com and select it (top bar).

1. **APIs & Services → Library** → search and **Enable** both:
   - Google Sheets API
   - Google Drive API
2. **APIs & Services → OAuth consent screen**
   - User type: **External** → Create
   - App name `Works Lab Tracker`, support email, app logo (optional), **App domain**: `https://tracker.workslab.in`, Privacy policy `https://workslab.in/privacy` (create a simple page), developer email → Save and continue.
   - **Scopes → Add or remove scopes** → filter and tick:
     - `.../auth/drive.file`  (only files this app creates — users don't have to trust you with their whole Drive)
     - `.../auth/spreadsheets`
     Save and continue.
   - **Test users** → add your own Gmail (and a few friends) → Save. While in *Testing* mode only these accounts can log in.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**, name `tracker-web`
   - **Authorized JavaScript origins**: `https://tracker.workslab.in` and `http://localhost:5173`
   - Authorized redirect URIs: leave empty (token flow doesn't need one)
   - Create → copy the **Client ID** into `.env` as `VITE_GOOGLE_CLIENT_ID`.
4. Also in Credentials, find the client Firebase auto-created (`Web client (auto created by Google Service)`) — add `https://tracker.workslab.in` to its JavaScript origins too. (Firebase login uses this one.)

**Going public:** when ready for strangers, OAuth consent screen → **Publish app**. Because `drive.file` and `spreadsheets` are "sensitive" scopes, Google will ask for verification (privacy policy URL, a short YouTube demo of the consent flow, domain ownership via Search Console). Takes 3–10 days. Until then, "unverified app" warning appears and only test users can sign in.

## Part C — Run locally

```bash
npm install
cp .env.example .env      # fill in values from Part A & B
npm run dev               # http://localhost:5173
```
Sign in with a test-user Gmail → create a Monthly tracker → check your Google Drive for "Workslab Budget Ecosystem".

## Part D — Deploy to GitHub Pages (tracker.workslab.in)

1. Create repo `workslab-tracker` on GitHub. Push this folder (`.env` is git-ignored — good).
2. Repo → **Settings → Secrets and variables → Actions → New repository secret** — add each of the 6 variables from `.env` (`VITE_FIREBASE_API_KEY`, … `VITE_RAZORPAY_LINK`).
3. Repo → **Settings → Pages → Source: GitHub Actions**.
4. Push to `main` → Actions tab builds and deploys. `public/CNAME` already contains `tracker.workslab.in`.
5. **GoDaddy → workslab.in → DNS → Add record**: Type `CNAME`, Name `tracker`, Value `YOUR-GITHUB-USERNAME.github.io`, TTL 600.
6. Repo → Settings → Pages → Custom domain `tracker.workslab.in` → Save → wait for the DNS check → tick **Enforce HTTPS**.

## Part E — Razorpay (₹100 unlock)

1. Razorpay dashboard → **Payment Links → Create** → amount ₹100, description "Works Lab Tracker — unlimited". Under advanced options set **Redirect URL** to `https://tracker.workslab.in/?paid=1`.
2. Paste the link into the `VITE_RAZORPAY_LINK` secret. Redeploy.

> The `?paid=1` flag is client-side and not tamper-proof. It's fine for launch (the product is ₹100 and free tier is generous). When revenue justifies it, add a Firebase Cloud Function that receives the Razorpay webhook and sets `paid: true` server-side.

---

## How data flows

```
Google login (Firebase) ─► uid ─► Firestore users/{uid}: { modules[], moduleCount, paid, spreadsheetId }
                                       │
User clicks "Create tracker" ──────────┘──► Google token (GIS, drive.file scope)
                                            ──► Sheets API: find/create "Workslab Budget Ecosystem"
                                            ──► add tab, write seed rows
Every edit ─► localStorage (instant) ─► debounced 800ms ─► Sheets API writeTab
Offline    ─► queued in localStorage ─► flushed on 'online' event
```

## Add a new module type
Edit `src/data/templates.js` → add a key to `MODULE_TYPES` with `kind: 'planner' | 'goals' | 'monthly'` and a `seed`. Done — the home grid, creation dialog, and Sheet schema all pick it up.

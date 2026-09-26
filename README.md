# Works Lab Tracker
Salary & budget tracker for India. Frontend-only (Vite + React + Tailwind), data lives in the user's own Google Sheet.
See **SETUP.md** for Firebase / Google Cloud / GitHub Pages configuration.

```
src/
  App.jsx                 auth, profile, module registry, paywall gate
  lib/firebase.js         Firebase Auth + Firestore profile (quota)
  lib/googleAuth.js       Google Identity Services token (drive.file + spreadsheets)
  lib/sheetsApi.js        create master sheet, add/delete tabs, read/write ranges
  lib/insights.js         rule-based insights engine (EMI %, savings rate, overspend…)
  lib/storage.js          localStorage cache + offline write queue
  lib/csv.js              CSV export
  data/templates.js       module types, seed data, sheet <-> UI mapping
  components/             Login, ModuleHome, ModuleShell, Grid, Charts, Paywall, useSheetSync
  modules/                MonthlyTracker, Planner (Wedding/Trip), Goals
```

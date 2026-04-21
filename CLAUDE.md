# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build to dist/
npm run lint       # ESLint check
npm run preview    # Preview production build locally
```

There is no test framework configured.

## Environment

Copy `.env.example` to `.env` and fill in Supabase credentials:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Without these the app runs with a fallback Supabase client (warns in console) but local data still works via localStorage.

## Architecture

### State: Single Zustand Store

All application state lives in `src/store/useStore.js`. It uses `zustand/persist` to sync a subset of state to `localStorage` (key: `money-planner-storage`). The persisted slice is: `data`, `currentUser`, `currency`, `theme`, `userThemes`, `userBiometrics`.

The entire financial dataset is a single `data` object with these keys:
- `banks` — account balances with `currency` and `userId`
- `transactions` — all transactions, filtered by `userId` and `date` (YYYY-MM-DD) at query time
- `budgets` — per-category monthly limits, scoped by `month` (YYYY-MM) and `userId`
- `customCategories` — user-defined categories with icon/color
- `subscriptions` / `bills` — recurring items
- `savingsGoals` — savings targets
- `emergencyFund` — a single numeric value

Every mutation returns `{ data: newData }` — always spread the full `data` object when modifying any sub-key.

### Multi-User Auth

Users are hardcoded in `src/store/useStore.js` as the `USERS` array (no database auth). Login is PIN-based (4 digits) with optional WebAuthn biometric enrollment. After login, `syncWithSupabase()` is called to pull from (or push initial data to) the `user_data` Supabase table (`user_id`, `content` JSON, `updated_at`). All data in `data.*` is shared across users; each record has a `userId` field for filtering.

### Screen Routing

There is no router. `activeScreen` in the store drives which screen renders. `App.jsx` switches on this value and wraps transitions in Framer Motion's `AnimatePresence`. Screens: `dashboard`, `monthly`, `banks`, `history`, `recurring`. If `currentUser` is null, `<Login />` renders instead of the app shell.

### Styling

Styling uses CSS custom properties (defined in `src/index.css`) — not Tailwind despite the README. Theming is handled by a `data-theme` attribute on `document.documentElement` set to `'light'` or `'dark'`. Common design tokens: `--accent-primary`, `--card-bg`, `--glass-bg`, `--glass-border`, `--shadow-*`, `--border-radius-*`. Reusable class names like `.card`, `.glass-card`, `.iphone-container` are defined in `index.css` and `App.css`. The app is constrained to a mobile viewport (~430px) via `.iphone-container`.

### Receipt Images

Receipt images are stored in **IndexedDB** (not localStorage) via `src/utils/db.js`. The store key is the transaction ID. This is separate from the Zustand/localStorage persistence layer.

### Currency

All transaction amounts are stored in TWD as the base currency. `formatCurrency` in the store converts to IDR on display using `exchangeRate` (fetched from `exchangerate-api.com` every 10 minutes). Banks have their own `currency` field and bypass conversion when a `code` argument is passed to `formatCurrency`.

### Security

A 1-minute inactivity timeout calls `logout()` automatically. The timer is checked every 30 seconds in `App.jsx`. `lastActive` is updated on `mousedown`, `keydown`, `touchstart`, and `visibilitychange`.

# Money Management

Mobile-first personal finance management application.

## Current milestone

Phase 1 frontend foundation: a responsive dashboard, installable PWA metadata, quick transaction entry, spending overview, upcoming payments, and recent transactions. The current entries are intentionally local demo state; the next step is authentication and PostgreSQL persistence.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To test from a phone on the same network, run Next with `npm run dev -- --hostname 0.0.0.0` and open the computer's local IP address from the phone.

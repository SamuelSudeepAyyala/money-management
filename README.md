# Money Management

Mobile-first personal finance management application.

## Current milestone

Phase 1 frontend foundation plus a usable demo workspace: responsive dashboard navigation, quick transaction entry, persistent demo transactions and accounts, transaction removal, account creation, spending overview, upcoming payments, and starter views for budgets, loans, and goals. Demo records are intentionally stored only in the current browser until the authenticated backend is approved and connected.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To test from a phone on the same network, run Next with `npm run dev -- --hostname 0.0.0.0` and open the computer's local IP address from the phone.

## GitHub Pages preview

Every push to `main` deploys the static frontend to GitHub Pages. The preview URL is:

`https://samuelsudeepayyala.github.io/money-management/`

This preview uses demo data and browser-local storage. Do not enter real financial information; the backend/authentication integration is not connected to this public preview yet.

When the backend is deployed, set `NEXT_PUBLIC_API_URL` before building the frontend. The app will then use the backend session flow and display the username/password screen instead of anonymous demo mode. Never commit that value if it contains a private URL or any secret; the API URL itself is normally public, while database and JWT secrets belong only in backend hosting configuration.

## Backend development

```bash
docker compose -f infrastructure/docker-compose.yml up -d postgres
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

The API health check is available at `http://localhost:8000/health` and interactive API documentation at `http://localhost:8000/docs`.

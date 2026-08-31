# Money Management

Mobile-first personal finance management application.

## Current milestone

Authenticated personal finance workspace with responsive navigation, transaction and account management, budgets, loans and payments, goals, recurring bills, per-user ownership, CSV transaction export, and full JSON backup export. The hosted application does not seed demo financial records.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To test from a phone on the same network, run Next with `npm run dev -- --hostname 0.0.0.0` and open the computer's local IP address from the phone.

## GitHub Pages preview

Every push to `main` deploys the static frontend to GitHub Pages. The preview URL is:

`https://samuelsudeepayyala.github.io/money-management/`

The hosted preview uses the authenticated backend. Do not use browser-local demo storage or assume visible sample values represent your finances.

When the backend is deployed, set `NEXT_PUBLIC_API_URL` before building the frontend. The app will then use the backend session flow and display the username/password screen instead of anonymous demo mode. Never commit that value if it contains a private URL or any secret; the API URL itself is normally public, while database and JWT secrets belong only in backend hosting configuration.

With the API URL configured, all supported finance records are loaded from the authenticated backend and scoped to the signed-in user. Use the download action in the top bar for a manual JSON backup.

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

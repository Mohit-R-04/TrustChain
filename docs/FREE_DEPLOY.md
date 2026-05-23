# TrustChain Free Deploy

Recommended free stack as of 2026-05-23:

- Frontend: Cloudflare Pages
- Backend API: Koyeb free Web Service
- Database: Supabase free Postgres
- Auth: Clerk free plan
- IPFS: Pinata free plan
- Blockchain: Polygon Amoy testnet

This keeps the current architecture intact and avoids rewriting the backend.

## Before you deploy

1. Rotate any secrets that were previously committed to this repo.
2. Push this repo to GitHub.
3. Decide your public frontend URL, for example `https://trustchain.pages.dev`.

## 1. Create the database

Create a free Supabase project and collect either:

- a full JDBC URL, or
- host, port, database, username, and password

Recommended connection string format for Supabase pooler:

```text
jdbc:postgresql://<host>:6543/postgres?sslmode=require&prepareThreshold=0&preparedStatementCacheQueries=0&preparedStatementCacheSizeMiB=0
```

## 2. Create production auth

Create a Clerk production instance and collect:

- `CLERK_SECRET_KEY`
- `REACT_APP_CLERK_PUBLISHABLE_KEY`
- `CLERK_WEBHOOK_SECRET` if you use Clerk webhooks

Add your frontend domain to Clerk's allowed URLs and set the post-sign-in redirect to:

```text
https://<your-frontend-domain>/auth-callback
```

## 3. Create IPFS credentials

Create a free Pinata account and collect:

- `PINATA_JWT`

If you do not need uploads immediately, you can leave blockchain and IPFS features disabled at first and enable them later.

## 4. Deploy the backend on Koyeb

Create a new Koyeb Web Service from the `backend` directory of this repo and use the included `Dockerfile`.

Recommended settings:

- Instance: `free`
- Root directory: `backend`
- Port: use Koyeb's default `PORT` environment variable
- Health check path: `/api/health`

Set these environment variables:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:6543/postgres?sslmode=require&prepareThreshold=0&preparedStatementCacheQueries=0&preparedStatementCacheSizeMiB=0
SPRING_DATASOURCE_USERNAME=<db-username>
SPRING_DATASOURCE_PASSWORD=<db-password>

CLERK_SECRET_KEY=<clerk-secret-key>
CLERK_WEBHOOK_SECRET=<clerk-webhook-secret>

APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://<your-pages-domain>,https://<your-custom-domain>

OTP_DELIVERY_MODE=log
OTP_DELIVERY_FALLBACK_TO_LOG=true

IPFS_PROVIDER=pinata
PINATA_JWT=<pinata-jwt>

BLOCKCHAIN_ENABLED=false
BLOCKCHAIN_DEMO_MODE=true
```

Notes:

- `OTP_DELIVERY_MODE=log` is the easiest zero-cost option for demos. Switch to SMTP later if needed.
- Leave blockchain disabled until you are ready to configure a testnet wallet and contract.

## 5. Deploy the frontend on Cloudflare Pages

Create a Cloudflare Pages project from this repo with:

- Root directory: `frontend`
- Build command: `npm run build`
- Build output directory: `build`

Set these environment variables:

```text
REACT_APP_CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
REACT_APP_API_URL=https://<your-koyeb-service>.koyeb.app
REACT_APP_IPFS_GATEWAY_BASE=https://gateway.pinata.cloud/ipfs/
```

The SPA fallback is already configured with `frontend/public/_redirects`.

## 6. Optional blockchain enablement

To keep deployment free, stay on Polygon Amoy.

When you are ready, enable these backend variables:

```text
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_DEMO_MODE=false
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
TRUSTCHAIN_ESCROW_CONTRACT_ADDRESS=<deployed-contract-address>
TRUSTCHAIN_ESCROW_PRIVATE_KEY=<test-wallet-private-key>
```

Do not enable this until:

- the contract is deployed,
- the wallet has Amoy test tokens,
- and you are comfortable storing a test private key in Koyeb secrets.

## 7. Expected free-tier behavior

- Cloudflare Pages is ideal for the React frontend.
- Koyeb free backend sleeps after inactivity, so the first API request after idle can be slow.
- Supabase free projects pause after inactivity, so an unused demo may need a wake-up.
- Clerk, Pinata, and Polygon Amoy all have workable free/demo paths for this app size.

## 8. If you want fewer cold starts later

The next step up is moving the whole stack onto an Oracle Cloud Always Free VM and serving:

- React as static files behind Nginx or Caddy
- Spring Boot as a systemd service or container
- Postgres either on the VM or on Supabase

That path is still free, but it is more ops-heavy than the managed stack above.

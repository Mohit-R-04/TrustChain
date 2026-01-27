# TrustChain Architecture Blueprint

## 1) Purpose
Design a transparent welfare-fund rails where money is locked in blockchain escrow, released only on verified milestones, and every proof is publicly auditable.

## 2) High-level component map
- **Frontend portals**: Public site, Citizen app, Donor dashboard, Government console, NGO console, Vendor workspace, Auditor console.
- **Backend (Spring Boot)**: Auth/KYC, Scheme & milestones, Vendor matching, Donation + escrow bridge (Stripe → blockchain), Proof/IPFS, Approvals, Audit/compliance, Notifications, Analytics.
- **Blockchain (Polygon)**: Escrow + milestone smart contracts, role registry, IPFS hash anchors. Keep under `/blockchain/` (see structure below).
- **Storage**: PostgreSQL (core data), Redis (cache/queues), IPFS (proof files), S3-compatible bucket (optional file cache), Elasticsearch/OLAP (future analytics).
- **Integrations**: Stripe Checkout + Webhooks, Email/SMS/Push, Optional Aadhaar/GST KYC providers.

## 3) Proposed repo layout (incremental-friendly)
- `/backend/` (existing Spring Boot services)
- `/frontend/` (existing React app)
- `/blockchain/`
  - `contracts/TrustEscrow.sol` (escrow + milestone contract)
  - `contracts/RoleRegistry.sol` (NGO/Government/Donor/Auditor/Vendor roles)
  - `scripts/` (deploy, verify, config)
  - `test/` (contract tests)
  - `hardhat.config.js` (or Foundry/Foundry.toml if preferred)
- `/docs/` (this blueprint, API docs, ADRs)
- `/infra/` (docker-compose, k8s manifests, CI/CD, env samples)

## 4) Smart contract sketch (Polygon)
**Data**
- `Project`: id, govOwner, donors[], ngo, vendor, token (ERC20/ETH/MATIC), totalBudget, lockedAmount, milestones[]
- `Milestone`: id, amount, ipfsProofHash, approvals{ngo, donor, auditor}, released
- `RoleRegistry`: manages whitelists/blacklists for NGOs, vendors, auditors.

**Key functions**
- `depositFunds(projectId, amount)` – from donor; locks value.
- `commitMilestones(projectId, milestones[])` – NGO/government sets amounts & count (immutable once funds deposited, except pause/upgrade).
- `submitProof(projectId, milestoneId, ipfsHash)` – vendor uploads hash.
- `approveMilestone(projectId, milestoneId, approverRole)` – NGO/donor/auditor approvals.
- `releasePayment(projectId, milestoneId, vendor)` – auto after approvals; transfers from escrow.
- `slashOrReclaim(projectId)` – gov/auditor clawback on fraud/pause.
- `pause/unpause` – circuit breaker.
- `setAuditor / setVendor / setNGO` – role-bound.

**Guardrails**
- Use OpenZeppelin (Ownable, AccessControl, Pausable, ReentrancyGuard, SafeERC20).
- Support ERC20 + native gas token.
- Events for all actions; store IPFS CID only (no PII on-chain).
- Upgradability optional via UUPS (document risks) or keep v1 immutable for hackathon simplicity.

## 5) Backend service responsibilities
- **Auth & KYC**: JWT/OAuth2, role claims; GST/cert uploads; blacklist handling.
- **Scheme service**: Create schemes, milestone templates, region/beneficiary metadata.
- **Vendor matching**: Score vendors by past rating, category expertise, quote reasonability, delivery time, compliance; expose ranking API.
- **Donation & escrow bridge**: Stripe Checkout session creation; Webhook → verify sig → call `depositFunds`; persist transaction refs and on-chain tx hash.
- **Milestone & proof**: Upload to IPFS (pin + gateway), store CID, map to milestone, forward to contract via `submitProof`.
- **Approvals**: Track NGO/donor/auditor approvals, enforce quorum before `releasePayment` call.
- **Audit & compliance**: Ledger views, duplicate invoice detection (hash or metadata), vendor blacklist, anomaly rules.
- **Notifications**: Email/SMS/WhatsApp/push for approvals, disputes, releases.
- **Analytics**: Dashboards for schemes, spend, approval SLAs, leak detection.

## 6) Data model (relational sketch)
- `users(id, email, role, kyc_status, wallet_address, org_id, region)`
- `organizations(id, type{NGO,Vendor,Auditor,Government,Donor}, kyc_docs, rating)`
- `schemes(id, title, category, budget, region, milestones_json, owner_gov_id)`
- `projects(id, scheme_id, ngo_id, vendor_id, status, contract_project_id, token, total_budget)`
- `donations(id, project_id, donor_id, amount, stripe_session_id, stripe_payment_intent, chain_tx_hash)`
- `milestones(id, project_id, seq, title, amount, ipfs_cid, approvals{ngo,donor,auditor}, released, chain_tx_hash)`
- `proofs(id, milestone_id, ipfs_cid, file_type, submitted_by)`
- `audits(id, project_id, auditor_id, status, notes)`
- `community_needs(id, citizen_id, region, category, description, upvotes, status)`
- `feedback(id, citizen_id, project_id, rating, comment)`

## 7) API surface (REST/GraphQL outline)
- **Auth**: POST /auth/login, POST /auth/register, POST /auth/refresh.
- **KYC**: POST /kyc/org, GET /kyc/status.
- **Schemes**: POST /schemes, GET /schemes, GET /schemes/{id}, POST /schemes/{id}/milestones.
- **Projects**: POST /projects/{schemeId}/assign-ngo, POST /projects/{id}/assign-vendor, GET /projects/{id}.
- **Donations**: POST /projects/{id}/donate (creates Stripe session), POST /webhooks/stripe (verifies sig, calls `depositFunds`).
- **Proofs/Milestones**: POST /projects/{id}/milestones/{mId}/proof (upload → IPFS), POST /projects/{id}/milestones/{mId}/approve (role-based), POST /projects/{id}/milestones/{mId}/release.
- **Audit**: GET /audit/projects, POST /audit/projects/{id}/report, POST /projects/{id}/flag.
- **Community**: POST /community-needs, GET /community-needs, POST /community-needs/{id}/upvote, POST /feedback.
- **Public transparency**: GET /public/projects/{id}/ledger (chain + IPFS links), GET /public/community-needs.

## 8) End-to-end flows
**Scheme creation**: Government creates scheme → NGO applies and is approved → milestones committed on-chain (amounts locked reference).

**Donation + escrow**:
1) Donor initiates Stripe Checkout.
2) Stripe success → webhook to backend (verify signature, idempotent).
3) Backend calls `depositFunds` on Polygon (amount = donation), records tx hash.
4) Project balance updates; UI shows "Escrow Locked" with chain explorer link.

**Milestone execution**:
1) Vendor uploads proof → backend stores in IPFS, calls `submitProof` with CID.
2) NGO/Donor/Auditor approve via app → backend tracks approvals and triggers `releasePayment` once quorum met.
3) Funds transfer to vendor wallet; event logged; DB updated.

**Audit & clawback**:
- Auditor can flag → contract `slashOrReclaim` to return remaining funds to donor/gov.
- Blacklist vendors via RoleRegistry; future deposits blocked.

**Community needs → scheme**:
- Citizens post needs → government/NGOs pick → convert to scheme template → open for donors.

## 9) Security & compliance
- Webhook signature verification (Stripe) + replay protection.
- On-chain calls via backend signer with limited allowance; use per-function rate limits.
- Role-based access (Spring Security + contract roles) with wallet binding.
- No PII on-chain; store only hashes/CIDs.
- IPFS pinning + gateway fallback; optional encrypt-at-rest before pinning.
- Circuit breakers: contract pause; backend feature flags.
- Observability: structured logs, metrics, audit trails.

## 10) Implementation priorities
1) Stand up `/blockchain/` with Hardhat + `TrustEscrow.sol` + tests (milestones, approvals, release, pause, clawback).
2) Backend: add Stripe webhook endpoint, Polygon client, and services to call `depositFunds/submitProof/releasePayment`.
3) IPFS service (pinning client, CID validation) and file upload endpoint.
4) Auth/KYC and role enforcement; bind wallets to users/orgs.
5) Minimal UIs: donor checkout + status page; NGO milestone dashboard; vendor proof upload; auditor approvals; public transparency page.
6) Community Needs feed + conversion to scheme flow.
7) Analytics dashboards + anomaly alerts.

## 11) Run/deploy (target)
- Local: Hardhat node + Polygon testnet for staging; Docker Compose for Postgres/Redis/IPFS daemon.
- CI: lint/test contracts, backend unit/integration tests, frontend tests.
- Deploy: Contracts to Polygon mainnet/testnet; backend on container; frontend static hosting; envs injected via secrets.

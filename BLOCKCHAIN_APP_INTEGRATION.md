# TrustChain Blockchain Integration (End-to-End)

## Deploy Contract (Polygon Amoy)

1. Install deps and run tests

```bash
cd blockchain
npm ci
npm test
```

2. Configure environment

- Copy `.env.example` → `.env`
- Set:
  - `PRIVATE_KEY` (Amoy-funded wallet)
  - `POLYGON_AMOY_RPC` (Alchemy/Infura recommended)
  - `POLYGONSCAN_API_KEY` (optional; for verify)

3. Deploy

```bash
npm run deploy
```

Outputs:
- `blockchain/deployments/latest.json` contains:
  - `contractAddress`
  - `abi`
  - `chainId`
  - `rpcUrl`

## IPFS Upload (Independent)

1. Configure token:

- `WEB3_STORAGE_TOKEN=...`

2. Upload a single file:

```bash
cd blockchain
npm run ipfs:upload -- file ./path/to/invoice.pdf
```

3. Upload a proof bundle (folder-style CID):

```bash
cd blockchain
npm run ipfs:upload -- bundle ./proof1.jpg ./proof2.jpg
```

The output includes `cid` and a gateway URL.

## Backend (Spring Boot) Configuration

1. Set env variables for the backend:

- `POLYGON_AMOY_RPC` (RPC URL)
- `TRUSTCHAIN_ESCROW_CONTRACT_ADDRESS` (from deployments/latest.json)
- `TRUSTCHAIN_ESCROW_PRIVATE_KEY` (must be the contract owner/deployer key if you want admin actions)

2. Enable blockchain in backend config:

- In `backend/src/main/resources/application.properties`:
  - `blockchain.enabled=true` (or override via env)

## Backend Endpoints

Implemented endpoints live in [BlockchainController.java](file:///Users/mohitreddy/Documents/TrustChain/backend/src/main/java/com/trustchain/backend/controller/BlockchainController.java).

- `GET /api/blockchain/status`
- `GET /api/blockchain/events/recent`
- NGO/admin actions:
  - `POST /api/blockchain/schemes/{schemeUuid}/create`
  - `POST /api/blockchain/schemes/{schemeUuid}/lock`
  - `POST /api/blockchain/schemes/{schemeUuid}/milestones/{milestoneId}?amountEth=...`
  - `POST /api/blockchain/schemes/{schemeUuid}/milestones/{milestoneId}/vendor?vendorAddress=0x...`
  - `POST /api/blockchain/schemes/{schemeUuid}/milestones/{milestoneId}/quotation?ipfsHash=...`
  - `POST /api/blockchain/schemes/{schemeUuid}/milestones/{milestoneId}/approve`
  - `POST /api/blockchain/schemes/{schemeUuid}/milestones/{milestoneId}/reject`
  - `POST /api/blockchain/schemes/{schemeUuid}/milestones/{milestoneId}/release`
  - `POST /api/blockchain/schemes/{schemeUuid}/milestones/{milestoneId}/refund?toAddress=0x...`
- Wallet-signed transactions (build calldata):
  - `GET /api/blockchain/tx/deposit/{schemeUuid}?amountEth=...`
  - `GET /api/blockchain/tx/submitProof/{schemeUuid}/{milestoneId}?ipfsHash=...`

## Event Sync

The backend indexes on-chain events into Postgres:
- Sync: [BlockchainEventSyncService.java](file:///Users/mohitreddy/Documents/TrustChain/backend/src/main/java/com/trustchain/backend/service/blockchain/BlockchainEventSyncService.java)
- Storage: [BlockchainEvent.java](file:///Users/mohitreddy/Documents/TrustChain/backend/src/main/java/com/trustchain/backend/model/BlockchainEvent.java)

This enables the frontend to show “live” escrow state using `/api/blockchain/events/recent`.

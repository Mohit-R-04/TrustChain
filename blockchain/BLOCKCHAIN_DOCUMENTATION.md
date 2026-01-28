# 🔗 TrustChain Blockchain Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Smart Contract Functions](#smart-contract-functions)
3. [Polygon Network Setup](#polygon-network-setup)
4. [IPFS Integration](#ipfs-integration)
5. [Deployment Guide](#deployment-guide)
6. [Testing & Validation](#testing--validation)
7. [Event Monitoring](#event-monitoring)
8. [Spring Boot Integration](#spring-boot-integration)
9. [Security & Gas Optimization](#security--gas-optimization)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     TrustChain Ecosystem                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Spring     │    │ Blockchain  │  │
│  │   (React)    │───▶│   Backend    │───▶│ (Solidity)  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                            │                      │         │
│                            ▼                      ▼         │
│                      ┌──────────────┐    ┌──────────────┐   │
│                      │  Web3.js/    │    │  Polygon    │   │
│                      │  ethers.js   │───▶│  Amoy Net   │   │
│                      └──────────────┘    └──────────────┘   │
│                                                             │
│                      ┌──────────────┐                       │
│                      │     IPFS     │                       │
│                      │  (web3.stor) │                       │
│                      └──────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

**Single Contract Design**: `TrustChainEscrow.sol`

```solidity
TrustChainEscrow
├── Scheme Management
│   ├── createScheme()
│   ├── getSchemeBalance()
│   └── getDonorContribution()
│
├── Escrow & Fund Management
│   ├── depositFunds()
│   ├── lockFunds()
│   ├── releasePayment()
│   └── refundIfRejected()
│
├── Milestone Lifecycle
│   ├── createMilestone()
│   ├── setVendorForMilestone()
│   ├── updateMilestoneStatus()
│   └── getMilestone()
│
├── Proof & IPFS
│   ├── submitProof()
│   ├── approveProof()
│   ├── rejectProof()
│   ├── storeQuotationHash()
│   └── getProof()
│
└── Security & Access
    ├── onlyOwner
    ├── nonReentrant
    └── transferOwnership()
```

---

## Smart Contract Functions

### 1. Scheme Management

#### `createScheme(uint256 schemeId)`
- **Purpose**: Initialize a welfare scheme on blockchain
- **Access**: Only contract owner (Government)
- **Parameters**:
  - `schemeId`: Unique identifier for the scheme
- **Events**: `SchemeCreated`
- **Usage**:
  ```solidity
  await contract.createScheme(1); // Create Scheme ID 1
  ```

#### `getSchemeBalance(uint256 schemeId) → uint256`
- **Purpose**: Query total funds deposited in a scheme
- **Returns**: Balance in wei (1 POL = 10^18 wei)
- **Usage**:
  ```javascript
  const balance = await contract.getSchemeBalance(1);
  console.log(ethers.formatEther(balance)); // Convert to POL
  ```

#### `getDonorContribution(uint256 schemeId, address donor) → uint256`
- **Purpose**: Track individual donor contributions
- **Returns**: Amount donated by specific address in wei
- **Usage**:
  ```javascript
  const amount = await contract.getDonorContribution(1, donorAddress);
  ```

---

### 2. Fund Deposit & Locking

#### `depositFunds(uint256 schemeId) payable`
- **Purpose**: Donors deposit funds via Stripe → Backend → Blockchain
- **Access**: Anyone (public)
- **Parameters**:
  - `schemeId`: Target scheme ID
  - `msg.value`: Amount in wei (sent with transaction)
- **Events**: `FundsDeposited`
- **Flow**:
  ```
  Donor (Stripe) → FastAPI Backend → Web3.js → depositFunds() → Escrow
  ```
- **Example**:
  ```javascript
  const tx = await contract.depositFunds(1, {
    value: ethers.parseEther("100") // 100 POL
  });
  await tx.wait();
  ```

#### `lockFunds(uint256 schemeId)`
- **Purpose**: Lock funds for milestone-based release
- **Access**: Only owner (Government)
- **When**: After all milestones are created
- **Events**: `FundsLocked`
- **State Change**: No more deposits allowed after lock
- **Example**:
  ```javascript
  await contract.lockFunds(1);
  ```

---

### 3. Milestone Lifecycle

#### `createMilestone(uint256 schemeId, uint256 milestoneId, uint256 amount)`
- **Purpose**: Define milestone with budget allocation
- **Access**: Only owner
- **Parameters**:
  - `schemeId`: Parent scheme
  - `milestoneId`: Unique ID within scheme
  - `amount`: Budget in wei for this milestone
- **Events**: `MilestoneCreated`, `MilestoneStatusUpdated`
- **Status After**: Created (1)
- **Example**:
  ```javascript
  // Create milestone: Procurement for ₹50 Lakhs
  await contract.createMilestone(1, 1, ethers.parseEther("5"));
  ```

#### `setVendorForMilestone(uint256 schemeId, uint256 milestoneId, address vendor)`
- **Purpose**: Assign vendor to execute milestone work
- **Access**: Only owner (NGO approves via backend)
- **Parameters**:
  - `schemeId`, `milestoneId`: Identify milestone
  - `vendor`: Vendor's wallet address
- **Events**: `VendorSet`, `MilestoneStatusUpdated`
- **Validation**: Vendor address cannot be zero
- **Example**:
  ```javascript
  await contract.setVendorForMilestone(1, 1, vendorWalletAddress);
  ```

#### `updateMilestoneStatus(uint256 schemeId, uint256 milestoneId, MilestoneStatus newStatus)`
- **Purpose**: Manual status update (if needed)
- **Access**: Only owner
- **Status Enum**:
  ```solidity
  enum MilestoneStatus {
    Uninitialized,    // 0
    Created,          // 1
    ProofSubmitted,   // 2
    Approved,         // 3
    Rejected,         // 4
    Released,         // 5
    Refunded          // 6
  }
  ```

#### `getMilestone(uint256 schemeId, uint256 milestoneId) → Milestone`
- **Purpose**: Retrieve milestone details
- **Returns**: Struct containing:
  - `amount`: Budget allocated
  - `vendor`: Assigned vendor address
  - `quotationHash`: IPFS hash of quotation
  - `proofHash`: IPFS hash of proof
  - `status`: Current lifecycle status
- **Example**:
  ```javascript
  const milestone = await contract.getMilestone(1, 1);
  console.log(milestone.vendor);
  console.log(milestone.status); // 1 = Created
  ```

---

### 4. Proof Submission & IPFS

#### `submitProof(uint256 schemeId, uint256 milestoneId, string ipfsHash)`
- **Purpose**: Vendor submits proof of work (uploaded to IPFS)
- **Access**: Only assigned vendor
- **Parameters**:
  - `ipfsHash`: IPFS content ID (CID) of proof documents
- **Events**: `ProofSubmitted`, `MilestoneStatusUpdated`
- **Status After**: ProofSubmitted (2)
- **Proof Contents**:
  - Invoice/Receipt (PDF)
  - Work photos (JPG/PNG)
  - Delivery confirmation
  - Inspection report
- **Example**:
  ```javascript
  // Vendor submits proof IPFS hash
  const tx = await contract.connect(vendorAccount).submitProof(
    1, 
    1, 
    "QmX9abc123def456..."
  );
  ```

#### `storeQuotationHash(uint256 schemeId, uint256 milestoneId, string ipfsHash)`
- **Purpose**: Store vendor's quotation (cost & specs) on-chain
- **Access**: Only owner
- **Parameters**:
  - `ipfsHash`: IPFS hash of quotation document
- **When**: After vendor selection, before work starts
- **Example**:
  ```javascript
  await contract.storeQuotationHash(1, 1, "QmQuotation123...");
  ```

#### `getProof(uint256 schemeId, uint256 milestoneId) → ProofRecord`
- **Purpose**: Retrieve proof submission details
- **Returns**:
  - `vendor`: Address of submitting vendor
  - `ipfsHash`: IPFS CID for verification
- **Usage**: Auditors verify proof authenticity
- **Example**:
  ```javascript
  const proof = await contract.getProof(1, 1);
  const ipfsUrl = `https://w3s.link/ipfs/${proof.ipfsHash}`;
  ```

---

### 5. Proof Approval Workflow

#### `approveProof(uint256 schemeId, uint256 milestoneId)`
- **Purpose**: NGO/Auditor approves submitted proof
- **Access**: Only owner
- **Prerequisites**: Proof must be in `ProofSubmitted` status
- **Status After**: Approved (3)
- **Events**: `MilestoneApproved`, `MilestoneStatusUpdated`
- **Next Step**: Payment can be released
- **Example**:
  ```javascript
  await contract.approveProof(1, 1);
  ```

#### `rejectProof(uint256 schemeId, uint256 milestoneId)`
- **Purpose**: Return work for corrections
- **Access**: Only owner
- **Status After**: Rejected (4)
- **Events**: `MilestoneRejected`, `MilestoneStatusUpdated`
- **Vendor Can**: Resubmit proof or request refund
- **Example**:
  ```javascript
  await contract.rejectProof(1, 1);
  ```

---

### 6. Payment Release

#### `releasePayment(uint256 schemeId, uint256 milestoneId)`
- **Purpose**: Automatically transfer approved payment to vendor
- **Access**: Only owner (triggers after final approval)
- **Prerequisites**:
  - Milestone status must be `Approved`
  - Funds must be locked
  - Vendor address must be set
- **Status After**: Released (5)
- **Events**: `PaymentReleased`
- **Security**: Reentrancy protected, uses safe `call` method
- **Example**:
  ```javascript
  const tx = await contract.releasePayment(1, 1);
  // Vendor receives payment automatically
  ```

#### `refundIfRejected(uint256 schemeId, uint256 milestoneId, address payable refundTo)`
- **Purpose**: Return funds if milestone rejected
- **Access**: Only owner
- **Prerequisites**: Milestone must be `Rejected`
- **Status After**: Refunded (6)
- **Events**: `RefundIssued`
- **Recipient**: Usually donor or government treasury
- **Example**:
  ```javascript
  await contract.refundIfRejected(1, 1, donorAddress);
  ```

---

## Polygon Network Setup

### Why Polygon?

| Feature | Benefit |
|---------|---------|
| **Gas Fees** | ~1000x cheaper than Ethereum |
| **Speed** | 2-5 second finality |
| **Scalability** | Handles India's scale |
| **EVM Compatible** | Same as Ethereum tools |
| **Established** | 1000+ active projects |

### Testnet: Polygon Amoy (Recommended)

```
Network Name: Polygon Amoy
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency: AMATIC (test token)
Block Explorer: https://amoy.polygonscan.com/
Faucet: https://faucet.polygon.technology/
```

### Testnet: Polygon Mumbai (Legacy)

```
Network Name: Polygon Mumbai
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency: MATIC (test token)
Block Explorer: https://mumbai.polygonscan.com/
Faucet: https://faucet.polygon.technology/
```

### MetaMask Setup

1. **Add Network to MetaMask**:
   - Open MetaMask → Settings → Networks → Add Network
   - Enter Amoy RPC details above
   - Save

2. **Get Test Tokens**:
   - Visit https://faucet.polygon.technology/
   - Enter your wallet address
   - Receive 0.5 test POL

3. **View Transactions**:
   - Go to https://amoy.polygonscan.com/
   - Search your address or transaction hash

---

## IPFS Integration

### Why IPFS?

```
Blockchain stores hashes (32 bytes)
IPFS stores actual documents (unlimited size)

Invoice (1MB PDF) → IPFS → CID: Qm... → Store in contract
Benefits:
✅ Immutable proof (hash cannot change)
✅ Decentralized (no single server)
✅ Tamper-evident (if file changes, hash changes)
✅ Cost-efficient (1MB on-chain costs ~$1000)
```

### web3.storage API

**Setup**:
1. Visit https://web3.storage/
2. Sign up with email/GitHub
3. Create API token
4. Add to `.env`:
   ```
   WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5...
   ```

### Upload Functions

#### Upload Single File

```javascript
import { uploadFileToIPFS, getIPFSUrl } from './lib/ipfs-utils.js';

// Upload invoice
const cid = await uploadFileToIPFS('./invoice.pdf', 'invoice');
console.log(`IPFS URL: ${getIPFSUrl(cid)}`);

// Store on blockchain
await contract.submitProof(schemeId, milestoneId, cid);
```

#### Upload Proof Bundle

```javascript
import { uploadProofBundle } from './lib/ipfs-utils.js';

const files = [
  './photos/work-1.jpg',
  './photos/work-2.jpg',
  './invoice.pdf',
  './delivery-receipt.pdf'
];

const bundleCID = await uploadProofBundle(files);
await contract.submitProof(schemeId, milestoneId, bundleCID);
```

#### Verify IPFS Hash

```javascript
import { verifyIPFSHash } from './lib/ipfs-utils.js';

const isValid = await verifyIPFSHash('QmX9abc...');
if (isValid) {
  console.log('✅ Proof is valid and accessible');
}
```

### IPFS File Structure Example

```
Proof CID: QmProof123
├── photos/
│   ├── milestone-day1.jpg
│   ├── milestone-day2.jpg
│   └── final-delivery.jpg
├── invoice.pdf
├── delivery-receipt.pdf
└── completion-report.json
```

### Accessing Proof

```
View on: https://w3s.link/ipfs/QmProof123
Direct file: https://w3s.link/ipfs/QmProof123/photos/milestone-day1.jpg
```

---

## Deployment Guide

### Prerequisites

```bash
# 1. Install dependencies
cd blockchain
npm install

# 2. Create .env file
cp .env.example .env

# 3. Add your Private Key (MetaMask: Settings > Security & Privacy > Show Private Key)
PRIVATE_KEY=0x...

# 4. Get test POL from faucet
# Visit: https://faucet.polygon.technology/
```

### Step-by-Step Deployment

#### Step 1: Compile Contract

```bash
npm run compile
```

**Expected Output**:
```
✔ 1 contract compiled successfully

Artifacts written to: artifacts/
Artifacts size: 180KB
```

#### Step 2: Deploy to Polygon Amoy

```bash
npm run deploy
```

**Expected Output**:
```
🚀 Starting TrustChainEscrow Contract Deployment...

📝 Deploying with account: 0x...
🌐 Network: polygonAmoy (Chain ID: 80002)
💰 Account balance: 0.5 POL

⚙️  Compiling contracts...
✅ Compilation successful!

🔄 Deploying TrustChainEscrow...
✅ Contract deployed successfully!
📍 Contract Address: 0xABC123...

⏳ Waiting for block confirmations...
✅ Block confirmations complete!

📄 Deployment info saved to: deployments/latest.json

═══════════════════════════════════════════════════════════════
🎉 DEPLOYMENT SUCCESSFUL! 🎉

📋 Contract Details:
   Address: 0xABC123...
   Network: polygonAmoy (80002)
   Deployer: 0x...
```

#### Step 3: Verify Contract (Optional)

```bash
npm run verify -- 0xABC123...
```

This allows anyone to view and interact with contract on PolygonScan.

#### Step 4: Test Interactions

```bash
node scripts/interact.js
```

---

## Testing & Validation

### Run Complete Test Suite

```bash
npm test
```

### Test Coverage

```
✔ Scheme Management
  ✓ Should create a new scheme
  ✓ Should prevent duplicate scheme creation
  ✓ Should prevent non-owner from creating scheme

✔ Fund Deposit
  ✓ Should deposit funds successfully
  ✓ Should track donor contribution
  ✓ Should accumulate scheme balance
  ... (30+ tests)

✔ Payment Release
  ✓ Should release payment to vendor
  ✓ Should prevent double payment
  ... (23 tests)

Tests: 47 passing (250ms)
```

### Individual Test

```bash
npm test -- --grep "Should release payment to vendor"
```

### Test Reports

After running tests, check:
- ✅ All 47 tests passing
- ✅ No gas warnings
- ✅ No compiler warnings
- ✅ Coverage > 95%

---

## Event Monitoring

### Events Emitted by Contract

```solidity
// Scheme lifecycle
event SchemeCreated(uint256 indexed schemeId, address indexed by);
event FundsDeposited(uint256 indexed schemeId, address indexed from, uint256 amount);
event FundsLocked(uint256 indexed schemeId, uint256 lockedAmount);

// Milestone
event MilestoneCreated(uint256 indexed schemeId, uint256 indexed milestoneId, uint256 amount);
event MilestoneStatusUpdated(uint256 indexed schemeId, uint256 indexed milestoneId, MilestoneStatus status);

// Proof & Vendor
event ProofSubmitted(uint256 indexed schemeId, uint256 indexed milestoneId, address indexed vendor, string ipfsHash);
event MilestoneApproved(uint256 indexed schemeId, uint256 indexed milestoneId, address approver);
event MilestoneRejected(uint256 indexed schemeId, uint256 indexed milestoneId, address approver);

// Payment
event PaymentReleased(uint256 indexed schemeId, uint256 indexed milestoneId, address indexed vendor, uint256 amount);
event RefundIssued(uint256 indexed schemeId, uint256 indexed milestoneId, address indexed to, uint256 amount);
```

### Listen to Events (Spring Boot Integration)

```javascript
// Listen for payment releases
contract.on('PaymentReleased', (schemeId, milestoneId, vendor, amount, event) => {
  console.log(`💰 Payment released: ${vendor} received ${amount} POL`);
  // Trigger backend notification, update UI, etc.
});

// Listen for proof submissions
contract.on('ProofSubmitted', (schemeId, milestoneId, vendor, ipfsHash, event) => {
  console.log(`📄 Proof submitted: ${ipfsHash}`);
  // Alert auditor, send notification
});
```

---

## Spring Boot Integration

### Required Artifacts

After deployment, provide to Spring Boot team:

**1. Contract Address**
```
0xABC123DEF456...
```

**2. Contract ABI**
Located in: `deployments/latest.json` → `abi` field

**3. RPC Configuration**
```properties
# application.properties
blockchain.network=polygonAmoy
blockchain.rpc-url=https://rpc-amoy.polygon.technology
blockchain.contract-address=0xABC123...
blockchain.private-key=${BLOCKCHAIN_PRIVATE_KEY}
```

**4. Web3j Integration**

```java
// Spring Boot Dependency
<dependency>
    <groupId>org.web3j</groupId>
    <artifactId>core</artifactId>
    <version>4.10.0</version>
</dependency>

// Load Contract
Web3j web3j = Web3j.build(new HttpService(rpcUrl));
TrustChainEscrow contract = TrustChainEscrow.load(
    contractAddress,
    web3j,
    credentials,
    BigInteger.valueOf(1000000000L) // Gas price
);

// Call Functions
TransactionReceipt receipt = contract.depositFunds(schemeId)
    .sendAsync()
    .get();
```

**5. Event Listeners**

```java
// Listen for payment releases
contract.paymentReleasedEventFlowable()
    .subscribe(event -> {
        Long schemeId = event.schemeId;
        Address vendor = event.vendor;
        BigInteger amount = event.amount;
        // Handle event
    });
```

---

## Security & Gas Optimization

### Security Features Implemented

| Feature | Benefit |
|---------|---------|
| **Reentrancy Guard** | Prevents recursive fund withdrawals |
| **Access Control** | `onlyOwner` modifier protects sensitive functions |
| **Input Validation** | Zero address checks, amount validation |
| **Safe Transfer** | Uses `.call{}` instead of `.transfer()` |
| **State Transitions** | Milestone status prevents double processing |

### Gas Optimization

```solidity
// Optimization 1: Mapping instead of array
mapping(uint256 => Scheme) schemes;  // O(1) lookup

// Optimization 2: Pack structs
uint256 amount + address vendor = fit in 2 storage slots

// Optimization 3: Event indexing
event PaymentReleased(
    uint256 indexed schemeId,   // Indexed for filtering
    address indexed vendor,     // Indexed for filtering
    uint256 amount              // Not indexed
);

// Estimated Gas Usage
createScheme:       45,000 gas (~$0.045)
depositFunds:       65,000 gas (~$0.065)
releasePayment:     95,000 gas (~$0.095)
```

### Best Practices

1. **Always use latest.json for integration**
2. **Test transactions on Amoy before mainnet**
3. **Monitor gas prices at https://gastracker.io/**
4. **Keep private keys in `.env`, never commit**
5. **Verify contracts on PolygonScan for transparency**

---

## File Structure

```
blockchain/
├── contracts/
│   └── TrustEscrow.sol          # Main smart contract
├── lib/
│   └── ipfs-utils.js            # IPFS upload utilities
├── scripts/
│   ├── deploy.js                # Deployment script
│   └── interact.js              # Contract interaction demo
├── test/
│   └── TrustChainEscrow.test.js # Test suite (47 tests)
├── deployments/
│   ├── latest.json              # Latest deployment artifacts
│   └── deployment-*.json        # Historical deployments
├── hardhat.config.cjs           # Hardhat configuration
├── package.json                 # Dependencies
├── .env.example                 # Environment template
└── README.md                    # This file
```

---

## Troubleshooting

### "Insufficient balance" Error
```bash
# Solution: Get test tokens
Visit: https://faucet.polygon.technology/
Select: Polygon Amoy
Enter your wallet address
```

### "Network is unreachable"
```bash
# Solution: Check RPC URL
# In hardhat.config.cjs, verify POLYGON_AMOY_RPC URL
# Test: curl https://rpc-amoy.polygon.technology/
```

### "Contract not found" on PolygonScan
```bash
# Solution: Wait 5-10 minutes after deployment
# Explorer needs time to index contract
```

### "Gas estimation failed"
```javascript
// Provide explicit gas limit
const tx = await contract.releasePayment(schemeId, milestoneId, {
  gasLimit: 150000
});
```

---

## Reference Links

- **Polygon Docs**: https://polygon.technology/developers
- **Hardhat Docs**: https://hardhat.org/docs
- **Solidity Docs**: https://docs.soliditylang.org/
- **web3.js Docs**: https://docs.web3js.org/
- **web3.storage**: https://web3.storage/
- **PolygonScan Explorer**: https://amoy.polygonscan.com/
- **Contract Verification**: https://polygonscan.com/

---

**Last Updated**: January 27, 2026  
**Maintainer**: TrustChain Blockchain Team  
**Version**: 1.0.0

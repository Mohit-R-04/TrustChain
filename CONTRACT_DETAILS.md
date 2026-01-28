# 📋 Quick Reference - Contract Details

## 🔗 Deployed Contract Information

**Contract Address:** `0xd9145CCE52D386f254917e481eB44e9943F39138`  
**Network:** Remix VM (Osaka) - Local Blockchain Simulator  
**Deployment Date:** January 28, 2026  

**⚠️ IMPORTANT:** This is a **local test deployment**. For production use:
1. Get testnet MATIC from Polygon faucet (requires 0.001+ ETH mainnet)
2. Deploy using `npm run deploy` in `/blockchain` folder
3. Update this address in Spring Boot configuration

---

## 📡 Network Configuration

**Polygon Amoy Testnet (Production):**
- RPC URL: `https://rpc-amoy.polygon.technology`
- Chain ID: `80002`
- Explorer: https://amoy.polygonscan.com/
- Faucet: https://faucet.polygon.technology/

---

## 📄 Contract ABI (Application Binary Interface)

The complete ABI is in: `blockchain/artifacts/contracts/TrustEscrow.sol/TrustChainEscrow.json`

**11 Events:**
1. SchemeCreated
2. FundsDeposited
3. FundsLocked
4. VendorSet
5. QuotationStored
6. MilestoneCreated
7. MilestoneStatusUpdated
8. ProofSubmitted
9. MilestoneApproved
10. MilestoneRejected
11. PaymentReleased
12. RefundIssued

**11 Functions:**
1. createScheme(schemeId)
2. depositFunds(schemeId) - payable
3. lockFunds(schemeId)
4. createMilestone(schemeId, milestoneId, amount)
5. setVendorForMilestone(schemeId, milestoneId, vendor)
6. storeQuotationHash(schemeId, milestoneId, ipfsHash)
7. submitProof(schemeId, milestoneId, ipfsHash)
8. approveProof(schemeId, milestoneId)
9. rejectProof(schemeId, milestoneId)
10. releasePayment(schemeId, milestoneId)
11. refundIfRejected(schemeId, milestoneId, refundAddress)

**4 View Functions:**
1. getMilestone(schemeId, milestoneId)
2. getSchemeBalance(schemeId)
3. getDonorContribution(schemeId, donor)
4. getProof(schemeId, milestoneId)

---

## 🔐 Security Notes

**Owner Address:** [Your MetaMask address that deployed the contract]

**Access Control:**
- Only contract owner can: create schemes, lock funds, set vendors, approve/reject proofs, release payments
- Vendors can: submit proofs for their assigned milestones
- Anyone can: deposit funds (donate), view scheme/milestone data

**Private Key Management:**
- NEVER commit private keys to version control
- Use environment variables in production
- Create separate test wallets for development

---

## 🧪 Test Data Examples

**Wei to MATIC Conversion:**
- 1 MATIC = 1,000,000,000,000,000,000 Wei
- 0.1 MATIC = 100,000,000,000,000,000 Wei
- 0.01 MATIC = 10,000,000,000,000,000 Wei

**Sample IPFS Hashes (for testing):**
- Quotation: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`
- Proof: `QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB`

**Milestone Status Enum:**
- 0: Uninitialized
- 1: Created
- 2: ProofSubmitted
- 3: Approved
- 4: Rejected
- 5: Released
- 6: Refunded

---

## 📦 Files Your Friend Needs

**Essential Files:**
1. `blockchain/contracts/TrustEscrow.sol` - Contract source
2. `blockchain/artifacts/contracts/TrustEscrow.sol/TrustChainEscrow.json` - ABI
3. `backend/pom.xml` - Maven dependencies
4. `backend/src/main/resources/application.properties` - Config
5. `backend/src/main/java/com/trustchain/backend/config/Web3jConfig.java`
6. `backend/src/main/java/com/trustchain/backend/service/TrustChainEscrowService.java`
7. `backend/src/main/java/com/trustchain/backend/controller/EscrowController.java`

**Documentation:**
- `INTEGRATION_HANDOFF_GUIDE.md` - Complete setup guide
- `CONTRACT_DETAILS.md` - This file

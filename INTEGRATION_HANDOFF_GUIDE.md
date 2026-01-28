# 🔗 TrustChain Blockchain Integration - Handoff Guide

## 📦 **FILES TO SEND TO YOUR FRIEND**

Your friend needs these files from you:

### 1. **Smart Contract Files** (from `/blockchain` folder)
```
📁 blockchain/
  ├── contracts/TrustEscrow.sol                          ✅ The smart contract source code
  ├── artifacts/contracts/TrustEscrow.sol/
  │   └── TrustChainEscrow.json                          ✅ Contract ABI + bytecode
  └── hardhat.config.cjs                                  ✅ Network configuration
```

### 2. **Spring Boot Integration Files** (from `/backend` folder)
```
📁 backend/
  ├── pom.xml                                             ✅ Updated with Web3j dependency
  ├── src/main/resources/
  │   ├── application.properties                          ✅ Blockchain config added
  │   └── blockchain-config.properties                    ✅ Detailed blockchain settings
  ├── src/main/java/com/trustchain/backend/
  │   ├── config/Web3jConfig.java                         ✅ Web3j bean configuration
  │   ├── service/TrustChainEscrowService.java            ✅ Contract interaction service
  │   └── controller/EscrowController.java                ✅ REST API endpoints
```

### 3. **Critical Information Document**
Create a file named `BLOCKCHAIN_SETUP.txt` with:
```
Contract Address: 0xd9145CCE52D386f254917e481eB44e9943F39138
Network: Remix VM (Osaka) - Local Blockchain Simulator
RPC URL (for testnet): https://rpc-amoy.polygon.technology
Chain ID: 80002 (Polygon Amoy Testnet)
Owner Address: [Your MetaMask address]
```

---

## ⚙️ **WHAT YOUR FRIEND NEEDS TO DO**

### **Step 1: Install Prerequisites**
```bash
# Check Java version (needs Java 17+)
java -version

# If not installed, download from: https://adoptium.net/

# Check Maven
mvn -version
```

### **Step 2: Copy Files to Backend**
Place all the files you sent into the correct folders:
```
backend/
  ├── pom.xml                           (replace existing)
  ├── src/main/resources/
  │   ├── application.properties        (replace existing)
  │   └── blockchain-config.properties  (new file)
  └── src/main/java/com/trustchain/backend/
      ├── config/Web3jConfig.java       (new file)
      ├── service/TrustChainEscrowService.java  (new file)
      └── controller/EscrowController.java      (new file)
```

### **Step 3: Update Configuration**
Edit `backend/src/main/resources/application.properties`:
```properties
# Blockchain Configuration
blockchain.rpc.url=https://rpc-amoy.polygon.technology
blockchain.contract.address=0xd9145CCE52D386f254917e481eB44e9943F39138
blockchain.chain.id=80002
```

**⚠️ IMPORTANT:** The current contract address is from **Remix VM (local simulator)**. For real deployment:
- Get testnet MATIC from faucet (requires 0.001+ ETH on mainnet first)
- Deploy using `npm run deploy` in `/blockchain` folder
- Update the contract address in `application.properties`

### **Step 4: Install Dependencies**
```bash
cd backend
mvn clean install
```

### **Step 5: Run Spring Boot Application**
```bash
mvn spring-boot:run
```

The API will start at: `http://localhost:8080`

---

## 🔐 **PRIVATE KEY CONFIGURATION (CRITICAL!)**

For **write operations** (creating schemes, depositing funds, etc.), you need a **private key**.

### **Option 1: Environment Variable (RECOMMENDED)**
```bash
# Windows PowerShell
$env:BLOCKCHAIN_PRIVATE_KEY="your_private_key_here"

# Linux/Mac
export BLOCKCHAIN_PRIVATE_KEY="your_private_key_here"
```

### **Option 2: Application Properties (LESS SECURE)**
Edit `application.properties`:
```properties
blockchain.private.key=YOUR_PRIVATE_KEY_HERE
```

**🚨 SECURITY WARNING:**
- NEVER commit private keys to Git
- Add `application.properties` to `.gitignore` if it contains keys
- Use environment variables in production
- For testing, create a new test wallet with small amounts

---

## 🧪 **TESTING THE API**

### **1. Read Operations (No auth needed)**

#### Get Milestone Details
```bash
curl http://localhost:8080/api/escrow/milestone/1/1
```

#### Get Scheme Balance
```bash
curl http://localhost:8080/api/escrow/scheme/1/balance
```

#### Get Donor Contribution
```bash
curl http://localhost:8080/api/escrow/scheme/1/donor/0xYourAddress
```

### **2. Write Operations (Requires private key)**

#### Create Scheme (Owner only)
```bash
curl -X POST http://localhost:8080/api/escrow/scheme/create \
  -H "Content-Type: application/json" \
  -d '{
    "schemeId": 1,
    "privateKey": "your_private_key"
  }'
```

#### Deposit Funds
```bash
curl -X POST http://localhost:8080/api/escrow/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "schemeId": 1,
    "amountInWei": "1000000000000000000",
    "privateKey": "your_private_key"
  }'
```

#### Submit Proof (Vendor)
```bash
curl -X POST http://localhost:8080/api/escrow/proof/submit \
  -H "Content-Type: application/json" \
  -d '{
    "schemeId": 1,
    "milestoneId": 1,
    "ipfsHash": "QmXxxx...",
    "privateKey": "vendor_private_key"
  }'
```

---

## 🚨 **TROUBLESHOOTING**

### **Problem 1: Maven build fails**
```bash
# Clear Maven cache
mvn clean
rm -rf ~/.m2/repository/org/web3j

# Re-download dependencies
mvn install
```

### **Problem 2: "Connection refused" error**
- Check `blockchain.rpc.url` in `application.properties`
- Verify network is accessible: `curl https://rpc-amoy.polygon.technology`
- For Remix VM deployments, switch to testnet RPC

### **Problem 3: "Invalid transaction" error**
- Ensure private key is correct (64 hex characters, no "0x" prefix)
- Check wallet has enough MATIC for gas
- Verify contract address is correct

### **Problem 4: "Contract not found"**
- Current address (`0xd9145CCE52D386f254917e481eB44e9943F39138`) is Remix VM only
- Deploy to real testnet and update `blockchain.contract.address`

---

## 🌐 **DEPLOYING TO POLYGON AMOY TESTNET (Real Network)**

### **Requirements:**
1. ✅ 0.001+ ETH on Ethereum Mainnet (to use faucet)
2. ✅ MetaMask wallet
3. ✅ Private key from MetaMask

### **Steps:**
```bash
# 1. Get testnet MATIC from faucet
# Visit: https://faucet.polygon.technology/
# Connect wallet with ≥0.001 ETH mainnet balance

# 2. Add private key to .env file in /blockchain folder
echo "POLYGON_PRIVATE_KEY=your_private_key" > .env

# 3. Deploy contract
cd blockchain
npm run deploy

# 4. Copy the deployed contract address
# Update backend/src/main/resources/application.properties:
blockchain.contract.address=NEW_DEPLOYED_ADDRESS

# 5. Restart Spring Boot
cd ../backend
mvn spring-boot:run
```

---

## 📋 **CONTRACT FUNCTIONS AVAILABLE**

### **Owner-Only Functions:**
- `createScheme(schemeId)` - Create new funding scheme
- `lockFunds(schemeId)` - Lock deposits for milestones
- `createMilestone(schemeId, milestoneId, amount)` - Define milestone
- `setVendorForMilestone(schemeId, milestoneId, vendorAddress)` - Assign vendor
- `approveProof(schemeId, milestoneId)` - Approve work completion
- `rejectProof(schemeId, milestoneId)` - Reject submitted proof
- `releasePayment(schemeId, milestoneId)` - Pay vendor after approval
- `refundIfRejected(schemeId, milestoneId, refundAddress)` - Refund donors

### **Public Functions:**
- `depositFunds(schemeId)` - Donate to scheme (payable)
- `submitProof(schemeId, milestoneId, ipfsHash)` - Vendor submits work proof

### **View Functions (Read-only):**
- `getMilestone(schemeId, milestoneId)` - Get milestone details
- `getSchemeBalance(schemeId)` - Get total deposited funds
- `getDonorContribution(schemeId, donorAddress)` - Get donor's contribution
- `getProof(schemeId, milestoneId)` - Get submitted proof

---

## 🔗 **USEFUL LINKS**

- **Polygon Amoy Testnet Explorer:** https://amoy.polygonscan.com/
- **Polygon Faucet:** https://faucet.polygon.technology/
- **Web3j Documentation:** https://docs.web3j.io/
- **Remix IDE:** https://remix.ethereum.org/

---

## ✅ **CHECKLIST FOR YOUR FRIEND**

- [ ] Java 17+ installed
- [ ] Maven installed
- [ ] All files copied to correct folders
- [ ] `application.properties` updated with contract address
- [ ] Dependencies installed (`mvn clean install`)
- [ ] Spring Boot starts without errors
- [ ] Can call read endpoints (GET /api/escrow/milestone/1/1)
- [ ] Private key configured (environment variable or properties)
- [ ] Can call write endpoints (POST /api/escrow/scheme/create)

---

## 📞 **SUPPORT**

If your friend encounters issues:
1. Check Spring Boot console logs for detailed errors
2. Verify all configuration values in `application.properties`
3. Test blockchain connection: `curl https://rpc-amoy.polygon.technology`
4. Ensure contract is deployed and address is correct

**Remember:** Current contract (`0xd9145CCE52D386f254917e481eB44e9943F39138`) only works in Remix VM. For production, deploy to Polygon Amoy testnet first!

# 🚀 Step 1: Deploy to Polygon Amoy Testnet

## Prerequisites

Before deploying, you need:

1. **A MetaMask wallet with testnet funds** (POL)
2. **Private key from your MetaMask account**
3. **Polygon Amoy testnet configured in MetaMask**

### Get testnet funds:
- Visit: https://faucet.polygon.technology/
- Select **Polygon Amoy**
- Paste your wallet address
- Claim test POL (you'll get ~0.5 POL)

### Get your private key:
1. Open MetaMask
2. Go to Account Details
3. Click "Export Private Key"
4. Copy the key (starts with `0x`)

### Configure .env:
1. Open `blockchain/.env`
2. Replace `PRIVATE_KEY` value with your actual private key:
   ```
   PRIVATE_KEY=0xyour_actual_private_key_here
   ```
3. **NEVER commit this file to Git!** (It's in .gitignore)

## Deploy Command

From `TrustChain/blockchain` directory, run:

```powershell
npm run deploy
```

This will:
1. Compile the contract
2. Deploy to Polygon Amoy (as configured in hardhat.config.cjs)
3. Save deployment details to `deployments/latest.json`
4. Show you:
   - Contract address
   - ABI (JSON format)
   - Transaction hash
   - Explorer link

## Expected Output

```
🚀 Starting TrustChainEscrow Contract Deployment...

📝 Deploying with account: 0x...
🌐 Network: amoy (Chain ID: 80002)
💰 Account balance: 0.5 POL

⚙️  Compiling contracts...
✅ Compilation successful!

🔄 Deploying TrustChainEscrow...
✅ Contract deployed successfully!
📍 Contract Address: 0x...

⏳ Waiting for block confirmations...
✅ Block confirmations complete!

📄 Deployment info saved to: deployments/latest.json

🎉 DEPLOYMENT SUCCESSFUL! 🎉
```

## After Deployment

Once deployed, you'll get:
- **Contract Address** → Use in Spring Boot
- **ABI** → Use in Spring Boot's Web3j integration
- **Transaction Hash** → Verify on [Amoy PolygonScan](https://amoy.polygonscan.com)

All saved in: `deployments/latest.json`

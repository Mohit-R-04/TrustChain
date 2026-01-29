import hre from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Deployment Script for TrustChainEscrow Contract
 * Deploys to Polygon Amoy or Mumbai testnet
 */

async function main() {
  console.log("🚀 Starting TrustChainEscrow Contract Deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceInEther = hre.ethers.utils.formatEther(balance);
  console.log(`💰 Account balance: ${balanceInEther} POL\n`);

  if (balance.isZero()) {
    console.error(
      "❌ Insufficient balance! Please fund your account from Polygon Testnet Faucet:\n" +
      "   Amoy: https://faucet.polygon.technology/\n" +
      "   Mumbai: https://faucet.polygon.technology/ (or https://mumbai-faucet.webthree.dev)\n"
    );
    process.exit(1);
  }

  // Compile contract
  console.log("⚙️  Compiling contracts...");
  await hre.run("compile");
  console.log("✅ Compilation successful!\n");

  // Deploy contract
  console.log("🔄 Deploying TrustChainEscrow...");
  const TrustChainEscrow = await hre.ethers.getContractFactory("TrustChainEscrow");
  const contract = await TrustChainEscrow.deploy();

  await contract.deployed();
  const contractAddress = contract.address;

  console.log(`✅ Contract deployed successfully!`);
  console.log(`📍 Contract Address: ${contractAddress}\n`);

  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  const tx = contract.deployTransaction;
  if (tx) {
    await tx.wait(5);
    console.log("✅ Block confirmations complete!\n");
  }

  // Get ABI
  const abi = TrustChainEscrow.interface.format("json");

  // Prepare deployment data
  const deploymentData = {
    network: network.name,
    chainId: network.chainId,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTimestamp: new Date().toISOString(),
    abi: JSON.parse(abi),
    rpcUrl: hre.ethers.provider.connection.url,
  };

  // Save deployment info
  const deploymentDir = "./deployments";
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const filename = `deployment-${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentData, null, 2));

  console.log(`📄 Deployment info saved to: ${filepath}\n`);

  // Also save latest deployment for easy access
  const latestPath = path.join(deploymentDir, "latest.json");
  fs.writeFileSync(latestPath, JSON.stringify(deploymentData, null, 2));
  console.log(`📄 Latest deployment info saved to: ${latestPath}\n`);

  // Display verification commands
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🎉 DEPLOYMENT SUCCESSFUL! 🎉\n");
  console.log("📋 Contract Details:");
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Network: ${network.name} (${network.chainId})`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   RPC: ${hre.ethers.provider.connection.url}`);
  console.log("\n📚 Next Steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${network.name === 'polygon' ? 'polygonAmoy' : network.name.includes('mumbai') ? 'polygonMumbai' : 'polygonAmoy'} ${contractAddress}`);
  console.log("\n2. Test contract interactions:");
  console.log(`   node scripts/interact.js`);
  console.log("\n3. Share with Spring Boot team:");
  console.log(`   - Contract Address: ${contractAddress}`);
  console.log(`   - ABI: See deployments/${filename}`);
  console.log("═══════════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

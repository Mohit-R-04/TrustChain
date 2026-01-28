import hre from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Contract Interaction Script
 * Demonstrates complete TrustChainEscrow workflow
 */

// Load latest deployment
function loadDeployment() {
  const latestPath = path.join("./deployments", "latest.json");
  if (!fs.existsSync(latestPath)) {
    throw new Error("No deployment found. Run 'npm run deploy' first");
  }
  return JSON.parse(fs.readFileSync(latestPath, "utf-8"));
}

async function main() {
  console.log("🔧 TrustChainEscrow Contract Interaction\n");

  const deployment = loadDeployment();
  const { contractAddress, abi } = deployment;

  const [deployer, addr1, addr2] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(contractAddress, abi, deployer);

  console.log(`✅ Connected to contract: ${contractAddress}`);
  console.log(`👤 Deployer: ${deployer.address}\n`);

  try {
    // Test 1: Create Scheme
    console.log("═════════════════════════════════════════");
    console.log("Test 1️⃣: Create Scheme");
    console.log("═════════════════════════════════════════");
    const schemeId = 1;
    let tx = await contract.createScheme(schemeId);
    await tx.wait();
    console.log(`✅ Scheme created: ID=${schemeId}\n`);

    // Test 2: Deposit Funds
    console.log("═════════════════════════════════════════");
    console.log("Test 2️⃣: Deposit Funds");
    console.log("═════════════════════════════════════════");
    const depositAmount = hre.ethers.parseEther("1"); // 1 POL
    tx = await contract.depositFunds(schemeId, { value: depositAmount });
    await tx.wait();
    console.log(`✅ Funds deposited: ${hre.ethers.formatEther(depositAmount)} POL`);

    // Verify balance
    const balance = await contract.getSchemeBalance(schemeId);
    console.log(`💰 Scheme balance: ${hre.ethers.formatEther(balance)} POL\n`);

    // Test 3: Create Milestone
    console.log("═════════════════════════════════════════");
    console.log("Test 3️⃣: Create Milestone");
    console.log("═════════════════════════════════════════");
    const milestoneId = 1;
    const milestoneAmount = hre.ethers.parseEther("0.5");
    tx = await contract.createMilestone(schemeId, milestoneId, milestoneAmount);
    await tx.wait();
    console.log(`✅ Milestone created: ID=${milestoneId}, Amount=${hre.ethers.formatEther(milestoneAmount)} POL`);

    // Get milestone details
    const milestone = await contract.getMilestone(schemeId, milestoneId);
    console.log(`   Status: ${milestone.status} (Created=1)\n`);

    // Test 4: Lock Funds
    console.log("═════════════════════════════════════════");
    console.log("Test 4️⃣: Lock Funds");
    console.log("═════════════════════════════════════════");
    tx = await contract.lockFunds(schemeId);
    await tx.wait();
    console.log(`✅ Funds locked for scheme ${schemeId}\n`);

    // Test 5: Set Vendor
    console.log("═════════════════════════════════════════");
    console.log("Test 5️⃣: Assign Vendor");
    console.log("═════════════════════════════════════════");
    const vendorAddress = addr1.address;
    tx = await contract.setVendorForMilestone(schemeId, milestoneId, vendorAddress);
    await tx.wait();
    console.log(`✅ Vendor assigned: ${vendorAddress}\n`);

    // Test 6: Store Quotation Hash
    console.log("═════════════════════════════════════════");
    console.log("Test 6️⃣: Store Quotation (IPFS Hash)");
    console.log("═════════════════════════════════════════");
    const quotationHash = "QmExample123quotation456hash789";
    tx = await contract.storeQuotationHash(schemeId, milestoneId, quotationHash);
    await tx.wait();
    console.log(`✅ Quotation stored: ${quotationHash}\n`);

    // Test 7: Submit Proof (Vendor)
    console.log("═════════════════════════════════════════");
    console.log("Test 7️⃣: Submit Proof (Vendor Action)");
    console.log("═════════════════════════════════════════");
    const proofHash = "QmExample456proof789hash123";
    const contractAsVendor = new hre.ethers.Contract(contractAddress, abi, addr1);
    tx = await contractAsVendor.submitProof(schemeId, milestoneId, proofHash);
    await tx.wait();
    console.log(`✅ Proof submitted by vendor: ${proofHash}`);

    // Get proof details
    const proof = await contract.getProof(schemeId, milestoneId);
    console.log(`   Vendor: ${proof.vendor}`);
    console.log(`   IPFS Hash: ${proof.ipfsHash}\n`);

    // Test 8: Approve Proof
    console.log("═════════════════════════════════════════");
    console.log("Test 8️⃣: Approve Proof (NGO/Admin)");
    console.log("═════════════════════════════════════════");
    tx = await contract.approveProof(schemeId, milestoneId);
    await tx.wait();
    console.log(`✅ Proof approved for milestone ${milestoneId}\n`);

    // Test 9: Release Payment
    console.log("═════════════════════════════════════════");
    console.log("Test 9️⃣: Release Payment (Auto)");
    console.log("═════════════════════════════════════════");
    tx = await contract.releasePayment(schemeId, milestoneId);
    await tx.wait();
    console.log(`✅ Payment released to vendor: ${hre.ethers.formatEther(milestoneAmount)} POL`);

    // Get final milestone status
    const finalMilestone = await contract.getMilestone(schemeId, milestoneId);
    console.log(`   Final Status: ${finalMilestone.status} (Released=5)\n`);

    // Final Summary
    console.log("═════════════════════════════════════════");
    console.log("✅ COMPLETE WORKFLOW TEST SUCCESSFUL!");
    console.log("═════════════════════════════════════════");
    console.log("\n📊 Transaction Flow Summary:");
    console.log("  1. ✅ Scheme Created");
    console.log("  2. ✅ Funds Deposited");
    console.log("  3. ✅ Milestone Created");
    console.log("  4. ✅ Funds Locked");
    console.log("  5. ✅ Vendor Assigned");
    console.log("  6. ✅ Quotation Stored (IPFS)");
    console.log("  7. ✅ Proof Submitted (IPFS)");
    console.log("  8. ✅ Proof Approved");
    console.log("  9. ✅ Payment Released\n");

  } catch (error) {
    console.error("❌ Error during interaction:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

import chai from "chai";
const { expect } = chai;
import hre from "hardhat";

describe("TrustChainEscrow (End-to-End Flow)", function () {
  let contract;
  let owner, donor, vendor;

  const SCHEME_ID = 777;
  const M1 = 1;

  beforeEach(async function () {
    [owner, donor, vendor] = await hre.ethers.getSigners();
    const TrustChainEscrow = await hre.ethers.getContractFactory("TrustChainEscrow");
    contract = await TrustChainEscrow.deploy();
    await contract.deployed();
  });

  function depositFunds(signer, schemeId, value) {
    return contract.connect(signer)["depositFunds(uint256)"](schemeId, { value });
  }

  function releasePayment(signer, schemeId, milestoneId) {
    return contract.connect(signer)["releasePayment(uint256,uint256)"](schemeId, milestoneId);
  }

  it("Runs the full donation → proof → approval → payout workflow", async function () {
    await contract.createScheme(SCHEME_ID);

    const depositAmount = hre.ethers.utils.parseEther("2");
    await expect(depositFunds(donor, SCHEME_ID, depositAmount))
      .to.emit(contract, "FundsDeposited")
      .withArgs(SCHEME_ID, donor.address, depositAmount);

    const milestoneAmount = hre.ethers.utils.parseEther("1");
    await contract.lockFunds(SCHEME_ID);
    await expect(contract.createMilestone(SCHEME_ID, M1, milestoneAmount))
      .to.emit(contract, "MilestoneCreated")
      .withArgs(SCHEME_ID, M1, milestoneAmount);

    await expect(contract.setVendorForMilestone(SCHEME_ID, M1, vendor.address))
      .to.emit(contract, "VendorSet")
      .withArgs(SCHEME_ID, M1, vendor.address);

    const quotationHash = "QmQuotationCID";
    await expect(contract.storeQuotationHash(SCHEME_ID, M1, quotationHash))
      .to.emit(contract, "QuotationStored")
      .withArgs(SCHEME_ID, M1, quotationHash);

    const proofHash = "QmProofCID";
    await expect(contract.connect(vendor).submitProof(SCHEME_ID, M1, proofHash))
      .to.emit(contract, "ProofSubmitted")
      .withArgs(SCHEME_ID, M1, vendor.address, proofHash);

    await expect(contract.approveProof(SCHEME_ID, M1))
      .to.emit(contract, "MilestoneApproved")
      .withArgs(SCHEME_ID, M1, owner.address);

    await expect(releasePayment(owner, SCHEME_ID, M1))
      .to.emit(contract, "PaymentReleased")
      .withArgs(SCHEME_ID, M1, vendor.address, milestoneAmount);

    const [totalDeposited, totalReleased, totalRefunded, locked] = await contract.getSchemeStats(SCHEME_ID);
    expect(locked).to.equal(true);
    expect(totalDeposited).to.equal(depositAmount);
    expect(totalReleased).to.equal(milestoneAmount);
    expect(totalRefunded).to.equal(0);
  });

  it("Prevents deposits after funds are locked", async function () {
    await contract.createScheme(SCHEME_ID);
    await depositFunds(donor, SCHEME_ID, hre.ethers.utils.parseEther("1"));
    await contract.lockFunds(SCHEME_ID);
    await expect(depositFunds(donor, SCHEME_ID, hre.ethers.utils.parseEther("1"))).to.be.revertedWith(
      "locked"
    );
  });

  it("Prevents milestone creation beyond deposited funds when locked", async function () {
    await contract.createScheme(SCHEME_ID);
    await depositFunds(donor, SCHEME_ID, hre.ethers.utils.parseEther("1"));
    await contract.lockFunds(SCHEME_ID);

    await expect(
      contract.createMilestone(SCHEME_ID, 1, hre.ethers.utils.parseEther("0.9"))
    ).to.not.be.reverted;

    await expect(
      contract.createMilestone(SCHEME_ID, 2, hre.ethers.utils.parseEther("0.2"))
    ).to.be.revertedWith("milestones exceed funds");
  });
});

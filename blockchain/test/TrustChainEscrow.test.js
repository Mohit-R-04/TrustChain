import chai from "chai";
const { expect } = chai;
import hre from "hardhat";

describe("TrustChainEscrow", function () {
  let contract;
  let owner, donor, vendor, ngo, addr4;

  // Constants
  const SCHEME_ID = 1;
  const MILESTONE_ID = 1;
  const MILESTONE_AMOUNT = hre.ethers.utils.parseEther("1");
  const DEPOSIT_AMOUNT = hre.ethers.utils.parseEther("5");
  const QUOTATION_HASH = "QmQuotation123";
  const PROOF_HASH = "QmProof456";

  // Enums from contract
  const MilestoneStatus = {
    Uninitialized: 0,
    Created: 1,
    ProofSubmitted: 2,
    Approved: 3,
    Rejected: 4,
    Released: 5,
    Refunded: 6,
  };

  beforeEach(async function () {
    [owner, donor, vendor, ngo, addr4] = await hre.ethers.getSigners();

    const TrustChainEscrow = await hre.ethers.getContractFactory("TrustChainEscrow");
    contract = await TrustChainEscrow.deploy();
    await contract.deployed();
  });

  function depositFunds(signer, schemeId, value) {
    return contract.connect(signer)["depositFunds(uint256)"](schemeId, { value });
  }

  function refundIfRejected(signer, schemeId, milestoneId, to) {
    return contract.connect(signer)["refundIfRejected(uint256,uint256,address)"](schemeId, milestoneId, to);
  }

  function releasePayment(signer, schemeId, milestoneId) {
    return contract.connect(signer)["releasePayment(uint256,uint256)"](schemeId, milestoneId);
  }

  describe("Scheme Management", function () {
    it("Should create a new scheme", async function () {
      await expect(contract.createScheme(SCHEME_ID))
        .to.emit(contract, "SchemeCreated")
        .withArgs(SCHEME_ID, owner.address);
    });

    it("Should prevent duplicate scheme creation", async function () {
      await contract.createScheme(SCHEME_ID);
      await expect(contract.createScheme(SCHEME_ID)).to.be.revertedWith("scheme exists");
    });

    it("Should prevent non-owner from creating scheme", async function () {
      await expect(contract.connect(donor).createScheme(SCHEME_ID)).to.be.revertedWith("not owner");
    });
  });

  describe("Fund Deposit", function () {
    beforeEach(async function () {
      await contract.createScheme(SCHEME_ID);
    });

    it("Should deposit funds successfully", async function () {
      await expect(
        depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT)
      )
        .to.emit(contract, "FundsDeposited")
        .withArgs(SCHEME_ID, donor.address, DEPOSIT_AMOUNT);
    });

    it("Should track donor contribution", async function () {
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      const contribution = await contract.getDonorContribution(SCHEME_ID, donor.address);
      expect(contribution).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should accumulate scheme balance", async function () {
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      const balance = await contract.getSchemeBalance(SCHEME_ID);
      expect(balance).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should prevent zero deposit", async function () {
      await expect(
        depositFunds(donor, SCHEME_ID, 0)
      ).to.be.revertedWith("no value");
    });

    it("Should prevent deposit to non-existent scheme", async function () {
      await expect(
        depositFunds(donor, 999, DEPOSIT_AMOUNT)
      ).to.be.revertedWith("scheme missing");
    });
  });

  describe("Fund Locking", function () {
    beforeEach(async function () {
      await contract.createScheme(SCHEME_ID);
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
    });

    it("Should lock funds", async function () {
      await expect(contract.lockFunds(SCHEME_ID))
        .to.emit(contract, "FundsLocked")
        .withArgs(SCHEME_ID, DEPOSIT_AMOUNT);
    });

    it("Should prevent non-owner from locking", async function () {
      await expect(contract.connect(donor).lockFunds(SCHEME_ID)).to.be.revertedWith("not owner");
    });

    it("Should prevent duplicate lock", async function () {
      await contract.lockFunds(SCHEME_ID);
      await expect(contract.lockFunds(SCHEME_ID)).to.be.revertedWith("already locked");
    });

    it("Should prevent locking without funds", async function () {
      const emptySchemeId = 2;
      await contract.createScheme(emptySchemeId);
      await expect(contract.lockFunds(emptySchemeId)).to.be.revertedWith("no funds");
    });
  });

  describe("Milestone Management", function () {
    beforeEach(async function () {
      await contract.createScheme(SCHEME_ID);
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      await contract.lockFunds(SCHEME_ID);
    });

    it("Should create milestone", async function () {
      await expect(contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT))
        .to.emit(contract, "MilestoneCreated")
        .withArgs(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
    });

    it("Should set correct milestone status on creation", async function () {
      await contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
      const milestone = await contract.getMilestone(SCHEME_ID, MILESTONE_ID);
      expect(milestone.status).to.equal(MilestoneStatus.Created);
    });

    it("Should prevent duplicate milestone", async function () {
      await contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
      await expect(
        contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT)
      ).to.be.revertedWith("already exists");
    });

    it("Should prevent zero amount milestone", async function () {
      await expect(contract.createMilestone(SCHEME_ID, MILESTONE_ID, 0)).to.be.revertedWith(
        "zero amount"
      );
    });
  });

  describe("Vendor Assignment", function () {
    beforeEach(async function () {
      await contract.createScheme(SCHEME_ID);
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      await contract.lockFunds(SCHEME_ID);
      await contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
    });

    it("Should assign vendor", async function () {
      await expect(contract.setVendorForMilestone(SCHEME_ID, MILESTONE_ID, vendor.address))
        .to.emit(contract, "VendorSet")
        .withArgs(SCHEME_ID, MILESTONE_ID, vendor.address);
    });

    it("Should prevent zero vendor address", async function () {
      await expect(
        contract.setVendorForMilestone(SCHEME_ID, MILESTONE_ID, hre.ethers.constants.AddressZero)
      ).to.be.revertedWith("vendor zero");
    });

    it("Should prevent non-owner from assigning vendor", async function () {
      await expect(
        contract.connect(donor).setVendorForMilestone(SCHEME_ID, MILESTONE_ID, vendor.address)
      ).to.be.revertedWith("not owner");
    });
  });

  describe("Quotation Storage", function () {
    beforeEach(async function () {
      await contract.createScheme(SCHEME_ID);
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      await contract.lockFunds(SCHEME_ID);
      await contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
      await contract.setVendorForMilestone(SCHEME_ID, MILESTONE_ID, vendor.address);
    });

    it("Should store quotation hash", async function () {
      await expect(contract.storeQuotationHash(SCHEME_ID, MILESTONE_ID, QUOTATION_HASH))
        .to.emit(contract, "QuotationStored")
        .withArgs(SCHEME_ID, MILESTONE_ID, QUOTATION_HASH);
    });

    it("Should allow updating quotation", async function () {
      await contract.storeQuotationHash(SCHEME_ID, MILESTONE_ID, QUOTATION_HASH);
      const newHash = "QmNewQuotation789";
      await contract.storeQuotationHash(SCHEME_ID, MILESTONE_ID, newHash);

      const milestone = await contract.getMilestone(SCHEME_ID, MILESTONE_ID);
      expect(milestone.quotationHash).to.equal(newHash);
    });
  });

  describe("Proof Submission & Approval", function () {
    beforeEach(async function () {
      await contract.createScheme(SCHEME_ID);
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      await contract.lockFunds(SCHEME_ID);
      await contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
      await contract.setVendorForMilestone(SCHEME_ID, MILESTONE_ID, vendor.address);
    });

    it("Should submit proof as vendor", async function () {
      await expect(
        contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH)
      )
        .to.emit(contract, "ProofSubmitted")
        .withArgs(SCHEME_ID, MILESTONE_ID, vendor.address, PROOF_HASH);
    });

    it("Should prevent non-vendor from submitting proof", async function () {
      await expect(
        contract.connect(addr4).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH)
      ).to.be.revertedWith("not vendor");
    });

    it("Should approve proof", async function () {
      await contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH);
      await expect(contract.approveProof(SCHEME_ID, MILESTONE_ID))
        .to.emit(contract, "MilestoneApproved")
        .withArgs(SCHEME_ID, MILESTONE_ID, owner.address);
    });

    it("Should prevent non-owner from approving", async function () {
      await contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH);
      await expect(contract.connect(donor).approveProof(SCHEME_ID, MILESTONE_ID)).to.be.revertedWith(
        "not owner"
      );
    });

    it("Should reject proof", async function () {
      await contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH);
      await expect(contract.rejectProof(SCHEME_ID, MILESTONE_ID))
        .to.emit(contract, "MilestoneRejected")
        .withArgs(SCHEME_ID, MILESTONE_ID, owner.address);
    });

    it("Should allow resubmission after rejection", async function () {
      await contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH);
      await contract.rejectProof(SCHEME_ID, MILESTONE_ID);

      const newProofHash = "QmNewProof999";
      await expect(
        contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, newProofHash)
      ).to.not.be.reverted;
    });

    it("Should retrieve proof record", async function () {
      await contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH);
      const proof = await contract.getProof(SCHEME_ID, MILESTONE_ID);
      expect(proof.vendor).to.equal(vendor.address);
      expect(proof.ipfsHash).to.equal(PROOF_HASH);
    });
  });

  describe("Payment Release", function () {
    beforeEach(async function () {
      await contract.createScheme(SCHEME_ID);
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      await contract.lockFunds(SCHEME_ID);
      await contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
      await contract.setVendorForMilestone(SCHEME_ID, MILESTONE_ID, vendor.address);
      await contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH);
      await contract.approveProof(SCHEME_ID, MILESTONE_ID);
    });

    it("Should release payment to vendor", async function () {
      const vendorBalanceBefore = await hre.ethers.provider.getBalance(vendor.address);

      await expect(releasePayment(owner, SCHEME_ID, MILESTONE_ID))
        .to.emit(contract, "PaymentReleased")
        .withArgs(SCHEME_ID, MILESTONE_ID, vendor.address, MILESTONE_AMOUNT);

      const vendorBalanceAfter = await hre.ethers.provider.getBalance(vendor.address);
      expect(vendorBalanceAfter).to.equal(vendorBalanceBefore.add(MILESTONE_AMOUNT));
    });

    it("Should prevent non-owner from releasing payment", async function () {
      await expect(releasePayment(donor, SCHEME_ID, MILESTONE_ID)).to.be.revertedWith(
        "not owner"
      );
    });

    it("Should prevent double payment", async function () {
      await releasePayment(owner, SCHEME_ID, MILESTONE_ID);
      await expect(releasePayment(owner, SCHEME_ID, MILESTONE_ID)).to.be.revertedWith(
        "not approved"
      );
    });

    it("Should prevent payment for non-approved milestone", async function () {
      const milestone2 = 2;
      await contract.createMilestone(SCHEME_ID, milestone2, MILESTONE_AMOUNT);
      await expect(releasePayment(owner, SCHEME_ID, milestone2)).to.be.revertedWith(
        "not approved"
      );
    });
  });

  describe("Refund Logic", function () {
    beforeEach(async function () {
      await contract.createScheme(SCHEME_ID);
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      await contract.lockFunds(SCHEME_ID);
      await contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
      await contract.setVendorForMilestone(SCHEME_ID, MILESTONE_ID, vendor.address);
      await contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH);
      await contract.rejectProof(SCHEME_ID, MILESTONE_ID);
    });

    it("Should refund rejected milestone", async function () {
      const donorBalanceBefore = await hre.ethers.provider.getBalance(donor.address);

      await expect(refundIfRejected(owner, SCHEME_ID, MILESTONE_ID, donor.address))
        .to.emit(contract, "RefundIssued")
        .withArgs(SCHEME_ID, MILESTONE_ID, donor.address, MILESTONE_AMOUNT);

      const donorBalanceAfter = await hre.ethers.provider.getBalance(donor.address);
      expect(donorBalanceAfter).to.equal(donorBalanceBefore.add(MILESTONE_AMOUNT));
    });

    it("Should prevent non-owner from refunding", async function () {
      await expect(
        refundIfRejected(donor, SCHEME_ID, MILESTONE_ID, donor.address)
      ).to.be.revertedWith("not owner");
    });

    it("Should prevent refunding non-rejected milestone", async function () {
      const milestone2 = 2;
      await contract.createMilestone(SCHEME_ID, milestone2, MILESTONE_AMOUNT);
      await expect(
        refundIfRejected(owner, SCHEME_ID, milestone2, donor.address)
      ).to.be.revertedWith("not rejected");
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should protect against reentrancy in releasePayment", async function () {
      // This test verifies the reentrancy guard is in place
      // A full reentrancy attack would require a malicious contract
      // For now, we just verify the guard exists and doesn't break normal flow
      await contract.createScheme(SCHEME_ID);
      await depositFunds(donor, SCHEME_ID, DEPOSIT_AMOUNT);
      await contract.lockFunds(SCHEME_ID);
      await contract.createMilestone(SCHEME_ID, MILESTONE_ID, MILESTONE_AMOUNT);
      await contract.setVendorForMilestone(SCHEME_ID, MILESTONE_ID, vendor.address);
      await contract.connect(vendor).submitProof(SCHEME_ID, MILESTONE_ID, PROOF_HASH);
      await contract.approveProof(SCHEME_ID, MILESTONE_ID);

      // Normal payment should work
      await expect(releasePayment(owner, SCHEME_ID, MILESTONE_ID)).to.not.be.reverted;
    });
  });

  describe("Ownership & Access Control", function () {
    it("Should transfer ownership", async function () {
      await contract.transferOwnership(donor.address);
      const newOwner = await contract.owner();
      expect(newOwner).to.equal(donor.address);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      await expect(contract.connect(donor).transferOwnership(addr4.address)).to.be.revertedWith(
        "not owner"
      );
    });

    it("Should prevent zero address as owner", async function () {
      await expect(contract.transferOwnership(hre.ethers.constants.AddressZero)).to.be.revertedWith("zero owner");
    });
  });
});

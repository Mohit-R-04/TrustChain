// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TrustChainEscrow - Milestone-based escrow with IPFS proofs for welfare projects
/// @notice Single contract variant (instead of splitting into Milestones/Vendors) with explicit mappings for donors, schemes, milestones, and proofs
contract TrustChainEscrow {
    // --- Access control (owner as governance placeholder) ---
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    // --- Reentrancy guard ---
    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "reentrancy");
        _locked = 2;
        _;
        _locked = 1;
    }

    // --- Data structures ---
    enum MilestoneStatus {
        Uninitialized,
        Created,
        ProofSubmitted,
        Approved,
        Rejected,
        Released,
        Refunded
    }

    struct Milestone {
        uint256 amount;            // amount to release for this milestone (native token)
        address payable vendor;    // vendor wallet for payout
        string quotationHash;      // IPFS hash of vendor quotation
        string proofHash;          // IPFS hash of submitted proof
        MilestoneStatus status;    // lifecycle status
    }

    struct ProofRecord {
        address vendor;            // vendor who submitted the proof
        string ipfsHash;           // IPFS hash of the proof
    }

    struct Scheme {
        bool exists;                               // scheme/project existence flag
        uint256 totalDeposited;                    // total funds deposited into escrow
        bool locked;                               // when true, deposits are considered locked for milestones
        mapping(address => uint256) donorAmounts;  // donor => total contributed
        mapping(uint256 => Milestone) milestones;  // milestoneId => Milestone
        mapping(uint256 => ProofRecord) proofs;    // milestoneId => ProofRecord (vendor + proof IPFS)
    }

    mapping(uint256 => Scheme) private schemes; // schemeId => Scheme

    // --- Events ---
    event SchemeCreated(uint256 indexed schemeId, address indexed by);
    event FundsDeposited(uint256 indexed schemeId, address indexed from, uint256 amount);
    event FundsLocked(uint256 indexed schemeId, uint256 lockedAmount);
    event VendorSet(uint256 indexed schemeId, uint256 indexed milestoneId, address vendor);
    event QuotationStored(uint256 indexed schemeId, uint256 indexed milestoneId, string ipfsHash);
    event MilestoneCreated(uint256 indexed schemeId, uint256 indexed milestoneId, uint256 amount);
    event MilestoneStatusUpdated(uint256 indexed schemeId, uint256 indexed milestoneId, MilestoneStatus status);
    event ProofSubmitted(uint256 indexed schemeId, uint256 indexed milestoneId, address indexed vendor, string ipfsHash);
    event MilestoneApproved(uint256 indexed schemeId, uint256 indexed milestoneId, address approver);
    event MilestoneRejected(uint256 indexed schemeId, uint256 indexed milestoneId, address approver);
    event PaymentReleased(uint256 indexed schemeId, uint256 indexed milestoneId, address indexed vendor, uint256 amount);
    event RefundIssued(uint256 indexed schemeId, uint256 indexed milestoneId, address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    // --- Administration ---
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        owner = newOwner;
    }

    // --- Scheme lifecycle ---
    function createScheme(uint256 schemeId) external onlyOwner {
        Scheme storage s = schemes[schemeId];
        require(!s.exists, "scheme exists");
        s.exists = true;
        emit SchemeCreated(schemeId, msg.sender);
    }

    // --- Core escrow functions ---
    function depositFunds(uint256 schemeId) external payable {
        require(msg.value > 0, "no value");
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        s.totalDeposited += msg.value;
        s.donorAmounts[msg.sender] += msg.value;
        emit FundsDeposited(schemeId, msg.sender, msg.value);
    }

    function lockFunds(uint256 schemeId) external onlyOwner {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        require(!s.locked, "already locked");
        require(s.totalDeposited > 0, "no funds");
        s.locked = true;
        emit FundsLocked(schemeId, s.totalDeposited);
    }

    function releasePayment(uint256 schemeId, uint256 milestoneId) external onlyOwner nonReentrant {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        require(s.locked, "not locked");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status == MilestoneStatus.Approved, "not approved");
        require(m.amount > 0, "no amount");
        require(m.vendor != address(0), "no vendor");
        m.status = MilestoneStatus.Released;
        _pay(m.vendor, m.amount);
        emit PaymentReleased(schemeId, milestoneId, m.vendor, m.amount);
    }

    function refundIfRejected(uint256 schemeId, uint256 milestoneId, address payable to) external onlyOwner nonReentrant {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status == MilestoneStatus.Rejected, "not rejected");
        require(m.amount > 0, "no amount");
        m.status = MilestoneStatus.Refunded;
        _pay(to, m.amount);
        emit RefundIssued(schemeId, milestoneId, to, m.amount);
    }

    // --- Proof / IPFS ---
    function submitProof(uint256 schemeId, uint256 milestoneId, string calldata ipfsHash) external {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status == MilestoneStatus.Created || m.status == MilestoneStatus.Rejected, "cannot submit");
        require(m.vendor != address(0), "vendor not set");
        require(msg.sender == m.vendor, "not vendor");
        m.proofHash = ipfsHash;
        s.proofs[milestoneId] = ProofRecord({vendor: msg.sender, ipfsHash: ipfsHash});
        m.status = MilestoneStatus.ProofSubmitted;
        emit ProofSubmitted(schemeId, milestoneId, msg.sender, ipfsHash);
        emit MilestoneStatusUpdated(schemeId, milestoneId, m.status);
    }

    function approveProof(uint256 schemeId, uint256 milestoneId) external onlyOwner {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status == MilestoneStatus.ProofSubmitted, "wrong status");
        m.status = MilestoneStatus.Approved;
        emit MilestoneApproved(schemeId, milestoneId, msg.sender);
        emit MilestoneStatusUpdated(schemeId, milestoneId, m.status);
    }

    function rejectProof(uint256 schemeId, uint256 milestoneId) external onlyOwner {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status == MilestoneStatus.ProofSubmitted || m.status == MilestoneStatus.Approved, "wrong status");
        m.status = MilestoneStatus.Rejected;
        emit MilestoneRejected(schemeId, milestoneId, msg.sender);
        emit MilestoneStatusUpdated(schemeId, milestoneId, m.status);
    }

    // --- Vendor selection recording ---
    function setVendorForMilestone(uint256 schemeId, uint256 milestoneId, address payable vendor) external onlyOwner {
        require(vendor != address(0), "vendor zero");
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status == MilestoneStatus.Created || m.status == MilestoneStatus.Uninitialized, "locked");
        m.vendor = vendor;
        if (m.status == MilestoneStatus.Uninitialized) {
            m.status = MilestoneStatus.Created;
        }
        emit VendorSet(schemeId, milestoneId, vendor);
        emit MilestoneStatusUpdated(schemeId, milestoneId, m.status);
    }

    function storeQuotationHash(uint256 schemeId, uint256 milestoneId, string calldata ipfsHash) external onlyOwner {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status != MilestoneStatus.Uninitialized, "milestone missing");
        m.quotationHash = ipfsHash;
        emit QuotationStored(schemeId, milestoneId, ipfsHash);
    }

    // --- Milestones ---
    function createMilestone(uint256 schemeId, uint256 milestoneId, uint256 amount) external onlyOwner {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status == MilestoneStatus.Uninitialized, "already exists");
        require(amount > 0, "zero amount");
        m.amount = amount;
        m.status = MilestoneStatus.Created;
        emit MilestoneCreated(schemeId, milestoneId, amount);
        emit MilestoneStatusUpdated(schemeId, milestoneId, m.status);
    }

    function updateMilestoneStatus(uint256 schemeId, uint256 milestoneId, MilestoneStatus newStatus) external onlyOwner {
        Scheme storage s = schemes[schemeId];
        require(s.exists, "scheme missing");
        Milestone storage m = s.milestones[milestoneId];
        require(m.status != MilestoneStatus.Uninitialized, "missing");
        m.status = newStatus;
        emit MilestoneStatusUpdated(schemeId, milestoneId, newStatus);
    }

    // --- Views ---
    function getMilestone(uint256 schemeId, uint256 milestoneId) external view returns (Milestone memory) {
        return schemes[schemeId].milestones[milestoneId];
    }

    function getSchemeBalance(uint256 schemeId) external view returns (uint256) {
        return schemes[schemeId].totalDeposited;
    }

    function getDonorContribution(uint256 schemeId, address donor) external view returns (uint256) {
        return schemes[schemeId].donorAmounts[donor];
    }

    function getProof(uint256 schemeId, uint256 milestoneId) external view returns (ProofRecord memory) {
        return schemes[schemeId].proofs[milestoneId];
    }

    // --- Internal helpers ---
    function _pay(address payable to, uint256 amount) internal {
        require(address(this).balance >= amount, "insufficient funds");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "transfer failed");
    }
}

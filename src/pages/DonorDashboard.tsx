import { useState } from "react";
import { DollarSign, TrendingUp, FolderOpen, Lock, Shield, CheckCircle, Eye, CreditCard, FileText, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { DataTable } from "@/components/DataTable";
import { SmartContractWidget } from "@/components/SmartContractWidget";
import { VerificationModal } from "@/components/VerificationModal";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import donorEscrowBanner from "@/assets/donor-escrow-banner.png";

const donorStats = [
  { title: "Total Donated", value: 850000, icon: DollarSign, prefix: "₹", variant: "donor" as const, delay: 0 },
  { title: "Escrow Locked", value: 187000, icon: Lock, prefix: "₹", variant: "government" as const, delay: 100 },
  { title: "Pending Approvals", value: 3, icon: AlertCircle, variant: "vendor" as const, delay: 200 },
  { title: "Verified Released", value: 663000, icon: CheckCircle, prefix: "₹", variant: "public" as const, delay: 300 },
];

const schemes = [
  { id: 1, name: "Mid-Day Meal Program", category: "Food", region: "Karnataka", donated: "₹2,50,000", escrowed: "₹50,000", status: "Active" },
  { id: 2, name: "Rural Healthcare Initiative", category: "Healthcare", region: "Maharashtra", donated: "₹1,80,000", escrowed: "₹45,000", status: "Active" },
  { id: 3, name: "Digital Education Drive", category: "Education", region: "Tamil Nadu", donated: "₹3,20,000", escrowed: "₹0", status: "Completed" },
];

const pendingProofs = [
  { id: 1, scheme: "Mid-Day Meal Program", milestone: "Phase 2 Delivery", vendor: "FoodCare Ltd", invoiceCID: "QmX7gH...8fKj", receiptCID: "QmY9tR...2nLp" },
  { id: 2, scheme: "Rural Healthcare", milestone: "Equipment Setup", vendor: "MediSupply Co", invoiceCID: "QmZ3wE...5mNq", receiptCID: "QmA6kS...9pRt" },
];

const transactions = [
  { date: "2026-01-26", type: "Donation", scheme: "Mid-Day Meal Program", amount: "₹50,000", txHash: "0x8f3a2d...7e9b4c" },
  { date: "2026-01-25", type: "Escrow Release", scheme: "Healthcare Initiative", amount: "₹25,000", txHash: "0x2c7b1a...4d8e3f" },
  { date: "2026-01-24", type: "Donation", scheme: "Digital Education", amount: "₹30,000", txHash: "0x5e9c4b...1a2d7f" },
];

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "donate" | "verify">("dashboard");
  const [showVerification, setShowVerification] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationSuccess, setDonationSuccess] = useState(false);

  const handleDonate = () => {
    setDonationSuccess(true);
    setTimeout(() => setDonationSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-donor/10">
              <DollarSign className="w-8 h-8 text-donor" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Donor Portal</h1>
              <p className="text-muted-foreground">Donate via Stripe & track escrow fund usage</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-card rounded-xl border border-border w-fit mb-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: TrendingUp },
              { id: "donate", label: "Donate Now", icon: CreditCard },
              { id: "verify", label: "Verify Proofs", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-donor text-donor-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "dashboard" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {donorStats.map((stat) => (
                  <StatsCard key={stat.title} {...stat} />
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Blockchain Verified Panel */}
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-public/10">
                        <Shield className="w-5 h-5 text-public" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">Blockchain Verified Transparency</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-muted/30 text-center">
                        <CheckCircle className="w-6 h-6 text-public mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Donations Verified</p>
                        <p className="text-xs text-muted-foreground">On-chain proof</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 text-center">
                        <Lock className="w-6 h-6 text-donor mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Escrow Active</p>
                        <p className="text-xs text-muted-foreground">Smart contract secured</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 text-center">
                        <TrendingUp className="w-6 h-6 text-ngo mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Real-time Updates</p>
                        <p className="text-xs text-muted-foreground">Milestone tracking</p>
                      </div>
                    </div>
                  </div>

                  {/* Funded Schemes */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Your Funded Schemes</h2>
                    <div className="space-y-4">
                      {schemes.map((scheme) => (
                        <div 
                          key={scheme.id}
                          className="p-4 rounded-xl border border-border hover:border-donor/30 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{scheme.name}</h3>
                              <p className="text-sm text-muted-foreground">{scheme.category} • {scheme.region}</p>
                            </div>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              scheme.status === "Active" ? "bg-public/10 text-public" : "bg-muted text-muted-foreground"
                            )}>
                              {scheme.status}
                            </span>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Donated: </span>
                              <span className="font-medium text-donor">{scheme.donated}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">In Escrow: </span>
                              <span className="font-medium text-government">{scheme.escrowed}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Transaction History</h2>
                    <div className="space-y-3">
                      {transactions.map((tx, i) => (
                        <div 
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              tx.type === "Donation" ? "bg-donor/10" : "bg-public/10"
                            )}>
                              {tx.type === "Donation" ? (
                                <DollarSign className="w-4 h-4 text-donor" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-public" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{tx.type}</p>
                              <p className="text-xs text-muted-foreground">{tx.scheme}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{tx.amount}</p>
                            <button 
                              onClick={() => {
                                setSelectedTx(tx);
                                setShowVerification(true);
                              }}
                              className="text-xs text-donor hover:underline"
                            >
                              Verify →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <SmartContractWidget status="locked" amount="₹1.87L" />
                  <ActivityFeed />
                </div>
              </div>
            </>
          )}

          {activeTab === "donate" && (
            <div className="max-w-xl mx-auto">
              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Donate to Welfare Scheme</h2>
                
                {!donationSuccess ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Scheme</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-donor/50">
                        <option value="">Choose a scheme</option>
                        {schemes.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Donation Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-donor/50"
                      />
                    </div>

                    {/* Escrow Explanation Banner */}
                    <div className="mb-4 animate-fade-in">
                      <img
                        src={donorEscrowBanner}
                        alt="Smart Contract Escrow Vault"
                        className="w-full max-h-[200px] object-cover rounded-xl border border-donor/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_hsl(var(--donor)/0.3)]"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Lock className="w-4 h-4 text-donor" />
                        <span>Your funds will be locked in escrow</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Released only after milestone verification by NGO, Donor & Auditor
                      </p>
                    </div>

                    <Button 
                      variant="donor" 
                      size="xl" 
                      className="w-full"
                      onClick={handleDonate}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay with Stripe
                    </Button>
                  </div>
                ) : (
                  <div className="text-center animate-fade-up">
                    <div className="w-20 h-20 rounded-full bg-donor/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-10 h-10 text-donor" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Funds Locked in Escrow! 🔒</h3>
                    <p className="text-muted-foreground mb-4">
                      Your donation has been secured in a Polygon smart contract.
                    </p>
                    <div className="p-3 rounded-xl bg-muted/30 text-sm">
                      <p className="text-muted-foreground">Transaction Hash:</p>
                      <p className="font-mono text-donor">0x7a8f3b...9c2e4d</p>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-public/10 border border-public/30">
                      <p className="text-sm text-public">
                        IPFS Metadata: <span className="font-mono">QmT5xR...7nKp</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "verify" && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Proof Documents Awaiting Your Approval</h2>
                <p className="text-muted-foreground mb-6">
                  Review vendor-submitted invoices and receipts stored on IPFS before approving payment release.
                </p>

                <div className="space-y-4">
                  {pendingProofs.map((proof) => (
                    <div 
                      key={proof.id}
                      className="p-4 rounded-xl border border-vendor/30 bg-vendor/5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{proof.milestone}</h3>
                          <p className="text-sm text-muted-foreground">{proof.scheme} • {proof.vendor}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-vendor/10 text-vendor">
                          Awaiting Review
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                          <p className="text-xs text-muted-foreground mb-1">Invoice CID</p>
                          <p className="font-mono text-sm text-donor">{proof.invoiceCID}</p>
                        </button>
                        <button className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                          <p className="text-xs text-muted-foreground mb-1">Receipt CID</p>
                          <p className="font-mono text-sm text-donor">{proof.receiptCID}</p>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="public" className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Flag Suspicious
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <VerificationModal 
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        transaction={selectedTx ? {
          txHash: selectedTx.txHash,
          blockNumber: 45782134,
          status: "confirmed",
          amount: selectedTx.amount,
          from: "0x742d...3f89",
          to: "0x9a2c...8d71",
          timestamp: `${selectedTx.date} 14:32:45 UTC`,
        } : undefined}
      />
    </div>
  );
}

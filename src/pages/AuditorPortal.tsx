import { useState } from "react";
import { Eye, AlertTriangle, CheckCircle, FileText, DollarSign, Shield, Search, Download, Ban, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import auditorImage from "@/assets/auditor-fraud-detection.png";
import auditorBanner from "@/assets/auditor-banner.png";

const stats = [
  { title: "Transactions Audited", value: 8934, icon: FileText, variant: "auditor" as const },
  { title: "Fraud Alerts", value: 12, icon: AlertTriangle, variant: "default" as const },
  { title: "Verified Payments", value: 7856, icon: CheckCircle, variant: "public" as const },
  { title: "Total Value Audited", value: 234000000, icon: DollarSign, prefix: "₹", variant: "auditor" as const },
];

const transactions = [
  { 
    id: "TXN-001", 
    scheme: "Mid-Day Meal Program", 
    vendor: "FoodCare Ltd", 
    amount: "₹4,50,000", 
    date: "Jan 26, 2026",
    invoiceCID: "QmX7gH...8fKj",
    receiptCID: "QmY9tR...2nLp",
    status: "verified",
    flags: []
  },
  { 
    id: "TXN-002", 
    scheme: "School Uniform Distribution", 
    vendor: "TextilePro Ltd", 
    amount: "₹3,20,000", 
    date: "Jan 25, 2026",
    invoiceCID: "QmZ3wE...5mNq",
    receiptCID: "QmA6kS...9pRt",
    status: "pending",
    flags: []
  },
  { 
    id: "TXN-003", 
    scheme: "Healthcare Equipment", 
    vendor: "MediSupply Co", 
    amount: "₹12,80,000", 
    date: "Jan 24, 2026",
    invoiceCID: "QmB4xF...1oUv",
    receiptCID: "QmC8yG...3qWx",
    status: "flagged",
    flags: ["Duplicate Invoice Detected", "Amount Mismatch"]
  },
  { 
    id: "TXN-004", 
    scheme: "Water Purifier Installation", 
    vendor: "AquaPure Systems", 
    amount: "₹8,95,000", 
    date: "Jan 23, 2026",
    invoiceCID: "QmD5zH...7rYz",
    receiptCID: "QmE9aJ...4sAb",
    status: "verified",
    flags: []
  },
];

const blacklistedVendors = [
  { name: "FakeSupplies Inc", reason: "Fraudulent invoices", date: "Dec 15, 2025" },
  { name: "GhostVendor LLC", reason: "Non-existent company", date: "Nov 28, 2025" },
];

export default function AuditorPortal() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "ledger" | "blacklist">("dashboard");
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${auditorImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Image Banner */}
          <div className="mb-8 animate-fade-in">
            <img
              src={auditorBanner}
              alt="Auditor Watchdog System"
              className="w-full max-h-[300px] object-cover rounded-2xl border border-auditor/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_hsl(var(--auditor)/0.3)]"
            />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-auditor/10 border border-auditor/30 animate-pulse-glow">
              <Eye className="w-8 h-8 text-auditor" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Auditor Portal</h1>
              <p className="text-muted-foreground">Watchdog System – Fraud Detection & Compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      <div className="container mx-auto px-4 mb-6">
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
          <div>
            <p className="text-sm font-medium text-destructive">Fraud Alert: 2 suspicious transactions detected</p>
            <p className="text-xs text-muted-foreground">TXN-003 flagged for duplicate invoice</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto border-destructive/50 text-destructive hover:bg-destructive/10">
            Review Now
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex gap-2 p-1 bg-card rounded-xl border border-border w-fit">
          {[
            { id: "dashboard", label: "Dashboard", icon: Shield },
            { id: "ledger", label: "Transaction Ledger", icon: FileText },
            { id: "blacklist", label: "Vendor Blacklist", icon: Ban },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-auditor text-auditor-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {activeTab === "dashboard" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <StatsCard key={stat.title} {...stat} delay={i * 100} />
              ))}
            </div>

            {/* Verification Panel */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Compliance Status</h2>
                <div className="space-y-3">
                  {[
                    { label: "Blockchain Transactions", status: "verified", count: "8,934" },
                    { label: "Invoice Verification", status: "verified", count: "7,856" },
                    { label: "Receipt Matching", status: "verified", count: "7,802" },
                    { label: "Fraud Detection", status: "alert", count: "12 flags" },
                  ].map((item) => (
                    <div 
                      key={item.label}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border",
                        item.status === "verified" 
                          ? "bg-public/5 border-public/30" 
                          : "bg-destructive/5 border-destructive/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {item.status === "verified" ? (
                          <CheckCircle className="w-5 h-5 text-public" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        )}
                        <span className="text-foreground">{item.label}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        item.status === "verified" ? "text-public" : "text-destructive"
                      )}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Recent Flags</h2>
                <div className="space-y-3">
                  {[
                    { type: "Duplicate Invoice", txn: "TXN-003", vendor: "MediSupply Co", severity: "high" },
                    { type: "Amount Mismatch", txn: "TXN-003", vendor: "MediSupply Co", severity: "high" },
                    { type: "Late Submission", txn: "TXN-018", vendor: "BuildRight Ltd", severity: "low" },
                  ].map((flag, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "p-3 rounded-xl border",
                        flag.severity === "high" 
                          ? "bg-destructive/5 border-destructive/30" 
                          : "bg-government/5 border-government/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-sm font-medium",
                          flag.severity === "high" ? "text-destructive" : "text-government"
                        )}>
                          {flag.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{flag.txn}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Vendor: {flag.vendor}</p>
                    </div>
                  ))}
                </div>
                <Button variant="auditor" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Export Compliance Report
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === "ledger" && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search transactions, vendors, schemes..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-auditor/50"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Scheme</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Vendor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">IPFS Proof</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-foreground">{tx.id}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{tx.scheme}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{tx.vendor}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{tx.amount}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          tx.status === "verified" && "bg-public/10 text-public",
                          tx.status === "pending" && "bg-government/10 text-government",
                          tx.status === "flagged" && "bg-destructive/10 text-destructive"
                        )}>
                          {tx.status === "flagged" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-xs text-auditor hover:underline flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Invoice
                          </button>
                          <button className="text-xs text-auditor hover:underline flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Receipt
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="public" className="text-xs py-1 h-7">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs py-1 h-7 border-destructive/50 text-destructive hover:bg-destructive/10">
                              Flag
                            </Button>
                          </div>
                        )}
                        {tx.status === "flagged" && (
                          <Button size="sm" variant="outline" className="text-xs py-1 h-7">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Investigate
                          </Button>
                        )}
                        {tx.status === "verified" && (
                          <span className="text-xs text-public flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Audited
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "blacklist" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl border border-destructive/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Ban className="w-6 h-6 text-destructive" />
                <h2 className="text-xl font-bold text-foreground">Blacklisted Vendors</h2>
              </div>
              
              <div className="space-y-4">
                {blacklistedVendors.map((vendor, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{vendor.name}</h3>
                        <p className="text-sm text-muted-foreground">{vendor.reason}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{vendor.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
                <h3 className="font-medium text-foreground mb-3">Add to Blacklist</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Vendor name"
                    className="flex-1 px-4 py-2 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-auditor/50"
                  />
                  <Button variant="destructive">
                    <Ban className="w-4 h-4 mr-2" />
                    Blacklist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

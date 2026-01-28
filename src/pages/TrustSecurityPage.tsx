import { Shield, Lock, FileCheck, Eye, Fingerprint, Globe, CheckCircle, Server, Database, Key } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const securityFeatures = [
  {
    icon: Shield,
    title: "Polygon Smart Contract Escrow",
    description: "All donations are held in audited smart contracts on the Polygon blockchain. Funds are only released when milestone conditions are verified.",
    status: "Active",
    color: "donor",
  },
  {
    icon: Database,
    title: "IPFS Proof Storage",
    description: "All proof documents, invoices, and reports are stored permanently on IPFS, ensuring tamper-proof evidence of completed work.",
    status: "Verified",
    color: "vendor",
  },
  {
    icon: Fingerprint,
    title: "KYC Vendor Verification",
    description: "All vendors undergo thorough KYC verification before being approved. Identity and business credentials are validated on-chain.",
    status: "Enabled",
    color: "ngo",
  },
  {
    icon: Eye,
    title: "Immutable Audit Trail",
    description: "Every transaction, approval, and fund movement is permanently recorded on the blockchain, creating an unalterable audit history.",
    status: "Guaranteed",
    color: "public",
  },
];

const technicalSpecs = [
  { label: "Blockchain Network", value: "Polygon (MATIC)" },
  { label: "Smart Contract Standard", value: "ERC-20 Compatible" },
  { label: "Consensus Mechanism", value: "Proof of Stake (PoS)" },
  { label: "Storage Layer", value: "IPFS / Filecoin" },
  { label: "Transaction Finality", value: "~2 seconds" },
  { label: "Gas Fees", value: "< $0.01 average" },
];

const auditStatus = [
  { title: "Smart Contract Audit", status: "Completed", auditor: "CertiK", date: "Jan 2024" },
  { title: "Security Penetration Test", status: "Passed", auditor: "HackerOne", date: "Dec 2023" },
  { title: "Code Review", status: "Verified", auditor: "OpenZeppelin", date: "Nov 2023" },
];

export default function TrustSecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16 relative">
            {/* Animated Shield */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-donor via-ngo to-public rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-card border-2 border-primary/30 flex items-center justify-center animate-pulse-glow">
                <Shield className="w-16 h-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Trust & <span className="text-gradient-multi">Security</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade blockchain security ensuring complete transparency and immutability of all fund movements
            </p>
          </div>

          {/* Security Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {securityFeatures.map((feature, i) => (
              <div 
                key={feature.title}
                className={cn(
                  "p-8 rounded-3xl border-2 transition-all duration-500 group card-hover",
                  feature.color === "donor" && "bg-donor/5 border-donor/20 hover:border-donor/50 hover:shadow-glow-donor",
                  feature.color === "vendor" && "bg-vendor/5 border-vendor/20 hover:border-vendor/50 hover:shadow-glow-vendor",
                  feature.color === "ngo" && "bg-ngo/5 border-ngo/20 hover:border-ngo/50 hover:shadow-glow-ngo",
                  feature.color === "public" && "bg-public/5 border-public/20 hover:border-public/50 hover:shadow-glow-public"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-4 rounded-2xl transition-transform group-hover:scale-110",
                    feature.color === "donor" && "bg-donor/10",
                    feature.color === "vendor" && "bg-vendor/10",
                    feature.color === "ngo" && "bg-ngo/10",
                    feature.color === "public" && "bg-public/10"
                  )}>
                    <feature.icon className={cn(
                      "w-8 h-8",
                      feature.color === "donor" && "text-donor",
                      feature.color === "vendor" && "text-vendor",
                      feature.color === "ngo" && "text-ngo",
                      feature.color === "public" && "text-public"
                    )} />
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold verified-pulse",
                    feature.color === "donor" && "bg-donor/20 text-donor",
                    feature.color === "vendor" && "bg-vendor/20 text-vendor",
                    feature.color === "ngo" && "bg-ngo/20 text-ngo",
                    feature.color === "public" && "bg-public/20 text-public"
                  )}>
                    ✓ {feature.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Technical Specifications */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-3xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-6">
                <Server className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Technical Specifications</h2>
              </div>
              <div className="space-y-4">
                {technicalSpecs.map((spec) => (
                  <div key={spec.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{spec.label}</span>
                    <span className="font-mono text-sm text-foreground bg-muted/50 px-3 py-1 rounded-lg">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-public" />
                <h2 className="text-xl font-bold text-foreground">Audit Status</h2>
              </div>
              <div className="space-y-4">
                {auditStatus.map((audit) => (
                  <div key={audit.title} className="p-4 rounded-xl bg-public/5 border border-public/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{audit.title}</h3>
                      <span className="text-xs font-medium text-public bg-public/10 px-2 py-1 rounded-full">
                        ✓ {audit.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>By: {audit.auditor}</span>
                      <span>•</span>
                      <span>{audit.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-card via-muted/30 to-card border border-border">
            <Key className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Verify Our Smart Contracts</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              All our smart contracts are open source and verified on PolygonScan for complete transparency
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="default" size="lg">
                View on PolygonScan
              </Button>
              <Button variant="outline" size="lg">
                GitHub Repository
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

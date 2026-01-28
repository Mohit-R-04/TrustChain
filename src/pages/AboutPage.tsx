import { Shield, Lock, FileText, Users, CheckCircle, Target, Globe, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const features = [
  { icon: Lock, title: "Escrow Smart Contracts", description: "Funds are locked until milestone verification ensures proper utilization." },
  { icon: FileText, title: "IPFS Proof Storage", description: "All invoices, receipts, and work reports stored immutably on decentralized storage." },
  { icon: Shield, title: "Multi-Party Approval", description: "NGO, Donor, and Auditor must all approve before payment release." },
  { icon: Users, title: "Citizen Governance", description: "Bottom-up needs posting enables community-driven welfare prioritization." },
];

const principles = [
  { icon: Target, title: "Transparency First", description: "Every transaction is publicly auditable on the blockchain." },
  { icon: Globe, title: "Decentralized Trust", description: "No single point of failure or corruption possible." },
  { icon: Zap, title: "Instant Verification", description: "Real-time proof verification through IPFS hashes." },
  { icon: CheckCircle, title: "Accountability", description: "Complete audit trail from donation to delivery." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ngo/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About TrustChain</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Our Mission: <span className="text-gradient-primary">Corruption-Free Governance</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              TrustChain is a blockchain-powered platform ensuring complete transparency in NGO welfare fund management. 
              Every rupee is tracked, verified, and released only after proven milestone completion.
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">Powered by Polygon + IPFS</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div 
                  key={feature.title}
                  className="bg-card rounded-2xl border border-border p-6 card-hover"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust by Design */}
          <div className="bg-card rounded-3xl border border-border p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
              Trust-by-Design Architecture
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              TrustChain is built from the ground up with immutability, accountability, and transparency as core principles.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {principles.map((principle, i) => (
                <div 
                  key={principle.title}
                  className="text-center"
                >
                  <div className="p-4 rounded-full bg-public/10 w-fit mx-auto mb-4">
                    <principle.icon className="w-8 h-8 text-public" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Escrow Model */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-6">Milestone Escrow Governance Model</h2>
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: 1, label: "Donate", color: "donor" },
                  { step: 2, label: "Lock", color: "government" },
                  { step: 3, label: "Work", color: "vendor" },
                  { step: 4, label: "Verify", color: "auditor" },
                  { step: 5, label: "Release", color: "public" },
                ].map((item, i) => (
                  <div key={item.step} className="relative">
                    <div className={`w-12 h-12 rounded-full bg-${item.color}/20 border-2 border-${item.color} flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-lg font-bold text-${item.color}`}>{item.step}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {i < 4 && (
                      <div className="absolute top-6 left-[60%] w-[80%] h-0.5 bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

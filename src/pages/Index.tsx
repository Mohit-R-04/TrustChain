import { Link } from "react-router-dom";
import { ArrowRight, Shield, Lock, DollarSign, FolderOpen, CheckCircle, Users, TrendingUp, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { StatsCard } from "@/components/StatsCard";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustBadges } from "@/components/TrustBadges";
import { Footer } from "@/components/Footer";
import heroEscrowBanner from "@/assets/hero-escrow-banner.png";
import donationFlowBanner from "@/assets/donation-flow-banner.png";

const stats = [
  { title: "Funds in Escrow", value: 23000000, icon: Lock, prefix: "₹", suffix: "", variant: "donor" as const, delay: 0 },
  { title: "Active Schemes", value: 156, icon: Building2, variant: "government" as const, delay: 100 },
  { title: "Verified NGOs & Vendors", value: 428, icon: Users, variant: "ngo" as const, delay: 200 },
  { title: "IPFS Documents", value: 12847, icon: FileText, variant: "vendor" as const, delay: 300 },
  { title: "Transparent Payments", value: 8934, icon: TrendingUp, variant: "public" as const, delay: 400 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroEscrowBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-donor/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-government/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-auditor/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Polygon + IPFS Powered Governance</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              TrustChain – <span className="text-gradient-primary">Governance for the Future</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Donations are locked in escrow smart contracts and released only after milestone proof verification through Polygon blockchain + IPFS storage.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <Button variant="hero" size="xl" asChild>
                <Link to="/public">
                  Explore Transparency Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="donor" size="lg" asChild>
                <Link to="/donor">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Donate via Stripe
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="government" size="lg" asChild>
                <Link to="/government">
                  <Building2 className="w-4 h-4 mr-2" />
                  Government Portal
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/community-needs">
                  <Users className="w-4 h-4 mr-2" />
                  Community Needs Feed
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-20">
            {stats.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Donation Flow Banner */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="animate-fade-in">
            <img
              src={donationFlowBanner}
              alt="Donation Flow - Government, Donors, Vendors, Citizens"
              className="w-full max-h-[300px] object-cover rounded-2xl border border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)]"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Trust Badges */}
      <TrustBadges />

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready for <span className="text-gradient-multi">Corruption-Free Governance?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the movement for accountable, blockchain-verified welfare fund management
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="donor" size="lg" asChild>
                <Link to="/donor">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Start as Donor
                </Link>
              </Button>
              <Button variant="government" size="lg" asChild>
                <Link to="/government">
                  <Building2 className="w-5 h-5 mr-2" />
                  Government Portal
                </Link>
              </Button>
              <Button variant="ngo" size="lg" asChild>
                <Link to="/ngo-admin">
                  <Shield className="w-5 h-5 mr-2" />
                  Register NGO
                </Link>
              </Button>
              <Button variant="vendor" size="lg" asChild>
                <Link to="/vendor">
                  <Users className="w-5 h-5 mr-2" />
                  Join as Vendor
                </Link>
              </Button>
              <Button variant="auditor" size="lg" asChild>
                <Link to="/auditor">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Auditor Access
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

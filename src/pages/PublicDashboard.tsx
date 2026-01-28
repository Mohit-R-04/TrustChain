import { useState } from "react";
import { Globe, DollarSign, FolderOpen, CheckCircle, TrendingUp, Search, Filter, Shield, Lock, Eye } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { ProjectCard } from "@/components/ProjectCard";
import { FundUtilizationChart, CategoryDistributionChart } from "@/components/Charts";
import { VerificationModal } from "@/components/VerificationModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const publicStats = [
  { title: "Total Funds", value: 23500000, icon: DollarSign, prefix: "₹", variant: "public" as const, delay: 0 },
  { title: "Projects", value: 47, icon: FolderOpen, variant: "ngo" as const, delay: 100 },
  { title: "Transactions Verified", value: 2847, icon: CheckCircle, variant: "donor" as const, delay: 200 },
  { title: "Utilization Rate", value: 82, icon: TrendingUp, suffix: "%", variant: "vendor" as const, delay: 300 },
];

const auditCards = [
  { icon: Shield, title: "Immutable Records", description: "All transactions permanently stored on blockchain", color: "public" },
  { icon: Lock, title: "Smart Contract Enforced", description: "Automated milestone-based fund release", color: "donor" },
  { icon: Eye, title: "Publicly Auditable", description: "Complete transparency for all stakeholders", color: "ngo" },
];

const projects = [
  { id: 1, name: "Clean Water Initiative", category: "Water", location: "Maharashtra", progress: 75, amount: "₹12,50,000", beneficiaries: 5000, status: "active" as const },
  { id: 2, name: "Rural Education Program", category: "Education", location: "Bihar", progress: 45, amount: "₹8,00,000", beneficiaries: 2500, status: "active" as const },
  { id: 3, name: "Health Camp Network", category: "Health", location: "Rajasthan", progress: 90, amount: "₹6,50,000", beneficiaries: 8000, status: "active" as const },
  { id: 4, name: "Solar Village Project", category: "Infrastructure", location: "Gujarat", progress: 30, amount: "₹15,00,000", beneficiaries: 3000, status: "active" as const },
  { id: 5, name: "Women Empowerment", category: "Education", location: "Uttar Pradesh", progress: 65, amount: "₹4,20,000", beneficiaries: 1500, status: "active" as const },
  { id: 6, name: "Tribal Healthcare", category: "Health", location: "Jharkhand", progress: 55, amount: "₹9,80,000", beneficiaries: 6000, status: "active" as const },
];

const categories = ["All", "Water", "Education", "Health", "Infrastructure"];

export default function PublicDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showVerification, setShowVerification] = useState(false);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-public/10 border border-public/30 mb-6">
              <Globe className="w-4 h-4 text-public" />
              <span className="text-sm font-medium text-public">Public Access - No Login Required</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Every Transaction. <span className="text-gradient-multi">Fully Transparent.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Verify NGO fund utilization in real-time. All data is stored immutably on the blockchain.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {publicStats.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Audit Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {auditCards.map((card) => (
              <div 
                key={card.title}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer card-hover",
                  card.color === "public" && "bg-public/5 border-public/20 hover:border-public/50",
                  card.color === "donor" && "bg-donor/5 border-donor/20 hover:border-donor/50",
                  card.color === "ngo" && "bg-ngo/5 border-ngo/20 hover:border-ngo/50"
                )}
              >
                <card.icon className={cn(
                  "w-8 h-8 mb-4",
                  card.color === "public" && "text-public",
                  card.color === "donor" && "text-donor",
                  card.color === "ngo" && "text-ngo"
                )} />
                <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            <FundUtilizationChart />
            <CategoryDistributionChart />
          </div>

          {/* Project Explorer */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Public Project Explorer</h2>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  variant="public"
                  onViewDetails={() => setShowVerification(true)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <VerificationModal 
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
      />
    </div>
  );
}

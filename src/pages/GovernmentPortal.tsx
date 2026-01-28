import { useState } from "react";
import { Building2, DollarSign, Users, FileText, Upload, CheckCircle, TrendingUp, MapPin, Calendar, Target } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import governmentSchemesImage from "@/assets/government-schemes.png";
import governmentBanner from "@/assets/government-banner.png";

const stats = [
  { title: "Total Schemes", value: 156, icon: FileText, variant: "government" as const },
  { title: "Budget Allocated", value: 450000000, icon: DollarSign, prefix: "₹", variant: "government" as const },
  { title: "Active NGOs", value: 89, icon: Users, variant: "ngo" as const },
  { title: "Compliance Reports", value: 342, icon: CheckCircle, variant: "auditor" as const },
];

const schemes = [
  { id: 1, title: "Mid-Day Meal Program", category: "Food", budget: "₹45L", region: "Karnataka", beneficiaries: 12500, status: "active" },
  { id: 2, title: "Rural Healthcare Initiative", category: "Healthcare", budget: "₹1.2Cr", region: "Maharashtra", beneficiaries: 8900, status: "active" },
  { id: 3, title: "Digital Education Drive", category: "Education", budget: "₹78L", region: "Tamil Nadu", beneficiaries: 5600, status: "pending" },
  { id: 4, title: "Clean Water Project", category: "Water", budget: "₹95L", region: "Rajasthan", beneficiaries: 15000, status: "active" },
];

const categories = ["Food", "Healthcare", "Education", "Water", "Transport", "Housing"];

export default function GovernmentPortal() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "create" | "donate">("dashboard");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    budget: "",
    region: "",
    beneficiaries: "",
    milestones: "",
    deadline: "",
    description: "",
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${governmentSchemesImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Image Banner */}
          <div className="mb-8 animate-fade-in">
            <img
              src={governmentBanner}
              alt="Government Scheme Upload"
              className="w-full max-h-[300px] object-cover rounded-2xl border border-government/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_hsl(var(--government)/0.3)]"
            />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-government/10 border border-government/30">
              <Building2 className="w-8 h-8 text-government" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Government Portal</h1>
              <p className="text-muted-foreground">Publish schemes & allocate budgets on blockchain</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex gap-2 p-1 bg-card rounded-xl border border-border w-fit">
          {[
            { id: "dashboard", label: "Dashboard", icon: TrendingUp },
            { id: "create", label: "Create Scheme", icon: Upload },
            { id: "donate", label: "Government Donation", icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-government text-government-foreground"
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

            {/* Active Schemes */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Active Welfare Schemes</h2>
              <div className="space-y-4">
                {schemes.map((scheme) => (
                  <div 
                    key={scheme.id}
                    className="p-4 rounded-xl border border-border bg-muted/20 hover:border-government/30 transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{scheme.title}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            scheme.status === "active" 
                              ? "bg-public/10 text-public" 
                              : "bg-government/10 text-government"
                          )}>
                            {scheme.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {scheme.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {scheme.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {scheme.beneficiaries.toLocaleString()} beneficiaries
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-government">{scheme.budget}</p>
                        <p className="text-xs text-muted-foreground">Budget</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "create" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Publish New Welfare Scheme</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Scheme Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Rural Healthcare Initiative"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Budget Allocation (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g., 5000000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Region/District</label>
                  <input
                    type="text"
                    placeholder="e.g., Karnataka"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Expected Beneficiaries</label>
                  <input
                    type="number"
                    placeholder="e.g., 10000"
                    value={formData.beneficiaries}
                    onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Number of Milestones</label>
                  <input
                    type="number"
                    placeholder="e.g., 4"
                    value={formData.milestones}
                    onChange={(e) => setFormData({ ...formData, milestones: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    placeholder="Describe the scheme objectives and expected outcomes..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  variant="government" 
                  size="xl" 
                  className="w-full"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-government-foreground/30 border-t-government-foreground rounded-full animate-spin" />
                      Publishing to Blockchain...
                    </div>
                  ) : publishSuccess ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Scheme Published On-Chain!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Publish Scheme On-Chain
                    </div>
                  )}
                </Button>
              </div>

              {publishSuccess && (
                <div className="mt-4 p-4 rounded-xl bg-public/10 border border-public/30 animate-fade-up">
                  <div className="flex items-center gap-2 text-public mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Successfully Published!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Transaction Hash: <code className="text-public font-mono">0x7a8f...3b2c</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "donate" && (
          <div className="max-w-xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Government Contribution</h2>
              <p className="text-muted-foreground mb-6">
                Government bodies can contribute to existing welfare schemes just like donors.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Scheme</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-government/50">
                    <option value="">Choose a scheme to fund</option>
                    {schemes.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Contribution Amount (₹)</label>
                  <input
                    type="text"
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-government/50"
                  />
                </div>

                <Button variant="government" size="lg" className="w-full mt-4">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Fund Scheme via Escrow
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Users, Search, Filter, Shield, Star, Briefcase, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VendorCard } from "@/components/VendorCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const vendors = [
  { id: 1, name: "AquaTech Solutions", category: "Water Infrastructure", rating: 4.9, completedProjects: 45, kycVerified: true, location: "Mumbai, Maharashtra" },
  { id: 2, name: "BuildRight Constructions", category: "Construction", rating: 4.7, completedProjects: 32, kycVerified: true, location: "Delhi, NCR" },
  { id: 3, name: "GreenEnergy Corp", category: "Solar & Renewable", rating: 4.8, completedProjects: 28, kycVerified: true, location: "Ahmedabad, Gujarat" },
  { id: 4, name: "HealthFirst Suppliers", category: "Medical Equipment", rating: 4.6, completedProjects: 51, kycVerified: true, location: "Chennai, Tamil Nadu" },
  { id: 5, name: "EduTech Systems", category: "Education Tech", rating: 4.5, completedProjects: 19, kycVerified: true, location: "Bangalore, Karnataka" },
  { id: 6, name: "Rural Connect", category: "Infrastructure", rating: 4.7, completedProjects: 37, kycVerified: true, location: "Jaipur, Rajasthan" },
  { id: 7, name: "Clean Solutions", category: "Sanitation", rating: 4.8, completedProjects: 24, kycVerified: true, location: "Lucknow, UP" },
  { id: 8, name: "AgriTech India", category: "Agriculture", rating: 4.4, completedProjects: 15, kycVerified: false, location: "Pune, Maharashtra" },
];

const categories = ["All", "Water Infrastructure", "Construction", "Solar & Renewable", "Medical Equipment", "Education Tech", "Infrastructure", "Sanitation", "Agriculture"];

export default function VendorMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || v.category === selectedCategory;
    const matchesVerified = !showVerifiedOnly || v.kycVerified;
    return matchesSearch && matchesCategory && matchesVerified;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-vendor/10">
              <Users className="w-8 h-8 text-vendor" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Verified Vendor Marketplace</h1>
              <p className="text-muted-foreground">KYC verified vendors for transparent project execution</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-2xl font-bold text-foreground">{vendors.length}</p>
              <p className="text-sm text-muted-foreground">Total Vendors</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-2xl font-bold text-public">{vendors.filter(v => v.kycVerified).length}</p>
              <p className="text-sm text-muted-foreground">KYC Verified</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-2xl font-bold text-vendor">{vendors.reduce((acc, v) => acc + v.completedProjects, 0)}</p>
              <p className="text-sm text-muted-foreground">Projects Completed</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-2xl font-bold text-chart-5">{(vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length).toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vendors by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-vendor/50"
              />
            </div>

            {/* KYC Filter */}
            <button
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                showVerifiedOnly 
                  ? "bg-public/10 border-public/30 text-public"
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              <Shield className="w-4 h-4" />
              KYC Verified Only
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  selectedCategory === cat
                    ? "bg-vendor text-vendor-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Vendors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredVendors.map((vendor) => (
              <VendorCard 
                key={vendor.id} 
                vendor={vendor}
                onSelect={() => console.log("View vendor:", vendor.id)}
              />
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No vendors found matching your criteria</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

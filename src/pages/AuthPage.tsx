import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Users, DollarSign, Building2, Briefcase, Eye, Heart, Upload, ArrowRight, Lock, Mail, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import trustchainLogo from "@/assets/trustchain-logo.png";

type RoleType = "citizen" | "donor" | "government" | "ngo" | "vendor" | "auditor" | null;

const roles = [
  { id: "citizen" as const, name: "Citizen", icon: Heart, color: "citizen", description: "Track deliveries & give feedback", optional: true },
  { id: "donor" as const, name: "Donor", icon: DollarSign, color: "donor", description: "Donate & verify fund usage" },
  { id: "government" as const, name: "Government", icon: Building2, color: "government", description: "Create schemes & allocate budgets" },
  { id: "ngo" as const, name: "NGO", icon: Shield, color: "ngo", description: "Implement schemes & manage vendors" },
  { id: "vendor" as const, name: "Vendor", icon: Briefcase, color: "vendor", description: "Execute work & submit proofs" },
  { id: "auditor" as const, name: "Auditor", icon: Eye, color: "auditor", description: "Verify compliance & detect fraud" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    // NGO specific
    gstNumber: "",
    registrationCert: null as File | null,
    // Vendor specific
    vendorType: "",
    licenseId: "",
    expertiseCategory: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/register and redirect
    const routes: Record<string, string> = {
      citizen: "/citizen",
      donor: "/donor",
      government: "/government",
      ngo: "/ngo-admin",
      vendor: "/vendor",
      auditor: "/auditor",
    };
    if (selectedRole) {
      navigate(routes[selectedRole]);
    }
  };

  const renderForm = () => {
    if (!selectedRole) return null;

    const roleConfig = roles.find(r => r.id === selectedRole);
    if (!roleConfig) return null;

    return (
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className={cn("p-3 rounded-xl", `bg-${roleConfig.color}/10`)}>
              <roleConfig.icon className={cn("w-6 h-6", `text-${roleConfig.color}`)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {authMode === "login" ? "Login" : "Register"} as {roleConfig.name}
              </h2>
              <p className="text-sm text-muted-foreground">{roleConfig.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {selectedRole === "government" || selectedRole === "auditor" ? "Official Email" : "Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* NGO-specific fields */}
            {selectedRole === "ngo" && authMode === "register" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ngo/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Registration Certificate</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-ngo/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload NGO registration document</p>
                    <input type="file" className="hidden" />
                  </div>
                </div>
              </>
            )}

            {/* Vendor-specific fields */}
            {selectedRole === "vendor" && authMode === "register" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Vendor Type</label>
                  <select
                    value={formData.vendorType}
                    onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-vendor/50"
                  >
                    <option value="">Select type</option>
                    <option value="food">Food Distributor</option>
                    <option value="healthcare">Healthcare Supplier</option>
                    <option value="construction">Construction Partner</option>
                    <option value="transport">Transport Vendor</option>
                    <option value="education">Education Services</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">License ID</label>
                  <input
                    type="text"
                    value={formData.licenseId}
                    onChange={(e) => setFormData({ ...formData, licenseId: e.target.value })}
                    placeholder="Your business license number"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-vendor/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Expertise Category</label>
                  <select
                    value={formData.expertiseCategory}
                    onChange={(e) => setFormData({ ...formData, expertiseCategory: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-vendor/50"
                  >
                    <option value="">Select expertise</option>
                    <option value="supply">Supply Chain</option>
                    <option value="logistics">Logistics</option>
                    <option value="installation">Installation</option>
                    <option value="manufacturing">Manufacturing</option>
                  </select>
                </div>
              </>
            )}

            {/* 2FA Badge for Government/Auditor */}
            {(selectedRole === "government" || selectedRole === "auditor") && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-auditor/10 border border-auditor/30">
                <Shield className="w-4 h-4 text-auditor" />
                <span className="text-sm text-auditor">2FA Security (Coming Soon)</span>
              </div>
            )}

            <Button 
              type="submit"
              variant={selectedRole as any}
              size="lg" 
              className="w-full mt-6"
            >
              {authMode === "login" ? "Login" : "Register"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {authMode === "login" 
                ? "Don't have an account? Register" 
                : "Already have an account? Login"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Choose different role
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-donor/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          {!selectedRole ? (
            <div className="max-w-4xl mx-auto text-center">
              <img src={trustchainLogo} alt="TrustChain" className="w-20 h-20 mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Access Your <span className="text-gradient-primary">TrustChain Portal</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-12">
                Select your role to login or register
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "p-6 rounded-2xl border text-left transition-all card-hover",
                      "bg-card hover:border-primary/50",
                      `hover:shadow-[0_0_30px_rgba(var(--${role.color}),0.2)]`
                    )}
                  >
                    <div className={cn("p-3 rounded-xl w-fit mb-4", `bg-${role.color}/10`)}>
                      <role.icon className={cn("w-6 h-6", `text-${role.color}`)} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {role.name} {role.optional && <span className="text-xs text-muted-foreground">(Optional)</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            renderForm()
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

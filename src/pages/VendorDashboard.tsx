import { useState } from "react";
import { Users, DollarSign, CheckCircle, Star, Clock, Upload, FileCheck, AlertCircle, Package, Truck, Stethoscope, Utensils } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { UploadModal } from "@/components/UploadModal";
import { SmartContractWidget } from "@/components/SmartContractWidget";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ipfsProofImage from "@/assets/ipfs-proof-storage.png";

const vendorStats = [
  { title: "Active Milestones", value: 5, icon: Clock, variant: "vendor" as const, delay: 0 },
  { title: "Completed", value: 23, icon: CheckCircle, variant: "public" as const, delay: 100 },
  { title: "Total Earned", value: 1850000, icon: DollarSign, prefix: "₹", variant: "donor" as const, delay: 200 },
  { title: "Average Rating", value: 4.8, icon: Star, variant: "government" as const, delay: 300 },
];

const vendorTypes = [
  { id: "healthcare", label: "Healthcare Supplier", icon: Stethoscope, color: "ngo" },
  { id: "food", label: "Food Distributor", icon: Utensils, color: "government" },
  { id: "construction", label: "Construction Partner", icon: Package, color: "vendor" },
  { id: "transport", label: "Transport Vendor", icon: Truck, color: "donor" },
];

const workSteps = [
  { id: 1, title: "Accept Assignment", description: "Review scheme requirements and accept or reject the assignment", icon: CheckCircle, status: "done" },
  { id: 2, title: "Submit Quotation", description: "Provide competitive quote based on quality scoring", icon: FileCheck, status: "done" },
  { id: 3, title: "Execute Milestone", description: "Complete the assigned work according to specifications", icon: Package, status: "current" },
  { id: 4, title: "Upload Proof Bundle", description: "Invoice, receipt, photos & completion report → IPFS", icon: Upload, status: "pending" },
  { id: 5, title: "Multi-Party Approval", description: "NGO + Donor + Auditor review and approve", icon: Users, status: "pending" },
  { id: 6, title: "Auto Payment", description: "Smart contract releases escrow funds automatically", icon: DollarSign, status: "pending" },
];

const assignedWork = [
  { id: 1, title: "Mid-Day Meal Delivery - Phase 2", scheme: "Mid-Day Meal Program", status: "in-progress" as const, amount: "₹75,000", dueDate: "Jan 30, 2026" },
  { id: 2, title: "Medical Equipment Setup", scheme: "Rural Healthcare Initiative", status: "awaiting-approval" as const, amount: "₹1,45,000", dueDate: "Jan 28, 2026" },
  { id: 3, title: "School Uniform Supply", scheme: "Education Support Scheme", status: "in-progress" as const, amount: "₹1,20,000", dueDate: "Feb 5, 2026" },
  { id: 4, title: "Water Purifier Installation", scheme: "Clean Water Project", status: "pending" as const, amount: "₹3,00,000", dueDate: "Feb 15, 2026" },
  { id: 5, title: "Ration Kit Distribution", scheme: "Food Security Scheme", status: "completed" as const, amount: "₹95,000", dueDate: "Jan 20, 2026" },
];

export default function VendorDashboard() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"work" | "quotation">("work");

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed": return "bg-public/10 text-public border-public/30";
      case "in-progress": return "bg-ngo/10 text-ngo border-ngo/30";
      case "awaiting-approval": return "bg-vendor/10 text-vendor border-vendor/30";
      default: return "bg-muted/30 text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "✓ Completed";
      case "in-progress": return "In Progress";
      case "awaiting-approval": return "⏳ Awaiting Approval";
      default: return "Pending";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-vendor/10">
              <Users className="w-8 h-8 text-vendor" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Vendor Portal</h1>
              <p className="text-muted-foreground">Complete milestones & upload proof to IPFS</p>
            </div>
          </div>

          {/* Vendor Types */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {vendorTypes.map((type) => (
              <div 
                key={type.id}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all cursor-pointer hover:scale-105",
                  `border-${type.color}/30 hover:border-${type.color}/50`
                )}
              >
                <type.icon className={cn("w-6 h-6 mx-auto mb-2", `text-${type.color}`)} />
                <p className="text-sm font-medium text-foreground">{type.label}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {vendorStats.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Workflow Timeline */}
              <div className="p-6 rounded-2xl bg-card border border-border relative overflow-hidden">
                <img 
                  src={ipfsProofImage} 
                  alt="IPFS Proof Storage" 
                  className="absolute right-0 top-0 w-48 h-48 object-cover opacity-20 rounded-bl-2xl"
                />
                <h2 className="text-lg font-semibold text-foreground mb-6 relative z-10">Vendor Workflow</h2>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-public via-vendor to-muted" />
                  
                  <div className="space-y-5">
                    {workSteps.map((step, i) => (
                      <div key={step.id} className="relative flex items-start gap-4 pl-2">
                        <div className={cn(
                          "relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                          step.status === "done" && "bg-public/20 text-public",
                          step.status === "current" && "bg-vendor/20 text-vendor animate-pulse",
                          step.status === "pending" && "bg-muted/30 text-muted-foreground"
                        )}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className="pt-2">
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              "font-semibold",
                              step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                            )}>{step.title}</h3>
                            {step.status === "done" && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-public/10 text-public">Done</span>
                            )}
                            {step.status === "current" && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-vendor/10 text-vendor">Current</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assigned Work List */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Your Assignments</h2>
                <div className="space-y-4">
                  {assignedWork.map((work) => (
                    <div 
                      key={work.id}
                      className="p-4 rounded-2xl bg-card border border-border hover:border-vendor/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{work.title}</h3>
                          <p className="text-sm text-muted-foreground">{work.scheme}</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          getStatusStyles(work.status)
                        )}>
                          {getStatusLabel(work.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Payment</p>
                            <p className="text-sm font-semibold text-foreground">{work.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Due Date</p>
                            <p className="text-sm text-foreground">{work.dueDate}</p>
                          </div>
                        </div>
                        
                        {work.status === "in-progress" && (
                          <Button 
                            variant="vendor" 
                            size="sm"
                            onClick={() => {
                              setSelectedMilestone(work.title);
                              setUploadModalOpen(true);
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Proof
                          </Button>
                        )}
                        
                        {work.status === "awaiting-approval" && (
                          <div className="flex items-center gap-2 text-vendor">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">NGO + Donor + Auditor Review</span>
                          </div>
                        )}

                        {work.status === "completed" && (
                          <div className="flex items-center gap-2 text-public">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Payment Released</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <SmartContractWidget status="pending" amount="₹5.4L" />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <UploadModal 
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={(files) => {
          console.log("Files uploaded:", files);
          setUploadModalOpen(false);
        }}
        milestone={selectedMilestone}
      />
    </div>
  );
}

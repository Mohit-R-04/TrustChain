import { useState } from "react";
import { Shield, DollarSign, FolderOpen, Clock, AlertTriangle, Plus, CheckCircle, Eye, Users, Star, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsCard } from "@/components/StatsCard";
import { ProjectCard } from "@/components/ProjectCard";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { SmartContractWidget } from "@/components/SmartContractWidget";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ngoStats = [
  { title: "Total Budget", value: 5200000, icon: DollarSign, prefix: "₹", variant: "ngo" as const, delay: 0 },
  { title: "Funds Utilized", value: 3850000, icon: CheckCircle, prefix: "₹", variant: "public" as const, delay: 100 },
  { title: "Active Projects", value: 8, icon: FolderOpen, variant: "donor" as const, delay: 200 },
  { title: "Pending Approvals", value: 3, icon: Clock, variant: "vendor" as const, delay: 300 },
];

const projects = [
  { id: 1, name: "Clean Water Initiative", category: "Water", location: "Maharashtra", progress: 75, amount: "₹12,50,000", beneficiaries: 5000, status: "active" as const },
  { id: 2, name: "Rural Education Program", category: "Education", location: "Bihar", progress: 45, amount: "₹8,00,000", beneficiaries: 2500, status: "active" as const },
  { id: 3, name: "Health Camp Network", category: "Health", location: "Rajasthan", progress: 90, amount: "₹6,50,000", beneficiaries: 8000, status: "active" as const },
  { id: 4, name: "Solar Village Project", category: "Infrastructure", location: "Gujarat", progress: 30, amount: "₹15,00,000", beneficiaries: 3000, status: "pending" as const },
];

const milestones = [
  { id: 1, title: "Water Pump Installation - Phase 2", vendor: "AquaTech Solutions", amount: "₹75,000", status: "awaiting-approval" as const },
  { id: 2, title: "Classroom Construction", vendor: "BuildRight Constructions", amount: "₹1,50,000", status: "awaiting-approval" as const },
  { id: 3, title: "Medical Equipment Delivery", vendor: "HealthFirst Suppliers", amount: "₹2,00,000", status: "awaiting-approval" as const },
  { id: 4, title: "Solar Panel Installation", vendor: "GreenEnergy Corp", amount: "₹3,00,000", status: "in-progress" as const, dueDate: "Jan 25, 2024" },
  { id: 5, title: "Water Testing Complete", vendor: "AquaTech Solutions", amount: "₹25,000", status: "completed" as const },
];

export default function NGOAdminDashboard() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [approvedMilestones, setApprovedMilestones] = useState<number[]>([]);

  const handleApprove = (id: number) => {
    setApprovedMilestones([...approvedMilestones, id]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-ngo/10">
                <Shield className="w-8 h-8 text-ngo" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">NGO Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage projects & approve milestone payments</p>
              </div>
            </div>
            <Button variant="ngo" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create New Project
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {ngoStats.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Action Required Banner */}
          <div className="p-4 rounded-2xl bg-vendor/10 border border-vendor/30 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-vendor" />
              <div>
                <p className="font-semibold text-foreground">Action Required</p>
                <p className="text-sm text-muted-foreground">You have 3 milestone submissions awaiting approval</p>
              </div>
            </div>
            <Button variant="vendor">
              Review Submissions
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Projects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      variant="ngo"
                      onViewDetails={() => setSelectedProject(project.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Milestone Approval Workflow */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Milestone Approval Workflow</h2>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <MilestoneTimeline 
                    milestones={milestones.filter(m => !approvedMilestones.includes(m.id)).map(m => 
                      approvedMilestones.includes(m.id) ? { ...m, status: "completed" as const } : m
                    )}
                    variant="ngo"
                    onApprove={handleApprove}
                    onReject={(id) => console.log("Rejected:", id)}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <SmartContractWidget status="locked" amount="₹13.5L" />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

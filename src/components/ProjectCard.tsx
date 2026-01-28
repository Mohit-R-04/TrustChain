import { ArrowRight, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    category: string;
    location: string;
    progress: number;
    amount: string;
    beneficiaries: number;
    status: "active" | "completed" | "pending";
  };
  variant?: "donor" | "ngo" | "vendor" | "public";
  onViewDetails?: () => void;
}

const categoryColors: Record<string, string> = {
  Water: "bg-donor/10 text-donor border-donor/30",
  Education: "bg-vendor/10 text-vendor border-vendor/30",
  Health: "bg-public/10 text-public border-public/30",
  Infrastructure: "bg-ngo/10 text-ngo border-ngo/30",
};

export function ProjectCard({ project, variant = "public", onViewDetails }: ProjectCardProps) {
  const progressColor = {
    donor: "bg-donor",
    ngo: "bg-ngo",
    vendor: "bg-vendor",
    public: "bg-public",
  };

  return (
    <div className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-hover">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{project.location}</span>
          </div>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border",
          categoryColors[project.category] || "bg-muted text-muted-foreground"
        )}>
          {project.category}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-semibold text-foreground">{project.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 progress-glow", progressColor[variant])}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between py-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="text-sm font-semibold text-foreground">{project.amount}</p>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">{project.beneficiaries.toLocaleString()}</span>
        </div>
      </div>

      {/* Action */}
      <Button 
        variant="ghost" 
        className="w-full mt-3 group-hover:bg-primary/10"
        onClick={onViewDetails}
      >
        View Details
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle } from "lucide-react";

interface Milestone {
  id: number;
  title: string;
  vendor: string;
  amount: string;
  status: "completed" | "in-progress" | "pending" | "awaiting-approval";
  dueDate?: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  variant?: "donor" | "ngo" | "vendor" | "public";
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export function MilestoneTimeline({ milestones, variant = "ngo", onApprove, onReject }: MilestoneTimelineProps) {
  const getStatusColor = (status: Milestone["status"]) => {
    switch (status) {
      case "completed": return "bg-public text-public-foreground border-public";
      case "in-progress": return "bg-ngo text-ngo-foreground border-ngo";
      case "awaiting-approval": return "bg-vendor text-vendor-foreground border-vendor";
      default: return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getStatusIcon = (status: Milestone["status"]) => {
    switch (status) {
      case "completed": return <Check className="w-4 h-4" />;
      case "in-progress": return <Clock className="w-4 h-4 animate-pulse" />;
      case "awaiting-approval": return <AlertCircle className="w-4 h-4" />;
      default: return <div className="w-4 h-4 rounded-full bg-muted" />;
    }
  };

  return (
    <div className="space-y-4">
      {milestones.map((milestone, i) => (
        <div key={milestone.id} className="relative pl-8">
          {/* Timeline Line */}
          {i < milestones.length - 1 && (
            <div className={cn(
              "absolute left-[14px] top-8 w-0.5 h-full",
              milestone.status === "completed" ? "bg-public/50" : "bg-border"
            )} />
          )}
          
          {/* Status Dot */}
          <div className={cn(
            "absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all",
            getStatusColor(milestone.status)
          )}>
            {getStatusIcon(milestone.status)}
          </div>

          {/* Content */}
          <div className={cn(
            "p-4 rounded-xl border transition-all",
            milestone.status === "awaiting-approval" 
              ? "bg-vendor/5 border-vendor/30" 
              : "bg-card border-border hover:border-primary/30"
          )}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground">{milestone.title}</h4>
                <p className="text-sm text-muted-foreground">Vendor: {milestone.vendor}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">{milestone.amount}</span>
            </div>

            {milestone.status === "awaiting-approval" && onApprove && onReject && (
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => onApprove(milestone.id)}
                  className="flex-1 py-2 rounded-lg bg-public/10 text-public text-sm font-medium hover:bg-public/20 transition-colors"
                >
                  ✓ Approve
                </button>
                <button 
                  onClick={() => onReject(milestone.id)}
                  className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                >
                  ✗ Reject
                </button>
              </div>
            )}

            {milestone.dueDate && milestone.status !== "completed" && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Due: {milestone.dueDate}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

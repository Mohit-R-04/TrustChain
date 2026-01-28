import { useState, useEffect } from "react";
import { CheckCircle, Upload, DollarSign, FileText, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: number;
  type: "payment" | "upload" | "approval" | "project" | "vendor";
  message: string;
  time: string;
  color: "donor" | "ngo" | "vendor" | "public";
}

const activities: Activity[] = [
  { id: 1, type: "upload", message: "Vendor submitted proof for Water Project", time: "2 min ago", color: "vendor" },
  { id: 2, type: "payment", message: "Milestone payment released - ₹50,000", time: "5 min ago", color: "public" },
  { id: 3, type: "approval", message: "NGO approved Health Camp milestone", time: "12 min ago", color: "ngo" },
  { id: 4, type: "project", message: "New project created: Rural Education", time: "18 min ago", color: "ngo" },
  { id: 5, type: "vendor", message: "TechBuild Solutions verified as vendor", time: "25 min ago", color: "vendor" },
  { id: 6, type: "payment", message: "₹2,00,000 donated to Clean Water Initiative", time: "32 min ago", color: "donor" },
  { id: 7, type: "approval", message: "Smart contract escrow activated", time: "45 min ago", color: "public" },
];

const iconMap = {
  payment: DollarSign,
  upload: Upload,
  approval: CheckCircle,
  project: FileText,
  vendor: Users,
};

export function ActivityFeed() {
  const [visibleActivities, setVisibleActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Animate activities appearing one by one
    activities.forEach((activity, index) => {
      setTimeout(() => {
        setVisibleActivities(prev => [...prev, activity]);
      }, index * 200);
    });
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-public animate-pulse" />
        <h3 className="text-sm font-semibold text-foreground">Live Activity</h3>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {visibleActivities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 animate-slide-in-right"
            >
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0",
                  activity.color === "donor" && "bg-donor/10 text-donor",
                  activity.color === "ngo" && "bg-ngo/10 text-ngo",
                  activity.color === "vendor" && "bg-vendor/10 text-vendor",
                  activity.color === "public" && "bg-public/10 text-public"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{activity.message}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

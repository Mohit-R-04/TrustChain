import { Lock, CheckCircle, Shield, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartContractWidgetProps {
  status: "locked" | "released" | "pending";
  amount?: string;
  className?: string;
}

export function SmartContractWidget({ status, amount = "₹2.3M", className }: SmartContractWidgetProps) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border-2 transition-all duration-500",
      status === "locked" && "bg-donor/5 border-donor/30",
      status === "released" && "bg-public/5 border-public/30",
      status === "pending" && "bg-vendor/5 border-vendor/30",
      className
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "p-2 rounded-xl",
          status === "locked" && "bg-donor/10",
          status === "released" && "bg-public/10",
          status === "pending" && "bg-vendor/10"
        )}>
          {status === "locked" ? (
            <Lock className="w-5 h-5 text-donor animate-pulse-glow" />
          ) : status === "released" ? (
            <CheckCircle className="w-5 h-5 text-public" />
          ) : (
            <Shield className="w-5 h-5 text-vendor" />
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Smart Contract Status</p>
          <p className={cn(
            "text-sm font-semibold",
            status === "locked" && "text-donor",
            status === "released" && "text-public",
            status === "pending" && "text-vendor"
          )}>
            {status === "locked" && "Escrow Locked 🔒"}
            {status === "released" && "Released ✅"}
            {status === "pending" && "Pending Approval ⏳"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
        <div>
          <p className="text-xs text-muted-foreground">Amount in Escrow</p>
          <p className="text-lg font-bold text-foreground">{amount}</p>
        </div>
        <button className="flex items-center gap-1 text-xs text-primary hover:underline">
          <LinkIcon className="w-3 h-3" />
          View on Polygon
        </button>
      </div>
    </div>
  );
}

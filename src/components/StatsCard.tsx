import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  variant?: "donor" | "government" | "ngo" | "vendor" | "auditor" | "citizen" | "public" | "default";
  delay?: number;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  prefix = "",
  suffix = "",
  variant = "default",
  delay = 0,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = numericValue / steps;
    let current = 0;
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += stepValue;
        if (current >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  const variantStyles = {
    donor: "border-donor/30 hover:border-donor/50 hover:shadow-glow-donor",
    government: "border-government/30 hover:border-government/50 hover:shadow-glow-government",
    ngo: "border-ngo/30 hover:border-ngo/50 hover:shadow-glow-ngo",
    vendor: "border-vendor/30 hover:border-vendor/50 hover:shadow-glow-vendor",
    auditor: "border-auditor/30 hover:border-auditor/50 hover:shadow-glow-auditor",
    citizen: "border-citizen/30 hover:border-citizen/50 hover:shadow-glow-citizen",
    public: "border-public/30 hover:border-public/50 hover:shadow-glow-public",
    default: "border-border hover:border-primary/50 hover:shadow-glow",
  };

  const iconStyles = {
    donor: "bg-donor/10 text-donor",
    government: "bg-government/10 text-government",
    ngo: "bg-ngo/10 text-ngo",
    vendor: "bg-vendor/10 text-vendor",
    auditor: "bg-auditor/10 text-auditor",
    citizen: "bg-citizen/10 text-citizen",
    public: "bg-public/10 text-public",
    default: "bg-primary/10 text-primary",
  };

  return (
    <div
      className={cn(
        "relative p-4 md:p-6 rounded-2xl bg-card border-2 transition-all duration-500 card-hover group",
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs md:text-sm text-muted-foreground">{title}</p>
          <p className="text-xl md:text-3xl font-bold text-foreground counter-value">
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
          </p>
        </div>
        <div
          className={cn(
            "p-2 md:p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
            iconStyles[variant]
          )}
        >
          <Icon className="w-4 h-4 md:w-6 md:h-6" />
        </div>
      </div>
      
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl",
        variant === "donor" && "bg-donor/10",
        variant === "government" && "bg-government/10",
        variant === "ngo" && "bg-ngo/10",
        variant === "vendor" && "bg-vendor/10",
        variant === "auditor" && "bg-auditor/10",
        variant === "citizen" && "bg-citizen/10",
        variant === "public" && "bg-public/10",
        variant === "default" && "bg-primary/10"
      )} />
    </div>
  );
}

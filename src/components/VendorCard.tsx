import { Shield, Check, Star, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  vendor: {
    id: number;
    name: string;
    category: string;
    rating: number;
    completedProjects: number;
    kycVerified: boolean;
    location: string;
  };
  onSelect?: () => void;
}

export function VendorCard({ vendor, onSelect }: VendorCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-vendor/30 transition-all duration-300 card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-vendor/10 flex items-center justify-center text-vendor font-bold text-lg">
            {vendor.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-vendor transition-colors">
              {vendor.name}
            </h3>
            <p className="text-sm text-muted-foreground">{vendor.category}</p>
          </div>
        </div>
        {vendor.kycVerified && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-public/10 border border-public/30">
            <Shield className="w-3 h-3 text-public" />
            <span className="text-xs font-medium text-public">KYC</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-muted/30">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-4 h-4 text-chart-5" fill="currentColor" />
            <span className="text-sm font-semibold text-foreground">{vendor.rating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/30">
          <div className="flex items-center gap-1 mb-1">
            <Briefcase className="w-4 h-4 text-ngo" />
            <span className="text-sm font-semibold text-foreground">{vendor.completedProjects}</span>
          </div>
          <p className="text-xs text-muted-foreground">Projects</p>
        </div>
      </div>

      {/* Location */}
      <p className="text-sm text-muted-foreground mb-4">{vendor.location}</p>

      {/* Action */}
      {onSelect && (
        <Button variant="outline" className="w-full" onClick={onSelect}>
          View Profile
        </Button>
      )}
    </div>
  );
}

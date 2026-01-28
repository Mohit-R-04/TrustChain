import { Shield, Lock, FileCheck, Eye, Fingerprint, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  {
    icon: Shield,
    title: "Polygon Smart Contract",
    description: "Escrow Active",
    color: "donor",
  },
  {
    icon: Lock,
    title: "IPFS Storage",
    description: "Proof Verified",
    color: "vendor",
  },
  {
    icon: Fingerprint,
    title: "KYC Verification",
    description: "Vendors Verified",
    color: "ngo",
  },
  {
    icon: Eye,
    title: "Immutable Audit",
    description: "Trail Guaranteed",
    color: "public",
  },
];

export function TrustBadges() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Trust & Security Features
          </h2>
          <p className="text-muted-foreground">
            Enterprise-grade blockchain security for complete transparency
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, i) => (
            <div
              key={badge.title}
              className={cn(
                "p-6 rounded-2xl border-2 bg-card text-center transition-all duration-500 group cursor-pointer card-hover",
                badge.color === "donor" && "border-donor/20 hover:border-donor/50 hover:shadow-glow-donor",
                badge.color === "vendor" && "border-vendor/20 hover:border-vendor/50 hover:shadow-glow-vendor",
                badge.color === "ngo" && "border-ngo/20 hover:border-ngo/50 hover:shadow-glow-ngo",
                badge.color === "public" && "border-public/20 hover:border-public/50 hover:shadow-glow-public"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110",
                badge.color === "donor" && "bg-donor/10",
                badge.color === "vendor" && "bg-vendor/10",
                badge.color === "ngo" && "bg-ngo/10",
                badge.color === "public" && "bg-public/10"
              )}>
                <badge.icon className={cn(
                  "w-7 h-7 verified-pulse",
                  badge.color === "donor" && "text-donor",
                  badge.color === "vendor" && "text-vendor",
                  badge.color === "ngo" && "text-ngo",
                  badge.color === "public" && "text-public"
                )} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {badge.title}
              </h3>
              <p className={cn(
                "text-xs font-medium",
                badge.color === "donor" && "text-donor",
                badge.color === "vendor" && "text-vendor",
                badge.color === "ngo" && "text-ngo",
                badge.color === "public" && "text-public"
              )}>
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

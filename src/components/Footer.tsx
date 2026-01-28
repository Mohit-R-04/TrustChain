import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">TrustChain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete transparency in NGO fund management through blockchain-powered escrow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="/donor" className="text-sm text-muted-foreground hover:text-primary transition-colors">Donor Portal</a></li>
              <li><a href="/ngo-admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">NGO Admin</a></li>
              <li><a href="/vendor" className="text-sm text-muted-foreground hover:text-primary transition-colors">Vendor Portal</a></li>
              <li><a href="/public" className="text-sm text-muted-foreground hover:text-primary transition-colors">Public Dashboard</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About TrustChain</a></li>
              <li><a href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Support</a></li>
              <li><a href="/impact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Impact Reports</a></li>
            </ul>
          </div>

          {/* Blockchain */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Blockchain</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Polygon Network</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contract Address</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">PolygonScan</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Audit Reports</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 TrustChain. Built for Government Transparency.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted/30 border border-border">
              Powered by Polygon
            </span>
            <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted/30 border border-border">
              IPFS Enabled
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import trustchainLogo from "@/assets/trustchain-logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Public Transparency", path: "/public" },
  { name: "Citizen Portal", path: "/citizen" },
  { name: "Donor Portal", path: "/donor" },
  { name: "Government Portal", path: "/government" },
  { name: "NGO Portal", path: "/ngo-admin" },
  { name: "Vendor Portal", path: "/vendor" },
  { name: "Auditor Portal", path: "/auditor" },
  { name: "Community Needs", path: "/community-needs" },
  { name: "Impact Reports", path: "/impact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <img 
                src={trustchainLogo} 
                alt="TrustChain" 
                className="w-10 h-10 object-contain transition-transform group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Trust<span className="text-gradient-primary">Chain</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.slice(0, 6).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.name}
              </Link>
            ))}
            {/* Dropdown for more links */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-1">
                More <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                {navLinks.slice(6).map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "block px-4 py-3 text-sm transition-all",
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Auth & Verified Badge */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/auth"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              Login / Access Portal
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-public/10 border border-public/30">
              <CheckCircle className="w-4 h-4 text-public verified-pulse" />
              <span className="text-xs font-medium text-public">Polygon Verified Escrow</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden glass-strong border-t border-border animate-fade-up">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-4 py-3">
              <CheckCircle className="w-4 h-4 text-public" />
              <span className="text-xs font-medium text-public">Polygon Verified Escrow</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

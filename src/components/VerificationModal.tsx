import { useState } from "react";
import { X, Copy, Check, ExternalLink, Shield, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: {
    txHash: string;
    blockNumber: number;
    status: "confirmed" | "pending";
    amount: string;
    from: string;
    to: string;
    timestamp: string;
  };
}

export function VerificationModal({ isOpen, onClose, transaction }: VerificationModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const defaultTx = {
    txHash: "0x8f3a2d...7e9b4c",
    blockNumber: 45782134,
    status: "confirmed" as const,
    amount: "₹50,000",
    from: "0x742d...3f89",
    to: "0x9a2c...8d71",
    timestamp: "2024-01-15 14:32:45 UTC",
  };

  const tx = transaction || defaultTx;

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-public to-transparent" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-public/10">
              <Shield className="w-5 h-5 text-public" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Blockchain Verification</h3>
              <p className="text-sm text-muted-foreground">Polygon Network</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-public/5 border border-public/20">
            <div className={cn(
              "w-3 h-3 rounded-full",
              tx.status === "confirmed" ? "bg-public animate-pulse" : "bg-vendor"
            )} />
            <span className="text-sm font-medium text-public">
              {tx.status === "confirmed" ? "Transaction Confirmed" : "Pending Confirmation"}
            </span>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tx Hash</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-foreground">{tx.txHash}</code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-public" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <span className="text-sm text-muted-foreground">Block Number</span>
              <span className="text-sm font-mono text-foreground">{tx.blockNumber.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-semibold text-foreground">{tx.amount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Timestamp</span>
              </div>
              <span className="text-sm text-foreground">{tx.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button variant="outline" className="w-full" asChild>
            <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on PolygonScan
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

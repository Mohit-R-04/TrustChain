import { useState } from "react";
import { Building2, DollarSign, Users, FileText, Shield, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Government Publishes Scheme",
    description: "Government uploads welfare scheme with budget allocation, region, and milestones to blockchain.",
    icon: Building2,
    color: "government",
  },
  {
    id: 2,
    title: "Donors Fund via Escrow",
    description: "Donors contribute via Stripe. Funds are locked in Polygon smart contract escrow until milestones are verified.",
    icon: DollarSign,
    color: "donor",
  },
  {
    id: 3,
    title: "NGO Selects Quality Vendor",
    description: "NGO adopts scheme, creates milestones, and selects best-value vendor through quality scoring (not cheapest).",
    icon: Users,
    color: "ngo",
  },
  {
    id: 4,
    title: "Vendor Uploads IPFS Proof",
    description: "Vendor completes work and uploads invoices, receipts, and photos to IPFS. CID is stored on Polygon.",
    icon: FileText,
    color: "vendor",
  },
  {
    id: 5,
    title: "Multi-Party Approval",
    description: "NGO, Donor, and Auditor review proof documents. All three must approve for payment release.",
    icon: Shield,
    color: "auditor",
  },
  {
    id: 6,
    title: "Auto-Release Payment",
    description: "Smart contract automatically releases escrow funds to vendor. Citizen confirms delivery for final verification.",
    icon: CheckCircle,
    color: "public",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  const colorClasses = {
    government: { bg: "bg-government/10", border: "border-government/50", text: "text-government", glow: "shadow-glow-government" },
    donor: { bg: "bg-donor/10", border: "border-donor/50", text: "text-donor", glow: "shadow-glow-donor" },
    ngo: { bg: "bg-ngo/10", border: "border-ngo/50", text: "text-ngo", glow: "shadow-glow-ngo" },
    vendor: { bg: "bg-vendor/10", border: "border-vendor/50", text: "text-vendor", glow: "shadow-glow-vendor" },
    auditor: { bg: "bg-auditor/10", border: "border-auditor/50", text: "text-auditor", glow: "shadow-glow-auditor" },
    public: { bg: "bg-public/10", border: "border-public/50", text: "text-public", glow: "shadow-glow-public" },
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How <span className="text-gradient-primary">TrustChain</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A transparent 6-step workflow ensuring every rupee is tracked from donation to delivery
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto">
          {/* Progress Line */}
          <div className="hidden md:block relative mb-12">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-border rounded-full -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-government via-ngo to-public rounded-full -translate-y-1/2 transition-all duration-500"
              style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {/* Step Dots */}
            <div className="relative flex justify-between">
              {steps.map((step) => {
                const colors = colorClasses[step.color as keyof typeof colorClasses];
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      step.id <= activeStep 
                        ? `${colors.bg} ${colors.border} ${colors.glow}` 
                        : "bg-card border-border",
                      step.id === activeStep && "scale-125"
                    )}
                  >
                    <step.icon className={cn(
                      "w-5 h-5 transition-colors",
                      step.id <= activeStep ? colors.text : "text-muted-foreground"
                    )} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => {
              const colors = colorClasses[step.color as keyof typeof colorClasses];
              const isActive = step.id === activeStep;
              
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    "p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 card-hover",
                    isActive 
                      ? `${colors.bg} ${colors.border} ${colors.glow}` 
                      : "bg-card/50 border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      isActive ? colors.bg : "bg-muted"
                    )}>
                      <step.icon className={cn(
                        "w-5 h-5",
                        isActive ? colors.text : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <span className={cn(
                        "text-xs font-mono",
                        isActive ? colors.text : "text-muted-foreground"
                      )}>
                        Step {step.id}
                      </span>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  {/* Animated checkmark for completed steps */}
                  {step.id < activeStep && (
                    <div className="flex items-center gap-2 mt-4 text-public">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Completed</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

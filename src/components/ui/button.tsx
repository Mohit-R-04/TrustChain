import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-glow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-muted/50 hover:border-primary/50 text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted/50 hover:text-foreground text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-donor hover:shadow-glow-lg hover:-translate-y-0.5",
        heroOutline: "border-2 border-primary/50 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary hover:-translate-y-0.5",
        donor: "bg-donor text-donor-foreground hover:bg-donor/90 shadow-glow-donor",
        government: "bg-government text-government-foreground hover:bg-government/90 shadow-glow-government",
        ngo: "bg-ngo text-ngo-foreground hover:bg-ngo/90 shadow-glow-ngo",
        vendor: "bg-vendor text-vendor-foreground hover:bg-vendor/90 shadow-glow-vendor",
        auditor: "bg-auditor text-auditor-foreground hover:bg-auditor/90 shadow-glow-auditor",
        citizen: "bg-citizen text-citizen-foreground hover:bg-citizen/90 shadow-glow-citizen",
        public: "bg-public text-public-foreground hover:bg-public/90 shadow-glow-public",
        glass: "bg-card/30 backdrop-blur-md border border-border/50 text-foreground hover:bg-card/50 hover:border-primary/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
import { cn } from "@/lib/utils";

interface ImageBannerProps {
  src: string;
  alt: string;
  className?: string;
  glowColor?: string;
}

export function ImageBanner({ src, alt, className, glowColor = "primary" }: ImageBannerProps) {
  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden rounded-2xl mb-8 animate-fade-in",
        className
      )}
    >
      <div 
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300 rounded-2xl",
          `bg-${glowColor}/20 blur-xl`
        )}
      />
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full max-h-[300px] object-cover rounded-2xl border border-border",
          "transition-all duration-300 ease-out",
          "hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]"
        )}
      />
    </div>
  );
}

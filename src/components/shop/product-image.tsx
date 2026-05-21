import { cn } from "@/lib/utils";

interface ProductImageProps {
  emoji: string;
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Branded placeholder used until real product photos are uploaded.
 * The `emoji` is treated as a glyph drawn over a warm gradient tile.
 */
export function ProductImage({
  emoji,
  name,
  className,
  size = "md",
}: ProductImageProps) {
  const sizes = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-8xl",
  };

  // Build a stable gradient from name hash for visual variety
  const hash = name
    .split("")
    .reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 0);

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg",
        className
      )}
      style={{
        // Jewel-tone gradient — rich and warm against dark cards.
        background: `linear-gradient(135deg, hsl(${hash} 55% 18%), hsl(${
          (hash + 40) % 360
        } 60% 12%))`,
      }}
    >
      <span className={cn("drop-shadow-lg", sizes[size])}>{emoji}</span>
      <span className="sr-only">{name}</span>
    </div>
  );
}

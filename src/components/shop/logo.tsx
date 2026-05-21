import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  /** When true, draws a thicker outer glow ring (good for dark surfaces). */
  glow?: boolean;
}

/**
 * Pinoy Mart emblem — circular roundel inspired by the brand logo:
 * dark green ring, "PROUDLY PINOY" arc, leaves, Philippine-flag inner disc
 * with sun rays + stars, and a shopping cart silhouette.
 * Pure SVG, resolution-independent, fully themeable.
 */
export function LogoMark({ className, glow }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Pinoy Mart"
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <path
          id="pm-arc"
          d="M 18,50 A 32,32 0 0,1 82,50"
          fill="none"
        />
        <radialGradient id="pm-shine" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#26d57e" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0a3d1f" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Optional outer glow */}
      {glow && (
        <circle cx="50" cy="50" r="49" fill="#22c55e" fillOpacity="0.18" />
      )}

      {/* Outer dark-green disc with bright-green border */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="#0a3d1f"
        stroke="#22c55e"
        strokeWidth="2"
      />
      <circle cx="50" cy="50" r="46" fill="url(#pm-shine)" />

      {/* "PROUDLY PINOY" arc text */}
      <text
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="7.2"
        letterSpacing="1.4"
        fill="#ffffff"
      >
        <textPath href="#pm-arc" startOffset="50%" textAnchor="middle">
          PROUDLY PINOY
        </textPath>
      </text>

      {/* Leaves — two stylized leaf clusters at the top sides */}
      <g fill="#22c55e">
        <path d="M 18 36 q 5 -10 12 -6 q -2 8 -12 6 z" />
        <path d="M 82 36 q -5 -10 -12 -6 q 2 8 12 6 z" />
        <path d="M 26 30 q 3 -8 9 -5 q -1 6 -9 5 z" opacity="0.7" />
        <path d="M 74 30 q -3 -8 -9 -5 q 1 6 9 5 z" opacity="0.7" />
      </g>

      {/* Philippine flag inner disc (offset slightly to leave room for cart) */}
      <g transform="translate(50,56)">
        {/* Yellow bottom semicircle */}
        <path d="M -22 0 A 22 22 0 0 0 22 0 Z" fill="#fcd116" />
        {/* Red top semicircle */}
        <path d="M -22 0 A 22 22 0 0 1 22 0 Z" fill="#ce1126" />

        {/* Sun rays on yellow half */}
        <g fill="#0a3d1f">
          {Array.from({ length: 7 }).map((_, i) => {
            const angle = 180 + (i + 1) * (180 / 8);
            const rad = (angle * Math.PI) / 180;
            const x1 = Math.cos(rad) * 14;
            const y1 = Math.sin(rad) * 14;
            const x2 = Math.cos(rad) * 20;
            const y2 = Math.sin(rad) * 20;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#0a3d1f"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            );
          })}
        </g>
        {/* Small sun core */}
        <circle r="3" fill="#fcd116" stroke="#0a3d1f" strokeWidth="1.2" />

        {/* Three small stars on red half */}
        <g fill="#fcd116">
          {[
            { x: -14, y: -9 },
            { x: 14, y: -9 },
            { x: 0, y: -16 },
          ].map((s, i) => (
            <Star key={i} cx={s.x} cy={s.y} size={2.4} />
          ))}
        </g>
      </g>

      {/* Shopping cart silhouette */}
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 32 64 L 38 64 L 44 80 L 70 80 L 74 68 L 42 68" />
        <circle cx="48" cy="86" r="2.8" fill="#ffffff" />
        <circle cx="66" cy="86" r="2.8" fill="#ffffff" />
      </g>
    </svg>
  );
}

function Star({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? size : size / 2.4;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return <polygon points={pts.join(" ")} />;
}

interface LogoProps {
  className?: string;
  variant?: "default" | "on-dark";
  showTagline?: boolean;
}

/**
 * Full wordmark + emblem. Adapts to dark backgrounds via `variant="on-dark"`.
 */
export function Logo({
  className,
  variant = "default",
  showTagline = true,
}: LogoProps) {
  // The wordmark always pops in vivid lime to match the printed logo —
  // both on the dark header chrome and on light auxiliary surfaces.
  const wordmarkColor = "text-[hsl(var(--brand-lime))]";
  const taglineColor =
    variant === "on-dark"
      ? "text-[hsl(var(--brand-lime))]/85"
      : "text-[hsl(var(--brand-lime))]/80";

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 tracking-tight",
        className
      )}
    >
      <LogoMark
        glow={variant === "on-dark"}
        className="h-10 w-10 transition-transform group-hover:rotate-3 sm:h-11 sm:w-11"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[20px] uppercase tracking-[0.06em] sm:text-[22px]",
            // Russo One is already a heavy display face — no extra `font-black`.
            "font-[family-name:var(--font-display)]",
            wordmarkColor
          )}
          // Light text-shadow lifts the wordmark off the dark header chrome.
          style={{ textShadow: "0 0 18px hsl(var(--brand-lime) / 0.35)" }}
        >
          Pinoy Mart
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 hidden text-[8.5px] font-semibold uppercase tracking-[0.18em] sm:inline",
              taglineColor
            )}
          >
            Home of Quality Filipino Products
          </span>
        )}
      </span>
    </Link>
  );
}

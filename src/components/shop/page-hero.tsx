interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/** Consistent header band for static info pages (About, Contact, etc.). */
export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-accent/10 px-5 py-10 sm:px-10 sm:py-14">
      <div className="absolute inset-0 bg-warm-grid opacity-50" aria-hidden />
      <div className="relative">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

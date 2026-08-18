import type { ReactNode } from "react";

interface ExampleContentProps {
  label?: string;
  children: ReactNode;
}

/**
 * Wraps a real feature's own components, fed fake data, so a brand-new user sees the actual shape
 * of a feature before they have anything of their own in it — not a mockup screenshot, the real
 * thing, just dimmed and clearly labeled. pointer-events-none since the fake ids underneath (see
 * exampleFilms.ts) don't resolve to anything real.
 */
export function ExampleContent({ label = "what this looks like, once you place a few", children }: ExampleContentProps) {
  return (
    <div>
      <p className="mb-3 text-center text-[10px] font-semibold tracking-[0.1em] text-ink-faint uppercase">{label}</p>
      <div className="pointer-events-none opacity-40 select-none">{children}</div>
    </div>
  );
}

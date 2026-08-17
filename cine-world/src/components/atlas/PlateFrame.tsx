import type { ReactNode } from "react";

interface PlateFrameProps {
  /** Kept while remaining call sites migrate off the old "Plate N" framing — no longer displayed. */
  roman?: string;
  title: string;
  caption: ReactNode;
  padded?: boolean;
  children: ReactNode;
}

export function PlateFrame({ title, caption, padded = false, children }: PlateFrameProps) {
  return (
    <section className="flex flex-col gap-3.5">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <div className={`glass ${padded ? "p-6" : "overflow-hidden"}`}>{children}</div>
      <p className="max-w-[60ch] text-[13.5px] leading-[1.7] text-ink-soft [&_em]:font-medium [&_em]:text-accent-strong [&_em]:not-italic">
        {caption}
      </p>
    </section>
  );
}

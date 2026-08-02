import type { ReactNode } from "react";

interface PlateFrameProps {
  roman: string;
  title: string;
  caption: ReactNode;
  padded?: boolean;
  children: ReactNode;
}

const CORNER_POSITIONS = [
  "top-3 left-3 border-r-0 border-b-0",
  "top-3 right-3 border-l-0 border-b-0",
  "bottom-3 left-3 border-r-0 border-t-0",
  "bottom-3 right-3 border-l-0 border-t-0",
];

function CornerBrackets() {
  return (
    <>
      {CORNER_POSITIONS.map((pos) => (
        <span key={pos} className={`pointer-events-none absolute h-5 w-5 border-2 border-brass/60 ${pos}`} />
      ))}
    </>
  );
}

export function PlateFrame({ roman, title, caption, padded = false, children }: PlateFrameProps) {
  return (
    <div>
      <div className="mb-3.5 flex items-baseline justify-between">
        <span className="font-display text-[11px] tracking-[0.14em] text-oxblood uppercase">
          Plate {roman} <span className="ml-2 font-body text-[13px] tracking-normal italic text-ink-soft normal-case">— {title}</span>
        </span>
      </div>
      <div className={`relative border border-line bg-paper-deep shadow-[0_10px_26px_-14px_rgba(43,32,24,0.35)] ${padded ? "p-6" : ""}`}>
        <CornerBrackets />
        {children}
      </div>
      <p className="mt-4 max-w-[60ch] text-[14px] leading-[1.75] text-ink-soft [&_em]:font-medium [&_em]:text-oxblood [&_em]:not-italic">
        {caption}
      </p>
    </div>
  );
}

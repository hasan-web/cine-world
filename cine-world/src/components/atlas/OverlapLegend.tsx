interface LegendItem {
  label: string;
  color: string;
}

const ITEMS: LegendItem[] = [
  { label: "you", color: "var(--brass)" },
  { label: "mei", color: "var(--oxblood)" },
  { label: "coincident", color: "var(--gilt-bright)" },
];

export function OverlapLegend() {
  return (
    <div className="absolute right-3.5 bottom-3.5 z-10 border border-line bg-paper px-3 py-2 font-mono text-[9.5px] text-ink-soft">
      {ITEMS.map((item) => (
        <div key={item.label} className="my-0.5 flex items-center gap-1.5">
          <span className="h-[7px] w-[7px] rotate-45" style={{ background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

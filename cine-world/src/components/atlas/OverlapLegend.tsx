interface LegendItem {
  label: string;
  color: string;
}

interface OverlapLegendProps {
  friendLabel: string;
}

export function OverlapLegend({ friendLabel }: OverlapLegendProps) {
  const items: LegendItem[] = [
    { label: "you", color: "var(--accent)" },
    { label: friendLabel, color: "var(--companion)" },
    { label: "coincident", color: "var(--star)" },
  ];

  return (
    <div className="glass absolute right-3.5 bottom-3.5 z-10 px-3 py-2 text-[10.5px] text-ink-soft">
      {items.map((item) => (
        <div key={item.label} className="my-0.5 flex items-center gap-1.5">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

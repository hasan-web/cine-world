interface CinemaPersonalityCardProps {
  name: string;
  tagline: string;
  description: string;
  topMood: { label: string; pct: number } | null;
  rewatchRatePct: number;
  averageRating: number;
  topEra: string | null;
}

/**
 * A named taste archetype, read only from viewing patterns (mood mix, rewatch rate, ratings, era)
 * and never framed as a claim about who the person is — see the closing disclosure line, which
 * exists specifically to keep this from reading like a horoscope.
 */
export function CinemaPersonalityCard({
  name,
  tagline,
  description,
  topMood,
  rewatchRatePct,
  averageRating,
  topEra,
}: CinemaPersonalityCardProps) {
  const stats = [
    topMood ? { value: `${topMood.pct}%`, label: topMood.label } : null,
    { value: `${rewatchRatePct}%`, label: "of viewings are rewatches" },
    { value: averageRating.toFixed(1), label: "average rating" },
    topEra ? { value: topEra, label: "most-logged era" } : null,
  ].filter((s): s is { value: string; label: string } => s !== null);

  return (
    <section className="glass mx-auto max-w-[540px] px-7 py-8 text-center">
      <p className="text-[10.5px] tracking-[0.14em] text-accent uppercase">Your cinema personality</p>
      <h2 className="mt-2.5 text-[22px] font-semibold text-ink">{name}</h2>
      <p className="mt-1.5 text-[12.5px] text-ink-faint italic">{tagline}</p>
      <p className="mt-4 text-left text-[13px] leading-[1.75] text-ink-soft">{description}</p>
      <div className="my-5 h-px bg-line" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-glass-edge px-3 py-2.5 text-left">
            <div className="text-[15px] font-semibold text-accent-strong">{s.value}</div>
            <div className="mt-0.5 text-[10px] text-ink-faint">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] leading-[1.6] text-ink-faint">
        Read from what you watch, not who you are — rereads itself as your collection grows.
      </p>
    </section>
  );
}

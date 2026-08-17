import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { verifySession } from "@/lib/dal";
import { buildDiary } from "@/lib/diary";
import { listFilms } from "@/lib/films";
import { buildStats, type Bar } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Your stats",
  alternates: { canonical: "/stats" },
};

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="glass p-6">
      <h2 className="mb-1 text-[13px] font-semibold text-ink">{title}</h2>
      {note && <p className="mb-4 text-[11.5px] text-ink-faint">{note}</p>}
      <div className={note ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass px-5 py-5">
      <p className="text-[26px] leading-none font-semibold text-ink tabular-nums">{value}</p>
      <p className="mt-1.5 text-[11.5px] text-ink-soft">{label}</p>
    </div>
  );
}

/** Horizontal bars — used wherever the label matters more than precise magnitude. */
function BarList({ bars, unit = "" }: { bars: Bar[]; unit?: string }) {
  if (bars.length === 0) {
    return <p className="text-[12.5px] text-ink-faint italic">Nothing to show yet.</p>;
  }
  return (
    <div className="flex flex-col gap-2.5">
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3">
          <span className="w-16 flex-none truncate text-[12px] text-ink-soft" title={bar.label}>
            {bar.label}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
              style={{ width: `${Math.max(bar.fraction * 100, bar.count > 0 ? 4 : 0)}%` }}
            />
          </span>
          <span className="w-8 flex-none text-right text-[11.5px] text-ink-faint tabular-nums">
            {bar.count}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function StatsPage() {
  const user = await verifySession();
  const films = await listFilms();
  const viewings = buildDiary(films);
  const stats = buildStats(films, viewings);

  if (films.length === 0) {
    return (
      <AppShell userEmail={user.email ?? ""} activePath="/stats">
        <div className="mx-auto w-full max-w-[620px]">
          <h1 className="mb-1 text-[16px] font-semibold text-ink">Your stats</h1>
          <p className="mb-7 text-[13.5px] text-ink-soft">
            Nothing to count yet — this fills in as you log.
          </p>
          <div className="glass p-8 text-center">
            <Link
              href="/import"
              className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-5 py-2.5 text-[12.5px] font-semibold text-white"
            >
              Import from Letterboxd →
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/stats">
      <div className="mx-auto w-full max-w-[860px]">
        <h1 className="mb-1 text-[16px] font-semibold text-ink">Your stats</h1>
        <p className="mb-7 max-w-[54ch] text-[13.5px] leading-[1.7] text-ink-soft">
          Counted across viewings rather than films, so a rewatch you felt differently about counts as
          its own opinion.
        </p>

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Figure value={stats.totalFilms.toLocaleString()} label="films in your collection" />
          <Figure value={stats.totalViewings.toLocaleString()} label="viewings logged" />
          <Figure value={stats.rewatches.toLocaleString()} label="of them rewatches" />
          <Figure value={stats.averageRating.toFixed(1)} label="average rating" />
        </div>

        {stats.unplaced > 0 && (
          <Link
            href="/place"
            className="glass mb-5 flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span className="text-[13px] text-ink">
              <span className="font-semibold text-accent-strong">{stats.unplaced.toLocaleString()}</span>{" "}
              of these still have no mood, so they&rsquo;re missing from the split below.
            </span>
            <span className="text-[12.5px] font-semibold whitespace-nowrap text-accent-strong">
              Place them →
            </span>
          </Link>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Last 12 months" note="Viewings per month.">
            <div className="flex h-[120px] items-end gap-1.5">
              {stats.activity.map((bar, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5" title={`${bar.count}`}>
                  <span
                    className="w-full rounded-t bg-gradient-to-t from-accent to-accent-strong"
                    style={{ height: `${Math.max(bar.fraction * 92, bar.count > 0 ? 4 : 1)}px` }}
                  />
                  <span className="text-[9.5px] text-ink-faint">{bar.label}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="How you rate" note="Across every viewing, not just first watches.">
            <BarList bars={stats.ratings} />
          </Panel>

          <Panel
            title="Where they sit"
            note={
              stats.unplaced > 0
                ? `Of the ${(stats.totalFilms - stats.unplaced).toLocaleString()} you've placed.`
                : "Across your whole collection."
            }
          >
            <div className="flex flex-col gap-2.5">
              {stats.moods.map((m) => (
                <div key={m.cluster.id} className="flex items-center gap-3">
                  <span className="w-20 flex-none text-[12px] text-ink-soft">{m.cluster.label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
                      style={{ width: `${Math.max(m.fraction * 100, m.count > 0 ? 4 : 0)}%` }}
                    />
                  </span>
                  <span className="w-14 flex-none text-right text-[11.5px] text-ink-faint tabular-nums">
                    {Math.round(m.fraction * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Decades you watch" note="By the film's release year.">
            <BarList bars={stats.decades} />
          </Panel>

          <Panel
            title="Directors you return to"
            note={
              stats.filmsWithDirector === 0
                ? "None of your films record a director yet — a Letterboxd export doesn't carry one, so this fills in as you log by hand."
                : stats.filmsWithDirector < stats.totalFilms
                  ? `Based on the ${stats.filmsWithDirector.toLocaleString()} of your films that record a director — imports don't carry one.`
                  : undefined
            }
          >
            {stats.filmsWithDirector > 0 && <BarList bars={stats.directors} />}
          </Panel>

          <Panel title="Most returned to" note="Films you've watched more than once.">
            {stats.mostRewatched.length === 0 ? (
              <p className="text-[12.5px] text-ink-faint italic">No rewatches logged yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {stats.mostRewatched.map((f) => (
                  <li key={f.filmId} className="flex items-baseline justify-between gap-3">
                    <Link href={`/film/${f.filmId}`} className="truncate text-[13px] text-ink hover:text-accent-strong">
                      {f.title}
                    </Link>
                    <span className="flex-none text-[11.5px] text-ink-faint tabular-nums">
                      {f.viewings}×
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {stats.firstViewing && (
          <p className="mt-6 text-center text-[12px] text-ink-faint">
            Your record starts {new Date(`${stats.firstViewing}T00:00:00`).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            .
          </p>
        )}
      </div>
    </AppShell>
  );
}

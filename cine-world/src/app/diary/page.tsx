import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { ExampleContent } from "@/components/shell/ExampleContent";
import { CLUSTERS } from "@/data/clusters";
import { EXAMPLE_FILMS } from "@/data/exampleFilms";
import { verifySession } from "@/lib/dal";
import { buildDiary, groupByMonth, type Viewing } from "@/lib/diary";
import { listFilms } from "@/lib/films";

export const metadata: Metadata = {
  title: "Your diary",
  alternates: { canonical: "/diary" },
};

const PER_PAGE = 100;

function moodLabel(cluster: string | null): string | null {
  return CLUSTERS.find((c) => c.id === cluster)?.label ?? null;
}

/** Renders "10" from 2024-03-10 without constructing a Date, which would shift across timezones. */
function dayOf(date: string): string {
  return String(Number(date.slice(8, 10)));
}

function MonthList({ months }: { months: ReturnType<typeof groupByMonth> }) {
  return (
    <div className="flex flex-col gap-7">
      {months.map((month) => (
        <section key={month.key}>
          <h2 className="mb-3 text-[11px] tracking-[0.1em] text-accent uppercase">{month.label}</h2>
          <div className="glass overflow-hidden">
            {month.viewings.map((v: Viewing, i: number) => (
              <Link
                key={`${v.filmId}-${v.date}-${i}`}
                href={`/film/${v.filmId}`}
                className="flex gap-4 border-b border-line px-5 py-3.5 last:border-none hover:bg-glass-edge"
              >
                <span className="w-6 flex-none pt-0.5 text-right text-[13px] font-semibold text-ink-faint tabular-nums">
                  {dayOf(v.date)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[14px] font-medium text-ink">{v.title}</span>
                    {v.year > 0 && <span className="text-[12px] text-ink-faint">{v.year}</span>}
                    {v.isRewatch && (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-accent-strong uppercase">
                        rewatch
                      </span>
                    )}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2.5 text-[11.5px] text-ink-faint">
                    <span className="flex gap-1" aria-label={`${v.rating} of 5`}>
                      {Array.from({ length: 5 }, (_, s) => (
                        <span key={s} className={`h-1.5 w-1.5 rounded-full ${s < v.rating ? "bg-accent" : "bg-line"}`} />
                      ))}
                    </span>
                    {moodLabel(v.cluster) ? <span>{moodLabel(v.cluster)}</span> : <span className="italic">not placed</span>}
                  </span>
                  {v.note && <span className="mt-1.5 block text-[12.5px] leading-[1.6] text-ink-soft italic">{v.note}</span>}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default async function DiaryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await verifySession();
  const { page: pageParam } = await searchParams;

  const films = await listFilms();
  const all = buildDiary(films);

  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const months = groupByMonth(all.slice((page - 1) * PER_PAGE, page * PER_PAGE));

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/diary">
      <div className="mx-auto w-full max-w-[640px]">
        <h1 className="mb-1 text-[16px] font-semibold text-ink">Your diary</h1>
        <p className="mb-8 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
          {all.length === 0 ? (
            <>Nothing logged yet — every film you log lands here, in the order you watched them.</>
          ) : (
            <>
              {all.length.toLocaleString()} viewing{all.length === 1 ? "" : "s"}, newest first. A rewatch
              gets its own entry rather than replacing the first one.
            </>
          )}
        </p>

        {all.length === 0 ? (
          <div className="flex flex-col gap-6">
            <ExampleContent label="what your diary looks like">
              <MonthList months={groupByMonth(buildDiary(EXAMPLE_FILMS))} />
            </ExampleContent>
            <div className="glass p-8 text-center">
              <p className="mb-6 text-[13.5px] text-ink-soft">
                Log a film, or bring your history over from Letterboxd.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/log"
                  className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-5 py-2.5 text-[12.5px] font-semibold text-white"
                >
                  Log a film →
                </Link>
                <Link
                  href="/import"
                  className="rounded-full border border-line-strong px-5 py-2.5 text-[12.5px] text-ink-soft"
                >
                  Import from Letterboxd
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <MonthList months={months} />

            {totalPages > 1 && (
              <div className="mt-9 flex items-center justify-between border-t border-line pt-5">
                {page > 1 ? (
                  <Link
                    href={`/diary?page=${page - 1}`}
                    className="text-[12.5px] text-accent-strong underline decoration-accent-strong/40 underline-offset-4"
                  >
                    ← Newer
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-[11.5px] text-ink-faint">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={`/diary?page=${page + 1}`}
                    className="text-[12.5px] text-accent-strong underline decoration-accent-strong/40 underline-offset-4"
                  >
                    Older →
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

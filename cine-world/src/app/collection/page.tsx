import Link from "next/link";
import { FriendOverlapPlate } from "@/components/collection/FriendOverlapPlate";
import { PlateFrame } from "@/components/atlas/PlateFrame";
import { AppShell } from "@/components/shell/AppShell";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import { verifySession } from "@/lib/dal";
import { countUnplacedFilms, listFilms, listFilmsForUser } from "@/lib/films";
import { listFriends } from "@/lib/friends";
import { isPlaced, type Film, type PlacedFilm } from "@/lib/types";

const NEW_COLLECTION_THRESHOLD = 4;

function moodBreakdown(films: PlacedFilm[]) {
  const counts = new Map(CLUSTERS.map((c) => [c.id, 0]));
  for (const f of films) counts.set(f.cluster, (counts.get(f.cluster) ?? 0) + 1);
  const total = films.length || 1;
  return CLUSTERS.map((c) => ({ cluster: c, count: counts.get(c.id) ?? 0, pct: (counts.get(c.id) ?? 0) / total }))
    .sort((a, b) => b.count - a.count);
}

function topDirectors(films: Film[], limit = 4) {
  const counts = new Map<string, number>();
  // Imported films carry no director — a Letterboxd export doesn't include one — so they'd
  // otherwise pile up under a blank name and win this list outright.
  for (const f of films) {
    if (!f.director) continue;
    counts.set(f.director, (counts.get(f.director) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([director, count]) => ({ director, count }));
}

export default async function CollectionPage() {
  const user = await verifySession();
  const [allFilms, friends, unplaced] = await Promise.all([
    listFilms(),
    listFriends(),
    countUnplacedFilms(),
  ]);
  // Only placed films belong in the sky and its statistics — an imported film has no mood yet,
  // and inventing a position for it would put a star somewhere its owner never chose.
  const films = allFilms.filter(isPlaced);
  const friendFilms = await Promise.all(friends.map((f) => listFilmsForUser(f.id)));
  const twins = friends.map((friend, i) => ({ friend, films: friendFilms[i].filter(isPlaced) }));
  const isNewCollection = films.length > 0 && films.length < NEW_COLLECTION_THRESHOLD;
  const totalRewatches = films.reduce((sum, f) => sum + (f.rewatches?.length ?? 0), 0);
  const countries = new Set(films.map((f) => f.country).filter(Boolean)).size;
  const moods = moodBreakdown(films);
  const directors = topDirectors(films);
  const recent = [...films]
    .filter((f) => f.watchedOn)
    .sort((a, b) => (b.watchedOn ?? "").localeCompare(a.watchedOn ?? ""))
    .slice(0, 4);

  const CIRC = 2 * Math.PI * 34;
  const ringSegments = moods
    .filter((m) => m.count > 0)
    .reduce<Array<(typeof moods)[number] & { length: number; offset: number }>>((acc, m) => {
      const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0;
      acc.push({ ...m, length: m.pct * CIRC, offset });
      return acc;
    }, []);
  const ringColors = ["var(--accent)", "var(--star)", "var(--companion)", "var(--ink-faint)"];

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/collection">
      {unplaced > 0 && (
        <Link
          href="/place"
          className="glass flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-transform duration-150 hover:-translate-y-0.5"
        >
          <span className="text-[13.5px] text-ink">
            <span className="font-semibold text-accent-strong">
              {unplaced.toLocaleString()} film{unplaced === 1 ? "" : "s"}
            </span>{" "}
            waiting to be placed — they stay out of your sky until they have a mood.
          </span>
          <span className="text-[12.5px] font-semibold whitespace-nowrap text-accent-strong">
            Place them →
          </span>
        </Link>
      )}

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <PlateFrame
          title="Your sky"
          caption={
            films.length === 0 ? (
              <>Nothing pressed here yet — log your first film to see it appear.</>
            ) : isNewCollection ? (
              <>
                {films.length} film{films.length === 1 ? "" : "s"} placed — the taste-twin panel gets more
                interesting the more you place.{" "}
                <Link href="/log" className="text-accent-strong">
                  Log another →
                </Link>
              </>
            ) : (
              <>
                {films.length} films, positioned by mood — hover to read one, click to open its page.{" "}
                <Link href="/log" className="text-accent-strong">
                  Log a new film →
                </Link>
              </>
            )
          }
        >
          {films.length === 0 ? (
            <div className="flex h-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
              <p className="text-[15px] text-ink-soft">an empty sky has no stars yet</p>
              <Link
                href="/log"
                className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12px] font-semibold text-white"
              >
                Log your first film →
              </Link>
            </div>
          ) : (
            <SkyCanvas films={films} clusters={CLUSTERS} height={380} showLabels interactive navigable />
          )}
          {films.length > 0 && (
            <div className="flex flex-wrap gap-6 border-t border-line px-5 py-4">
              <div>
                <div className="text-[19px] font-semibold text-ink">{films.length}</div>
                <div className="text-[10px] tracking-[0.05em] text-ink-faint uppercase">Films</div>
              </div>
              <div>
                <div className="text-[19px] font-semibold text-ink">{totalRewatches}</div>
                <div className="text-[10px] tracking-[0.05em] text-ink-faint uppercase">Rewatched</div>
              </div>
              <div>
                <div className="text-[19px] font-semibold text-ink">{countries}</div>
                <div className="text-[10px] tracking-[0.05em] text-ink-faint uppercase">Countries</div>
              </div>
            </div>
          )}
        </PlateFrame>

        <div className="flex flex-col gap-5">
          {films.length > 0 && (
            <PlateFrame title="Mood palette" caption="Where most of your sky lives right now." padded>
              <div className="flex items-center gap-4">
                <svg width="86" height="86" viewBox="0 0 86 86" className="flex-none">
                  <circle cx="43" cy="43" r="34" fill="none" stroke="var(--line)" strokeWidth="10" />
                  {ringSegments.map((seg, i) => (
                    <circle
                      key={seg.cluster.id}
                      cx="43"
                      cy="43"
                      r="34"
                      fill="none"
                      stroke={ringColors[i % ringColors.length]}
                      strokeWidth="10"
                      strokeDasharray={`${seg.length} ${CIRC - seg.length}`}
                      strokeDashoffset={-seg.offset}
                      strokeLinecap="round"
                      transform="rotate(-90 43 43)"
                    />
                  ))}
                </svg>
                <div className="flex flex-col gap-1.5 text-[12px]">
                  {moods.map((m) => (
                    <div key={m.cluster.id} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 flex-none rounded-sm"
                        style={{ background: m.count > 0 ? ringColors[ringSegments.findIndex((s) => s.cluster.id === m.cluster.id) % ringColors.length] : "var(--line)" }}
                      />
                      <span className="text-ink-soft">
                        {m.cluster.label} — {Math.round(m.pct * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </PlateFrame>
          )}

          {directors.length > 0 && (
            <PlateFrame title="Top directors" caption="By films watched." padded>
              <div className="flex flex-col">
                {directors.map((d) => (
                  <div key={d.director} className="flex items-center justify-between border-b border-line py-2 text-[12.5px] last:border-none">
                    <span className="text-ink">{d.director}</span>
                    <span className="font-mono text-ink-faint">{d.count}</span>
                  </div>
                ))}
              </div>
            </PlateFrame>
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <PlateFrame title="Diary" caption="Your most recently logged films." padded>
          <div className="flex flex-col">
            {recent.map((f) => (
              <Link
                key={f.id}
                href={`/film/${f.id}`}
                className="flex items-start gap-3 border-b border-line py-3 last:border-none"
              >
                <div className="w-11 flex-none text-center">
                  <div className="text-[16px] leading-none font-semibold text-ink">
                    {f.watchedOn ? new Date(`${f.watchedOn}T00:00:00`).getDate() : "—"}
                  </div>
                  <div className="text-[9px] tracking-[0.05em] text-ink-faint uppercase">
                    {f.watchedOn ? new Date(`${f.watchedOn}T00:00:00`).toLocaleDateString("en-US", { month: "short" }) : ""}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-ink">{f.title}</div>
                  <div className="mb-1 text-[11px] text-ink-faint">
                    {CLUSTERS.find((c) => c.id === f.cluster)?.label} · {"★".repeat(f.rating)}
                  </div>
                  {f.note && <div className="truncate text-[12px] text-ink-soft italic">&ldquo;{f.note}&rdquo;</div>}
                </div>
              </Link>
            ))}
          </div>
        </PlateFrame>
      )}

      {films.length > 0 && twins.length > 0 && (
        <FriendOverlapPlate yourFilms={films} twins={twins} clusters={CLUSTERS} isNewCollection={isNewCollection} />
      )}

      {films.length > 0 && twins.length === 0 && (
        <PlateFrame
          title="Taste Twins"
          caption="Add a friend to see where your collections agree — a real taste twin, not a percentage on a profile page."
        >
          <div className="flex h-[180px] flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-[14px] text-ink-soft">no one to overlay yet</p>
            <Link
              href="/friends"
              className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12px] font-semibold text-white"
            >
              Add a friend →
            </Link>
          </div>
        </PlateFrame>
      )}
    </AppShell>
  );
}

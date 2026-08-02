import Link from "next/link";
import { Frontispiece } from "@/components/atlas/Frontispiece";
import { OverlapLegend } from "@/components/atlas/OverlapLegend";
import { PlateFrame } from "@/components/atlas/PlateFrame";
import { OverlapCanvas } from "@/components/sky/OverlapCanvas";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import { verifySession } from "@/lib/dal";
import { listFilms, listFilmsForUser } from "@/lib/films";
import { listFriends } from "@/lib/friends";
import { signOut } from "@/lib/auth-actions";

const NEW_COLLECTION_THRESHOLD = 4;

export default async function CollectionPage() {
  const user = await verifySession();
  const [films, friends] = await Promise.all([listFilms(), listFriends()]);
  const twin = friends[0];
  const twinFilms = twin ? await listFilmsForUser(twin.id) : [];
  const sharedCount = twin ? films.filter((f) => twinFilms.some((tf) => tf.id === f.id)).length : 0;
  const isNewCollection = films.length > 0 && films.length < NEW_COLLECTION_THRESHOLD;

  return (
    <main className="mx-auto max-w-[740px] px-7 py-20">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-[10.5px] text-ink-soft">{user.email}</span>
        <div className="flex items-center gap-5">
          <Link href="/friends" className="font-mono text-[10.5px] tracking-[0.08em] text-brass uppercase">
            friends
          </Link>
          <form action={signOut}>
            <button type="submit" className="font-mono text-[10.5px] tracking-[0.08em] text-brass uppercase">
              sign out
            </button>
          </form>
        </div>
      </div>

      <Frontispiece />

      <div className="flex flex-col gap-[4.5rem]">
        <PlateFrame
          roman="I"
          title="the collection"
          caption={
            films.length === 0 ? (
              <>Nothing pressed here yet — the box above is where your first specimen will land.</>
            ) : isNewCollection ? (
              <>
                {films.length} specimen{films.length === 1 ? "" : "s"} placed — this is what it looks like
                early on. Click it to open its own page and see who else has placed the same film.{" "}
                <Link href="/log" className="text-oxblood not-italic">
                  Log another →
                </Link>{" "}
                Threads start connecting once a few films share a mood, and the taste-twin plate below gets
                more interesting the more you place.
              </>
            ) : (
              <>
                {films.length} specimens, pressed by feeling rather than genre code. <em>Solitudo</em> holds the
                quiet, tense ones; <em>Amplitudo</em> the epics; <em>Domus</em> the comfort watches;{" "}
                <em>Lacrima</em> what wrecked you. Rest the cursor on a specimen to read it, or click one to open
                its page.{" "}
                <Link href="/log" className="text-oxblood not-italic">
                  Log a new specimen →
                </Link>
              </>
            )
          }
        >
          {films.length === 0 ? (
            <div className="flex h-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
              <p className="font-body text-[16px] italic text-ink-soft">an empty sky has no stars yet</p>
              <Link
                href="/log"
                className="border border-brass px-6 py-3 font-display text-[11px] tracking-[0.14em] text-oxblood uppercase"
              >
                Log your first film →
              </Link>
            </div>
          ) : (
            <SkyCanvas films={films} clusters={CLUSTERS} height={420} showFrame showLabels interactive navigable />
          )}
        </PlateFrame>

        {films.length > 0 && twin && (
          <PlateFrame
            roman="II"
            title="two collections, overlaid"
            caption={
              <>
                Of {films.length} specimens in this survey, {sharedCount} fall in exactly the same place as{" "}
                {twin.email}&rsquo;s own collection — marked <em>coincident</em> above.{" "}
                {isNewCollection ? (
                  <>This fills in as you log more — the overlap only shows up once there&rsquo;s something to overlap.</>
                ) : (
                  <>That density of overlap, not a percentage on a profile page, is what makes them a taste twin.</>
                )}{" "}
                <Link href={`/friends/${twin.id}`} className="text-oxblood not-italic">
                  Open their full sky →
                </Link>
              </>
            }
          >
            <OverlapCanvas yourFilms={films} theirFilms={twinFilms} clusters={CLUSTERS} height={340} />
            <OverlapLegend />
          </PlateFrame>
        )}

        {films.length > 0 && !twin && (
          <PlateFrame
            roman="II"
            title="two collections, overlaid"
            caption={
              <>Add a friend to see where your collections agree — a real taste twin, not a percentage on a profile page.</>
            }
          >
            <div className="flex h-[220px] flex-col items-center justify-center gap-5 px-6 text-center">
              <p className="font-body text-[15px] italic text-ink-soft">no one to overlay yet</p>
              <Link
                href="/friends"
                className="border border-brass px-6 py-3 font-display text-[11px] tracking-[0.14em] text-oxblood uppercase"
              >
                Add a friend →
              </Link>
            </div>
          </PlateFrame>
        )}
      </div>
    </main>
  );
}

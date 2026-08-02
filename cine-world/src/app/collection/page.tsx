import Link from "next/link";
import { Frontispiece } from "@/components/atlas/Frontispiece";
import { OverlapLegend } from "@/components/atlas/OverlapLegend";
import { PlateFrame } from "@/components/atlas/PlateFrame";
import { OverlapCanvas } from "@/components/sky/OverlapCanvas";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import { MEI, MEI_FILMS } from "@/data/friends";
import { verifySession } from "@/lib/dal";
import { listFilms } from "@/lib/films";
import { signOut } from "@/lib/auth-actions";

export default async function CollectionPage() {
  const user = await verifySession();
  const films = await listFilms();
  const sharedCount = films.filter((f) => MEI.filmIds.includes(f.id)).length;

  return (
    <main className="mx-auto max-w-[740px] px-7 py-20">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-[10.5px] text-ink-soft">{user.email}</span>
        <form action={signOut}>
          <button type="submit" className="font-mono text-[10.5px] tracking-[0.08em] text-brass uppercase">
            sign out
          </button>
        </form>
      </div>

      <Frontispiece />

      <div className="flex flex-col gap-[4.5rem]">
        <PlateFrame
          roman="I"
          title="the collection"
          caption={
            films.length === 0 ? (
              <>Nothing pressed here yet — the box above is where your first specimen will land.</>
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

        {films.length > 0 && (
          <PlateFrame
            roman="II"
            title="two collections, overlaid"
            caption={
              <>
                Of {films.length} specimens in this survey, {sharedCount} fall in exactly the same place as{" "}
                {MEI.name}&rsquo;s own collection — marked <em>coincident</em> above. That density of overlap,
                not a percentage on a profile page, is what makes her a taste twin.
              </>
            }
          >
            <OverlapCanvas yourFilms={films} theirFilms={MEI_FILMS} clusters={CLUSTERS} height={340} />
            <OverlapLegend />
          </PlateFrame>
        )}
      </div>
    </main>
  );
}

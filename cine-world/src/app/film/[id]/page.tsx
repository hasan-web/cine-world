import Link from "next/link";
import { FilmEntry } from "@/components/atlas/FilmEntry";
import { PlateFrame } from "@/components/atlas/PlateFrame";
import { AddToCollectionMenu } from "@/components/collections/AddToCollectionMenu";
import { AppShell } from "@/components/shell/AppShell";
import { CommonsCanvas } from "@/components/sky/CommonsCanvas";
import { CLUSTERS } from "@/data/clusters";
import { verifySession } from "@/lib/dal";
import { listCollectionIdsForFilm, listCollections } from "@/lib/collections";
import { getFilm, getFilmCommons, listFilms } from "@/lib/films";
import { isPlaced } from "@/lib/types";

interface FilmPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function FilmPage({ params, searchParams }: FilmPageProps) {
  const { id } = await params;
  const { new: justLoggedParam } = await searchParams;
  const user = await verifySession();
  const [film, films, commons, collections, memberOf] = await Promise.all([
    getFilm(id),
    listFilms(),
    getFilmCommons(id),
    listCollections(),
    listCollectionIdsForFilm(id),
  ]);
  const specimenNumber = films.findIndex((f) => f.id === id) + 1;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/collection">
      {film ? (
        <div className="flex flex-col gap-8">
          <div className="glass p-6">
            <FilmEntry
              film={film}
              specimenNumber={specimenNumber > 0 ? specimenNumber : undefined}
              justLogged={justLoggedParam === "1"}
            />
            <div className="mt-5 border-t border-line pt-5">
              <AddToCollectionMenu filmId={film.id} collections={collections} memberOf={memberOf} />
            </div>
          </div>

          {/* The commons plots your placement against everyone else's, so it only means anything
              once you've actually placed this one. */}
          {isPlaced(film) ? (
            <PlateFrame
              title="Seen by others"
              caption={
                <>
                  Your entry above is one star. This is the same film seen as a <em>cloud</em> —{" "}
                  {commons.length} {commons.length === 1 ? "person has" : "people have"} logged it, each
                  placing it wherever it felt true to them. The brighter point marks yours inside the crowd.
                </>
              }
            >
              <CommonsCanvas placements={commons} yours={film} clusters={CLUSTERS} height={340} />
            </PlateFrame>
          ) : (
            <div className="glass p-6">
              <p className="mb-3 text-[13.5px] leading-[1.7] text-ink-soft">
                This one came in from an import and hasn&rsquo;t been placed yet, so it isn&rsquo;t in
                your sky and can&rsquo;t be compared against anyone else&rsquo;s.
              </p>
              <Link
                href="/place"
                className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-5 py-2 text-[12px] font-semibold text-white"
              >
                Place it now →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <p className="text-[15px] text-ink-soft italic">No specimen catalogued under &ldquo;{id}&rdquo;.</p>
      )}
    </AppShell>
  );
}

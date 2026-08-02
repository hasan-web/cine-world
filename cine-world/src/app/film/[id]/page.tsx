import Link from "next/link";
import { FilmEntry } from "@/components/atlas/FilmEntry";
import { PlateFrame } from "@/components/atlas/PlateFrame";
import { CommonsCanvas } from "@/components/sky/CommonsCanvas";
import { CLUSTERS } from "@/data/clusters";
import { getFilm, getFilmCommons, listFilms } from "@/lib/films";

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [film, films, commons] = await Promise.all([getFilm(id), listFilms(), getFilmCommons(id)]);
  const specimenNumber = films.findIndex((f) => f.id === id) + 1;

  return (
    <main className="mx-auto max-w-[740px] px-7 py-16">
      <Link href="/collection" className="font-mono text-[10.5px] tracking-[0.1em] text-brass uppercase">
        ← the collection
      </Link>

      {film ? (
        <div className="flex flex-col gap-[4.5rem]">
          <div className="relative mt-6 border border-line bg-paper-deep p-6 shadow-[0_10px_26px_-14px_rgba(43,32,24,0.35)]">
            <FilmEntry film={film} specimenNumber={specimenNumber > 0 ? specimenNumber : undefined} />
          </div>

          <PlateFrame
            roman="V"
            title="a specimen's public page"
            caption={
              <>
                Your entry above is one star. This is the same film seen as a <em>cloud</em> —{" "}
                {commons.length} {commons.length === 1 ? "person has" : "people have"} pressed it, each
                placing it wherever it felt true to them. The brighter point marks yours inside the crowd.
              </>
            }
          >
            <CommonsCanvas placements={commons} yours={film} clusters={CLUSTERS} height={340} />
          </PlateFrame>
        </div>
      ) : (
        <p className="mt-8 font-body text-[15px] italic text-ink-soft">
          No specimen catalogued under &ldquo;{id}&rdquo;.
        </p>
      )}
    </main>
  );
}

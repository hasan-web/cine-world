import { FilmEntry } from "@/components/atlas/FilmEntry";
import { PlateFrame } from "@/components/atlas/PlateFrame";
import { AppShell } from "@/components/shell/AppShell";
import { CommonsCanvas } from "@/components/sky/CommonsCanvas";
import { CLUSTERS } from "@/data/clusters";
import { verifySession } from "@/lib/dal";
import { getFilm, getFilmCommons, listFilms } from "@/lib/films";

interface FilmPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function FilmPage({ params, searchParams }: FilmPageProps) {
  const { id } = await params;
  const { new: justLoggedParam } = await searchParams;
  const user = await verifySession();
  const [film, films, commons] = await Promise.all([getFilm(id), listFilms(), getFilmCommons(id)]);
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
          </div>

          <PlateFrame
            title="Seen by others"
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
        <p className="text-[15px] text-ink-soft italic">No specimen catalogued under &ldquo;{id}&rdquo;.</p>
      )}
    </AppShell>
  );
}

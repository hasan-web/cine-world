import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { removeFilmFromCollectionAction } from "@/app/collections/actions";
import { CollectionHeaderControls } from "@/components/collections/CollectionHeaderControls";
import { AppShell } from "@/components/shell/AppShell";
import { CLUSTERS } from "@/data/clusters";
import { verifySession } from "@/lib/dal";
import { getCollection, listCollectionFilms } from "@/lib/collections";

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const collection = await getCollection(id);
  return { title: collection ? collection.name : "Collection" };
}

function moodLabel(cluster: string | null): string | null {
  return CLUSTERS.find((c) => c.id === cluster)?.label ?? null;
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { id } = await params;
  const user = await verifySession();
  const collection = await getCollection(id);
  if (!collection) notFound();

  const films = await listCollectionFilms(id);

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/collections">
      <div className="mx-auto w-full max-w-[640px]">
        <Link href="/collections" className="mb-4 inline-block text-[11px] tracking-[0.06em] text-accent uppercase">
          ← Collections
        </Link>

        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[19px] font-semibold text-ink">{collection.name}</h1>
        </div>
        <div className="mb-8">
          <CollectionHeaderControls id={collection.id} name={collection.name} />
        </div>

        {films.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="mb-2 text-[15px] font-semibold text-ink">Nothing in here yet.</p>
            <p className="text-[13.5px] text-ink-soft">
              Open any film&rsquo;s own page and add it to this collection from there.
            </p>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            {films.map((f) => (
              <div key={f.id} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-none">
                <Link href={`/film/${f.id}`} className="min-w-0 flex-1 hover:opacity-80">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[14px] font-medium text-ink">{f.title}</span>
                    <span className="text-[12px] text-ink-faint">{f.year}</span>
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2.5 text-[11.5px] text-ink-faint">
                    <span className="flex gap-1" aria-label={`${f.rating} of 5`}>
                      {Array.from({ length: 5 }, (_, s) => (
                        <span key={s} className={`h-1.5 w-1.5 rounded-full ${s < f.rating ? "bg-accent" : "bg-line"}`} />
                      ))}
                    </span>
                    {moodLabel(f.cluster) ? <span>{moodLabel(f.cluster)}</span> : <span className="italic">not placed</span>}
                  </span>
                </Link>
                <form action={removeFilmFromCollectionAction.bind(null, collection.id, f.id)}>
                  <button
                    type="submit"
                    className="text-[10.5px] tracking-[0.04em] text-ink-faint uppercase underline underline-offset-4"
                  >
                    remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

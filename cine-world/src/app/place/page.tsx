import type { Metadata } from "next";
import Link from "next/link";
import { DiscardUnplaced } from "@/components/place/DiscardUnplaced";
import { PlaceQueue } from "@/components/place/PlaceQueue";
import { AppShell } from "@/components/shell/AppShell";
import { verifySession } from "@/lib/dal";
import { countUnplacedFilms, listUnplacedFilms } from "@/lib/films";

export const metadata: Metadata = {
  title: "Place your films",
  alternates: { canonical: "/place" },
};

export default async function PlacePage() {
  const user = await verifySession();
  const [films, remaining] = await Promise.all([listUnplacedFilms(), countUnplacedFilms()]);

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/place">
      <div className="mx-auto w-full max-w-[560px]">
        <h1 className="mb-1 text-[16px] font-semibold text-ink">Place your films</h1>
        <p className="mb-7 max-w-[50ch] text-[13.5px] leading-[1.7] text-ink-soft">
          One at a time, and only the ones you have a feeling about — skipping is fine, and nothing
          moves into your sky until you place it.
        </p>

        {remaining === 0 ? (
          <div className="glass p-8 text-center">
            <p className="mb-2 text-[15px] font-semibold text-ink">Nothing waiting to be placed.</p>
            <p className="mb-6 text-[13.5px] text-ink-soft">
              Every film in your collection has a mood.
            </p>
            <Link
              href="/import"
              className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12.5px] font-semibold text-white"
            >
              Import from Letterboxd →
            </Link>
          </div>
        ) : (
          <>
            <PlaceQueue films={films} remaining={remaining} />
            <div className="mt-10 border-t border-line pt-6 text-center">
              <DiscardUnplaced count={remaining} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

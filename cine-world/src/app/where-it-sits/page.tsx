import type { Metadata } from "next";
import { PlacementQuiz } from "@/components/quiz/PlacementQuiz";
import { PublicPageShell } from "@/components/shell/PublicPageShell";
import { QUIZ_POOL } from "@/data/quiz";
import { getPlacementSplit } from "@/lib/placements";

const TITLE = "Where does it sit with you?";
const DESCRIPTION =
  "Eight films, four moods, no star ratings. Place them by how they actually felt and find out how unusually you watch — 60 seconds, no signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/where-it-sits" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/where-it-sits" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/** Crowd placements shift as people play, but not by the minute — an hour-stale split is a fine
 * trade for keeping a page built to absorb social traffic fully static between rebuilds. */
export const revalidate = 3600;

export default async function WhereItSitsPage() {
  // Every film the game can reach, not just the opening eight — a player who skips their way onto
  // bench titles should still get real percentages rather than silently dropping to the fallback.
  const split = await getPlacementSplit(QUIZ_POOL.map((f) => f.slug));

  return (
    <PublicPageShell>
      <div className="mx-auto w-full max-w-[560px] px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <PlacementQuiz split={split} />
      </div>
    </PublicPageShell>
  );
}

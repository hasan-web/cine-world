import type { Metadata } from "next";
import { AskCinemaClient } from "@/components/ask/AskCinemaClient";
import { AppShell } from "@/components/shell/AppShell";
import { ExampleContent } from "@/components/shell/ExampleContent";
import { EXAMPLE_FILMS } from "@/data/exampleFilms";
import { verifySession } from "@/lib/dal";
import { buildDiary } from "@/lib/diary";
import { buildStats, type MoodShare } from "@/lib/stats";
import { getCinemaInsights } from "@/lib/cinemaInsights";

export const metadata: Metadata = {
  title: "Ask My Cinema",
  alternates: { canonical: "/ask" },
};

function MoodBars({ moods }: { moods: MoodShare[] }) {
  return (
    <div className="flex flex-col gap-2">
      {moods.map((m) => (
        <div key={m.cluster.id}>
          <div className="mb-1 flex justify-between text-[10.5px] text-ink-faint">
            <span>{m.cluster.label}</span>
            <span>{Math.round(m.fraction * 100)}%</span>
          </div>
          <span className="block h-1.5 overflow-hidden rounded-full bg-line">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
              style={{ width: `${Math.max(m.fraction * 100, m.count > 0 ? 4 : 0)}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function InsightPanels({ monthNote, profileNote, moods }: { monthNote: string; profileNote: string; moods: MoodShare[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="glass p-4">
        <p className="mb-2 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">This month</p>
        <p className="text-[12.5px] leading-[1.6] text-ink">{monthNote}</p>
      </div>
      <div className="glass p-4">
        <p className="mb-2 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Your cinema profile</p>
        <p className="mb-3 text-[12.5px] leading-[1.6] text-ink">{profileNote}</p>
        <MoodBars moods={moods} />
      </div>
    </div>
  );
}

export default async function AskPage() {
  const user = await verifySession();
  const insights = await getCinemaInsights();

  const exampleMoods = buildStats(EXAMPLE_FILMS, buildDiary(EXAMPLE_FILMS)).moods;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/ask">
      <div className="mx-auto w-full max-w-[980px]">
        <h1 className="mb-1 text-[16px] font-semibold text-ink">Ask My Cinema</h1>
        <p className="mb-6 max-w-[60ch] text-[13.5px] leading-[1.7] text-ink-soft">
          A conversation with your own collection — grounded in what you&rsquo;ve actually logged, not the wider
          internet.
        </p>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <AskCinemaClient />
          {insights ? (
            <InsightPanels monthNote={insights.monthNote} profileNote={insights.profileNote} moods={insights.moods} />
          ) : (
            <ExampleContent label="what this fills in with">
              <InsightPanels
                monthNote="5 viewings logged across the sample collection — a rewatch of Amélie among them."
                profileNote="Leans Solitudo and Domus in equal measure — quiet, unresolved films sitting right alongside comfort rewatches."
                moods={exampleMoods}
              />
            </ExampleContent>
          )}
        </div>
      </div>
    </AppShell>
  );
}

import "server-only";
import { verifySession } from "@/lib/dal";
import { buildDiary } from "@/lib/diary";
import { listFilms } from "@/lib/films";
import { buildStats, type MoodShare } from "@/lib/stats";
import { chatCompletion } from "@/lib/groq";
import { createClient } from "@/lib/supabase/server";

export interface CinemaInsights {
  monthNote: string;
  profileNote: string;
  moods: MoodShare[];
}

const FRESH_MS = 24 * 60 * 60 * 1000;

interface InsightRow {
  month_note: string;
  profile_note: string;
  film_count_at_generation: number;
  generated_at: string;
}

/**
 * Ambient "this month" + "cinema profile" blurbs for /ask, cached in cinema_insights. Regenerates
 * only when the cache is missing, older than a day, or the film count has moved since it was
 * written — so a glance at the page doesn't cost a model call and the wording doesn't reshuffle
 * every time you look at it. Returns null for an empty collection rather than calling the model
 * over nothing; the page falls back to its own example content in that case.
 */
export async function getCinemaInsights(): Promise<CinemaInsights | null> {
  const user = await verifySession();
  const films = await listFilms();
  if (films.length === 0) return null;

  const viewings = buildDiary(films);
  const stats = buildStats(films, viewings);
  const supabase = await createClient();

  const { data } = await supabase
    .from("cinema_insights")
    .select("month_note, profile_note, film_count_at_generation, generated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const cached = data as InsightRow | null;
  const isFresh =
    cached != null &&
    cached.film_count_at_generation === films.length &&
    Date.now() - new Date(cached.generated_at).getTime() < FRESH_MS;

  if (isFresh) {
    return { monthNote: cached.month_note, profileNote: cached.profile_note, moods: stats.moods };
  }

  const generated = await generateInsightText(stats);

  await supabase.from("cinema_insights").upsert({
    user_id: user.id,
    month_note: generated.monthNote,
    profile_note: generated.profileNote,
    film_count_at_generation: films.length,
    generated_at: new Date().toISOString(),
  });

  return { monthNote: generated.monthNote, profileNote: generated.profileNote, moods: stats.moods };
}

interface GeneratedNotes {
  monthNote: string;
  profileNote: string;
}

async function generateInsightText(stats: ReturnType<typeof buildStats>): Promise<GeneratedNotes> {
  const thisMonth = stats.activity[stats.activity.length - 1];
  const lastMonth = stats.activity[stats.activity.length - 2];
  const topMood = stats.moods[0];
  const mostRewatched = stats.mostRewatched[0];

  const fallback: GeneratedNotes = {
    monthNote: `${thisMonth.count} viewing${thisMonth.count === 1 ? "" : "s"} logged this month.`,
    profileNote:
      topMood && topMood.count > 0
        ? `Leans ${topMood.cluster.label} — ${topMood.cluster.mood}.`
        : "Still finding a pattern.",
  };

  const facts = [
    `Films logged: ${stats.totalFilms}`,
    `Viewings this month (${thisMonth.label}): ${thisMonth.count}`,
    `Viewings last month (${lastMonth?.label ?? "n/a"}): ${lastMonth?.count ?? 0}`,
    `Total rewatches: ${stats.rewatches}`,
    `Average rating: ${stats.averageRating.toFixed(1)}`,
    `Top mood: ${topMood && topMood.count > 0 ? `${topMood.cluster.label} (${Math.round(topMood.fraction * 100)}%)` : "none yet"}`,
    `Most rewatched film: ${mostRewatched ? `${mostRewatched.title} (${mostRewatched.viewings} viewings)` : "none yet"}`,
  ].join("\n");

  try {
    const raw = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You write two short blurbs for a mood-based film diary app called Love for Cinema, in a " +
            "warm, literary, specific voice — never generic filler. Use ONLY the numbers given below; " +
            'never invent a statistic. Respond with strict JSON: {"monthNote": string, "profileNote": ' +
            'string}. monthNote: one sentence about this month\'s viewing activity, naming the real ' +
            "comparison to last month only if the numbers actually differ. profileNote: one to two " +
            "sentences describing their overall taste pattern from their top mood and rewatch habits.",
        },
        { role: "user", content: facts },
      ],
      true,
    );

    const parsed = JSON.parse(raw) as Partial<GeneratedNotes>;
    const monthNote = typeof parsed.monthNote === "string" ? parsed.monthNote.trim().slice(0, 300) : "";
    const profileNote = typeof parsed.profileNote === "string" ? parsed.profileNote.trim().slice(0, 400) : "";
    if (!monthNote || !profileNote) return fallback;
    return { monthNote, profileNote };
  } catch {
    return fallback;
  }
}

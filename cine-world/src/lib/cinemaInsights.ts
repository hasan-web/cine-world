import "server-only";
import { verifySession } from "@/lib/dal";
import { buildDiary } from "@/lib/diary";
import { buildStats, type MoodShare } from "@/lib/stats";
import { chatCompletion } from "@/lib/groq";
import { createClient } from "@/lib/supabase/server";
import type { Film } from "@/lib/types";

export interface CinemaInsights {
  monthNote: string;
  profileNote: string;
  moods: MoodShare[];
  personalityName: string;
  personalityTagline: string;
  rewatchRatePct: number;
  averageRating: number;
  topEra: string | null;
}

const FRESH_MS = 24 * 60 * 60 * 1000;

interface InsightRow {
  month_note: string;
  profile_note: string;
  personality_name: string;
  personality_tagline: string;
  film_count_at_generation: number;
  generated_at: string;
}

/** Most-logged release decade, e.g. "2010s" — ties broken by whichever decade appears first. */
function topDecade(films: Film[]): string | null {
  const counts = new Map<string, number>();
  for (const f of films) {
    if (!f.year) continue;
    const label = `${Math.floor(f.year / 10) * 10}s`;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [label, count] of counts) {
    if (count > bestCount) {
      best = label;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Ambient insight blurbs — "this month", a taste profile, and a named personality card — cached in
 * cinema_insights. Regenerates only when the cache is missing, stale, blank (pre-personality rows),
 * or the film count has moved since it was written, so a glance at the page doesn't cost a model
 * call and the wording doesn't reshuffle every time you look at it. Takes films rather than fetching
 * them itself since both /ask and /collection call this now and already have their own copy.
 * Returns null for an empty collection; callers fall back to their own example content.
 */
export async function getCinemaInsights(films: Film[]): Promise<CinemaInsights | null> {
  if (films.length === 0) return null;

  const user = await verifySession();
  const viewings = buildDiary(films);
  const stats = buildStats(films, viewings);
  const rewatchRatePct = stats.totalViewings > 0 ? Math.round((stats.rewatches / stats.totalViewings) * 100) : 0;
  const topEra = topDecade(films);

  const supabase = await createClient();
  const { data } = await supabase
    .from("cinema_insights")
    .select("month_note, profile_note, personality_name, personality_tagline, film_count_at_generation, generated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const cached = data as InsightRow | null;
  const isFresh =
    cached != null &&
    cached.personality_name !== "" &&
    cached.film_count_at_generation === films.length &&
    Date.now() - new Date(cached.generated_at).getTime() < FRESH_MS;

  if (isFresh) {
    return {
      monthNote: cached.month_note,
      profileNote: cached.profile_note,
      personalityName: cached.personality_name,
      personalityTagline: cached.personality_tagline,
      moods: stats.moods,
      rewatchRatePct,
      averageRating: stats.averageRating,
      topEra,
    };
  }

  const generated = await generateInsightText(stats);

  await supabase.from("cinema_insights").upsert({
    user_id: user.id,
    month_note: generated.monthNote,
    profile_note: generated.profileNote,
    personality_name: generated.personalityName,
    personality_tagline: generated.personalityTagline,
    film_count_at_generation: films.length,
    generated_at: new Date().toISOString(),
  });

  return {
    monthNote: generated.monthNote,
    profileNote: generated.profileNote,
    personalityName: generated.personalityName,
    personalityTagline: generated.personalityTagline,
    moods: stats.moods,
    rewatchRatePct,
    averageRating: stats.averageRating,
    topEra,
  };
}

interface GeneratedNotes {
  monthNote: string;
  profileNote: string;
  personalityName: string;
  personalityTagline: string;
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
    personalityName: "Your pattern, still forming",
    personalityTagline: "reads more clearly as you log more",
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
            "You write copy for a mood-based film diary app called Love for Cinema, in a warm, literary, " +
            "specific voice — never generic filler, and never a claim about who the person is outside " +
            "their viewing habits. Use ONLY the numbers given below; never invent a statistic. Respond " +
            'with strict JSON: {"monthNote": string, "profileNote": string, "personalityName": string, ' +
            '"personalityTagline": string}. monthNote: one sentence about this month\'s viewing activity, ' +
            "naming the real comparison to last month only if the numbers actually differ. profileNote: " +
            "one to two sentences describing their overall taste pattern from their top mood and rewatch " +
            "habits. personalityName: a short two-to-four-word archetype for how they watch, evocative but " +
            "always fair and flattering, never negative or presumptuous — e.g. 'The Patient Watcher'. " +
            "personalityTagline: one short lowercase phrase (under ten words, no ending punctuation) " +
            "elaborating the archetype, grounded in the actual numbers.",
        },
        { role: "user", content: facts },
      ],
      true,
    );

    const parsed = JSON.parse(raw) as Partial<GeneratedNotes>;
    const monthNote = typeof parsed.monthNote === "string" ? parsed.monthNote.trim().slice(0, 300) : "";
    const profileNote = typeof parsed.profileNote === "string" ? parsed.profileNote.trim().slice(0, 400) : "";
    const personalityName = typeof parsed.personalityName === "string" ? parsed.personalityName.trim().slice(0, 60) : "";
    const personalityTagline =
      typeof parsed.personalityTagline === "string" ? parsed.personalityTagline.trim().slice(0, 120) : "";
    if (!monthNote || !profileNote || !personalityName || !personalityTagline) return fallback;
    return { monthNote, profileNote, personalityName, personalityTagline };
  } catch {
    return fallback;
  }
}

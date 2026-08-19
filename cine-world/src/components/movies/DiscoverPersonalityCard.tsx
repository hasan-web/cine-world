"use client";

import { useEffect, useState } from "react";
import { fetchCinemaPersonality } from "@/app/movies/personality-actions";
import { CinemaPersonalityCard } from "@/components/personality/CinemaPersonalityCard";
import type { CinemaInsights } from "@/lib/cinemaInsights";

/**
 * Renders nothing for a signed-out visitor or a collection still too new to read fairly —
 * fetchCinemaPersonality() covers both cases the same way, returning null rather than the page
 * having to know which. Same defaults-to-nothing-until-resolved trade as HeaderAuthAction: a brief
 * absence on load is the fast path here, not a signed-in visitor's steady state.
 */
export function DiscoverPersonalityCard() {
  const [insights, setInsights] = useState<CinemaInsights | null>(null);

  useEffect(() => {
    fetchCinemaPersonality().then(setInsights);
  }, []);

  if (!insights) return null;

  return (
    <div className="mb-10">
      <CinemaPersonalityCard
        name={insights.personalityName}
        tagline={insights.personalityTagline}
        description={insights.profileNote}
        topMood={
          insights.moods[0] && insights.moods[0].count > 0
            ? { label: insights.moods[0].cluster.label, pct: Math.round(insights.moods[0].fraction * 100) }
            : null
        }
        rewatchRatePct={insights.rewatchRatePct}
        averageRating={insights.averageRating}
        topEra={insights.topEra}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { claimPlacements } from "@/app/where-it-sits/actions";
import { CLUSTERS } from "@/data/clusters";
import { QUIZ_BENCH, QUIZ_LENGTH, QUIZ_OPENING, archetypeFor } from "@/data/quiz";
import type { CatalogFilm } from "@/data/catalog";
import type { PlacementSplit } from "@/lib/placements";
import { createClient } from "@/lib/supabase/client";
import type { ClusterId } from "@/lib/types";

/** Survives the round trip to /login and back, which is the only way a finished game can still be
 * claimed — the sign-in flow lands on /collection, so the claim has to wait here until they return. */
const STORAGE_KEY = "lfc.placement-game.v1";

interface Answer {
  slug: string;
  title: string;
  year: number;
  chosen: ClusterId;
  /** The catalogue's own placement — the comparison used until a film has crowd numbers. */
  reference: ClusterId;
  /** Share of real placements that agree with `chosen`, or null below the anonymization floor. */
  crowdPct: number | null;
}

type Phase = "intro" | "asking" | "revealing" | "result";

function label(cluster: ClusterId): string {
  return CLUSTERS.find((c) => c.id === cluster)?.label ?? cluster;
}

function isCluster(value: unknown): value is ClusterId {
  return typeof value === "string" && CLUSTERS.some((c) => c.id === value);
}

/** Defensive because it's parsing whatever is sitting in localStorage, which is not a trusted shape. */
function restoreAnswers(): Answer[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const answers = parsed.filter(
      (a): a is Answer =>
        typeof a === "object" && a !== null && typeof a.slug === "string" && isCluster(a.chosen) && isCluster(a.reference),
    );
    return answers.length > 0 ? answers : null;
  } catch {
    return null;
  }
}

export function PlacementQuiz({ split }: { split: PlacementSplit }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [pool, setPool] = useState<CatalogFilm[]>(QUIZ_OPENING);
  const [benchIndex, setBenchIndex] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [claimState, setClaimState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Both reads are client-only and have to land after mount rather than during render: the page
    // is statically generated, so restoring a stored result synchronously would make the server's
    // markup and the client's first render disagree. Deferred to a microtask rather than awaited
    // behind the auth call, so a returning player's card paints immediately instead of waiting on
    // a network round trip it doesn't depend on.
    Promise.resolve().then(() => {
      if (cancelled) return;
      const restored = restoreAnswers();
      if (restored) {
        setAnswers(restored);
        setPhase("result");
      }
    });

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setSignedIn(Boolean(data.user));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const current = pool[index];
  const lastAnswer = answers[answers.length - 1];

  function agreementFor(slug: string, cluster: ClusterId): number | null {
    const counts = split[slug];
    if (!counts) return null;
    const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
    if (total === 0) return null;
    return Math.round(((counts[cluster] ?? 0) / total) * 100);
  }

  function choose(cluster: ClusterId) {
    setAnswers((prev) => [
      ...prev,
      {
        slug: current.slug,
        title: current.title,
        year: current.year,
        chosen: cluster,
        reference: current.cluster,
        crowdPct: agreementFor(current.slug, cluster),
      },
    ]);
    setPhase("revealing");
  }

  function next() {
    if (answers.length >= QUIZ_LENGTH) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      } catch {
        // A browser refusing storage (private mode, quota) costs the claim-on-return path only —
        // never the game itself, so there's nothing worth surfacing to the player here.
      }
      setPhase("result");
      return;
    }
    setIndex((i) => i + 1);
    setPhase("asking");
  }

  /** Swaps in a bench title in place, so the run is always the same length however many they skip. */
  function skip() {
    const replacement = QUIZ_BENCH[benchIndex];
    if (!replacement) return;
    setPool((prev) => prev.map((film, i) => (i === index ? replacement : film)));
    setBenchIndex((b) => b + 1);
  }

  function restart() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Same as above — a failed clear only means the old result lingers on this device.
    }
    setAnswers([]);
    setPool(QUIZ_OPENING);
    setBenchIndex(0);
    setIndex(0);
    setClaimState("idle");
    setPhase("asking");
  }

  async function claim() {
    setClaimState("saving");
    const result = await claimPlacements(answers.map((a) => ({ slug: a.slug, cluster: a.chosen })));
    setClaimState(result.error ? "error" : "saved");
  }

  if (phase === "intro") {
    return (
      <div className="glass px-6 py-9 text-center sm:px-9 sm:py-12">
        <p className="text-[10.5px] tracking-[0.14em] text-accent uppercase">Love for Cinema</p>
        <h1 className="mx-auto mt-3 max-w-[16ch] text-[26px] leading-[1.25] font-semibold text-ink sm:text-[30px]">
          Where does it sit with you?
        </h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-[13.5px] leading-[1.75] text-ink-soft">
          Eight films, four moods, no star ratings. Not what a film is <em className="not-italic text-ink">about</em> —
          where it actually sat with you.
        </p>
        <button
          type="button"
          onClick={() => setPhase("asking")}
          className="mt-7 w-full rounded-full bg-gradient-to-br from-accent to-accent-strong px-7 py-3.5 text-[13px] font-semibold text-white sm:w-auto"
        >
          Start →
        </button>
        <p className="mt-4 text-[11px] text-ink-faint">about 60 seconds · no signup</p>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <QuizResult
        answers={answers}
        signedIn={signedIn}
        claimState={claimState}
        onClaim={claim}
        onRestart={restart}
        copied={copied}
        setCopied={setCopied}
      />
    );
  }

  return (
    <div className="glass px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex gap-1" aria-label={`Film ${answers.length + (phase === "revealing" ? 0 : 1)} of ${QUIZ_LENGTH}`}>
        {Array.from({ length: QUIZ_LENGTH }, (_, i) => (
          <span
            key={i}
            className={`h-[3px] flex-1 rounded-full ${i < answers.length ? "bg-accent" : "bg-line"}`}
          />
        ))}
      </div>

      <div className="mt-6">
        <h1 className="text-[24px] leading-[1.2] font-semibold text-ink sm:text-[28px]">{current.title}</h1>
        <p className="mt-1.5 text-[12px] text-ink-faint">
          {current.director} · {current.year}
        </p>
      </div>

      {phase === "asking" ? (
        <>
          <p className="mt-5 mb-3 text-[12.5px] text-ink-soft">Not what it&rsquo;s about. Where it sat with you.</p>
          <div className="flex flex-col gap-2">
            {CLUSTERS.map((cluster) => (
              <button
                key={cluster.id}
                type="button"
                onClick={() => choose(cluster.id)}
                className="flex items-baseline justify-between gap-3 rounded-2xl border border-line px-4 py-4 text-left hover:border-accent/60 hover:bg-accent-soft/40"
              >
                <span className="text-[14px] font-semibold text-ink">{cluster.label}</span>
                <span className="text-[11px] text-ink-faint italic">{cluster.mood}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            disabled={benchIndex >= QUIZ_BENCH.length}
            className="mt-4 w-full py-2 text-center text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-4 disabled:opacity-40"
          >
            Haven&rsquo;t seen it — show me another
          </button>
        </>
      ) : (
        <div className="mt-5">
          <div className="rounded-2xl border border-line bg-glass-edge px-4 py-4">
            {lastAnswer?.crowdPct !== null && lastAnswer !== undefined ? (
              <>
                <p className="text-[15px] leading-[1.4] font-semibold text-accent-strong">
                  You&rsquo;re in the {lastAnswer.crowdPct}%.
                </p>
                <p className="mt-2 text-[12px] leading-[1.65] text-ink-soft">
                  That&rsquo;s how many people also file <em className="not-italic text-ink">{lastAnswer.title}</em>{" "}
                  under {label(lastAnswer.chosen)}.
                </p>
              </>
            ) : (
              <>
                <p className="text-[15px] leading-[1.4] font-semibold text-accent-strong">
                  {lastAnswer && lastAnswer.chosen === lastAnswer.reference
                    ? "The catalogue agrees."
                    : "The catalogue disagrees."}
                </p>
                <p className="mt-2 text-[12px] leading-[1.65] text-ink-soft">
                  We file it under {lastAnswer ? label(lastAnswer.reference) : ""}
                  {lastAnswer && lastAnswer.chosen !== lastAnswer.reference ? (
                    <> — you said {label(lastAnswer.chosen)}. Both can be right; that&rsquo;s the whole point.</>
                  ) : (
                    <>, same as you.</>
                  )}
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={next}
            className="mt-4 w-full rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-3.5 text-[13px] font-semibold text-white"
          >
            {answers.length >= QUIZ_LENGTH ? "See your result →" : "Next film →"}
          </button>
        </div>
      )}
    </div>
  );
}

interface QuizResultProps {
  answers: Answer[];
  signedIn: boolean;
  claimState: "idle" | "saving" | "saved" | "error";
  onClaim: () => void;
  onRestart: () => void;
  copied: boolean;
  setCopied: (v: boolean) => void;
}

function QuizResult({ answers, signedIn, claimState, onClaim, onRestart, copied, setCopied }: QuizResultProps) {
  const counts = CLUSTERS.reduce(
    (acc, cluster) => ({ ...acc, [cluster.id]: answers.filter((a) => a.chosen === cluster.id).length }),
    {} as Record<ClusterId, number>,
  );
  const total = answers.length || 1;
  const archetype = archetypeFor(counts);
  const shares = CLUSTERS.map((cluster) => ({ cluster, count: counts[cluster.id], pct: Math.round((counts[cluster.id] / total) * 100) })).sort(
    (a, b) => b.count - a.count,
  );

  // The headline is whichever placement the fewest people share — a card is only worth posting if it
  // leads with the most arguable thing on it. Falls back to the first disagreement with the
  // catalogue while crowd numbers are still below the floor.
  const withCrowd = answers.filter((a) => a.crowdPct !== null);
  const rarest = withCrowd.length > 0 ? withCrowd.reduce((min, a) => ((a.crowdPct ?? 100) < (min.crowdPct ?? 100) ? a : min)) : null;
  const firstClash = answers.find((a) => a.chosen !== a.reference) ?? null;
  const disagreements = answers.filter((a) => a.chosen !== a.reference).length;

  const shareText = rarest
    ? `I file ${rarest.title} under ${label(rarest.chosen)} — apparently only ${rarest.crowdPct}% of people agree.\n\nFour moods, no star ratings. Where do your films sit?\n`
    : `Apparently I'm "${archetype.name}" — ${archetype.tagline}.\n\nFour moods, no star ratings. Where do your films sit?\n`;

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(`${shareText}${window.location.href}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard access can be refused outright (permissions, insecure context). The card itself is
      // still on screen and screenshots fine, which is how most of these get shared anyway.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass px-6 py-8 text-center sm:px-8">
        <p className="text-[10.5px] tracking-[0.14em] text-accent uppercase">Love for Cinema</p>

        {rarest ? (
          <>
            <p className="mt-5 text-[44px] leading-none font-semibold text-accent-strong sm:text-[52px]">
              {rarest.crowdPct}%
            </p>
            <p className="mx-auto mt-3 max-w-[30ch] text-[13px] leading-[1.65] text-ink">
              of people file <em className="not-italic font-semibold">{rarest.title}</em> under{" "}
              {label(rarest.chosen)}. You&rsquo;re one of them.
            </p>
          </>
        ) : (
          <>
            <p className="mt-5 text-[44px] leading-none font-semibold text-accent-strong sm:text-[52px]">
              {disagreements}/{answers.length}
            </p>
            <p className="mx-auto mt-3 max-w-[32ch] text-[13px] leading-[1.65] text-ink">
              {firstClash ? (
                <>
                  placements where you and the catalogue disagreed — starting with{" "}
                  <em className="not-italic font-semibold">{firstClash.title}</em>.
                </>
              ) : (
                <>placements, and you agreed with the catalogue on every one.</>
              )}
            </p>
          </>
        )}

        <div className="my-6 h-px bg-line" />

        <p className="text-[10px] tracking-[0.12em] text-ink-faint uppercase">You watch like</p>
        <p className="mt-1.5 text-[19px] font-semibold text-ink">{archetype.name}</p>
        <p className="mt-1 text-[12px] text-ink-faint italic">{archetype.tagline}</p>

        <div className="mt-6 flex flex-col gap-2.5 text-left">
          {shares.map((s) => (
            <div key={s.cluster.id}>
              <div className="mb-1 flex justify-between text-[10.5px] text-ink-faint">
                <span>{s.cluster.label}</span>
                <span>{s.pct}%</span>
              </div>
              <span className="block h-1.5 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
                  style={{ width: `${Math.max(s.pct, s.count > 0 ? 4 : 0)}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass flex flex-col gap-3 px-5 py-5 sm:px-6">
        {signedIn ? (
          claimState === "saved" ? (
            <>
              <p className="text-center text-[13px] text-ink">Added to your sky.</p>
              <Link
                href="/collection"
                className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-3.5 text-center text-[13px] font-semibold text-white"
              >
                See your sky →
              </Link>
            </>
          ) : (
            <>
              <p className="text-center text-[13px] leading-[1.65] text-ink-soft">
                Keep these {answers.length} — they become the first stars in your sky.
              </p>
              <button
                type="button"
                onClick={onClaim}
                disabled={claimState === "saving"}
                className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-3.5 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                {claimState === "saving" ? "adding…" : "Add them to my sky →"}
              </button>
              <p className="text-center text-[10.5px] leading-[1.6] text-ink-faint">
                Added with a neutral rating and today&rsquo;s date, since the game didn&rsquo;t ask — both editable
                on each film.
              </p>
              {claimState === "error" && (
                <p className="text-center text-[11.5px] text-accent-strong">
                  Couldn&rsquo;t save these just now. Try again in a moment.
                </p>
              )}
            </>
          )
        ) : (
          <>
            <p className="text-center text-[13px] leading-[1.65] text-ink-soft">
              Keep these {answers.length} — sign in and they become the first stars in your own sky.
            </p>
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-3.5 text-center text-[13px] font-semibold text-white"
            >
              Create my sky →
            </Link>
            <p className="text-center text-[10.5px] text-ink-faint">
              Your placements are saved on this device — come back here to add them.
            </p>
          </>
        )}

        <div className="mt-1 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row">
          <button
            type="button"
            onClick={copyShare}
            className="flex-1 rounded-full border border-line-strong px-5 py-2.5 text-[12px] text-ink-soft"
          >
            {copied ? "Copied" : "Copy your result"}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 rounded-full border border-line-strong px-5 py-2.5 text-[12px] text-ink-soft"
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}

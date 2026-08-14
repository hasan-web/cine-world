import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A mood-based film diary and letterboxd alternative",
  description:
    "Constellation logs films by how they felt, not their genre — a letterboxd alternative built around honest rewatches and real taste-twin matches with friends, not a follower count.",
  alternates: { canonical: "/manifesto" },
};

export default function ManifestoPage() {
  return (
    <main className="mx-auto max-w-[620px] px-7 py-20">
      <Link href="/" className="font-mono text-[10.5px] tracking-[0.1em] text-brass uppercase">
        ← Constellation
      </Link>

      <p className="mt-8 mb-2 font-mono text-[10px] tracking-[0.2em] text-brass uppercase">Why we built it this way</p>
      <h1 className="mb-8 max-w-[16ch] font-body text-[26px] italic leading-tight text-ink">
        A mood-based film diary for people who are done with star averages
      </h1>

      <div className="flex flex-col gap-6 text-[15px] leading-[1.85] text-ink-soft [&_em]:font-medium [&_em]:text-oxblood [&_em]:not-italic">
        <p>
          Every film tracker eventually turns into the same thing: a poster grid, a number out of five, a public
          tally of everything you&rsquo;ve watched this year. That&rsquo;s useful for keeping score. It&rsquo;s
          not very useful for remembering what a film actually did to you. Constellation started as a{" "}
          <em>letterboxd alternative</em> for exactly that reason — not because the format is wrong, but because
          the unit it measures in is wrong. A genre tag doesn&rsquo;t tell you why a film mattered. A star rating
          doesn&rsquo;t either, once you&rsquo;ve logged a few hundred of them and they all start to blur.
        </p>

        <p>
          So instead of a grid, Constellation is a <em>mood-based film diary</em>. Every film you log becomes a
          specimen pressed into your own sky, and where it lands isn&rsquo;t decided by its genre — it&rsquo;s
          decided by you, by which of four moods it actually felt like: <em>Solitudo</em> for the quiet, tense
          ones, <em>Amplitudo</em> for the epics, <em>Domus</em> for comfort watches, <em>Lacrima</em> for what
          wrecked you. Two people can log the exact same film into two completely different moods, and both are
          right — that&rsquo;s the point. You&rsquo;re not filing a film into a catalogue&rsquo;s idea of what it
          is. You&rsquo;re placing it where it actually sat with you.
        </p>

        <p>
          That&rsquo;s what we mean when we say Constellation lets you <em>log films by how they felt</em>, not
          what they scored. The brightness of a specimen comes from how much it mattered to you, not from an
          aggregate of strangers&rsquo; opinions. A quiet film that changed how you see things can outshine a
          blockbuster you enjoyed and forgot by the weekend — because that&rsquo;s closer to the truth of how you
          actually experience films.
        </p>

        <p>
          Most trackers also treat a rewatch as a correction: you watch something again, you update the number,
          the old verdict disappears. Constellation treats it as a second data point instead of a replacement.
          Log a rewatch and it adds a new mark to that film&rsquo;s own timeline rather than overwriting the
          first one, so the way your reading of a film moved — sometimes gently, sometimes completely — stays
          visible instead of getting erased. Some of the most interesting entries in a collection are the ones
          where the newest mark and the oldest one don&rsquo;t agree at all.
        </p>

        <p>
          The part we&rsquo;re most protective of, though, is friends. Constellation isn&rsquo;t a social feed —
          there&rsquo;s no follower count, no public activity wall. What it has instead is a <em>taste twin</em>{" "}
          match: once you and a friend have both agreed to it, your collections overlay each other, and any film
          you both happened to place in the exact same spot lights up. Not a percentage-match score calculated
          behind the scenes — an actual shared coordinate, visible, specific, earned by two people independently
          placing the same film in the same corner of their own sky. That coincidence is a better definition of a
          taste twin than any algorithm we could have written instead.
        </p>

        <p>
          None of this makes Constellation faster to use than a five-tap rating. It&rsquo;s meant for people who
          already suspected that wasn&rsquo;t really the point — who want a record of what they watched that
          still means something to them years later, not just a list they can prove they finished.
        </p>
      </div>

      <div className="mt-12 border-t border-line-soft pt-8 text-center">
        <Link
          href="/login"
          className="font-mono text-[11px] tracking-[0.08em] text-oxblood uppercase underline decoration-oxblood/50 underline-offset-4"
        >
          Sign in and start your own sky →
        </Link>
      </div>
    </main>
  );
}

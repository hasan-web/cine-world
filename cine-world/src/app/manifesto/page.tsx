import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A mood-based film diary and letterboxd alternative",
  description:
    "Love for Cinema logs films by how they felt, not their genre — a letterboxd alternative built around honest rewatches and real taste-twin matches with friends, not a follower count.",
  alternates: { canonical: "/manifesto" },
};

export default function ManifestoPage() {
  return (
    <main className="mx-auto max-w-[680px] px-6 py-16 sm:px-10 sm:py-20">
      <Link href="/" className="text-[11px] tracking-[0.08em] text-accent uppercase">
        ← Love for Cinema
      </Link>

      <div className="glass mt-8 px-7 py-10 sm:px-12 sm:py-14">
        <p className="mb-2 text-[10.5px] tracking-[0.14em] text-accent uppercase">Why we built it this way</p>
        <h1 className="mb-8 max-w-[20ch] text-[26px] font-semibold text-ink">
          A mood-based film diary for people who are done with star averages
        </h1>

        <div className="flex flex-col gap-6 text-[15px] leading-[1.85] text-ink-soft [&_em]:font-semibold [&_em]:text-accent-strong [&_em]:not-italic">
        <p>
          Pauline Kael wrote film criticism for over two decades at The New Yorker and never once gave a star
          rating — she thought a number was a way of not having to say anything real about what a film did to
          you. Letterboxd runs on one anyway, because a library that size needs some way to stay navigable, and a
          score out of five is the simplest sort key there is. That&rsquo;s a fair trade for a catalogue. It&rsquo;s
          a worse one for a diary. A genre tag files <em>Amélie</em> and <em>Aftersun</em> under the same
          word — drama, on most sites — and tells you nothing about why one leaves you humming on the walk home
          and the other leaves you quiet for an hour. Love for Cinema started as a <em>letterboxd alternative</em>{" "}
          for exactly that reason: not because the format is wrong, but because the unit it measures in is wrong.
        </p>

        <p>
          So instead of a grid, Love for Cinema is a <em>mood-based film diary</em>. Every film you log becomes a
          specimen pressed into your own sky, and where it lands isn&rsquo;t decided by its genre — it&rsquo;s
          decided by you, by which of four moods it actually felt like: <em>Solitudo</em> for the quiet, tense
          ones, <em>Amplitudo</em> for the epics, <em>Domus</em> for comfort watches, <em>Lacrima</em>{" "}
          for what wrecked you. Two people can log the exact same film into two completely different moods, and
          both are right — that&rsquo;s the point. Someone can file <em>Alien</em>{" "}
          under Lacrima because it wrecked them, and someone else can file it under Domus because it&rsquo;s what
          they put on to fall asleep to, and neither of them has described the film wrong. You&rsquo;re not
          filing a film into a catalogue&rsquo;s
          idea of what it is. You&rsquo;re placing it where it actually sat with you.
        </p>

        <p>
          That&rsquo;s what we mean when we say Love for Cinema lets you <em>log films by how they felt</em>, not
          what they scored. The brightness of a specimen comes from how much it mattered to you, not from an
          aggregate of strangers&rsquo; opinions. A film as quiet as <em>Columbus</em>{" "}
          — two people talking about modernist architecture in a town neither of them meant to stay in — can
          outshine a blockbuster you
          enjoyed and forgot by the weekend, because that&rsquo;s closer to the truth of how you actually
          experience films.
        </p>

        <p>
          Most trackers also treat a rewatch as a correction: you watch something again, you update the number,
          the old verdict disappears. Love for Cinema treats it as a second data point instead of a replacement.
          Watch <em>Eternal Sunshine of the Spotless Mind</em>{" "}
          at twenty-two and it&rsquo;s a film about a breakup. Watch it again once you&rsquo;ve actually forgotten someone, on purpose or not, and it&rsquo;s
          a different film — not because it changed, but because you did. Log a rewatch and it adds a new mark to
          that film&rsquo;s own timeline rather than overwriting the first one, so the way your reading of a film
          moved — sometimes gently, sometimes completely — stays visible instead of getting erased. Some of the
          most interesting entries in a collection are the ones where the newest mark and the oldest one
          don&rsquo;t agree at all.
        </p>

        <p>
          The part we&rsquo;re most protective of, though, is friends. Love for Cinema isn&rsquo;t a social feed —
          there&rsquo;s no follower count, no public activity wall. What it has instead is a <em>taste twin</em>{" "}
          match: once you and a friend have both agreed to it, your collections overlay each other, and any film
          you both happened to place in the exact same spot lights up. A percentage-match score would tell you
          that you and a friend both &ldquo;liked&rdquo; <em>Burning</em>{" "}
          and leave it there. Finding out you both
          filed it, unprompted, in the exact same unsettled corner of your own sky tells you something a
          percentage can&rsquo;t — that the specific, hard-to-name unease it left in you was the same unease it
          left in them. That coincidence is a better definition of a taste twin than any algorithm we could have
          written instead.
        </p>

        <p>
            None of this makes Love for Cinema faster to use than a five-tap rating. It&rsquo;s meant for people
            who already suspected that wasn&rsquo;t really the point — who want a record of what they watched that
            still means something to them years later, not just a list they can prove they finished.
          </p>
        </div>

        <div className="mt-10 border-t border-line pt-8 text-center">
          <Link
            href="/login"
            className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-7 py-3 text-[12.5px] font-semibold text-white"
          >
            Sign in and start your own sky →
          </Link>
        </div>
      </div>
    </main>
  );
}

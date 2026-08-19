import type { Metadata } from "next";
import { ManifestoCta } from "@/components/manifesto/ManifestoCta";
import { PublicPageShell } from "@/components/shell/PublicPageShell";

export const metadata: Metadata = {
  title: "A mood-based film diary and letterboxd alternative",
  description:
    "Love for Cinema logs films by how they felt, not their genre — a letterboxd alternative built around honest rewatches and real taste-twin matches with friends, not a follower count.",
  alternates: { canonical: "/manifesto" },
};

export default function ManifestoPage() {
  return (
    <PublicPageShell>
    <div className="mx-auto max-w-[680px] px-6 pt-8 pb-16 sm:px-10 sm:pb-20">
      <div className="glass px-7 py-10 sm:px-12 sm:py-14">
        <p className="mb-2 text-[10.5px] tracking-[0.14em] text-accent uppercase">Why we built it this way</p>
        <h1 className="mb-8 max-w-[20ch] text-[26px] font-semibold text-ink">
          A mood-based film diary for people who are done with star averages
        </h1>

        <div className="flex flex-col gap-6 text-[15px] leading-[1.85] text-ink-soft [&_em]:font-semibold [&_em]:text-accent-strong [&_em]:not-italic">
        <p>
          Pauline Kael wrote about film for The New Yorker for more than twenty years and never once put a
          number on one. She had no patience for the practice. A score, as far as she was concerned, was a way
          of not having to say what a film had actually done to you.
        </p>

        <p>
          Letterboxd uses one anyway, and it&rsquo;s right to. A catalogue that size needs some way to stay
          navigable, and five stars is the simplest sort key there is. That&rsquo;s a fair trade for a library.
          It&rsquo;s a worse one for a diary.
        </p>

        <p>
          Genre does the same flattening. Most sites file <em>Amélie</em> and <em>Aftersun</em>{" "}
          under the same word — drama — which tells you nothing about why one sends you home humming and the other leaves you
          sitting in the dark for an hour after the credits. We started Love for Cinema as a letterboxd
          alternative for that reason. The format isn&rsquo;t the problem. The unit is.
        </p>

        <p>
          So there&rsquo;s no grid here. Every film you log gets pressed into your own sky like a specimen, and
          where it lands is up to you: four moods, no genres. <em>Solitudo</em>{" "}
          for the quiet ones and the tense ones. <em>Amplitudo</em> for the ones built at scale.{" "}
          <em>Domus</em> for comfort. <em>Lacrima</em>{" "}
          for whatever took something out of you.
        </p>

        <p>
          Two people can put the same film in two different moods and both be right. Someone files{" "}
          <em>Alien</em>{" "}
          under Lacrima. Someone else falls asleep to it once a month and files it under Domus. Neither of them
          is wrong, because neither of them is describing <em>Alien</em>. They&rsquo;re
          describing where it sat with them.
        </p>

        <p>
          Brightness works the same way. How bright a specimen burns comes from how much the film mattered to
          you, not from an aggregate of strangers. Something as quiet as <em>Columbus</em>{" "}
          — two people talking about modernist architecture in a town neither of them meant to stay in — can outshine a blockbuster
          you enjoyed and had forgotten by Sunday. That&rsquo;s usually closer to the truth of it anyway.
        </p>

        <p>
          Most trackers treat a rewatch as a correction. You watch it again, you fix the number, the old verdict
          disappears. We treat it as a second data point. Watch <em>Eternal Sunshine of the Spotless Mind</em>{" "}
          at twenty-two and it&rsquo;s a film about a breakup. Watch it again after you&rsquo;ve actually forgotten
          someone, on purpose or otherwise, and it&rsquo;s a different film, though nothing about it changed.
          Logging a rewatch adds a mark to that film&rsquo;s own timeline instead of writing over the first one,
          so the drift stays visible. Some of the best entries in a collection are the ones where the newest
          mark and the oldest one flatly disagree.
        </p>

        <p>
          The part we&rsquo;re most protective of is friends. There&rsquo;s no feed here, no follower count, no
          wall of activity. What there is instead is a taste twin match: you and a friend both opt in, your
          collections overlay each other, and any film you both happened to place in exactly the same spot
          lights up. A percentage would tell you the two of you both liked <em>Burning</em>{" "}
          and stop there. Finding out you&rsquo;d independently filed it in the same unsettled corner of your own sky tells you
          something a percentage can&rsquo;t reach — that the specific, hard-to-name thing it left in you was the
          thing it left in them too. We couldn&rsquo;t have written an algorithm that finds that. The coincidence
          does it for free.
        </p>

        <p>
          None of this is faster than tapping four stars and moving on. It was never going to be. Love for
          Cinema is for people who want to log films by how they felt, not what they scored, and who want a
          record that still means something to them in ten years rather than one that proves they got through
          the list.
        </p>
        </div>

        <ManifestoCta />
      </div>
    </div>
    </PublicPageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Reveal } from "@/components/motion/Reveal";
import { getCatalogFilmsByCluster } from "@/data/catalog";
import { CLUSTERS } from "@/data/clusters";

export const metadata: Metadata = {
  title: "Moods",
  description:
    "Four moods, not a genre list — Solitudo, Amplitudo, Domus, Lacrima. How Love for Cinema actually sorts films.",
  alternates: { canonical: "/moods" },
};

export default function MoodsIndexPage() {
  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-[820px] px-6 pb-16 sm:px-10 sm:pb-20">
        <Reveal>
          <p className="mb-2 pt-8 text-[11px] tracking-[0.2em] text-accent uppercase">Browse</p>
          <h1 className="mb-3 text-[28px] font-semibold text-ink">Moods</h1>
          <p className="mb-10 max-w-[62ch] text-[14.5px] leading-[1.8] text-ink-soft">
            Not a genre list. Every film in Love for Cinema is placed in one of four moods, chosen by how it felt
            rather than what it&rsquo;s about — <Link href="/manifesto" className="text-accent hover:underline">the reasoning is here</Link>.
          </p>
        </Reveal>

        <div className="flex flex-col gap-4">
          {CLUSTERS.map((cluster, i) => {
            const films = getCatalogFilmsByCluster(cluster.id);
            return (
              <Reveal key={cluster.id} delay={i * 80}>
                <Link href={`/moods/${cluster.id}`} className="glass flex flex-col gap-2 px-6 py-6 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[18px] font-semibold text-accent-strong">{cluster.label}</span>
                    <span className="text-[12px] text-ink-faint">{cluster.mood}</span>
                  </div>
                  <p className="max-w-[58ch] text-[13.5px] leading-[1.7] text-ink-soft">{cluster.description}</p>
                  <p className="text-[11.5px] text-ink-faint">
                    {films.length} film{films.length === 1 ? "" : "s"} in this mood →
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </main>
      <div className="px-4 pb-4 sm:px-6">
        <LandingFooter />
      </div>
    </>
  );
}

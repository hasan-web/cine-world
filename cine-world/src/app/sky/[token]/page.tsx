import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicSkyCanvas } from "@/components/sky/PublicSkyCanvas";
import { ShareIntents } from "@/components/sky/ShareIntents";
import { Reveal } from "@/components/motion/Reveal";
import { PublicPageShell } from "@/components/shell/PublicPageShell";
import { CLUSTERS } from "@/data/clusters";
import { getPublicSky } from "@/lib/films";

// New tokens can't be enumerated at build time, so pages generate on first request and are cached
// after that (dynamicParams defaults to true) — a day is plenty for a sky that changes this slowly.
export const revalidate = 86400;

interface SkyPageProps {
  params: Promise<{ token: string }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: SkyPageProps): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "A sky on Love for Cinema",
    description: "Someone's real film collection, placed by mood rather than genre — not a poster grid.",
    alternates: { canonical: `/sky/${token}` },
    // Deliberately not indexed: this is a link someone shares on purpose with people they choose,
    // not a page meant to surface in search the way the curated /movies pages are.
    robots: { index: false, follow: true },
  };
}

export default async function SkyPage({ params }: SkyPageProps) {
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();

  const stars = await getPublicSky(token);
  if (stars.length === 0) notFound();

  const shareUrl = `https://loveforcinema.com/sky/${token}`;
  const shareText = "A sky on Love for Cinema — a film diary that places films by mood, not genre.";

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-[820px] px-6 pb-16 sm:px-10 sm:pb-20">
        <Reveal>
          <p className="mb-2 pt-8 text-[11px] tracking-[0.2em] text-accent uppercase">A sky on Love for Cinema</p>
          <h1 className="mb-3 text-[28px] font-semibold text-ink">
            {stars.length} film{stars.length === 1 ? "" : "s"}, placed by feeling
          </h1>
          <p className="mb-8 max-w-[62ch] text-[14.5px] leading-[1.8] text-ink-soft">
            Not a poster grid, not a star average — where each film sits was chosen by the person who logged
            it, by which of four moods it actually felt like. Rest the cursor on a star to see what it is.
          </p>
        </Reveal>

        <Reveal delay={90}>
          <div className="glass mb-8 overflow-hidden">
            <PublicSkyCanvas stars={stars} clusters={CLUSTERS} height={420} />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="glass flex flex-wrap items-center justify-between gap-5 px-6 py-6">
            <div>
              <p className="mb-1 text-[14px] font-semibold text-ink">Want your own?</p>
              <p className="text-[12.5px] text-ink-soft">Free, and nobody sees it unless you choose to share it.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <ShareIntents url={shareUrl} text={shareText} />
              <Link
                href="/login"
                className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12.5px] font-semibold text-white"
              >
                Join Love for Cinema →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </PublicPageShell>
  );
}

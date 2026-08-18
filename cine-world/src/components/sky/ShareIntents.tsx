"use client";

interface ShareIntentsProps {
  url: string;
  text: string;
}

const ICON_PROPS = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true } as const;

/** Simple, hand-drawn glyphs — not a reproduction of any platform's mark, just enough to read as "X" / "chat" / "network" at a glance. */
const ICONS = {
  x: (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  ),
  whatsapp: (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M6 18l-1.4 3.4L8 20a8 8 0 1 0-3-3.2L6 18Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  linkedin: (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="7" cy="7" r="2" />
      <path d="M7 11v9M13 20v-5.5a2.5 2.5 0 0 1 5 0V20" strokeLinecap="round" />
    </svg>
  ),
};

/** Opens each platform's own share/compose flow in a new tab, prefilled where the platform supports it. */
function intentUrl(platform: keyof typeof ICONS, url: string, text: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  }
}

export function ShareIntents({ url, text }: ShareIntentsProps) {
  return (
    <div className="flex items-center gap-2">
      {(Object.keys(ICONS) as Array<keyof typeof ICONS>).map((platform) => (
        <a
          key={platform}
          href={intentUrl(platform, url, text)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${platform}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-soft hover:border-accent/50 hover:text-accent-strong"
        >
          {ICONS[platform]}
        </a>
      ))}
    </div>
  );
}

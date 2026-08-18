"use client";

import { useState, useTransition } from "react";
import { generateShareToken, revokeShareToken } from "@/app/collection/actions";

interface ShareLinkControlProps {
  initialToken: string | null;
}

/**
 * The public link is opt-in and starts off — nothing here is reachable by anyone until the person
 * whose sky it is explicitly asks for a link. "Turn off" sets it back to that state; it doesn't
 * delete anything, just makes the URL stop resolving.
 */
export function ShareLinkControl({ initialToken }: ShareLinkControlProps) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const url = token ? `https://loveforcinema.com/sky/${token}` : null;

  function handleGenerate() {
    startTransition(async () => {
      const newToken = await generateShareToken();
      setToken(newToken);
      setCopied(false);
    });
  }

  function handleCopy() {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleTurnOff() {
    startTransition(async () => {
      await revokeShareToken();
      setToken(null);
    });
  }

  if (!token) {
    return (
      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="rounded-full border border-line-strong px-4 py-2 text-[12px] font-semibold text-ink-soft hover:border-accent/50 hover:text-ink disabled:opacity-50"
      >
        {pending ? "creating…" : "Get a public link →"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="max-w-[220px] truncate rounded-full bg-glass-edge px-3 py-1.5 font-mono text-[11px] text-ink-soft">
        {url}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-line-strong px-3 py-1.5 text-[11px] font-semibold text-ink-soft hover:text-ink"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={handleTurnOff}
        disabled={pending}
        className="text-[11px] text-ink-faint underline underline-offset-4 hover:text-ink disabled:opacity-50"
      >
        Turn off
      </button>
    </div>
  );
}

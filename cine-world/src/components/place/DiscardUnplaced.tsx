"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { discardImported } from "@/app/import/actions";

/** Two-step by design — this deletes rows, so it shouldn't be one stray click away. */
export function DiscardUnplaced({ count }: { count: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    await discardImported();
    setPending(false);
    setConfirming(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-4"
      >
        discard the {count.toLocaleString()} unplaced film{count === 1 ? "" : "s"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="text-[12.5px] text-ink-soft">
        Delete all {count.toLocaleString()} unplaced film{count === 1 ? "" : "s"}? Films you&rsquo;ve
        already placed aren&rsquo;t touched.
      </span>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-full border border-accent-strong px-4 py-1.5 text-[11.5px] font-semibold text-accent-strong disabled:opacity-50"
      >
        {pending ? "discarding…" : "yes, discard"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="text-[11.5px] text-ink-faint underline underline-offset-4"
      >
        cancel
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { importLetterboxd, type ImportState } from "@/app/import/actions";

const initialState: ImportState = {};

export function ImportForm() {
  const [state, action, pending] = useActionState(importLetterboxd, initialState);
  const result = state.result;

  return (
    <>
      <form action={action} className="glass p-6">
        <label className="mb-4 block">
          <span className="mb-2 block text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">
            Your export file
          </span>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="w-full text-[13px] text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-2 file:text-[12px] file:font-semibold file:text-accent-strong"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50"
        >
          {pending ? "reading your library…" : "Import films →"}
        </button>

        {state.error && <p className="mt-4 text-[12.5px] text-accent-strong">{state.error}</p>}
      </form>

      {result && (
        <div className="glass mt-5 p-6">
          <p className="mb-3 text-[15px] font-semibold text-ink">
            {result.imported > 0
              ? `${result.imported.toLocaleString()} film${result.imported === 1 ? "" : "s"} imported.`
              : "Nothing new to import."}
          </p>

          <ul className="mb-5 flex flex-col gap-1.5 text-[13px] text-ink-soft">
            {result.alreadyHad > 0 && (
              <li>
                {result.alreadyHad.toLocaleString()} were already in your collection — those were left
                exactly as you had them.
              </li>
            )}
            {result.unreadable > 0 && (
              <li>{result.unreadable.toLocaleString()} rows couldn&rsquo;t be read and were skipped.</li>
            )}
            {result.overCap > 0 && (
              <li>
                {result.overCap.toLocaleString()} didn&rsquo;t fit within the import limit. Import the
                file again to bring in the rest.
              </li>
            )}
          </ul>

          {result.imported > 0 && (
            <>
              <p className="mb-4 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
                They&rsquo;re waiting to be placed. Letterboxd knows what you watched and how you rated
                it, but not how it <em className="not-italic text-accent-strong">felt</em> — so none of
                them are in your sky until you say where they belong.
              </p>
              <Link
                href="/place"
                className="inline-block rounded-full bg-gradient-to-br from-accent to-accent-strong px-6 py-2.5 text-[12.5px] font-semibold text-white"
              >
                Start placing them →
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  addFilmToCollectionAction,
  createCollectionAndAddFilmAction,
  removeFilmFromCollectionAction,
} from "@/app/collections/actions";
import type { Collection } from "@/lib/types";

interface AddToCollectionMenuProps {
  filmId: string;
  collections: Collection[];
  memberOf: string[];
}

export function AddToCollectionMenu({ filmId, collections, memberOf }: AddToCollectionMenuProps) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(new Set(memberOf));
  const [known, setKnown] = useState(collections);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(collectionId: string) {
    const isMember = checked.has(collectionId);
    setChecked((prev) => {
      const next = new Set(prev);
      if (isMember) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
    startTransition(async () => {
      if (isMember) await removeFilmFromCollectionAction(collectionId, filmId);
      else await addFilmToCollectionAction(collectionId, filmId);
    });
  }

  function createAndAdd() {
    const name = newName.trim();
    if (!name) return;
    setNewName("");
    startTransition(async () => {
      const collection = await createCollectionAndAddFilmAction(name, filmId);
      if (collection) {
        setKnown((prev) => [...prev, collection]);
        setChecked((prev) => new Set(prev).add(collection.id));
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-line-strong px-4 py-1.5 text-[11.5px] text-ink-soft hover:border-accent/50 hover:text-ink"
      >
        {checked.size > 0 ? `In ${checked.size} collection${checked.size === 1 ? "" : "s"} →` : "Add to collection →"}
      </button>
    );
  }

  return (
    <div className="w-full max-w-[320px] rounded-xl border border-line-strong bg-glass-strong p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Add to collection</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-ink-faint">
          done
        </button>
      </div>

      {known.length === 0 ? (
        <p className="mb-3 text-[12.5px] text-ink-soft italic">No collections yet — create one below.</p>
      ) : (
        <div className="mb-3 flex flex-col gap-1.5">
          {known.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              disabled={pending}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] text-ink hover:bg-glass-edge disabled:opacity-60"
            >
              <span
                className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border ${
                  checked.has(c.id) ? "border-accent-strong bg-accent-strong" : "border-line-strong"
                }`}
              >
                {checked.has(c.id) && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="min-w-0 truncate">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-2 border-t border-line pt-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
          placeholder="new collection…"
          className="flex-1 border-b border-line bg-transparent pb-1 text-[12.5px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="button"
          onClick={createAndAdd}
          disabled={pending || !newName.trim()}
          className="text-[10.5px] font-semibold text-accent-strong uppercase disabled:opacity-50"
        >
          create
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCollectionAction, renameCollectionAction } from "@/app/collections/actions";

interface CollectionHeaderControlsProps {
  id: string;
  name: string;
}

export function CollectionHeaderControls({ id, name }: CollectionHeaderControlsProps) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [value, setValue] = useState(name);
  const [pending, setPending] = useState(false);

  async function saveRename() {
    setPending(true);
    await renameCollectionAction(id, value);
    setPending(false);
    setRenaming(false);
    router.refresh();
  }

  async function runDelete() {
    setPending(true);
    await deleteCollectionAction(id);
    router.push("/collections");
  }

  if (renaming) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveRename();
        }}
        className="flex flex-wrap items-baseline gap-3"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="border-b border-line-strong bg-transparent pb-1 text-[16px] font-semibold text-ink outline-none"
        />
        <button type="submit" disabled={pending} className="text-[11px] font-semibold text-accent-strong uppercase disabled:opacity-50">
          {pending ? "saving…" : "save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(name);
            setRenaming(false);
          }}
          className="text-[11px] text-ink-faint uppercase"
        >
          cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={() => setRenaming(true)} className="text-[11px] text-ink-faint underline underline-offset-4">
        rename
      </button>
      {confirmingDelete ? (
        <span className="flex flex-wrap items-center gap-3">
          <span className="text-[11.5px] text-ink-soft">Delete this collection? Films themselves aren&rsquo;t touched.</span>
          <button
            type="button"
            onClick={runDelete}
            disabled={pending}
            className="text-[11px] font-semibold text-accent-strong underline underline-offset-4 disabled:opacity-50"
          >
            {pending ? "deleting…" : "yes, delete"}
          </button>
          <button type="button" onClick={() => setConfirmingDelete(false)} className="text-[11px] text-ink-faint underline underline-offset-4">
            cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="text-[11px] text-ink-faint underline underline-offset-4"
        >
          delete
        </button>
      )}
    </div>
  );
}

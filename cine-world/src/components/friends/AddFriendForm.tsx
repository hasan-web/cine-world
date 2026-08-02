"use client";

import { useActionState } from "react";
import { addFriend, type AddFriendState } from "@/app/friends/actions";

const initialState: AddFriendState = {};

export function AddFriendForm() {
  const [state, action, pending] = useActionState(addFriend, initialState);

  return (
    <form action={action} className="flex flex-wrap items-baseline gap-3">
      <input
        name="email"
        type="email"
        required
        placeholder="their email…"
        autoComplete="off"
        className="flex-1 border-b border-line bg-transparent pb-1.5 font-mono text-[13px] text-ink outline-none placeholder:text-ink-soft/60"
      />
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-[10.5px] tracking-[0.08em] text-oxblood uppercase underline decoration-oxblood/50 underline-offset-4 disabled:opacity-50"
      >
        {pending ? "sending…" : "send request →"}
      </button>
      {state.error && <p className="basis-full text-[12.5px] text-oxblood">{state.error}</p>}
      {state.success && <p className="basis-full text-[12.5px] text-brass">{state.success}</p>}
    </form>
  );
}

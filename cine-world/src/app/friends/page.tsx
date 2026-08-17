import Link from "next/link";
import { AddFriendForm } from "@/components/friends/AddFriendForm";
import { AppShell } from "@/components/shell/AppShell";
import { verifySession } from "@/lib/dal";
import { listFriends, listIncomingRequests, listSentRequests } from "@/lib/friends";
import { acceptRequest, removeFriend } from "./actions";

export default async function FriendsPage() {
  const user = await verifySession();
  const [friends, incoming, sent] = await Promise.all([listFriends(), listIncomingRequests(), listSentRequests()]);

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/friends">
      <div className="mx-auto w-full max-w-[560px]">
        <h1 className="mb-1 text-[16px] font-semibold text-ink">Friends</h1>
        <p className="mb-8 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
          Seeing someone&rsquo;s full collection takes both sides agreeing — send a request, and they decide
          whether to open their sky to you.
        </p>

        <section className="glass mb-6 p-6">
          <p className="mb-4 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Add a friend</p>
          <AddFriendForm />
        </section>

        {incoming.length > 0 && (
          <section className="glass mb-6 p-6">
            <p className="mb-3 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Requests</p>
            <ul className="flex flex-col gap-2">
              {incoming.map((f) => (
                <li key={f.id} className="flex items-center justify-between border-b border-line py-2 last:border-none">
                  <span className="text-[12.5px] text-ink">{f.email}</span>
                  <div className="flex gap-4">
                    <form action={acceptRequest.bind(null, f.id)}>
                      <button
                        type="submit"
                        className="text-[10.5px] font-semibold tracking-[0.04em] text-accent-strong uppercase underline decoration-accent-strong/50 underline-offset-4"
                      >
                        accept
                      </button>
                    </form>
                    <form action={removeFriend.bind(null, f.id)}>
                      <button type="submit" className="text-[10.5px] tracking-[0.04em] text-ink-faint uppercase underline underline-offset-4">
                        decline
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="glass mb-6 p-6">
          <p className="mb-3 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Your friends</p>
          {friends.length === 0 ? (
            <p className="text-[13px] text-ink-soft italic">No accepted friends yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {friends.map((f) => (
                <li key={f.id} className="flex items-center justify-between border-b border-line py-2 last:border-none">
                  <Link href={`/friends/${f.id}`} className="text-[12.5px] text-ink underline decoration-line-strong underline-offset-4">
                    {f.email}
                  </Link>
                  <form action={removeFriend.bind(null, f.id)}>
                    <button type="submit" className="text-[10.5px] tracking-[0.04em] text-ink-faint uppercase underline underline-offset-4">
                      remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        {sent.length > 0 && (
          <section className="glass p-6">
            <p className="mb-3 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">Sent, awaiting reply</p>
            <ul className="flex flex-col gap-2">
              {sent.map((f) => (
                <li key={f.id} className="flex items-center justify-between border-b border-line py-2 last:border-none">
                  <span className="text-[12.5px] text-ink">{f.email}</span>
                  <form action={removeFriend.bind(null, f.id)}>
                    <button type="submit" className="text-[10.5px] tracking-[0.04em] text-ink-faint uppercase underline underline-offset-4">
                      cancel
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}

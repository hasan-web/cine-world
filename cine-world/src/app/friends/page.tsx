import Link from "next/link";
import { AddFriendForm } from "@/components/friends/AddFriendForm";
import { verifySession } from "@/lib/dal";
import { listFriends, listIncomingRequests, listSentRequests } from "@/lib/friends";
import { acceptRequest, removeFriend } from "./actions";

export default async function FriendsPage() {
  await verifySession();
  const [friends, incoming, sent] = await Promise.all([listFriends(), listIncomingRequests(), listSentRequests()]);

  return (
    <main className="mx-auto max-w-[560px] px-7 py-16">
      <Link href="/collection" className="font-mono text-[10.5px] tracking-[0.1em] text-brass uppercase">
        ← the collection
      </Link>

      <h1 className="mt-6 mb-1 font-display text-[13px] tracking-[0.14em] text-oxblood uppercase">
        Plate VI <span className="ml-2 font-body text-[15px] tracking-normal italic text-ink-soft normal-case">— kindred collections</span>
      </h1>
      <p className="mb-8 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
        Seeing someone&rsquo;s full collection takes both sides agreeing — send a request, and they decide
        whether to open their sky to you.
      </p>

      <section className="mb-10 border border-line bg-paper-deep p-6">
        <p className="mb-4 font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Add a friend</p>
        <AddFriendForm />
      </section>

      {incoming.length > 0 && (
        <section className="mb-10">
          <p className="mb-3 font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Requests</p>
          <ul className="flex flex-col gap-2">
            {incoming.map((f) => (
              <li key={f.id} className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-mono text-[12.5px] text-ink">{f.email}</span>
                <div className="flex gap-4">
                  <form action={acceptRequest.bind(null, f.id)}>
                    <button
                      type="submit"
                      className="font-mono text-[10.5px] tracking-[0.08em] text-oxblood uppercase underline decoration-oxblood/50 underline-offset-4"
                    >
                      accept
                    </button>
                  </form>
                  <form action={removeFriend.bind(null, f.id)}>
                    <button
                      type="submit"
                      className="font-mono text-[10.5px] tracking-[0.08em] text-ink-soft uppercase underline underline-offset-4"
                    >
                      decline
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <p className="mb-3 font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Your friends</p>
        {friends.length === 0 ? (
          <p className="font-body text-[13px] italic text-ink-soft">No accepted friends yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {friends.map((f) => (
              <li key={f.id} className="flex items-center justify-between border-b border-line pb-2">
                <Link href={`/friends/${f.id}`} className="font-mono text-[12.5px] text-ink underline decoration-line underline-offset-4">
                  {f.email}
                </Link>
                <form action={removeFriend.bind(null, f.id)}>
                  <button
                    type="submit"
                    className="font-mono text-[10.5px] tracking-[0.08em] text-ink-soft uppercase underline underline-offset-4"
                  >
                    remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sent.length > 0 && (
        <section>
          <p className="mb-3 font-display text-[9.5px] tracking-[0.1em] text-ink-soft uppercase">Sent, awaiting reply</p>
          <ul className="flex flex-col gap-2">
            {sent.map((f) => (
              <li key={f.id} className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-mono text-[12.5px] text-ink">{f.email}</span>
                <form action={removeFriend.bind(null, f.id)}>
                  <button
                    type="submit"
                    className="font-mono text-[10.5px] tracking-[0.08em] text-ink-soft uppercase underline underline-offset-4"
                  >
                    cancel
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

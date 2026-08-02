import Link from "next/link";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import { verifySession } from "@/lib/dal";
import { listFilmsForUser } from "@/lib/films";
import { listFriends } from "@/lib/friends";

export default async function FriendCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession();
  const { id } = await params;

  const friends = await listFriends();
  const friend = friends.find((f) => f.id === id);

  return (
    <main className="mx-auto max-w-[740px] px-7 py-16">
      <Link href="/friends" className="font-mono text-[10.5px] tracking-[0.1em] text-brass uppercase">
        ← kindred collections
      </Link>

      {!friend ? (
        <p className="mt-8 font-body text-[15px] italic text-ink-soft">
          Nothing to show here — you&rsquo;re either not friends yet, or the request is still pending.
        </p>
      ) : (
        <FriendSky friendId={friend.id} email={friend.email} />
      )}
    </main>
  );
}

async function FriendSky({ friendId, email }: { friendId: string; email: string }) {
  const films = await listFilmsForUser(friendId);

  return (
    <div className="mt-6">
      <h1 className="mb-1 font-display text-[13px] tracking-[0.14em] text-oxblood uppercase">
        Plate VII <span className="ml-2 font-body text-[15px] tracking-normal italic text-ink-soft normal-case">— {email}&rsquo;s sky</span>
      </h1>
      <p className="mb-8 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
        {films.length === 0 ? (
          <>Nothing pressed here yet.</>
        ) : (
          <>
            {films.length} specimen{films.length === 1 ? "" : "s"}, placed as {email.split("@")[0]} felt them —
            rest the cursor on one to read it.
          </>
        )}
      </p>

      <div className="relative border border-line bg-paper-deep p-6 shadow-[0_10px_26px_-14px_rgba(43,32,24,0.35)]">
        {films.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="font-body text-[15px] italic text-ink-soft">an empty sky, for now</p>
          </div>
        ) : (
          <SkyCanvas films={films} clusters={CLUSTERS} height={420} showFrame showLabels interactive />
        )}
      </div>
    </div>
  );
}

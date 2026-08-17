import { AppShell } from "@/components/shell/AppShell";
import { SkyCanvas } from "@/components/sky/SkyCanvas";
import { CLUSTERS } from "@/data/clusters";
import { verifySession } from "@/lib/dal";
import { listFilmsForUser } from "@/lib/films";
import { listFriends } from "@/lib/friends";

export default async function FriendCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await verifySession();
  const { id } = await params;

  const friends = await listFriends();
  const friend = friends.find((f) => f.id === id);

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/friends">
      {!friend ? (
        <p className="text-[15px] text-ink-soft italic">
          Nothing to show here — you&rsquo;re either not friends yet, or the request is still pending.
        </p>
      ) : (
        <FriendSky friendId={friend.id} email={friend.email} />
      )}
    </AppShell>
  );
}

async function FriendSky({ friendId, email }: { friendId: string; email: string }) {
  const films = await listFilmsForUser(friendId);

  return (
    <div>
      <h1 className="mb-1 text-[16px] font-semibold text-ink">{email}&rsquo;s sky</h1>
      <p className="mb-6 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
        {films.length === 0 ? (
          <>Nothing pressed here yet.</>
        ) : (
          <>
            {films.length} film{films.length === 1 ? "" : "s"}, placed as {email.split("@")[0]} felt them — rest
            the cursor on one to read it.
          </>
        )}
      </p>

      <div className="glass overflow-hidden">
        {films.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-[15px] text-ink-soft italic">an empty sky, for now</p>
          </div>
        ) : (
          <SkyCanvas films={films} clusters={CLUSTERS} height={420} showLabels interactive />
        )}
      </div>
    </div>
  );
}

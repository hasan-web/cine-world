import type { Metadata } from "next";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { NewCollectionForm } from "@/components/collections/NewCollectionForm";
import { AppShell } from "@/components/shell/AppShell";
import { verifySession } from "@/lib/dal";
import { listCollections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Collections",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const user = await verifySession();
  const collections = await listCollections();

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/collections">
      <div className="mx-auto w-full max-w-[720px]">
        <h1 className="mb-1 text-[16px] font-semibold text-ink">Collections</h1>
        <p className="mb-8 max-w-[56ch] text-[13.5px] leading-[1.7] text-ink-soft">
          Your own groupings, separate from mood — named by you, seen by no one else. A film can sit in as
          many of these as you want, alongside whichever mood it&rsquo;s already placed in.
        </p>

        <section className="glass mb-6 p-6">
          <p className="mb-4 text-[10.5px] tracking-[0.06em] text-ink-faint uppercase">New collection</p>
          <NewCollectionForm />
        </section>

        {collections.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="mb-2 text-[15px] font-semibold text-ink">No collections yet.</p>
            <p className="text-[13.5px] text-ink-soft">
              Create one above, then add films to it from any film&rsquo;s own page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {collections.map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

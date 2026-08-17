import type { Metadata } from "next";
import { ImportForm } from "@/components/import/ImportForm";
import { AppShell } from "@/components/shell/AppShell";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Import from Letterboxd",
  alternates: { canonical: "/import" },
};

const STEPS = [
  "Open letterboxd.com/settings/data and choose Export Your Data.",
  "Unzip the file Letterboxd emails you.",
  "Pick ratings.csv for everything you've rated, or diary.csv if you want your rewatch history too.",
];

export default async function ImportPage() {
  const user = await verifySession();

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/import">
      <div className="mx-auto w-full max-w-[620px]">
        <h1 className="mb-1 text-[16px] font-semibold text-ink">Import from Letterboxd</h1>
        <p className="mb-7 max-w-[52ch] text-[13.5px] leading-[1.7] text-ink-soft">
          Bring years of logging with you rather than starting from an empty sky.
        </p>

        <ol className="glass mb-5 flex flex-col gap-3 p-6">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3 text-[13.5px] leading-[1.6] text-ink-soft">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-strong">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <ImportForm />

        <p className="mt-5 max-w-[52ch] text-[12.5px] leading-[1.7] text-ink-faint">
          Importing never overwrites a film you&rsquo;ve already logged, and running the same file
          twice won&rsquo;t duplicate anything — so it&rsquo;s safe to re-run if you&rsquo;re unsure.
        </p>
      </div>
    </AppShell>
  );
}

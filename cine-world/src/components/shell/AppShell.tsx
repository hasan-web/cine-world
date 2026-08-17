import type { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/collection" },
  { label: "Friends", href: "/friends" },
];

const SOON_ITEMS = ["Diary", "Collections", "Discover", "Ask My Cinema", "Stats"];

interface AppShellProps {
  userEmail: string;
  activePath: string;
  children: ReactNode;
}

export function AppShell({ userEmail, activePath, children }: AppShellProps) {
  return (
    <div className="min-h-screen p-4 md:p-7">
      <div className="mx-auto grid max-w-[1360px] gap-5 md:grid-cols-[224px_1fr]">
        <aside className="glass flex h-fit flex-row items-center gap-2 overflow-x-auto p-3 md:sticky md:top-7 md:flex-col md:items-stretch md:gap-6 md:overflow-visible md:p-5">
          <div className="hidden flex-col gap-0.5 px-2 md:flex">
            <span className="text-[10px] tracking-[0.14em] text-ink-faint uppercase">Love for Cinema</span>
            <span className="text-lg font-semibold text-accent-strong">Constellation</span>
          </div>

          <nav className="flex flex-row gap-1 md:flex-col">
            {NAV_ITEMS.map((item) => {
              const active = activePath.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-[13.5px] whitespace-nowrap ${
                    active ? "bg-accent-soft font-semibold text-accent-strong" : "text-ink-soft hover:bg-glass-edge"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {SOON_ITEMS.map((label) => (
              <span
                key={label}
                className="hidden rounded-xl px-3 py-2 text-[13.5px] text-ink-faint/60 md:inline-block"
                title="Coming soon"
              >
                {label}
              </span>
            ))}
          </nav>

          <Link
            href="/log"
            className="hidden rounded-2xl bg-gradient-to-br from-accent to-accent-strong px-4 py-2.5 text-center text-[13px] font-semibold text-white shadow-[0_6px_20px_var(--color-accent-soft)] md:block"
          >
            + Log a film
          </Link>
        </aside>

        <main className="flex flex-col gap-5">
          <div className="glass flex items-center justify-between gap-4 px-5 py-3">
            <span className="hidden text-[13px] font-mono text-ink-soft sm:inline">{userEmail}</span>
            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/log"
                className="rounded-full bg-gradient-to-br from-accent to-accent-strong px-4 py-2 text-[12px] font-semibold text-white md:hidden"
              >
                + Log
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-line-strong px-3.5 py-1.5 text-[11px] tracking-[0.04em] text-ink-soft uppercase"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

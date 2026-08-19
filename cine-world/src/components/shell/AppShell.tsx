"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { signOut } from "@/lib/auth-actions";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/collection" },
  { label: "Diary", href: "/diary" },
  { label: "Stats", href: "/stats" },
  { label: "Friends", href: "/friends" },
  { label: "Import", href: "/import" },
  { label: "Discover", href: "/movies" },
  { label: "Collections", href: "/collections" },
];

const SOON_ITEMS = ["Ask My Cinema"];

interface AppShellProps {
  userEmail: string;
  activePath: string;
  children: ReactNode;
}

/**
 * Below md, the sidebar used to become a horizontally-scrolling row of pills — with seven real
 * nav items plus the soon-item, that meant "Discover" and "Collections" sat off-screen with only
 * a faint scroll track hinting more existed. A hamburger toggle keeps every item reachable without
 * scroll-discovery, at the cost of an extra tap most mobile visitors already expect.
 */
export function AppShell({ userEmail, activePath, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen p-4 md:p-7">
      <div className="mx-auto grid max-w-[1360px] gap-5 md:grid-cols-[224px_1fr]">
        <aside className="glass p-3 md:sticky md:top-7 md:h-fit md:p-5">
          <div className="flex items-center justify-between md:hidden">
            <span className="text-[15px] font-semibold text-accent-strong">Love for Cinema</span>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-ink-soft hover:bg-glass-edge"
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>

          <div className="hidden flex-col gap-0.5 px-2 md:flex">
            <span className="text-lg font-semibold text-accent-strong">Love for Cinema</span>
          </div>

          <nav className={`${menuOpen ? "flex" : "hidden"} mt-3 flex-col gap-1 md:mt-6 md:flex`}>
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
              <span key={label} className="rounded-xl px-3 py-2 text-[13.5px] text-ink-faint/60" title="Coming soon">
                {label}
              </span>
            ))}
          </nav>

          <Link
            href="/log"
            className={`${menuOpen ? "block" : "hidden"} mt-3 rounded-2xl bg-gradient-to-br from-accent to-accent-strong px-4 py-2.5 text-center text-[13px] font-semibold text-white shadow-[0_6px_20px_var(--color-accent-soft)] md:mt-6 md:block`}
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

      <div className="mt-8">
        <LandingFooter />
      </div>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { AppShell } from "@/components/shell/AppShell";
import { createClient } from "@/lib/supabase/client";

interface PublicPageShellProps {
  children: React.ReactNode;
}

/**
 * Every public/SEO page (movies, moods, manifesto, a shared sky) stays a static, cookie-free
 * Server Component for the reasons in LandingHeader — but a signed-in visitor browsing one of
 * these still expects the same sidebar every other page in the app gives them, not just the
 * anonymous-visitor top bar. Checking auth here, client-side, gets that without touching the
 * page's own static generation: the page's content renders either way, this only decides which
 * shell wraps it. Same trade as HeaderAuthAction — a defaults-to-signed-out flash is the fast
 * path, not the exception, since most visitors to these pages are signed out.
 */
export function PublicPageShell({ children }: PublicPageShellProps) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  if (email) {
    return (
      <AppShell userEmail={email} activePath={pathname}>
        {children}
      </AppShell>
    );
  }

  return (
    <>
      <LandingHeader />
      <main>{children}</main>
    </>
  );
}

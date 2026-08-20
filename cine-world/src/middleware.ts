import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/auth/confirm",
  "/manifesto",
  "/movies",
  "/movies-like",
  "/moods",
  "/sky",
  "/where-it-sits",
];

/**
 * Refreshes the Supabase session cookie on every request and does an optimistic
 * redirect for signed-out visitors. This is the "optimistic check" layer only —
 * every Server Action and data read still verifies the session again itself
 * (see src/lib/dal.ts), since proxy alone isn't a substitute for real authorization.
 *
 * Named `middleware` (the pre-16 convention) rather than Next 16's `proxy` on
 * purpose: Proxy always runs Node.js runtime with no way to opt out, and the
 * Cloudflare Workers adapter (@opennextjs/cloudflare) doesn't support that yet.
 * `middleware.ts` still works (deprecated, not removed) and defaults to Edge
 * runtime, which Cloudflare does support. Revert to proxy.ts once the adapter
 * catches up — https://github.com/cloudflare/workers-sdk/issues/13755.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isPublicRoute =
    request.nextUrl.pathname === "/" || PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

  if (!data?.claims && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Excludes by file extension rather than enumerating each static asset by name —
  // the enumerated version silently broke og-image.png and icon.svg (redirected
  // to /login for every signed-out visitor, including social-share and search
  // crawlers) each time a new public asset was added without updating this list.
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp|txt|xml)$).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  SUPPORTED_LOCALES,
  getLocaleFromRequest,
  getCurrencyForCountry,
} from "@/lib/i18n";

const PROTECTED_PATHS = ["/dashboard", "/profile"];
const ADMIN_PATHS = ["/admin"];

/** Returns true if the pathname already starts with a supported locale segment. */
function hasLocalePrefix(pathname: string): boolean {
  return SUPPORTED_LOCALES.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── Locale redirect ────────────────────────────────────────────────────────
  if (!hasLocalePrefix(pathname)) {
    const locale = getLocaleFromRequest(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);

    // Forward country-based currency as a cookie for client-side use
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      "US";
    response.cookies.set("user_currency", getCurrencyForCountry(country), {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
    response.cookies.set("user_country", country, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  }

  // ── Auth guard for protected routes ────────────────────────────────────────
  // Strip the leading /[lang] segment to get the bare path for matching
  const bare = pathname.replace(/^\/[a-z]{2}/, "");

  const needsAuth = PROTECTED_PATHS.some(
    (p) => bare === p || bare.startsWith(`${p}/`),
  );
  const needsAdmin = ADMIN_PATHS.some(
    (p) => bare === p || bare.startsWith(`${p}/`),
  );

  // Admin routes live at /admin (no lang prefix) — handled by auth middleware directly
  if (needsAdmin || needsAuth) {
    // Delegate to next-auth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authResult = await (auth as any)(request);
    if (authResult) return authResult;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  SUPPORTED_LOCALES,
  getLocaleFromRequest,
  getCurrencyForCountry,
} from "@/lib/i18n";

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

  // ── Admin routes: completely separate from the website ───────────────────
  const isAdminPath = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isAdminPath) {
    // Admin login page is always accessible — pass through with pathname header
    if (pathname === "/admin/login") {
      return NextResponse.next({
        request: { headers: new Headers({ ...Object.fromEntries(request.headers), "x-pathname": pathname }) },
      });
    }

    // Check session manually and redirect to /admin/login if not authenticated
    const session = await auth();
    const { isAdminRole } = await import("@/models/User");
    if (!session || !isAdminRole(session.user?.role ?? "")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({
      request: { headers: new Headers({ ...Object.fromEntries(request.headers), "x-pathname": pathname }) },
    });
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

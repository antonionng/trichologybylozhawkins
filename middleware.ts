import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/server/security/session";

const getCookie = (req: NextRequest, name: string) => req.cookies.get(name)?.value ?? null;
const DEV_FALLBACK_AUTH_SECRET = "dev-auth-secret-please-change"; // stable dev fallback (min 16 chars)

const resolveProtectedPath = (pathname: string) => {
  // During client-side navigation Next may request:
  // /_next/data/<buildId>/dashboard/...json
  // We need to map that back to the underlying route path for auth checks.
  if (!pathname.startsWith("/_next/data/")) {
    return pathname;
  }

  const withoutPrefix = pathname.replace(/^\/_next\/data\/[^/]+/, "");
  const withoutJson = withoutPrefix.replace(/\.json$/, "");
  return withoutJson || "/";
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const protectedPath = resolveProtectedPath(pathname);

  const isDashboard = protectedPath.startsWith("/dashboard");
  const isAcademy = protectedPath.startsWith("/academy");
  if (!isDashboard && !isAcademy) {
    return NextResponse.next();
  }

  const token = getCookie(req, "lh_session");
  if (!token) {
    url.pathname = "/login";
    url.searchParams.set("next", protectedPath);
    return NextResponse.redirect(url);
  }

  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? null : DEV_FALLBACK_AUTH_SECRET);
  if (!secret) {
    // In production, fail closed if misconfigured.
    url.pathname = "/login";
    url.searchParams.set("next", protectedPath);
    return NextResponse.redirect(url);
  }

  const claims = await verifySessionToken(token, secret);
  if (!claims) {
    url.pathname = "/login";
    url.searchParams.set("next", protectedPath);
    return NextResponse.redirect(url);
  }

  if (isDashboard && claims.role !== "ADMIN") {
    url.pathname = "/academy";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/academy/:path*", "/_next/data/:path*"],
};



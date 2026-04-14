import { auth } from "@/src/lib/auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/dashboard"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(prefix + "/") ||
      // locale-prefixed variants: /en/dashboard, /de/dashboard
      pathname.match(new RegExp(`^/[a-z]{2}${prefix}(/|$)`)) !== null
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through Sentry/monitoring tunnel
  if (pathname === "/monitoring") {
    return NextResponse.next();
  }

  if (pathname === "/en/monitoring" || pathname === "/de/monitoring") {
    const url = request.nextUrl.clone();
    url.pathname = "/monitoring";
    return NextResponse.rewrite(url);
  }

  // API routes must not go through intlMiddleware
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (isProtected(pathname)) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      // Detect locale from path prefix (e.g. /de/...) or default to /en
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : "en";
      const signInUrl = request.nextUrl.clone();
      signInUrl.pathname = `/${locale}/sign-in`;
      return NextResponse.redirect(signInUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|monitoring|(?:en|de)/monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

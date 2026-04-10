import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/en/dashboard(.*)',
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl

  if (pathname === '/monitoring') {
    return NextResponse.next()
  }

  if (pathname === '/en/monitoring' || pathname === '/de/monitoring') {
    const url = req.nextUrl.clone()
    url.pathname = '/monitoring'
    return NextResponse.rewrite(url)
  }

  // API routes must not be passed through intlMiddleware — it would prefix them
  // with a locale (e.g. /en/api/...) producing 404s since no such route exists.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    '/((?!_next|monitoring|(?:en|de)/monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
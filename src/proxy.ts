import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr']
const defaultLocale = 'en'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals, static files, api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    // If exact match like '/en' or '/fr', redirect to '/[locale]/intake'
    if (locales.includes(pathname.replace(/^\//, ''))) {
      request.nextUrl.pathname = `${pathname}/intake`
      return NextResponse.redirect(request.nextUrl)
    }
    return NextResponse.next()
  }

  // Redirect if there is no locale
  if (pathname === '/') {
    request.nextUrl.pathname = `/${defaultLocale}/intake`
  } else {
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  }
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
  ],
}

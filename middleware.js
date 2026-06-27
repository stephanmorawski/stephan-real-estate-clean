import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/keystatic') ||
    pathname.startsWith('/preview') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Canonical redirects for legacy routes
  if (pathname === '/fr/legal') {
    const url = req.nextUrl.clone();
    url.pathname = '/fr/mentions-legales';
    return NextResponse.redirect(url, 301);
  }

  if (pathname === '/en/legal') {
    const url = req.nextUrl.clone();
    url.pathname = '/en/mentions-legales';
    return NextResponse.redirect(url, 301);
  }

  if (pathname === '/fr/mandats') {
    const url = req.nextUrl.clone();
    url.pathname = '/fr/vente';
    return NextResponse.redirect(url, 301);
  }

  if (pathname === '/en/mandats') {
    const url = req.nextUrl.clone();
    url.pathname = '/en/vente';
    return NextResponse.redirect(url, 301);
  }

  if (pathname === '/fr' || pathname.startsWith('/fr/')) return NextResponse.next();
  if (pathname === '/en' || pathname.startsWith('/en/')) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/fr${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ['/((?!_next|api|keystatic|preview).*)']
};

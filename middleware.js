import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

const PERMANENT_REDIRECTS = new Map([
  ['/fr/agence-cote-dazur', '/fr/agence-immobiliere-cote-d-azur'],
  ['/en/agence-cote-dazur', '/en'],
  ['/fr/cote-d-azur-real-estate', '/fr/agence-immobiliere-cote-d-azur'],
  ['/en/cote-d-azur-real-estate', '/en/french-riviera-real-estate'],
  ['/en/agence-immobiliere-cote-d-azur', '/en'],
  ['/en/agent-immobilier-cote-d-azur', '/en/french-riviera-real-estate'],
  [
    '/fr/actualites/photographie-immobiliere-cote-dazur',
    '/fr/actualites/2026-02-01-photographie-immobiliere',
  ],
  [
    '/en/actualites/photographie-immobiliere-cote-dazur',
    '/en/actualites/2026-02-01-photographie-immobiliere',
  ],
  [
    '/fr/actualites/valbonne-art-de-vivre',
    '/fr/actualites/2026-05-16-valbonne-art-de-vivre',
  ],
  [
    '/en/actualites/valbonne-art-de-vivre',
    '/en/actualites/2026-05-16-valbonne-art-de-vivre',
  ],
]);

function buildCsp(nonce) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com`,
    "connect-src 'self' https:",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join('; ');
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  requestHeaders.set(
    'x-page-lang',
    pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr'
  );

  const nextWithSecurityHeaders = () => {
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set('Content-Security-Policy', csp);
    return response;
  };

  const redirectWithSecurityHeaders = (url, status) => {
    const response = NextResponse.redirect(url, status);
    response.headers.set('Content-Security-Policy', csp);
    return response;
  };

  const permanentTarget = PERMANENT_REDIRECTS.get(pathname);
  if (permanentTarget) {
    const url = req.nextUrl.clone();
    url.pathname = permanentTarget;
    return redirectWithSecurityHeaders(url, 308);
  }

  if (pathname === '/fr/legal') {
    const url = req.nextUrl.clone();
    url.pathname = '/fr/mentions-legales';
    return redirectWithSecurityHeaders(url, 301);
  }

  if (pathname === '/en/legal') {
    const url = req.nextUrl.clone();
    url.pathname = '/en/mentions-legales';
    return redirectWithSecurityHeaders(url, 301);
  }

  if (pathname === '/fr/mandats') {
    const url = req.nextUrl.clone();
    url.pathname = '/fr/vente';
    return redirectWithSecurityHeaders(url, 301);
  }

  if (pathname === '/en/mandats') {
    const url = req.nextUrl.clone();
    url.pathname = '/en/vente';
    return redirectWithSecurityHeaders(url, 301);
  }

  if (pathname === '/fr' || pathname.startsWith('/fr/')) {
    return nextWithSecurityHeaders();
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return nextWithSecurityHeaders();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/fr${pathname === '/' ? '' : pathname}`;
  return redirectWithSecurityHeaders(url, 307);
}

export const config = {
  matcher: ['/((?!_next|api).*)']
};
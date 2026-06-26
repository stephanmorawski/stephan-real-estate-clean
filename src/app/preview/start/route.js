import { cookies, draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

const ALLOWED_PATHS = ['/fr/actualites/', '/en/actualites/'];

export async function GET(request) {
  const url = new URL(request.url);
  const branch = url.searchParams.get('branch');
  const destination = url.searchParams.get('to');

  const isAllowedDestination =
    destination && ALLOWED_PATHS.some((prefix) => destination.startsWith(prefix));

  if (!branch || !isAllowedDestination) {
    return NextResponse.json(
      { error: 'Paramètres de prévisualisation invalides.' },
      { status: 400 }
    );
  }

  const draft = await draftMode();
  draft.enable();

  const cookieStore = await cookies();
  cookieStore.set('ks-branch', branch, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return NextResponse.redirect(new URL(destination, url.origin));
}

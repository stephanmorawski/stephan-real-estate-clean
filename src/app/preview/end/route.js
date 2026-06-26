import { cookies, draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const url = new URL(request.url);
  const draft = await draftMode();
  draft.disable();

  const cookieStore = await cookies();
  cookieStore.delete('ks-branch');

  const referer = request.headers.get('referer');
  const destination = referer?.startsWith(url.origin)
    ? referer
    : `${url.origin}/fr/actualites`;

  return NextResponse.redirect(destination, 303);
}

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(
    {
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    }
  );
}

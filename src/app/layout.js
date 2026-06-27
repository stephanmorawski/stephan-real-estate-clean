import { draftMode } from 'next/headers';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://www.cotedazuragency.com'),
  title: 'Côte d’Azur Agency',
  description: 'Luxury real estate on the French Riviera.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export default async function RootLayout({ children }) {
  const draft = await draftMode();

  return (
    <html lang="fr">
      <body>
        {children}

        {draft.isEnabled ? (
          <aside className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-4 rounded-full bg-zinc-950 px-5 py-3 text-sm text-white shadow-2xl">
            <span>Mode aperçu Keystatic</span>
            <form action="/preview/end" method="post">
              <button
                type="submit"
                className="rounded-full bg-white px-4 py-2 font-medium text-zinc-950"
              >
                Quitter l’aperçu
              </button>
            </form>
          </aside>
        ) : null}
      </body>
    </html>
  );
}

"use client";

import "./globals.css";

/** Last resort when the whole app fails, including the root layout. Kept plain on purpose. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-page">
        <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-4">
          <h1 className="font-display text-display-2xl text-primary">Something went wrong on our side</h1>
          <p className="text-body-lg text-secondary">Nothing you did caused this. Try again in a moment.</p>
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center rounded-md bg-primary-600 px-5 text-body font-medium text-inverse hover:bg-primary-700 focus-visible:focus-ring">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

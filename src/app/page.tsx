
'use client';

import { SiteHeader } from '@/components/site-header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container mx-auto max-w-2xl flex-grow px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
            Application Paused
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            The functions of this application have been temporarily paused.
          </p>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            We will come back very soon.
          </p>
        </div>
      </main>
      <footer className="py-4 text-center text-xs sm:text-sm text-muted-foreground">
        <p>Built with ❤️ for anonymous expression.</p>
      </footer>
    </div>
  );
}

import { Icons } from "@/components/icons";
import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary font-headline">AnonFlow</span>
        </Link>
      </div>
    </header>
  );
}

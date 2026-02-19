'use client';

import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-40">
      <div className="h-full px-6 flex items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7L10 3L17 7V15L10 19L3 15V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11L14 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-sm text-foreground">
              Brosas
            </span>
            <span className="font-body text-xs text-muted-foreground">
              Furniture Store
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

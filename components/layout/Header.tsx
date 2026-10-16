'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Bookmark, SlidersHorizontal, Newspaper } from 'lucide-react';

interface HeaderProps {
  onOpenPreferences?: () => void;
  savedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPreferences, savedCount = 0 }) => {
  const pathname = usePathname();

  const isFeedActive = pathname === '/';
  const isSavedActive = pathname === '/saved';

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--bg-primary)]/95 backdrop-blur-xs border-b border-[var(--border-hairline)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Masthead */}
        <div className="flex items-baseline gap-3">
          <Link href="/" className="group flex items-baseline gap-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] rounded">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              GOJO MEDIA
            </span>
          </Link>
          <span className="hidden sm:inline-block text-[10px] tracking-widest uppercase font-semibold text-[var(--text-tertiary)] pl-2 border-l border-[var(--border-hairline)]">
            Curated Edition
          </span>
        </div>

        {/* Navigation & Controls with 2px accent underline on active item */}
        <div className="flex items-center gap-1 sm:gap-3 h-full">
          <nav className="flex items-center gap-1 sm:gap-2 h-full">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 px-3 h-16 text-[12px] font-medium transition-colors border-b-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
                isFeedActive
                  ? 'text-[var(--text-primary)] border-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Feed</span>
            </Link>

            <Link
              href="/saved"
              className={`inline-flex items-center gap-1.5 px-3 h-16 text-[12px] font-medium transition-colors border-b-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
                isSavedActive
                  ? 'text-[var(--text-primary)] border-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                  {savedCount}
                </span>
              )}
            </Link>

            {onOpenPreferences && (
              <button
                onClick={onOpenPreferences}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 h-16 text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-b-2 border-transparent focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Interests</span>
              </button>
            )}
          </nav>

          <div className="pl-2 border-l border-[var(--border-hairline)] ml-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

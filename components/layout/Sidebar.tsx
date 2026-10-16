'use client';

import React from 'react';
import { Interest } from '@/types/interests';
import { SlidersHorizontal, Bookmark, Plus } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  userInterests: Interest[];
  onOpenPreferences: () => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userInterests,
  onOpenPreferences,
  savedCount,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <aside className="w-full space-y-6">
      {/* Editorial Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-lg p-5">
        <div className="text-[11px] uppercase tracking-widest font-semibold text-[var(--text-tertiary)] mb-1">
          Daily Briefing
        </div>
        <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
          {currentDate}
        </h2>
        <p className="text-[12px] text-[var(--text-secondary)] mt-2 leading-relaxed">
          Top posts for your topics today.
        </p>

        <div className="mt-4 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-[12px]">
          <Link
            href="/saved"
            className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--accent)] rounded"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved articles</span>
          </Link>
          <span className="font-mono text-[12px] px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            {savedCount}
          </span>
        </div>
      </div>

      {/* Your Interests Box */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-[var(--text-tertiary)]">
            Your Topics ({userInterests.length})
          </span>
          <button
            type="button"
            onClick={onOpenPreferences}
            className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 font-medium focus:outline-none focus:ring-1 focus:ring-[var(--accent)] rounded"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <ul className="space-y-2">
          {userInterests.map((interest) => (
            <li
              key={interest.id}
              className="flex items-center justify-between text-[12px] py-1 text-[var(--text-secondary)]"
            >
              <span className="font-medium text-[var(--text-primary)]">
                {interest.label}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--text-tertiary)]">
                {interest.group}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onOpenPreferences}
          className="mt-4 w-full py-2 px-3 text-[12px] font-medium rounded border border-[var(--border-hairline)] hover:border-[var(--border-strong)] bg-[var(--bg-subtle)] text-[var(--text-primary)] transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Add more topics</span>
        </button>
      </div>
    </aside>
  );
};

'use client';

import React from 'react';

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full">
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-lg p-5 sm:p-6"
        >
          {/* Header micro-label skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-16 h-3 rounded skeleton-shimmer" />
            <div className="w-24 h-3 rounded skeleton-shimmer" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2 mb-6">
            <div className="w-4/5 h-5 rounded skeleton-shimmer" />
            <div className="w-2/3 h-5 rounded skeleton-shimmer" />
          </div>

          {/* Embed body skeleton */}
          <div className="w-full h-56 rounded skeleton-shimmer mb-4" />

          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-hairline)]">
            <div className="w-24 h-3 rounded skeleton-shimmer" />
            <div className="w-32 h-3 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

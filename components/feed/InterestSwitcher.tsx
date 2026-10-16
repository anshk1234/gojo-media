'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Interest } from '@/types/interests';

interface InterestSwitcherProps {
  interests: Interest[];
  activeInterestId: string | 'all';
  onChange: (id: string | 'all') => void;
}

export const InterestSwitcher: React.FC<InterestSwitcherProps> = ({
  interests,
  activeInterestId,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, interests]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && containerRef.current) {
      containerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="relative w-full">
      {/* Left Fade Mask */}
      <div
        className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-primary)] to-transparent transition-opacity duration-200 z-10 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Right Fade Mask */}
      <div
        className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent transition-opacity duration-200 z-10 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Chips Container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[12px] scroll-smooth"
        tabIndex={0}
        role="region"
        aria-label="Filter by topic"
      >
        <button
          type="button"
          onClick={() => onChange('all')}
          className={`px-3 py-1 rounded border transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
            activeInterestId === 'all'
              ? 'border-[var(--accent)] text-[var(--accent)] font-medium bg-[var(--accent-subtle)]'
              : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)]'
          }`}
        >
          All Topics
        </button>

        {interests.map((interest) => {
          const isActive = activeInterestId === interest.id;
          return (
            <button
              key={interest.id}
              type="button"
              onClick={() => onChange(interest.id)}
              className={`px-3 py-1 rounded border transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
                isActive
                  ? 'border-[var(--accent)] text-[var(--accent)] font-medium bg-[var(--accent-subtle)]'
                  : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)]'
              }`}
            >
              {interest.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

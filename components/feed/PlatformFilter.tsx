'use client';

import React from 'react';
import { Platform } from '@/types/post';
import {
  Layers,
  MessageSquare,
  Tv,
  Camera,
  Briefcase,
} from 'lucide-react';

interface PlatformFilterProps {
  selectedPlatform: Platform | 'all';
  onChange: (platform: Platform | 'all') => void;
}

interface FilterOption {
  id: Platform | 'all';
  label: string;
  icon: React.FC<{ className?: string }>;
}

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Sources', icon: Layers },
  { id: 'reddit', label: 'Reddit', icon: MessageSquare },
  { id: 'youtube', label: 'YouTube', icon: Tv },
  { id: 'x', label: 'X', icon: XIcon },
  { id: 'instagram', label: 'Instagram', icon: Camera },
  { id: 'linkedin', label: 'LinkedIn', icon: Briefcase },
];

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  selectedPlatform,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
      {OPTIONS.map((opt) => {
        const isActive = selectedPlatform === opt.id;
        const IconComponent = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium transition-all whitespace-nowrap rounded-t border-b-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
              isActive
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--accent)]'
                : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <IconComponent className="w-3.5 h-3.5 shrink-0" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

'use client';

import React, { useState, useMemo } from 'react';
import { INTERESTS, INTEREST_GROUPS } from '@/config/interests';
import { Search, Check, AlertCircle } from 'lucide-react';

interface InterestPickerProps {
  initialSelected?: string[];
  onSave: (selectedIds: string[]) => void;
  isModal?: boolean;
  onCancel?: () => void;
}

export const InterestPicker: React.FC<InterestPickerProps> = ({
  initialSelected = [],
  onSave,
  isModal = false,
  onCancel,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleInterest = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const filteredInterests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return INTERESTS;
    return INTERESTS.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.group.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof INTERESTS>();
    for (const group of INTEREST_GROUPS) {
      const items = filteredInterests.filter((item) => item.group === group);
      if (items.length > 0) {
        map.set(group, items);
      }
    }
    return map;
  }, [filteredInterests]);

  const count = selected.size;
  const isValid = count >= 3;

  const handleSave = () => {
    if (!isValid) return;
    onSave(Array.from(selected));
  };

  return (
    <div className={`w-full ${isModal ? 'max-w-2xl mx-auto' : 'max-w-3xl mx-auto py-12 px-4'}`}>
      {/* Header */}
      <div className="mb-8">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--accent)]">
          Curation Preferences
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1 mb-2">
          Select your reading topics
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Choose a minimum of three subjects. Your feed compiles official posts across X, Reddit, YouTube, Instagram, and LinkedIn based on these selections.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter topics by name or keyword..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {/* Grouped Topics List */}
      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-1">
        {Array.from(grouped.entries()).map(([group, items]) => (
          <div key={group}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 pb-1 border-b border-[var(--border-hairline)]">
              {group}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {items.map((interest) => {
                const isChecked = selected.has(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`text-left p-3.5 rounded-md border transition-all flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/50'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-primary)]">
                        {interest.label}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                        {interest.description}
                      </p>
                    </div>

                    <div
                      className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                        isChecked
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                          : 'border-[var(--border-strong)] bg-transparent'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.size === 0 && (
          <div className="py-8 text-center text-sm text-[var(--text-tertiary)]">
            No topics match your search query.
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-5 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          {!isValid ? (
            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-500 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Pick at least {3 - count} more {3 - count === 1 ? 'topic' : 'topics'}
            </span>
          ) : (
            <span className="text-[var(--text-primary)] font-medium">
              {count} topics selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="px-4 py-2 text-xs font-medium rounded border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSave}
            type="button"
            disabled={!isValid}
            className={`px-5 py-2 text-xs font-semibold rounded transition-colors ${
              isValid
                ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] cursor-pointer'
                : 'bg-[var(--border-hairline)] text-[var(--text-tertiary)] cursor-not-allowed'
            }`}
          >
            Save topics and view feed
          </button>
        </div>
      </div>
    </div>
  );
};

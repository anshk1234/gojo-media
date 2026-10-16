'use client';

import React, { useState, useMemo } from 'react';
import { getInterestsByIds } from '@/config/interests';
import { NormalizedPost } from '@/types/post';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Feed } from '@/components/feed/Feed';
import { InterestPicker } from '@/components/onboarding/InterestPicker';
import { useLocalStorage, useMounted } from '@/lib/hooks/useLocalStorage';
import { X } from 'lucide-react';

const STORAGE_KEY_INTERESTS = 'gojo_user_interests';
const STORAGE_KEY_SAVED = 'gojo_saved_posts';

export default function HomePage() {
  const isMounted = useMounted();
  const [storedInterestIds, setStoredInterestIds] = useLocalStorage<string[]>(STORAGE_KEY_INTERESTS, []);
  const [savedPosts, setSavedPosts] = useLocalStorage<NormalizedPost[]>(STORAGE_KEY_SAVED, []);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Derive user interests from stored IDs
  const userInterests = useMemo(() => {
    return getInterestsByIds(storedInterestIds);
  }, [storedInterestIds]);

  const handleSavePreferences = (selectedIds: string[]) => {
    setStoredInterestIds(selectedIds);
    setIsPreferencesOpen(false);
  };

  const handleToggleSave = (post: NormalizedPost) => {
    setSavedPosts((prev) => {
      const exists = prev.some((p) => p.id === post.id);
      if (exists) {
        return prev.filter((p) => p.id !== post.id);
      }
      return [post, ...prev];
    });
  };

  // Prevent hydration flash before client mount
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">
          Preparing edition...
        </div>
      </div>
    );
  }

  // First-time visitor: Onboarding interest picker
  if (userInterests.length < 3) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-6 sm:p-8">
          <InterestPicker
            initialSelected={storedInterestIds}
            onSave={handleSavePreferences}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Top Masthead Header */}
      <Header
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        savedCount={savedPosts.length}
      />

      {/* Main Two-Column Editorial Layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Column */}
          <main className="lg:col-span-8">
            <Feed
              userInterests={userInterests}
              savedPosts={savedPosts}
              onToggleSave={handleToggleSave}
            />
          </main>

          {/* Desktop Slim Sidebar */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <Sidebar
              userInterests={userInterests}
              onOpenPreferences={() => setIsPreferencesOpen(true)}
              savedCount={savedPosts.length}
            />
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors focus:outline-none"
              aria-label="Close preferences"
            >
              <X className="w-5 h-5" />
            </button>

            <InterestPicker
              initialSelected={storedInterestIds}
              onSave={handleSavePreferences}
              isModal={true}
              onCancel={() => setIsPreferencesOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

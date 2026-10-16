'use client';

import React from 'react';
import Link from 'next/link';
import { NormalizedPost } from '@/types/post';
import { Header } from '@/components/layout/Header';
import { PostCard } from '@/components/feed/PostCard';
import { useLocalStorage, useMounted } from '@/lib/hooks/useLocalStorage';
import { ArrowLeft, Bookmark } from 'lucide-react';

const STORAGE_KEY_SAVED = 'gojo_saved_posts';

export default function SavedPage() {
  const isMounted = useMounted();
  const [savedPosts, setSavedPosts] = useLocalStorage<NormalizedPost[]>(STORAGE_KEY_SAVED, []);

  const handleToggleSave = (post: NormalizedPost) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header savedCount={savedPosts.length} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6 pb-4 border-b border-[var(--border-hairline)] flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Feed</span>
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Saved Posts
            </h1>
          </div>

          <div className="text-right">
            <span className="font-mono text-sm text-[var(--text-secondary)]">
              {savedPosts.length} {savedPosts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>

        {!isMounted ? (
          <div className="py-12 text-center text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            Loading saved posts...
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="p-12 text-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            <div className="w-10 h-10 mx-auto rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-tertiary)] mb-3">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-2">
              No saved posts
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
              When you find a post you want to reference later, tap the bookmark icon on any post in your feed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity"
            >
              Return to feed
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isSaved={true}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

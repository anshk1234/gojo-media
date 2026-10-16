'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NormalizedPost, Platform, FeedResponse } from '@/types/post';
import { Interest } from '@/types/interests';
import { PostCard } from './PostCard';
import { FeedSkeleton } from './FeedSkeleton';
import { PlatformFilter } from './PlatformFilter';
import { InterestSwitcher } from './InterestSwitcher';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FeedProps {
  userInterests: Interest[];
  savedPosts: NormalizedPost[];
  onToggleSave: (post: NormalizedPost) => void;
}

export const Feed: React.FC<FeedProps> = ({
  userInterests,
  savedPosts,
  onToggleSave,
}) => {
  const [posts, setPosts] = useState<NormalizedPost[]>([]);
  const [platform, setPlatform] = useState<Platform | 'all'>('all');
  const [activeInterestId, setActiveInterestId] = useState<string | 'all'>('all');
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Set of saved post IDs for instant lookup
  const savedSet = useMemo(() => new Set(savedPosts.map((p) => p.id)), [savedPosts]);

  // Selected interest IDs as stable string key
  const interestKey = useMemo(() => {
    if (activeInterestId !== 'all') {
      return activeInterestId;
    }
    return userInterests.map((i) => i.id).join(',');
  }, [activeInterestId, userInterests]);

  // Main feed loading effect
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const loadInitialFeed = async () => {
      if (!interestKey) {
        setPosts([]);
        setIsLoadingInitial(false);
        return;
      }

      setIsLoadingInitial(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('interests', interestKey);
        if (platform !== 'all') {
          params.set('platforms', platform);
        }

        const res = await fetch(`/api/feed?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || 'Failed to fetch the feed.');
        }

        const data = (await res.json()) as FeedResponse;

        if (!isCancelled) {
          setPosts(data.posts);
          setCursor(data.nextCursor);
          setHasMore(Boolean(data.nextCursor));
        }
      } catch (err: unknown) {
        if (!isCancelled && (err as { name?: string })?.name !== 'AbortError') {
          const msg = err instanceof Error ? err.message : 'Unable to connect to source servers.';
          setError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingInitial(false);
        }
      }
    };

    // Execute in microtask to avoid synchronous render cascade
    Promise.resolve().then(loadInitialFeed);

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [platform, interestKey, retryTrigger]);

  // Infinite scroll loader
  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.set('interests', interestKey);
      if (platform !== 'all') {
        params.set('platforms', platform);
      }
      params.set('cursor', cursor);

      const res = await fetch(`/api/feed?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load older posts.');
      }

      const data = (await res.json()) as FeedResponse;
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    } catch {
      // Continue silently on pagination failure
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, hasMore, interestKey, platform]);

  // Infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoadingMore || isLoadingInitial || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '400px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, isLoadingInitial, cursor, loadMore]);

  return (
    <div className="w-full space-y-6">
      {/* Sticky Borderless Filter Bar below Header */}
      <div
        className={`sticky top-16 z-20 bg-[var(--bg-primary)] py-2 space-y-2 transition-all ${
          isScrolled ? 'border-b border-[var(--border-hairline)]' : ''
        }`}
      >
        <PlatformFilter selectedPlatform={platform} onChange={setPlatform} />
        {userInterests.length > 1 && (
          <div className="pt-1">
            <InterestSwitcher
              interests={userInterests}
              activeInterestId={activeInterestId}
              onChange={setActiveInterestId}
            />
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-5 rounded-lg border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 text-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">
                Could not load posts
              </p>
              <p className="text-red-700 dark:text-red-400 mt-1">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setRetryTrigger((c) => c + 1)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoadingInitial && <FeedSkeleton />}

      {/* Empty State */}
      {!isLoadingInitial && !error && posts.length === 0 && (
        <div className="p-12 text-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
          <h4 className="font-serif text-lg font-semibold text-[var(--text-primary)] mb-2">
            No posts found for this selection
          </h4>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-4">
            Try choosing a different platform filter or adding more topics to your interests.
          </p>
          <button
            type="button"
            onClick={() => {
              setPlatform('all');
              setActiveInterestId('all');
            }}
            className="px-4 py-2 text-xs font-semibold rounded bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Posts List */}
      {!isLoadingInitial && posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isSaved={savedSet.has(post.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel / Loading More Indicator */}
      <div ref={sentinelRef} className="py-4 flex justify-center">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            <div className="w-3.5 h-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span>Loading older posts</span>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
            You are completely caught up
          </p>
        )}
      </div>
    </div>
  );
};

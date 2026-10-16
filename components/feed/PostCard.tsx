'use client';

import React from 'react';
import { NormalizedPost } from '@/types/post';
import { PostEmbed } from '@/components/embeds/PostEmbed';
import { shouldRenderExcerpt } from '@/lib/utils/text';
import {
  Bookmark,
  ExternalLink,
  Share2,
  Tv,
  MessageSquare,
  Camera,
  Briefcase,
} from 'lucide-react';

interface PostCardProps {
  post: NormalizedPost;
  isSaved?: boolean;
  onToggleSave?: (post: NormalizedPost) => void;
}

// Neutral platform icons & labels (reserved accent colors)
const PLATFORM_CONFIG: Record<
  NormalizedPost['platform'],
  { label: string; icon: React.FC<{ className?: string }> }
> = {
  reddit: {
    label: 'Reddit',
    icon: MessageSquare,
  },
  youtube: {
    label: 'YouTube',
    icon: Tv,
  },
  x: {
    label: 'X',
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  instagram: {
    label: 'Instagram',
    icon: Camera,
  },
  linkedin: {
    label: 'LinkedIn',
    icon: Briefcase,
  },
};

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isSaved = false,
  onToggleSave,
}) => {
  const platformInfo = PLATFORM_CONFIG[post.platform] || {
    label: post.platform,
    icon: MessageSquare,
  };
  const PlatformIcon = platformInfo.icon;

  const showExcerpt = shouldRenderExcerpt(post.title, post.excerpt);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: post.url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(post.url);
      } catch {}
    }
  };

  return (
    <article className="w-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-lg p-5 sm:p-6 transition-colors hover:border-[var(--border-strong)]">
      {/* Header Metadata (Raised to >=12px, neutral colors, WCAG AA contrast) */}
      <div className="flex items-center justify-between gap-3 mb-3 text-[12px] font-medium tracking-normal text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-secondary)]">
            <PlatformIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{platformInfo.label}</span>
          </span>
          <span className="text-[var(--border-strong)]">•</span>
          {post.author?.name && (
            <>
              {post.author.url ? (
                <a
                  href={post.author.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text-primary)] transition-colors underline-offset-2 hover:underline"
                >
                  {post.author.name}
                </a>
              ) : (
                <span>{post.author.name}</span>
              )}
              <span className="text-[var(--border-strong)]">•</span>
            </>
          )}
          <span>{formatTimeAgo(post.publishedAt)}</span>
        </div>

        {/* Save button (Reserved accent for active state) */}
        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(post)}
            aria-label={isSaved ? 'Remove from saved posts' : 'Save post for later'}
            className={`inline-flex items-center p-1.5 rounded transition-colors hover:bg-[var(--bg-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
              isSaved
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Title (Semibold, tracking -0.01em, clear hierarchy) */}
      <h3 className="font-serif text-lg sm:text-xl font-semibold tracking-[-0.01em] text-[var(--text-primary)] mb-2.5 leading-snug">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--accent)] transition-colors"
        >
          {post.title}
        </a>
      </h3>

      {/* Optional Excerpt (Only rendered when it adds new information) */}
      {showExcerpt && (
        <p className="text-sm text-[var(--text-secondary)] leading-[1.6] line-clamp-3 mb-4">
          {post.excerpt}
        </p>
      )}

      {/* Embed Layer (Collapses cleanly without blank gap when failed or absent) */}
      <div className="w-full empty:hidden my-2">
        <PostEmbed post={post} />
      </div>

      {/* Action Footer (>=12px, clean hairline border) */}
      <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[12px] text-[var(--text-tertiary)]">
        <div className="flex items-center gap-4">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] rounded"
          >
            <span>Open on {platformInfo.label}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] rounded"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {post.metrics && (
          <div className="hidden sm:flex items-center gap-3 font-mono text-[12px] text-[var(--text-tertiary)]">
            {post.metrics.score !== undefined && (
              <span>{post.metrics.score.toLocaleString()} points</span>
            )}
            {post.metrics.likes !== undefined && (
              <span>{post.metrics.likes.toLocaleString()} likes</span>
            )}
            {post.metrics.views !== undefined && (
              <span>{post.metrics.views.toLocaleString()} views</span>
            )}
            {post.metrics.comments !== undefined && (
              <span>{post.metrics.comments.toLocaleString()} comments</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

import { NormalizedPost } from '@/types/post';

/**
 * Normalizes engagement metrics per platform onto a standard scale (0 - 100).
 * Different platforms have vastly different orders of magnitude for metrics:
 * e.g., YouTube views (100k - 1M) vs Reddit upvotes (100 - 5k) vs X likes (500 - 50k).
 */
export function calculateNormalizedEngagement(post: NormalizedPost): number {
  const m = post.metrics;
  if (!m) {
    return 30; // Baseline engagement if metrics are unavailable
  }

  switch (post.platform) {
    case 'reddit': {
      const upvotes = m.score ?? 0;
      const comments = m.comments ?? 0;
      // Reddit: 1000 upvotes + 150 comments is high engagement
      const composite = Math.max(0, upvotes) + comments * 2;
      return Math.min(100, Math.log10(composite + 10) * 25);
    }

    case 'youtube': {
      const views = m.views ?? 0;
      const likes = m.likes ?? 0;
      const comments = m.comments ?? 0;
      // YouTube: 250k views + 10k likes + 500 comments is high engagement
      const composite = (views / 5000) + (likes / 100) + (comments / 20);
      return Math.min(100, Math.log10(composite + 10) * 22);
    }

    case 'x': {
      const likes = m.likes ?? 0;
      const reposts = m.reposts ?? 0;
      const comments = m.comments ?? 0;
      // X: 5000 likes + 1000 reposts is high engagement
      const composite = (likes / 50) + (reposts / 10) + (comments / 5);
      return Math.min(100, Math.log10(composite + 10) * 24);
    }

    case 'instagram': {
      const likes = m.likes ?? 0;
      const comments = m.comments ?? 0;
      const composite = (likes / 100) + (comments / 10);
      return Math.min(100, Math.log10(composite + 10) * 24);
    }

    case 'linkedin': {
      const likes = m.likes ?? 0;
      const comments = m.comments ?? 0;
      const composite = (likes / 30) + (comments / 5);
      return Math.min(100, Math.log10(composite + 10) * 25);
    }

    default:
      return 30;
  }
}

import { NormalizedPost } from '@/types/post';
import { calculateNormalizedEngagement } from './normalize';
import { applyRecencyDecay } from './decay';
import { deduplicatePosts } from './deduplicate';
import { interleavePlatforms } from './interleave';

/**
 * Ranks, deduplicates, and interleaves raw posts into an editorial feed.
 */
export function rankAndInterleaveFeed(rawPosts: NormalizedPost[]): NormalizedPost[] {
  // 1. Calculate normalized engagement and apply recency decay
  const scoredPosts: NormalizedPost[] = rawPosts.map((post) => {
    const rawEngagement = calculateNormalizedEngagement(post);
    const finalScore = applyRecencyDecay(rawEngagement, post.publishedAt);
    return {
      ...post,
      rankedScore: Math.round(finalScore * 100) / 100,
    };
  });

  // 2. Remove duplicate URLs and near-identical titles
  const deduplicated = deduplicatePosts(scoredPosts);

  // 3. Interleave platforms to prevent clustering of identical sources
  const interleaved = interleavePlatforms(deduplicated);

  return interleaved;
}

import { Interest } from '@/types/interests';
import { NormalizedPost, Platform } from '@/types/post';
import { RedditAdapter } from './reddit';
import { YouTubeAdapter } from './youtube';
import { XAdapter } from './x';
import { InstagramAdapter } from './instagram';
import { LinkedInAdapter } from './linkedin';
import { SourceAdapter } from './adapter.interface';
import { SEED_POSTS } from '@/data/seed-posts';

export const adapters: Record<Platform, SourceAdapter> = {
  reddit: new RedditAdapter(),
  youtube: new YouTubeAdapter(),
  x: new XAdapter(),
  instagram: new InstagramAdapter(),
  linkedin: new LinkedInAdapter(),
};

/**
 * Fetches posts across all given interests and requested platforms.
 * If live adapters return no results (e.g. offline, rate-limited, missing API keys),
 * gracefully falls back to matching curated seed posts.
 */
export async function fetchPostsForInterests(
  interests: Interest[],
  platforms?: Platform[]
): Promise<NormalizedPost[]> {
  const targetPlatforms = platforms && platforms.length > 0
    ? platforms
    : (['reddit', 'youtube', 'x', 'instagram', 'linkedin'] as Platform[]);

  const activeAdapters = targetPlatforms.map((p) => adapters[p]).filter(Boolean);

  const allPosts: NormalizedPost[] = [];
  const interestIds = interests.map((i) => i.id);

  // Run all interest x adapter combinations concurrently
  const fetchPromises: Promise<NormalizedPost[]>[] = [];

  for (const interest of interests) {
    for (const adapter of activeAdapters) {
      fetchPromises.push(
        adapter.fetch(interest).catch(() => [])
      );
    }
  }

  const results = await Promise.allSettled(fetchPromises);
  for (const res of results) {
    if (res.status === 'fulfilled' && res.value) {
      allPosts.push(...res.value);
    }
  }

  // Deduplicate live posts by URL or ID
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const uniquePosts: NormalizedPost[] = [];

  for (const post of allPosts) {
    if (!seenIds.has(post.id) && !seenUrls.has(post.url)) {
      seenIds.add(post.id);
      seenUrls.add(post.url);
      uniquePosts.push(post);
    }
  }

  // Graceful fallback: If live adapters yielded very few or no posts for an interest,
  // supplement with seed posts matching the chosen interests and platform filter
  const targetInterestsSet = new Set(interestIds);
  const targetPlatformsSet = new Set(targetPlatforms);

  const relevantSeedPosts = SEED_POSTS.filter(
    (seed) =>
      targetPlatformsSet.has(seed.platform) &&
      seed.interestIds.some((id) => targetInterestsSet.has(id))
  );

  for (const seed of relevantSeedPosts) {
    if (!seenIds.has(seed.id) && !seenUrls.has(seed.url)) {
      seenIds.add(seed.id);
      seenUrls.add(seed.url);
      uniquePosts.push(seed);
    }
  }

  return uniquePosts;
}

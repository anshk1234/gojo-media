import { NormalizedPost } from '@/types/post';

/**
 * Normalizes URLs by removing tracking query parameters and trailing slashes.
 */
export function canonicalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Remove analytics and referral query params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 's', 't', 'fbclid'];
    for (const p of trackingParams) {
      parsed.searchParams.delete(p);
    }
    // Remove trailing slash from pathname
    let cleanPath = parsed.pathname;
    if (cleanPath.endsWith('/') && cleanPath.length > 1) {
      cleanPath = cleanPath.slice(0, -1);
    }
    return `${parsed.protocol}//${parsed.host}${cleanPath}${parsed.search}`;
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}

/**
 * Tokenizes text into lowercase alpha words for title similarity comparison.
 */
function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Computes Jaccard word similarity between two titles (0.0 to 1.0).
 */
export function titleSimilarity(titleA: string, titleB: string): number {
  const setA = tokenize(titleA);
  const setB = tokenize(titleB);
  if (setA.size === 0 || setB.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) {
      intersection++;
    }
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Removes duplicate URLs and filters out posts with near-identical titles,
 * keeping the one with higher ranked score.
 */
export function deduplicatePosts(posts: NormalizedPost[]): NormalizedPost[] {
  const urlMap = new Map<string, NormalizedPost>();

  // URL deduplication first
  for (const post of posts) {
    const canon = canonicalizeUrl(post.url);
    const existing = urlMap.get(canon);
    if (!existing || (post.rankedScore ?? 0) > (existing.rankedScore ?? 0)) {
      urlMap.set(canon, post);
    }
  }

  const distinctByUrl = Array.from(urlMap.values());
  // Sort descending by score
  distinctByUrl.sort((a, b) => (b.rankedScore ?? 0) - (a.rankedScore ?? 0));

  // Near-identical title deduplication
  const finalPosts: NormalizedPost[] = [];
  for (const candidate of distinctByUrl) {
    const isDuplicate = finalPosts.some(
      (kept) => titleSimilarity(candidate.title, kept.title) > 0.72
    );
    if (!isDuplicate) {
      finalPosts.push(candidate);
    }
  }

  return finalPosts;
}

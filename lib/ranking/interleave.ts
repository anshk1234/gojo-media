import { NormalizedPost, Platform } from '@/types/post';

/**
 * Interleaves posts across platforms to guarantee a rich editorial mix
 * and prevent blocks of posts from a single source.
 */
export function interleavePlatforms(posts: NormalizedPost[]): NormalizedPost[] {
  if (posts.length <= 2) {
    return posts;
  }

  // Group posts by platform, maintaining their ranked order within each platform queue
  const queues: Map<Platform, NormalizedPost[]> = new Map();

  for (const post of posts) {
    const list = queues.get(post.platform) ?? [];
    list.push(post);
    queues.set(post.platform, list);
  }

  const interleaved: NormalizedPost[] = [];
  let lastPlatform: Platform | null = null;
  let secondLastPlatform: Platform | null = null;

  const totalPosts = posts.length;

  while (interleaved.length < totalPosts) {
    // Collect platforms that still have posts remaining
    const availablePlatforms = Array.from(queues.entries()).filter(
      ([, queue]) => queue.length > 0
    );

    if (availablePlatforms.length === 0) {
      break;
    }

    // Try to pick a platform different from the last 2 if possible
    let chosenEntry = availablePlatforms.find(
      ([plat]) => plat !== lastPlatform && plat !== secondLastPlatform
    );

    // If none found that avoids last 2, pick any platform different from the immediate last
    if (!chosenEntry) {
      chosenEntry = availablePlatforms.find(([plat]) => plat !== lastPlatform);
    }

    // If still none (e.g. only one platform has remaining posts), pick the best remaining
    if (!chosenEntry) {
      // Pick the queue whose next post has the highest score
      availablePlatforms.sort((a, b) => {
        const scoreA = a[1][0]?.rankedScore ?? 0;
        const scoreB = b[1][0]?.rankedScore ?? 0;
        return scoreB - scoreA;
      });
      chosenEntry = availablePlatforms[0];
    }

    const [platform, queue] = chosenEntry;
    const nextPost = queue.shift()!;
    interleaved.push(nextPost);

    secondLastPlatform = lastPlatform;
    lastPlatform = platform;
  }

  return interleaved;
}

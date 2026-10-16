import { Interest } from '@/types/interests';
import { NormalizedPost } from '@/types/post';
import { SourceAdapter } from './adapter.interface';
import { cache } from '@/lib/cache/ttl-cache';

export class LinkedInAdapter implements SourceAdapter {
  readonly platform = 'linkedin' as const;

  async fetch(interest: Interest): Promise<NormalizedPost[]> {
    const urls = interest.sources.linkedInUrls;
    if (!urls || urls.length === 0) {
      return [];
    }

    const posts: NormalizedPost[] = [];

    for (const url of urls) {
      const cacheKey = `linkedin:${url}`;
      const cached = cache.get<NormalizedPost>(cacheKey);
      if (cached) {
        posts.push(cached);
        continue;
      }

      // Extract activity / share ID from LinkedIn post URL
      // Pattern: activity-7164319875123456789 or urn:li:activity:7164319875123456789
      const activityMatch = url.match(/activity-?(\d+)/i);
      const activityId = activityMatch ? activityMatch[1] : null;

      // Extract author handle/name from URL path /posts/{author-handle}_...
      const authorMatch = url.match(/\/posts\/([a-zA-Z0-9-]+)_/);
      const authorHandle = authorMatch ? authorMatch[1].replace(/-/g, ' ') : 'LinkedIn Member';

      const post: NormalizedPost = {
        id: `linkedin_${activityId || Buffer.from(url).toString('base64').slice(0, 16)}`,
        platform: 'linkedin',
        url,
        embedType: 'linkedin-post',
        title: `Perspective on ${interest.label} by ${authorHandle}`,
        excerpt: `Professional insights and analysis shared on LinkedIn regarding developments in ${interest.label}.`,
        author: {
          name: authorHandle,
          handle: authorMatch ? authorMatch[1] : undefined,
          url: `https://www.linkedin.com/in/${authorMatch ? authorMatch[1] : ''}`,
        },
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        metrics: {
          likes: 3400,
          comments: 290,
        },
        interestIds: [interest.id],
      };

      cache.set(cacheKey, post, 1800);
      posts.push(post);
    }

    return posts;
  }
}

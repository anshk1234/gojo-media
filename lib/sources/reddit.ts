import { Interest } from '@/types/interests';
import { NormalizedPost } from '@/types/post';
import { SourceAdapter } from './adapter.interface';
import { cache } from '@/lib/cache/ttl-cache';

interface RedditPostData {
  id: string;
  title: string;
  author: string;
  permalink: string;
  created_utc: number;
  score: number;
  num_comments: number;
  selftext?: string;
  stickied: boolean;
  over_18: boolean;
  subreddit: string;
}

interface RedditListingResponse {
  data?: {
    children?: Array<{
      data: RedditPostData;
    }>;
  };
}

export class RedditAdapter implements SourceAdapter {
  readonly platform = 'reddit' as const;

  async fetch(interest: Interest): Promise<NormalizedPost[]> {
    const subreddits = interest.sources.subreddits;
    if (!subreddits || subreddits.length === 0) {
      return [];
    }

    const posts: NormalizedPost[] = [];

    // Fetch from each subreddit concurrently
    const promises = subreddits.map(async (subreddit) => {
      const cacheKey = `reddit:${interest.id}:${subreddit}`;
      const cached = cache.get<NormalizedPost[]>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
          `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=10`,
          {
            headers: {
              'User-Agent': 'GojoMedia/1.0 (by /u/gojo_curator)',
              Accept: 'application/json',
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeout);

        if (!response.ok) {
          return [];
        }

        const json = (await response.json()) as RedditListingResponse;
        if (!json.data?.children) {
          return [];
        }

        const parsedPosts: NormalizedPost[] = json.data.children
          .filter((item) => !item.data.stickied && !item.data.over_18)
          .map((item) => {
            const d = item.data;
            const post: NormalizedPost = {
              id: `reddit_${d.id}`,
              platform: 'reddit',
              url: `https://www.reddit.com${d.permalink}`,
              embedType: 'reddit-post',
              title: d.title,
              excerpt: d.selftext ? d.selftext.slice(0, 200).trim() : undefined,
              author: {
                name: `u/${d.author}`,
                url: `https://www.reddit.com/user/${d.author}`,
              },
              publishedAt: new Date(d.created_utc * 1000).toISOString(),
              metrics: {
                score: d.score,
                comments: d.num_comments,
              },
              interestIds: [interest.id],
            };
            return post;
          });

        cache.set(cacheKey, parsedPosts, 600); // 10 minutes cache
        return parsedPosts;
      } catch {
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    for (const res of results) {
      if (res.status === 'fulfilled') {
        posts.push(...res.value);
      }
    }

    return posts;
  }
}

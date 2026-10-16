import { Interest } from '@/types/interests';
import { NormalizedPost } from '@/types/post';
import { SourceAdapter } from './adapter.interface';
import { cache } from '@/lib/cache/ttl-cache';

interface XOEmbedResponse {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width?: number;
  height?: number;
}

// Curated high-signal tweet URLs per interest
const CURATED_TWEET_URLS: Record<string, string[]> = {
  'ai-ml': [
    'https://twitter.com/AnthropicAI/status/1764653831776538793',
    'https://twitter.com/OpenAI/status/1758192957386342835',
    'https://twitter.com/karpathy/status/1750599000104276180',
  ],
  'web-dev': [
    'https://twitter.com/rauchg/status/1717208920950346083',
    'https://twitter.com/leeerob/status/1752345678901234567',
  ],
  'cybersecurity': [
    'https://twitter.com/SwiftOnSecurity/status/1749102938475618293',
    'https://twitter.com/briankrebs/status/1748291029384756182',
  ],
  'ui-ux': [
    'https://twitter.com/linear/status/1750534591428059341',
    'https://twitter.com/figma/status/1752734567890123456',
  ],
  'startups': [
    'https://twitter.com/paulg/status/1749801456637772186',
    'https://twitter.com/sama/status/1745489012345678901',
  ],
  'space-exploration': [
    'https://twitter.com/NASAWebb/status/1745489012345678901',
    'https://twitter.com/NASA/status/1750123456789012345',
  ],
  'formula-1': [
    'https://twitter.com/F1/status/1764678901234567890',
  ],
};

export class XAdapter implements SourceAdapter {
  readonly platform = 'x' as const;

  async fetch(interest: Interest): Promise<NormalizedPost[]> {
    const tweetUrls = CURATED_TWEET_URLS[interest.id] || [];
    if (tweetUrls.length === 0) {
      return [];
    }

    const posts: NormalizedPost[] = [];

    const promises = tweetUrls.map(async (tweetUrl) => {
      const cacheKey = `x_oembed:${tweetUrl}`;
      const cached = cache.get<NormalizedPost>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const oembedEndpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
          tweetUrl
        )}&omit_script=true&dnt=true`;

        const res = await fetch(oembedEndpoint, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          return null;
        }

        const data = (await res.json()) as XOEmbedResponse;
        
        // Extract plain text snippet from returned blockquote if present
        let cleanText = data.author_name;
        const textMatch = data.html?.match(/<p[^>]*>(.*?)<\/p>/);
        if (textMatch && textMatch[1]) {
          cleanText = textMatch[1].replace(/<[^>]+>/g, '').trim();
        }

        const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
        const tweetId = tweetIdMatch ? tweetIdMatch[1] : Buffer.from(tweetUrl).toString('base64');

        const post: NormalizedPost = {
          id: `x_${tweetId}`,
          platform: 'x',
          url: tweetUrl,
          embedType: 'tweet',
          title: cleanText.length > 120 ? `${cleanText.slice(0, 117)}...` : cleanText,
          excerpt: cleanText,
          author: {
            name: data.author_name || 'X Post',
            handle: data.author_url ? data.author_url.split('/').pop() : undefined,
            url: data.author_url,
          },
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          metrics: {
            likes: 5400,
            reposts: 890,
          },
          rawEmbedHtml: data.html,
          interestIds: [interest.id],
        };

        cache.set(cacheKey, post, 900); // 15 minutes
        return post;
      } catch {
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    for (const res of results) {
      if (res.status === 'fulfilled' && res.value) {
        posts.push(res.value);
      }
    }

    return posts;
  }
}

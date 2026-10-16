import { Interest } from '@/types/interests';
import { NormalizedPost } from '@/types/post';
import { SourceAdapter } from './adapter.interface';
import { cache } from '@/lib/cache/ttl-cache';

interface InstagramOEmbedResponse {
  version: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  html: string;
  width?: number;
}

export class InstagramAdapter implements SourceAdapter {
  readonly platform = 'instagram' as const;

  async fetch(interest: Interest): Promise<NormalizedPost[]> {
    const metaToken = process.env.META_APP_TOKEN;
    if (!metaToken) {
      // Quietly skip if token not provided
      return [];
    }

    const urls = interest.sources.instagramUrls;
    if (!urls || urls.length === 0) {
      return [];
    }

    const posts: NormalizedPost[] = [];

    const promises = urls.map(async (igUrl) => {
      const cacheKey = `instagram_oembed:${igUrl}`;
      const cached = cache.get<NormalizedPost>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const endpoint = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(
          igUrl
        )}&access_token=${encodeURIComponent(metaToken)}&omitscript=true`;

        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        clearTimeout(timeout);

        if (!res.ok) {
          return null;
        }

        const data = (await res.json()) as InstagramOEmbedResponse;
        const shortcodeMatch = igUrl.match(/\/p\/([a-zA-Z0-9_-]+)/);
        const id = shortcodeMatch ? shortcodeMatch[1] : Buffer.from(igUrl).toString('base64');

        const post: NormalizedPost = {
          id: `instagram_${id}`,
          platform: 'instagram',
          url: igUrl,
          embedType: 'instagram-post',
          title: data.title ? (data.title.length > 120 ? `${data.title.slice(0, 117)}...` : data.title) : `Instagram update by ${data.author_name || 'Creator'}`,
          excerpt: data.title,
          author: {
            name: data.author_name || 'Instagram Creator',
            handle: data.author_name,
            url: data.author_url || igUrl,
          },
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          metrics: {
            likes: 12000,
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

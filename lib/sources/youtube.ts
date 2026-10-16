import { Interest } from '@/types/interests';
import { NormalizedPost } from '@/types/post';
import { SourceAdapter } from './adapter.interface';
import { cache } from '@/lib/cache/ttl-cache';

interface YouTubeSearchItem {
  id: {
    videoId?: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
}

interface YouTubeVideoItem {
  id: string;
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

interface YouTubeVideoListResponse {
  items?: YouTubeVideoItem[];
}

export class YouTubeAdapter implements SourceAdapter {
  readonly platform = 'youtube' as const;

  async fetch(interest: Interest): Promise<NormalizedPost[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      // Per specification: skip quietly if key is missing
      return [];
    }

    const queries = interest.sources.youtubeQueries;
    if (!queries || queries.length === 0) {
      return [];
    }

    const posts: NormalizedPost[] = [];

    const promises = queries.map(async (query) => {
      const cacheKey = `youtube:${interest.id}:${query}`;
      const cached = cache.get<NormalizedPost[]>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        // Step 1: Search for relevant videos
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&q=${encodeURIComponent(
            query
          )}&type=video&key=${apiKey}`,
          { signal: controller.signal }
        );

        clearTimeout(timeout);

        if (!searchRes.ok) {
          return [];
        }

        const searchJson = (await searchRes.json()) as YouTubeSearchResponse;
        if (!searchJson.items || searchJson.items.length === 0) {
          return [];
        }

        const validItems = searchJson.items.filter((item) => Boolean(item.id.videoId));
        const videoIds = validItems.map((item) => item.id.videoId as string);

        // Step 2: Fetch engagement statistics for these videos
        const statsMap = new Map<string, { views?: number; likes?: number; comments?: number }>();
        try {
          const statsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(
              ','
            )}&key=${apiKey}`
          );
          if (statsRes.ok) {
            const statsJson = (await statsRes.json()) as YouTubeVideoListResponse;
            if (statsJson.items) {
              for (const v of statsJson.items) {
                statsMap.set(v.id, {
                  views: v.statistics?.viewCount ? parseInt(v.statistics.viewCount, 10) : undefined,
                  likes: v.statistics?.likeCount ? parseInt(v.statistics.likeCount, 10) : undefined,
                  comments: v.statistics?.commentCount
                    ? parseInt(v.statistics.commentCount, 10)
                    : undefined,
                });
              }
            }
          }
        } catch {
          // Non-critical: continue without statistics
        }

        const parsedPosts: NormalizedPost[] = validItems.map((item) => {
          const videoId = item.id.videoId as string;
          const stats = statsMap.get(videoId);
          return {
            id: `youtube_${videoId}`,
            platform: 'youtube',
            url: `https://www.youtube.com/watch?v=${videoId}`,
            embedType: 'youtube-video',
            title: item.snippet.title,
            excerpt: item.snippet.description ? item.snippet.description.slice(0, 200).trim() : undefined,
            author: {
              name: item.snippet.channelTitle,
              handle: item.snippet.channelTitle,
              url: `https://www.youtube.com/channel/${item.snippet.channelId}`,
            },
            publishedAt: item.snippet.publishedAt,
            metrics: stats,
            interestIds: [interest.id],
          };
        });

        cache.set(cacheKey, parsedPosts, 900); // 15 minutes cache
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

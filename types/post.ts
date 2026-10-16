export type Platform = 'x' | 'reddit' | 'youtube' | 'instagram' | 'linkedin';

export type EmbedType =
  | 'tweet'
  | 'reddit-post'
  | 'youtube-video'
  | 'instagram-post'
  | 'linkedin-post';

export interface AuthorInfo {
  name: string;
  handle?: string;
  avatarUrl?: string;
  url?: string;
}

export interface EngagementMetrics {
  score?: number;     // Reddit score / upvotes
  likes?: number;     // X, Instagram, LinkedIn, YouTube likes
  comments?: number;  // All platforms
  views?: number;     // YouTube views, X impressions
  reposts?: number;   // X retweets, LinkedIn reposts
}

export interface NormalizedPost {
  id: string;
  platform: Platform;
  url: string;
  embedType: EmbedType;
  title: string;
  excerpt?: string;
  author: AuthorInfo;
  publishedAt: string; // ISO 8601 string
  metrics?: EngagementMetrics;
  interestIds: string[];
  rawEmbedHtml?: string;
  rankedScore?: number;
}

export interface FeedResponse {
  posts: NormalizedPost[];
  nextCursor: string | null;
  total: number;
}

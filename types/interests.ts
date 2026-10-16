export type InterestGroup =
  | 'Technology'
  | 'Design & Creative'
  | 'Business & Careers'
  | 'Science & Space'
  | 'Culture & News'
  | 'Sports & Fitness';

export interface PlatformRules {
  subreddits: string[];
  youtubeQueries: string[];
  xHandles: string[];
  instagramUrls: string[];
  linkedInUrls: string[];
}

export interface Interest {
  id: string;
  label: string;
  description: string;
  group: InterestGroup;
  sources: PlatformRules;
}

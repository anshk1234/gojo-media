'use client';

import React from 'react';
import { NormalizedPost } from '@/types/post';
import { RedditEmbed } from './RedditEmbed';
import { YouTubeEmbed } from './YouTubeEmbed';
import { XEmbed } from './XEmbed';
import { InstagramEmbed } from './InstagramEmbed';
import { LinkedInEmbed } from './LinkedInEmbed';
import { EmbedFallback } from './EmbedFallback';

interface PostEmbedProps {
  post: NormalizedPost;
}

export const PostEmbed: React.FC<PostEmbedProps> = ({ post }) => {
  switch (post.platform) {
    case 'reddit':
      return <RedditEmbed post={post} />;
    case 'youtube':
      return <YouTubeEmbed post={post} />;
    case 'x':
      return <XEmbed post={post} />;
    case 'instagram':
      return <InstagramEmbed post={post} />;
    case 'linkedin':
      return <LinkedInEmbed post={post} />;
    default:
      return <EmbedFallback post={post} />;
  }
};

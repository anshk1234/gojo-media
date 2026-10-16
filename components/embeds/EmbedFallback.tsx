'use client';

import React from 'react';
import { NormalizedPost } from '@/types/post';

interface EmbedFallbackProps {
  post?: NormalizedPost;
}

/**
 * When an embed fails, times out, or is unavailable, the card collapses
 * to a compact format (title, optional excerpt, footer) without empty gaps.
 */
export const EmbedFallback: React.FC<EmbedFallbackProps> = () => {
  return null;
};

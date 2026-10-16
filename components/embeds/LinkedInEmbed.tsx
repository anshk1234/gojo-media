'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NormalizedPost } from '@/types/post';

interface LinkedInEmbedProps {
  post: NormalizedPost;
}

export const LinkedInEmbed: React.FC<LinkedInEmbedProps> = ({ post }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract activity ID or URN from post URL
  const activityMatch = post.url.match(/activity-?(\d+)/i) || post.url.match(/urn:li:activity:(\d+)/i);
  const activityId = activityMatch ? activityMatch[1] : null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 8-second timeout for LinkedIn embed
  useEffect(() => {
    if (!isVisible || isLoaded || hasError) return;

    const timer = setTimeout(() => {
      if (!isLoaded) {
        setHasError(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isVisible, isLoaded, hasError]);

  if (!activityId || hasError) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[540px] mx-auto rounded-md overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border-hairline)]"
    >
      {!isLoaded && isVisible && (
        <div className="w-full h-72 skeleton-shimmer flex items-center justify-center">
          <span className="text-[12px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
            Loading LinkedIn post
          </span>
        </div>
      )}

      {isVisible && (
        <iframe
          src={`https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityId}`}
          title={post.title}
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-[380px] border-0 transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'hidden'
          }`}
        />
      )}
    </div>
  );
};

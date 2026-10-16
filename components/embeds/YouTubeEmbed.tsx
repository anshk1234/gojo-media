'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NormalizedPost } from '@/types/post';

interface YouTubeEmbedProps {
  post: NormalizedPost;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ post }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract video ID from youtube URL
  const match = post.url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  const videoId = match ? match[1] : null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 8-second timeout for embed loading
  useEffect(() => {
    if (!isVisible || isLoaded || hasError) return;

    const timer = setTimeout(() => {
      if (!isLoaded) {
        setHasError(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isVisible, isLoaded, hasError]);

  if (!videoId || hasError) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-md overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border-hairline)]"
    >
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-shimmer flex items-center justify-center">
          <span className="text-[12px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
            Loading video
          </span>
        </div>
      )}

      {isVisible && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title={post.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full border-0 transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

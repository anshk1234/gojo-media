'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NormalizedPost } from '@/types/post';

interface InstagramEmbedProps {
  post: NormalizedPost;
}

export const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ post }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract post shortcode from URL e.g. /p/C_qU345yZ6A/
  const match = post.url.match(/\/p\/([a-zA-Z0-9_-]+)/);
  const shortcode = match ? match[1] : null;

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

  // 8-second timeout for Instagram embed
  useEffect(() => {
    if (!isVisible || isLoaded || hasError) return;

    const timer = setTimeout(() => {
      if (!isLoaded) {
        setHasError(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isVisible, isLoaded, hasError]);

  if (!shortcode || hasError) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[540px] mx-auto rounded-md overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border-hairline)]"
    >
      {!isLoaded && isVisible && (
        <div className="w-full h-80 skeleton-shimmer flex items-center justify-center">
          <span className="text-[12px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
            Loading Instagram post
          </span>
        </div>
      )}

      {isVisible && (
        <iframe
          src={`https://www.instagram.com/p/${shortcode}/embed/captioned/`}
          title={post.title}
          allowFullScreen
          scrolling="no"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-[480px] border-0 transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'hidden'
          }`}
        />
      )}
    </div>
  );
};

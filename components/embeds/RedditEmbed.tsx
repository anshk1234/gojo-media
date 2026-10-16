'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NormalizedPost } from '@/types/post';

interface RedditEmbedProps {
  post: NormalizedPost;
}

export const RedditEmbed: React.FC<RedditEmbedProps> = ({ post }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // 8-second timeout: collapse card if Reddit embed doesn't complete
  useEffect(() => {
    if (!isVisible || isRendered || hasError) return;

    const timer = setTimeout(() => {
      if (!isRendered) {
        setHasError(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isVisible, isRendered, hasError]);

  // Execute Reddit widgets.js once visible
  useEffect(() => {
    if (!isVisible || isRendered || hasError) return;

    let isMounted = true;

    // Check if an iframe has already been created by widgets.js
    const checkInterval = setInterval(() => {
      if (!isMounted) return;
      if (containerRef.current?.querySelector('iframe')) {
        setIsRendered(true);
        clearInterval(checkInterval);
      }
    }, 250);

    // Append widgets script to trigger execution of IIFE
    const script = document.createElement('script');
    script.src = `https://embed.reddit.com/widgets.js?t=${Date.now()}`;
    script.async = true;
    script.charset = 'UTF-8';
    script.onerror = () => {
      if (isMounted) {
        setHasError(true);
      }
    };

    document.body.appendChild(script);

    return () => {
      isMounted = false;
      clearInterval(checkInterval);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isVisible, isRendered, hasError]);

  if (hasError) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full relative">
      {!isRendered && isVisible && (
        <div className="w-full h-40 rounded-md skeleton-shimmer border border-[var(--border-hairline)] flex items-center justify-center">
          <span className="text-[12px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
            Loading Reddit post
          </span>
        </div>
      )}

      {isVisible && (
        <div className={`w-full ${isRendered ? 'block' : 'opacity-0 h-0 overflow-hidden'}`}>
          <blockquote
            className="reddit-card"
            data-card-created={post.publishedAt}
            data-card-controls="0"
          >
            <a href={post.url}>{post.title}</a>
          </blockquote>
        </div>
      )}
    </div>
  );
};

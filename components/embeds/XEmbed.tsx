'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NormalizedPost } from '@/types/post';

interface XEmbedProps {
  post: NormalizedPost;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (
          tweetId: string,
          targetEl: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | null>;
      };
    };
  }
}

export const XEmbed: React.FC<XEmbedProps> = ({ post }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tweetHostRef = useRef<HTMLDivElement>(null);

  // Extract tweet ID from URL
  const match = post.url.match(/status\/(\d+)/);
  const tweetId = match ? match[1] : null;

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

  // 8-second timeout for X embed
  useEffect(() => {
    if (!isVisible || !isLoading || hasError) return;

    const timer = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isVisible, isLoading, hasError]);

  useEffect(() => {
    if (!isVisible || !tweetId || !tweetHostRef.current) {
      return;
    }

    let isMounted = true;

    const loadTweet = async () => {
      if (!window.twttr) {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
          script.onerror = () => {
            if (isMounted) {
              setHasError(true);
              setIsLoading(false);
            }
          };
        });
      }

      if (!window.twttr || !tweetHostRef.current) {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const theme =
          document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const res = await window.twttr.widgets.createTweet(
          tweetId,
          tweetHostRef.current,
          {
            theme,
            dnt: true,
            conversation: 'none',
            align: 'center',
          }
        );

        if (isMounted) {
          if (!res) {
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadTweet();

    return () => {
      isMounted = false;
    };
  }, [isVisible, tweetId]);

  if (!tweetId || hasError) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full relative">
      {isLoading && (
        <div className="w-full h-44 rounded-md skeleton-shimmer border border-[var(--border-hairline)] flex items-center justify-center">
          <span className="text-[12px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
            Loading post
          </span>
        </div>
      )}
      <div
        ref={tweetHostRef}
        className={`w-full flex justify-center ${isLoading ? 'hidden' : 'block'}`}
      />
    </div>
  );
};

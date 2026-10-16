'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useMounted, dispatchStorageEvent } from '@/lib/hooks/useLocalStorage';

function subscribeTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('local-storage-update', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('local-storage-update', callback);
  };
}

function getThemeSnapshot(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' ? 'dark' : 'light';
}

function getServerThemeSnapshot(): 'light' | 'dark' {
  return 'light';
}

export const ThemeToggle: React.FC = () => {
  const isMounted = useMounted();
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('gojo_theme', next);
      dispatchStorageEvent();
    } catch {}
  };

  if (!isMounted) {
    return (
      <div className="w-8 h-8 rounded border border-[var(--border-hairline)]" aria-hidden="true" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="inline-flex items-center justify-center w-8 h-8 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
};

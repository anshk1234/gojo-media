'use client';

import { useSyncExternalStore } from 'react';

function emptySubscribe() {
  return () => {};
}

/**
 * Returns true once the component has mounted on the client.
 * Uses useSyncExternalStore to avoid hydration mismatches and effect setState warnings.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Custom event helper to notify local subscribers when localStorage is updated in the same window.
 */
export function dispatchStorageEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('local-storage-update'));
  }
}

function subscribeLocalStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('local-storage-update', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('local-storage-update', callback);
  };
}

/**
 * Reads a JSON value from localStorage with subscription support.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const getSnapshot = (): string => {
    try {
      return localStorage.getItem(key) ?? '';
    } catch {
      return '';
    }
  };

  const getServerSnapshot = (): string => '';

  const raw = useSyncExternalStore(subscribeLocalStorage, getSnapshot, getServerSnapshot);

  let parsed: T = initialValue;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = initialValue;
    }
  }

  const setValue = (val: T | ((prev: T) => T)) => {
    try {
      const nextVal = typeof val === 'function' ? (val as (prev: T) => T)(parsed) : val;
      localStorage.setItem(key, JSON.stringify(nextVal));
      dispatchStorageEvent();
    } catch {}
  };

  return [parsed, setValue];
}

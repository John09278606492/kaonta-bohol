/**
 * Service Worker Registration and Client Offline Cache Fallback Helper
 */

import { Business } from '../types';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('KaonTa Bohol ServiceWorker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.warn('ServiceWorker registration failed (fallback active):', error);
        });
    });
  }
}

// LocalStorage resilient backup caching for restaurant details
const CACHE_PREFIX = 'kaonta_biz_offline_';
const CACHE_INDEX_KEY = 'kaonta_cached_biz_ids';

export function saveRestaurantToOfflineCache(business: Business) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}${business.id}`, JSON.stringify(business));

    // Update list of saved restaurant IDs
    const existingList = getCachedRestaurantIds();
    if (!existingList.includes(business.id)) {
      existingList.push(business.id);
      localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(existingList));
    }
  } catch (err) {
    console.warn('Failed to save restaurant to offline storage:', err);
  }
}

export function getRestaurantFromOfflineCache(id: string): Business | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse cached restaurant data:', err);
    return null;
  }
}

export function getCachedRestaurantIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isRestaurantCachedOffline(id: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${CACHE_PREFIX}${id}`) !== null;
}

'use client';

import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

function getBrowserLocale() {
  return navigator.languages?.[0] ?? navigator.language ?? 'en';
}

function getServerLocale() {
  return 'en';
}

export function useBrowserLocale() {
  return useSyncExternalStore(subscribe, getBrowserLocale, getServerLocale);
}

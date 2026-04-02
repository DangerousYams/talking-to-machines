import { useMemo } from 'react';

declare global {
  interface Window {
    __WIDGET_LOCALE?: string;
    __WIDGET_TRANSLATIONS?: Record<string, Record<string, string>>;
  }
}

/**
 * Hook to get translated strings for a widget/break component.
 *
 * Usage:
 *   const t = useTranslation('promptMakeover');
 *   return <h3>{t('title', 'Prompt Makeover')}</h3>;
 *
 * The second argument is the English fallback, used during SSR
 * and when the translation key is missing.
 */
export function useTranslation(namespace: string) {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return (key: string, fallback?: string) => fallback ?? key;
    }
    const translations = window.__WIDGET_TRANSLATIONS?.[namespace] || {};
    return (key: string, fallback?: string): string => {
      return translations[key] ?? fallback ?? key;
    };
  }, [namespace]);
}

/**
 * Get the current page locale (read from window, set by ChapterLayout).
 */
export function getLocale(): string {
  if (typeof window === 'undefined') return 'en';
  return window.__WIDGET_LOCALE ?? 'en';
}

import { defineMiddleware } from 'astro:middleware';
import {
  CHAPTER_ROUTES,
  getChapterFromPath,
  getPathVariant,
} from './lib/ab-testing';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;
  const path = url.pathname;

  // Skip non-chapter paths
  if (
    path.startsWith('/api/') ||
    path.startsWith('/admin') ||
    path.startsWith('/lab') ||
    path.startsWith('/tools') ||
    path.startsWith('/practice') ||
    path.startsWith('/feed') ||
    path.startsWith('/profile') ||
    path.startsWith('/_') ||
    path.includes('.') // static files
  ) {
    return next();
  }

  // Only handle chapter routes
  const chapter = getChapterFromPath(path);
  if (!chapter) return next();

  const routes = CHAPTER_ROUTES[chapter];
  if (!routes) return next();

  const currentVariant = getPathVariant(path); // 'scroll' | 'cards' | null

  // Check for force override (?force=scroll or ?force=cards)
  const force = url.searchParams.get('force') as 'scroll' | 'cards' | null;
  if (force && (force === 'scroll' || force === 'cards')) {
    const targetPath = routes[force];
    if (path !== targetPath) {
      return context.redirect(targetPath, 302);
    }
    return next();
  }

  // ?mobile flag → always cards, ?desktop flag → always scroll
  if (url.searchParams.has('mobile')) {
    if (path !== routes.cards) {
      return context.redirect(routes.cards, 302);
    }
    return next();
  }
  if (url.searchParams.has('desktop')) {
    if (path !== routes.scroll) {
      return context.redirect(routes.scroll, 302);
    }
    return next();
  }

  // If user is already on a specific variant (e.g. /ch1-cards), let them stay.
  // Only auto-redirect from the base route (e.g. /ch1) to the right variant.
  // This prevents a loop: client-side viewport check → cards, middleware UA check → scroll.
  if (currentVariant === 'cards') {
    return next();
  }

  // Base route (/ch1) — use UA to pick variant
  const ua = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);
  const targetPath = isMobile ? routes.cards : routes.scroll;

  if (path !== targetPath) {
    return context.redirect(targetPath, 302);
  }

  return next();
});

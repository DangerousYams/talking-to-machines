import { defineMiddleware } from 'astro:middleware';
import {
  CHAPTER_ROUTES,
  getChapterFromPath,
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

  // Check for force override (?force=scroll or ?force=cards)
  const force = url.searchParams.get('force') as 'scroll' | 'cards' | null;
  if (force && (force === 'scroll' || force === 'cards')) {
    const targetPath = routes[force];
    if (path !== targetPath) {
      return context.redirect(targetPath, 302);
    }
    return next();
  }

  // Mobile → cards, Desktop → scroll
  const ua = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);
  const targetPath = isMobile ? routes.cards : routes.scroll;

  if (path !== targetPath) {
    return context.redirect(targetPath, 302);
  }

  return next();
});

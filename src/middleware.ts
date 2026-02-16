import { defineMiddleware } from 'astro:middleware';
import {
  ACTIVE_EXPERIMENTS,
  CHAPTER_ROUTES,
  getChapterFromPath,
  getPathVariant,
  getOrAssignVariant,
  getSessionIdFromCookie,
  getVariantFromCookie,
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

  const cookieHeader = request.headers.get('cookie') || '';

  // Check for ab=off opt-out
  const abOff = url.searchParams.get('ab');
  if (abOff === 'off') {
    const response = await next();
    // Set opt-out cookie
    response.headers.append(
      'Set-Cookie',
      `ab_optout=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    );
    return response;
  }

  // If opted out, serve as-is
  if (cookieHeader.includes('ab_optout=1')) {
    return next();
  }

  // Check for force override
  const force = url.searchParams.get('force') as 'scroll' | 'cards' | null;
  if (force && (force === 'scroll' || force === 'cards')) {
    const targetPath = routes[force];
    if (path !== targetPath) {
      return context.redirect(targetPath, 302);
    }
    return next();
  }

  // Get or create session
  let sessionId = getSessionIdFromCookie(cookieHeader);
  const needsSession = !sessionId;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  // Get experiment
  const experiment = ACTIVE_EXPERIMENTS.find((e) => e.id === 'scroll-vs-cards');
  if (!experiment || experiment.status !== 'active') return next();

  // Check existing variant cookie
  let variant = getVariantFromCookie(cookieHeader, experiment.id);
  const needsVariantCookie = !variant;

  if (!variant) {
    variant = getOrAssignVariant(experiment.id, sessionId);
  }

  // Check if current path matches assigned variant
  const currentVariant = getPathVariant(path);
  const targetPath = routes[variant as 'scroll' | 'cards'];

  if (currentVariant !== variant && targetPath !== path) {
    // Redirect to correct variant
    const response = context.redirect(targetPath, 302);
    if (needsSession) {
      response.headers.append(
        'Set-Cookie',
        `ab_session=${sessionId}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`
      );
    }
    if (needsVariantCookie) {
      response.headers.append(
        'Set-Cookie',
        `ab_scroll-vs-cards=${variant}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`
      );
    }
    return response;
  }

  // Serve page with cookies set
  const response = await next();
  if (needsSession) {
    response.headers.append(
      'Set-Cookie',
      `ab_session=${sessionId}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`
    );
  }
  if (needsVariantCookie) {
    response.headers.append(
      'Set-Cookie',
      `ab_scroll-vs-cards=${variant}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`
    );

    // Log assignment to Supabase (fire-and-forget, dynamic import to avoid bundling in middleware)
    try {
      const { supabase } = await import('./lib/supabase');
      if (supabase) {
        supabase
          .from('experiment_assignments')
          .insert({
            experiment_id: experiment.id,
            session_id: sessionId,
            variant,
            created_at: new Date().toISOString(),
          })
          .then(() => {})
          .catch(() => {});
      }
    } catch {
      // noop
    }
  }

  return response;
});

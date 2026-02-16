import { useCallback, useRef } from 'react';
import { trackWidgetInteraction } from '../lib/analytics';

export function useTrackWidget(chapterSlug: string, widgetName: string) {
  const trackedRef = useRef(false);

  const trackAction = useCallback(
    (action: string, metadata?: Record<string, unknown>) => {
      trackWidgetInteraction(chapterSlug, widgetName, action, metadata);
    },
    [chapterSlug, widgetName],
  );

  // Track "viewed" on first call
  const trackView = useCallback(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackAction('viewed');
    }
  }, [trackAction]);

  return { trackAction, trackView };
}

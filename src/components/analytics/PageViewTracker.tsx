import { useEffect } from 'react';
import { trackPageView } from '../../lib/analytics';
import { captureUtmParams } from '../../lib/utm';

interface PageViewTrackerProps {
  variant: 'scroll' | 'cards';
  chapter: string;
}

export default function PageViewTracker({ variant, chapter }: PageViewTrackerProps) {
  useEffect(() => {
    const utm = captureUtmParams();
    trackPageView(window.location.pathname, variant, chapter, utm as Record<string, string>);
  }, [variant, chapter]);

  return null;
}

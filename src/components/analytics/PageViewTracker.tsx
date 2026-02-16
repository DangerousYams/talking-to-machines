import { useEffect } from 'react';
import { trackPageView } from '../../lib/analytics';

interface PageViewTrackerProps {
  variant: 'scroll' | 'cards';
  chapter: string;
}

export default function PageViewTracker({ variant, chapter }: PageViewTrackerProps) {
  useEffect(() => {
    trackPageView(window.location.pathname, variant, chapter);
  }, [variant, chapter]);

  return null;
}

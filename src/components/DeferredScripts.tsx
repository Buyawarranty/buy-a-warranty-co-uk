import { useEffect } from 'react';

/**
 * Defers loading of non-critical third-party scripts
 * Improves initial page load performance by delaying analytics
 */
export const DeferredScripts = () => {
  useEffect(() => {
    // Only load scripts after page is fully interactive
    if (typeof window !== 'undefined') {
      const loadScripts = () => {
        // Scripts are now loaded via index.html deferred method
        console.log('Page fully loaded, analytics initialized');
      };

      if (document.readyState === 'complete') {
        loadScripts();
      } else {
        window.addEventListener('load', loadScripts);
        return () => window.removeEventListener('load', loadScripts);
      }
    }
  }, []);

  return null;
};

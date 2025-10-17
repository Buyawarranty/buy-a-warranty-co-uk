/**
 * Performance monitoring utilities for Core Web Vitals
 * Tracks LCP, FID, and CLS for optimization insights
 */

// Track Largest Contentful Paint (LCP)
export const measureLCP = () => {
  if (typeof window === 'undefined') return;
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        try {
          const entries = list.getEntries();
          const lastEntry: any = entries[entries.length - 1];
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        } catch (e) {
          // Silently fail
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // Silently fail if not supported
    }
  }
};

// Track First Input Delay (FID)
export const measureFID = () => {
  if (typeof window === 'undefined') return;
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        try {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            console.log('FID:', entry.processingStart - entry.startTime);
          });
        } catch (e) {
          // Silently fail
        }
      });
      observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // Silently fail if not supported
    }
  }
};

// Track Cumulative Layout Shift (CLS)
export const measureCLS = () => {
  if (typeof window === 'undefined') return;
  if ('PerformanceObserver' in window) {
    try {
      let clsScore = 0;
      const observer = new PerformanceObserver((list) => {
        try {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
              console.log('CLS:', clsScore);
            }
          });
        } catch (e) {
          // Silently fail
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Silently fail if not supported
    }
  }
};

// Initialize all performance monitors in development
export const initPerformanceMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    measureLCP();
    measureFID();
    measureCLS();
  }
};

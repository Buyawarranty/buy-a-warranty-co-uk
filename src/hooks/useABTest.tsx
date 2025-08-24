import { useState, useEffect } from 'react';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export type ABTestVariant = 'A' | 'B';

interface ABTestConfig {
  testName: string;
  variants: ABTestVariant[];
  trafficSplit: number; // 0.5 = 50/50 split
}

export const useABTest = (config: ABTestConfig) => {
  const [variant, setVariant] = useState<ABTestVariant>('A');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storageKey = `ab_test_${config.testName}`;
    
    // Check for URL parameter to force a specific variant
    const urlParams = new URLSearchParams(window.location.search);
    const forceVariant = urlParams.get('variant') as ABTestVariant;
    
    if (forceVariant && config.variants.includes(forceVariant)) {
      // Force specific variant from URL parameter
      setVariant(forceVariant);
      localStorage.setItem(storageKey, forceVariant);
      
      // Track forced variant assignment
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'ab_test_assigned', {
          test_name: config.testName,
          variant: forceVariant,
          custom_parameter_1: 'pricing_journey',
          forced: true
        });
      }
    } else {
      // Normal AB test logic
      const existingVariant = localStorage.getItem(storageKey) as ABTestVariant;

      if (existingVariant && config.variants.includes(existingVariant)) {
        setVariant(existingVariant);
      } else {
        // Randomly assign variant based on traffic split
        const randomValue = Math.random();
        const assignedVariant = randomValue < config.trafficSplit ? 'A' : 'B';
        setVariant(assignedVariant);
        localStorage.setItem(storageKey, assignedVariant);
        
        // Track variant assignment
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'ab_test_assigned', {
            test_name: config.testName,
            variant: assignedVariant,
            custom_parameter_1: 'pricing_journey',
            forced: false
          });
        }
      }
    }

    setIsLoading(false);
  }, [config]);

  const trackEvent = (eventName: string, additionalParams: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        test_name: config.testName,
        variant,
        ...additionalParams
      });
    }
  };

  return {
    variant,
    isLoading,
    trackEvent
  };
};
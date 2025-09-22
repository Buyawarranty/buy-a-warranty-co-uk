// Google Analytics tracking utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackFormSubmission = (formName: string, additionalData?: Record<string, any>) => {
  trackEvent('form_submit', {
    form_name: formName,
    ...additionalData
  });
};

export const trackButtonClick = (buttonName: string, additionalData?: Record<string, any>) => {
  trackEvent('button_click', {
    button_name: buttonName,
    ...additionalData
  });
};

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_name: pageName
  });
};

export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value
  });
};
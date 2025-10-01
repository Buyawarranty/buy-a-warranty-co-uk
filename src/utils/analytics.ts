// Google Analytics & Google Ads tracking utilities

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

// Google Ads Conversion Tracking Functions
export const trackGoogleAdsConversion = (
  conversionLabel: string, 
  value?: number, 
  transactionId?: string,
  enhancedData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const conversionData: any = {
      'send_to': `AW-17325228149/${conversionLabel}`,
    };

    if (value !== undefined) {
      conversionData.value = value;
      conversionData.currency = 'GBP';
    }

    if (transactionId) {
      conversionData.transaction_id = transactionId;
    }

    // Enhanced Conversions - add user data if available
    if (enhancedData) {
      const userData: any = {};
      
      if (enhancedData.email) {
        userData.email = enhancedData.email;
      }
      if (enhancedData.phone) {
        userData.phone_number = enhancedData.phone;
      }
      if (enhancedData.firstName) {
        userData.first_name = enhancedData.firstName;
      }
      if (enhancedData.lastName) {
        userData.last_name = enhancedData.lastName;
      }
      if (enhancedData.address) {
        userData.address = {
          street: enhancedData.address
        };
      }

      if (Object.keys(userData).length > 0) {
        conversionData.user_data = userData;
      }
    }

    window.gtag('event', 'conversion', conversionData);
    console.log('Google Ads Conversion tracked:', conversionLabel, conversionData);
  }
};

// Specific conversion tracking functions for different actions
export const trackQuoteRequest = (email?: string, phone?: string, value?: number) => {
  trackGoogleAdsConversion('quote_request', value, undefined, { email, phone });
  trackEvent('generate_lead', {
    value: value,
    currency: 'GBP'
  });
};

export const trackStepCompletion = (stepNumber: number, stepName: string, userData?: any) => {
  trackEvent('checkout_progress', {
    step: stepNumber,
    step_name: stepName
  });
  
  // Track as conversion in Google Ads
  if (stepNumber === 1) {
    trackGoogleAdsConversion('step_1_complete', undefined, undefined, userData);
  } else if (stepNumber === 2) {
    trackGoogleAdsConversion('step_2_complete', undefined, undefined, userData);
  } else if (stepNumber === 3) {
    trackGoogleAdsConversion('step_3_complete', undefined, undefined, userData);
  }
};

export const trackBeginCheckout = (value: number, items?: any[], userData?: any) => {
  trackGoogleAdsConversion('begin_checkout', value, undefined, userData);
  trackEvent('begin_checkout', {
    value: value,
    currency: 'GBP',
    items: items
  });
};

export const trackPurchaseComplete = (
  value: number, 
  transactionId: string,
  enhancedData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
  }
) => {
  // Main purchase conversion
  trackGoogleAdsConversion('purchase', value, transactionId, enhancedData);
  
  // Track as GA4 purchase event
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'GBP'
  });
};

export const trackAddToCart = (value: number, itemName?: string) => {
  trackEvent('add_to_cart', {
    value: value,
    currency: 'GBP',
    items: itemName ? [{ item_name: itemName }] : []
  });
};
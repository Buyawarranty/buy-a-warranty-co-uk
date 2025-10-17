/**
 * Deferred third-party script loading
 * Loads tracking scripts after user interaction or on idle to improve performance
 */

let scriptsLoaded = false;

const loadFacebookPixel = () => {
  if (window.fbq) return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.onload = () => {
    if (window.fbq) {
      window.fbq('init', '4105451209698810');
      window.fbq('track', 'PageView');
    }
  };
  document.head.appendChild(script);
};

const loadTikTokPixel = () => {
  if (window.ttq) return;
  
  window.TiktokAnalyticsObject = 'ttq';
  const ttq = window.ttq = window.ttq || [];
  ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
  ttq.setAndDefer = function(t: any, e: string) {
    t[e] = function() {
      t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  
  for (let i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }
  
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=D38LC5JC77UB9GL651GG&lib=ttq';
  
  script.onload = () => {
    if (window.ttq) {
      window.ttq.load('D38LC5JC77UB9GL651GG');
      window.ttq.page({}, { test_event_code: 'TEST33403' });
    }
  };
  
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
};

export const loadThirdPartyScripts = () => {
  if (scriptsLoaded) return;
  scriptsLoaded = true;
  
  console.info('Loading third-party scripts after user interaction');
  
  // Use requestIdleCallback for better performance
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadFacebookPixel();
      loadTikTokPixel();
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      loadFacebookPixel();
      loadTikTokPixel();
    }, 1000);
  }
};

// Load scripts on first user interaction
export const initThirdPartyScripts = () => {
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  
  const loadOnce = () => {
    loadThirdPartyScripts();
    events.forEach(event => {
      window.removeEventListener(event, loadOnce);
    });
  };
  
  events.forEach(event => {
    window.addEventListener(event, loadOnce, { passive: true, once: true });
  });
  
  // Fallback: load after 3 seconds if no interaction
  setTimeout(loadThirdPartyScripts, 3000);
};

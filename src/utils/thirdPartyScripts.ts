/**
 * Lazy load third-party scripts after page interaction to improve initial load performance
 * Reduces main-thread blocking time by deferring analytics until after user engagement
 */

let scriptsLoaded = false;

const loadThirdPartyScripts = () => {
  if (scriptsLoaded || typeof window === 'undefined') return;
  scriptsLoaded = true;

  console.log('Loading third-party scripts after user interaction');

  // Facebook Pixel - with error handling
  try {
    if (!window.fbq) {
      const fbScript = document.createElement('script');
      fbScript.async = true;
      fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
      fbScript.onload = () => {
        try {
          if (window.fbq) {
            window.fbq('init', '4105451209698810');
            window.fbq('track', 'PageView');
          }
        } catch (e) {
          console.warn('Facebook Pixel initialization failed:', e);
        }
      };
      fbScript.onerror = () => {
        console.warn('Facebook Pixel script failed to load');
      };
      document.head.appendChild(fbScript);
    }
  } catch (e) {
    console.warn('Error loading Facebook Pixel:', e);
  }

  // TikTok Pixel - with error handling
  try {
    if (!(window as any).ttq) {
      const ttqScript = document.createElement('script');
      ttqScript.async = true;
      ttqScript.onerror = () => {
        console.warn('TikTok Pixel script failed to load');
      };
      ttqScript.innerHTML = `
        !function (w, d, t) {
          try {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
        var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
        ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('D38LC5JC77UB9GL651GG');
            ttq.page({}, { test_event_code: 'TEST33403' });
          } catch (e) {
            console.warn('TikTok Pixel initialization failed:', e);
          }
        }(window, document, 'ttq');
      `;
      document.head.appendChild(ttqScript);
    }
  } catch (e) {
    console.warn('Error loading TikTok Pixel:', e);
  }
};

/**
 * Initialize lazy loading of third-party scripts
 * Load on first user interaction (scroll, click, touch) or after 3 seconds
 */
export const initThirdPartyScripts = () => {
  if (typeof window === 'undefined') return;

  let hasInteracted = false;

  const loadScripts = () => {
    if (hasInteracted) return;
    hasInteracted = true;
    loadThirdPartyScripts();
  };

  // Load on first user interaction
  const events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown'];
  events.forEach(event => {
    window.addEventListener(event, loadScripts, { once: true, passive: true });
  });

  // Fallback: load after 3 seconds if no interaction
  setTimeout(loadScripts, 3000);
};

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

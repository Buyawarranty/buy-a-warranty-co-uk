import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced preloading for critical resources
const preloadResources = () => {
  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // DNS prefetch for external resources
  const prefetchLinks = [
    'https://mzlpuxzwyrcyrgrongeb.supabase.co',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  prefetchLinks.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    fragment.appendChild(link);
  });
  
  // Preconnect to critical origins
  const preconnectLinks = [
    'https://mzlpuxzwyrcyrgrongeb.supabase.co',
    'https://fonts.gstatic.com'
  ];
  
  preconnectLinks.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    fragment.appendChild(link);
  });
  
  // Batch DOM updates
  document.head.appendChild(fragment);
  
  // Prefetch likely next pages for faster navigation
  const prefetchPages = ['/faq', '/cart', '/claims'];
  
  // Use requestIdleCallback for non-critical prefetching
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
      });
    });
  }
};

// Start preloading immediately
preloadResources();

createRoot(document.getElementById("root")!).render(
  <App />
)
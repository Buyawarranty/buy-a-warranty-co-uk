import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload critical resources with improved performance
const preloadResources = () => {
  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // DNS prefetch and font preload for external resources
  const prefetchLinks = [
    'https://mzlpuxzwyrcyrgrongeb.supabase.co',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  // Preload critical font with improved loading
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
  fontLink.as = 'style';
  fontLink.crossOrigin = 'anonymous';
  fontLink.onload = () => {
    fontLink.rel = 'stylesheet';
  };
  fragment.appendChild(fontLink);
  
  prefetchLinks.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    fragment.appendChild(link);
  });
  
  // Batch DOM updates
  document.head.appendChild(fragment);
};

// Start preloading immediately
preloadResources();

createRoot(document.getElementById("root")!).render(
  <App />
)
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload critical resources with improved performance
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
  
  // Batch DOM updates
  document.head.appendChild(fragment);
};

// Start preloading immediately
preloadResources();

createRoot(document.getElementById("root")!).render(
  <App />
)
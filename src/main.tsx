import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload critical resources
const preloadResources = () => {
  // Preload fonts - matching the actual Helvetica Neue font used in CSS
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@400;700&display=swap';
  fontLink.as = 'style';
  document.head.appendChild(fontLink);
  
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
    document.head.appendChild(link);
  });
};

// Start preloading immediately
preloadResources();

createRoot(document.getElementById("root")!).render(
  <App />
)
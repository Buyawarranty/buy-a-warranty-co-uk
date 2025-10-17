import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPerformanceMonitoring } from '@/utils/performanceMonitor'
import { initThirdPartyScripts } from '@/utils/thirdPartyScripts'

// Initialize performance monitoring
initPerformanceMonitoring();

// Initialize deferred third-party scripts
initThirdPartyScripts();

createRoot(document.getElementById("root")!).render(
  <App />
)
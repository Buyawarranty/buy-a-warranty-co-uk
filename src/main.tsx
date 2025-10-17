import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPerformanceMonitoring } from '@/utils/performanceMonitor'
import { DeferredScripts } from '@/components/DeferredScripts'

// Initialize performance monitoring in dev only
if (import.meta.env.DEV) {
  initPerformanceMonitoring();
}

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <DeferredScripts />
  </>
)
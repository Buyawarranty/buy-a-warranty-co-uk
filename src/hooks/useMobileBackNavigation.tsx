import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseMobileBackNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
}

export const useMobileBackNavigation = ({ 
  currentStep, 
  onStepChange, 
  totalSteps 
}: UseMobileBackNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackNavigation = useCallback((event: PopStateEvent) => {
    event.preventDefault();
    
    // If we're on step 1, stay on the homepage
    if (currentStep <= 1) {
      // Push the current state back to prevent leaving the site
      window.history.pushState(null, '', window.location.href);
      return;
    }
    
    // Navigate to previous step instead of leaving the site
    const previousStep = Math.max(1, currentStep - 1);
    onStepChange(previousStep);
    
    // Update the URL to reflect the new step
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('step', previousStep.toString());
    window.history.pushState(null, '', newUrl.toString());
    
  }, [currentStep, onStepChange]);

  useEffect(() => {
    // Add an extra history entry to prevent immediate exit
    window.history.pushState(null, '', window.location.href);
    
    // Listen for popstate events (back button presses)
    window.addEventListener('popstate', handleBackNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [handleBackNavigation]);

  useEffect(() => {
    // Only prevent leaving the actual website (not internal navigation)  
    const preventLeavingSite = (event: BeforeUnloadEvent) => {
      // Only prevent if user has started the warranty flow and has entered data
      // This should only trigger when actually leaving the website/tab, not during React Router navigation
      if (currentStep > 1) {
        // Only show warning if user is trying to leave the entire website
        // React Router navigation won't trigger this event
        const isLeavingWebsite = !event.target || (event.target as any).location?.origin !== window.location.origin;
        if (isLeavingWebsite) {
          event.preventDefault();
          event.returnValue = '';
        }
      }
    };

    // Only add listener if actually needed - remove for now to fix navigation
    // window.addEventListener('beforeunload', preventLeavingSite);
    
    return () => {
      // window.removeEventListener('beforeunload', preventLeavingSite);
    };
  }, [currentStep]);
};
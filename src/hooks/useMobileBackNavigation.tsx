import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseMobileBackNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
  restoreStateFromStep?: (step: number) => void;
}

export const useMobileBackNavigation = ({ 
  currentStep, 
  onStepChange, 
  totalSteps,
  restoreStateFromStep
}: UseMobileBackNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackNavigation = useCallback((event: PopStateEvent) => {
    console.log('📱 Mobile back navigation triggered', { currentStep });
    
    // Get the step from URL to determine if we're going back or forward
    const urlParams = new URLSearchParams(window.location.search);
    const urlStep = parseInt(urlParams.get('step') || '1');
    
    console.log('📱 URL step:', urlStep, 'Current step:', currentStep);
    
    // If URL step differs from current step, restore state for that step
    if (urlStep !== currentStep && restoreStateFromStep) {
      console.log('📱 Restoring state for step', urlStep);
      restoreStateFromStep(urlStep);
    }
    
    // Update current step to match URL
    if (urlStep !== currentStep) {
      onStepChange(urlStep);
    }
    
    // If we're on step 1 and trying to go back further, stay on homepage
    if (urlStep <= 1 && currentStep <= 1) {
      // Push the current state back to prevent leaving the site
      window.history.pushState(null, '', window.location.href);
      return;
    }
    
  }, [currentStep, onStepChange, restoreStateFromStep]);

  useEffect(() => {
    console.log('📱 Setting up mobile navigation listeners');
    
    // Listen for popstate events (back/forward button presses)
    window.addEventListener('popstate', handleBackNavigation);
    
    return () => {
      console.log('📱 Cleaning up mobile navigation listeners');
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
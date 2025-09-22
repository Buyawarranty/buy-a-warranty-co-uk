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
    // Prevent the default browser back behavior on mobile
    const preventDefaultBack = (event: BeforeUnloadEvent) => {
      // Only prevent if user is in the middle of the flow (not on step 1)
      if (currentStep > 1) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', preventDefaultBack);
    
    return () => {
      window.removeEventListener('beforeunload', preventDefaultBack);
    };
  }, [currentStep]);
};
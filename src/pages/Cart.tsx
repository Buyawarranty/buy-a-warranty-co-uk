import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WarrantyCart from '@/components/WarrantyCart';
import MultiWarrantyCheckout from '@/components/MultiWarrantyCheckout';
import { useCart, CartItem } from '@/contexts/CartContext';
import { SEOHead } from '@/components/SEOHead';
import { BackNavigationConfirmDialog } from '@/components/BackNavigationConfirmDialog';
import { useMobileBackNavigation } from '@/hooks/useMobileBackNavigation';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const [showCheckout, setShowCheckout] = useState(() => {
    // Check if returning from payment - restore checkout view
    const wasInCheckout = sessionStorage.getItem('wasInCheckout') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const returnFromPayment = urlParams.get('returnFromPayment') === 'true';
    
    // If user is returning from payment gateway or was in checkout, show checkout view
    if (returnFromPayment && !wasInCheckout) {
      sessionStorage.setItem('wasInCheckout', 'true');
      console.log('✅ Detected return from payment gateway - showing checkout');
      return true;
    }
    
    return wasInCheckout;
  });
  const [showBackConfirmDialog, setShowBackConfirmDialog] = useState(false);

  // Determine current step based on checkout state
  const currentStep = showCheckout ? 2 : 1;

  // Enable back navigation guard for checkout flow
  const { allowLeave, stay } = useMobileBackNavigation({
    currentStep,
    onStepChange: (step) => {
      if (step === 1) {
        setShowCheckout(false);
        sessionStorage.removeItem('wasInCheckout');
      }
    },
    totalSteps: 2,
    journeyId: 'cart-checkout',
    isGuarded: showCheckout, // Only guard when in checkout
    onShowConfirmDialog: () => setShowBackConfirmDialog(true)
  });

  // Clear checkout flag when component unmounts
  React.useEffect(() => {
    return () => {
      sessionStorage.removeItem('wasInCheckout');
    };
  }, []);

  const handleAddMore = () => {
    navigate('/?step=1');
  };

  const handleProceedToCheckout = (cartItems: CartItem[]) => {
    sessionStorage.setItem('wasInCheckout', 'true');
    setShowCheckout(true);
  };

  const handleBackToCart = () => {
    sessionStorage.removeItem('wasInCheckout');
    // Clear return from payment URL param if present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('returnFromPayment')) {
      urlParams.delete('returnFromPayment');
      window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    }
    setShowCheckout(false);
  };

  const handleAddAnother = () => {
    setShowCheckout(false);
    navigate('/?step=1');
  };

  if (showCheckout) {
    return (
      <>
        <SEOHead 
          title="Warranty Checkout | Complete Your Purchase"
          description="Complete your car warranty purchase. Review your selections and proceed with secure payment for comprehensive vehicle coverage."
          keywords="warranty checkout, car warranty purchase, secure payment, vehicle coverage"
        />
        <MultiWarrantyCheckout 
          items={items}
          onBack={handleBackToCart}
          onAddAnother={handleAddAnother}
        />
        <BackNavigationConfirmDialog
          open={showBackConfirmDialog}
          onStay={() => {
            setShowBackConfirmDialog(false);
            stay();
          }}
          onLeave={() => {
            setShowBackConfirmDialog(false);
            allowLeave();
          }}
          journeyName="checkout"
        />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Warranty Cart | Review Your Selections"
        description="Review your car warranty selections before checkout. Compare plans and ensure you have the right coverage for all your vehicles."
        keywords="warranty cart, review selections, car warranty comparison, multiple warranties"
      />
      <WarrantyCart 
        onAddMore={handleAddMore}
        onProceedToCheckout={handleProceedToCheckout}
      />
      <BackNavigationConfirmDialog
        open={showBackConfirmDialog}
        onStay={() => {
          setShowBackConfirmDialog(false);
          stay();
        }}
        onLeave={() => {
          setShowBackConfirmDialog(false);
          allowLeave();
        }}
        journeyName="cart"
      />
    </>
  );
};

export default Cart;
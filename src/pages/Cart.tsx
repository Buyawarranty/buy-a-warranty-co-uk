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
  const { items, addToCart, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(() => {
    // Check if returning from payment - restore checkout view
    const wasInCheckout = sessionStorage.getItem('wasInCheckout') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const returnFromPayment = urlParams.get('returnFromPayment') === 'true';
    const returnFromAbandoned = urlParams.get('returnFromAbandoned') === 'true';
    
    // If user is returning from payment gateway or was in checkout, show checkout view
    if ((returnFromPayment || returnFromAbandoned) && !wasInCheckout) {
      sessionStorage.setItem('wasInCheckout', 'true');
      console.log('✅ Detected return from payment/abandoned email - showing checkout');
      return true;
    }
    
    return wasInCheckout;
  });
  const [showBackConfirmDialog, setShowBackConfirmDialog] = useState(false);

  // Handle cart restoration from abandoned cart email
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restoreData = urlParams.get('restore');
    const returnFromAbandoned = urlParams.get('returnFromAbandoned');
    const discountCode = urlParams.get('discount');
    
    if (restoreData && returnFromAbandoned === 'true') {
      try {
        const cartData = JSON.parse(atob(restoreData));
        console.log('🔄 Restoring cart from abandoned email:', cartData);
        
        // Clear existing cart
        clearCart();
        
        // Restore the cart item
        const restoredItem = {
          vehicleData: {
            regNumber: cartData.vehicle_reg || '',
            make: cartData.vehicle_make || '',
            model: cartData.vehicle_model || '',
            year: cartData.vehicle_year || '',
            mileage: cartData.mileage || 0,
            vehicleType: 'car'
          },
          planId: cartData.plan_id || '',
          planName: cartData.plan_name || '',
          paymentType: cartData.payment_type || 'monthly',
          pricingData: {
            totalPrice: cartData.total_price || 0,
            monthlyPrice: cartData.total_price || 0,
            voluntaryExcess: cartData.voluntary_excess || 100,
            claimLimit: cartData.claim_limit || 1250,
            selectedAddOns: cartData.protection_addons || {}
          }
        };
        
        addToCart(restoredItem);
        
        // Restore customer data to localStorage
        if (cartData.full_name || cartData.email || cartData.phone) {
          const nameParts = (cartData.full_name || '').split(' ');
          const customerData = {
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            email: cartData.email || '',
            mobile: cartData.phone || '',
            flat_number: cartData.address?.flat_number || '',
            building_name: cartData.address?.building_name || '',
            building_number: cartData.address?.building_number || '',
            street: cartData.address?.street || '',
            town: cartData.address?.town || '',
            county: cartData.address?.county || '',
            postcode: cartData.address?.postcode || '',
            country: cartData.address?.country || 'United Kingdom',
            discount_code: discountCode || ''
          };
          localStorage.setItem('multiWarrantyCheckoutData', JSON.stringify(customerData));
          
          // Auto-apply discount if provided
          if (discountCode) {
            console.log('🎁 Auto-applying discount code:', discountCode);
          }
        }
        
        // Show checkout immediately
        setShowCheckout(true);
        sessionStorage.setItem('wasInCheckout', 'true');
        
        // Clean up URL
        urlParams.delete('restore');
        urlParams.delete('returnFromAbandoned');
        window.history.replaceState({}, '', `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
        
        console.log('✅ Cart restored successfully');
      } catch (error) {
        console.error('❌ Failed to restore cart:', error);
      }
    }
  }, [addToCart, clearCart]);

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
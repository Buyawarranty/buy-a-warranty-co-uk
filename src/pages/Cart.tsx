import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WarrantyCart from '@/components/WarrantyCart';
import MultiWarrantyCheckout from '@/components/MultiWarrantyCheckout';
import { useCart, CartItem } from '@/contexts/CartContext';
import { SEOHead } from '@/components/SEOHead';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleAddMore = () => {
    navigate('/?step=1');
  };

  const handleProceedToCheckout = (cartItems: CartItem[]) => {
    setShowCheckout(true);
  };

  const handleBackToCart = () => {
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
    </>
  );
};

export default Cart;
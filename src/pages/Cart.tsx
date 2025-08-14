import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WarrantyCart from '@/components/WarrantyCart';
import MultiWarrantyCheckout from '@/components/MultiWarrantyCheckout';
import { useCart, CartItem } from '@/contexts/CartContext';

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

  if (showCheckout) {
    return (
      <MultiWarrantyCheckout 
        items={items}
        onBack={handleBackToCart}
      />
    );
  }

  return (
    <WarrantyCart 
      onAddMore={handleAddMore}
      onProceedToCheckout={handleProceedToCheckout}
    />
  );
};

export default Cart;
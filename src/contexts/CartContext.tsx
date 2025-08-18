import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  vehicleData: {
    regNumber: string;
    mileage: string;
    make?: string;
    model?: string;
    year?: string;
    vehicleType?: string;
  };
  planId: string;
  planName: string;
  paymentType: string;
  pricingData: {
    totalPrice: number;
    monthlyPrice: number;
    voluntaryExcess: number;
    selectedAddOns: {[addon: string]: boolean};
  };
  addedAt: Date;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  hasRegistration: (regNumber: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('warrantyCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('warrantyCart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'id' | 'addedAt'>) => {
    // Check if registration plate already exists in cart
    const existingReg = items.find(cartItem => 
      cartItem.vehicleData.regNumber.replace(/\s/g, '').toLowerCase() === 
      item.vehicleData.regNumber.replace(/\s/g, '').toLowerCase()
    );
    
    if (existingReg) {
      throw new Error(`A warranty for registration ${item.vehicleData.regNumber} is already in your cart. We can only provide one warranty per vehicle.`);
    }
    
    // Apply 10% discount to second warranty and beyond
    const isSecondOrLaterWarranty = items.length >= 1;
    let adjustedItem = { ...item };
    
    if (isSecondOrLaterWarranty) {
      // Apply 10% discount to the pricing
      const discountMultiplier = 0.9; // 10% off
      adjustedItem.pricingData = {
        ...item.pricingData,
        totalPrice: item.pricingData.totalPrice * discountMultiplier,
        monthlyPrice: item.pricingData.monthlyPrice * discountMultiplier
      };
    }
    
    const newItem: CartItem = {
      ...adjustedItem,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      addedAt: new Date()
    };
    
    setItems(prev => [...prev, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('warrantyCart');
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.pricingData.totalPrice, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  const hasRegistration = (regNumber: string) => {
    return items.some(item => 
      item.vehicleData.regNumber.replace(/\s/g, '').toLowerCase() === 
      regNumber.replace(/\s/g, '').toLowerCase()
    );
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      getTotalPrice,
      getItemCount,
      hasRegistration
    }}>
      {children}
    </CartContext.Provider>
  );
};
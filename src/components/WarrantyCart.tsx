import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface WarrantyCartProps {
  onAddMore: () => void;
  onProceedToCheckout: (items: any[]) => void;
}

const WarrantyCart: React.FC<WarrantyCartProps> = ({ onAddMore, onProceedToCheckout }) => {
  const { items, removeFromCart, getTotalPrice, getItemCount, clearCart } = useCart();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    onProceedToCheckout(items);
  };

  const formatVehicleDisplay = (item: any) => {
    const { vehicleData } = item;
    if (vehicleData.make && vehicleData.model) {
      return `${vehicleData.year || ''} ${vehicleData.make} ${vehicleData.model}`.trim();
    }
    return vehicleData.regNumber;
  };

  const formatPaymentType = (paymentType: string) => {
    switch (paymentType) {
      case '12months': return '12 months';
      case '24months': return '24 months';
      case '36months': return '36 months';
      default: return paymentType;
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Start by adding a warranty for your first vehicle
            </p>
            <Button onClick={onAddMore} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Warranty
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Warranty Cart ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-gray-600">
            Review your warranties and proceed to checkout when ready
          </p>
          {getItemCount() >= 2 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    🎉 Multi-Warranty Discount Applied!
                  </h3>
                  <div className="mt-1 text-sm text-green-700">
                    <p>You're saving 10% by purchasing multiple warranties together. Smart choice!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-900">
                        {formatVehicleDisplay(item)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Registration: {item.vehicleData.regNumber}
                      </p>
                      {item.vehicleData.mileage && (
                        <p className="text-sm text-gray-600">
                          Mileage: {item.vehicleData.mileage}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Plan:</span>
                      <Badge variant="outline">{item.planName}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Coverage Period:</span>
                      <span className="text-sm text-gray-600">{formatPaymentType(item.paymentType)}</span>
                    </div>
                    
                    {item.pricingData.voluntaryExcess > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Voluntary Excess:</span>
                        <span className="text-sm text-gray-600">£{item.pricingData.voluntaryExcess}</span>
                      </div>
                    )}
                    
                    {Object.keys(item.pricingData.selectedAddOns).filter(addon => item.pricingData.selectedAddOns[addon]).length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-900">Add-ons:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.keys(item.pricingData.selectedAddOns)
                            .filter(addon => item.pricingData.selectedAddOns[addon])
                            .map(addon => (
                              <Badge key={addon} variant="secondary" className="text-xs">
                                {addon}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                        <span className="text-lg font-bold text-blue-600">
                          £{item.pricingData.totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Another Warranty Button */}
            <Card className="border-2 border-dashed border-green-300 hover:border-green-400 transition-colors bg-green-50">
              <CardContent className="p-6">
                <Button
                  variant="ghost"
                  onClick={onAddMore}
                  className="w-full h-28 text-green-700 hover:text-green-800 hover:bg-green-100"
                >
                  <div className="text-center">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <span className="font-medium text-lg">Add Another Warranty</span>
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold mt-2 mx-auto inline-block">
                      Save 10% on Multiple Warranties!
                    </div>
                    <p className="text-sm text-green-600 mt-1 font-medium">
                      Protect more vehicles and save money
                    </p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Warranty {index + 1} ({item.planName})
                      </span>
                      <span className="font-medium">£{item.pricingData.totalPrice}</span>
                    </div>
                  ))}
                </div>
                
                {getItemCount() >= 2 && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 my-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700 font-medium">Multi-Warranty Discount (10%)</span>
                      <span className="text-green-700 font-medium">-£{Math.round(getTotalPrice() * 0.1)}</span>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  {getItemCount() >= 2 ? (
                    <>
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span>Subtotal:</span>
                        <span>£{getTotalPrice()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-green-600 mb-2">
                        <span>Multi-Warranty Discount (10%):</span>
                        <span>-£{Math.round(getTotalPrice() * 0.1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          £{Math.round(getTotalPrice() * 0.9)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        £{getTotalPrice()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 text-center pt-2">
                  <p>Secure checkout powered by Stripe</p>
                  <p>Multiple payment options available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyCart;
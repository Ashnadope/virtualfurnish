'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


import { cartService } from '@/services/cart.service';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';
import Icon from '@/components/ui/AppIcon';

export default function CartInteractive({ initialItems = [] }) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(initialItems);
  const [error, setError] = useState(null);
  const [guardNotice, setGuardNotice] = useState(null);
  const [updating, setUpdating] = useState(false);

  const runOutOfStockGuard = async (itemsToCheck) => {
    const { movedCount, movedItemNames, error: guardError } = await cartService.moveOutOfStockItemsToWishlist(itemsToCheck);

    if (guardError) {
      setError(guardError);
      return false;
    }

    if (movedCount > 0) {
      const namesPreview = (movedItemNames || []).slice(0, 3).join(', ');
      const suffix = movedCount > 3 ? ` and ${movedCount - 3} more` : '';
      setGuardNotice(
        movedCount === 1
          ? `${namesPreview || 'An item'} went out of stock and was moved to your wishlist.`
          : `${namesPreview || 'Some items'}${suffix} went out of stock and were moved to your wishlist.`
      );
      return true;
    }

    return false;
  };

  // No useEffect initial load — items come from the server via initialItems prop
  // Called after mutations to refresh the list without a full-page spinner
  const loadCartItems = async ({ runGuard = true } = {}) => {
    setError(null);

    const { data, error: fetchError } = await cartService?.getCartItems();

    if (fetchError) {
      setError(fetchError);
    } else {
      const nextItems = data || [];
      setCartItems(nextItems);

      if (runGuard) {
        const moved = await runOutOfStockGuard(nextItems);
        if (moved) {
          await loadCartItems({ runGuard: false });
        }
      }
    }
  };

  useEffect(() => {
    loadCartItems({ runGuard: true });
  }, []);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    setUpdating(true);

    const { error: updateError } = await cartService?.updateQuantity(cartItemId, newQuantity);

    if (updateError) {
      setError(updateError);
    } else {
      await loadCartItems();
    }

    setUpdating(false);
  };

  const handleRemoveItem = async (cartItemId) => {
    setUpdating(true);
    
    const { error: removeError } = await cartService?.removeFromCart(cartItemId);
    
    if (removeError) {
      setError(removeError);
    } else {
      await loadCartItems();
    }
    
    setUpdating(false);
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }
    
    setUpdating(true);
    
    const { error: clearError } = await cartService?.clearCart();
    
    if (clearError) {
      setError(clearError);
    } else {
      await loadCartItems();
    }
    
    setUpdating(false);
  };

  const calculateSubtotal = () => {
    return cartItems?.reduce((sum, item) => {
      const itemPrice = parseFloat(item?.price || 0);
      const itemQuantity = parseInt(item?.quantity || 0);
      return sum + (itemPrice * itemQuantity);
    }, 0);
  };

  const calculateTotalItems = () => {
    return cartItems?.reduce((sum, item) => {
      const itemQuantity = parseInt(item?.quantity || 0);
      return sum + itemQuantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 0 ? 500 : 0; // ₱500 flat shipping
    return subtotal + shipping;
  };

  const handleCheckout = () => {
    if (cartItems?.length === 0) return;
    router?.push('/checkout');
  };

  if (error && cartItems.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Icon name="ExclamationTriangleIcon" size={24} variant="solid" className="text-red-600" />
          <div>
            <h3 className="font-heading font-semibold text-red-900">Error Loading Cart</h3>
            <p className="font-body text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => loadCartItems()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-fast"
        >
          Retry
        </button>
      </div>
    );
  }

  if (cartItems?.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="font-body text-muted-foreground mt-1">
            {calculateTotalItems()} {calculateTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        {cartItems?.length > 0 && (
          <button
            onClick={handleClearCart}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-fast disabled:opacity-50"
          >
            <Icon name="TrashIcon" size={20} variant="outline" />
            <span className="font-body text-sm">Clear Cart</span>
          </button>
        )}
      </div>

      {/* Inline error banner for mutation failures */}
      {error && cartItems.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <Icon name="ExclamationTriangleIcon" size={16} variant="solid" className="text-red-500 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <Icon name="XMarkIcon" size={15} />
          </button>
        </div>
      )}

      {guardNotice && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <Icon name="InformationCircleIcon" size={16} variant="solid" className="text-amber-600 flex-shrink-0" />
          {guardNotice}
          <button onClick={() => setGuardNotice(null)} className="ml-auto text-amber-500 hover:text-amber-700">
            <Icon name="XMarkIcon" size={15} />
          </button>
        </div>
      )}

      {/* Cart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems?.map((item) => (
            <CartItem
              key={item?.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              disabled={updating}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={calculateSubtotal()}
            shipping={cartItems?.length > 0 ? 500 : 0}
            total={calculateTotal()}
            itemCount={calculateTotalItems()}
            onCheckout={handleCheckout}
            disabled={updating || cartItems?.length === 0}
          />
        </div>
      </div>
    </div>
  );
}

CartInteractive.propTypes = {};
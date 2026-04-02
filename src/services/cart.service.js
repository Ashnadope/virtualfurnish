import { createClient } from '@/lib/supabase/client';

/**
 * Cart Service - Handles all cart-related operations
 */
export const cartService = {
  /**
   * Resolve current available stock for a variant or fallback product row.
   */
  async getAvailableStock({ variantId, productId }) {
    const supabase = createClient();

    if (variantId) {
      const { data, error } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', variantId)
        .single();
      if (error) return { stock: 0, error: error.message };
      return { stock: parseInt(data?.stock_quantity || 0, 10), error: null };
    }

    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (error) return { stock: 0, error: error.message };
    return { stock: parseInt(data?.stock_quantity || 0, 10), error: null };
  },

  /**
   * Get all cart items for the current user with product details
   */
  async getCartItems() {
    try {
      const supabase = createClient();
      
      const { data: { user }, error: authError } = await supabase?.auth?.getUser();
      
      if (authError || !user) {
        // Return empty cart for unauthenticated users instead of throwing error
        return { data: [], error: null, isAuthenticated: false };
      }

      const { data, error } = await supabase?.from('cart_items')?.select(`
          id,
          quantity,
          price,
          created_at,
          product_id,
          variant_id,
          products (
            id,
            name,
            description,
            image_url,
            brand,
            category,
            base_price
          ),
          product_variants (
            id,
            name,
            color,
            price,
            stock_quantity,
            sku,
            image_url
          )
        `)?.eq('user_id', user?.id)?.order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null, isAuthenticated: true };
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return { data: null, error: error?.message, isAuthenticated: false };
    }
  },

  /**
   * Get cart item count for badge display
   */
  async getCartCount() {
    try {
      const supabase = createClient();
      
      const { data: { user }, error: authError } = await supabase?.auth?.getUser();
      
      if (authError || !user) {
        return { count: 0, error: null, isAuthenticated: false };
      }

      const { count, error } = await supabase?.from('cart_items')?.select('*', { count: 'exact', head: true })?.eq('user_id', user?.id);

      if (error) throw error;

      return { count: count || 0, error: null, isAuthenticated: true };
    } catch (error) {
      console.error('Error getting cart count:', error);
      return { count: 0, error: error?.message, isAuthenticated: false };
    }
  },

  /**
   * Add item to cart or update quantity if exists
   */
  async addToCart({ productId, variantId, quantity = 1, price }) {
    try {
      const supabase = createClient();
      const quantityToAdd = Math.max(1, parseInt(quantity || 1, 10));
      
      const { data: { user }, error: authError } = await supabase?.auth?.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { stock, error: stockError } = await this.getAvailableStock({ variantId, productId });
      if (stockError) {
        throw new Error('Unable to verify stock. Please try again.');
      }
      if (stock <= 0) {
        return { data: null, error: 'This item is out of stock.' };
      }

      // Check if item already exists in cart
      const { data: existingRows, error: existingError } = await supabase
        .from('cart_items')
        .select('id, quantity, created_at')
        .eq('user_id', user?.id)
        .eq('product_id', productId)
        .eq('variant_id', variantId)
        .order('created_at', { ascending: true });

      if (existingError) throw existingError;

      const existingTotalQty = (existingRows || []).reduce(
        (sum, row) => sum + (parseInt(row?.quantity || 0, 10) || 0),
        0
      );
      const nextQty = existingTotalQty + quantityToAdd;

      if (nextQty > stock) {
        const remaining = Math.max(0, stock - existingTotalQty);
        return {
          data: null,
          error: remaining > 0
            ? `Only ${remaining} more unit${remaining === 1 ? '' : 's'} available for this item.`
            : `Maximum available quantity (${stock}) is already in your cart.`
        };
      }

      if (existingRows && existingRows.length > 0) {
        const primaryRow = existingRows[0];

        // Best-effort cleanup for legacy duplicate rows before update so
        // DB stock guards do not double-count duplicates during validation.
        if (existingRows.length > 1) {
          const duplicateIds = existingRows.slice(1).map((row) => row.id).filter(Boolean);
          if (duplicateIds.length > 0) {
            await supabase.from('cart_items').delete().in('id', duplicateIds);
          }
        }

        // Update quantity if item exists
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: nextQty })
          .eq('id', primaryRow?.id)
          .select()
          .single();

        if (error) throw error;

        return { data, error: null };
      } else {
        // Insert new item
        const { data, error } = await supabase?.from('cart_items')?.insert({
            user_id: user?.id,
            product_id: productId,
            variant_id: variantId,
            quantity: quantityToAdd,
            price
          })?.select()?.single();

        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { data: null, error: error?.message };
    }
  },

  /**
   * Update cart item quantity
   */
  async updateQuantity(cartItemId, quantity) {
    try {
      const supabase = createClient();
      const normalizedQty = parseInt(quantity || 0, 10);

      if (normalizedQty <= 0) {
        return await this.removeFromCart(cartItemId);
      }

      const { data: cartItem, error: cartItemError } = await supabase
        .from('cart_items')
        .select('id, variant_id, product_id')
        .eq('id', cartItemId)
        .single();

      if (cartItemError || !cartItem) {
        throw new Error('Cart item not found');
      }

      const { stock, error: stockError } = await this.getAvailableStock({
        variantId: cartItem.variant_id,
        productId: cartItem.product_id,
      });

      if (stockError) {
        throw new Error('Unable to verify stock. Please try again.');
      }

      if (normalizedQty > stock) {
        return {
          data: null,
          error: `Only ${stock} unit${stock === 1 ? '' : 's'} available for this item.`
        };
      }

      const { data, error } = await supabase?.from('cart_items')?.update({ quantity: normalizedQty })?.eq('id', cartItemId)?.select()?.single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { data: null, error: error?.message };
    }
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId) {
    try {
      const supabase = createClient();

      const { error } = await supabase?.from('cart_items')?.delete()?.eq('id', cartItemId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { error: error?.message };
    }
  },

  /**
   * Clear entire cart for current user
   */
  async clearCart() {
    try {
      const supabase = createClient();
      
      const { data: { user }, error: authError } = await supabase?.auth?.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase?.from('cart_items')?.delete()?.eq('user_id', user?.id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { error: error?.message };
    }
  },

  /**
   * Move out-of-stock cart items to wishlist, then remove them from cart.
   * Used as a self-heal pass when viewing /cart after stock changes.
   */
  async moveOutOfStockItemsToWishlist(sourceItems = null) {
    try {
      const supabase = createClient();

      const { data: { user }, error: authError } = await supabase?.auth?.getUser();
      if (authError || !user) {
        return { movedCount: 0, movedItemNames: [], error: null };
      }

      let items = Array.isArray(sourceItems) ? sourceItems : null;
      if (!items) {
        const { data, error } = await supabase?.from('cart_items')?.select(`
          id,
          user_id,
          product_id,
          variant_id,
          quantity,
          products (
            id,
            name,
            stock_quantity
          ),
          product_variants (
            id,
            stock_quantity
          )
        `)?.eq('user_id', user?.id);
        if (error) throw error;
        items = data || [];
      }

      const outOfStockItems = (items || []).filter((item) => {
        const available = item?.variant_id
          ? (parseInt(item?.product_variants?.stock_quantity ?? 0, 10) || 0)
          : (parseInt(item?.products?.stock_quantity ?? 0, 10) || 0);
        return available <= 0;
      });

      if (outOfStockItems.length === 0) {
        return { movedCount: 0, movedItemNames: [], error: null };
      }

      const movedItemNames = [];

      for (const item of outOfStockItems) {
        const wishlistPayload = {
          user_id: user?.id,
          product_id: item?.product_id,
          variant_id: item?.variant_id || null,
        };

        const { error: wishlistError } = await supabase
          .from('wishlist_items')
          .insert(wishlistPayload);

        // Ignore duplicate constraint violations; item is effectively in wishlist.
        if (wishlistError && wishlistError?.code !== '23505') {
          throw wishlistError;
        }

        const { error: cartDeleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', item?.id)
          .eq('user_id', user?.id);

        if (cartDeleteError) throw cartDeleteError;

        movedItemNames.push(item?.products?.name || 'Item');
      }

      return {
        movedCount: movedItemNames.length,
        movedItemNames,
        error: null,
      };
    } catch (error) {
      console.error('Error moving out-of-stock cart items to wishlist:', error);
      return { movedCount: 0, movedItemNames: [], error: error?.message };
    }
  }
};
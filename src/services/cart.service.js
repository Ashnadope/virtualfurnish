import { createClient } from '@/lib/supabase/client';

/**
 * Cart Service - Handles all cart-related operations
 */
export const cartService = {
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
      
      const { data: { user }, error: authError } = await supabase?.auth?.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Check if item already exists in cart
      const { data: existing } = await supabase?.from('cart_items')?.select('id, quantity')?.eq('user_id', user?.id)?.eq('product_id', productId)?.eq('variant_id', variantId)?.single();

      if (existing) {
        // Update quantity if item exists
        const { data, error } = await supabase?.from('cart_items')?.update({ quantity: existing?.quantity + quantity })?.eq('id', existing?.id)?.select()?.single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Insert new item
        const { data, error } = await supabase?.from('cart_items')?.insert({
            user_id: user?.id,
            product_id: productId,
            variant_id: variantId,
            quantity,
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

      if (quantity <= 0) {
        return await this.removeFromCart(cartItemId);
      }

      const { data, error } = await supabase?.from('cart_items')?.update({ quantity })?.eq('id', cartItemId)?.select()?.single();

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
  }
};
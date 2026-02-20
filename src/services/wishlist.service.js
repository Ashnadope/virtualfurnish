import { createClient } from '@/lib/supabase/client';

/**
 * Wishlist Service - Handles all wishlist-related operations
 */
export const wishlistService = {
  /**
   * Get all wishlist items for the current user with product details
   */
  async getWishlistItems(userId) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('wishlist_items')?.select(`
          id,
          created_at,
          variant_id,
          product:products (
            id,
            name,
            base_price,
            image_url,
            category,
            brand,
            is_active,
            sku
          ),
          variant:product_variants (
            id,
            color,
            image_url,
            price,
            stock_quantity,
            is_active
          )
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to camelCase for frontend
      return data?.map(item => ({
        id: item?.id,
        createdAt: item?.created_at,
        variantId: item?.variant_id,
        product: {
          id: item?.product?.id,
          name: item?.product?.name,
          basePrice: item?.product?.base_price,
          imageUrl: item?.product?.image_url,
          category: item?.product?.category,
          brand: item?.product?.brand,
          isActive: item?.product?.is_active,
          sku: item?.product?.sku
        },
        variant: item?.variant ? {
          id: item?.variant?.id,
          color: item?.variant?.color,
          imageUrl: item?.variant?.image_url,
          price: item?.variant?.price,
          stockQuantity: item?.variant?.stock_quantity,
          isActive: item?.variant?.is_active
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      throw error;
    }
  },

  /**
   * Add a product variant to wishlist
   */
  async addToWishlist(userId, productId, variantId = null) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('wishlist_items')?.insert({
          user_id: userId,
          product_id: productId,
          variant_id: variantId || null
        })?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        userId: data?.user_id,
        productId: data?.product_id,
        variantId: data?.variant_id,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  /**
   * Remove a product from wishlist
   */
  async removeFromWishlist(wishlistItemId, userId) {
    try {
      const supabase = createClient();
      
      const { error } = await supabase?.from('wishlist_items')?.delete()?.eq('id', wishlistItemId)?.eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  /**
   * Check if a product/variant is in the user's wishlist
   */
  async isInWishlist(userId, productId, variantId = null) {
    try {
      const supabase = createClient();
      
      let query = supabase?.from('wishlist_items')?.select('id')?.eq('user_id', userId)?.eq('product_id', productId);
      if (variantId) {
        query = query.eq('variant_id', variantId);
      }
      const { data, error } = await query?.single();

      if (error && error?.code !== 'PGRST116') throw error;

      return !!data;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  },

  /**
   * Get wishlist count for a user
   */
  async getWishlistCount(userId) {
    try {
      const supabase = createClient();
      
      const { count, error } = await supabase?.from('wishlist_items')?.select('*', { count: 'exact', head: true })?.eq('user_id', userId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }
};
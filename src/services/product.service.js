import { createClient } from '@/lib/supabase/client';

export const productService = {
  /**
   * Get all active products with their variants
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getAllProducts() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('products')?.select(`
          *,
          product_variants (*)
        `)?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (error) throw error;

      // Convert snake_case to camelCase for Next.js
      const formattedData = data?.map(product => ({
        id: product?.id,
        name: product?.name,
        brand: product?.brand,
        category: product?.category,
        description: product?.description,
        imageUrl: product?.image_url,
        basePrice: product?.base_price,
        sku: product?.sku,
        isActive: product?.is_active,
        createdAt: product?.created_at,
        updatedAt: product?.updated_at,
        variants: product?.product_variants?.map(variant => ({
          id: variant?.id,
          name: variant?.name,
          sku: variant?.sku,
          size: variant?.size,
          color: variant?.color,
          material: variant?.material,
          price: variant?.price,
          stockQuantity: variant?.stock_quantity,
          productId: variant?.product_id,
          createdAt: variant?.created_at
        })) || []
      })) || [];

      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: null, error: error?.message };
    }
  },

  /**
   * Get products by category
   * @param {string} category - Category to filter by
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getProductsByCategory(category) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('products')?.select(`
          *,
          product_variants (*)
        `)?.eq('is_active', true)?.eq('category', category)?.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(product => ({
        id: product?.id,
        name: product?.name,
        brand: product?.brand,
        category: product?.category,
        description: product?.description,
        imageUrl: product?.image_url,
        basePrice: product?.base_price,
        sku: product?.sku,
        isActive: product?.is_active,
        createdAt: product?.created_at,
        updatedAt: product?.updated_at,
        variants: product?.product_variants?.map(variant => ({
          id: variant?.id,
          name: variant?.name,
          sku: variant?.sku,
          size: variant?.size,
          color: variant?.color,
          material: variant?.material,
          price: variant?.price,
          stockQuantity: variant?.stock_quantity,
          productId: variant?.product_id,
          createdAt: variant?.created_at
        })) || []
      })) || [];

      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { data: null, error: error?.message };
    }
  },

  /**
   * Search products by name or description
   * @param {string} searchTerm - Search term
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchProducts(searchTerm) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('products')?.select(`
          *,
          product_variants (*)
        `)?.eq('is_active', true)?.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)?.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(product => ({
        id: product?.id,
        name: product?.name,
        brand: product?.brand,
        category: product?.category,
        description: product?.description,
        imageUrl: product?.image_url,
        basePrice: product?.base_price,
        sku: product?.sku,
        isActive: product?.is_active,
        createdAt: product?.created_at,
        updatedAt: product?.updated_at,
        variants: product?.product_variants?.map(variant => ({
          id: variant?.id,
          name: variant?.name,
          sku: variant?.sku,
          size: variant?.size,
          color: variant?.color,
          material: variant?.material,
          price: variant?.price,
          stockQuantity: variant?.stock_quantity,
          productId: variant?.product_id,
          createdAt: variant?.created_at
        })) || []
      })) || [];

      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Error searching products:', error);
      return { data: null, error: error?.message };
    }
  },

  /**
   * Get product by ID with variants
   * @param {string} productId - Product ID
   * @returns {Promise<{data: Object, error: any}>}
   */
  async getProductById(productId) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('products')?.select(`
          *,
          product_variants (*)
        `)?.eq('id', productId)?.eq('is_active', true)?.single();

      if (error) throw error;

      const formattedData = {
        id: data?.id,
        name: data?.name,
        brand: data?.brand,
        category: data?.category,
        description: data?.description,
        imageUrl: data?.image_url,
        basePrice: data?.base_price,
        sku: data?.sku,
        isActive: data?.is_active,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        variants: data?.product_variants?.map(variant => ({
          id: variant?.id,
          name: variant?.name,
          sku: variant?.sku,
          size: variant?.size,
          color: variant?.color,
          material: variant?.material,
          price: variant?.price,
          stockQuantity: variant?.stock_quantity,
          productId: variant?.product_id,
          createdAt: variant?.created_at
        })) || []
      };

      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return { data: null, error: error?.message };
    }
  },

  /**
   * Get all unique categories
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getCategories() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('products')?.select('category')?.eq('is_active', true)?.not('category', 'is', null);

      if (error) throw error;

      // Get unique categories
      const categories = [...new Set(data?.map(item => item?.category)?.filter(Boolean))] || [];

      return { data: categories, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error: error?.message };
    }
  }
};
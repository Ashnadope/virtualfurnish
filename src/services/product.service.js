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
        `)?.order('created_at', { ascending: false });

      if (error) throw error;

      // Convert snake_case to camelCase for Next.js
      const formattedData = data?.map(product => ({
        id: product?.id,
        name: product?.name,
        brand: product?.brand,
        category: product?.category,
        description: product?.description,
        imageUrl: product?.image_url,
        imageAlt: product?.image_alt,
        basePrice: product?.base_price,
        sku: product?.sku,
        dimensions: product?.dimensions,
        material: product?.material,
        weight: product?.weight,
        color: product?.color,
        stockQuantity: product?.stock_quantity,
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
      return { data: [], error: error?.message };
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
        `)?.eq('category', category)?.order('created_at', { ascending: false });

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
      
      const { data, error } = await supabase?.from('products')?.select('category')?.not('category', 'is', null);

      if (error) throw error;

      // Get unique categories
      const categories = [...new Set(data?.map(item => item?.category)?.filter(Boolean))] || [];

      return { data: categories, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: [], error: null };
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data with name, description, brand, category, basePrice, sku, imageUrl
   * @returns {Promise<{data: Object, error: any}>}
   */
  async createProduct(productData) {
    try {
      const supabase = createClient();
      
      console.log('Creating product with data:', productData);
      
      // SKU will be auto-generated by database trigger
      const { data, error } = await supabase?.from('products')?.insert([
        {
          name: productData?.name,
          description: productData?.description,
          brand: productData?.brand || null,
          category: productData?.category,
          base_price: productData?.price || productData?.basePrice,
          image_url: productData?.image || productData?.imageUrl,
          image_alt: productData?.imageAlt,
          dimensions: productData?.dimensions,
          material: productData?.material,
          weight: productData?.weight,
          color: productData?.color,
          stock_quantity: productData?.stock || 0,
          is_active: productData?.status === 'active' || productData?.isActive !== false
        }
      ])?.select()?.single();

      if (error) {
        console.error('Supabase error creating product:', error);
        throw error;
      }

      console.log('Product created successfully:', data);

      // Format response to match UI expectations
      return { 
        data: {
          id: data?.id,
          name: data?.name,
          brand: data?.brand,
          category: data?.category,
          description: data?.description,
          image: data?.image_url,
          imageAlt: data?.image_alt,
          price: data?.base_price,
          sku: data?.sku, // SKU was auto-generated
          dimensions: data?.dimensions,
          material: data?.material,
          weight: data?.weight,
          color: data?.color,
          stock: data?.stock_quantity,
          status: data?.is_active ? 'active' : 'inactive',
          variants: []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error: error?.message };
    }
  },

  /**
   * Update an existing product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<{data: Object, error: any}>}
   */
  async updateProduct(productId, productData) {
    try {
      const supabase = createClient();
      
      console.log('Updating product:', productId, 'with data:', productData);
      
      // SKU should not be updated (it's auto-generated and unique)
      const { data, error } = await supabase?.from('products')?.update({
        name: productData?.name,
        description: productData?.description,
        brand: productData?.brand || null,
        category: productData?.category,
        base_price: productData?.price || productData?.basePrice,
        image_url: productData?.image || productData?.imageUrl,
        image_alt: productData?.imageAlt,
        dimensions: productData?.dimensions,
        material: productData?.material,
        weight: productData?.weight,
        color: productData?.color,
        stock_quantity: productData?.stock,
        is_active: productData?.status === 'active' || productData?.isActive !== false
      })?.eq('id', productId)?.select()?.single();

      if (error) {
        console.error('Supabase error updating product:', error);
        throw error;
      }

      console.log('Product updated successfully:', data);

      // Format response to match UI expectations
      return { 
        data: {
          id: data?.id,
          name: data?.name,
          brand: data?.brand,
          category: data?.category,
          description: data?.description,
          image: data?.image_url,
          imageAlt: data?.image_alt,
          price: data?.base_price,
          sku: data?.sku, // Return existing SKU
          dimensions: data?.dimensions,
          material: data?.material,
          weight: data?.weight,
          color: data?.color,
          stock: data?.stock_quantity || 0,
          status: data?.is_active ? 'active' : 'inactive',
          variants: productData?.variants || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error: error?.message };
    }
  },

  /**
   * Delete a product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async deleteProduct(productId) {
    try {
      const supabase = createClient();
      
      console.log('Deleting product:', productId);
      
      const { error } = await supabase?.from('products')?.delete()?.eq('id', productId);

      if (error) {
        console.error('Supabase error deleting product:', error);
        throw error;
      }

      console.log('Product deleted successfully:', productId);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error?.message };
    }
  },

  /**
   * Delete multiple products by IDs
   * @param {Array<string>} productIds - Array of product IDs
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async deleteProducts(productIds) {
    try {
      const supabase = createClient();
      
      console.log('Deleting products:', productIds);
      
      const { error } = await supabase?.from('products')?.delete()?.in('id', productIds);

      if (error) {
        console.error('Supabase error deleting products:', error);
        throw error;
      }

      console.log('Products deleted successfully:', productIds);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting products:', error);
      return { success: false, error: error?.message };
    }
  }
};
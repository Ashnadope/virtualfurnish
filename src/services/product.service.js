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
        variants: product?.product_variants
          ?.filter(v => v?.is_active !== false)
          ?.map(variant => ({
            id: variant?.id,
            name: variant?.name,
            sku: variant?.sku,
            color: variant?.color,
            dimensions: variant?.dimensions,
            material: variant?.material,
            weight: variant?.weight,
            imageUrl: variant?.image_url,
            price: variant?.price,
            stockQuantity: variant?.stock_quantity,
            isActive: variant?.is_active,
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
        imageAlt: product?.image_alt,
        basePrice: product?.base_price,
        sku: product?.sku,
        isActive: product?.is_active,
        createdAt: product?.created_at,
        updatedAt: product?.updated_at,
        variants: product?.product_variants
          ?.filter(v => v?.is_active !== false)
          ?.map(variant => ({
            id: variant?.id,
            name: variant?.name,
            sku: variant?.sku,
            color: variant?.color,
            dimensions: variant?.dimensions,
            material: variant?.material,
            weight: variant?.weight,
            imageUrl: variant?.image_url,
            price: variant?.price,
            stockQuantity: variant?.stock_quantity,
            isActive: variant?.is_active,
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
        imageAlt: product?.image_alt,
        basePrice: product?.base_price,
        sku: product?.sku,
        isActive: product?.is_active,
        createdAt: product?.created_at,
        updatedAt: product?.updated_at,
        variants: product?.product_variants
          ?.filter(v => v?.is_active !== false)
          ?.map(variant => ({
            id: variant?.id,
            name: variant?.name,
            sku: variant?.sku,
            color: variant?.color,
            dimensions: variant?.dimensions,
            material: variant?.material,
            weight: variant?.weight,
            imageUrl: variant?.image_url,
            price: variant?.price,
            stockQuantity: variant?.stock_quantity,
            isActive: variant?.is_active,
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
        variants: data?.product_variants
          ?.filter(v => v?.is_active !== false)
          ?.map(variant => ({
            id: variant?.id,
            name: variant?.name,
            sku: variant?.sku,
            color: variant?.color,
            dimensions: variant?.dimensions,
            material: variant?.material,
            weight: variant?.weight,
            imageUrl: variant?.image_url,
            price: variant?.price,
            stockQuantity: variant?.stock_quantity,
            isActive: variant?.is_active,
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
      const variants = productData?.variants || [];
      const firstVariant = variants[0];
      const isActive = productData?.status === 'active';

      // Insert product row — base_price pulled from first variant to satisfy NOT NULL
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          brand: productData.brand || null,
          category: productData.category,
          base_price: parseFloat(firstVariant?.price ?? 0),
          image_alt: productData.imageAlt,
          is_active: isActive,
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Insert all variant rows
      const variantRows = variants.map(v => ({
        product_id: product.id,
        name: v.color || productData.name,
        color: v.color,
        price: parseFloat(v.price || 0),
        stock_quantity: parseInt(v.stock_quantity || 0),
        dimensions: v.dimensions || null,
        material: v.material || null,
        weight: v.weight ? String(v.weight) : null,
        image_url: v.image || null,
        // is_active omitted — defaults to TRUE via DB column default
      }));

      const { data: insertedVariants, error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantRows)
        .select();

      if (variantsError) throw variantsError;

      const mappedVariants = (insertedVariants || []).map(v => ({
        id: v.id,
        color: v.color,
        price: v.price,
        stockQuantity: v.stock_quantity,
        dimensions: v.dimensions,
        material: v.material,
        weight: v.weight,
        imageUrl: v.image_url,
        isActive: v.is_active,
        productId: v.product_id,
      }));

      const prices = mappedVariants.map(v => v.price).filter(Boolean).sort((a, b) => a - b);
      const totalStock = mappedVariants.reduce((s, v) => s + (v.stockQuantity || 0), 0);

      return {
        data: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          sku: product.sku,
          category: product.category,
          price: prices[0] ?? 0,
          stock: totalStock,
          status: product.is_active ? 'active' : 'inactive',
          description: product.description,
          imageAlt: product.image_alt,
          image: mappedVariants[0]?.imageUrl || null,
          variants: mappedVariants,
        },
        error: null,
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
      const submittedVariants = productData?.variants || [];
      const isActive = productData?.status === 'active';
      const firstVariant = submittedVariants[0];

      // 1. Update product row
      const { data: product, error: productError } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          brand: productData.brand || null,
          category: productData.category,
          base_price: parseFloat(firstVariant?.price ?? 0),
          image_alt: productData.imageAlt,
          is_active: isActive,
        })
        .eq('id', productId)
        .select()
        .single();

      if (productError) throw productError;

      // 2. Fetch existing variant IDs to detect deletions
      const { data: existingVariants, error: fetchError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId);

      if (fetchError) throw fetchError;

      const existingIds = (existingVariants || []).map(v => v.id);
      const submittedIds = submittedVariants.filter(v => v.id).map(v => v.id);
      const idsToDelete = existingIds.filter(id => !submittedIds.includes(id));

      // 3. Delete removed variants
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('product_variants')
          .delete()
          .in('id', idsToDelete);
        if (deleteError) throw deleteError;
      }

      // 4a. UPDATE existing variants (have an id)
      const toUpdate = submittedVariants.filter(v => v.id);
      // 4b. INSERT new variants (no id yet)
      const toInsert = submittedVariants.filter(v => !v.id);

      const buildRow = (v, includeId = false) => ({
        ...(includeId ? { id: v.id } : {}),
        product_id: productId,
        name: v.color || productData.name,
        color: v.color,
        price: parseFloat(v.price || 0),
        stock_quantity: parseInt(v.stock_quantity || 0),
        dimensions: v.dimensions || null,
        material: v.material || null,
        weight: v.weight ? String(v.weight) : null,
        image_url: v.image || null,
      });

      let upsertedVariants = [];

      if (toUpdate.length > 0) {
        const { data: updated, error: updateError } = await supabase
          .from('product_variants')
          .upsert(toUpdate.map(v => buildRow(v, true)), { onConflict: 'id' })
          .select();
        if (updateError) throw updateError;
        upsertedVariants = upsertedVariants.concat(updated || []);
      }

      if (toInsert.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('product_variants')
          .insert(toInsert.map(v => buildRow(v, false)))
          .select();
        if (insertError) throw insertError;
        upsertedVariants = upsertedVariants.concat(inserted || []);
      }

      const mappedVariants = (upsertedVariants || []).map(v => ({
        id: v.id,
        color: v.color,
        price: v.price,
        stockQuantity: v.stock_quantity,
        dimensions: v.dimensions,
        material: v.material,
        weight: v.weight,
        imageUrl: v.image_url,
        isActive: v.is_active,
        productId: v.product_id,
      }));

      const prices = mappedVariants.map(v => v.price).filter(Boolean).sort((a, b) => a - b);
      const totalStock = mappedVariants.reduce((s, v) => s + (v.stockQuantity || 0), 0);

      return {
        data: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          sku: product.sku,
          category: product.category,
          price: prices[0] ?? 0,
          stock: totalStock,
          status: product.is_active ? 'active' : 'inactive',
          description: product.description,
          imageAlt: product.image_alt,
          image: mappedVariants[0]?.imageUrl || null,
          variants: mappedVariants,
        },
        error: null,
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
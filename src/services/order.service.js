import { createClient } from '@/lib/supabase/client';

/**
 * Order Service - Handles all order-related database operations
 * Converts between snake_case (DB) and camelCase (Next.js)
 */
export const orderService = {
  /**
   * Get all orders for the current user with items and product details
   * @param {string} userId - User ID
   * @param {object} filters - Optional filters (status, dateRange, search)
   * @returns {Promise<Array>} Array of orders with items
   */
  async getUserOrders(userId, filters = {}) {
    try {
      const supabase = createClient();
      
      let query = supabase?.from('orders')?.select(`
          id,
          order_number,
          status,
          payment_status,
          payment_method,
          subtotal,
          tax_amount,
          shipping_amount,
          discount_amount,
          total_amount,
          currency,
          shipping_address,
          billing_address,
          notes,
          created_at,
          updated_at,
          order_items (
            id,
            name,
            brand,
            sku,
            variant_name,
            quantity,
            price,
            total,
            product_id,
            products (
              id,
              name,
              image_url,
              category
            )
          ),
          payment_transactions (
            id,
            amount,
            status,
            gateway,
            created_at
          )
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      // Apply status filter
      if (filters?.status && filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }

      // Apply date range filter
      if (filters?.startDate) {
        query = query?.gte('created_at', filters?.startDate);
      }
      if (filters?.endDate) {
        query = query?.lte('created_at', filters?.endDate);
      }

      // Apply search filter (order number or product name)
      if (filters?.search) {
        query = query?.or(`order_number.ilike.%${filters?.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convert to camelCase
      return data?.map(order => ({
        id: order?.id,
        orderNumber: order?.order_number,
        status: order?.status,
        paymentStatus: order?.payment_status,
        paymentMethod: order?.payment_method,
        subtotal: parseFloat(order?.subtotal || 0),
        taxAmount: parseFloat(order?.tax_amount || 0),
        shippingAmount: parseFloat(order?.shipping_amount || 0),
        discountAmount: parseFloat(order?.discount_amount || 0),
        totalAmount: parseFloat(order?.total_amount || 0),
        currency: order?.currency,
        shippingAddress: order?.shipping_address,
        billingAddress: order?.billing_address,
        notes: order?.notes,
        createdAt: order?.created_at,
        updatedAt: order?.updated_at,
        items: order?.order_items?.map(item => ({
          id: item?.id,
          name: item?.name,
          brand: item?.brand,
          sku: item?.sku,
          variantName: item?.variant_name,
          quantity: item?.quantity,
          price: parseFloat(item?.price || 0),
          total: parseFloat(item?.total || 0),
          productId: item?.product_id,
          imageUrl: item?.products?.image_url,
          category: item?.products?.category
        })) || [],
        transactions: order?.payment_transactions?.map(txn => ({
          id: txn?.id,
          amount: parseFloat(txn?.amount || 0),
          status: txn?.status,
          gateway: txn?.gateway,
          createdAt: txn?.created_at
        })) || []
      })) || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Get single order details
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID for authorization
   * @returns {Promise<object>} Order details
   */
  async getOrderById(orderId, userId) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('orders')?.select(`
          id,
          order_number,
          status,
          payment_status,
          payment_method,
          subtotal,
          tax_amount,
          shipping_amount,
          discount_amount,
          total_amount,
          currency,
          shipping_address,
          billing_address,
          notes,
          created_at,
          updated_at,
          order_items (
            id,
            name,
            brand,
            sku,
            variant_name,
            quantity,
            price,
            total,
            product_id,
            products (
              id,
              name,
              image_url,
              description,
              category
            )
          ),
          payment_transactions (
            id,
            amount,
            status,
            gateway,
            gateway_transaction_id,
            created_at
          )
        `)?.eq('id', orderId)?.eq('user_id', userId)?.single();

      if (error) throw error;

      // Convert to camelCase
      return {
        id: data?.id,
        orderNumber: data?.order_number,
        status: data?.status,
        paymentStatus: data?.payment_status,
        paymentMethod: data?.payment_method,
        subtotal: parseFloat(data?.subtotal || 0),
        taxAmount: parseFloat(data?.tax_amount || 0),
        shippingAmount: parseFloat(data?.shipping_amount || 0),
        discountAmount: parseFloat(data?.discount_amount || 0),
        totalAmount: parseFloat(data?.total_amount || 0),
        currency: data?.currency,
        shippingAddress: data?.shipping_address,
        billingAddress: data?.billing_address,
        notes: data?.notes,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        items: data?.order_items?.map(item => ({
          id: item?.id,
          name: item?.name,
          brand: item?.brand,
          sku: item?.sku,
          variantName: item?.variant_name,
          quantity: item?.quantity,
          price: parseFloat(item?.price || 0),
          total: parseFloat(item?.total || 0),
          productId: item?.product_id,
          imageUrl: item?.products?.image_url,
          description: item?.products?.description,
          category: item?.products?.category
        })) || [],
        transactions: data?.payment_transactions?.map(txn => ({
          id: txn?.id,
          amount: parseFloat(txn?.amount || 0),
          status: txn?.status,
          gateway: txn?.gateway,
          transactionId: txn?.gateway_transaction_id,
          createdAt: txn?.created_at
        })) || []
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  /**
   * Get order statistics for the user
   * @param {string} userId - User ID
   * @returns {Promise<object>} Order statistics
   */
  async getOrderStats(userId) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('orders')?.select('status, total_amount')?.eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        totalSpent: 0
      };

      data?.forEach(order => {
        stats.totalSpent += parseFloat(order?.total_amount || 0);
        const status = order?.status?.toLowerCase();
        if (stats?.hasOwnProperty?.(status)) {
          stats[status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  },

  /**
   * Track order shipment status
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID for authorization
   * @returns {Promise<object>} Tracking information
   */
  async getTrackingInfo(orderId, userId) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase?.from('orders')?.select('status, shipping_address, updated_at, notes')?.eq('id', orderId)?.eq('user_id', userId)?.single();

      if (error) throw error;

      return {
        status: data?.status,
        shippingAddress: data?.shipping_address,
        lastUpdate: data?.updated_at,
        notes: data?.notes
      };
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      throw error;
    }
  }
};
/**
 * Mock Data Utility
 * Generates mock data that aligns with Supabase schema for development/testing
 * All IDs use valid UUID v4 format for compatibility with Supabase
 */

/**
 * Generate a valid UUID v4-like string for mock data
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * @returns {string} Valid UUID v4
 */
export function generateMockUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a consistent mock UUID based on a seed string
 * Useful for generating the same ID for the same user across sessions
 * @param {string} seed - Seed string (e.g., email, username)
 * @returns {string} Deterministic UUID v4
 */
export function generateDeterministicMockUUID(seed) {
  // Generate multiple hashes from different parts of the seed for better distribution
  let hash1 = 0;
  let hash2 = 0;
  let hash3 = 0;
  
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + char;
    hash2 = ((hash2 << 7) - hash2) + char;
    hash3 = ((hash3 << 11) - hash3) + char;
  }
  
  // Create 32 hex characters (128 bits for UUID)
  const h1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const h2 = Math.abs(hash2).toString(16).padStart(8, '0');
  const h3 = Math.abs(hash3).toString(16).padStart(8, '0');
  const h4 = (Math.abs(hash1 * hash2 * hash3)).toString(16).padStart(8, '0');
  
  const hex = (h1 + h2 + h3 + h4).substring(0, 32);
  
  // Format as UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // UUID v4 format: 8-4-4-4-12 hex digits
  const version = '4'; // UUID v4
  const variant = ((parseInt(hex.charAt(12), 16) & 0x3) | 0x8).toString(16); // Variant bits
  
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    version + hex.substring(13, 16),
    variant + hex.substring(13, 16),
    hex.substring(20, 32)
  ].join('-');
}

/**
 * Mock customer user profile
 * Aligned with user_profiles table schema
 */
export function generateMockUserProfile(email = 'customer@example.com') {
  const userId = generateDeterministicMockUUID(email);
  return {
    id: userId,
    firstName: 'Maryjoy',
    lastName: 'Santos',
    email,
    phone: '+63 917 123 4567',
    stripeCustomerId: null,
    totalOrders: 3,
    totalSpent: 95497,
    loyaltyPoints: 1910,
    createdAt: new Date('2025-10-15').toISOString(),
    updatedAt: new Date('2025-12-15').toISOString(),
  };
}

/**
 * Mock product data
 * Aligned with products table schema
 */
export const mockProducts = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Modern Leather Sofa',
    description: 'Luxurious 3-seater leather sofa with chrome legs',
    brand: 'Urban Living',
    category: 'Sofas',
    basePrice: 45999.00,
    sku: 'SOFA-ML-001',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    isActive: true,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date('2025-01-01').toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Scandinavian Dining Table',
    description: 'Oak wood dining table seats 6-8 people',
    brand: 'Nordic Home',
    category: 'Dining',
    basePrice: 32999.00,
    sku: 'TABLE-SD-001',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
    isActive: true,
    createdAt: new Date('2025-01-02').toISOString(),
    updatedAt: new Date('2025-01-02').toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Queen Size Bed Frame',
    description: 'Modern platform bed with upholstered headboard',
    brand: 'Dream Rest',
    category: 'Beds',
    basePrice: 28999.00,
    sku: 'BED-QS-001',
    imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800',
    isActive: true,
    createdAt: new Date('2025-01-03').toISOString(),
    updatedAt: new Date('2025-01-03').toISOString(),
  },
];

/**
 * Mock orders data
 * Aligned with orders table schema
 */
export function generateMockOrders(userId) {
  return [
    {
      id: '550e8400-e29b-41d4-a716-446655440101',
      userId,
      orderNumber: 'ORD-2025-1234',
      status: 'shipped',
      paymentStatus: 'succeeded',
      paymentMethod: 'card',
      paymentIntentId: 'pi_1Abc123456789',
      subtotal: 35999.00,
      taxAmount: 2880.00,
      shippingAmount: 500.00,
      discountAmount: 0.00,
      totalAmount: 39379.00,
      currency: 'PHP',
      shippingAddress: {
        firstName: 'Maryjoy',
        lastName: 'Santos',
        addressLine1: '123 Main Street',
        city: 'Manila',
        state: 'NCR',
        postalCode: '1000',
        country: 'PH',
        phone: '+63 917 123 4567'
      },
      billingAddress: {
        firstName: 'Maryjoy',
        lastName: 'Santos',
        addressLine1: '123 Main Street',
        city: 'Manila',
        state: 'NCR',
        postalCode: '1000',
        country: 'PH',
        phone: '+63 917 123 4567'
      },
      notes: null,
      createdAt: new Date('2025-12-02').toISOString(),
      updatedAt: new Date('2025-12-05').toISOString(),
      orderItems: [
        {
          id: '550e8400-e29b-41d4-a716-446655440201',
          orderId: '550e8400-e29b-41d4-a716-446655440101',
          productId: '550e8400-e29b-41d4-a716-446655440001',
          variantId: '550e8400-e29b-41d4-a716-446655440301',
          variantName: 'Black Leather',
          sku: 'SOFA-ML-001-BLK',
          name: 'Modern Leather Sofa - Black',
          brand: 'Urban Living',
          price: 45999.00,
          quantity: 1,
          total: 45999.00,
          createdAt: new Date('2025-12-02').toISOString(),
        }
      ],
      paymentTransactions: [
        {
          id: '550e8400-e29b-41d4-a716-446655440401',
          orderId: '550e8400-e29b-41d4-a716-446655440101',
          paymentIntentId: 'pi_1Abc123456789',
          stripeChargeId: 'ch_1Abc123456789',
          gcashReferenceId: null,
          amount: 39379.00,
          currency: 'PHP',
          status: 'succeeded',
          transactionType: 'payment',
          gateway: 'stripe',
          gatewayTransactionId: 'ch_1Abc123456789',
          metadata: { orderId: 'ORD-2025-1234' },
          createdAt: new Date('2025-12-02').toISOString(),
        }
      ]
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440102',
      userId,
      orderNumber: 'ORD-2025-1189',
      status: 'delivered',
      paymentStatus: 'succeeded',
      paymentMethod: 'card',
      paymentIntentId: 'pi_2Xyz789012345',
      subtotal: 6499.00,
      taxAmount: 520.00,
      shippingAmount: 200.00,
      discountAmount: 0.00,
      totalAmount: 7219.00,
      currency: 'PHP',
      shippingAddress: {
        firstName: 'Maryjoy',
        lastName: 'Santos',
        addressLine1: '123 Main Street',
        city: 'Manila',
        state: 'NCR',
        postalCode: '1000',
        country: 'PH',
        phone: '+63 917 123 4567'
      },
      billingAddress: {
        firstName: 'Maryjoy',
        lastName: 'Santos',
        addressLine1: '123 Main Street',
        city: 'Manila',
        state: 'NCR',
        postalCode: '1000',
        country: 'PH',
        phone: '+63 917 123 4567'
      },
      notes: null,
      createdAt: new Date('2025-11-28').toISOString(),
      updatedAt: new Date('2025-12-04').toISOString(),
      orderItems: [
        {
          id: '550e8400-e29b-41d4-a716-446655440202',
          orderId: '550e8400-e29b-41d4-a716-446655440102',
          productId: null,
          variantId: null,
          variantName: null,
          sku: 'SHELF-BU-001',
          name: 'Wooden Bookshelf',
          brand: 'Library Style',
          price: 6499.00,
          quantity: 1,
          total: 6499.00,
          createdAt: new Date('2025-11-28').toISOString(),
        }
      ],
      paymentTransactions: [
        {
          id: '550e8400-e29b-41d4-a716-446655440402',
          orderId: '550e8400-e29b-41d4-a716-446655440102',
          paymentIntentId: 'pi_2Xyz789012345',
          stripeChargeId: 'ch_2Xyz789012345',
          gcashReferenceId: null,
          amount: 7219.00,
          currency: 'PHP',
          status: 'succeeded',
          transactionType: 'payment',
          gateway: 'stripe',
          gatewayTransactionId: 'ch_2Xyz789012345',
          metadata: { orderId: 'ORD-2025-1189' },
          createdAt: new Date('2025-11-28').toISOString(),
        }
      ]
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440103',
      userId,
      orderNumber: 'ORD-2025-1156',
      status: 'processing',
      paymentStatus: 'succeeded',
      paymentMethod: 'card',
      paymentIntentId: 'pi_3Def456789012',
      subtotal: 12999.00,
      taxAmount: 1040.00,
      shippingAmount: 300.00,
      discountAmount: 0.00,
      totalAmount: 14339.00,
      currency: 'PHP',
      shippingAddress: {
        firstName: 'Maryjoy',
        lastName: 'Santos',
        addressLine1: '123 Main Street',
        city: 'Manila',
        state: 'NCR',
        postalCode: '1000',
        country: 'PH',
        phone: '+63 917 123 4567'
      },
      billingAddress: {
        firstName: 'Maryjoy',
        lastName: 'Santos',
        addressLine1: '123 Main Street',
        city: 'Manila',
        state: 'NCR',
        postalCode: '1000',
        country: 'PH',
        phone: '+63 917 123 4567'
      },
      notes: null,
      createdAt: new Date('2025-12-05').toISOString(),
      updatedAt: new Date('2025-12-06').toISOString(),
      orderItems: [
        {
          id: '550e8400-e29b-41d4-a716-446655440203',
          orderId: '550e8400-e29b-41d4-a716-446655440103',
          productId: null,
          variantId: null,
          variantName: null,
          sku: 'DESK-EO-001',
          name: 'Office Desk with Drawers',
          brand: 'WorkSpace Pro',
          price: 12999.00,
          quantity: 1,
          total: 12999.00,
          createdAt: new Date('2025-12-05').toISOString(),
        }
      ],
      paymentTransactions: [
        {
          id: '550e8400-e29b-41d4-a716-446655440403',
          orderId: '550e8400-e29b-41d4-a716-446655440103',
          paymentIntentId: 'pi_3Def456789012',
          stripeChargeId: 'ch_3Def456789012',
          gcashReferenceId: null,
          amount: 14339.00,
          currency: 'PHP',
          status: 'succeeded',
          transactionType: 'payment',
          gateway: 'stripe',
          gatewayTransactionId: 'ch_3Def456789012',
          metadata: { orderId: 'ORD-2025-1156' },
          createdAt: new Date('2025-12-05').toISOString(),
        }
      ]
    }
  ];
}

/**
 * Convert mock order to dashboard display format
 * @param {Object} order - Mock order object
 * @returns {Object} Formatted for OrderStatusCard
 */
export function formatOrderForDisplay(order) {
  // Determine status display
  const statusMap = {
    'processing': 'Processing',
    'shipped': 'In Transit',
    'delivered': 'Delivered',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
  };

  const productName = order.orderItems?.[0]?.name || 'Order Item';
  
  // Calculate estimated delivery based on order date
  const orderDate = new Date(order.createdAt);
  const estDeliveryDate = new Date(orderDate);
  estDeliveryDate.setDate(estDeliveryDate.getDate() + 7); // 7 days for estimate

  return {
    orderNumber: order.orderNumber,
    productName,
    status: statusMap[order.status] || order.status,
    orderDate: orderDate.toLocaleDateString('en-PH', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '/'),
    estimatedDelivery: estDeliveryDate.toLocaleDateString('en-PH', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '/'),
    totalAmount: parseFloat(order.totalAmount),
  };
}

/**
 * Convert mock order to OrderCard display format
 * @param {Object} order - Mock order object with full details
 * @returns {Object} Formatted for OrderCard component
 */
export function formatOrderForOrderCard(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    totalAmount: parseFloat(order.totalAmount),
    subtotal: parseFloat(order.subtotal),
    taxAmount: parseFloat(order.taxAmount),
    shippingAmount: parseFloat(order.shippingAmount),
    discountAmount: parseFloat(order.discountAmount),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    items: (order.orderItems || []).map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      sku: item.sku,
      price: parseFloat(item.price),
      quantity: item.quantity,
      total: parseFloat(item.total),
      variantName: item.variantName,
    })),
    shippingAddress: {
      first_name: order.shippingAddress?.firstName || 'Maryjoy',
      last_name: order.shippingAddress?.lastName || 'Santos',
      address_line_1: order.shippingAddress?.addressLine1 || '123 Main Street',
      city: order.shippingAddress?.city || 'Manila',
      state: order.shippingAddress?.state || 'NCR',
      postal_code: order.shippingAddress?.postalCode || '1000',
      country: order.shippingAddress?.country || 'PH',
      phone: order.shippingAddress?.phone || '+63 917 123 4567',
    },
    billingAddress: {
      first_name: order.billingAddress?.firstName || 'Maryjoy',
      last_name: order.billingAddress?.lastName || 'Santos',
      address_line_1: order.billingAddress?.addressLine1 || '123 Main Street',
      city: order.billingAddress?.city || 'Manila',
      state: order.billingAddress?.state || 'NCR',
      postal_code: order.billingAddress?.postalCode || '1000',
      country: order.billingAddress?.country || 'PH',
      phone: order.billingAddress?.phone || '+63 917 123 4567',
    },
    notes: order.notes,
  };
}

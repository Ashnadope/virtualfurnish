import { createClient } from '@/lib/supabase/client';

export const paymentService = {
  /**
   * Create a payment intent via Supabase Edge Function
   * @param {Object} orderData - Order details including items, totals
   * @param {Object} customerInfo - Customer billing and shipping info
   * @param {string} paymentMethod - 'card' or 'gcash'
   */
  async createPaymentIntent(orderData, customerInfo, paymentMethod = 'card') {
    const supabase = createClient()

    console.log('Invoking create-payment-intent function with:', {
      orderData,
      customerInfo,
      paymentMethod
    })

    const { data, error } = await supabase?.functions?.invoke('create-payment-intent', {
      body: {
        orderData,
        customerInfo,
        paymentMethod
      }
    })

    if (error) {
      console.error('Payment intent creation error:', error)
      console.error('Error context:', {
        name: error?.name,
        message: error?.message,
        context: error?.context,
        status: error?.status
      })
      throw new Error(error.message || 'Failed to create payment intent')
    }

    console.log('Payment intent response:', data)
    return data
  },

  /**
   * Confirm payment via Supabase Edge Function
   * @param {string} paymentIntentId - Stripe payment intent ID
   */
  async confirmPayment(paymentIntentId) {
    const supabase = createClient()

    const { data, error } = await supabase?.functions?.invoke('confirm-payment', {
      body: { paymentIntentId }
    })

    if (error) {
      console.error('Payment confirmation error:', error)
      throw new Error(error.message || 'Failed to confirm payment')
    }

    return data
  },

  /**
   * Process GCash payment
   * @param {Object} orderData - Order details
   * @param {Object} customerInfo - Customer information
   */
  async processGCashPayment(orderData, customerInfo) {
    const supabase = createClient()

    console.log('Invoking process-gcash-payment function with:', {
      orderData,
      customerInfo
    })

    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      )

      const invokePromise = supabase?.functions?.invoke('process-gcash-payment', {
        body: {
          orderData,
          customerInfo
        }
      })

      const response = await Promise.race([invokePromise, timeoutPromise])
      const { data, error } = response

      if (error) {
        console.error('GCash payment error:', error)
        console.error('Error context:', {
          name: error?.name,
          message: error?.message,
          context: error?.context,
          status: error?.status
        })
        
        // Try to get more details from the error response
        if (error?.context instanceof Response) {
          try {
            const errorBody = await error.context.text()
            console.error('Error response body:', errorBody)
          } catch (e) {
            console.error('Could not read error response body')
          }
        }
        
        throw new Error(error.message || 'Failed to process GCash payment')
      }

      console.log('GCash payment response:', data)
      return data
    } catch (err) {
      console.error('GCash payment invocation failed:', err)
      throw err
    }
  },

  /**
   * Format amount for display
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code (default: PHP)
   */
  formatAmount(amount, currency = 'PHP') {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
    })?.format(amount / 100);
  },

  /**
   * Validate Philippine compliance requirements
   * @param {Object} customerInfo - Customer information to validate
   * @returns {string[]} - Array of validation errors
   */
  validatePhilippineCompliance(customerInfo) {
    const errors = []
    
    if (!customerInfo?.firstName || !customerInfo?.lastName) {
      errors?.push('Customer name is required')
    }
    
    if (!customerInfo?.billing?.address_line_1) {
      errors?.push('Billing address is required')
    }
    
    if (!customerInfo?.billing?.city || !customerInfo?.billing?.state) {
      errors?.push('City and province are required')
    }
    
    if (!customerInfo?.billing?.postal_code) {
      errors?.push('Postal code is required')
    }

    if (!customerInfo?.phone) {
      errors?.push('Phone number is required')
    }
    
    return errors
  }
}
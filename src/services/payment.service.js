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
      const invokePromise = supabase?.functions?.invoke('process-gcash-payment', {
        body: {
          orderData,
          customerInfo
        }
      })

      // 45-second safety timeout — if the edge function never responds, surface an error
      // instead of hanging the UI indefinitely.  Safe because the edge function now does an
      // idempotent update (not a blind insert), so retrying won't create duplicate orders.
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('GCash payment timed out. Please try again.')), 45_000)
      )

      const { data, error } = await Promise.race([invokePromise, timeoutPromise])

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
   * Initiate QRPH payment via PayMongo (Supabase Edge Function)
   * @param {Object} orderData - Order details
   * @param {Object} customerInfo - Customer information
   * @returns {{ orderId, orderNumber, checkoutUrl, paymongoPaymentIntentId, status }}
   */
  async processQRPHPayment(orderData, customerInfo) {
    const supabase = createClient()

    console.log('Invoking process-qrph-payment function with:', {
      orderData,
      customerInfo,
    })

    try {
      // Get the current session token for authorization
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) throw new Error('Not authenticated')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // Use direct fetch instead of supabase.functions.invoke to avoid client-side parsing issues
      const response = await fetch(`${supabaseUrl}/functions/v1/process-qrph-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ orderData, customerInfo }),
      })

      console.log('QRPH fetch response status:', response.status)
      const data = await response.json()
      console.log('QRPH fetch response data:', data)

      if (!response.ok) {
        throw new Error(data?.error || `Server error ${response.status}`)
      }

      return data
    } catch (err) {
      console.error('QRPH payment invocation failed:', err)
      throw err
    }
  },

  /**
   * Poll QRPH payment status
   * @param {string} orderId - The order UUID
   * @returns {{ status, orderId, orderNumber }}
   */
  async checkQRPHStatus(orderId) {
    const supabase = createClient()

    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (!accessToken) throw new Error('Not authenticated')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/functions/v1/check-qrph-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ orderId }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.error || 'Failed to check QRPH payment status')
    }

    return data
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
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import GCashPaymentForm from '@/components/payment/GCashPaymentForm';
import { createClient } from '@/lib/supabase/client';
import { paymentService } from '@/services/payment.service';
import Header from '@/components/common/Header';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [orderData, setOrderData] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' or 'gcash'
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    async function initializeCheckout() {
      try {
        const supabase = createClient()
        
        const { data: { user }, error: authError } = await supabase?.auth?.getUser()
        if (authError || !user) {
          router?.push('/login')
          return
        }

        const { data: cartData, error: cartError } = await supabase?.from('cart_items')?.select('*, products(*), product_variants(*)')?.eq('user_id', user?.id)

        if (cartError || !cartData || cartData?.length === 0) {
          setError('Your cart is empty. Please add items before checkout.')
          return
        }

        setCartItems(cartData)

        const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('*, addresses(*)')?.eq('id', user?.id)?.single()

        if (profileError) {
          setError('Failed to load user profile')
          return
        }

        const items = cartData?.map(item => ({
          id: item?.product_id,
          product_id: item?.product_id,
          name: item?.products?.name || 'Product',
          brand: item?.products?.brand || '',
          price: parseFloat(item?.price) || 0,
          quantity: item?.quantity,
          variant_id: item?.variant_id,
          variant_name: item?.product_variants?.name || '',
          sku: item?.product_variants?.sku || item?.products?.sku || ''
        }))

        const subtotal = items?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0)
        const tax = subtotal * 0.12 // 12% VAT for Philippines
        const shippingCost = 0
        const total = subtotal + tax + shippingCost

        const billingAddress = profile?.addresses?.find(a => a?.type === 'billing' && a?.is_default) 
          || profile?.addresses?.find(a => a?.type === 'billing')
          || profile?.addresses?.[0]

        if (!billingAddress) {
          setError('Please add a billing address before proceeding')
          return
        }

        const customerData = {
          userId: user?.id,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          email: profile?.email || user?.email || '',
          phone: profile?.phone || '',
          stripeCustomerId: profile?.stripe_customer_id,
          billing: {
            address_line_1: billingAddress?.address_line_1,
            address_line_2: billingAddress?.address_line_2,
            city: billingAddress?.city,
            state: billingAddress?.state,
            postal_code: billingAddress?.postal_code,
            country: billingAddress?.country || 'PH'
          }
        }

        const validationErrors = paymentService?.validatePhilippineCompliance(customerData)
        if (validationErrors?.length > 0) {
          setError(validationErrors?.join(', '))
          return
        }

        const orderPayload = {
          items,
          subtotal,
          tax,
          shipping_cost: shippingCost,
          total,
          currency: 'PHP'
        }

        setCustomerInfo(customerData)
        setOrderData({ ...orderPayload, amount: Math.round(total * 100) })

        // Only create payment intent for card payments
        if (paymentMethod === 'card') {
          const paymentData = await paymentService?.createPaymentIntent(
            orderPayload, 
            customerData, 
            'card'
          )

          if (paymentData?.clientSecret) {
            setClientSecret(paymentData?.clientSecret)
            setOrderData(prev => ({
              ...prev,
              orderId: paymentData?.orderId,
              orderNumber: paymentData?.orderNumber
            }))
          } else {
            setError('Failed to initialize payment')
          }
        }

      } catch (err) {
        console.error('Checkout initialization error:', err)
        setError(err?.message || 'Failed to initialize checkout')
      } finally {
        setLoading(false)
      }
    }

    initializeCheckout()
  }, [router, paymentMethod])

  const handlePaymentSuccess = async (result) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase?.auth?.getUser()
      
      if (user) {
        await supabase?.from('cart_items')?.delete()?.eq('user_id', user?.id)
      }
      
      router?.push(`/checkout/success?order=${result?.orderNumber}`)
    } catch (err) {
      console.error('Post-payment cleanup error:', err)
      router?.push(`/checkout/success?order=${result?.orderNumber}`)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto max-w-4xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto max-w-4xl p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => router?.push('/cart')}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Back to Cart
                </button>
                <button
                  onClick={() => router?.push('/customer-dashboard')}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto max-w-6xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems?.map((item) => (
                    <div key={item?.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item?.products?.image_url ? (
                          <img 
                            src={item?.products?.image_url} 
                            alt={item?.products?.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item?.products?.name || 'Product'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item?.quantity}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₱{(parseFloat(item?.price) * item?.quantity)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ₱{orderData?.subtotal?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (12%)</span>
                    <span className="text-gray-900">
                      ₱{orderData?.tax?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ₱{orderData?.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection & Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method Tabs */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Payment Method
                </h2>
                
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card' ?'border-blue-600 bg-blue-50 ring-2 ring-blue-100' :'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className={`font-semibold ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-700'}`}>
                        Credit/Debit Card
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('gcash')}
                    className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                      paymentMethod === 'gcash' ?'border-blue-600 bg-blue-50 ring-2 ring-blue-100' :'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                      </svg>
                      <span className={`font-semibold ${paymentMethod === 'gcash' ? 'text-blue-600' : 'text-gray-700'}`}>
                        GCash
                      </span>
                    </div>
                  </button>
                </div>

                {/* Payment Form */}
                {paymentMethod === 'card' && clientSecret && orderData && customerInfo && (
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    amount={orderData?.amount}
                    currency="PHP"
                    orderData={orderData}
                    customerInfo={customerInfo}
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => console.error('Payment error:', error)}
                  />
                )}

                {paymentMethod === 'gcash' && orderData && customerInfo && (
                  <GCashPaymentForm
                    amount={orderData?.amount}
                    currency="PHP"
                    orderData={orderData}
                    customerInfo={customerInfo}
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => console.error('GCash payment error:', error)}
                  />
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Your payment is secure
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      We use industry-standard encryption to protect your payment information. 
                      Your data is never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
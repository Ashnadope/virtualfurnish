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
  const [currentStep, setCurrentStep] = useState(1) // 1: Cart Review, 2: Shipping, 3: Payment
  const [shippingAddress, setShippingAddress] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    country: 'PH'
  })
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addressErrors, setAddressErrors] = useState({})
  const [paymentInitialized, setPaymentInitialized] = useState(false)

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

        // Set shipping address from profile or mark for editing
        if (billingAddress) {
          setShippingAddress({
            address_line_1: billingAddress?.address_line_1 || '',
            address_line_2: billingAddress?.address_line_2 || '',
            city: billingAddress?.city || '',
            state: billingAddress?.state || '',
            postal_code: billingAddress?.postal_code || '',
            phone: billingAddress?.phone || profile?.phone || '',
            country: billingAddress?.country || 'PH'
          })
        } else {
          setIsEditingAddress(true)
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

      } catch (err) {
        console.error('Checkout initialization error:', err)
        setError(err?.message || 'Failed to initialize checkout')
      } finally {
        setLoading(false)
      }
    }

    initializeCheckout()
  }, [router])

  // Initialize payment when moving to payment step
  useEffect(() => {
    async function initializePayment() {
      if (currentStep !== 3 || !orderData || !customerInfo) return
      
      // Prevent re-initialization if already initialized for this session
      if (paymentInitialized && clientSecret) {
        console.log('Payment already initialized, skipping...')
        return
      }

      try {
        console.log('Initializing payment...', { orderData, customerInfo, shippingAddress })
        
        // Validate shipping address before creating payment intent
        const validationErrors = validateShippingAddress()
        if (Object.keys(validationErrors)?.length > 0) {
          console.warn('Shipping validation failed:', validationErrors)
          setCurrentStep(2)
          setAddressErrors(validationErrors)
          return
        }

        // Update customer info with shipping address
        const updatedCustomerInfo = {
          ...customerInfo,
          shipping: shippingAddress,
          billing: {
            ...(customerInfo?.billing || {}),
            ...shippingAddress
          },
          phone: customerInfo?.phone || shippingAddress?.phone || ''
        }

        console.log('Updated customer info:', updatedCustomerInfo)

        // Shipping address will be saved by the Edge Function when creating the order

        const validationResult = paymentService?.validatePhilippineCompliance(updatedCustomerInfo)
        if (validationResult?.length > 0) {
          console.warn('Philippine compliance validation failed:', validationResult)
          setError(validationResult?.join(', '))
          return
        }

        if (paymentMethod === 'card') {
          console.log('Creating payment intent...')
          const paymentData = await paymentService?.createPaymentIntent(
            orderData, 
            updatedCustomerInfo, 
            'card'
          )

          console.log('Payment intent created:', paymentData)

          if (paymentData?.clientSecret) {
            setClientSecret(paymentData?.clientSecret)
            setOrderData(prev => ({
              ...prev,
              orderId: paymentData?.orderId,
              orderNumber: paymentData?.orderNumber
            }))
            setCustomerInfo(updatedCustomerInfo)
            setPaymentInitialized(true)
            console.log('Payment initialization successful')
          } else {
            console.error('No client secret in payment data:', paymentData)
            setError('Failed to initialize payment - no client secret returned')
          }
        } else {
          // For GCash, ensure shipping is included in orderData
          setOrderData(prev => ({
            ...prev,
            shipping: shippingAddress
          }))
          setCustomerInfo(updatedCustomerInfo)
          setPaymentInitialized(true)
        }
      } catch (err) {
        console.error('Payment initialization error:', err)
        console.error('Error details:', {
          message: err?.message,
          name: err?.name,
          stack: err?.stack,
          context: err?.context
        })
        setError(`Payment initialization failed: ${err?.message || 'Unknown error'}`)
      }
    }

    initializePayment()
  }, [currentStep, paymentMethod])

  const validateShippingAddress = () => {
    const errors = {}
    
    if (!shippingAddress?.address_line_1?.trim()) {
      errors.address_line_1 = 'Street address is required'
    }
    
    if (!shippingAddress?.city?.trim()) {
      errors.city = 'City is required'
    }
    
    if (!shippingAddress?.state?.trim()) {
      errors.state = 'Province/State is required'
    }
    
    if (!shippingAddress?.postal_code?.trim()) {
      errors.postal_code = 'Postal code is required'
    } else if (!/^\d{4}$/?.test(shippingAddress?.postal_code)) {
      errors.postal_code = 'Invalid Philippine postal code (4 digits required)'
    }

    if (!shippingAddress?.phone?.trim()) {
      errors.phone = 'Phone number is required'
    }
    
    return errors
  }

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (addressErrors?.[field]) {
      setAddressErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors?.[field]
        return newErrors
      })
    }
  }

  const handleContinueToPayment = () => {
    const errors = validateShippingAddress()
    
    if (Object.keys(errors)?.length > 0) {
      setAddressErrors(errors)
      return
    }
    
    setIsEditingAddress(false)
    // Reset payment state when moving to payment step
    setPaymentInitialized(false)
    setClientSecret('')
    setError('')
    setCurrentStep(3)
  }

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
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {/* Step 1: Cart Review */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > 1 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : '1'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Cart Review</span>
              </div>

              {/* Connector */}
              <div className={`w-24 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>

              {/* Step 2: Shipping */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > 2 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : '2'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Shipping</span>
              </div>

              {/* Connector */}
              <div className={`w-24 h-1 mx-4 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>

              {/* Step 3: Payment */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Payment</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary - Always visible on right */}
            <div className="lg:col-span-1 order-2 lg:order-2">
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

            {/* Main Content Area - Changes based on step */}
            <div className="lg:col-span-2 order-1 lg:order-1">
              {/* Step 1: Cart Review */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Cart</h2>
                  
                  <div className="space-y-4 mb-6">
                    {cartItems?.map((item) => (
                      <div key={item?.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item?.products?.image_url ? (
                            <img 
                              src={item?.products?.image_url} 
                              alt={item?.products?.name || 'Product'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item?.products?.name || 'Product'}</h3>
                          {item?.products?.brand && (
                            <p className="text-sm text-gray-600">{item?.products?.brand}</p>
                          )}
                          {item?.product_variants?.name && (
                            <p className="text-sm text-gray-600">Variant: {item?.product_variants?.name}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Quantity: {item?.quantity}</span>
                            <span className="text-lg font-bold text-gray-900">
                              ₱{(parseFloat(item?.price) * item?.quantity)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => router?.push('/cart')}
                      className="flex-1 py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Edit Cart
                    </button>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 px-6 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Continue to Shipping
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                    {!isEditingAddress && (
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit Address
                      </button>
                    )}
                  </div>

                  {!isEditingAddress ? (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">{shippingAddress?.address_line_1}</p>
                        {shippingAddress?.address_line_2 && (
                          <p className="text-gray-700">{shippingAddress?.address_line_2}</p>
                        )}
                        <p className="text-gray-700">
                          {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}
                        </p>
                        <p className="text-gray-700">{shippingAddress?.country === 'PH' ? 'Philippines' : shippingAddress?.country}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress?.address_line_1}
                          onChange={(e) => handleAddressChange('address_line_1', e?.target?.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            addressErrors?.address_line_1 ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="House/Unit No., Street Name"
                        />
                        {addressErrors?.address_line_1 && (
                          <p className="mt-1 text-sm text-red-600">{addressErrors?.address_line_1}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apartment, Suite, etc. (Optional)
                        </label>
                        <input
                          type="text"
                          value={shippingAddress?.address_line_2}
                          onChange={(e) => handleAddressChange('address_line_2', e?.target?.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Apartment, suite, unit, building, floor, etc."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress?.city}
                            onChange={(e) => handleAddressChange('city', e?.target?.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              addressErrors?.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="City"
                          />
                          {addressErrors?.city && (
                            <p className="mt-1 text-sm text-red-600">{addressErrors?.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Province/State *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress?.state}
                            onChange={(e) => handleAddressChange('state', e?.target?.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              addressErrors?.state ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Province or State"
                          />
                          {addressErrors?.state && (
                            <p className="mt-1 text-sm text-red-600">{addressErrors?.state}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress?.postal_code}
                            onChange={(e) => handleAddressChange('postal_code', e?.target?.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              addressErrors?.postal_code ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="4-digit postal code"
                            maxLength={4}
                          />
                          {addressErrors?.postal_code && (
                            <p className="mt-1 text-sm text-red-600">{addressErrors?.postal_code}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            value="Philippines"
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress?.phone}
                          onChange={(e) => handleAddressChange('phone', e?.target?.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            addressErrors?.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g. +63 917 123 4567"
                        />
                        {addressErrors?.phone && (
                          <p className="mt-1 text-sm text-red-600">{addressErrors?.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={handleContinueToPayment}
                      className="flex-1 py-3 px-6 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Shipping Address Summary */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                      <button
                        onClick={() => {
                          setPaymentInitialized(false)
                          setClientSecret('')
                          setError('')
                          setCurrentStep(2)
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Change
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-gray-900">{shippingAddress?.address_line_1}</p>
                        {shippingAddress?.address_line_2 && (
                          <p className="text-gray-700">{shippingAddress?.address_line_2}</p>
                        )}
                        <p className="text-gray-700">
                          {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}
                        </p>
                        <p className="text-gray-700">Philippines</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
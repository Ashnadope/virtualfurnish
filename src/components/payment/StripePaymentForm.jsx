'use client';
import { useState, useEffect } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement,
  Elements 
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/client';
import { paymentService } from '@/services/payment.service';

function PaymentFormInner({ 
  clientSecret,
  amount,
  currency = 'PHP',
  orderData,
  customerInfo,
  onSuccess,
  onError 
}) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [paymentReady, setPaymentReady] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState(null)

  useEffect(() => {
    if (elements) {
      const paymentElement = elements?.getElement(PaymentElement)
      if (paymentElement) {
        paymentElement?.on('ready', () => setPaymentReady(true))
      }
    }
  }, [elements])

  const handleSubmit = async (e) => {
    e?.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Payment system not ready. Please try again.')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      const { error: stripeError, paymentIntent } = await stripe?.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location?.origin}/checkout/success`,
        },
        redirect: 'if_required'
      })

      if (stripeError) {
        setErrorMessage(stripeError?.message || 'Payment failed. Please try again.')
        if (onError) onError(stripeError)
      } else if (paymentIntent) {
        if (paymentIntent?.status === 'succeeded') {
          const confirmData = await paymentService?.confirmPayment(paymentIntent?.id)
          
          const successResult = {
            paymentIntent,
            orderId: orderData?.orderId,
            orderNumber: orderData?.orderNumber,
            orderData: confirmData,
            warning: confirmData?.error ? 'Payment processed but confirmation failed. Please contact support.' : undefined
          }

          setSuccessData(successResult)
          setShowSuccess(true)

          setTimeout(() => {
            setShowSuccess(false)
            if (onSuccess) onSuccess(successResult)
          }, 3000)
        } else if (paymentIntent?.status === 'requires_action') {
          setErrorMessage('Additional authentication required. Please complete the verification.')
        } else {
          setErrorMessage('Payment processing incomplete. Please try again.')
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
      if (onError) onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!stripe || !elements || !clientSecret) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Loading payment system...
        </p>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900">
            Payment Details
          </label>
          <PaymentElement 
            options={{
              fields: {
                billingDetails: 'auto'
              },
              layout: 'tabs'
            }}
          />
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!paymentReady || isProcessing || !stripe || !elements}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing Payment...
            </>
          ) : (
            `Pay ${paymentService?.formatAmount(amount, currency)}`
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secured by Stripe • Your payment information is encrypted</span>
        </div>
      </form>
      {showSuccess && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
          <div className="text-center space-y-6 p-8">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600">
                Payment Successful! 🎉
              </h3>
              <p className="text-green-700 font-medium">
                Your order has been confirmed
              </p>
              {successData?.orderNumber && (
                <p className="text-sm text-green-600">
                  Order #{successData?.orderNumber}
                </p>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-lg font-semibold text-green-800">
                {paymentService?.formatAmount(amount, currency)} Paid
              </p>
              <p className="text-xs text-green-600 mt-1">
                Processing your order...
              </p>
            </div>

            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StripePaymentForm(props) {
  const stripePromise = getStripe()

  if (!props?.clientSecret) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Preparing payment system...
        </p>
      </div>
    )
  }

  const elementsOptions = {
    clientSecret: props?.clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentFormInner {...props} />
    </Elements>
  )
}
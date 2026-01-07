'use client';
import { useState } from 'react';
import { paymentService } from '@/services/payment.service';
 

export default function GCashPaymentForm({
  amount,
  currency = 'PHP',
  orderData,
  customerInfo,
  onSuccess,
  onError
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [gcashNumber, setGcashNumber] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!gcashNumber || gcashNumber.length < 11) {
      setErrorMessage('Please enter a valid GCash mobile number')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      const gcashData = await paymentService.processGCashPayment(
        {
          ...orderData,
          gcash_number: gcashNumber
        },
        customerInfo
      )

      setShowSuccess(true)
      
      setTimeout(() => {
        setShowSuccess(false)
        if (onSuccess) {
          onSuccess({
            orderId: gcashData.orderId,
            orderNumber: gcashData.orderNumber,
            referenceNumber: gcashData.referenceNumber
          })
        }
      }, 3000)

    } catch (error) {
      console.error('GCash payment error:', error)
      setErrorMessage(error.message || 'GCash payment failed. Please try again.')
      if (onError) onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {!showSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Pay with GCash
            </h3>
            <p className="text-sm text-gray-600">
              Enter your GCash mobile number to complete payment
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GCash Mobile Number
              </label>
              <input
                type="tel"
                value={gcashNumber}
                onChange={(e) => setGcashNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="09XX XXX XXXX"
                maxLength={11}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 09XXXXXXXXX (11 digits)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Payment Instructions:
              </h4>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Enter your GCash mobile number</li>
                <li>You will receive an OTP code</li>
                <li>Enter the OTP to confirm payment</li>
                <li>Payment will be processed instantly</li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="text-xl font-bold text-gray-900">
                  {paymentService.formatAmount(amount, currency)}
                </span>
              </div>
            </div>
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
            disabled={isProcessing || !gcashNumber}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing GCash Payment...
              </>
            ) : (
              `Pay ${paymentService.formatAmount(amount, currency)} with GCash`
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secured by GCash • Your transaction is protected</span>
          </div>
        </form>
      ) : (
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
              GCash Payment Successful! 🎉
            </h3>
            <p className="text-green-700 font-medium">
              Your order has been confirmed
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-lg font-semibold text-green-800">
              {paymentService.formatAmount(amount, currency)} Paid
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
      )}
    </div>
  )
}
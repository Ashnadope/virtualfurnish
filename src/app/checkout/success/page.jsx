'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
 import Link from'next/link';
 import Header from'@/components/common/Header';

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/customer-dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center space-y-8">
            {/* Success Animation */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-gray-900">
                Payment Successful! 🎉
              </h1>
              <p className="text-xl text-gray-600">
                Thank you for your purchase at VirtualFurnish
              </p>
            </div>

            {/* Order Details */}
            {orderNumber && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <p className="text-sm text-green-700 font-medium mb-2">
                  Your Order Number
                </p>
                <p className="text-3xl font-bold text-green-600 font-mono tracking-wider">
                  #{orderNumber}
                </p>
                <p className="text-sm text-green-600 mt-3">
                  A confirmation email has been sent to your registered email address
                </p>
              </div>
            )}

            {/* Order Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Order confirmation sent to your email</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Your order is being processed by our team</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track your order status in your dashboard</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Delivery updates will be sent via email and SMS</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/customer-dashboard"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/products"
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Auto Redirect */}
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in <span className="font-bold text-blue-600">{countdown}</span> seconds...
            </p>

            {/* Support */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm text-gray-600">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@virtualfurnish.com" className="text-blue-600 hover:underline font-medium">
                  support@virtualfurnish.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
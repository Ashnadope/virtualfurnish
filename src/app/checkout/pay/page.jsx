'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import GCashPaymentForm from '@/components/payment/GCashPaymentForm';
import QRPHPaymentForm from '@/components/payment/QRPHPaymentForm';
import { paymentService } from '@/services/payment.service';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

function ContinuePaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cardError, setCardError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qrph');
  const [clientSecret, setClientSecret] = useState('');
  const paymentInitializedRef = useRef(false);

  // Fetch the existing order
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setError('No order specified');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }
        const user = session.user;

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
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
            order_items (
              id,
              product_id,
              variant_id,
              variant_name,
              name,
              brand,
              sku,
              quantity,
              price,
              total,
              products ( id, name, image_url ),
              product_variants ( id, image_url )
            )
          `)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !data) {
          setError('Order not found');
          setLoading(false);
          return;
        }

        if (data.status !== 'pending' || !['pending', 'failed'].includes(data.payment_status)) {
          setError('This order has already been paid or is no longer eligible for payment.');
          setLoading(false);
          return;
        }

        setOrder(data);
        setPaymentMethod(data.payment_method || 'qrph');
      } catch (err) {
        setError(err?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, router]);

  // Initialize card payment when selected
  useEffect(() => {
    async function initCardPayment() {
      if (paymentMethod !== 'card' || !order || paymentInitializedRef.current) return;
      paymentInitializedRef.current = true;

      try {
        const customerInfo = {
          billing: order.billing_address,
          shipping: order.shipping_address,
          phone: order.shipping_address?.phone || '',
          firstName: order.billing_address?.first_name || '',
          lastName: order.billing_address?.last_name || '',
          email: order.billing_address?.email || '',
        };

        const paymentData = await paymentService.createPaymentIntent(
          {
            ...buildOrderData(),
            orderId: order.id,
          },
          customerInfo,
          'card'
        );

        if (paymentData?.clientSecret) {
          setClientSecret(paymentData.clientSecret);
        } else {
          setCardError('Failed to initialize card payment');
        }
      } catch (err) {
        setCardError(`Card setup failed: ${err?.message || 'Unknown error'}`);
      }
    }
    initCardPayment();
  }, [paymentMethod, order]);

  function buildOrderData() {
    if (!order) return null;
    return {
      orderId: order.id,
      items: (order.order_items || []).map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        variant_name: item.variant_name,
        name: item.name,
        brand: item.brand,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        id: item.product_id,
      })),
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax_amount),
      shipping_cost: parseFloat(order.shipping_amount),
      discount: parseFloat(order.discount_amount),
      total: parseFloat(order.total_amount),
      amount: Math.round(parseFloat(order.total_amount) * 100),
      currency: order.currency || 'PHP',
      shipping: order.shipping_address,
    };
  }

  function buildCustomerInfo() {
    const addr = order?.billing_address || order?.shipping_address || {};
    return {
      firstName: addr.first_name || '',
      lastName: addr.last_name || '',
      email: addr.email || '',
      phone: addr.phone || order?.shipping_address?.phone || '',
      billing: order?.billing_address || {},
      shipping: order?.shipping_address || {},
    };
  }

  const handlePaymentSuccess = async (result) => {
    router.refresh();
    router.push(`/checkout/success?order=${result?.orderNumber || order?.order_number}`);
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <>
        <Sidebar userRole="customer" />
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto max-w-3xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar userRole="customer" />
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto max-w-3xl p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/order-history')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const orderData = buildOrderData();
  const customerInfo = buildCustomerInfo();

  return (
    <>
      <Sidebar userRole="customer" />
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto max-w-3xl p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-sm text-gray-600 mt-1">
              Order #{order?.order_number}
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h2>
            <div className="space-y-2">
              {order?.order_items?.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      <img
                        src={item.product_variants?.image_url || item.products?.image_url || '/assets/images/no_image.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 truncate">{item.name}</p>
                      {item.variant_name && <p className="text-xs text-gray-500">{item.variant_name}</p>}
                    </div>
                  </div>
                  <span className="text-gray-600 flex-shrink-0 ml-2">
                    {item.quantity} × {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order?.subtotal)}</span>
              </div>
              {parseFloat(order?.tax_amount) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(order?.tax_amount)}</span>
                </div>
              )}
              {parseFloat(order?.shipping_amount) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{formatCurrency(order?.shipping_amount)}</span>
                </div>
              )}
              {parseFloat(order?.discount_amount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order?.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(order?.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h2>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={() => { setPaymentMethod('card'); setCardError(''); paymentInitializedRef.current = false; }}
                className={`min-w-0 flex-1 rounded-lg border-2 px-4 py-4 transition-all sm:px-6 ${
                  paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className={`text-sm font-semibold sm:text-base ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-700'}`}>
                    Credit/Debit Card
                  </span>
                </div>
              </button>

              <button
                onClick={() => { setPaymentMethod('gcash'); setCardError(''); }}
                className={`min-w-0 flex-1 rounded-lg border-2 px-4 py-4 transition-all sm:px-6 ${
                  paymentMethod === 'gcash' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                  <span className={`text-sm font-semibold sm:text-base ${paymentMethod === 'gcash' ? 'text-blue-600' : 'text-gray-700'}`}>
                    GCash
                  </span>
                </div>
              </button>

              <button
                onClick={() => { setPaymentMethod('qrph'); setCardError(''); }}
                className={`min-w-0 flex-1 rounded-lg border-2 px-4 py-4 transition-all sm:px-6 ${
                  paymentMethod === 'qrph' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  </svg>
                  <span className={`text-sm font-semibold sm:text-base ${paymentMethod === 'qrph' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    QRPH
                  </span>
                </div>
              </button>
            </div>

            {/* Card error */}
            {paymentMethod === 'card' && cardError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700">{cardError}</p>
                <p className="text-xs text-red-500 mt-1">Try switching to QRPH or GCash payment instead.</p>
              </div>
            )}

            {/* Payment Forms */}
            {paymentMethod === 'card' && clientSecret && orderData && (
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={orderData.amount}
                currency="PHP"
                orderData={orderData}
                customerInfo={customerInfo}
                onSuccess={handlePaymentSuccess}
                onError={(err) => console.error('Payment error:', err)}
              />
            )}

            {paymentMethod === 'gcash' && orderData && (
              <GCashPaymentForm
                amount={orderData.amount}
                currency="PHP"
                orderData={orderData}
                customerInfo={customerInfo}
                defaultPhone={customerInfo.phone}
                onSuccess={handlePaymentSuccess}
                onError={(err) => console.error('GCash payment error:', err)}
              />
            )}

            {paymentMethod === 'qrph' && orderData && (
              <QRPHPaymentForm
                amount={orderData.amount}
                currency="PHP"
                orderData={orderData}
                customerInfo={customerInfo}
                onSuccess={handlePaymentSuccess}
                onError={(err) => console.error('QRPH payment error:', err)}
              />
            )}
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/order-history')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Back to Order History
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ContinuePaymentPage() {
  return (
    <Suspense fallback={
      <>
        <Sidebar userRole="customer" />
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto max-w-3xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </>
    }>
      <ContinuePaymentContent />
    </Suspense>
  );
}
